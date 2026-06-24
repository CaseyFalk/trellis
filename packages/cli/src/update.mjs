// `trellis update` — orchestrate the stable part (read version, bump, install),
// then delegate re-sync + migrations to the freshly-installed project core
// (ADR 0003, 0011). Git is the safety net: clean tree required, commit after.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { findProjectRoot, projectCoreDir, run } from './lib.mjs';

function gitDirty(root) {
  const r = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  return r.status === 0 && r.stdout.trim().length > 0;
}

function prompt(q) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`${q} [y/N] `, (a) => { rl.close(); res(/^y/i.test(a.trim())); });
  });
}

export async function updateCmd() {
  const root = findProjectRoot();
  if (!root) throw new Error('not inside a Trellis project (no trellis.config.json found)');

  if (gitDirty(root)) throw new Error('working tree is dirty — commit or stash changes first (update overwrites framework-managed files)');

  const cfgPath = join(root, 'trellis.config.json');
  const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
  const fromVersion = cfg.trellisVersion ?? '0.0.0';

  // ---- bump + install ----
  if (process.env.TRELLIS_CORE_SPEC) {
    const pkgPath = join(root, 'package.json');
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    pkg.dependencies['@trellis/core'] = process.env.TRELLIS_CORE_SPEC;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
  console.log('Updating @trellis/core …');
  const pkgNow = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const coreSpec = pkgNow.dependencies?.['@trellis/core'] || '';
  const needsLinks = coreSpec.startsWith('file:') && !coreSpec.endsWith('.tgz');
  const installArgs = needsLinks ? ['install', '--install-links'] : ['install'];
  if (run('npm', installArgs, { cwd: root }) !== 0) throw new Error('npm install failed');

  const core = projectCoreDir(root);
  if (!core) throw new Error('@trellis/core is not installed after npm install');
  const toVersion = JSON.parse(await readFile(join(core, 'package.json'), 'utf8')).version;

  // ---- delegate re-sync + migrations to the (target) project core ----
  const { applyUpdate } = await import(pathToFileURL(join(core, 'src', 'update.mjs')).href);
  const { resynced, migrationsRun } = await applyUpdate({
    projectRoot: root, packageDir: core, fromVersion, toVersion, ctx: { prompt },
  });

  // ---- stamp version + validate ----
  cfg.trellisVersion = toVersion;
  await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
  const checkCli = join(core, 'src', 'cli', 'index.mjs');
  run(process.execPath, [checkCli, 'check'], { cwd: root, stdio: 'ignore' });

  // ---- commit (git is the undo net) ----
  run('git', ['add', '-A'], { cwd: root });
  spawnSync('git', ['commit', '-q', '-m', `trellis update ${fromVersion} → ${toVersion}`], { cwd: root, stdio: 'ignore' });

  console.log(`
✓ Updated ${fromVersion} → ${toVersion}
  re-synced: ${resynced.length} framework file(s)
  migrations: ${migrationsRun.length ? migrationsRun.join(', ') : 'none'}`);
}
