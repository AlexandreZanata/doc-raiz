#!/usr/bin/env node
/**
 * Block accidental local `pnpm publish`. npm releases run only in GitHub Actions.
 * Re-run: Actions → Release → workflow_dispatch with the tag name.
 */
if (process.env.GITHUB_ACTIONS !== 'true') {
  console.error(
    [
      'npm publish is CI-only for @br-validators/*.',
      'Push a version tag on main (vX.Y.Z) or re-run .github/workflows/release.yml via workflow_dispatch.',
      'See docs/BRANCHING.md',
    ].join('\n'),
  );
  process.exit(1);
}
