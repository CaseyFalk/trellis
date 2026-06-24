# Operating Manual

This folder is a **Trellis** learning project: a living knowledge base where your
Q&A sessions drive the content. Markdown is the single source of truth; an Astro +
Starlight site renders it. This file is the canonical operating manual for *any*
agent. (Claude Code also reads `CLAUDE.md`, which just points here.)

This file holds **only project-specific (tailored) content**. The reusable rules —
the register contract, the routing test, the frontmatter schema, the journal
format, and how to behave — live in [`docs/conventions.md`](docs/conventions.md),
which is framework-managed and updated by `trellis update`. Read it.

---

## First action: tailoring

If `trellis.config.json` has `"tailored": false`, **proactively offer to run the
tailoring procedure** ([`tailor.md`](tailor.md)) before doing substantive work, and
don't begin capturing knowledge until tailoring is done or the user declines. (In
Claude Code: `/trellis-tailor`. Other agents: follow `tailor.md`.)

## Focus

<!-- Set by `trellis new` from your focus prompt; refined during tailoring. -->
**This project's focus:** _(not yet set — run tailoring)_

Only knowledge within the focus is captured. Borderline material is flagged for
confirmation, never silently filed. Meta-conversation about the tooling itself is
out of focus.

## Sections

<!-- The Reference cut + labels are set during tailoring. -->
Fixed registers: **Concepts**, **Guides**, **Reference** (with Glossary), and
**Troubleshooting**, plus the **Journal**. See `docs/conventions.md` for the
register contract and the routing test.

## How to behave

- **Ground everything; don't trust parametric knowledge.** Base claims on what was
  established this session or a cited source; mark unverified claims `seedling`.
- **Stay KB-aware.** Before answering, recall what's already documented; cross-link
  related material and surface contradictions for reconciliation.
- **Proactively offer to capture** when an exchange settles into something worth
  keeping: "Want me to capture this?" (Claude Code: `/capture`; other agents:
  follow [`docs/capture.md`](docs/capture.md).)
- **Use the tools for mechanics.** Create pages, move/rename them, add sections,
  tags, and journal entries via the `trellis` tools — never hand-edit frontmatter,
  timestamps, links, or `trellis.config` (see `docs/conventions.md`).

## The learning profile

How you learn is recorded in the shared profile at `~/.trellis/learning-profile.md`
(domain-agnostic, shared across all your Trellis projects). Read it to tune answers.
It grows through use — but propose any change and write it only on confirmation, and
never put domain knowledge there.

## Using another agent

This project is agent-agnostic. Any capable coding agent can drive it: read this
file, then follow `tailor.md` / `docs/capture.md` by instruction. The `.claude/`
skills are just Claude Code convenience wrappers around those same procedures.
