// `trellis tag` commands: add · rename
import { ok, fail, requireProject, walkDocs, readPage, writePage, readFile, writeFile, existsSync } from '../lib/util.mjs';

const TAG_LINE_RE = /^-\s*`([^`]+)`/;

async function readTaxonomyTags(taxonomyPath) {
  if (!existsSync(taxonomyPath)) return { text: '', tags: [] };
  const text = await readFile(taxonomyPath, 'utf8');
  const tags = [];
  for (const line of text.split('\n')) {
    const m = line.match(TAG_LINE_RE);
    if (m) tags.push(m[1].trim());
  }
  return { text, tags };
}

export async function tagAdd({ pos, opts }) {
  const { taxonomyPath } = requireProject();
  const tag = (pos[0] || '').trim();
  if (!tag) return fail('usage: tag add <tag> [--gloss "…"]');
  const { text, tags } = await readTaxonomyTags(taxonomyPath);
  if (tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) {
    return ok({ action: 'tag add', tag, added: false, note: 'already in taxonomy' });
  }
  const gloss = opts.gloss && opts.gloss !== true ? ` — ${opts.gloss}` : '';
  const line = `- \`${tag}\`${gloss}`;
  // Append under a "## Tags" heading if present, else at end.
  let next;
  if (/^##\s+Tags\s*$/m.test(text)) {
    next = text.replace(/(^##\s+Tags\s*$)/m, `$1\n${line}`);
  } else {
    next = text.replace(/\s*$/, '') + `\n\n## Tags\n${line}\n`;
  }
  await writeFile(taxonomyPath, next);
  return ok({ action: 'tag add', tag, added: true });
}

export async function tagRename({ pos }) {
  const { docsDir, taxonomyPath } = requireProject();
  const oldTag = (pos[0] || '').trim();
  const newTag = (pos[1] || '').trim();
  if (!oldTag || !newTag) return fail('usage: tag rename <old> <new>');

  // Rewrite the tag across every page's frontmatter.
  let pagesChanged = 0;
  for (const file of await walkDocs(docsDir)) {
    const { data, content } = await readPage(file);
    if (Array.isArray(data.tags) && data.tags.includes(oldTag)) {
      data.tags = [...new Set(data.tags.map((t) => (t === oldTag ? newTag : t)))];
      await writePage(file, data, content);
      pagesChanged++;
    }
  }

  // Rewrite the taxonomy entry.
  let taxonomyChanged = false;
  if (existsSync(taxonomyPath)) {
    const text = await readFile(taxonomyPath, 'utf8');
    const next = text.replace(new RegExp('(^-\\s*`)' + oldTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(`)', 'm'), `$1${newTag}$2`);
    if (next !== text) { await writeFile(taxonomyPath, next); taxonomyChanged = true; }
  }
  return ok({ action: 'tag rename', from: oldTag, to: newTag, pagesChanged, taxonomyChanged });
}
