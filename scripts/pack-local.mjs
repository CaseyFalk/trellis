// Build local installable tarballs for the private phase (see docs/REMAINING-WORK.md).
// Temporarily wires the template + CLI `@trellis/core` dep to the local core tarball
// (file:), packs both, then restores the source deps. Run: `npm run pack:local`.
//
// When the repo goes public, switch to release-URL tarballs instead (gh release).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const coreVer = JSON.parse(readFileSync(join(root, 'packages/core/package.json'))).version;
const cliVer = JSON.parse(readFileSync(join(root, 'packages/cli/package.json'))).version;
const coreTgz = join(dist, `trellis-core-${coreVer}.tgz`);

const tpl = join(root, 'packages/core/template/package.json');
const cli = join(root, 'packages/cli/package.json');
const origTpl = readFileSync(tpl, 'utf8');
const origCli = readFileSync(cli, 'utf8');

const setDep = (p, spec) => {
  const j = JSON.parse(readFileSync(p, 'utf8'));
  j.dependencies['@trellis/core'] = spec;
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
};
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: root });
  if (r.status) throw new Error(`${cmd} ${args.join(' ')} failed`);
};

try {
  setDep(tpl, `file:${coreTgz}`);
  setDep(cli, `file:${coreTgz}`);
  run('npm', ['pack', '-w', '@trellis/core', '--pack-destination', dist]);
  run('npm', ['pack', '-w', 'trellis', '--pack-destination', dist]);
} finally {
  writeFileSync(tpl, origTpl);
  writeFileSync(cli, origCli);
}

console.log(`\n✓ Tarballs in ${dist}`);
console.log(`  Install globally:  npm i -g ${join(dist, `trellis-${cliVer}.tgz`)}`);
console.log(`  Keep dist/ in place — the template/CLI reference the core tarball by absolute path.`);
