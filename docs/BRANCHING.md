# Branching and release workflow

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready; version tags trigger automated npm publish |
| `developing` | Integration branch; PRs merge into `main` |

## Daily flow

1. Commit on `developing`
2. Open PR `developing` → `main`
3. CI must pass; maintainer approval required on `main`
4. Merge to `main`

## Release flow (CI-only npm publish)

**npm publish is never run from a developer machine.** All six packages are published by [`.github/workflows/release.yml`](../.github/workflows/release.yml) when a version tag is pushed.

**Order matters:** bump **all** publishable `package.json` files **before** creating the git tag. The Release workflow fails if the tag does not match any package version.

### Publishable packages (same semver on every release)

| Package | Path |
|---------|------|
| `@br-validators/core` | `packages/br-validators/` |
| `@br-validators/cli` | `apps/cli/` |
| `@br-validators/zod` | `packages/br-validators-zod/` |
| `@br-validators/react-hook-form` | `packages/br-validators-rhf/` |
| `@br-validators/express` | `packages/br-validators-express/` |
| `@br-validators/vue` | `packages/br-validators-vue/` |

After merge to `main`:

```bash
# 1. Bump version in ALL six package.json files (identical semver)
# 2. Move CHANGELOG [Unreleased] → [X.Y.Z] - YYYY-MM-DD
# 3. Commit and push to main (via PR from developing)

# 4. Only then — tag must match package.json (with v prefix)
git tag -a v1.6.1 -m "Release v1.6.1"
git push origin v1.6.1
```

| Tag pushed | `package.json` version | Result |
|------------|------------------------|--------|
| `v1.6.1` | `1.6.0` | **Fails** — version mismatch |
| `v1.6.1` | `1.6.1` | **Publishes** all six packages |

Pushing tag `v*` triggers the Release workflow:

1. Verifies tag matches all six `package.json` versions
2. Runs `pnpm verify`
3. Publishes each package to npm (skips if that version already exists — safe re-run)
4. Verifies all six versions are on the registry
5. Sets npm **`latest`** dist-tag on each package
6. Creates GitHub Release (if missing)

### Re-run a failed release (no local publish)

Actions → **Release** → **Run workflow** → enter the existing tag (e.g. `v1.6.0`).

### One-time setup: `NPM_TOKEN`

1. [npmjs.com](https://www.npmjs.com) → Access Tokens → **Granular Access Token** (or **Automation** token)
2. Permissions: **Read and write** on **all** packages matching `@br-validators/*` (include permission to **create** new scoped packages)
3. GitHub repo → Settings → Secrets and variables → Actions → **New repository secret**
4. Name: `NPM_TOKEN` — paste the token

Local `pnpm publish` is blocked by `scripts/assert-ci-publish.mjs` (`prepublishOnly` on every publishable package).

### Sync developing after release

```bash
git checkout developing && git merge main && git push origin developing
```

## `main` protection

- Required status check: **test** (CI workflow)
- Required pull request review: **1** approving review
- Releases use tags — **no** `npm login` / local publish required or supported
