# CI/CD: build, deploy and roll back

| Branch    | Environment | Deploys                              |
|-----------|-------------|--------------------------------------|
| `develop` | staging     | on every push (merged PR)            |
| `main`    | production  | on every push, after approval        |

```
PR into develop/main ──► CI: install · lint (no new errors) · build
                                   │ merge
                                   ▼
push to develop/main ──► Deploy: plan ─► build (once, with that env's VITE_* values)
                                              │  artifact: <release>.tar.gz (kept 30 days)
                                              ▼
                         deploy (production waits for approval)
                           upload ─► activate (switch `current` symlink) ─► health check
                                                                               │ fails
                                                                               ▼
                                                     automated rollback to the release live before
```

The servers serve **static files** (nginx); no Node process runs on them. A release is a directory, and
going live or rolling back is an atomic symlink switch, so neither needs a web server restart or sudo.

## Files

| Path | What it does |
|------|--------------|
| `.github/workflows/ci.yml` | Pull requests into `develop`/`main`: install, lint gate, build. |
| `.github/workflows/deploy.yml` | Push to `develop`/`main` (or *Run workflow* on them): build, deploy, health check, automated rollback. |
| `.github/workflows/rollback.yml` | Manual rollback (or just list releases) for either environment. |
| `.github/workflows/push-alert.yml` | Loud notice for every push to `develop`/`main` (direct and force pushes flagged). |
| `.github/scripts/notify.sh` | Sends a message to Slack, Teams and/or email, whichever is configured. |
| `.github/actions/ssh-setup` | Writes the deploy key and pinned host key under the runner's temp dir. |
| `.github/scripts/lint-ratchet.sh` | Fails a PR only if it adds ESLint errors (the codebase still has ~330 old ones). |
| `.github/scripts/runner-json.sh` | Turns `STAGING_RUNNER`/`PRODUCTION_RUNNER` into a `runs-on` value. |
| `deploy/remote.sh` | Runs on the server: `activate`, `rollback`, `list`, `current`. Uploaded on every run. |
| `deploy/healthcheck.sh` | Runs on the runner: waits for `/version.json` to report the new release, then checks it stays healthy. |
| `deploy/nginx/complymgmt_lite.conf` | Example nginx site (SPA fallback, caching, old-chunk fallback). |
| `deploy/nginx/staging.conf` | The staging site: `http://complymgmt.stage`, HTTPS block ready for an internal certificate. |

### Server layout (`DEPLOY_PATH`, e.g. `/var/www/complymgmt_lite`)

```
releases/20261016T101500Z-c0bacf1/   one directory per build; the 5 newest are kept (KEEP_RELEASES)
current  -> releases/<id>            nginx serves this
previous -> releases/<id>            where "rollback" goes; never pruned
incoming/                            uploads waiting to be unpacked
deploy.log                           who activated / rolled back what, and when
```

Every release contains `version.json` (release id, commit, branch, build time, run link), so
`curl https://<host>/version.json` always tells you exactly what a server is running.

## Rollback

**Automated.** After switching, `deploy.yml` waits up to 90s for `/version.json` to report the new
release, then requires 5 healthy checks in a row (app shell at `/` and the right version), 6s apart.
If anything fails after the switch, or the run is cancelled, it switches back to the release that was
live before, health-checks that, and marks the run failed (GitHub emails the person who pushed).
A build that is broken never goes live in the first place: `remote.sh` refuses a release without
`index.html`/`version.json`, and `current` is only switched after the release is fully unpacked.

**Manual, three ways** (fastest first):

1. **Rollback workflow**: *Actions → Rollback → Run workflow*. Pick the environment; leave *release*
   empty to go back one step (run it again to go forward), or paste a release id. Tick *list releases
   only* first if you want to see what's on the server. Takes seconds: nothing is rebuilt.
   GitHub only offers a manual-only workflow once it is on the default branch (`main`); until the
   pipeline has been merged into `main`, use 2 or the server command below.
2. **Re-run an old Deploy run**: open the Deploy run of the version you want and *Re-run jobs →
   deploy*. It re-uses that run's artifact (30 days), so it works even after the release was pruned
   from the server. If the release is still on the server it just switches to it.
3. **Revert in git**: `git revert` the bad merge on `develop`/`main` and push. Slowest, but it keeps
   the branch and the servers in agreement; do this after 1 or 2 so the next deploy doesn't bring the
   problem back.

On the server itself (e.g. GitHub is down), as the user that owns `DEPLOY_PATH` (`webdeploy` on
staging): `sudo -u webdeploy bash $DEPLOY_PATH/incoming/remote.sh list $DEPLOY_PATH`, then
`... rollback $DEPLOY_PATH [<release-id>]`.

