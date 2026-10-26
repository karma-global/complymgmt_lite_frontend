#!/usr/bin/env bash
# Turns a runner setting into the JSON that `runs-on: ${{ fromJSON(...) }}` expects.
#   ""                     -> "ubuntu-latest"           (GitHub-hosted, server reachable over the internet)
#   "ubuntu-latest"        -> "ubuntu-latest"
#   "self-hosted,onprem"   -> ["self-hosted","onprem"]  (a runner inside the server's network)
set -euo pipefail
value="${1:-ubuntu-latest}"
jq -cn --arg v "$value" '$v | split(",") | map(gsub("^\\s+|\\s+$"; "")) | map(select(. != ""))
  | if length == 1 then .[0] else . end'
