# Capture

Turn this session's **settled** understanding into durable reference in the
knowledge base. The conversation may have jumped between topics; capture does not —
each fact is **routed to its home** regardless of when it came up. Nothing is
written until you approve a **capture plan**.

Conventions are not repeated here. Read [`conventions.md`](conventions.md) for the
register contract, routing test, frontmatter schema, journal format, and the tool
reference — it is the single source of truth. This file carries only the procedure.

In Claude Code this is `/capture`; with any other agent, follow these steps directly.

## 1. Scope

Decide what to file. If an argument names a target, scope to it; otherwise scope to
everything **settled** this session — understanding that reached a stable,
worth-keeping state. Exclude exploratory threads, half-formed guesses, and tangents
that didn't land. Stay within the project's **focus** (`AGENTS.md`): out-of-focus
material is excluded; near-boundary items are marked **borderline** and carried to
the plan for confirmation, never silently dropped or filed.

*Done when:* a written list of in-focus settled understandings, plus any borderline
items flagged.

## 2. Survey

Read every existing page and glossary term the scoped concepts touch — not a sample.
This tells you what already exists (append vs. create), which cross-links to wire,
and where new understanding **conflicts** with what's written. Ground each fact in
what was established this session or a cited source; never trust parametric
knowledge.

*Done when:* every touched page/term has been read and conflicts are listed.

## 3. Route

Decompose the settled understanding into discrete facts and assign each a home by
**register first, then concept** (see the routing test in `conventions.md`). A
single topic typically fans out across registers — e.g. "context window" yields a
Concept (what it is), a Reference entry (the option that sets it), and a
Troubleshooting entry (the mismatch gotcha) — each in its own home, cross-linked,
never merged. Concept pages stay tool-agnostic. Reuse established glossary terms and
existing tags rather than coining near-duplicates.

If a fact fits no existing sub-section well, plan a **new sub-section or Reference
cut** (created with `trellis section add`) — but only when it earns its place;
never invent a new top-level register.

*Done when:* every fact is assigned to exactly one home.

## 4. Plan — approval gate

Present the **capture plan** and write nothing until it's approved. For each item,
state: its home (append / create); what changes; a **structure recommendation with
the reason** (split a long page, promote a glossary term to a full page, merge
near-duplicates, add a sub-section); the cross-links to wire; glossary terms
touched; the `tags`, `sources`, and `maturity` to set — flagging any **new tag** not
in `taxonomy.md` with a one-line rationale; and any **conflict** to reconcile, with
how. List **borderline** items separately and ask the user to confirm each.

*Done when:* the user has approved or revised the plan.

## 5. Write — via the tools

Execute the approved plan. Use the tools for all mechanics (`conventions.md` →
Mechanics); write only page **bodies** by hand.

- New sub-sections/cuts first: `trellis section add <register>/<name> --label "…"`.
- New pages: `trellis page new <path> --title "…" --description "…" --tags … --maturity …`, then write the body (prose) with curated **absolute** inline links at first mention.
- Existing pages: edit the body prose directly; change frontmatter with `trellis page set …`.
- New tags (approved): `trellis tag add <tag> --gloss "…"`.
- Restruct:  `trellis page move/rename` (relocate) · `trellis page merge --into …` (after authoring the merged body) — these keep links and `sources` correct.
- **Reconcile** each conflict by updating the outdated statement — never stack a contradiction beside it.
- Provenance last: one `trellis journal add --title "…" --summary "…" --captured <every page created/changed>` — it writes the dated entry **and** wires each page's `sources`.

*Done when:* every approved item is written, bodies have absolute inline links, and
the journal entry exists.

## 6. Verify

Run `trellis check`. Fix any dangling link or broken reference it reports (typically
a body linking to a page not yet created, or a mistyped path). Then report to the
user what was filed and where.

*Done when:* `trellis check` reports no errors and the summary is given.

---

*If you noticed a durable, domain-agnostic preference for how this user learns,
propose adding it to the shared learning profile (`~/.trellis/learning-profile.md`)
and update it only on confirmation — never domain knowledge (see `conventions.md`).*
