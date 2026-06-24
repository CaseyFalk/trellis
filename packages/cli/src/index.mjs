#!/usr/bin/env node
// Thin Trellis CLI (ADR 0011): `new` (bootstrap from bundled core) and `update`
// (orchestrate + delegate to project core); everything else passes through to the
// project-local core toolkit (version-correct).
import { newCmd } from './new.mjs';
import { updateCmd } from './update.mjs';
import { passthrough } from './lib.mjs';

const PASSTHROUGH = new Set(['page', 'section', 'tag', 'journal', 'config', 'check']);

const argv = process.argv.slice(2);
const cmd = argv[0];

if (cmd === 'new') {
  newCmd(argv.slice(1)).catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
} else if (cmd === 'update') {
  updateCmd(argv.slice(1)).catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
} else if (PASSTHROUGH.has(cmd)) {
  passthrough(argv);
} else {
  console.log(`trellis — scaffold and grow learning projects

Usage:
  trellis new <name> "<focus>"   Scaffold a new learning project
  trellis update                 Update this project to the latest framework version
  trellis check                  Validate the knowledge base
  trellis page|section|tag|journal|config …   Content-management tools (agent-facing)

Setup:  brew install trellis      Update:  brew upgrade trellis`);
  process.exit(cmd ? 1 : 0);
}
