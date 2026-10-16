// @ts-check

import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";

// NOTE: pages live in src/pages, components in src/components (Vue and
// Astro). @astrojs/react is installed but not enabled; add `react()` here
// when a React component is needed.
// https://astro.build/config
export default defineConfig({
	site: "https://www.apokaliptium.online",
	integrations: [vue()],
});
