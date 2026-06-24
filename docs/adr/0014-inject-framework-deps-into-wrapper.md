# The framework-managed astro.config imports the TS-source deps and injects them into trellisStarlight()

`@astrojs/starlight`, the Starlight themes, and `starlight-links-validator` all
ship as TypeScript **source** (`index.ts`). Node v25 refuses to strip types from
files under `node_modules`, so a *Node-loaded* module cannot `import` them at
astro-config-eval time. Astro tolerates this for the project's own `astro.config`
because its Vite-based config loader transpiles the config's direct imports — but
a node_modules package (`@trellis/core`) that imports those deps is loaded by Node,
and its transitive `.ts` imports are not transpiled, so the build fails with
"Stripping types is currently unsupported for files under node_modules".

Therefore `@trellis/core` does **not** import starlight/themes/validator itself.
The framework-managed `astro.config.mjs` imports them (Astro transpiles them there)
and injects them into the wrapper:

```js
trellisStarlight(
  { starlight, themes: { rapide: starlightThemeRapide }, linksValidator: starlightLinksValidator },
  config
)
```

This keeps `@trellis/core` build-free and the composition logic still inside it
(ADR 0010). It revises ADR 0010's `integrations: [trellisStarlight()]` shape: the
config is slightly less minimal, but it remains framework-managed and re-synced by
`trellis update` (ADR 0006), so the user never maintains it and new curated themes
arrive via re-sync. Verified end-to-end (build + browser runtime) in
`examples/sandbox`.

We rejected bundling starlight into our package (it is a peer dep — huge,
duplicative) and shipping `@trellis/core` as compiled JS (the transitive `.ts`
imports of starlight would still be Node-loaded and fail).
