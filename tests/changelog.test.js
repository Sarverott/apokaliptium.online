import { execFile } from "node:child_process";
import {
	mkdtemp,
	readdir,
	readFile,
	rm,
	stat,
	utimes,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, test } from "vitest";

const execute = promisify(execFile);
const script = fileURLToPath(
	new URL("../scripts/changelog.mjs", import.meta.url),
);
const repositories = [];
const identity = {
	...process.env,
	GIT_CONFIG_GLOBAL: "/dev/null",
	GIT_CONFIG_NOSYSTEM: "1",
	GIT_AUTHOR_NAME: "Catalogue Author",
	GIT_AUTHOR_EMAIL: "author@example.invalid",
	GIT_COMMITTER_NAME: "Catalogue Committer",
	GIT_COMMITTER_EMAIL: "committer@example.invalid",
	GIT_AUTHOR_DATE: "2026-09-01T01:02:03Z",
	GIT_COMMITTER_DATE: "2026-10-01T01:02:03Z",
};

async function git(repository, arguments_, environment = {}) {
	const { stdout } = await execute(
		"git",
		["-C", repository, "-c", "core.hooksPath=/dev/null", ...arguments_],
		{
			env: { ...identity, ...environment },
			encoding: "utf8",
		},
	);
	return stdout.trim();
}

async function repository() {
	const directory = await mkdtemp(join(tmpdir(), "apokaliptium-changelog-"));
	repositories.push(directory);
	await git(directory, ["init", "--initial-branch=master"]);
	return directory;
}

async function commit(
	directory,
	message,
	path = "file.txt",
	content = message,
) {
	await writeFile(join(directory, path), content);
	await git(directory, ["add", "--", path]);
	await git(directory, [
		"commit",
		"--quiet",
		"--allow-empty",
		"--allow-empty-message",
		"--cleanup=verbatim",
		"-m",
		message,
	]);
	return git(directory, ["rev-parse", "HEAD"]);
}

function generate(directory, ...arguments_) {
	return execute(
		process.execPath,
		[script, "--repo", directory, ...arguments_],
		{ encoding: "utf8" },
	);
}

async function snapshot(directory) {
	const output = join(directory, "docs/changelog");
	const files = {};
	for (const name of (await readdir(output)).sort()) {
		files[name] = {
			text: await readFile(join(output, name), "utf8"),
			modified: (await stat(join(output, name))).mtimeMs,
		};
	}
	return files;
}

