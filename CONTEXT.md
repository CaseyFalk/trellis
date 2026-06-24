# Trellis

Trellis is a scaffolding tool: from a short focus-area prompt it generates a
ready-to-run learning project built on a known-good Astro + Starlight stack, into
which the user drops an AI coding agent to learn a subject and grow a navigable
knowledge base as they go.

## Language

**Trellis**:
The scaffolding tool itself — the template plus the procedure that stamps out a
learning project. Not the generated project, and not the knowledge base inside it.

**Focus area**:
The single subject a learning project covers (e.g. "running open-source LLMs
locally"). Everything in a project is scoped to its focus area.
_Avoid_: topic, domain, subject

**Focus prompt**:
The user's 1–3 sentence input describing what they want to learn and why. The
sole tailoring input Trellis takes.

**Learning project**:
The ready-to-run folder Trellis generates — the operating manual, learning
profile, tag vocabulary, capture procedure, and scaffolded site. What the user
opens an agent in to learn.
_Avoid_: generated project, output, scaffold (as a noun), site

**Trellis core**:
The framework's machinery shipped as a versioned npm package — a Starlight plugin
plus a thin CLI. Holds the component overrides, link-graph lib, remark plugin,
concept-graph page, content schema, and check script. A learning project *depends*
on it; upgrading is `npm update`. Working package name `@trellis/core`.
_Avoid_: framework, library, engine

**Template**:
The fixed, known-good base a learning project is stamped from — the thin
in-project files that wire in Trellis core (a thin `astro.config`, `AGENTS.md`,
the capture procedure, default section structure). Bundled inside the globally
installed Trellis tool and copied by `trellis new`. Identical across focus areas
before tailoring.

**`trellis new`**:
The global CLI command (`trellis new <name> "<focus>"`) that deterministically
scaffolds a usable learning project from anywhere — copy template, write focus,
install, init git, verify. Calls no LLM; intelligent tailoring is deferred to the
first agent session.

**trellis.config**:
The owned, per-project JSON config (`trellis.config.json`) holding tailored values
— title, theme, feature toggles — plus the framework-maintained `trellisVersion`
and `tailored` flags. JSON so the `trellis config` tools can mutate it
deterministically. Read by `astro.config` and forwarded to the wrapper.

**Framework-managed file**:
An in-project file Trellis owns and may overwrite on `trellis update` (e.g. the
thin `astro.config`, the capture procedure). Classified as such in a manifest.

**User-owned file**:
An in-project file Trellis never touches after scaffolding — all of
`src/content/docs/**`, the tailored focus statement, `learning-profile.md`, the
grown `taxonomy.md`.

**Tailoring**:
The thin, focus-specific refinement the agent performs in the *first* project
session (per-domain section naming, starter tag vocabulary, learning-profile
draft), behind an approval gate. The only part that needs intelligence; the
deterministic `trellis new` scaffold precedes it.

**Capture**:
The explicit, agent-offered procedure that files *settled* understanding into the
knowledge base — routed by register first then concept, behind an approval plan,
with provenance written. Lives in every learning project.
_Avoid_: save, file, ingest

**Register**:
The Diátaxis-aligned *kind* of information a section holds — Concept (what it is),
Guide (how to), Reference (the details), Troubleshooting (problem → fix). Each
fact has exactly one register home; the rest get cross-links.

**Migration**:
A version-to-version transformation step a Trellis release carries to reshape an
*existing* project (create a directory, add a sidebar section, rewrite a shim) —
run by `trellis update` after the dependency bump and file re-sync, prompting
before any destructive step.

**Reference cut**:
A sub-grouping under the Reference register naming a *kind* of reference (Tools,
Models, Glossary, …). Glossary is always present; the rest are tailored per domain
at first session and may be added later by capture.

**Sub-section**:
A directory nested under any register for organization (e.g. `concepts/networking/`).
Proposed organically by the capture loop as a register accumulates enough pages to
justify grouping. Distinct from a Reference cut, which is seeded at tailoring.

**Maturity**:
A page's settledness tier: `seedling` → `growing` → `established`. Navigational
and landing pages omit it.

**Journal**:
The dated, immutable provenance record — one entry per capture event, summarizing
the conversation and linking what it produced.

**Learning profile**:
A domain-agnostic description of how the user learns. Shared across all projects at
`~/.trellis/learning-profile.md` (under the Trellis user home `~/.trellis/`,
overridable via `TRELLIS_HOME`), referenced not copied, seeded minimally and grown
through use. Holds learning preferences only — never domain knowledge.

**Trellis home**:
The user-level config directory `~/.trellis/` (overridable via `TRELLIS_HOME`)
holding shared Trellis state — currently the learning profile.
