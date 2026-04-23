#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMIT_MSG="${1:-Update Galaxy investor site}"

cd "$SITE_DIR"

echo "[1/5] Checking for changes..."
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to publish."
  exit 0
fi

echo "[2/5] Staging files..."
git add .

echo "[3/5] Committing..."
if git diff --cached --quiet; then
  echo "Nothing staged after git add. Exiting."
  exit 0
fi
git commit -m "$COMMIT_MSG"

echo "[4/5] Pushing to GitHub..."
git push

echo "[5/5] Done. GitHub Pages will refresh shortly."
echo "Live URL: https://theedge698598.github.io/galaxy-investor-site/"
