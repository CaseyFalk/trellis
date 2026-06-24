# Trellis — Build Plan

The design agreed during the grilling session. Architecture rationale lives in
`docs/adr/`; vocabulary in `CONTEXT.md`; product vision in `FOUNDATION.md`. This
file is the build sequence.

> **Framing:** the framework is *not* new code. It already works in the POC
> (`../Local LLMs/`). This build mostly **extracts and generalizes** that into a
> package + template + CLI.

## Architecture in one paragraph

Trellis ships as two artifacts (ADR 0011): a **thin `trellis` CLI** distributed via
Homebrew (`brew install trellis`), and a **versioned, npm-consumable `@trellis/core`**
(git dep to start) holding the `trellisStarlight()` plugin, the bundled `template/`,
the procedures, `migrations/`, and check/update logic. `trellis new <name> "<focus>"`
deterministically scaffolds a usable project (no LLM); intelligent tailoring is
deferred to the first agent session via the portable `tailor.md` procedure. The
framework is a versioned dependency so fixes propagate; `trellis update` bumps it,
re-syncs framework-managed files, and runs version-to-version migrations.

**User flow:** setup = `brew install trellis` → `trellis new`; updates =
`brew upgrade trellis` → `trellis update` in each project (the brew step is often a
no-op — most updates ride in `@trellis/core` and reach projects via `trellis update`).

## Repo shape (npm-workspaces monorepo, ADR 0013)

```
Trellis/
├── package.json                workspaces: ["packages/*", "examples/*"]
├── packages/
│   ├── core/                   @trellis/core (npm-consumable, build-free)
│   │   ├── package.json        exports: . ./content ./components/* ./pages/* ./styles/*
│   │   ├── src/                index.mjs (trellisStarlight) · content.mjs · lib/links.ts
│   │   │                       · plugins/remark-mermaid.mjs · components/{Head,Footer}.astro
│   │   │                       · pages/concept-graph.astro · styles/custom.css
│   │   ├── src/cli/            tool implementations + core CLI entry (Phase 3)
│   │   ├── template/           what `trellis new` copies (the thin in-project files)
│   │   │   ├── package.json · astro.config.mjs (framework-managed, ADR 0014)
│   │   │   ├── trellis.config.json   owned: title/theme/toggles + trellisVersion + tailored
│   │   │   ├── src/content.config.ts · src/content/docs/<registers>/ + intros + journal
│   │   │   ├── AGENTS.md · CLAUDE.md · taxonomy.md · README.md
│   │   │   └── .claude/skills/{capture,trellis-tailor}/   thin pointers
│   │   ├── procedures/         canonical conventions.md · capture.md · tailor.md (Phase 4)
│   │   └── migrations/         version-to-version steps for `trellis update` (Phase 5)
│   └── cli/                    thin `trellis` CLI, Homebrew (Phase 5)
├── examples/sandbox/           consumption harness
└── FOUNDATION.md · README.md · CONTEXT.md · PLAN.md · docs/adr/
```

## Framework-managed vs user-owned (the re-sync manifest)

| Framework-managed (overwritten by `trellis update`) | User-owned (never touched) |
| --- | --- |
| `astro.config.mjs` · `src/content.config.ts` | `trellis.config.*` |
| `docs/conventions.md` · `docs/capture.md` · `tailor.md` | `AGENTS.md` · `CLAUDE.md` |
| `.claude/skills/**` thin wrappers | `taxonomy.md` · `README.md` |
| (`package.json` dep line bumped, not overwritten) | `src/content/docs/**` |

> The **learning profile is not an in-project file** — it is shared user-level
> state at `~/.trellis/learning-profile.md` (ADR 0009), referenced by `AGENTS.md`.

## Structure data model (ADR 0007, 0008)

On disk, **the filesystem is the source of truth**; `trellis.config` holds only
display metadata (labels, order, toggles). The plugin builds the sidebar by
scanning `src/content/docs/` at any nesting depth.

```
src/content/docs/{concepts,guides,reference/{glossary,…cuts},troubleshooting,journal}
```

| Level | Fixed? | Created by |
| --- | --- | --- |
| Top-level registers (Concept, Guide, Reference, Troubleshooting, Journal) | **Fixed** | template; only changed by a framework migration |
| Reference cuts (sub-dirs of `reference/`) | tailorable | `tailor.md` first session; capture later |
| Sub-sections under any register | organic | `capture.md` as the KB grows |
| Pages | organic | `capture.md` |

