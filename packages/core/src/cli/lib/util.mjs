// Shared helpers for the Trellis content-management toolkit (ADR 0012, 0015).
// Pure Node (no astro:content) so the tools run as a plain CLI.
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile, mkdir, rename, rm } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import matter from 'gray-matter';

// ---- JSON-only output (ADR 0015) ----

/** Print a success result as JSON and exit 0. */
export function ok(obj = {}) {
  process.stdout.write(JSON.stringify({ ok: true, ...obj }));
  process.exit(0);
}

/** Print a structured error as JSON and exit 1. */
export function fail(error, extra = {}) {
  process.stdout.write(JSON.stringify({ ok: false, error, ...extra }));
  process.exit(1);
}

// ---- arg parsing ----

/** Split argv into positionals and `--opt value` / boolean `--flag` options. */
export function parseArgs(argv) {
  const pos = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) opts[key] = true;
      else { opts[key] = next; i++; }
    } else pos.push(a);
  }
  return { pos, opts };
}

/** Split a comma list option ("a,b , c") into a trimmed array. */
export function list(val) {
  if (val == null || val === true) return [];
  return String(val).split(',').map((s) => s.trim()).filter(Boolean);
}

// ---- project location ----

/** Walk up from `start` to the nearest dir containing trellis.config.json. */
export function findProjectRoot(start = process.cwd()) {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, 'trellis.config.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Resolve the standard project paths from a root. */
export function projectPaths(root) {
  return {
    root,
    configPath: join(root, 'trellis.config.json'),
    taxonomyPath: join(root, 'taxonomy.md'),
    docsDir: join(root, 'src', 'content', 'docs'),
    journalDir: join(root, 'src', 'content', 'docs', 'journal'),
  };
}

/** Find the project or fail with a clear error (used by every command). */
export function requireProject() {
  const root = findProjectRoot();
  if (!root) fail('not inside a Trellis project (no trellis.config.json found in any parent directory)');
  return projectPaths(root);
}

// ---- canonical slugs + link resolution (mirrors src/lib/links.ts) ----

export function canonical(id) {
  return id
    .replace(/\.(md|mdx)$/i, '')
    .replace(/(^|\/)index$/i, '$1')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
}

/** Resolve a markdown link href to a canonical slug, or null if external/non-page. */
export function hrefToCanonical(href, fromDir) {
  if (!href) return null;
  if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('#')) return null;
  const path = href.split('#')[0].split('?')[0];
  if (!path) return null;
  if (path.startsWith('/')) return canonical(path);
  const parts = fromDir ? fromDir.split('/') : [];
  for (const seg of path.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return canonical(parts.join('/'));
}

// ---- docs filesystem ----

/** Recursively list every .md/.mdx file under a directory (absolute paths). */
export async function walkDocs(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walkDocs(p)));
    else if (/\.(md|mdx)$/i.test(e.name)) out.push(p);
  }
  return out;
}

/** Canonical slug of a docs file given the docs root. */
export function fileCanonical(file, docsDir) {
  return canonical(relative(docsDir, file).split('\\').join('/'));
}

/** The directory portion of a canonical slug (for resolving relative links). */
export function canonicalDir(canon) {
  return canon.split('/').slice(0, -1).join('/');
}

// ---- frontmatter (round-trip via gray-matter; preserves unknown fields) ----

export async function readPage(file) {
  const g = matter(await readFile(file, 'utf8'));
  return { data: g.data, content: g.content };
}

export async function writePage(file, data, content) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, matter.stringify(content, data));
}

// ---- link rewriting (the core of page/section move; ADR 0012, Q3) ----

// Markdown links [text](href "title"), capturing the href. Images (![..]) excluded
// by the negative lookbehind.
const LINK_REWRITE_RE = /(?<!!)(\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;

/**
 * Rewrite link hrefs in a body. `mapFn(canonicalTarget, originalHref)` returns a
 * replacement href, or null/undefined to leave it unchanged.
 * @returns {{ body: string, count: number }}
 */
export function rewriteLinks(body, fromDir, mapFn) {
  let count = 0;
  const out = body.replace(LINK_REWRITE_RE, (m, open, href, close) => {
    const canon = hrefToCanonical(href, fromDir);
    if (canon === null) return m;
    const next = mapFn(canon, href);
    if (!next || next === href) return m;
    count++;
    return open + next + close;
  });
  return { body: out, count };
}

export { mkdir, rename, rm, readFile, writeFile, existsSync, join, dirname, relative };
