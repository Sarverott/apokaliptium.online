# Project documentation

- [Changelog catalogue](changelog/index.md): committed history, including merges.
- [Script procedures](../scripts/README.md): media tools and changelog generation.
- [Agent guide](../AGENTS.md): repository layout and the working agreement.
- `devlog/scrapnote-*.md`: dated work records. Older notes describe their own
  snapshot; read recent records before treating a statement as current.

## Changelog conventions

Run `task changelog` to catalogue the current local branch into `docs/changelog/`.
`task changelog -- --check` checks freshness without writing files. No network,
frontend build, checkout, commit or new dependency is involved.

Each filename has the form `{branch}_{UNIXUSAT}_{title}.md`:

- `UNIXUSAT` is the committer's Unix time expressed in milliseconds, the same
  unit produced by `UNIXUSAT=$(node -p "Date.now()")`. Git stores whole seconds,
  so historical values end in `000`. Using commit time keeps regeneration stable.
- The branch is the catalogue's selected local branch. All reachable commits
  are included; this does not claim to reconstruct a commit's original branch.
- Filename labels use ASCII letters, digits, dots, underscores and hyphens.
  The branch label is capped at 64 characters. The title is cleaned before
  truncation and capped at 100 characters, including a 12-character commit ID.
  A collision expands that ID to the full hash within the same title limit.
- Empty subjects use `empty-subject` in filenames. The original full message,
  including whitespace and literal Markdown, stays in a fenced text block.
- Merges have their own entries and list every parent. Their changed paths
  compare with the first parent; the root commit compares with the empty tree.
  Renames are shown as a deletion and an addition.
- Entries contain full commit IDs, author and committer identities/dates, and
  changed paths. The index sorts newest committer time first, then by full ID.

Complete local history is required. Shallow repositories are refused before
writing or checking output; fetch full history (for example, `git fetch
--unshallow`) or use a full clone. The generator never fetches automatically.
Detached HEAD gets a `detached-<commit>` label. Selecting another branch does
not switch the working tree and replaces the selected output's generated
catalogue; use a different output directory to keep several catalogues.

```sh
task changelog -- --branch master
task changelog -- --branch development --out docs/development-log
node scripts/changelog.mjs --repo /path/to/repository
```

The generated `.catalogue.json` records ownership and content hashes. Keep it
with the Markdown files. Re-running preserves unchanged contents and timestamps,
removes only obsolete entries owned by that manifest, and keeps handwritten
files. Edited generated files cause a failure before any writes; move personal
notes to their own file rather than editing generated history.

## Committed snapshots and freshness

Generation records the selected branch's current commit. `--check` accepts a
snapshot after it is committed when every later commit changes only paths inside
the selected catalogue directory. The recorded head must remain an ancestor of
the selected branch, and every recorded page must still match independently
regenerated content. This avoids requiring a catalogue to describe its own
future recording commit while keeping the check read-only.

Commits touching anything outside the catalogue, mixed commits and empty
metadata-only commits make the snapshot stale. A normal generation still
records all reachable commits, including earlier catalogue-recording commits;
they are not permanently excluded from history. To keep checks green, generate
after source changes are committed, then commit only the generated catalogue.

Staged or uncommitted work is not catalogued. Selecting a different branch or
rewriting history requires a fresh snapshot. The catalogue is not added to the
public website build.
