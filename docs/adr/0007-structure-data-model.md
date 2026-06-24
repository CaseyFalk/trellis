# Structure data model: explicit `reference/` parent, filesystem as source of truth

How sections are represented drives the plugin, `tailor.md`, and migrations, so we
fix it:

**On disk**, the Reference register is an explicit parent directory whose
sub-directories are the tailored cuts, rather than flattening reference sections to
the top level (as the hand-built POC did):

```
src/content/docs/{concepts,guides,reference/{glossary,...cuts},troubleshooting,journal}
```

Fixed registers are fixed directories; `reference/glossary/` is always present;
the other `reference/*` sub-cuts are tailored per domain. This matches ADR 0005
(Reference is the one register with tailored sub-cuts) and makes the register
boundary explicit for capture-routing and migrations.

**The filesystem is the source of truth** for which sections exist.
`trellis.config` holds only display metadata — labels, order, feature toggles. The
`trellis()` plugin builds the sidebar by scanning `src/content/docs/` and applying
that metadata. There is no `sections` list in config to drift from the folders,
which keeps structure and content from ever disagreeing (aligned with "markdown is
the single source of truth"). Tailoring becomes "create a dir + add a label";
migrations become "create/rename dirs + adjust labels".

We rejected a config-driven `sections` list (drift risk) and the POC's flat
top-level layout (obscures the register boundary). Cost: the sidebar generator
must scan directories and respect a label/order map rather than read a static
array.
