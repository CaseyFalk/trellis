# Fixed top-level registers; only the Reference cut, labels, and taxonomy are tailored

Every learning project shares the same top-level register skeleton — Concept,
Guide, Reference, Troubleshooting, and Journal — regardless of domain. The
first-session tailoring may adapt only: the **Reference register's sub-cuts and
their names** (software → Tools/Models/Glossary; cooking → Ingredients/Techniques/
Glossary; with Glossary always present), the **labels**, and the starter
**taxonomy**. Knowledge-heavy vs skill-heavy domains do **not** get different
skeletons — the content distribution reflects the domain on its own (more
Concepts vs more Guides), so no structural fork is needed.

Rationale: the register contract is Trellis's load-bearing IP and the capture
loop routes "by register first," so a stable register set keeps capture
predictable; and the version-to-version migrations of ADR 0003 are only writable
if all projects share a known skeleton. Reference is the one register whose *kind*
genuinely varies by domain, so it is the one place tailoring reshapes.

We rejected letting tailoring reshape the top-level registers per domain: it would
make generic migrations nearly impossible and destabilize capture routing, for
flexibility the content distribution already provides.
