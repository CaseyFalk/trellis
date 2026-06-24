# An owned `trellis.config` isolates tailored values from framework-managed config

To make `trellis update`'s re-sync non-destructive, every in-project file must be
cleanly framework-managed (safe to overwrite) or user-owned (never touched). The
problem child was `astro.config.mjs`, which mixed framework wiring (plugins,
integrations) with tailored values (title, the per-domain Reference cut / sidebar).

> **Revision (Phase 3):** `trellis.config` is **JSON** (`trellis.config.json`), not
> `.mjs`, so the `trellis config` tools can mutate it deterministically and the
> framework-maintained `trellisVersion`/`tailored` flags are robust to set (ADR
> 0012). `astro.config` reads it via `fs`+`JSON.parse`.

We split it: an **owned `trellis.config`** holds only the tailored values (title,
section/Reference structure + labels, feature toggles); the `trellis()` plugin
reads it and generates the sidebar. `astro.config.mjs` becomes thin and
framework-managed. New plugin options ship with defaults, so the owned config
never needs overwriting to gain them.

Two principles follow: `AGENTS.md` holds *only* tailored content (the behavioral
rules live in framework-managed `docs/conventions.md`, so they propagate on
update); and the capture procedure lives in framework-managed `docs/capture.md`
(Claude `/capture` skill is a thin pointer), so capture-loop improvements reach
existing projects.
