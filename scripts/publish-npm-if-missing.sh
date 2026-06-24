#!/usr/bin/env bash
# Publish a workspace package only when that exact version is not on npm yet.
# Used by .github/workflows/release.yml — CI-only (see assert-ci-publish.mjs).
set -euo pipefail

FILTER="${1:?filter name (e.g. @br-validators/core)}"
NPM_NAME="${2:?npm package name}"
VERSION="${3:?semver}"
NPM_TAG="${4:?dist-tag (latest|alpha|beta|rc)}"

if npm view "${NPM_NAME}@${VERSION}" version 2>/dev/null | grep -qx "${VERSION}"; then
  echo "SKIP: ${NPM_NAME}@${VERSION} already on npm"
else
  echo "PUBLISH: ${NPM_NAME}@${VERSION} (tag ${NPM_TAG})"
  pnpm --filter "${FILTER}" publish --access public --tag "${NPM_TAG}" --no-git-checks
fi
