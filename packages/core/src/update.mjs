// Update logic owned by @trellis/core (the target version), invoked by the thin CLI
// after it bumps the dependency (ADR 0003, 0011). Re-syncs framework-managed files
// and runs version-to-version migrations.
import { readdir, mkdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Framework-managed files (ADR 0006 manifest): `dest` (path in the project) is
 * overwritten from `src` (path in this package) on every update. User-owned files
 * (content, trellis.config.json, AGENTS.md, taxonomy.md, README.md) are never here.
 */
export const FRAMEWORK_MANAGED = [
  { dest: 'astro.config.mjs', src: 'template/astro.config.mjs' },
  { dest: 'src/content.config.ts', src: 'template/src/content.config.ts' },
  { dest: '.claude/skills/capture/SKILL.md', src: 'template/.claude/skills/capture/SKILL.md' },
  { dest: '.claude/skills/trellis-tailor/SKILL.md', src: 'template/.claude/skills/trellis-tailor/SKILL.md' },
  { dest: 'docs/conventions.md', src: 'procedures/conventions.md' },
  { dest: 'docs/capture.md', src: 'procedures/capture.md' },
  { dest: 'tailor.md', src: 'procedures/tailor.md' },
];

/** Copy the framework-managed files from this package into the project. */
export async function resyncManaged(projectRoot, packageDir) {
  const done = [];
  for (const { dest, src } of FRAMEWORK_MANAGED) {
    const from = join(packageDir, src);
    if (!existsSync(from)) continue;
    const to = join(projectRoot, dest);
    await mkdir(dirname(to), { recursive: true });
    await cp(from, to);
    done.push(dest);
  }
  return done;
}

/** Compare dotted numeric versions (e.g. "0.2.1"). */
export function cmpVersion(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

/**
 * Run migration modules in `migrations/` whose version is in (fromVersion, toVersion],
 * in semver order. Each module exports `async up(ctx)`; destructive steps must
 * `await ctx.prompt(...)` first. Ships empty at v0 — the mechanism exists so future
 * structural changes have a home (ADR 0003).
 */
export async function runMigrations(projectRoot, packageDir, fromVersion, toVersion, ctx = {}) {
  const dir = join(packageDir, 'migrations');
  if (!existsSync(dir)) return [];
  const entries = (await readdir(dir)).filter((f) => /^\d[\w.-]*\.mjs$/.test(f));
  const applicable = entries
    .map((f) => ({ f, v: f.replace(/\.mjs$/, '') }))
    .filter(({ v }) => cmpVersion(v, fromVersion) > 0 && cmpVersion(v, toVersion) <= 0)
    .sort((a, b) => cmpVersion(a.v, b.v));
  const ran = [];
  for (const { f, v } of applicable) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    await mod.up({ projectRoot, version: v, log: (m) => process.stderr.write(`  migrate ${v}: ${m}\n`), ...ctx });
    ran.push(v);
  }
  return ran;
}

/** Re-sync framework-managed files, then run applicable migrations. */
export async function applyUpdate({ projectRoot, packageDir, fromVersion, toVersion, ctx = {} }) {
  const resynced = await resyncManaged(projectRoot, packageDir);
  const migrationsRun = await runMigrations(projectRoot, packageDir, fromVersion, toVersion, ctx);
  return { resynced, migrationsRun };
}
