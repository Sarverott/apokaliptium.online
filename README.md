# website of project Apokaliptium - www.Apokaliptium.online



## Working here

- `task` lists procedures; `task serve` starts a local server on port 8000.
- `task check` checks syntax and configuration; it is not a browser test suite.
- `task dev` runs the Astro dev server; `task test` runs Vitest with Playwright
  browser checks; `task lint` runs Biome.
- `task media:verify` downloads the uploaded WebP files anonymously and checks
  their sizes and hashes without frontend packages or credentials.
- [Media procedures](scripts/README.md) cover upload and public verification.
- [AGENTS.md](AGENTS.md) explains the working agreement and repository layout.

The site is an Astro page with Vue components under `src/`. Sett uploaded
media and removed the local copies. Anonymous downloads match the originals
in Git; frontend integration with those URLs is pending.
Deploy only the site files and media; never publish the whole repository.
