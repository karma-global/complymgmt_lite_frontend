#!/usr/bin/env bash
# Fails when this branch has more ESLint errors in src/ and Utils/ than the branch it merges into.
# The codebase still carries old lint errors, so "no new errors" is the gate until they're cleaned up;
# then CI can switch to a plain `npx eslint src Utils`.
#
# Usage: lint-ratchet.sh <base-ref>   e.g. origin/develop
set -euo pipefail
base_ref="$1"
eslint="$PWD/node_modules/.bin/eslint"

count_errors() { # count_errors <dir>
  (cd "$1" && "$eslint" src Utils -f json -o "$RUNNER_TEMP/eslint.json" >/dev/null 2>&1) || true
  node -e 'const r=require(process.argv[1]);console.log(r.reduce((n,f)=>n+f.errorCount,0))' "$RUNNER_TEMP/eslint.json"
}

base_dir="$RUNNER_TEMP/lint-base"
git worktree add --detach "$base_dir" "$base_ref" >/dev/null
ln -s "$PWD/node_modules" "$base_dir/node_modules"
base_errors="$(count_errors "$base_dir")"
head_errors="$(count_errors "$PWD")"
git worktree remove --force "$base_dir"

echo "ESLint errors: $base_errors on $base_ref, $head_errors on this branch"
if [ "$head_errors" -gt "$base_errors" ]; then
  echo "::error::This change adds $((head_errors - base_errors)) ESLint error(s). Lint output for the changed files:"
  git diff --name-only --diff-filter=ACMR "$base_ref"...HEAD -- 'src/*.js' 'src/*.jsx' 'Utils/*.js' 'Utils/*.jsx' \
    | xargs -r "$eslint" || true
  exit 1
fi
if [ "$head_errors" -lt "$base_errors" ]; then
  echo "Nice: this change removes $((base_errors - head_errors)) ESLint error(s)."
fi
