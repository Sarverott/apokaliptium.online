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

const config = { logLevel: "silent", server: { port: 0 } };

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

	// TODO: media lives in the HF bucket Sarverott/mediacontainer; the source
	// still points at removed local assets/ paths. Assert loaded images once
	// frontend integration with the bucket URLs is decided.
	test.todo("images load from the media bucket");
});