- **Tailoring (`tailor.md`, one-shot first session):** propose the Reference cut +
  labels (Glossary always present), seed the taxonomy, seed the shared learning
  profile. No knowledge-vs-skill skeleton fork (ADR 0005).
- **Growth (`capture.md`, ongoing):** propose new sub-sections under any register +
  new pages, behind the approval gate. Never adds top-level registers. No hard
  nesting cap.

## Package entry + options surface (ADR 0010, 0014 — stable boundary, keep small)

Entry is a wrapper integration. The framework-managed `astro.config.mjs` imports
the TypeScript-source framework deps (so Astro's Vite loader transpiles them) and
injects them (ADR 0014):
`integrations: trellisStarlight({ starlight, themes, linksValidator }, config)`.
`config` is the project's `trellis.config`:

```
{ title, description, theme, features: { tooltips, backlinks, conceptGraph }, trellisVersion, tailored }
```
`theme` is a name from a curated bundled set (default `rapide`). All features
default on. `trellisVersion` (migration stamp) and `tailored` (first-session
trigger flag) are framework-maintained. Hardcoded (not toggleable): Mermaid,
links-validator, the check script, journal down-weighting, the frontmatter schema.

---

## Build sequence

> Two artifacts (ADR 0011): **`@trellis/core`** (npm-consumable: plugin, template,
> procedures, migrations, tool/check/update logic) and the **thin `trellis` CLI**
> (Homebrew). The deterministic toolkit (Phase 3) is built before the procedures
> (Phase 4), because the procedures call the tools (ADR 0012).

### Phase 1 — Extract the framework into the package (`@trellis/core`) — ✅ DONE
Repackage the POC's proven pieces as the `trellisStarlight()` wrapper integration
(ADR 0010): `components/Head.astro` + `Footer.astro`, `lib/links.ts`,
`plugins/remark-mermaid.mjs`, `pages/concept-graph.astro` (→ injected route +
auto-excluded from the validator), the `content.config` schema, theme-by-name.
Add directory-scanning sidebar generation (any depth, ADR 0007/0008) from
`trellis.config` + the three feature toggles.
**Done when:** adding the package + a `trellis.config` to a bare Astro+Starlight
project reproduces the POC site's behavior (build *and* runtime — verify in
browser, per the POC's Cytoscape lesson).
**Verified** in `examples/sandbox`: build (9 pages, injected `/concept-graph/`,
links validated) + browser runtime (Mermaid→SVG, glossary tooltips, maturity,
Sources, backlinks, Cytoscape graph, zero console errors). Surfaced ADR 0014.

### Phase 2 — Build the template — ✅ DONE
The thin in-project files that consume the package: default registers
(`reference/` parent + `glossary/`) + section intros + empty journal + index,
`trellis.config` (defaults + `trellisVersion` + `tailored: false`), the schema
shim, framework-managed `astro.config.mjs` (ADR 0014 injection), `AGENTS.md`
(self-sufficient cross-agent driver skeleton) / `CLAUDE.md` pointer,
`taxonomy.md`/`README.md`, the `.claude` thin wrappers. (No `learning-profile.md`
— it's shared, ADR 0009. `docs/conventions.md`, `docs/capture.md`, `tailor.md` are
NOT in the template — the CLI copies them from the installed package in Phase 5;
`AGENTS.md` + the wrappers point at them.)
**Done when:** hand-copying `template/` + `npm install` + build yields a working,
empty site.
**Verified:** instantiated `packages/core/template/` as a throwaway workspace
example — built clean (9 pages, links valid) and browser-verified (renders, empty
concept graph via Cytoscape, zero console errors). Example removed after.

### Phase 3 — Build the deterministic toolkit + core CLI (ADR 0012, 0015) — ✅ DONE
The content-management tools the agent calls (`@trellis/core/src/cli/`, bin
`trellis-core`; the Phase-5 global `trellis` dispatches into it). JSON-only I/O
(ADR 0015); each tool guarantees its own invariant; absolute internal links (Q3).
- `page new`/`move`/`rename`/`merge`/`set` — multi-file link + `sources` + journal
  integrity maintained by the tool, not the agent.
- `section add`/`rename`/`move` · `tag add`/`rename` · `journal add` (cohesive,
  dated, wires `sources` — Q4) · `config set`/`get` (JSON config) · `check`
  (← `check-kb.mjs`).
- Frontmatter round-trips via `gray-matter` (preserves unknown fields like
  splash `hero`).
**Done when:** each tool performs its mechanics and leaves `trellis check` green;
a weak model can drive structural edits via tools without hand-editing files.
**Verified** against a sandbox copy: new/set/tag-add/journal-add (sources wired
bidirectionally), `page move` rewrote all 7 inbound links (incl. journal entries)
with zero stale links, `tag rename` (3 pages + taxonomy), `page merge`
(redirect + sources-union + delete), `config set/get` (nested keys) — `check`
green after the full battery.

### Phase 4 — Author the portable procedures (decide → call tools) — ✅ DONE
Generalize from the POC, domain-agnostic; procedures invoke Phase 3 tools for all
mechanics. Authored in `packages/core/procedures/` (CLI copies them in Phase 5):
recipe-explicit tool calls with the tool reference centralized in `conventions.md`;
approval gates kept in capture + tailor; profile updates opportunistic *and*
confirmed. **Verified end-to-end:** followed `tailor.md` then `capture.md` via the
tools on a fresh template → 13-page KB, `check` clean (0 errors/warnings); full
build (15 pages, links valid) + browser runtime (backlinks, Sources, maturity, and
the tailored Reference cuts in nav, zero console errors). The build caught a
`journal add` bug `check` missed (`lastUpdated` written as a quoted string vs.
Starlight's date schema) — fixed by dropping the git-derived field.
- `conventions.md` ← POC `CLAUDE.md` (register contract, routing test, frontmatter
  schema, journal format, behavioral rules incl. proactive-capture nudge).
- `capture.md` ← POC capture `SKILL.md` (points to `conventions.md`); extended with
  structural growth (propose new sub-sections under any register + pages); writes
  via tools.
- `tailor.md` (new): one-shot first-session, 8 steps (read focus → propose
  Reference cut → propose taxonomy → seed shared profile → approval gate → write
  via tools → offer seed capture → verify). Sets `tailored: true` on completion or
  decline.
- `AGENTS.md` is the **self-sufficient cross-agent driver**: documents the
  procedures + how to invoke them by plain instruction (not assuming `/skills`),
  opens with the proactive-offer keyed on `tailored: false`, includes a "using
  another agent" note. Claude `/capture` + `/trellis-tailor` are thin convenience
  wrappers.
**Done when:** any agent in a fresh project can run tailor then capture end-to-end,
driving mechanics through tools.

### Phase 5 — `trellis new` + `update` + migrations (thin CLI) — ✅ DONE
Built in `packages/cli/` (bin `trellis`). Dispatch per ADR 0016: `new` from bundled
core, `update` orchestrate + delegate to project core, tools/`check` pass through to
project core. Core-spec via `TRELLIS_CORE_SPEC` (+ `--no-install`); `file:` specs
install with `--install-links`; template ships `.gitignore`; `new` commits after
install (captures the lockfile, clean tree for `update`).
**Verified end-to-end:** `trellis new` (local-core override) → scaffold + install +
build (10 dist entries) + git (clean tree, lockfile tracked) + shared profile
seeded; passthrough `page new`/`check` hit the project core; `trellis update` (clean
-tree gate → bump → re-sync 7 files → migrations → version stamp → commit), `check`
green after; the migration runner applies an in-range `0.2.0.mjs` and skips
out-of-range. Surfaced ADR 0016.

- `trellis new <name> "<focus>"`: preflight (require focus, valid name, absent/empty
  target dir — never clobber; git + node/npm present) → create dir → copy template →
  write focus into `AGENTS.md` → ensure `~/.trellis/learning-profile.md` exists
  (seed on first ever run) → `npm install` → copy `conventions.md`/`capture.md` from
  the installed package → `git init` + first commit → `trellis check` + verify →
  print the two-step next-step message. On external-step failure: leave the dir +
  resume instructions, never auto-delete (Q20-A).
- `trellis update`: read `trellisVersion` (V_from) → resolve latest (V_to) → bump
  dep + install → re-sync framework-managed files → run migrations in
  `(V_from, V_to]` → write `trellisVersion`. Requires a clean git tree; commits
  after (git is the safety net — no custom backup/merge).
- **Migration mechanism:** the runner + `migrations/` format + version stamping
  (ADR 0003). Migrations are modules (`migrations/<version>.mjs`) exporting
  `async up(ctx)`, where `ctx` gives scoped project helpers (fs within the project,
  `trellis.config` read/write, `prompt()` for confirmation, logging) — reusing the
  Phase 3 tools where possible. Discovered by version, applied in semver order;
  destructive steps must `ctx.prompt()` first. Ships with zero migrations at v0, but
  the mechanism exists so future structural changes have a home.

**Done when:** `trellis new` from any folder produces a verified, usable project,
and a trivial test migration applies cleanly to an existing project via `update`.

### Phase 6 — Documentation — ✅ DONE
Top-level `README.md` (what Trellis is · both install paths · the new→tailor→learn→
capture→update lifecycle · seeding · repo layout · ADR pointers); the generated
project README + `trellis new` closing message (Phase 2); `Formula/trellis.rb`
(starter Homebrew formula). Repo wired to `casey-falkowski/trellis`.
**Distribution gaps recorded** in [docs/REMAINING-WORK.md](docs/REMAINING-WORK.md):
`@trellis/core` is a monorepo subpackage so it (and the CLI) can't be git-installed
directly — needs an npm publish (or release tarballs) before `npm i -g` / Homebrew
work; the from-source path (`npm link` + `TRELLIS_CORE_SPEC`) works today.
**Done when:** a cold reader can install (from source today), scaffold, tailor, and
learn unaided.

### Phase 7 — Validation / dogfood — IN PROGRESS (user-driven)
Run `trellis new` for a fresh focus area; tailor; capture a few exchanges; confirm
features render at runtime. Stretch: regenerate the "Local LLMs" focus and diff
against the hand-built POC for parity. Then exercise `trellis update` end-to-end.
**Done when:** a generated project matches POC quality and updates cleanly.

### Shipped beyond the original phases
- **`trellis run`** — dev server with hot-reload-on-capture (v0.1.1).
- **Distribution** — tarball releases on the public `CaseyFalk/trellis` repo (ADR
  0011 realized): `brew tap CaseyFalk/trellis <url> && brew install trellis`, or
  `npm i -g <release URL>`. Homebrew formula in this repo; `pack:local` /
  `pack:release` scripts. peerDeps refactor for a lean brew bundle.
- **Dev/release docs** — current status + how to develop and release live in
  [CLAUDE.md](CLAUDE.md), [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md), and
  [docs/RELEASING.md](docs/RELEASING.md). **Start there in a new session.**

---

## Seeding
Not a built feature. After `trellis new`, drop existing notes in and run capture —
the proven loop decomposes/routes/approves. Documented in the README and nudged
in `tailor.md`.

## Future (not now)
- A `/teach`-style skill that authors explicit Tutorial learning paths over the
  captured knowledge, and a Tutorial register to hold them. (Out of the default
  because the capture loop produces reference-style knowledge, not lessons.)
- Graduate `@trellis/core` from a git dependency to a published npm package if ever
  shared beyond personal use.
- A **project registry** in `~/.trellis/` so `trellis update --all` can update every
  project at once (v1 is manual, per-project). Adds state that can go stale, so
  deferred until the per-project flow chafes.

## Feasibility spikes — all confirmed (against POC's installed deps + live test)
- **Schema import — ✅** `docsSchema`'s `extend?: T | ((ctx)=>T)` accepts an imported
  Zod schema; Starlight exposes `./schema` + `./loaders`. Shim re-exports `collections`
  or passes `extend: trellisSchema`.
- **Route injection — ✅** Astro integration setup has `injectRoute`;
  `starlight-links-validator` has `exclude`. `trellisStarlight()` returns an integration
  array (our integration + `starlight()`), coordinating both.
- **Theme-by-name — ✅** rapide is a `StarlightPlugin`; select by name and add to
  Starlight's `plugins` array.
- **git-dependency + bin — ✅ (live)** installed a `github:` package and ran its bin.
  **Discipline:** author `@trellis/core` **build-free** (plain `.mjs` + `.astro`, as the
  POC does) so git-dep install needs no `prepare`/build step.
