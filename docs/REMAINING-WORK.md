# Remaining Work

The framework is functionally complete (scaffold → tailor → learn → capture →
update all work and are verified). What's left is **distribution** — making
`brew install trellis` / `trellis new` work for a fresh machine without a local
checkout.

## 1. Package distribution (blocks the Homebrew path)

**Problem.** `@trellis/core` lives at `packages/core` inside this monorepo (ADR
0013). npm **cannot git-install a subdirectory** of a repo, so
`"@trellis/core": "github:CaseyFalk/trellis"` resolves the *repo root* (the
private workspace root), not the package. The same applies to the `trellis` CLI.
So neither a project's `@trellis/core` dependency nor a global `npm i -g github:…`
works directly from the monorepo.

**Chosen approach: tarballs (no npm publish).** `npm pack` each package; the CLI and
template depend on the core *tarball* (extracted on install, so peer deps resolve
correctly — no symlink/`--install-links` needed).

### Now (repo private) — local tarballs ✅ working

```sh
npm run pack:local                                   # builds dist/*.tgz, deps auto-wired
npm i -g /Users/caseyfalkowski/Documents/projects/Trellis/dist/trellis-0.1.0.tgz
trellis new my-focus "…"                             # no alias, no env var
```

The template/CLI reference the core tarball by **absolute path**, so keep `dist/` in
place; re-run `npm run pack:local` after changes (then re-`npm i -g`). This is
machine-local (the abs path isn't portable) — fine for personal use while private.

### Later (repo public) — release tarballs

Once public, release assets download without auth:

1. `git init && gh repo create CaseyFalk/trellis --public --source . --push`
2. Change the `file:` deps to the release URL
   `https://github.com/CaseyFalk/trellis/releases/download/v0.1.0/trellis-core-0.1.0.tgz`
   (update `scripts/pack-local.mjs` or add a `pack:release` variant), `npm pack` both.
3. `gh release create v0.1.0 dist/*.tgz`
4. `npm i -g <trellis cli release URL>` works from any machine.

Then the template default can be the release URL and `dist/` no longer needs to persist.

## 2. Homebrew tap + formula

After distribution (#1) is sorted:

1. Create a tap repo `CaseyFalk/homebrew-trellis` (or put the formula in this repo).
2. Finish [`Formula/trellis.rb`](../Formula/trellis.rb): point `url` at the published
   release tarball (or npm), set `sha256`, confirm `depends_on "node"`, and test
   `brew install --build-from-source ./Formula/trellis.rb`.
3. Verify `brew install CaseyFalk/trellis/trellis` then `trellis new` on a
   clean machine.

The formula is currently a **template** — it will not install until #1 is done and
its `url`/`sha256` are filled in.

## 3. One-time template default

`packages/core/template/package.json` pins `@trellis/core` to
`github:CaseyFalk/trellis` as a placeholder. Once published (#1), change it to
the published spec (and drop the `TRELLIS_CORE_SPEC` workaround from the README).

---

*Not blocking, future ideas live in [PLAN.md](../PLAN.md) → "Future": a `/teach`
skill + Tutorial register, and a project registry for `trellis update --all`.*
