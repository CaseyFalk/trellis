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

## ✅ Done — Homebrew (formula in this repo, no separate tap repo)

`Formula/trellis.rb` lives in the main repo and installs a **self-contained bundle**
(`trellis-bundled-X.Y.Z.tgz`, CLI + runtime deps, no Astro-plugin peers — built with
`npm i --legacy-peer-deps`), so `brew install` needs no network during the sandboxed
install step.

```sh
brew tap CaseyFalk/trellis https://github.com/CaseyFalk/trellis   # main repo as the tap
brew install trellis
brew upgrade trellis
```

**On a version bump:** rebuild the bundle (`npm i -g --legacy-peer-deps` from the new
CLI tarball → `tar`), upload it to the release, and update the formula's `url` +
`sha256` (`shasum -a 256`). Consider scripting this alongside `pack:release`.

**Not yet done:** verified only on this machine (via a temp prefix). Confirm
`brew tap` + `brew install trellis` on a clean machine.

## Future (not blocking)

See [PLAN.md](../PLAN.md) → "Future": a `/teach` skill + Tutorial register, and a
project registry for `trellis update --all`. Optionally publish to the npm registry
later for `npm i -g trellis` without the URL.
