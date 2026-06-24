# Migrations

Version-to-version migration steps for `trellis update` (ADR 0003). Each file is
named for the version it brings a project *to* — e.g. `0.2.0.mjs` — and exports:

```js
export async function up(ctx) {
  // ctx.projectRoot — absolute path to the project being updated
  // ctx.log(msg)    — progress line
  // ctx.prompt(msg) — MUST be awaited before any destructive step (returns truthy on yes)
  // Reuse the toolkit (@trellis/core/cli) for structural edits where possible.
}
```

The runner (`src/update.mjs`) discovers these, selects those in
`(fromVersion, toVersion]`, and applies them in semver order — after the dependency
bump and the framework-file re-sync. Ships empty at v0; add a file here whenever a
release changes a project's structure.
