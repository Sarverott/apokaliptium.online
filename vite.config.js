import { defineConfig } from "vite";

// Serves and builds the static reference source in src/.
// Astro does not read this file; once pages move to Astro, Vite settings
// belong under `vite:` in astro.config.mjs.
export default defineConfig({
	root: "src",
	// mpa: missing files answer 404 instead of falling back to index.html
	appType: "mpa",
	publicDir: "../public",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
	},
	server: { host: "127.0.0.1" },
});
