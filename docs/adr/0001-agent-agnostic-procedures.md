# Agent-agnostic markdown procedures, with thin Claude Code wrappers

Trellis must run under any capable coding agent, not just Claude Code. We
therefore author both the scaffolder and the generated capture loop as plain
**markdown procedures** (the portable substrate any agent can follow), and
provide Claude Code `/skill` wrappers that merely point at those procedures as a
convenience. Purely mechanical steps (copy, `npm install`, `git init`, verify)
live in a small deterministic script the procedure invokes — no LLM client of our
own. The generated project's canonical operating manual is `AGENTS.md`, with
`CLAUDE.md` as a one-line pointer to it (two doorways, one source of truth).

We rejected a Claude-native-only skill (fails agent-agnosticism) and an
`npm create trellis` initializer that calls an LLM itself (would force us to own
an LLM client, provider abstraction, key handling, and prompt maintenance —
rebuilding the agent we already have). The accepted cost: invocation is not
one-click outside Claude Code — you hand the agent the procedure file.
