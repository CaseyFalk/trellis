// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from 'starlight-theme-rapide';
import starlightLinksValidator from 'starlight-links-validator';
import { trellisStarlight } from '@trellis/core';

const config = JSON.parse(readFileSync(new URL('./trellis.config.json', import.meta.url)));

// Framework-managed, re-synced by `trellis update` (ADR 0006). It imports the
// TypeScript-source framework deps here — where Astro's Vite loader transpiles
// them — and injects them into trellisStarlight(), which owns composition
// (ADR 0010, 0014).
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
