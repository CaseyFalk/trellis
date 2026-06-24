# The learning profile is shared user-level state, not per-project

The learning profile describes *how the user learns* (domain-agnostic), so it is
reused across every Trellis project rather than kept per-project. It lives at
`~/.trellis/learning-profile.md` under a new Trellis user home `~/.trellis/`
(overridable via `TRELLIS_HOME`), which also leaves room for future user-level
state (default theme, etc.).

`trellis new` *ensures the shared file exists* (seeding it minimally the first
time) rather than creating a local copy. Projects **reference** it from `AGENTS.md`
and never copy it; `tailor.md` and `capture.md` read it and write domain-agnostic
learning observations back, so insight from one project benefits all. The profile
stays strictly domain-agnostic — `conventions.md` enforces that only learning
preferences live here; domain-specific knowledge stays in the KB. A single shared
profile, no per-project layer yet.

Consequences: the profile leaves the project template and the owned-files manifest
(projects are no longer fully self-contained w.r.t. it — acceptable, it is
personal); and the agent needs read/write access to `~/.trellis/`, outside the
project dir (fine for typical agents; a strictly sandboxed agent would need
configured access or a per-project fallback).

We rejected per-project-copy-from-a-shared-template (self-contained, but insights
would not propagate back to a shared profile — the whole point of the request).
