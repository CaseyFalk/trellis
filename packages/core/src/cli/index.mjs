#!/usr/bin/env node
// Trellis content-management toolkit dispatcher (ADR 0012, 0015).
// Always emits a single JSON object to stdout; exit code reflects success.
import { parseArgs, fail } from './lib/util.mjs';
import { pageNew, pageMove, pageRename, pageMerge, pageSet } from './commands/page.mjs';
import { sectionAdd, sectionRename, sectionMove } from './commands/section.mjs';
import { tagAdd, tagRename } from './commands/tag.mjs';
import { journalAdd } from './commands/journal.mjs';
import { configGet, configSet } from './commands/config.mjs';
import { check } from './commands/check.mjs';

const TWO_WORD = {
  'page new': pageNew,
  'page move': pageMove,
  'page rename': pageRename,
  'page merge': pageMerge,
  'page set': pageSet,
  'section add': sectionAdd,
  'section rename': sectionRename,
  'section move': sectionMove,
  'tag add': tagAdd,
  'tag rename': tagRename,
  'journal add': journalAdd,
  'config get': configGet,
  'config set': configSet,
};
const ONE_WORD = { check };

const argv = process.argv.slice(2);

let handler;
let rest;
if (ONE_WORD[argv[0]]) {
  handler = ONE_WORD[argv[0]];
  rest = parseArgs(argv.slice(1));
} else {
  handler = TWO_WORD[`${argv[0]} ${argv[1]}`];
  rest = parseArgs(argv.slice(2));
}

if (!handler) {
  fail(`unknown command: ${argv.join(' ') || '(none)'}`, {
    commands: [...Object.keys(TWO_WORD), ...Object.keys(ONE_WORD)],
  });
}

handler(rest).catch((e) => fail(e?.message || String(e)));
