#!/usr/bin/env bash
# Netlify build: clone external case-study repos, then run the portfolio build.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# On Netlify the site repo is usually /opt/build/repo; clone siblings under /opt/build.
BUILD_BASE="${NETLIFY_BUILD_BASE:-$(dirname "$ROOT")}"

export AGENT_OP_ROOT="${AGENT_OP_ROOT:-$BUILD_BASE/Agent-Op}"
export AI_ADOPTION_OS_ROOT="${AI_ADOPTION_OS_ROOT:-$BUILD_BASE/AI-Adoption-OS}"
export SHADCN_BLOCKS_ROOT="${SHADCN_BLOCKS_ROOT:-$BUILD_BASE/shadcnBlocks}"

git_url() {
  local url="$1"
  if [[ -n "${GITHUB_TOKEN:-}" && "$url" == https://github.com/* ]]; then
    echo "https://${GITHUB_TOKEN}@github.com/${url#https://github.com/}"
  else
    echo "$url"
  fi
}

clone_if_missing() {
  local dest="$1"
  local repo="${2:-}"
  local ref="${3:-main}"

  if [[ -f "$dest/package.json" || -f "$dest/pnpm-lock.yaml" ]]; then
    echo "✓ source present: $dest"
    return 0
  fi

  if [[ -z "$repo" ]]; then
    echo "⚠ skip clone (set repo env var): $dest"
    return 0
  fi

  echo "▶ clone $(git_url "$repo") → $dest (ref: $ref)"
  rm -rf "$dest"
  git clone --depth 1 --branch "$ref" "$(git_url "$repo")" "$dest"
}

echo "Portfolio root: $ROOT"
echo "Clone base:     $BUILD_BASE"

clone_if_missing \
  "$AGENT_OP_ROOT" \
  "${AGENT_OP_REPO:-https://github.com/mattshade/Agent-Op.git}" \
  "${AGENT_OP_REF:-main}"

clone_if_missing \
  "$AI_ADOPTION_OS_ROOT" \
  "${AI_ADOPTION_OS_REPO:-https://github.com/mattshade/AI-Adoption-OS.git}" \
  "${AI_ADOPTION_OS_REF:-main}"

clone_if_missing \
  "$SHADCN_BLOCKS_ROOT" \
  "${SHADCN_BLOCKS_REPO:-https://github.com/mattshade/shadcnBlocks.git}" \
  "${SHADCN_BLOCKS_REF:-main}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "▶ enabling pnpm via corepack"
  corepack enable
  corepack prepare pnpm@10.33.2 --activate
fi

cd "$ROOT"
export CI=true
npm run build
