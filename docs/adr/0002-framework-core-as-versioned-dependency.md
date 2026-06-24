# Trellis core is a versioned dependency, not vendored source

Trellis projects must be upgradable: a fix or feature added to Trellis should be
applIcable to already-generated projects, non-destructively. We therefore ship
the framework's machinery — the Head/Footer component overrides, the link-graph
lib, the remark-mermaid plugin, the concept-graph page, the content schema, and
the `check` script — as a **versioned npm package shaped as a Starlight plugin
plus a thin CLI** (working name `@trellis/core`). A generated project *depends*
on it; its `astro.config` shrinks to "add `trellis()` to plugins" plus
per-project title/sidebar. Upgrading is `npm update`, which is inherently
non-destructive because the package is not where the user's content lives.

This idiomatically extends what the project already does — depend on
`@astrojs/starlight` for the same kind of machinery — and preserves "markdown is
the single source of truth": only the rendering/tooling moves into the
dependency; content stays as owned files. The few files that are tailored and
cannot be packaged (the thin `astro.config`, `AGENTS.md`, the capture procedure)
are classified framework-managed vs user-owned in a manifest and re-synced by
`trellis update`.

We rejected the pure copy/eject model (no upgrades) and the copy-and-re-sync-only
model (every file vendored, upgrades via 3-way merge — more merge conflicts, no
clean "fix once, all projects benefit"). The accepted cost: we must design and
version a stable boundary (the plugin's options API) and publish the package.
