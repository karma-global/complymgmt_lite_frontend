#!/usr/bin/env bash
# Sends one notification to every channel that is configured: Slack, Microsoft Teams, email (SMTP).
# Channels without settings are skipped. Exits 1 if a configured channel fails, so the workflow run
# turns red (and GitHub emails whoever triggered it) instead of the message silently going nowhere.
#
# Message (env):
#   NOTIFY_STATUS  success | info | warning | failure   (sets colour and emoji)
#   NOTIFY_TITLE   one line
#   NOTIFY_BODY    plain text, may be multi-line
#   NOTIFY_URL     link to the run / commits (optional)
#
# Channels (env, from repository secrets; all optional):
#   SLACK_WEBHOOK_URL   Slack incoming webhook
#   TEAMS_WEBHOOK_URL   Teams channel webhook (Workflows "Post to a channel when a webhook request is
#                       received", or a legacy incoming webhook)
#   SMTP_URL            e.g. smtp://smtp.office365.com:587 (STARTTLS) or smtps://smtp.gmail.com:465
#   SMTP_USERNAME / SMTP_PASSWORD
#   NOTIFY_EMAIL_FROM   sender address (defaults to SMTP_USERNAME)
#   NOTIFY_EMAIL_TO     comma-separated recipients
#
# Fallback when none of those is set: GitHub's own email. The message is posted as a comment on one
# open issue labelled `alerts` (created on first use), @mentioning NOTIFY_GITHUB_MENTIONS (repository
# variable, e.g. "@alice @bob"; defaults to whoever triggered the run, because the repo owner is an
# organization and mentioning it notifies nobody). GitHub emails the people mentioned and everyone
# subscribed to that issue. Needs GH_TOKEN with `issues: write`.
set -uo pipefail

status="${NOTIFY_STATUS:-info}"
title="${NOTIFY_TITLE:?NOTIFY_TITLE is required}"
body="${NOTIFY_BODY:-}"
url="${NOTIFY_URL:-}"
repo="${GITHUB_REPOSITORY:-complymgmt_lite}"

case "$status" in
  success) color="#2EB67D"; emoji="✅" ;;
  warning) color="#ECB22E"; emoji="🚨" ;;
  failure) color="#E01E5A"; emoji="❌" ;;
  *)       color="#1D9BD1"; emoji="ℹ️" ;;
esac
# The title may already start with its own emoji (🔥 for a force push)
case "$title" in [[:alnum:]]*) title="$emoji $title" ;; esac

sent=0; failed=0
ok()   { echo "notify: sent to $1"; sent=$((sent + 1)); }
fail() { echo "::warning::notify: $1 failed: $2"; failed=$((failed + 1)); }

post_json() { # post_json <name> <url> <json>
  local code
  code="$(curl -sS -o "$RUNNER_TEMP/notify-resp.txt" -w '%{http_code}' --max-time 20 \
    -H 'Content-Type: application/json' -d "$3" "$2" 2>&1)" || { fail "$1" "$code"; return; }
  case "$code" in 2*) ok "$1" ;; *) fail "$1" "HTTP $code $(head -c 300 "$RUNNER_TEMP/notify-resp.txt")" ;; esac
}

if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
  post_json Slack "$SLACK_WEBHOOK_URL" "$(jq -n --arg t "$title" --arg b "$body" --arg u "$url" --arg c "$color" '
    {text: $t, attachments: [{color: $c, text: ($b + (if $u != "" then "\n<" + $u + "|Open in GitHub>" else "" end))}]}')"
fi

