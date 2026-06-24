# Toolkit I/O conventions: JSON-only, self-validating, final-check-only

The content-management tools (ADR 0012) are always invoked by agents, never by
humans directly, so:

- **JSON-only output.** Every tool emits a single structured JSON object to stdout
  — on success (what changed: files created/moved/edited, links rewritten count)
  and on error (a structured error object) — with the exit code reflecting
  success/failure. No human-readable mode and no `--json` flag (it's always JSON);
  a `--pretty` formatter can be added later if ever needed.
- **Project-root detection.** Each tool walks up from cwd to the nearest
  `trellis.config.json`; clear error if not inside a Trellis project.
- **Fail-fast input validation.** `page new` refuses if the target exists;
  `page move` refuses if dest exists; unknown register/path → error. Destructive
  ops (`merge`, delete-on-move) rely on git as the undo net (ADR 0003), not backups.
- **Each tool guarantees its own invariant**, so no tool run leaves `trellis check`
  failing (e.g. `page move` rewrites every inbound link). Tools therefore do **not**
  auto-run `check`; the procedure (`capture.md`/`tailor.md`) runs `check` once at the
  end. That final check guards **agent prose** mistakes (a body linking to a
  not-yet-created page), which tools cannot prevent — not tool state.

We rejected dual human/JSON output (cost with no benefit for agent-only tools) and
per-tool auto-check (wasteful; correctness already lives in each tool's invariant).
