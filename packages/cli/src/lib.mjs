// Shared helpers for the thin Trellis CLI.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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

/** The @trellis/core bundled with this CLI (resolved via its main entry). */
export function bundledCoreDir() {
  const entry = fileURLToPath(import.meta.resolve('@trellis/core')); // …/core/src/index.mjs
  return dirname(dirname(entry));
}

/** The project's own installed @trellis/core, or null if not installed. */
export function projectCoreDir(root) {
  const p = join(root, 'node_modules', '@trellis', 'core');
  return existsSync(p) ? p : null;
}

/** Run a command inheriting stdio; returns the exit status (number). */
export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  return r.status ?? (r.error ? 1 : 0);
}

/** True if a command exists (e.g. git/node/npm). */
export function has(cmd) {
  const r = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
  return !r.error && (r.status === 0 || r.status === null);
}

/** Forward a toolkit/check command to the project-local core (or bundled fallback). */
export function passthrough(argv) {
  const root = findProjectRoot();
  const coreDir = (root && projectCoreDir(root)) || bundledCoreDir();
  const cli = join(coreDir, 'src', 'cli', 'index.mjs');
  const cwd = root || process.cwd();
  process.exit(run(process.execPath, [cli, ...argv], { cwd }));
}
