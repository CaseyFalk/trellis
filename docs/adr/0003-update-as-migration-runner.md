# `trellis update` is a versioned migration runner

Structural improvements to Trellis (a new register, a renamed default section, a
changed shim) must be able to reshape *existing* projects, not just new ones —
and a file overwrite can't do that, because it needs to create directories, add
sidebar sections, write intros, or move content. So `trellis update` is defined
as a three-layer operation run in order:

1. **Bump** `@trellis/core` to the latest (delivers all mechanism changes).
2. **Re-sync** framework-managed files (the conventions doc, the thin config shim).
3. **Migrate** — run the version-to-version migration steps the new release
   carries, prompting before any destructive step.

Each project stamps the Trellis version it is on (via `@trellis/core` in
`package.json`), so the runner knows which migrations to apply. This mirrors how
mature frameworks ship breaking structural changes non-destructively (Rails
migrations, `ng update` schematics, Next.js codemods).

We rejected bump+re-sync only (structural changes would reach only new projects).
The accepted cost: every structural change to Trellis now obligates a migration
to be written, and the recorded project version must stay accurate.