afterEach(async () => {
	await Promise.all(
		repositories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("changelog catalogue", () => {
	test("preserves full messages and unusual paths, using committer milliseconds", async () => {
		const directory = await repository();
		const message =
			"Keep | [brackets] / and `quotes` $(not-a-command)\n\nLiteral fences:\n```md\nbody\n```\nseparator: \u001e\u001f\n";
		const path = "report | `literal`\nname.txt";
		const hash = await commit(directory, message, path);
		await generate(directory);
		const files = await snapshot(directory);
		const name = Object.keys(files).find(
			(name) => name.endsWith(".md") && name !== "index.md",
		);
		expect(name).toContain(
			`master_${Date.parse(identity.GIT_COMMITTER_DATE)}_`,
		);
		expect(files[name].text).toContain(message);
		expect(files[name].text).toContain("````text\n");
		expect(files[name].text).toContain(JSON.stringify(path));
		expect(files[name].text).toContain(`commit: "${hash}"`);
		const authoredAt = JSON.parse(
			files[name].text.match(/^authored_at: (.+)$/m)[1],
		);
		expect(Date.parse(authoredAt)).toBe(Date.parse(identity.GIT_AUTHOR_DATE));
		expect(files["index.md"].text).toContain("Keep \\| \\[brackets\\]");
	});

	test("keeps empty subjects and colliding titles within the filename limit", async () => {
		const directory = await repository();
		await commit(directory, "", "empty.txt", "empty subject");
		const title = `Same / Łódź ${"long ".repeat(40)}`;
		const first = await commit(directory, title, "first.txt");
		const second = await commit(directory, title, "second.txt");
		await generate(directory);
		const files = await snapshot(directory);
		const entries = Object.keys(files).filter(
			(name) => name.endsWith(".md") && name !== "index.md",
		);
		expect(entries).toHaveLength(3);
		expect(entries.some((name) => name.includes("empty-subject"))).toBe(true);
		expect(entries.some((name) => name.includes(first.slice(0, 12)))).toBe(
			true,
		);
		expect(entries.some((name) => name.includes(second.slice(0, 12)))).toBe(
			true,
		);
		for (const name of entries) {
			expect(name.match(/^master_\d+_(.*)\.md$/)[1].length).toBeLessThanOrEqual(
				100,
			);
			expect(Buffer.byteLength(name)).toBeLessThan(255);
			expect(name).not.toContain("/");
		}
	});

	test("does not rewrite files or timestamps on repeated generation or --check", async () => {
		const directory = await repository();
		await commit(directory, "Initial");
		await generate(directory);
		for (const name of await readdir(join(directory, "docs/changelog"))) {
			await utimes(
				join(directory, "docs/changelog", name),
				946684800,
				946684800,
			);
		}
		const before = await snapshot(directory);
		expect((await generate(directory)).stdout).toContain("0 files written");
		expect((await generate(directory, "--check")).stdout).toContain(
			"catalogue is current",
		);
		expect(await snapshot(directory)).toEqual(before);
	});

	test("includes merged history and an explicit merge entry without changing branches", async () => {
		const directory = await repository();
		await commit(directory, "Initial", "initial.txt");
		await git(directory, ["checkout", "-b", "feature/reports"]);
		const feature = await commit(directory, "Feature", "feature.txt");
		await git(directory, ["checkout", "master"]);
		await commit(directory, "Main", "main.txt");
		await git(
			directory,
			["merge", "--no-ff", "feature/reports", "-m", "Merge reports"],
			{ GIT_COMMITTER_DATE: "2026-10-02T01:02:03Z" },
		);
		const merge = await git(directory, ["rev-parse", "HEAD"]);
		await generate(directory);
		const files = await snapshot(directory);
		expect(files["index.md"].text).toContain("Commits: 4 (including merges)");
		expect(files["index.md"].text.indexOf(merge.slice(0, 12))).toBeLessThan(
			files["index.md"].text.indexOf(feature.slice(0, 12)),
		);
		const mergeEntry = Object.values(files).find(({ text }) =>
			text.includes(`commit: "${merge}"`),
		);
		expect(mergeEntry.text).toContain("Compared with the first parent.");
		expect(mergeEntry.text).toContain('A\t"feature.txt"');
		await generate(
			directory,
			"--branch",
			"feature/reports",
			"--out",
			"feature-catalogue",
		);
		const featureIndex = await readFile(
			join(directory, "feature-catalogue/index.md"),
			"utf8",
		);
		expect(featureIndex).toContain("Commits: 2 (including merges)");
		expect(featureIndex).toContain("feature-reports_");
		expect(await git(directory, ["branch", "--show-current"])).toBe("master");
	});

	test("preserves handwritten files and refuses to overwrite edited generated entries", async () => {
		const directory = await repository();
		await commit(directory, "Initial");
		await generate(directory);
		const output = join(directory, "docs/changelog");
		await writeFile(join(output, "personal.md"), "Handwritten note\n");
		await commit(directory, "Next", "next.txt");
		await generate(directory);
		expect(await readFile(join(output, "personal.md"), "utf8")).toBe(
			"Handwritten note\n",
		);
		const entry = (await readdir(output)).find(
			(name) =>
				name.endsWith(".md") && name !== "index.md" && name !== "personal.md",
		);
		await writeFile(join(output, entry), "Human edits\n");
		const before = await snapshot(directory);
		await expect(generate(directory)).rejects.toMatchObject({
			stderr: expect.stringContaining("Refusing to overwrite"),
		});
		expect(await snapshot(directory)).toEqual(before);
	});

	test("--check detects added commits without touching the catalogue", async () => {
		const directory = await repository();
		await commit(directory, "Initial");
		await generate(directory);
		const before = await snapshot(directory);
		await commit(directory, "Next", "next.txt");
		await expect(generate(directory, "--check")).rejects.toMatchObject({
			stderr: expect.stringContaining("out of date"),
		});
		expect(await snapshot(directory)).toEqual(before);
	});

	test("removes only obsolete generated pages when selecting another branch", async () => {
		const directory = await repository();
		const first = await commit(directory, "Initial");
		await git(directory, ["branch", "older", first]);
		await commit(directory, "Next", "next.txt");
		await generate(directory);
		await writeFile(join(directory, "docs/changelog/personal.md"), "Keep me\n");
		await generate(directory, "--branch", "older");
		const files = await snapshot(directory);
		expect(
			Object.keys(files).filter((name) => name.startsWith("master_")),
		).toEqual([]);
		expect(
			Object.keys(files).filter((name) => name.startsWith("older_")),
		).toHaveLength(1);
		expect(files["personal.md"].text).toBe("Keep me\n");
	});

	test("refuses an unmanaged index and paths escaping the ownership manifest", async () => {
		const directory = await repository();
		await commit(directory, "Initial");
		await generate(directory);
		const output = join(directory, "docs/changelog");
		const manifest = JSON.parse(
			await readFile(join(output, ".catalogue.json"), "utf8"),
		);
		manifest.files["../outside.md"] = "unused";
		await writeFile(join(output, ".catalogue.json"), JSON.stringify(manifest));
		const before = await snapshot(directory);
		await expect(generate(directory)).rejects.toMatchObject({
			stderr: expect.stringContaining("Unsafe path"),
		});
		expect(await snapshot(directory)).toEqual(before);
		await rm(join(output, ".catalogue.json"));
		await writeFile(join(output, "index.md"), "Handwritten index\n");
		await expect(generate(directory)).rejects.toMatchObject({
			stderr: expect.stringContaining("unmanaged file: index.md"),
		});
	});

	test("handles detached HEAD and rejects unknown branches before writing", async () => {
		const directory = await repository();
		const hash = await commit(directory, "Initial");
		await git(directory, ["checkout", "--detach", hash]);
		await generate(directory);
		expect((await snapshot(directory))["index.md"].text).toContain(
			`detached-${hash.slice(0, 12)}`,
		);
		await expect(
			generate(directory, "--branch", "missing", "--out", "missing-output"),
		).rejects.toBeDefined();
		await expect(stat(join(directory, "missing-output"))).rejects.toMatchObject(
			{ code: "ENOENT" },
		);
	});
});
