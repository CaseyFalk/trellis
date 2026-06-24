// `trellis section` commands: add · rename · move
import {
  ok, fail, requireProject,
  canonical, canonicalDir, fileCanonical, walkDocs, readPage, writePage, rewriteLinks,
  existsSync, join, rename,
} from '../lib/util.mjs';

const REGISTERS = ['concepts', 'guides', 'reference', 'troubleshooting'];

function titleCase(slug) {
  return slug.split(/[-_/]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

/** Create a sub-section directory under a register, with an intro index page. */
export async function sectionAdd({ pos, opts }) {
  const { docsDir } = requireProject();
  const canon = canonical(pos[0] || '');
  if (!canon || !canon.includes('/')) return fail('usage: section add <register>/<name> [--label "…"] [--description "…"]');
  const top = canon.split('/')[0];
  if (!REGISTERS.includes(top)) return fail(`sub-sections live under a fixed register (${REGISTERS.join(' / ')}); got "${top}"`);
  if (existsSync(join(docsDir, canon))) return fail(`section already exists: ${canon}`);
  const label = opts.label && opts.label !== true ? opts.label : titleCase(canon.split('/').pop());
  const data = { title: label };
  if (opts.description && opts.description !== true) data.description = opts.description;
  const file = join(docsDir, canon, 'index.md');
  await writePage(file, data, `\n`);
  return ok({ action: 'section add', section: canon, label, file });
}

/** Move/rename a section directory and rewrite all links under its prefix. */
async function moveSection(fromCanon, toCanon) {
  const { docsDir } = requireProject();
  if (!fromCanon || !toCanon) return fail('usage: section move <from> <to>');
  if (REGISTERS.includes(fromCanon) || fromCanon === 'journal') return fail(`cannot move a top-level register (${fromCanon}) — registers are fixed (ADR 0005)`);
  const fromDirAbs = join(docsDir, fromCanon);
  if (!existsSync(fromDirAbs)) return fail(`section not found: ${fromCanon}`);
  if (existsSync(join(docsDir, toCanon))) return fail(`destination already exists: ${toCanon}`);

  // Move every file under the section, preserving its sub-path.
  const files = (await walkDocs(fromDirAbs));
  const { mkdir } = await import('node:fs/promises');
  let moved = 0;
  for (const file of files) {
    const rel = file.slice(fromDirAbs.length); // includes leading sep
    const dest = join(docsDir, toCanon) + rel;
    await mkdir(join(dest, '..'), { recursive: true });
    await rename(file, dest);
    moved++;
  }

  // Rewrite inbound links: anything resolving into the old prefix → new prefix.
  let inbound = 0;
  for (const file of await walkDocs(docsDir)) {
    const { data, content } = await readPage(file);
    const fromDir = canonicalDir(fileCanonical(file, docsDir));
    const r = rewriteLinks(content, fromDir, (canon) => {
      if (canon === fromCanon) return `/${toCanon}/`;
      if (canon.startsWith(fromCanon + '/')) return `/${toCanon}${canon.slice(fromCanon.length)}/`;
      return null;
    });
    if (r.count) { await writePage(file, data, r.body); inbound += r.count; }
  }
  return ok({ action: 'section move', from: fromCanon, to: toCanon, filesMoved: moved, inboundLinksRewritten: inbound });
}

export async function sectionMove({ pos }) {
  return moveSection(canonical(pos[0] || ''), canonical(pos[1] || ''));
}

export async function sectionRename({ pos }) {
  const fromCanon = canonical(pos[0] || '');
  const newName = pos[1];
  if (!fromCanon || !newName) return fail('usage: section rename <register>/<name> <new-name>');
  const dir = canonicalDir(fromCanon);
  const toCanon = dir ? `${dir}/${canonical(newName)}` : canonical(newName);
  return moveSection(fromCanon, toCanon);
}
