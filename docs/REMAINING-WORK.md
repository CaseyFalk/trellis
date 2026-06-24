# Remaining Work

The framework is functionally complete and **installable from GitHub Releases**.

## ✅ Done — distribution via release tarballs

The repo is public (`CaseyFalk/trellis`) and **v0.1.0** is released with both
tarballs. `npm pack` builds them (the CLI + template depend on the core tarball by
its release URL, so peer deps resolve correctly — no npm registry needed).

```sh
npm run pack:release                                  # build dist/*.tgz (URL deps)
gh release create vX.Y.Z dist/trellis-core-X.Y.Z.tgz dist/trellis-X.Y.Z.tgz
npm i -g https://github.com/CaseyFalk/trellis/releases/download/vX.Y.Z/trellis-X.Y.Z.tgz
```

Verified end to end: `npm i -g <release URL>` → `trellis new` (no alias/env) →
project builds, `check` green. The template default `@trellis/core` is the release
URL. (`npm run pack:local` still exists for fully-offline local tarballs.)

**On a version bump:** bump `packages/*/package.json` versions, `npm run pack:release`,
`gh release create vNEW …`. The template URL tracks the new version automatically.

## ⏳ Remaining — Homebrew tap (optional shorthand)

`brew install --formula ./Formula/trellis.rb` works from a clone today. For the
`brew install CaseyFalk/trellis/trellis` one-liner:

1. Create a tap repo `CaseyFalk/homebrew-trellis`.
2. Add `Formula/trellis.rb` to it (already filled with the v0.1.0 url + sha256).
3. On each release, bump the formula's `url` + `sha256` (`shasum -a 256 dist/trellis-X.Y.Z.tgz`).
4. `brew install CaseyFalk/trellis/trellis`.

## Future (not blocking)

See [PLAN.md](../PLAN.md) → "Future": a `/teach` skill + Tutorial register, and a
project registry for `trellis update --all`. Optionally publish to the npm registry
later for `npm i -g trellis` without the URL.
