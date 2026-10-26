#!/usr/bin/env bash
# Runs on the CI runner after a deploy or rollback. Exits non-zero when the site is unhealthy,
# which is what triggers the automated rollback in deploy.yml.
#
# Usage: healthcheck.sh <app-url> <expected-release-id>
#
# Healthy means:
#   1. <app-url>/version.json reports the expected release (waits up to WAIT_SECONDS for it), then
#   2. for STABLE_CHECKS checks in a row, STABLE_INTERVAL seconds apart, both
#      - <app-url>/ answers 200 with the app shell (<div id="root">), and
#      - <app-url>/version.json still reports the expected release.
set -euo pipefail

url="${1%/}"
expected="$2"
WAIT_SECONDS="${WAIT_SECONDS:-90}"
STABLE_CHECKS="${STABLE_CHECKS:-5}"
STABLE_INTERVAL="${STABLE_INTERVAL:-6}"

served_release() {
  # Cache-busting query so a CDN or browser cache can't answer for the old release
  curl -fsS --max-time 10 "$url/version.json?hc=$(date +%s%N)" 2>/dev/null \
    | grep -o '"release" *: *"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/' || true
}

shell_ok() {
  local body
  body="$(curl -fsS --max-time 10 "$url/?hc=$(date +%s%N)" 2>/dev/null)" || return 1
  grep -q '<div id="root">' <<<"$body"
}

echo "Waiting for $url to serve release $expected (up to ${WAIT_SECONDS}s)"
deadline=$((SECONDS + WAIT_SECONDS))
until [ "$(served_release)" = "$expected" ]; do
  if [ "$SECONDS" -ge "$deadline" ]; then
    echo "::error::$url never served release $expected (it serves '$(served_release)')"
    exit 1
  fi
  sleep 3
done

echo "Release $expected is live; checking it stays healthy ($STABLE_CHECKS checks, ${STABLE_INTERVAL}s apart)"
for i in $(seq 1 "$STABLE_CHECKS"); do
  if ! shell_ok; then
    echo "::error::check $i: $url/ did not return the app shell"
    exit 1
  fi
  now="$(served_release)"
  if [ "$now" != "$expected" ]; then
    echo "::error::check $i: $url serves '$now' instead of $expected"
    exit 1
  fi
  echo "check $i/$STABLE_CHECKS ok"
  if [ "$i" -lt "$STABLE_CHECKS" ]; then sleep "$STABLE_INTERVAL"; fi
done
echo "Healthy: $url serves $expected"
