#!/usr/bin/env bash
# Runs on the target server (staging or production), uploaded fresh by every pipeline run.
#
# Layout under BASE (DEPLOY_PATH):
#   releases/<release-id>/   one directory per build (static files from vite build)
#   current  -> releases/<id>   what the web server serves (nginx root = BASE/current)
#   previous -> releases/<id>   the release `rollback` returns to
#   incoming/                   uploaded tarballs waiting to be unpacked
#   deploy.log                  one line per activate/rollback
#
# Usage:
#   remote.sh activate <base> <release-id> <tarball>
#   remote.sh rollback <base> [release-id]     (no id: back to `previous`)
#   remote.sh list     <base>
#   remote.sh current  <base>
#
# Switching is a symlink rename, so it is atomic and needs no web server restart (and no sudo).
set -euo pipefail

KEEP_RELEASES="${KEEP_RELEASES:-5}"
ACTOR="${DEPLOY_ACTOR:-manual}"

die() { echo "remote.sh: $*" >&2; exit 1; }

[ $# -ge 2 ] || die "usage: remote.sh <activate|rollback|list|current> <base> [...]"
cmd="$1"
base="${2%/}"
[ -d "$base" ] || die "base directory $base does not exist (run the one-time server setup first)"
mkdir -p "$base/releases" "$base/incoming"

# One deploy or rollback at a time per server
exec 9>"$base/.deploy.lock"
flock -w 300 9 || die "another deploy or rollback is holding $base/.deploy.lock"

target_of() { # release id a symlink points at, or empty
  local link="$base/$1"
  [ -L "$link" ] && basename "$(readlink "$link")" || true
}

point() { # point <link-name> <release-id>, atomically
  ln -sfn "releases/$2" "$base/.$1.tmp"
  mv -Tf "$base/.$1.tmp" "$base/$1"
}

check_dir() { # check_dir <dir> <release-id>
  [ -f "$1/index.html" ] || die "release $2 has no index.html"
  [ -f "$1/version.json" ] || die "release $2 has no version.json"
}

check_release() {
  [ -d "$base/releases/$1" ] || die "release $1 not found in $base/releases"
  check_dir "$base/releases/$1" "$1"
}

valid_id() { [[ "$1" =~ ^[0-9]{8}T[0-9]{6}Z-[0-9a-f]{7,40}$ ]] || die "bad release id: $1"; }

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $* by $ACTOR" >> "$base/deploy.log"; }

prune() {
  local keep_current keep_previous
  keep_current="$(target_of current)"
  keep_previous="$(target_of previous)"
  # Release ids start with a UTC timestamp, so name order is age order
  ls -1 "$base/releases" | sort -r | tail -n +"$((KEEP_RELEASES + 1))" | while read -r old; do
    if [ "$old" = "$keep_current" ] || [ "$old" = "$keep_previous" ]; then continue; fi
    rm -rf "${base:?}/releases/$old"
    echo "pruned release $old"
  done
  find "$base/incoming" -type f -mtime +2 -delete
}

case "$cmd" in
  activate)
    [ $# -eq 4 ] || die "usage: remote.sh activate <base> <release-id> <tarball>"
    id="$3"; tarball="$4"
    valid_id "$id"
    was="$(target_of current)"

    if [ "$id" = "$was" ]; then
      echo "release $id is already live"
      rm -f "$tarball"
      exit 0
    fi

    if [ -d "$base/releases/$id" ]; then
      # Re-running an older pipeline run: its release is still here, so just switch back to it
      echo "release $id is already on the server; switching to it"
    else
      [ -f "$tarball" ] || die "tarball $tarball not found"
      # Unpack beside the live releases; `current` is untouched until the release checks out
      partial="$base/releases/.$id.partial"
      rm -rf "$partial"; mkdir -p "$partial"
      tar -xzf "$tarball" -C "$partial"
      # A bad build never enters releases/, so it can't take a slot from a good one
      ( check_dir "$partial" "$id" ) || { rm -rf "$partial" "$tarball"; exit 1; }
      mv "$partial" "$base/releases/$id"
    fi
    check_release "$id"

    if [ -n "$was" ]; then point previous "$was"; fi
    point current "$id"
    rm -f "$tarball"
    log "activate $id (was ${was:-none})"
    echo "activated $id (previous: ${was:-none})"
    # The new release is live at this point; a pruning problem must not fail the deploy
    prune || echo "warning: pruning old releases failed" >&2
    ;;

  rollback)
    was="$(target_of current)"
    if [ $# -ge 3 ] && [ -n "$3" ]; then
      to="$3"
    else
      to="$(target_of previous)"
      [ -n "$to" ] || die "no previous release to roll back to"
    fi
    valid_id "$to"
    [ "$to" != "$was" ] || die "release $to is already live"
    check_release "$to"
    point current "$to"
    if [ -n "$was" ]; then point previous "$was"; fi
    log "rollback to $to (was ${was:-none})"
    echo "rolled back to $to (previous: ${was:-none})"
    ;;

  list)
    cur="$(target_of current)"; prev="$(target_of previous)"
    ls -1 "$base/releases" | grep -v '^\.' | sort -r | while read -r r; do
      mark=""
      [ "$r" = "$cur" ] && mark=" <- current"
      [ "$r" = "$prev" ] && mark=" <- previous"
      echo "$r$mark"
    done
    ;;

  current)
    target_of current
    ;;

  *)
    die "unknown command: $cmd"
    ;;
esac
