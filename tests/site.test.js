import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { join } from "node:path";
import { build, preview } from "astro";
import { chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Browser checks of the site: once on the Astro dev server, once on the
// production build served by `astro preview`. The build goes to a temporary
// directory under test-results/ (gitignored), so dist/ stays untouched; it
// must sit on the same filesystem, because Astro moves files by renaming.
//
// Servers bind to 127.0.0.1 explicitly: `astro preview` defaults to
// `localhost`, which on GitHub runners can resolve to ::1 while the browser
// connects to 127.0.0.1 (ERR_CONNECTION_REFUSED in the publish workflow).
//
// NOTE: skipped on GitHub Actions by Sett's decision, so a failing browser
// check cannot halt publishing. Remove the skipIf to run them there again.
const onGitHub = process.env.GITHUB_ACTIONS === "true";

const config = { logLevel: "silent", server: { port: 0, host: "127.0.0.1" } };

const content = JSON.parse(
	await readFile(new URL("../src/data/content.json", import.meta.url), "utf8"),
);

function freePort() {
	return new Promise((resolve) => {
		const probe = createServer().listen(0, "127.0.0.1", () => {
			const { port } = probe.address();
			probe.close(() => resolve(port));
		});
	});
}

function devServerScript(port) {
	return `
		import { dev } from "astro";
		const server = await dev({
			logLevel: "silent",
			server: { port: ${port}, host: "127.0.0.1" },
		});
		process.on("SIGTERM", async () => {
			await server.stop();
			process.exit(0);
		});
	`;
}

async function waitFor(url) {
	for (let attempt = 0; attempt < 100; attempt++) {
		try {
			if ((await fetch(url)).ok) return;
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	throw new Error(`${url} did not answer`);
}

const servers = {
	dev: async () => {
		// The dev server runs in a child process: under Vitest (VITEST=true)
		// Astro renders pages without client islands. The programmatic API is
		// used because the `astro dev` CLI detaches into a background daemon
		// when it has no terminal, and outlives the test.
		const port = await freePort();
		const { VITEST, ...env } = process.env;
		const child = spawn(
			process.execPath,
			["--input-type=module", "-e", devServerScript(port)],
			{ env, stdio: "ignore" },
		);
		const url = `http://127.0.0.1:${port}/`;
		await waitFor(url);
		return {
			url,
			close: () =>
				new Promise((resolve) => {
					child.once("exit", resolve);
					child.kill();
				}),
		};
	},
	build: async () => {
		await mkdir("test-results", { recursive: true });
		const outDir = await mkdtemp(join("test-results", "build-"));
		await build({ ...config, outDir });
		const server = await preview({ ...config, outDir });
		return {
			url: `http://127.0.0.1:${server.port}/`,
			outDir,
			close: async () => {
				await server.stop();
				await rm(outDir, { recursive: true, force: true });
			},
		};
	},
};

describe.skipIf(onGitHub)("browser checks", () => {
	describe.each(Object.keys(servers))("page on %s server", (mode) => {
		let site;
		let browser;
		let page;
		const pageErrors = [];

		beforeAll(async () => {
			site = await servers[mode]();
			browser = await chromium.launch();
			page = await browser.newPage();
			page.on("pageerror", (error) => pageErrors.push(error.message));
			await page.goto(site.url);
			// Vue islands are interactive only after hydration, when Astro removes
			// their `ssr` attribute. A cold dev server may also reload once while
			// optimizing dependencies; waiting covers that too.
			await page.waitForFunction(
				() =>
					document.querySelector("astro-island") &&
					!document.querySelector("astro-island[ssr]"),
			);
		});

		afterAll(async () => {
			await browser?.close();
			await site?.close();
		});

		test("runs its scripts without errors", () => {
			expect(pageErrors).toEqual([]);
		});

		test("has seven scenes and the generated parts", async () => {
			expect(await page.locator(".scene").count()).toBe(7);
			expect(await page.locator(".timeline-frame").count()).toBe(6);
			expect(await page.locator(".wave i").count()).toBe(48);
			expect(await page.textContent("#counter")).toBe("01 / 07");
		});

		test("menu opens, and Escape closes it", async () => {
			const nav = page.locator("#chapters");
			await page.click("#menu");
			expect(await nav.isVisible()).toBe(true);
			expect(await page.getAttribute("#menu", "aria-expanded")).toBe("true");
			await page.keyboard.press("Escape");
			expect(await nav.isHidden()).toBe(true);
			expect(await page.getAttribute("#menu", "aria-expanded")).toBe("false");
		});

		test("motion button toggles the paused state", async () => {
			await page.click("#motion");
			expect(await page.getAttribute("#motion", "aria-pressed")).toBe("true");
			expect(
				await page.evaluate(() => document.body.classList.contains("paused")),
			).toBe(true);
			await page.click("#motion");
			expect(await page.getAttribute("#motion", "aria-pressed")).toBe("false");
		});

		test("counter reaches the last frame at the bottom", async () => {
			await page.evaluate(() =>
				scrollTo(0, document.documentElement.scrollHeight),
			);
			await page.waitForFunction(
				() => document.querySelector("#counter").textContent === "07 / 07",
			);
		});

		test.runIf(mode === "build")("ships the root files", async () => {
			for (const file of [
				"robots.txt",
				"sitemap.xml",
				"llms.txt",
				"manifest.json",
			]) {
				expect(
					(await readFile(join(site.outDir, file), "utf8")).length,
				).toBeGreaterThan(0);
			}
		});

		// Offline check: every picture points at the media bucket. Whether the
		// bucket serves them is checked by `task media:verify`.
		test("images point at the media bucket", async () => {
			const sources = await page.evaluate(() => [
				...[...document.images].map((image) => image.src),
				getComputedStyle(document.querySelector(".timeline-image"))
					.backgroundImage,
			]);
			expect(sources).toHaveLength(7);
			for (const source of sources) {
				expect(source).toContain(content.media.base);
			}
		});
	});
});
