# Trellis — Operating Manual (for Claude working ON Trellis)

You are developing **Trellis itself** — the meta-tool that scaffolds learning
projects. (This is the dev repo; do not confuse it with the project *template* in
`packages/core/template/`, which has its own `AGENTS.md`/`CLAUDE.md` for generated
projects.)

## Read these first

| Doc | What it is |
| --- | --- |
| [FOUNDATION.md](FOUNDATION.md) | The product vision (authoritative on *what* Trellis is) |
| [PLAN.md](PLAN.md) | The build plan + per-phase status/verification (the *how it was built*) |
| [CONTEXT.md](CONTEXT.md) | Domain glossary (the ubiquitous language) |
| [docs/adr/](docs/adr/) | 16 ADRs — the *why* behind every load-bearing decision |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | How to develop, test, and verify changes; gotchas |
| [docs/RELEASING.md](docs/RELEASING.md) | The full release process |
| [docs/REMAINING-WORK.md](docs/REMAINING-WORK.md) | Distribution status + what's left |
| [docs/MANUAL-TEST.md](docs/MANUAL-TEST.md) | How a user dogfoods a generated project |

When you make an architectural decision, **add an ADR** (next number; see
[docs/adr/ADR-FORMAT via the existing ones]). When you change the domain language,
update `CONTEXT.md`.

## What's here

```
packages/core/   @trellis/core — Starlight wrapper (src/), content-management
                 toolkit (src/cli/), update logic (src/update.mjs), the bundled
                 template/, the portable procedures/, and migrations/
packages/cli/    the thin `trellis` CLI (new · run · update · passthrough)
examples/sandbox/ a consumption harness used to verify the plugin
scripts/         pack:local / pack:release (build installable tarballs)
Formula/         the Homebrew formula (lives in this repo; tap via URL)
```

## Current status (v0.1.1)

- **Functionally complete.** Phases 1–6 done (see PLAN.md); `trellis new`, `run`,
  `update`, the toolkit, and the procedures all work and are verified.
- **Distributed** via GitHub Releases at `CaseyFalk/trellis` (public). v0.1.1 has
  three assets: `trellis-core`, `trellis` (CLI), and `trellis-bundled` (for brew).
- **Install:** `brew tap CaseyFalk/trellis https://github.com/CaseyFalk/trellis && brew install trellis`,
  or `npm i -g <release URL>`. Dev: see DEVELOPMENT.md.
- **Outstanding:** delete the empty `CaseyFalk/homebrew-trellis` repo (needs
  `gh auth refresh -s delete_repo`); Phase 7 = the user's real dogfood; future
  ideas in PLAN.md → "Future".

## Golden rules (don't break these)

1. **`@trellis/core` is build-free** — plain `.mjs` + `.astro`, no compile step
   (ADR 0014). It must not `import` TypeScript-source deps (starlight/themes/
   validator) at config-eval time — those are injected by the project's
   `astro.config` (ADR 0014).
2. **Deterministic tools, agent does judgment/prose only** (ADR 0012). Mechanics
   (frontmatter, dates, links, config, taxonomy, provenance) go through
   `trellis page/section/tag/journal/config`. Tools emit **JSON only** (ADR 0015)
   and each keeps `trellis check` green.
3. **Agent-agnostic** (ADR 0001): the procedures (`conventions.md`/`capture.md`/
   `tailor.md`) are plain markdown; `AGENTS.md` is the canonical driver; Claude
   `/skills` are thin wrappers.
4. **Framework-managed vs user-owned** (ADR 0006, manifest in `src/update.mjs`):
   never make `trellis update` overwrite user content.
5. **Internal links are absolute** (`/concepts/x/`); the filesystem is the source
   of truth for structure (ADR 0007).
6. **A structural change requires a migration** (ADR 0003) and a version bump.
7. **Verify the build AND the runtime in a browser**, not just `check` — runtime
   errors (Cytoscape, the `lastUpdated` schema) hide from the build/lint.

## Verifying a change (fast path)

```sh
npm install
npm run build --workspace @trellis/sandbox      # plugin still builds
# tools: copy a project to /tmp, run the CLI against it, confirm `trellis check` green
# full flow: TRELLIS_CORE_SPEC=file:$PWD/packages/core node packages/cli/src/index.mjs new /tmp/x "..."
```
Full detail and gotchas: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
