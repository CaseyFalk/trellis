# Trellis Conventions

The reusable contract every Trellis project follows: the register model, the
routing test, the frontmatter schema, the journal format, cross-linking and tag
rules, and the **mechanics (which tool to call for what)**. This file is
**framework-managed** — `trellis update` overwrites it, so improvements reach every
project. Project-specific content (the focus, the chosen section labels) lives in
`AGENTS.md`, not here.

---

## Posture

- **Ground everything; never trust parametric knowledge.** Base claims on what was
  established this session or a cited source. A plausible-but-unverified claim is
  filed `maturity: seedling` and named as needing verification.
- **Stay KB-aware.** Before answering, recall what's already documented; cross-link
  related prior material; if a new answer contradicts something written, surface the
  conflict for reconciliation — never let two truths coexist.
- **Route by concept, not by conversation.** The user jumps between topics; knowledge
  still lands at its conceptual home regardless of the order it came up.
- **Proactively offer to capture** when an exchange settles into something worth
  keeping: "Want me to capture this?" Capture itself is explicit and user-invoked.
- **Nothing is written without confirmation** — captures, tailoring, and even
  learning-profile updates are proposed first and applied only on the user's yes.

---

## The register contract (information architecture)

Each section holds exactly one *kind* of information — its **register**. Pages
**cross-link across registers rather than mixing them**: every fact has one home;
related registers get a link. The five top-level registers are **fixed** (only a
framework migration changes them):

| Register | Holds | Does **not** hold |
| --- | --- | --- |
| **Concepts** | What something *is* and *why it matters* — the mental model, tool-agnostic | Specific commands/options; specific problems |
| **Guides** | Ordered procedures — how to accomplish a task, step by step | — |
| **Reference** | The specific details — definitions, options, facts. Sub-divided into *cuts* (tailored per focus); **Glossary** always present | The conceptual explainer (link it) |
| **Troubleshooting** | A specific problem: **symptom → cause → fix** | Conceptual background (link it) |
| **Journal** | The dated provenance record (see below) | — |

**The routing test for any fact:** is this *what something is* (Concept), *how to
accomplish a task* (Guide), *a specific detail* (Reference), or *a problem and its
fix* (Troubleshooting)? It goes to exactly one home; the others get a cross-link.
Concept pages stay strictly tool-agnostic — they name no options, only a "see
Reference" link.

**Sub-sections.** Any register may grow sub-sections (sub-directories) as it
accumulates pages — propose one (and create it with `trellis section add`) only when
a register has enough pages to justify grouping. Keep nesting shallow. Reference
*cuts* are the same mechanism, seeded during tailoring.

**Topic-page model:** one page per topic; pages *grow* and refine as understanding
deepens, rather than fragmenting into many atomic notes.

---

## Frontmatter schema

| Field | Purpose | Notes |
| --- | --- | --- |
| `title` | Page heading + nav label | Required |
| `description` | One-line summary | Search snippet + graph tooltip |
| `tags` | Grouping/filtering + graph clusters | From the controlled vocabulary (`taxonomy.md`) |
| `sources` | Provenance — journal entry slugs | Renders the "Sources" box |
| `lastUpdated` | Freshness | Git-derived; don't hand-set |
| `maturity` | How settled the page is | `seedling` / `growing` / `established` |

Relationships are **derived from inline links, not duplicated in frontmatter** —
the curated inline links *are* the graph and the backlinks. There is no `related:`
list. **Maturity tiers:** `seedling` (stub/unverified, flagged), `growing` (solid
but accreting), `established` (settled). **Landing/section-index pages omit
`maturity`** — they're navigational, not tracked knowledge.

---

## File & path layout

Content lives under `src/content/docs/`: `concepts/`, `guides/`,
`reference/` (with `reference/glossary/` + tailored cuts), `troubleshooting/`,
`journal/`. Pages are `kebab-case.md` (`.mdx` only when embedding components).

---

## Cross-linking

- **Internal links are absolute** — `/concepts/context-window/`, never relative.
  (The tools emit absolute links; `trellis check` validates them.)
- **Curated inline links** — link the *first* meaningful mention of a key term on a
  page to its concept/glossary page. Intentional only; no blanket auto-linking.
