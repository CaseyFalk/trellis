# Trellis — Foundation

> **Direction.** Trellis is a **scaffolding tool**. Given a short focus-area
> prompt, it generates a ready-to-run learning project using the *same tech stack
> and process* proven in the proof of concept (`../Local LLMs/`). Simplicity is
> the point: Trellis stamps out the known-good setup; it is **not** a runtime
> engine or a complex application. (An earlier exploration of a more elaborate
> architecture — a Rust backend + thin web frontend — has been set aside. This
> file is authoritative; disregard any prior `ROADMAP.md` describing that
> direction.)

## What Trellis is

A **meta-tool for learning anything**. A user provides a short prompt — *what they
want to learn and why* (their "focus area" and goals) — and Trellis scaffolds an
entire self-contained environment: a folder they can drop an AI coding agent into
and immediately begin learning. As they ask questions and settle understanding,
the agent **captures** that knowledge into a local, navigable webapp that **grows
as they learn** — structured according to a philosophy aligned with the
**Diátaxis** documentation framework.

The name evokes the dual nature of the tool: a **trellis** is the structure a
climbing plant grows *along*. Trellis provides the structure (Diátaxis registers,
the capture workflow); the learner's knowledge grows up it.

The one-prompt flow:

> User writes a 1–3 sentence prompt → Trellis generates a ready-to-run folder
> (operating manual for the agent, a learning profile, a tag vocabulary, a
> capture skill, and a scaffolded Astro + Starlight site with the structure +
> integrations wired) → user runs the agent in the folder and starts learning →
> the site populates as they go.

## Origin: the proof of concept

This was validated by hand-building one instance for a specific focus area —
"running open-source LLMs locally" — in the sibling folder **`../Local LLMs/`**.
That folder is the **reference implementation**: read it to see a concrete,
working example of everything below (its `README.md`, `PLAN.md`, `CLAUDE.md`,
`.claude/skills/capture/SKILL.md`, the Astro/Starlight site, and the populated
content). **Trellis is the generalization of that hand-built instance into
something generated from a prompt** — same stack, same conventions, same workflow.

## Core philosophy (the reusable principles)

These are the load-bearing ideas Trellis generates into every project:

1. **Markdown is the single source of truth.** The site only *renders* it — no
   second copy of content to keep in sync. Captured knowledge = a markdown file.
2. **Diátaxis-aligned register contract.** Each section holds exactly one *kind*
   of information, and pages **cross-link across registers rather than mixing
   them**:
   - **Concepts** — what something *is* / why it matters (explanation),
     tool-agnostic.
   - **Guides** — ordered procedures (how-to).
   - **Reference** (Tools / Models / Glossary in the POC) — flags, config,
     definitions, specific facts.
   - **Troubleshooting** — symptom → cause → fix.
   - The routing test for any fact: *what it is* / *how to do it* / *what are the
     details* / *a problem + fix*. One home each; the rest get a cross-link.
3. **The capture loop.** Knowledge enters via an explicit, agent-offered
   `/capture` step that: scopes to *settled* understanding within the focus;
   routes each fact **by register first, then concept** to its home (so a
   nonlinear conversation never jumbles the structure); presents an **approval
   plan before writing**; recommends *structure* (split/promote/merge) with
   reasons; reconciles conflicts instead of stacking them; and writes provenance.
4. **Focus boundary.** Everything is scoped to the declared focus area. Anything
   out of focus is excluded unless explicitly requested; borderline items are
   **flagged for confirmation**, never silently filed. (Meta-conversation about
   the tooling itself is out of focus by definition.)
5. **Provenance.** A dated **Journal** records one entry per capture event (a
   high-level conversation summary + links to what it produced). Each page lists
   its contributing sessions (`sources`), rendered as a "Sources" box. The
   journal is an immutable historical record; links point to living pages.
6. **A living, navigable web of knowledge.** Curated inline cross-links (first
   mention), auto **backlinks** ("Referenced by"), a **concept graph** built from
   those links, glossary **hover-tooltips**, and full-text **search**.
7. **Maturity tiers (digital-garden lineage).** Pages carry
   `seedling → growing → established`. Navigational/landing pages omit maturity.
8. **A private learning profile.** A living description of how *this user* learns
   (visual? jumps between concepts? wants the "why"?) that tunes the agent's
   answers and how it structures things. Not published.
9. **A controlled tag vocabulary.** Tags come from a maintained list; new tags
   are added deliberately (surfaced in the capture plan), keeping search facets
   clean.

