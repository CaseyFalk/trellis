// `trellis check` — fast KB integrity check (no full build), JSON output (ADR 0015).
// Ported from the POC scripts/check-kb.mjs. Errors fail (exit 1); warnings don't.
import { requireProject, canonical, hrefToCanonical, canonicalDir, fileCanonical, walkDocs, readPage, readFile, existsSync } from '../lib/util.mjs';

const MATURITIES = ['seedling', 'growing', 'established'];
const EXTRA_ROUTES = new Set(['', 'concept-graph']);
const LINK_RE = /(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

async function loadTaxonomy(taxonomyPath) {
  if (!existsSync(taxonomyPath)) return null;
  const text = await readFile(taxonomyPath, 'utf8');
  const tags = new Set();
  for (const m of text.matchAll(/^-\s*`([^`]+)`/gm)) tags.add(m[1].trim().toLowerCase());
  return tags;
}

export async function check() {
  const { docsDir, taxonomyPath } = requireProject();
  const errors = [];
  const warnings = [];

  const files = await walkDocs(docsDir);
  const taxonomy = await loadTaxonomy(taxonomyPath);

  const pages = new Map(); // canonical -> { rel, data, content, dir }
  for (const file of files) {
    const id = fileCanonical(file, docsDir);
    const { data, content } = await readPage(file);
    pages.set(id, { rel: file.slice(docsDir.length + 1), data, content, dir: canonicalDir(id) });
  }

  const validTargets = new Set([...pages.keys(), ...EXTRA_ROUTES]);

  for (const [id, page] of pages) {
    const where = page.rel;
    if (!page.data.title) errors.push(`${where}: missing required frontmatter \`title\``);

    const maturity = page.data.maturity;
    if (maturity && !MATURITIES.includes(maturity)) {
      errors.push(`${where}: invalid maturity "${maturity}" (use ${MATURITIES.join(' / ')})`);
    }

    for (const src of page.data.sources ?? []) {
      if (!pages.has(canonical(`journal/${src}`))) {
        errors.push(`${where}: source "${src}" has no journal page (expected journal/${src}.md)`);
      }
    }

    if (taxonomy) {
      for (const tag of page.data.tags ?? []) {
        if (!taxonomy.has(String(tag).toLowerCase())) {
          warnings.push(`${where}: tag "${tag}" is not in taxonomy.md`);
        }
      }
    }

    for (const m of page.content.matchAll(LINK_RE)) {
      const target = hrefToCanonical(m[1], page.dir);
      if (target !== null && !validTargets.has(target)) {
        errors.push(`${where}: broken internal link -> ${m[1]}`);
      }
    }
  }

  const result = { ok: errors.length === 0, pages: pages.size, errors, warnings };
  process.stdout.write(JSON.stringify(result));
  process.exit(errors.length ? 1 : 0);
}
