// @ts-check

import { defineConfig } from "astro/config";

// NOTE: Astro is postponed (2026-10-16). No pages exist in src/pages yet and
// the React and Vue integrations (@astrojs/react, @astrojs/vue) are not
// installed. Add them to `integrations` when the migration starts.
// https://astro.build/config
export default defineConfig({
	site: "https://www.apokaliptium.online",
	integrations: [],
});
