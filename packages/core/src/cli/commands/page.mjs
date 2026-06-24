// `trellis page` commands: new · move · rename · merge · set
// Mechanics only (ADR 0012). Prose (page bodies) is authored by the agent.
import {
  ok, fail, list, requireProject,
  canonical, canonicalDir, fileCanonical, walkDocs, readPage, writePage, rewriteLinks,
  existsSync, join, rename, rm,
} from '../lib/util.mjs';

/** Resolve a canonical slug to an existing file, or null. */
function resolveFile(docsDir, canon) {
  for (const c of [
    join(docsDir, canon + '.md'),
    join(docsDir, canon + '.mdx'),
    join(docsDir, canon, 'index.md'),
    join(docsDir, canon, 'index.mdx'),
  ]) if (existsSync(c)) return c;
  return null;
}

/** Build frontmatter for a brand-new page from options. */
function newFrontmatter(opts) {
  const data = { title: opts.title };
  if (opts.description) data.description = opts.description;
  const tags = list(opts.tags);
  if (tags.length) data.tags = tags;
  const sources = list(opts.sources);
  if (sources.length) data.sources = sources;
  if (opts.maturity) data.maturity = opts.maturity;
  return data;
}

const MATURITIES = ['seedling', 'growing', 'established'];

export async function pageNew({ pos, opts }) {
  const { docsDir } = requireProject();
  const rel = pos[0];
  if (!rel) return fail('usage: page new <path> --title "…" [--description …] [--tags a,b] [--maturity m] [--sources s1,s2]');
  if (!opts.title || opts.title === true) return fail('--title is required');
  if (opts.maturity && !MATURITIES.includes(opts.maturity)) return fail(`invalid --maturity "${opts.maturity}" (use ${MATURITIES.join(' / ')})`);
  const canon = canonical(rel);
  if (resolveFile(docsDir, canon)) return fail(`page already exists: ${canon}`);
  const file = join(docsDir, canon + '.md');
  await writePage(file, newFrontmatter(opts), '\n');
  return ok({ action: 'page new', page: canon, file });
}

export async function pageSet({ pos, opts }) {
  const { docsDir } = requireProject();
  const canon = canonical(pos[0] || '');
  const file = resolveFile(docsDir, canon);
  if (!file) return fail(`page not found: ${pos[0]}`);
  const { data, content } = await readPage(file);
  const changed = [];
  if (opts.title && opts.title !== true) { data.title = opts.title; changed.push('title'); }
  if (opts.description && opts.description !== true) { data.description = opts.description; changed.push('description'); }
  if (opts.maturity && opts.maturity !== true) {
    if (!MATURITIES.includes(opts.maturity)) return fail(`invalid --maturity "${opts.maturity}"`);
    data.maturity = opts.maturity; changed.push('maturity');
  }
  const addTags = list(opts['add-tag']);
  if (addTags.length) {
    data.tags = [...new Set([...(data.tags ?? []), ...addTags])]; changed.push('tags+');
  }
  const removeTags = list(opts['remove-tag']);
  if (removeTags.length) {
    data.tags = (data.tags ?? []).filter((t) => !removeTags.includes(t)); changed.push('tags-');
  }
  const addSources = list(opts['add-source']);
  if (addSources.length) {
    data.sources = [...new Set([...(data.sources ?? []), ...addSources])]; changed.push('sources+');
  }
  if (!changed.length) return fail('nothing to set (pass --title/--description/--maturity/--add-tag/--remove-tag/--add-source)');
  await writePage(file, data, content);
  return ok({ action: 'page set', page: canon, changed });
}

/** Move a page and keep every link valid (ADR Q3): rewrite all inbound links to
 *  absolute `/to/`, normalize the moved file's own relative links to absolute, and
 *  fix `sources` references if a journal entry was moved. */
