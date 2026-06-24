# Deterministic operations are tools; the agent contributes only judgment, prose, parameters

To keep Trellis reliable even with weaker/cheaper models, the agent's reliability
must not gate correctness. So the boundary is drawn hard toward tools: the agent
contributes only **judgment** (scope, register/concept routing, structure
decisions, conflict reconciliation), **prose** (page bodies, journal summaries,
descriptions), and **parameter choices** (titles, tags, paths, maturity).
**Everything that touches more than one file for consistency, or needs exact
formatting/dates, is a deterministic tool** — these are exactly what weak models
get wrong, and each has a verifiable outcome (`trellis check` passes).

This turns the `trellis` CLI into a small **content-management toolkit** (tools
dispatch into `@trellis/core`):

- Pages: `page new`, `page move`/`rename` (rewrites all inbound links + `sources` +
  journal links), `page merge`, `page set`.
- Sections: `section add`, `section rename`/`move`.
- Tags: `tag add`, `tag rename` (rewrites across all frontmatter).
- Journal: `journal add` (dated). Config: `config set`/`get`. Validation: `check`.

The highest-value tools are the multi-file consistency ops (`page move`,
`tag rename`, `page merge`) — link rewriting on move is impossible to get wrong via
a tool. `merge`/`split` are hybrid: the **agent authors the prose**, the **tool does
the mechanics** (redirect links, reconcile `sources`, remove dead pages, fix journal
links) — the agent never touches a link or source list by hand. The procedures
(`capture.md`/`tailor.md`) become "decide, then call tools," which also makes them
easier for any agent to follow.

We rejected the leaner cut (tools only for the most error-prone ops). Cost: a
meaningfully larger CLI surface to build and keep stable — justified by weak-model
compatibility being a goal.
