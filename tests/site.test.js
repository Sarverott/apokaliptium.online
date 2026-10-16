import { chromium } from "playwright";
import { createServer } from "vite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Browser checks of the static reference source in src/, served by Vite.

let server;
let browser;
let page;
const pageErrors = [];

beforeAll(async () => {
	server = await createServer({
		configFile: "vite.config.js",
		server: { port: 0 },
		logLevel: "silent",
	});
	await server.listen();
	browser = await chromium.launch();
	page = await browser.newPage();
	page.on("pageerror", (error) => pageErrors.push(error.message));
	await page.goto(server.resolvedUrls.local[0]);
});

afterAll(async () => {
	await browser?.close();
	await server?.close();
});

describe("static reference page", () => {
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

	// TODO: media lives in the HF bucket Sarverott/mediacontainer; the source
	// still points at removed local assets/ paths. Assert loaded images once
	// frontend integration with the bucket URLs is decided.
	test.todo("images load from the media bucket");
});
