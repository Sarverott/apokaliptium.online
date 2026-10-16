# apokaliptium.online — agent guide

Apokaliptium's public presentation, maintained by Sett Sarverott. Workshop rules
in `~/__WORKSHOP/AGENTS.md` apply. Sett calls the Codex collaborator Joker;
accept the name without pretending to remember earlier sessions.

## Current priority

The site is an Astro page built from Vue and Astro components. Sett started
the migration after `d55751f` (Vue integration, `tsconfig.json`, the first two
Vue components); Cleo split the remaining page, `app.js` and `style.css`
into components and removed the React draft. `@astrojs/react` is installed
but not enabled. TypeScript itself is not installed. Images load from the
media bucket through `media()` in `src/lib/media.js` (base URL in
`content.json`).

## Session rhythm

1. Read `git status`, recent commits, changed files and their NOTE comments.
2. Read the latest `docs/devlog/scrapnote-*.md` and letters in `docs/.agents/`.
3. Implement concrete instructions; preserve unresolved decisions as TODOs.
4. Verify the result and leave the working tree for Sett to review and commit.

## Working agreement

- Address the owner as Sett or Sett Sarverott. Read informal English for intent.
- Be candid about facts, assumptions and what was actually checked.
- Sett owns direction, visual judgement, commits and history. Do not commit,
  push, deploy or rewrite history without an explicit request.
- BOS uses `development → revision → testing → releasing → master`. This
  session inherited `master`; leave changes uncommitted and report that state.
  Do not create or switch branches without authorization.
- Re-read user-edited files before changing them. Preserve deliberate artistic
  code and unrelated work. Avoid broad formatting of unfinished drafts.
- Preserve NOTE instructions in moved source or the devlog when retiring their
  original location. Absorb useful draft work before deleting it.
- Follow the agreed scope before adding unrelated features or dependencies.

## Layout

- `src/pages/index.astro`: the page; reads `src/data/content.json`
  (chapters, cast, timeline) and assembles the components.
- `src/layouts/BaseLayout.astro`: document shell and the global styles
  (tokens, resets, headings, `.eyebrow`, `.text-link`, `.keywords`).
- `src/components/Scene.astro`: shell of one frame, its variants and the
  reveal-on-scroll script; `src/components/scenes/`: the seven frames.
- `src/components/*.vue`: header, menu and rail (hydrated with `client:load`,
  sharing state through `src/lib/ui.js`); wave and timeline (static HTML).
- `public/`: copied to the site root: `robots.txt`, `sitemap.xml`,
  `llms.txt`, `manifest.json`; `public/assets/.map.json` is Sett's placeholder
  for external media mapping.
- `scripts/`: media transfer and anonymous reading tools, documented there.
- `pyproject.toml`: script dependencies; this is not a Python application.
- `vitest.config.js`, `astro.config.mjs`, `tsconfig.json`, `biome.json`:
  tool configs; `tests/`: Vitest suites driving Playwright against the dev
  server and the production build. `.husky/`: hook scripts calling tasks in
  `.husky/Taskfile.yml`, included by the root Taskfile as `hooks:`.
- `docs/devlog/`: work records; `docs/.agents/`: letters written by agents.

## Media and checks

Sett uploaded media to the public HF bucket `Sarverott/mediacontainer` and
removed the local originals. The seven WebP files use original names at the
bucket root, not hashed directories. Anonymous downloads matched the manifest's
SHA-256 and historical originals in `bd576d9` on 2026-10-16.
Read with `node scripts/hf-read.mjs hero.webp`; verify with `task media:verify`.
These use Node/Python standard libraries and need no frontend dependencies.
Upload/plan tasks require local originals, no longer present in this checkout.
Do not re-upload, rename objects or put credentials in browser code unasked.

`task dev` runs the Astro dev server on port 4321. `task test` runs Vitest with Playwright
browser checks. `task lint` runs Biome without changing files. `task inspect`
crawls a page with Crawlee (default the dev server); sandboxed DNS may need
network access. `task check` checks syntax and parses configuration.
`task serve` serves the repository root; use `task dev` for the site.
Browser tests skip on GitHub Actions (Sett's decision; see the NOTE in
`tests/site.test.js`). Use a browser when changing behaviour. `task recon`
runs gitrecon without saving to its datasets; override `GITRECON_BIN` when it
is not on PATH. Report actual checks and unfinished steps, never implied success.

## Documentation boundary

Sett re-created `docs/README.md` empty in `b7b7184`; Markdown and `.github/`
work is offered to Joker. Root `README.md` remains the public guide.
`docs/.agents/` is agent-authored writing for oneself or another agent; humans
have read-only access by agreement. Do not chmod or publish that area.
Deploy only site files and media, never the whole working directory. GitHub
Pages currently builds `master` at `/` with Jekyll, so the repository itself is
served; Sett wants the build published from a separate branch instead.
