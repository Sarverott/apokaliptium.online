// Crawl pages with a headless browser and print what each one shows:
// title, failed requests and console errors. Follows same-site links.
// Usage: node scripts/inspect.mjs [url] [maxPages]
// Default url is the Astro dev server (`task dev`). Nothing is stored on disk.

import { Configuration, log, PlaywrightCrawler } from "crawlee";

log.setLevel(log.LEVELS.WARNING);

const start = process.argv[2] ?? "http://localhost:4321/";
const maxRequestsPerCrawl = Number(process.argv[3] ?? 10);
const report = [];

const crawler = new PlaywrightCrawler(
	{
		maxRequestsPerCrawl,
		headless: true,
		preNavigationHooks: [
			({ page, request }) => {
				request.userData.failed = [];
				request.userData.console = [];
				page.on("requestfailed", (r) => request.userData.failed.push(r.url()));
				page.on("response", (r) => {
					if (r.status() >= 400)
						request.userData.failed.push(`${r.status()} ${r.url()}`);
				});
				page.on("console", (m) => {
					if (m.type() === "error") request.userData.console.push(m.text());
				});
				page.on("pageerror", (e) => request.userData.console.push(e.message));
			},
		],
		async requestHandler({ page, request, enqueueLinks }) {
			await page.waitForLoadState("networkidle");
			report.push({
				url: request.loadedUrl,
				title: await page.title(),
				failed: request.userData.failed,
				errors: request.userData.console,
			});
			await enqueueLinks({ strategy: "same-hostname" });
		},
	},
	new Configuration({ persistStorage: false }),
);

await crawler.run([start]);
console.log(JSON.stringify(report, null, "\t"));
