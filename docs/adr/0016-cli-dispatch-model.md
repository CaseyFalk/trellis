# The thin CLI's dispatch model

Realizing ADR 0011, the global `trellis` CLI keeps almost no logic; it routes each
command to the right `@trellis/core`:

- **`new`** uses the **CLI's bundled core** (no project exists yet) — copies
  `template/` + `procedures/` from the CLI's own `@trellis/core`, sets the focus,
  ensures the shared learning profile, installs, git-inits, validates. So
  `brew upgrade trellis` changes what new projects get.
- **`update`** **orchestrates the stable part** (read `trellisVersion`, require a
  clean git tree, bump the dep, `npm install`) then **delegates re-sync + migrations
  to the freshly-installed project core** (`@trellis/core/update`) — the target
  version owns that logic, so "update to vN" runs vN's behavior. Commits after (git
  is the undo net).
- **`page`/`section`/`tag`/`journal`/`config`/`check`** **pass through to the
  project-local core** (`node_modules/@trellis/core/src/cli`), so tools always match
  the project's pinned version, not the brew-installed one.

`new`/`update` print human-readable output (user-invoked); the passthrough toolkit
stays JSON (agent-invoked, ADR 0015).

Implementation details worth recording: the `@trellis/core` spec is the template
default (the user's repo) overridable by `TRELLIS_CORE_SPEC` (forks/pinning/local
dev) with `--no-install` for offline; a `file:` spec installs with `--install-links`
so the local core is copied (a symlinked file: dep resolves peer deps to the wrong
tree and breaks the build); the template ships a `.gitignore` and `new` commits
*after* install so the lockfile is captured and the tree is clean for `update`.