## One-time server setup (each server, cloud or on-prem)

Any Linux server with nginx (or any web server that can serve a directory and fall back to
`index.html`). Staging and production can share a host with different `DEPLOY_PATH`s and server names.

```bash
# 1. A deploy user that owns the app directory (no sudo needed for deploys)
sudo useradd --create-home --shell /bin/bash deploy        # or reuse an existing user
sudo mkdir -p /var/www/complymgmt_lite
sudo chown deploy:deploy /var/www/complymgmt_lite
#    nginx (user nginx / www-data) must be able to read it:
sudo chmod 755 /var/www/complymgmt_lite

# 2. A key just for CI (on your machine), authorised for the deploy user. ECDSA, not ed25519: a server
#    in FIPS mode (like staging) rejects ed25519 keys without saying why ("Permission denied (publickey)")
ssh-keygen -t ecdsa -b 256 -N '' -C "github-actions complymgmt_lite <env>" -f ./complymgmt_lite_<env>
sudo -u deploy mkdir -p ~deploy/.ssh && sudo -u deploy chmod 700 ~deploy/.ssh
cat ./complymgmt_lite_<env>.pub | sudo -u deploy tee -a ~deploy/.ssh/authorized_keys
#    Optional hardening in authorized_keys: from="<runner IPs>",no-port-forwarding,no-pty ecdsa-sha2-nistp256 ...

# 3. nginx site
sudo cp deploy/nginx/complymgmt_lite.conf /etc/nginx/conf.d/complymgmt_lite.conf   # edit server_name/TLS/root
sudo nginx -t && sudo systemctl reload nginx
#    RHEL/Fedora with SELinux: let nginx read the directory
sudo semanage fcontext -a -t httpd_sys_content_t '/var/www/complymgmt_lite(/.*)?' && sudo restorecon -R /var/www/complymgmt_lite

# 4. The host key to pin in GitHub (run from a trusted network, check the fingerprint)
ssh-keyscan -p 22 <host>
```

Server needs: `bash`, `tar`, `flock` (util-linux), and GNU `mv` (`-T`). No Node.js.

## Staging server (on-prem): `http://complymgmt.stage`

Staging (`stage-server`, 192.168.1.218, Rocky Linux 10, SELinux enforcing) gets the same model as
production: nginx serving the built files, no Node process, no supervisord. It is on a private
network, so GitHub can't reach it; a self-hosted runner on the server itself picks up the deploy job
(it only connects out to GitHub), downloads the build and puts it in place.

**1. DNS.** Point `complymgmt.stage` at 192.168.1.218 in the internal DNS. The server must resolve the
name too (the health check runs there): check with `getent hosts complymgmt.stage`, or add
`127.0.0.1 complymgmt.stage` to `/etc/hosts`.

**2. Retire the Vite dev server** (staging is down from here until the first deploy lands):

```bash
sudo supervisorctl stop complymgmt_lite
sudo rm /etc/supervisord.d/complymgmt_lite.ini && sudo supervisorctl update
sudo mv /var/www/complymgmt_lite /var/www/complymgmt_lite.vite-old   # keep until .env.stage is in GitHub
```

**3. nginx and a deploy user** (a dedicated user: the existing `deploy` user is in the `docker` group,
which is root-equivalent, and the frontend only needs to write files):

```bash
sudo dnf install -y nginx
sudo systemctl enable --now nginx
sudo firewall-cmd --permanent --add-service=http --add-service=https && sudo firewall-cmd --reload

sudo useradd --create-home --shell /bin/bash webdeploy
sudo mkdir -p /var/www/complymgmt_lite
sudo chown webdeploy:webdeploy /var/www/complymgmt_lite && sudo chmod 755 /var/www/complymgmt_lite
sudo restorecon -Rv /var/www/complymgmt_lite       # SELinux label nginx may read

# deploy/nginx/staging.conf from this repo, copied over first (scp deploy/nginx/staging.conf stage-server:)
sudo cp ~/staging.conf /etc/nginx/conf.d/complymgmt_lite.conf
sudo nginx -t && sudo systemctl reload nginx
```

**4. SSH key for the runner** (runner and server are the same machine, so the key only works from localhost).
The server runs in FIPS mode (`cat /proc/sys/crypto/fips_enabled` → 1), so sshd accepts only ECDSA and
RSA keys; an ed25519 key fails with a bare "Permission denied (publickey)".

