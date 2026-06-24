# Development Guide

How to develop, test, and verify changes to Trellis. Read `CLAUDE.md` first for
orientation and the golden rules; read the ADRs for the *why*.

## Architecture map

Two artifacts (ADR 0011, 0013 — npm-workspaces monorepo):

### `packages/core` → `@trellis/core` (npm-consumable, **build-free**)
- `src/index.mjs` — `trellisStarlight(deps, config)`, the wrapper integration. The
  project's `astro.config` imports starlight/themes/validator and **injects** them
  (ADR 0014); it composes the sidebar (scanned, ADR 0007), theme, links-validator,
  component overrides, remark-mermaid, and the injected concept-graph route.
- `src/content.mjs` — the `docs` collection + frontmatter schema (re-exported by a
  project's `content.config.ts` shim).
- `src/components/{Head,Footer}.astro`, `src/lib/links.ts`,
  `src/plugins/remark-mermaid.mjs`, `src/pages/concept-graph.astro`,
  `src/styles/custom.css` — the rendering machinery (extracted from the POC).
  Feature toggles reach components via a `virtual:trellis-config` module.
- `src/cli/` — the **content-management toolkit** (ADR 0012, 0015): `index.mjs`
  dispatcher + `commands/` (page, section, tag, journal, config, check) +
  `lib/util.mjs`. JSON-only I/O; each tool keeps `trellis check` green. Bin:
  `trellis-core`; the global CLI passes through to this.
- `src/update.mjs` — re-sync manifest (`FRAMEWORK_MANAGED`) + migration runner;
  invoked by `trellis update` after the dependency bump.
- `template/` — what `trellis new` copies (thin in-project files; ADR 0006/0007).
- `procedures/` — `conventions.md` (the contract + tool reference), `capture.md`,
  `tailor.md`. The CLI copies these into a new project (`docs/` + root).
- `migrations/` — version-to-version `up(ctx)` modules (empty at v0).

### `packages/cli` → `trellis` (thin, Homebrew-distributed)
`src/index.mjs` dispatches: `new` (bundled-core scaffold), `run` (dev server),
`update` (orchestrate bump → delegate to project core), and passthrough of
`page/section/tag/journal/config/check` to the **project-local** core (ADR 0016).

## Dev setup

```sh
npm install        # workspace install; links @trellis/core into cli + sandbox
```
Run the CLI in dev without installing: `node packages/cli/src/index.mjs <cmd>`.

## Testing each layer

- **Plugin / rendering:** `npm run build --workspace @trellis/sandbox`, then for
  runtime use the Claude Preview MCP (or `astro dev`) and load `/concept-graph/`
  and a content page — confirm Mermaid→SVG, glossary tooltips, backlinks, Sources,
  maturity badge, the Cytoscape graph, and **zero console errors**.
- **Toolkit:** copy a project (or the sandbox's content) to `/tmp`, run
  `node packages/core/src/cli/index.mjs <cmd>` with cwd in it, assert the JSON
  result and that `trellis check` stays green after a battery (esp. `page move`
  rewriting inbound links, `tag rename`, `page merge`, cohesive `journal add`).
- **Procedures (integration):** follow `tailor.md` then `capture.md` *as the agent
  would* — run the tool sequences they prescribe on a fresh `template/` copy and
  confirm `check` is clean and the project builds.
- **Full CLI flow:** scaffold with a local core so no network is needed:
  `TRELLIS_CORE_SPEC=file:$PWD/packages/core node packages/cli/src/index.mjs new /tmp/x "focus"`
  → it installs (`--install-links` auto-added for `file:` dirs), builds, git-inits.

## Verification discipline (non-negotiable)

**Verify the build AND the runtime, not just `check`.** `trellis check` is lenient
(title/links/sources/tags); the Astro build enforces the full Zod schema; only a
browser catches client-side errors. Two real bugs hid from `check`:
- `journal add` wrote `lastUpdated` as a quoted string → failed Starlight's date
  schema (caught by build). Fix was to drop the git-derived field.
- The POC's Cytoscape crash only showed in the browser console.

## Gotchas / lessons (you will likely hit these)

- **Node v25 strips types and refuses node_modules `.ts`.** Starlight, the themes,
  and the validator ship `.ts`. A Node-loaded package (`@trellis/core`) can't
  `import` them at astro-config time → they're imported by the project's
  `astro.config` (Vite transpiles there) and injected (ADR 0014). Keep core
  build-free and never add a top-level `.ts`-dep import to `src/index.mjs`.
- **`file:` dir deps must be `--install-links`** (else peer deps resolve to the
  wrong tree and the build fails); `file:*.tgz` and URL/registry deps don't need
  it. The CLI already branches on this (`new.mjs`/`update.mjs`).
- **npm caches release tarball URLs.** After re-uploading a same-version asset,
  `npm cache clean --force` before reinstalling or you'll get the stale tarball.
- **The brew bundle must be lean.** Build it with `npm i -g --legacy-peer-deps`
  so the Astro-plugin peers (`cytoscape`, `mermaid`, theme, validator) aren't
  pulled in — they're `peerDependencies` of core, provided by each project. Without
  this the bundle is ~128 MB instead of ~240 KB.
- **Dev-server port:** `astro dev` ignores `.claude/launch.json`'s `port`; pass
  `--port` explicitly (the launch config's `runtimeArgs` do this).
- **Structure data model:** filesystem is source of truth; `trellis.config.json`
  holds only labels/order/toggles + the framework-maintained `trellisVersion`/
  `tailored`. Sidebar is scanned at any depth (ADR 0007/0008).

## When you add a structural change
Ship a migration in `packages/core/migrations/<version>.mjs` (exports `up(ctx)`;
`ctx.prompt` before destructive steps), bump the version, and the runner applies it
on `trellis update` (ADR 0003). See `docs/RELEASING.md`.
