# Distribution: thin Homebrew CLI + versioned npm-consumable core

Trellis ships as two artifacts with different distribution needs:

- **`@trellis/core`** — npm-consumable (git dependency to start; registry later).
  Holds the `trellisStarlight()` plugin, the bundled `template/`, `conventions.md`/
  `capture.md`/`tailor.md`, `migrations/`, and the check/update logic. Astro
  consumes it from `node_modules` at build time, so it *must* be npm-shaped. All
  version-specific substance lives here.
- **`trellis` CLI** — a thin orchestrator distributed via a Homebrew formula
  (`depends_on node`), also installable via `npm i -g`. `trellis new` bootstraps a
  project, installs `@trellis/core`, then copies template/conventions from the
  freshly installed package; `check`/`update` dispatch into the project-local core.
  Carries almost no logic, so brew bumps are rare.

User flow stays simple: setup is `brew install trellis` → `trellis new`; updating
is `brew upgrade trellis` → `trellis update` in each project (the brew step is
often a no-op since most updates ride in `@trellis/core` and reach projects via
`trellis update`).

This revises ADR 0004's "one package, two install modes" into a two-artifact
split. We rejected a single npm package (no clean Homebrew path for the global
tool). Cost: two artifacts to release, and a discipline of keeping the CLI thin so
brew updates stay rare.