if [ -n "${TEAMS_WEBHOOK_URL:-}" ]; then
  post_json Teams "$TEAMS_WEBHOOK_URL" "$(jq -n --arg t "$title" --arg b "$body" --arg u "$url" --arg s "$status" '
    {type: "message", attachments: [{contentType: "application/vnd.microsoft.card.adaptive", content: {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json", type: "AdaptiveCard", version: "1.4",
      msteams: {width: "Full"},
      body: [
        {type: "TextBlock", text: $t, weight: "Bolder", size: "Medium", wrap: true,
         color: ({success: "Good", warning: "Warning", failure: "Attention"}[$s] // "Default")},
        {type: "TextBlock", text: $b, wrap: true, fontType: "Monospace"}
      ],
      actions: (if $u != "" then [{type: "Action.OpenUrl", title: "Open in GitHub", url: $u}] else [] end)
    }}]}')"
fi

if [ -n "${SMTP_URL:-}" ] && [ -n "${NOTIFY_EMAIL_TO:-}" ]; then
  from="${NOTIFY_EMAIL_FROM:-${SMTP_USERNAME:-}}"
  mail="$RUNNER_TEMP/notify-mail.txt"
  rcpts=()
  IFS=',' read -ra to_list <<<"$NOTIFY_EMAIL_TO"
  for r in "${to_list[@]}"; do r="$(echo "$r" | xargs)"; [ -n "$r" ] && rcpts+=(--mail-rcpt "$r"); done
  # RFC 2047 so emoji in the subject survive
  subject="=?UTF-8?B?$(printf '[%s] %s' "${repo#*/}" "$title" | base64 -w0)?="
  {
    printf 'From: %s\r\nTo: %s\r\nSubject: %s\r\nDate: %s\r\nMIME-Version: 1.0\r\n' \
      "$from" "$NOTIFY_EMAIL_TO" "$subject" "$(LC_ALL=C date -R)"
    printf 'Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n'
    printf '%s\n' "$body"
    [ -n "$url" ] && printf '\n%s\n' "$url"
  } > "$mail"
  auth=()
  [ -n "${SMTP_USERNAME:-}" ] && auth=(--user "$SMTP_USERNAME:${SMTP_PASSWORD:-}")
  if out="$(curl -sS --max-time 30 --ssl-reqd --url "$SMTP_URL" "${auth[@]}" \
      --mail-from "$from" "${rcpts[@]}" --upload-file "$mail" 2>&1)"; then
    ok "email ($NOTIFY_EMAIL_TO)"
  else
    fail email "$out"
  fi
fi

notify_github() {
  [ -n "${GH_TOKEN:-}" ] || { echo "::error::notify: no channel set and no GH_TOKEN for the GitHub fallback"; return 1; }
  local label=alerts issue mentions safe_title file="$RUNNER_TEMP/notify-comment.md"
  issue="$(gh issue list --repo "$repo" --label "$label" --state open --limit 1 --json number --jq '.[0].number // empty')" || return 1
  if [ -z "$issue" ]; then
    gh label create "$label" --repo "$repo" --color D93F0B --description "Push and deploy alerts" >/dev/null 2>&1 || true
    issue="$(gh issue create --repo "$repo" --label "$label" --title "🔔 Push and deploy alerts" --body \
      "Every push to develop/main, deploy result and rollback is posted here by GitHub Actions. **Subscribe to this issue** to get them all by email. People in the NOTIFY_GITHUB_MENTIONS repository variable are @mentioned on each one.")" || return 1
    issue="${issue##*/}"
  fi
  mentions="${NOTIFY_GITHUB_MENTIONS:-@${GITHUB_ACTOR:-}}"
  # An "@name" inside a commit or PR title must not ping anyone: the body goes in a code block and
  # the title gets a zero-width space after each @
  safe_title="${title//@/@$'\u200b'}"
  {
    printf '### %s\n\n' "$safe_title"
    printf '````\n%s\n````\n\n' "$body"
    [ -n "$url" ] && printf '[Open in GitHub](%s)\n\n' "$url"
    printf 'cc %s\n' "$mentions"
  } > "$file"
  gh issue comment "$issue" --repo "$repo" --body-file "$file" >/dev/null || return 1
  echo "notify: posted to GitHub issue #$issue (mentions: $mentions); GitHub emails them and the issue's subscribers"
}

if [ $((sent + failed)) -eq 0 ]; then
  echo "No Slack/Teams/email channel is configured; using GitHub's email via the alerts issue."
  notify_github
  exit
fi
[ "$failed" -eq 0 ]
