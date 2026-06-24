// @ts-check
// FRAMEWORK-MANAGED — re-synced by `trellis update` (ADR 0006). Do not hand-edit;
// project-specific values live in trellis.config.json.
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from 'starlight-theme-rapide';
import starlightLinksValidator from 'starlight-links-validator';
import { trellisStarlight } from '@trellis/core';

// trellis.config.json is JSON so the `trellis config` tools can mutate it
// deterministically (ADR 0006/0012). Read via fs to avoid JSON import-attribute
// fragility in Astro's config loader.
const config = JSON.parse(readFileSync(new URL('./trellis.config.json', import.meta.url)));

// The TypeScript-source framework deps are imported here, where Astro's Vite
// config loader transpiles them, then injected into the wrapper (ADR 0014).
export default defineConfig({
  integrations: trellisStarlight(
    {
      starlight,
      themes: { rapide: starlightThemeRapide },
      linksValidator: starlightLinksValidator,
    },
    config
  ),
});
