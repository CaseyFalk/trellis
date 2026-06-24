// `trellis run` — start the project's dev server (Astro), which serves the knowledge
// base AND hot-reloads as you capture (content changes are watched). One command
// instead of remembering `npm run dev`. Extra args pass through, e.g.
// `trellis run -- --port 4322`.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { findProjectRoot, run } from './lib.mjs';

export async function runCmd(args) {
  const root = findProjectRoot();
  if (!root) throw new Error('not inside a Trellis project (run this from your project folder)');

  if (!existsSync(join(root, 'node_modules'))) {
    console.log('Installing dependencies (first run) …');
    if (run('npm', ['install'], { cwd: root }) !== 0) throw new Error('npm install failed');
  }

  console.log('Starting the dev server (Ctrl+C to stop).');
  console.log('Your knowledge base hot-reloads as you capture — keep this open beside your agent.\n');
  // Accept both `trellis run --port X` and `trellis run -- --port X`.
  const passArgs = args[0] === '--' ? args.slice(1) : args;
  const devArgs = ['run', 'dev', ...(passArgs.length ? ['--', ...passArgs] : [])];
  process.exit(run('npm', devArgs, { cwd: root }));
}
