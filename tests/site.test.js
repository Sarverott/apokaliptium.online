import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { build, createServer, preview } from "vite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Browser checks of the page in src/: once on the Vite dev server, once on
// the production build served by `vite preview`. The build goes to a
// temporary directory so dist/ stays untouched.

const config = { configFile: "vite.config.js", logLevel: "silent" };

const servers = {
	dev: async () => {
		const server = await createServer({ ...config, server: { port: 0 } });
		await server.listen();
		return { url: server.resolvedUrls.local[0], close: () => server.close() };
	},
	build: async () => {
		const outDir = await mkdtemp(join(tmpdir(), "apokaliptium-build-"));
		await build({ ...config, build: { outDir, emptyOutDir: true } });
		const server = await preview({
			...config,
			build: { outDir },
			preview: { port: 0 },
		});
		return {
			url: server.resolvedUrls.local[0],
			outDir,
			close: async () => {
				await new Promise((done) => server.httpServer.close(done));
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
	});

	afterAll(async () => {
		await browser?.close();
		await site?.close();
	});

	test("runs app.js without errors", () => {
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
