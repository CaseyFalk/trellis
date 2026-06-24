// Build release tarballs whose @trellis/core dep is the public GitHub release URL
// (works on any machine once the repo is public). Run: `npm run pack:release`,
// then: `gh release create v<core> dist/*.tgz`.
//
// The template default is left pointing at the release URL (committed); the CLI's
// workspace dep is restored to `*` for monorepo dev.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OWNER = 'CaseyFalk';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const coreVer = JSON.parse(readFileSync(join(root, 'packages/core/package.json'))).version;
const cliVer = JSON.parse(readFileSync(join(root, 'packages/cli/package.json'))).version;
const coreUrl = `https://github.com/${OWNER}/trellis/releases/download/v${coreVer}/trellis-core-${coreVer}.tgz`;
const cliUrl = `https://github.com/${OWNER}/trellis/releases/download/v${cliVer}/trellis-${cliVer}.tgz`;

const tpl = join(root, 'packages/core/template/package.json');
const cli = join(root, 'packages/cli/package.json');
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

setDep(tpl, coreUrl); // template tracks the release URL (committed)
setDep(cli, coreUrl);
try {
  run('npm', ['pack', '-w', '@trellis/core', '--pack-destination', dist]);
  run('npm', ['pack', '-w', 'trellis', '--pack-destination', dist]);
} finally {
  writeFileSync(cli, origCli); // restore CLI workspace dep to "*"
}

console.log(`\n✓ Release tarballs in ${dist}`);
console.log(`  1) gh release create v${coreVer} dist/trellis-core-${coreVer}.tgz dist/trellis-${cliVer}.tgz`);
console.log(`  2) npm i -g ${cliUrl}`);
