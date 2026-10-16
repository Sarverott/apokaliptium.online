# apokaliptium.online — agent guide

Apokaliptium's public presentation, maintained by Sett Sarverott. Workshop rules
in `~/__WORKSHOP/AGENTS.md` apply. Sett calls the Codex collaborator Joker;
accept the name without pretending to remember earlier sessions.

## Current priority

Cleanup and continuity first. Sett explicitly postponed Astro on 2026-10-16.
Sett consolidated static source and recycled React components under `src/`
in `b11c338`, and removed the old draft and local media directories.
The component migration and style-splitting notes remain future work.
TypeScript, Astro, React, Vue, animejs, threejs, xterm and the other planned
frontend dependencies are not installed. Do not assume a runnable framework
app or install that stack while the task is media verification.

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

- `src/index.html`, `src/style.css`, `src/app.js`: static reference source.
- `src/App.tsx`, `src/main.tsx`, `src/components/`, `src/data/`, `src/types.ts`:
  recycled React draft; dependencies and framework setup remain pending.
- `public/assets/.map.json`: Sett's placeholder for external media mapping.
- `scripts/`: media transfer and anonymous reading tools, documented there.
- `pyproject.toml`: script dependencies; this is not a Python application.
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

`task check` checks syntax and parses configuration. `task serve` serves the
repository root; it is not a configured frontend development server. Source
still references removed local media paths; frontend integration is pending.
Use a browser when changing behaviour. `task recon`
runs gitrecon without saving to its datasets; override `GITRECON_BIN` when it
is not on PATH. Report actual checks and unfinished steps, never implied success.

## Documentation boundary

Sett instructed deletion of `docs/README.md` after reading. Do not recreate it
until Sett commits that deletion. Root `README.md` remains the public guide.
`docs/.agents/` is agent-authored writing for oneself or another agent; humans
have read-only access by agreement. Do not chmod or publish that area.
Deploy only site files and media, never the whole working directory.
