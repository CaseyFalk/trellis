# Scaffolding is a global `trellis new` CLI with deferred first-session tailoring

> **Note:** the "one package, two install modes" framing below is superseded by
> ADR 0011 (thin Homebrew CLI + versioned npm-consumable `@trellis/core`). The
> `trellis new` + deferred-tailoring + two-step-handoff decisions stand.

Trellis is installed once (globally) and scaffolds projects from anywhere via
`trellis new <name> "<focus>"`, rather than being cloned per project. One package
serves two install modes: installed globally it provides `trellis new` (and
bundles the template); installed as a project dependency it provides the Starlight
plugin plus in-project `trellis check` / `trellis update`.

`trellis new` is **deterministic and calls no LLM**: create dir → copy bundled
template → write the focus into `AGENTS.md` → `npm install` → copy `conventions.md`
from the installed package → `git init` + first commit → verify. The result is an
immediately usable project on the default register structure. The **intelligent
tailoring** (per-domain section naming, seeded taxonomy, learning-profile draft)
is deferred to the **first agent session** via a portable `tailor.md` procedure
(Claude `/trellis-tailor` wrapper), behind an approval gate — keeping the
deterministic/intelligent split and agent-agnosticism of ADR 0001 intact.

Handoff is **two-step**: `trellis new` finishes and points the user to open the
folder in their agent, which offers to tailor. We rejected auto-launching the
agent (the CLI would have to know how to invoke each agent; interactive handoff is
fiddly). This **supersedes the in-place clone + graduation** model — no throwaway
clone, no graduation. Consequence: the two-step flow must be well documented — in
the Trellis README, in `trellis new`'s closing message, and in the generated
project's README.
