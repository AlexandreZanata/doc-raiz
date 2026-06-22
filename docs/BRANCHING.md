# Branching and release workflow

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready; npm publishes and GitHub Releases cut from here |
| `developing` | Integration branch; all feature PRs target `main` via PR from `developing` |

## Daily flow

1. Commit on `developing`
2. Open PR `developing` → `main`
3. CI must pass; maintainer approval required on `main`
4. Merge to `main`

## Release flow (on `main` after merge)

```bash
pnpm verify
# bump versions in packages/br-validators + apps/cli; update CHANGELOG
git tag -a v0.11.0-alpha.0 -m "Release v0.11.0-alpha.0"
git push origin v0.11.0-alpha.0
gh release create v0.11.0-alpha.0 --notes-file CHANGELOG-snippet.md
npm login && npm whoami
pnpm --filter @br-validators/core publish --access public --tag alpha
pnpm --filter @br-validators/cli publish --access public --tag alpha
git checkout developing && git merge main && git push origin developing
```

## `main` protection

- Required status check: **CI / test** (workflow job `test`)
- Required pull request review: **1** approving review
- No direct pushes (use PRs from `developing`)

Configured via GitHub branch protection on `main`.