```bash
sudo -iu webdeploy
ssh-keygen -t ecdsa -b 256 -N '' -f ~/.ssh/ci_deploy -C "github-actions complymgmt_lite staging"
echo "from=\"127.0.0.1\" $(cat ~/.ssh/ci_deploy.pub)" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys
ssh-keyscan 127.0.0.1    # -> DEPLOY_KNOWN_HOSTS
cat ~/.ssh/ci_deploy     # -> DEPLOY_SSH_KEY, then: rm ~/.ssh/ci_deploy ~/.ssh/ci_deploy.pub
exit
```

**5. Runner for this repo.** The runner already on the server (`deploy` user) is registered to the
backend repo alone (`karma-global/complymgmt_lite`) and can't take this repo's jobs. Don't re-register
it for the whole organization to share it either: it runs as a member of the `docker` group (root in
effect), which jobs from a public repo should never get. A repo admin opens *Settings → Actions →
Runners → New self-hosted runner → Linux x64*, which shows the download commands and a token; run
them as `webdeploy` with this name and label:

```bash
sudo -iu webdeploy
mkdir actions-runner-frontend && cd actions-runner-frontend
# curl + tar lines from the GitHub page, then:
./config.sh --url https://github.com/karma-global/complymgmt_lite_frontend --token <TOKEN> \
  --name complymgmt-frontend-staging --labels complymgmt-frontend-staging --unattended
exit
cd /home/webdeploy/actions-runner-frontend && sudo ./svc.sh install webdeploy && sudo ./svc.sh start
```

If the service won't start under SELinux, apply whatever was done for the backend runner.

**6. Backend CORS.** The staging backend only accepts browser calls from origins listed in its
`CORS_ALLOWED_ORIGINS` env var; add `http://complymgmt.stage` (and `https://complymgmt.stage` once
TLS is on) and restart it.

**7. GitHub values** (see *GitHub setup* below for where they go):

| Name | Value |
|------|-------|
| `STAGING_ENV_FILE` (repo secret) | Contents of `/var/www/complymgmt_lite.vite-old/.env.stage` |
| `STAGING_RUNNER` (repo variable) | `self-hosted,complymgmt-frontend-staging` |
| `DEPLOY_HOST` | `127.0.0.1` |
| `DEPLOY_USER` | `webdeploy` |
| `DEPLOY_SSH_KEY` / `DEPLOY_KNOWN_HOSTS` | From step 4 |
| `DEPLOY_PATH` | `/var/www/complymgmt_lite` |
| `APP_URL` | `http://complymgmt.stage` |

**8. First deploy.** *Actions → Deploy → Run workflow* on `develop` (or merge into `develop`). When it
is green, `curl http://complymgmt.stage/version.json` shows the release, and the old
`/var/www/complymgmt_lite.vite-old` folder can go.

HTTPS: an internal-only name can't get a public certificate; with one from an internal CA, enable
the 443 block in `deploy/nginx/staging.conf` and set `APP_URL` to `https://complymgmt.stage`.

## GitHub setup

**Settings → Secrets and variables → Actions → Repository secrets**

| Secret | Value |
|--------|-------|
| `STAGING_ENV_FILE` | Full contents of `.env.stage` (`VITE_API_BASE_URL=...`, `VITE_SECRET=...`) |
| `PRODUCTION_ENV_FILE` | Full contents of `.env.prod` |

These are repository secrets (not environment secrets) so the build can run before production approval.
Remember that every `VITE_*` value ends up in the public JavaScript bundle; nothing in these files is
hidden from users, so never put server-side secrets there.

**Settings → Environments**: create `staging` and `production`, each with:

| Kind | Name | Value |
|------|------|-------|
| secret | `DEPLOY_HOST` | Server host name or IP (as reachable from the runner) |
| secret | `DEPLOY_USER` | `deploy` |
| secret | `DEPLOY_SSH_KEY` | Private key from step 2 |
| secret | `DEPLOY_KNOWN_HOSTS` | Output of `ssh-keyscan` from step 4 |
| variable | `DEPLOY_PATH` | `/var/www/complymgmt_lite` |
| variable | `APP_URL` | Public URL the health check hits, e.g. `https://stage.example.com` |
| variable | `DEPLOY_PORT` | Optional, default `22` |
| variable | `KEEP_RELEASES` | Optional, default `5` |

On **production** also set:
- *Required reviewers*: who approves production deploys (and production rollbacks, since the Rollback
  workflow uses the same environment). Turn off *Prevent self-review* if one person must be able to
  roll back alone in an emergency.
- *Deployment branches and tags*: selected branches → `main`. Staging: `develop`.

