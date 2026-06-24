# Trellis is an npm-workspaces monorepo

The two artifacts of ADR 0011 (`@trellis/core` and the thin `trellis` CLI) live in
one repo as npm workspaces:

```
Trellis/
├── packages/core/   @trellis/core — trellisStarlight() + components/lib/remark/schema,
│                    plus template/, procedures/, migrations/ (all version-specific substance)
├── packages/cli/    the thin trellis CLI (Homebrew-distributed)
├── package.json     workspaces: ["packages/*"]
└── docs/adr/ · PLAN.md · CONTEXT.md · FOUNDATION.md
```

Workspaces let `packages/cli` dev-depend on `packages/core` with automatic local
linking (no publish-to-test loop), and keep all version-specific substance inside
`core` per ADR 0011. We rejected `@trellis/core` at the repo root (no clean slot
for the CLI to cross-link during dev) and separate repos (heavier to develop in
lockstep). Cost: a workspace root and `packages/` nesting.
