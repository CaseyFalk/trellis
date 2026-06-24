# Trellis

**A meta-tool for learning anything.** Give it a short focus prompt and it
scaffolds a ready-to-run learning project: you drop an AI coding agent into the
folder, ask questions, and as your understanding settles the agent **captures** it
into a living, navigable knowledge base — structured along the
[Diátaxis](https://diataxis.fr/) documentation framework and built on Astro +
Starlight.

The name says it: a *trellis* is the structure a climbing plant grows along.
Trellis provides the structure (the Diátaxis registers, the capture workflow); your
knowledge grows up it.

> Status: functionally complete and installable from GitHub Releases. The only
> remaining nicety is a Homebrew **tap** for the `brew install CaseyFalk/trellis`
> shorthand — see [docs/REMAINING-WORK.md](docs/REMAINING-WORK.md).

## What you get

`trellis new my-focus "<what you want to learn>"` produces a self-contained project:

- An **operating manual** (`AGENTS.md`, with `CLAUDE.md` pointing to it) carrying
  your focus, plus framework `docs/conventions.md` (the register contract, routing
  test, frontmatter schema, and the tool reference).
- A **capture** procedure (`docs/capture.md`) and a one-shot first-session
  **tailor** procedure (`tailor.md`) — plain markdown, runnable by any agent;
  Claude Code also gets `/capture` and `/trellis-tailor` skill wrappers.
- A **scaffolded Astro + Starlight site**: the fixed registers (Concepts, Guides,
  Reference + Glossary, Troubleshooting, Journal), full-text search, a Mermaid
  pipeline, glossary tooltips, automatic backlinks, and an interactive concept graph.
- A **content-management toolkit** (`trellis page/section/tag/journal/config/check`)
  the agent calls so mechanics (frontmatter, dates, link-rewriting, provenance) are
  deterministic even for weaker models.
- A **controlled tag vocabulary** (`taxonomy.md`) and initialized **git**.

The lifecycle:

```
trellis new <name> "<focus>"   →  open in your agent  →  it offers to tailor
ask questions  →  "capture this"  →  pages file themselves, cross-linked
brew upgrade trellis  →  trellis update   (non-destructive framework upgrades)
```

## Install

### From the GitHub release (recommended)

```sh
npm i -g https://github.com/CaseyFalk/trellis/releases/download/v0.1.0/trellis-0.1.0.tgz
trellis new async-rust "Learn async Rust — futures, tokio."
```

Works on any machine — `trellis new` pulls `@trellis/core` from the same release.

### Homebrew

```sh
brew install --formula ./Formula/trellis.rb          # works now (from a clone)
# brew install CaseyFalk/trellis/trellis             # after the tap is published
```

The `brew install CaseyFalk/trellis/trellis` shorthand needs a one-time tap repo —
see [docs/REMAINING-WORK.md](docs/REMAINING-WORK.md). Formula:
[`Formula/trellis.rb`](Formula/trellis.rb).

### From source (development)

```sh
git clone https://github.com/CaseyFalk/trellis && cd trellis && npm install
npm link --workspace trellis
export TRELLIS_CORE_SPEC="file:$(pwd)/packages/core"   # resolve core from the checkout
```

## Updating a project

```sh
brew upgrade trellis        # (or: git pull in your clone) — updates the tool
cd my-project && trellis update
```

`trellis update` bumps `@trellis/core`, re-syncs framework-managed files, runs any
version migrations (prompting before destructive steps), and re-validates. It is
non-destructive to your content; git is the safety net (a clean tree is required and
the update is committed).

## Seeding from existing notes

There's no separate import. After `trellis new`, drop your notes into the folder and
ask the agent to capture them — the same capture loop decomposes, routes, and files
them behind its approval gate.

## Repo layout

```
packages/core/   @trellis/core — the Starlight wrapper, content schema, template/,
                 procedures/, migrations/, and the content-management toolkit
packages/cli/    the thin `trellis` CLI (new / update / passthrough)
examples/        consumption harnesses
docs/adr/        architecture decision records (the "why")
CONTEXT.md       domain glossary    PLAN.md  build plan    FOUNDATION.md  vision
```

## How it's designed

The reasoning behind every load-bearing choice is in [docs/adr/](docs/adr/) (16
ADRs) — agent-agnostic procedures, framework-as-versioned-dependency,
migration-based updates, the fixed-register model, the deterministic-tool boundary,
and more. [PLAN.md](PLAN.md) is the build sequence; [CONTEXT.md](CONTEXT.md) is the
glossary.
