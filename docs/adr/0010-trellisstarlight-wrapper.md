# The package entry is a `trellisStarlight()` wrapper integration

> **Note:** the `integrations: [trellisStarlight()]` shape below is revised by ADR
> 0014 — the framework deps are imported by `astro.config` and injected:
> `trellisStarlight({ starlight, themes, linksValidator }, config)`. The wrapper
> still owns composition.

`@trellis/core` exposes a wrapper integration, `trellisStarlight()`, rather than a
bare Starlight plugin. The thin, framework-managed `astro.config.mjs` reduces to
`integrations: [trellisStarlight()]`. The wrapper reads `trellis.config` and
internally composes the whole stack: `starlight()` with the scanned sidebar (ADR
0007), the chosen theme, `starlight-links-validator` (auto-excluding Trellis's
injected routes), the Head/Footer overrides, remark-mermaid, and the injected
concept-graph route.

This is what keeps `astro.config` thin enough to be framework-managed (ADR 0006)
and lets the package coordinate things that must agree — the injected concept-graph
route and the validator's exclude list; the theme and Starlight's plugin
composition. Theme is selected by name (`theme: '<name>'` in `trellis.config`)
from a small curated set Trellis bundles (default `rapide`); passing a theme plugin
instance directly is a possible later extension.

We rejected a bare Starlight plugin: it cannot cleanly inject another Starlight
plugin (the theme) and would push composition into a thicker, user-owned
`astro.config`, breaking framework-managed updates. The accepted cost: the package
owns Starlight composition, so Starlight-level customization must be a
`trellis.config` option or a deliberate eject.
