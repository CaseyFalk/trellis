// `trellis journal add` — cohesive provenance (ADR Q4): stamp the date, create the
// dated entry with a Captured list, AND wire each captured page's `sources` back to
// it, in one atomic call. Title + summary are agent prose (args); the rest is mechanical.
import { ok, fail, list, requireProject, canonical, readPage, writePage, existsSync, join } from '../lib/util.mjs';

function resolveFile(docsDir, canon) {
  for (const c of [
    join(docsDir, canon + '.md'),
    join(docsDir, canon + '.mdx'),
    join(docsDir, canon, 'index.md'),
    join(docsDir, canon, 'index.mdx'),
  ]) if (existsSync(c)) return c;
  return null;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function journalAdd({ opts }) {
  const { docsDir, journalDir } = requireProject();
  if (!opts.title || opts.title === true) return fail('usage: journal add --title "…" --summary "…" --captured a/b,c/d');
  const summary = opts.summary && opts.summary !== true ? opts.summary : '';
  const captured = list(opts.captured);

  const date = new Date().toISOString().slice(0, 10);
  const slug = opts.slug && opts.slug !== true ? slugify(opts.slug) : slugify(opts.title);
  const entrySlug = `${date}-${slug}`;
  const file = join(journalDir, `${entrySlug}.md`);
  if (existsSync(file)) return fail(`journal entry already exists: ${entrySlug}`);

  // Resolve captured pages → build the Captured list with absolute links.
  const lines = [];
  const wired = [];
  const missing = [];
  for (const c of captured) {
    const canon = canonical(c);
    const pf = resolveFile(docsDir, canon);
    if (!pf) { missing.push(canon); continue; }
    const { data } = await readPage(pf);
    lines.push(`- [${data.title ?? canon}](/${canon}/)`);
    wired.push({ canon, file: pf });
  }
  if (missing.length) return fail('captured page(s) not found', { missing });

  const body = `${summary}${summary ? '\n\n' : ''}## Captured\n\n${lines.join('\n')}\n`;
  // No `lastUpdated` — it's git-derived per conventions, and a hand-written date
  // string fails Starlight's date schema. The date lives in the slug + title.
  await writePage(file, { title: `${date} — ${opts.title}` }, body);

  // Wire each captured page's `sources` back to this entry.
  for (const { canon, file: pf } of wired) {
    const { data, content } = await readPage(pf);
    data.sources = [...new Set([...(data.sources ?? []), entrySlug])];
    await writePage(pf, data, content);
  }

  return ok({ action: 'journal add', entry: `journal/${entrySlug}`, file, captured: wired.map((w) => w.canon) });
}
