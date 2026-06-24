# Manual Test / Dogfood Guide (Phase 7)

How to exercise the whole framework by hand, from source (distribution isn't
published yet — see [REMAINING-WORK.md](REMAINING-WORK.md)).

## One-time shell setup

```sh
# Make `trellis` runnable, and point new projects at your local core checkout.
alias trellis='node /Users/caseyfalkowski/Documents/projects/Trellis/packages/cli/src/index.mjs'
export TRELLIS_CORE_SPEC="file:/Users/caseyfalkowski/Documents/projects/Trellis/packages/core"

trellis            # sanity: prints help
```

Add both lines to `~/.zshrc` to persist. (Alternative to the alias:
`npm link --workspace trellis` from the repo root.)

## Create and grow a project

```sh
cd ~/Documents/projects
trellis new my-focus "Learn X — the parts I care about and why."
cd my-focus
claude             # or open the folder in any agent
```

In the agent session:

1. It offers to **tailor** (because `trellis.config.json` has `"tailored": false`) —
   say yes (or `/trellis-tailor`); approve the Reference cuts + starter tags.
2. **Ask questions** about your focus.
3. When something settles, it offers to **capture** (or `/capture`) — approve the
   plan. Repeat across a concept, a how-to, and a gotcha to exercise routing.

## See it + validate

```sh
npm run dev        # browse http://localhost:4321
trellis check      # {"ok":true,...}
npm run build
```

## Test an update

```sh
git add -A && git commit -m "captured learning"   # update needs a clean tree
trellis update     # bump → re-sync → migrations (none at v0) → re-validate → commit
```

## Acceptance checklist

- **Tailoring:** Reference cuts appear in nav; `taxonomy.md` seeded; `tailored` → true.
- **Capture:** facts land in the right register, behind the approval gate; nothing
  written without confirmation.
- **Knowledge web:** captured page shows maturity badge, "Sources", "Referenced by";
  Concept Map renders; search works; glossary tooltips on hover; Mermaid renders.
- **Integrity:** `trellis check` green; `npm run build` clean.
- **Update:** content untouched, framework files refreshed, version stamped.

## Direct toolkit (optional)

Everything the agent calls, you can call too (JSON output):

```sh
trellis page new concepts/foo --title "Foo" --tags mytag
trellis tag add mytag --gloss "what it groups"
trellis journal add --title "Notes" --summary "…" --captured concepts/foo
trellis config get
```
