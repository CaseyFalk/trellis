# Structural growth: fixed registers, organic sub-sections under any register

How a knowledge base grows its structure, by level:

| Level | Fixed? | Created by |
| --- | --- | --- |
| Top-level registers (Concept, Guide, Reference, Troubleshooting, Journal) | **Fixed** | template; only changed by a framework migration |
| Reference cuts (sub-dirs of `reference/`) | tailorable | `tailor.md` first session; capture later |
| Sub-sections under any register | organic | `capture.md` as the KB grows |
| Pages | organic | `capture.md` |

Sub-sections may exist under **any** register, not just Reference — they are just
deeper directories, which Starlight `autogenerate` and our filesystem-source-of-
truth model (ADR 0007) already support. The capture loop proposes a new
sub-section (behind its approval gate) when a register accumulates enough pages to
justify grouping; it also still proposes new Reference cuts and pages. The five
top-level registers never change per-project (only via a framework migration), so
user-driven growth and framework-driven contract changes stay cleanly separated
(ADR 0003/0005).

Code implication: the plugin's sidebar generator walks arbitrary nesting depth and
`trellis.config`'s label/order metadata keys off nested paths.

We chose **no hard nesting-depth cap** in `trellis check`; depth is governed by
judgment (capture proposes a sub-section only when warranted, kept shallow). A
hard cap was rejected as needless rigidity.