**Fork pull requests** (Settings → Actions → General → *Fork pull request workflows from outside
collaborators*): choose **Require approval for all outside collaborators**. The repo is public, and a
fork's PR runs its own copy of the workflows, which could otherwise target the self-hosted runner on
the staging server.

## Notifications (instead of branch protection)

The repo doesn't use branch protection, so pushes are made loud instead:

| Event | Message |
|-------|---------|
| PR merged into `develop`/`main` | ℹ️ who merged it, the commits |
| Direct push (no PR) | 🚨 who pushed, the commits, "skipped review and CI" |
| Force push / branch deleted | 🔥 alert with the compare link |
| Deploy finished | ✅ deployed / ❌ build failed / ❌ failed and automatically rolled back |
| Manual rollback | 🚨 from → to, who, and the reason given |

`push-alert.yml` sends the push messages; `deploy.yml` and `rollback.yml` send their results. All of them
use `.github/scripts/notify.sh` on GitHub-hosted runners (free for public repos), which sends to every
channel that has secrets set. Set any combination as **repository secrets**:

| Channel | Secrets |
|---------|---------|
| Slack | `SLACK_WEBHOOK_URL`: an [incoming webhook](https://api.slack.com/messaging/webhooks) for the channel |
| Microsoft Teams | `TEAMS_WEBHOOK_URL`: in the channel, *Workflows → "Post to a channel when a webhook request is received"*, and copy its URL |
| Email | `SMTP_URL`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `NOTIFY_EMAIL_TO` (comma-separated), optional `NOTIFY_EMAIL_FROM` |

Email examples: Microsoft 365 `smtp://smtp.office365.com:587` (the mailbox needs *Authenticated SMTP*
enabled), Google Workspace/Gmail `smtps://smtp.gmail.com:465` with an
[app password](https://support.google.com/accounts/answer/185833). Use a dedicated mailbox such as
`alerts@…`. If a configured channel fails, the run turns red, so GitHub's own failure email reaches
whoever triggered it.

**Nothing set? GitHub sends the email.** With none of the secrets above, each message is posted as a
comment on one open issue labelled `alerts` ("🔔 Push and deploy alerts", created on first use) that
@mentions the people in the repository variable `NOTIFY_GITHUB_MENTIONS` (e.g. `@alice @bob`;
defaults to whoever triggered the run). GitHub emails everyone mentioned (their *Participating,
@mentions* email setting, on by default) and everyone who subscribed to the issue, so teammates can
just click *Subscribe* on it. The repo is public, so these comments are public too; they only hold what is
already visible (commits, pusher, release ids, deploy results).

GitHub's built-in emails still apply on top: whoever triggers a failed run gets an email (default
setting), and anyone can *Watch → Custom → Pull requests* to hear about PRs.

## Cloud or on-prem: where the deploy job runs

Repository variables `STAGING_RUNNER` and `PRODUCTION_RUNNER` (Settings → Variables) choose it:

- **Empty / `ubuntu-latest`** (default): GitHub's runners SSH to the server. The server's SSH port must
  be reachable from the internet (restrict it to [GitHub's IP ranges](https://api.github.com/meta) or
  use a bastion), and `APP_URL` must be publicly reachable for the health check.
- **Self-hosted runner** for servers inside an office/datacenter network with no inbound access:
  install a [GitHub Actions runner](https://docs.github.com/actions/hosting-your-own-runners) on any
  machine in that network (it only makes outbound HTTPS connections to GitHub), give it a label, and
  set e.g. `PRODUCTION_RUNNER=self-hosted,onprem`. The runner needs `bash`, `ssh`, `scp`, `curl` and
  `tar`; `DEPLOY_HOST` and `APP_URL` can then be internal addresses. The build still runs on
  GitHub-hosted runners, so the on-prem machine needs no Node.js.

Each environment picks independently, e.g. staging in the cloud and production on-prem.

## Verifying a setup

1. Push to `develop` (or *Run workflow* on `develop`). Approve nothing: staging has no reviewers.
2. The run summary shows the release and the releases on the server; `curl $APP_URL/version.json`
   shows the same release.
3. *Rollback → staging*, empty release: the summary shows the previous release live; run it again
   to go back.
4. To see the automated rollback once: temporarily set staging's `APP_URL` to a wrong path
   (e.g. `https://stage.example.com/nope`) and push. The health check fails and the run switches back
   to the earlier release. The rollback's own health check fails too (same wrong URL), so confirm with
   the *Releases on the server* list in the summary, where the earlier release is `<- current`. Then
   restore `APP_URL`.