export async function pageMove({ pos }) {
  const { docsDir } = requireProject();
  const fromCanon = canonical(pos[0] || '');
  const toCanon = canonical(pos[1] || '');
  if (!fromCanon || !toCanon) return fail('usage: page move <from> <to>');
  const src = resolveFile(docsDir, fromCanon);
  if (!src) return fail(`page not found: ${pos[0]}`);
  if (resolveFile(docsDir, toCanon)) return fail(`destination already exists: ${toCanon}`);

  const ext = src.endsWith('.mdx') ? '.mdx' : '.md';
  const isIndex = /(^|\/)index\.(md|mdx)$/i.test(src);
  const dest = isIndex ? join(docsDir, toCanon, 'index' + ext) : join(docsDir, toCanon + ext);
  const { mkdir } = await import('node:fs/promises');
  await mkdir(join(dest, '..'), { recursive: true });
  await rename(src, dest);

  // Rewrite inbound links across the whole KB.
  let inbound = 0;
  for (const file of await walkDocs(docsDir)) {
    const { data, content } = await readPage(file);
    const fromDir = canonicalDir(fileCanonical(file, docsDir));
    const r = rewriteLinks(content, fromDir, (canon) => (canon === fromCanon ? `/${toCanon}/` : null));
    if (r.count) { await writePage(file, data, r.body); inbound += r.count; }
  }

  // Normalize the moved file's own relative links to absolute.
  {
    const { data, content } = await readPage(dest);
    const fromDir = canonicalDir(toCanon);
    const r = rewriteLinks(content, fromDir, (canon, href) => (href.startsWith('/') ? null : `/${canon}/`));
    if (r.count) await writePage(dest, data, r.body);
  }

  // If a journal entry moved, fix every page's `sources` slug reference.
  let sourcesFixed = 0;
  if (fromCanon.startsWith('journal/')) {
    const oldSlug = fromCanon.split('/').pop();
    const newSlug = toCanon.split('/').pop();
    for (const file of await walkDocs(docsDir)) {
      const { data, content } = await readPage(file);
      if (Array.isArray(data.sources) && data.sources.includes(oldSlug)) {
        data.sources = data.sources.map((s) => (s === oldSlug ? newSlug : s));
        await writePage(file, data, content); sourcesFixed++;
      }
    }
  }

  return ok({ action: 'page move', from: fromCanon, to: toCanon, inboundLinksRewritten: inbound, sourcesFixed });
}

export async function pageRename({ pos }) {
  const fromCanon = canonical(pos[0] || '');
  const newSlug = pos[1];
  if (!fromCanon || !newSlug) return fail('usage: page rename <from> <new-slug>');
  const dir = canonicalDir(fromCanon);
  const toCanon = dir ? `${dir}/${canonical(newSlug)}` : canonical(newSlug);
  return pageMove({ pos: [fromCanon, toCanon] });
}

/** Merge src pages into dest: redirect inbound links, union sources, delete srcs.
 *  The agent has already authored dest's body (ADR 0012 hybrid). */
export async function pageMerge({ pos, opts }) {
  const { docsDir } = requireProject();
  const destCanon = canonical(opts.into || '');
  const srcs = pos.map(canonical).filter(Boolean);
  if (!destCanon || !srcs.length) return fail('usage: page merge --into <dest> <src> [<src> …]');
  const destFile = resolveFile(docsDir, destCanon);
  if (!destFile) return fail(`destination page not found: ${opts.into}`);

  const srcSet = new Set(srcs);
  // Collect sources from the srcs to union into dest.
  const unionSources = new Set();
  for (const s of srcs) {
    const f = resolveFile(docsDir, s);
    if (!f) return fail(`source page not found: ${s}`);
    const { data } = await readPage(f);
    for (const src of data.sources ?? []) unionSources.add(src);
  }

  // Redirect every inbound link to a src → dest, across the KB.
  let inbound = 0;
  for (const file of await walkDocs(docsDir)) {
    const { data, content } = await readPage(file);
    const fromDir = canonicalDir(fileCanonical(file, docsDir));
    const r = rewriteLinks(content, fromDir, (canon) => (srcSet.has(canon) ? `/${destCanon}/` : null));
    if (r.count) { await writePage(file, data, r.body); inbound += r.count; }
  }

  // Union sources into dest.
  const destPage = await readPage(destFile);
  destPage.data.sources = [...new Set([...(destPage.data.sources ?? []), ...unionSources])];
  await writePage(destFile, destPage.data, destPage.content);

  // Delete the src files.
  for (const s of srcs) {
    const f = resolveFile(docsDir, s);
    if (f) await rm(f);
  }

  return ok({ action: 'page merge', into: destCanon, merged: srcs, inboundLinksRedirected: inbound });
}
