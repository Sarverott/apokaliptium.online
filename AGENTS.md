# apokaliptium.online — agent guide

Apokaliptium's public presentation, maintained by Sett Sarverott. Workshop rules
in `~/__WORKSHOP/AGENTS.md` apply. Sett calls the Codex collaborator Joker;
accept the name without pretending to remember earlier sessions.

## Current priority

Cleanup and continuity first. Sett explicitly postponed Astro on 2026-10-16.
Keep the working HTML/CSS/JavaScript site and React reference draft intact.
The component migration and style-splitting notes remain future work.

## Session rhythm

1. Read `git status`, recent commits, changed files and their NOTE comments.
2. Read `docs/devlog/scrapnote.md` and the letters in `docs/.agents/`.
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

- `index.html`, `style.css`, `app.js`: the current static site.
- `assets/`: seven original WebP images and Sett's media instruction.
- `draft-result-aistudio/`: inspected React/Vite reference, pending migration.
- `scripts/`: media transfer and anonymous reading tools, documented there.
- `pyproject.toml`: script dependencies; this is not a Python application.
- `docs/devlog/`: work records; `docs/.agents/`: letters written by agents.

## Media and checks

The destination is the public HF bucket `Sarverott/mediacontainer`. Never put
upload credentials in browser code. Plan with `task media:plan`; upload with
`task media:upload`. Verify anonymous downloads against the manifest's SHA-256.
Keep `assets/` until every upload is verified and site references are updated.
The scripts deliberately never delete local or remote files.

`task check` checks syntax and parses configuration. `task serve` serves the
existing site locally. Use a browser when changing behaviour. `task recon`
runs gitrecon without saving to its datasets; override `GITRECON_BIN` when it
is not on PATH. Report actual checks and unfinished steps, never implied success.

## Documentation boundary

Sett instructed deletion of `docs/README.md` after reading. Do not recreate it
until Sett commits that deletion. Root `README.md` remains the public guide.
`docs/.agents/` is agent-authored writing for oneself or another agent; humans
have read-only access by agreement. Do not chmod or publish that area.
Deploy only site files and media, never the whole working directory.
