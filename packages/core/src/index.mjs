// @trellis/core entry — a wrapper integration (ADR 0010).
//
// `trellisStarlight(config)` is a pure function of the project's `trellis.config`
// (ADR 0006): it composes the full Starlight stack the POC wired by hand —
// theme, links validator, component overrides, the scanned sidebar, remark-mermaid,
// and the injected concept-graph route — so the project's `astro.config` is just
// `integrations: [trellisStarlight(config)]`.
import remarkMermaid from './plugins/remark-mermaid.mjs';

// NOTE: @astrojs/starlight, the themes, and the links-validator all ship as
// TypeScript source (index.ts). Node v25 refuses to strip types from files under
// node_modules, so a *Node-loaded* module (like this one) cannot `import` them at
// config-eval time. They must be imported by the project's framework-managed
// astro.config (which Astro's Vite loader transpiles) and injected here. See
// ADR 0014.

/** Feature toggles; all on by default (ADR 0010 / the POC baseline). */
const DEFAULT_FEATURES = { tooltips: true, backlinks: true, conceptGraph: true };

/** Fixed top-level registers, in default order (ADR 0005, 0007).
 *  Reference holds the tailored cuts + an always-present glossary as sub-dirs. */
const REGISTERS = [
  { dir: 'guides', label: 'Guides' },
  { dir: 'concepts', label: 'Concepts' },
  { dir: 'reference', label: 'Reference' },
  { dir: 'troubleshooting', label: 'Troubleshooting' },
  { dir: 'journal', label: 'Journal', collapsed: true },
];

/** Build Starlight's sidebar from the fixed registers.
 *  `autogenerate` lets Starlight scan each register directory at any depth
 *  (ADR 0007 filesystem-as-source-of-truth, ADR 0008 nested sub-sections).
 *  Per the POC lesson, `autogenerate` is nested inside `items`, never a sibling
 *  of `label`. Labels/order are overridable via `config.sidebar.labels`. */
function buildSidebar(config) {
  const labels = config.sidebar?.labels ?? {};
  const items = REGISTERS.map((r) => ({
    label: labels[r.dir] ?? r.label,
    collapsed: r.collapsed,
    items: [{ autogenerate: { directory: r.dir } }],
  }));
  if (config.features?.conceptGraph !== false) {
    items.push({ label: 'Concept Map', link: '/concept-graph/' });
  }
  return items;
}

/** A virtual module exposing feature flags to the .astro component overrides,
 *  so toggles reach server + client code without touching the project. */
function virtualConfigPlugin(features) {
  const id = 'virtual:trellis-config';
  const resolved = '\0' + id;
  return {
    name: '@trellis/core:virtual-config',
    resolveId(source) {
      if (source === id) return resolved;
    },
    load(thisId) {
      if (thisId === resolved) {
        return `export const features = ${JSON.stringify(features)};`;
      }
    },
  };
}

/** Our own Astro integration: remark wiring, the virtual config module, and the
 *  injected concept-graph route (kept in sync with the validator's exclude). */
function trellisIntegration(features) {
  return {
    name: '@trellis/core',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        updateConfig({
          markdown: { remarkPlugins: [remarkMermaid] },
          vite: { plugins: [virtualConfigPlugin(features)] },
        });
        if (features.conceptGraph) {
          injectRoute({
            pattern: '/concept-graph',
            entrypoint: '@trellis/core/pages/concept-graph.astro',
          });
        }
      },
    },
  };
}

/**
 * Compose the full Trellis Starlight stack.
 * @param {object} deps framework modules imported by the (Vite-transpiled)
 *   astro.config and injected here: `{ starlight, themes, linksValidator }`.
 *   `themes` is a name→plugin-factory map (the curated set; ADR 0010, 0014).
 * @param {object} config the project's trellis.config
 * @returns an array of Astro integrations (Astro flattens these).
 */
export function trellisStarlight(deps, config = {}) {
  const { starlight, themes = {}, linksValidator } = deps;
  const features = { ...DEFAULT_FEATURES, ...(config.features ?? {}) };
  const themeFactory = themes[config.theme ?? 'rapide'] ?? Object.values(themes)[0];

  const plugins = [];
  if (themeFactory) plugins.push(themeFactory());
  // The concept-graph is a custom (non-Starlight) route the validator can't
  // introspect, so it must be excluded when present (POC lesson).
  if (linksValidator) {
    plugins.push(
      features.conceptGraph
        ? linksValidator({ exclude: ['/concept-graph/'] })
        : linksValidator()
    );
  }

  const sl = starlight({
    title: config.title ?? 'Knowledge Base',
    description: config.description,
    customCss: ['@trellis/core/styles/custom.css'],
    components: {
      Head: '@trellis/core/components/Head.astro',
      Footer: '@trellis/core/components/Footer.astro',
    },
    plugins,
    sidebar: buildSidebar(config),
  });

  return [trellisIntegration(features), sl];
}

export default trellisStarlight;
