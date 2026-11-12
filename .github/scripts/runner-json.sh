#!/usr/bin/env bash
# Turns a runner setting into the JSON that `runs-on: ${{ fromJSON(...) }}` expects.
#   "self-hosted,complymgmt-frontend-staging"  -> ["self-hosted","complymgmt-frontend-staging"]
#   "some-label"                                -> "some-label"
# Deploys and rollbacks run on a self-hosted runner on the target server, so the value is required.
set -euo pipefail
value="${1:?usage: runner-json.sh <runner labels, comma-separated>}"
jq -cn --arg v "$value" '$v | split(",") | map(gsub("^\\s+|\\s+$"; "")) | map(select(. != ""))
  | if length == 1 then .[0] else . end'
