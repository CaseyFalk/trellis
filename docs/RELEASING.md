# Releasing

How to cut a Trellis release. Distribution is via **GitHub Releases** on the public
`CaseyFalk/trellis` repo (no npm registry): each release carries three tarballs —
`@trellis/core`, the `trellis` CLI, and a self-contained `trellis-bundled` for
Homebrew. The Homebrew formula lives in this repo (`Formula/trellis.rb`); the tap is
the main repo via an explicit URL.

> Why tarballs, not npm publish: `@trellis/core` is a monorepo subpackage, which
> npm can't git-install directly. Tarballs (CLI + template both depend on the core
> tarball's release URL) sidestep that. See ADR 0011 and REMAINING-WORK.md.

## Prerequisites
- `gh` authenticated (`gh auth status`) with push access; repo public (private
  release assets need auth to download, breaking `npm i`/`brew`).
- Clean git tree on `main`.

## Steps

Replace `X.Y.Z` with the new version throughout.

1. **Decide the version.** Patch for fixes; minor for features. **A structural
   change (new register/section, moved files, changed shims) requires a migration**
   in `packages/core/migrations/X.Y.Z.mjs` (`export async function up(ctx)`;
   `await ctx.prompt(...)` before any destructive step) — the runner applies it on
   `trellis update` (ADR 0003).

2. **Bump versions** in `packages/core/package.json` and `packages/cli/package.json`
   to `X.Y.Z`, then `npm install` (updates the lockfile).

3. **Build the release tarballs:**
   ```sh
   npm run pack:release          # → dist/trellis-core-X.Y.Z.tgz, dist/trellis-X.Y.Z.tgz
   ```
   This temporarily wires the template + CLI `@trellis/core` dep to the release URL,
   packs both, restores the CLI dep to `*`, and leaves the template pointing at the
   new release URL. Verify `packages/cli/package.json` shows `"@trellis/core": "*"`
   afterward.

4. **Create the release with the core + CLI tarballs:**
   ```sh
   gh release create vX.Y.Z dist/trellis-core-X.Y.Z.tgz dist/trellis-X.Y.Z.tgz \
     --title "vX.Y.Z" --notes "…"
   ```

5. **Build the lean Homebrew bundle** (CLI + runtime deps only, no Astro-plugin
   peers — or it balloons to ~128 MB):
   ```sh
   npm cache clean --force        # avoid a stale cached tarball from the URL
   TB=/tmp/tb/trellis-X.Y.Z; rm -rf "$TB"; mkdir -p "$TB"
   npm i -g --legacy-peer-deps --prefix "$TB" \
     "https://github.com/CaseyFalk/trellis/releases/download/vX.Y.Z/trellis-X.Y.Z.tgz"
   tar -czf dist/trellis-bundled-X.Y.Z.tgz -C /tmp/tb trellis-X.Y.Z
   gh release upload vX.Y.Z dist/trellis-bundled-X.Y.Z.tgz
   shasum -a 256 dist/trellis-bundled-X.Y.Z.tgz     # note the sha
   ```
   Sanity: `"$TB/bin/trellis"` prints help and lists `trellis run`; the bundle is
   ~240 KB, not ~128 MB.

6. **Update `Formula/trellis.rb`:** set `url` to the `trellis-bundled-X.Y.Z.tgz`
   release URL and `sha256` to the value from step 5. Lint: `brew style Formula/trellis.rb`.

7. **Commit + push** the version bumps, template URL change, and formula.

8. **(Optional) verify install** on a clean machine:
   `brew tap CaseyFalk/trellis https://github.com/CaseyFalk/trellis && brew install trellis`,
   or `npm i -g <CLI release URL>`. Confirm `trellis new` → builds, `trellis run`.

## Verify before releasing
Run the full flow once with a local core (no network):
```sh
TRELLIS_CORE_SPEC=file:$PWD/packages/core node packages/cli/src/index.mjs new /tmp/rel-check "test focus"
cd /tmp/rel-check && npm run build && node ../../<repo>/packages/cli/src/index.mjs check
```
Project should build, `check` green. Also re-verify the sandbox plugin build + a
browser runtime pass (see DEVELOPMENT.md).

## Notes
- The template's `@trellis/core` default tracks the latest release URL (set by
  `pack:release`). On a version bump it auto-updates to `vX.Y.Z`.
- `pack:local` (vs `pack:release`) builds fully-offline `file:` tarballs for local
  dev — not for releasing.
- Outstanding: the empty `CaseyFalk/homebrew-trellis` repo should be deleted
  (`gh auth refresh -h github.com -s delete_repo` then `gh repo delete CaseyFalk/homebrew-trellis --yes`).
  The tap is the main repo, so that repo is unused.
- Consider scripting steps 5–6 (`scripts/pack-bundle.mjs`) if releasing often.