## The tech stack Trellis scaffolds

This is the actual stack every generated project uses — the same one validated in
the POC:

- **Astro + Starlight** — static-site generator + docs theme (sidebar nav,
  responsive, dark mode, component overrides). Markdown/MDX content collections
  with a Zod-validated frontmatter schema.
- **Pagefind** — local, client-side, keyword full-text search (bundled with
  Starlight). Journal down-weighted; section + tag filters.
- **Mermaid** — text-defined diagrams (remark plugin → client render).
- **Cytoscape** — the interactive concept graph.
- **starlight-links-validator** — build-time broken-link detection.
- A custom **`check`** script — fast frontmatter + internal-link + sources + tag
  validation without a full build.
- Custom **component overrides** (Head: Mermaid + tooltips; Footer: maturity +
  Sources + backlinks) and a **link-graph utility** powering backlinks + graph.
- **git** for version history and `lastUpdated`.
- Node + npm; one-command local dev (`npm run dev`).

Per-focus and swappable: the Starlight **theme**, and of course all the *content*.

## What Trellis generates from a prompt

A ready-to-run project containing:
- An **operating manual** for the agent (`CLAUDE.md`): the focus statement, the
  register contract + routing test, file/frontmatter conventions, the
  journal/session format, glossary + tag rules, the proactive-capture nudge, and
  a "ground everything, don't trust parametric knowledge" posture.
- A seeded **learning profile** (refined as the user works).
- A **tag taxonomy** registry.
- A **capture skill** (the `/capture` procedure).
- A **scaffolded Astro + Starlight site**: the section structure, all integrations
  wired (search, link validation, backlinks, tooltips, concept graph, diagrams),
  placeholder section intros, and an empty journal.
- A **README** explaining how to run, navigate, and grow the project.
- Initialized **git**.

## How the scaffolding works

Deliberately simple — a **template, lightly tailored to the focus area**:

- The bulk is a fixed, known-good **project template** (the Astro/Starlight setup,
  all integrations, the component overrides, the capture skill, the check script).
  This is identical for every focus area and carries the proven configuration.
- A thin **tailoring step** fills in the focus-specific pieces from the prompt:
  the focus statement in `CLAUDE.md`, an initial learning profile, a starter tag
  vocabulary, and any focus-appropriate naming of the reference sections (e.g.
  "Tools/Models" for a software focus vs. other reference cuts for another domain).
- Then `npm install`, `git init`, a verification build, and the project is ready
  to open and learn in.

The exact delivery mechanism (an `npm create`-style initializer, a CLI, or a
skill bundle) is an open question below — but the *output* is always the
template above.

## Lessons learned building the POC (baked into the template)

- **Starlight sidebar API (v0.39+):** `autogenerate` must be nested inside an
  `items` array, not used alongside a sibling `label`.
- **Link validator + custom pages:** non-Starlight pages (e.g. the concept-graph
  route) must be added to the validator's `exclude` list or the build fails.
- **Cytoscape gotchas:** (a) it renders to canvas and **cannot resolve CSS
  `var()`** — resolve theme colors to concrete values in JS; (b) an element with
  an **empty-string id crashes the whole graph** — the home/splash page canonical
  id is `''`, so exclude it (and journal pages) from nodes.
- **Journal exclusions:** journal entries are provenance, so exclude them from
  backlinks *and* the concept graph (they'd otherwise form a giant hub).
- **Landing pages omit `maturity`** (metadata, not tracked knowledge).
- **Dev hot-reload:** atomic file writes (`mv`) may not trigger Astro's watcher;
  a dev-server restart (or clearing `.astro/`) picks up the change.
- **Verify the runtime, not just the build.** Build + HTML inspection can hide
  client-side runtime errors (the Cytoscape crash only surfaced in the browser
  console). Wrap client init in try/catch that logs, and actually load the page.

## Open questions (to define next)

- **Delivery mechanism:** `npm create trellis`-style initializer, a standalone
  CLI, or a Claude Code skill that runs the scaffold? Which agent(s) does the
  generated `/capture` skill target?
- **How much per-focus tailoring** the thin step should do — fixed sections for
  every domain, or agent-proposed section cuts from the focus prompt?
- **Tutorial register:** add Diátaxis's learning-oriented quadrant (cf. the
  `teach` skill's lesson philosophy) to the generated structure, or keep the
  four-register cut from the POC?
- **Knowledge-vs-skill domains:** some focus areas are theory-heavy, others
  practice-heavy — should the generated structure adapt, or stay uniform?
