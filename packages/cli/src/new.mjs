// `trellis new <name> "<focus>"` — deterministic scaffold (ADR 0004). No LLM;
// intelligent tailoring is deferred to the first agent session.
import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { bundledCoreDir, projectCoreDir, run, has } from './lib.mjs';

function humanize(name) {
  return name.split(/[-_]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

async function isEmptyDir(dir) {
  try { return (await readdir(dir)).length === 0; } catch { return true; }
}

export async function newCmd(args) {
  const pos = args.filter((a) => !a.startsWith('--'));
  const noInstall = args.includes('--no-install');
  const [name, focus] = pos;

  // ---- preflight (fail before touching disk; ADR Q20-A) ----
  if (!name || !focus) throw new Error('usage: trellis new <name> "<focus prompt>"');
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) throw new Error(`invalid project name "${name}" (use letters, digits, - _ .)`);
  const projectDir = resolve(process.cwd(), name);
  if (existsSync(projectDir) && !(await isEmptyDir(projectDir))) throw new Error(`"${name}" already exists and is not empty`);
  if (!has('git')) throw new Error('git is required (it is the update safety net) — install it and retry');
  if (!noInstall && !has('npm')) throw new Error('npm is required to install dependencies (or pass --no-install)');

  const coreDir = bundledCoreDir();
  const template = join(coreDir, 'template');
  const procedures = join(coreDir, 'procedures');
  if (!existsSync(template)) throw new Error(`bundled template not found at ${template}`);

  console.log(`Scaffolding "${name}" …`);

  // ---- copy template + procedures ----
  await mkdir(projectDir, { recursive: true });
  await cp(template, projectDir, { recursive: true });
  await mkdir(join(projectDir, 'docs'), { recursive: true });
  await cp(join(procedures, 'conventions.md'), join(projectDir, 'docs', 'conventions.md'));
  await cp(join(procedures, 'capture.md'), join(projectDir, 'docs', 'capture.md'));
  await cp(join(procedures, 'tailor.md'), join(projectDir, 'tailor.md'));

  // ---- tailor the deterministic bits ----
  const pkgPath = join(projectDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  pkg.name = name.toLowerCase();
  if (process.env.TRELLIS_CORE_SPEC) pkg.dependencies['@trellis/core'] = process.env.TRELLIS_CORE_SPEC;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  const cfgPath = join(projectDir, 'trellis.config.json');
  const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
  cfg.title = humanize(name);
  cfg.description = focus;
  await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + '\n');

  const agentsPath = join(projectDir, 'AGENTS.md');
  const agents = await readFile(agentsPath, 'utf8');
  await writeFile(agentsPath, agents.replace(/\*\*This project's focus:\*\* _\(not yet set — run tailoring\)_/, `**This project's focus:** ${focus}`));

  // ---- ensure the shared learning profile exists (ADR 0009) ----
  const trellisHome = process.env.TRELLIS_HOME || join(homedir(), '.trellis');
  const profilePath = join(trellisHome, 'learning-profile.md');
  if (!existsSync(profilePath)) {
    await mkdir(trellisHome, { recursive: true });
    await writeFile(profilePath, `# Learning Profile

How I learn — domain-agnostic, shared across all my Trellis projects. Grows through
use (an agent proposes additions and writes them only on confirmation). Never holds
domain knowledge.

- _(seeded during first-session tailoring)_
`);
    console.log(`Seeded shared learning profile at ${profilePath}`);
  }

  // ---- install (before the commit, so package-lock.json is captured) ----
  let installed = false;
  if (!noInstall) {
    console.log('Installing dependencies …');
    // A file: core spec (dev/forks) must be copied, not symlinked, or its peer
    // deps resolve to the wrong tree and the build fails.
    const coreSpec = pkg.dependencies['@trellis/core'] || '';
    // Only a file: *directory* dep needs --install-links (to copy, not symlink);
    // a file: *.tgz tarball is already extracted, and URLs/registry deps are copied.
    const needsLinks = coreSpec.startsWith('file:') && !coreSpec.endsWith('.tgz');
    const installArgs = needsLinks ? ['install', '--install-links'] : ['install'];
    if (run('npm', installArgs, { cwd: projectDir }) !== 0) {
      console.error(`\n✗ npm install failed. The project is scaffolded at ${projectDir}.`);
      console.error(`  Fix connectivity / the @trellis/core spec, then run:  cd ${name} && npm install`);
      process.exit(1);
    }
    installed = true;
  }

  // ---- git init + first commit (.gitignore keeps node_modules/dist out) ----
  run('git', ['init', '-q'], { cwd: projectDir });
  run('git', ['add', '-A'], { cwd: projectDir });
  run('git', ['commit', '-q', '-m', 'Initial Trellis project'], { cwd: projectDir, stdio: 'ignore' });

  // check works without install (pure Node); build only if installed.
  const checkCli = join((installed && projectCoreDir(projectDir)) || coreDir, 'src', 'cli', 'index.mjs');
  console.log('Validating …');
  run(process.execPath, [checkCli, 'check'], { cwd: projectDir, stdio: 'ignore' });
  if (installed) run('npm', ['run', 'build'], { cwd: projectDir, stdio: 'ignore' });

  // ---- next steps ----
  console.log(`
✓ Created ${name}/

Next:
  cd ${name}
  ${installed ? '' : 'npm install\n  '}# open the folder in your agent — it will offer to tailor this project to your focus,
  # then you can start asking questions and capturing what you learn.`);
}