- **Glossary tooltips, backlinks, and the concept graph are automatic** — derived
  from your inline links at build time. Nothing to maintain by hand.

---

## Journal / provenance

Provenance lives in `src/content/docs/journal/` — **one entry per capture event**,
named `YYYY-MM-DD-slug.md`, with a 2–4 sentence summary and a "Captured" list
linking every page created or changed. The journal is **immutable history** — entry
prose stays as written; its links point to the living pages. Each content page lists
its contributing entries in `sources:`. Always create the entry — and wire the
reverse `sources` — with a single `trellis journal add` (it does both).

---

## Glossary & tags

- **Glossary:** one short, canonical definition per term in `reference/glossary/`.
  Define a term once; reuse it everywhere; adhere to it consistently.
- **Tags** come from the controlled vocabulary in `taxonomy.md`. Reuse an existing
  tag when one fits; coining a *new* tag is deliberate — surface it in the capture
  plan with a rationale, then add it with `trellis tag add`. This keeps the search
  tag-filter clean (no `perf`/`performance` duplicates).

---

## Focus boundary

Everything is scoped to the project's declared focus (in `AGENTS.md`). Out-of-focus
material is excluded unless the user explicitly asks for it; borderline items are
**flagged for confirmation**, never silently filed or dropped. Meta-conversation
about the tooling itself is out of focus.

---

## The learning profile

How the user learns is recorded in the **shared** profile at
`~/.trellis/learning-profile.md` (domain-agnostic; shared across all their Trellis
projects). Read it to tune answers and structure. Update it **only** when you notice
a durable, domain-agnostic learning preference, **propose the change and apply it
only on confirmation**, and **never put domain knowledge there** — that belongs in
the knowledge base.

---

## Mechanics — use these tools, never hand-edit

The agent contributes **judgment, prose, and parameter choices**. Everything
mechanical — files, frontmatter, dates, links, `sources`, config, the taxonomy — is
done by a tool, so it's correct even for a weaker model. **Never hand-create a page,
hand-write or hand-edit frontmatter, hand-stamp a date, hand-rewrite links, or
hand-edit `trellis.config.json` or `taxonomy.md`.** Write **page bodies** (prose)
directly; everything else goes through:

| Tool | Use it to |
| --- | --- |
| `trellis page new <path> --title … [--description …] [--tags a,b] [--maturity m] [--sources s1,s2]` | Create a page with correct frontmatter (then write its body) |
| `trellis page set <path> [--title …] [--description …] [--maturity m] [--add-tag t] [--remove-tag t] [--add-source s]` | Change a page's frontmatter |
| `trellis page move <from> <to>` | Move/relocate a page — rewrites every inbound link |
| `trellis page rename <from> <new-slug>` | Rename a page in place — rewrites links |
| `trellis page merge --into <dest> <src> [<src> …]` | Retire src pages into dest — redirects links, unions sources, deletes srcs (author dest's prose first) |
| `trellis section add <register>/<name> --label "…"` | Create a Reference cut or sub-section + its intro |
| `trellis section rename <reg>/<name> <new-name>` · `trellis section move <from> <to>` | Rename/move a section — rewrites links |
| `trellis tag add <tag> [--gloss "…"]` | Add a tag to the controlled vocabulary |
| `trellis tag rename <old> <new>` | Rename a tag across all pages + taxonomy |
| `trellis journal add --title "…" --summary "…" --captured a/b,c/d` | Create the dated journal entry **and** wire each captured page's `sources` |
| `trellis config get [key]` · `trellis config set <key> <value>` | Read/write `trellis.config.json` (dotted keys, e.g. `features.tooltips`) |
| `trellis check` | Validate frontmatter + internal links + sources + tags (run at the end of every procedure) |

Every tool emits a single JSON result. Each guarantees its own invariant, so
`trellis check` only needs to run once at the end of a procedure — it catches
authoring mistakes in prose (e.g. a body linking to a page that doesn't exist yet),
not tool mistakes.

---

## Running & validating

- `npm run dev` — local site with hot reload. `npm run build` — production build
  (validates links). `trellis check` — fast frontmatter + link + sources + tag
  validation without a full build.
