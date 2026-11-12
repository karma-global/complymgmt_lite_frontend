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
                         deploy, on the server's own runner (production waits for approval)
                           stage ─► activate (switch `current` symlink) ─► health check
                                                                               │ fails
                                                                               ▼
                                                     automated rollback to the release live before
```

The servers serve **static files** (nginx); no Node process runs on them. A release is a directory, and
going live or rolling back is an atomic symlink switch, so neither needs a web server restart or sudo.

**No SSH.** Every server runs its own self-hosted GitHub Actions runner for this repo, as the user that
owns `DEPLOY_PATH`. The deploy and rollback jobs run there and call `deploy/remote.sh` on the local
filesystem. The runner only makes outbound HTTPS connections to GitHub, so no inbound port, SSH key or
host key is involved. Building and notifications stay on GitHub-hosted runners.

## Files

| Path | What it does |
|------|--------------|
| `.github/workflows/ci.yml` | Pull requests into `develop`/`main`: install, lint gate, build. |
| `.github/workflows/deploy.yml` | Push to `develop`/`main` (or *Run workflow* on them): build, deploy, health check, automated rollback. |
| `.github/workflows/rollback.yml` | Manual rollback (or just list releases) for either environment. |
| `.github/workflows/push-alert.yml` | Loud notice for every push to `develop`/`main` (direct and force pushes flagged). |
| `.github/scripts/notify.sh` | Sends a message to Slack, Teams and/or email, whichever is configured. |
| `.github/scripts/lint-ratchet.sh` | Fails a PR only if it adds ESLint errors (the codebase still has ~330 old ones). |
| `.github/scripts/runner-json.sh` | Turns `STAGING_RUNNER`/`PRODUCTION_RUNNER` (the server's runner labels) into a `runs-on` value. |
| `deploy/remote.sh` | Runs on the server: `activate`, `rollback`, `list`, `current`. Copied to `DEPLOY_PATH/incoming/` on every run. |
| `deploy/healthcheck.sh` | Runs on the server's runner: waits for `APP_URL/version.json` to report the new release, then checks it stays healthy. |
| `deploy/nginx/complymgmt_lite.conf` | Example nginx site (SPA fallback, caching, old-chunk fallback). |
| `deploy/nginx/staging.conf` | The staging site `http://complymgmt-lite.staging.kmc.com`: built files, `/api/` to the backend, HTTPS block ready. Template for other staging apps. |
| `deploy/nginx/00-default.conf` | Staging catch-all: closes connections for names no site claims. Once per server. |

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
staging, `deploy` on production): `sudo -u webdeploy bash $DEPLOY_PATH/incoming/remote.sh list $DEPLOY_PATH`,
then `... rollback $DEPLOY_PATH [<release-id>]`.

## One-time server setup (each server, cloud or on-prem)

Any Linux server with nginx (or any web server that can serve a directory and fall back to
`index.html`). Staging and production can share a host with different `DEPLOY_PATH`s and server names.

```bash
# 1. A deploy user that owns the app directory (no sudo needed for deploys). Reuse the server's
#    existing deploy user if it has one (production reuses `deploy`, which also deploys the backend).
sudo useradd --create-home --shell /bin/bash deploy        # only if there is none yet
sudo mkdir -p /var/www/complymgmt_lite
sudo chown deploy:deploy /var/www/complymgmt_lite
#    nginx (user nginx / www-data) must be able to read it:
sudo chmod 755 /var/www/complymgmt_lite

# 2. nginx site: root is DEPLOY_PATH/current
sudo cp deploy/nginx/complymgmt_lite.conf /etc/nginx/conf.d/complymgmt_lite.conf   # edit server_name/TLS/root
sudo nginx -t && sudo systemctl reload nginx
#    RHEL/Fedora with SELinux: let nginx read the directory
sudo semanage fcontext -a -t httpd_sys_content_t '/var/www/complymgmt_lite(/.*)?' && sudo restorecon -R /var/www/complymgmt_lite

# 3. A GitHub Actions runner for this repo, running as the deploy user. A repo admin gets the token from
#    Settings -> Actions -> Runners -> New self-hosted runner (or:
#    gh api -X POST repos/karma-global/complymgmt_lite_frontend/actions/runners/registration-token --jq .token)
#    A runner registered for another repo (e.g. the backend's) can't take this repo's jobs, so add a
#    second one in its own directory, even when it runs as the same user.
sudo -iu deploy
mkdir actions-runner-frontend && cd actions-runner-frontend
# curl + tar lines from the GitHub page, then:
./config.sh --url https://github.com/karma-global/complymgmt_lite_frontend --token <TOKEN> \
  --name complymgmt-frontend-<env> --labels complymgmt-frontend-<env> --unattended
exit
cd ~deploy/actions-runner-frontend && sudo ./svc.sh install deploy && sudo ./svc.sh start

# 4. The health check runs on this server, so APP_URL must answer from here
curl -sI <APP_URL>     # if it doesn't (no hairpin NAT / internal DNS): 127.0.0.1 <host> in /etc/hosts
```

Server needs: `bash`, `tar`, `flock` (util-linux), GNU `mv` (`-T`) and `curl`. No Node.js (the runner
brings its own).

## Staging server (on-prem, shared): `http://complymgmt-lite.staging.kmc.com`

Staging (`stage-server`, 192.168.1.218, Rocky Linux 10, SELinux enforcing, FIPS mode) gets the same
model as production: nginx serving the built files, no Node process, no supervisord. It is on a
private network, so GitHub can't reach it; a self-hosted runner on the server itself picks up the
deploy job (it only connects out to GitHub), downloads the build and puts it in place.

### Multi-site staging: the convention

The server hosts several apps, one hostname each, all on port 80/443 of the same nginx:

```
AD DNS     *.staging.kmc.com -> 192.168.1.218        one wildcard record for every app
Name       <app>.staging.kmc.com                     e.g. complymgmt-lite.staging.kmc.com
nginx      /etc/nginx/conf.d/00-default.conf         names no site claims: connection closed
           /etc/nginx/conf.d/<app>.conf              /      -> /var/www/<app>/current
                                                     /api/  -> 127.0.0.1:<backend port>, prefix stripped
Files      /var/www/<app>/{releases,current,previous}, owned by webdeploy
Runner     one per repo, run as webdeploy, label <app>-staging
HTTPS      one internal-CA certificate for *.staging.kmc.com, shared by every site
```

- **Environment as the parent** (`<app>.staging.kmc.com`): one DNS record and one certificate cover
  every app. A certificate wildcard only covers one level, so don't nest deeper names under it.
- **API on the same hostname, under `/api/`**: the browser only talks to the site's own origin, so the
  backend needs no CORS entry per hostname, and backend ports aren't called from browsers. The app is
  built with `VITE_API_BASE_URL=/api`.
- **A new app** copies `deploy/` and the workflows, picks `<app>`, adds its own `<app>.conf` (this
  repo's `deploy/nginx/staging.conf` is the template: change `server_name`, the two `root` paths and
  the backend port), registers its own runner and sets its own `DEPLOY_PATH` and `APP_URL`. DNS and
  the certificate need nothing.

### Setting up this app

**1. DNS.** Once for all apps: in the AD DNS zone `kmc.com`, a host record `*.staging` →
192.168.1.218. The server itself doesn't use the AD DNS and the health check runs there, so it gets
`127.0.0.1 complymgmt-lite.staging.kmc.com` in `/etc/hosts` (check with `getent hosts`).

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
sudo setsebool -P httpd_can_network_connect 1    # SELinux: let nginx reach backends for /api/

sudo useradd --create-home --shell /bin/bash webdeploy
sudo mkdir -p /var/www/complymgmt_lite
sudo chown webdeploy:webdeploy /var/www/complymgmt_lite && sudo chmod 755 /var/www/complymgmt_lite
sudo restorecon -Rv /var/www/complymgmt_lite       # SELinux label nginx may read

# From this repo, copied over first (scp deploy/nginx/00-default.conf deploy/nginx/staging.conf stage-server:)
sudo cp ~/00-default.conf /etc/nginx/conf.d/00-default.conf      # once per server
sudo cp ~/staging.conf /etc/nginx/conf.d/complymgmt-lite.conf
sudo nginx -t && sudo systemctl reload nginx
```

**4. Runner for this repo** (the deploy job runs here, as `webdeploy`, and writes the files directly;
there is no SSH). The runner already on the server (`deploy` user) is registered to the
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

If the service won't start under SELinux, label it: `sudo semanage fcontext -a -t bin_t
'/home/webdeploy/actions-runner-frontend/runsvc.sh' && sudo restorecon -v .../runsvc.sh`.

**5. API through nginx.** The site's `/api/` goes to the staging backend on `127.0.0.1:9001` with the
`/api` prefix removed; the app's own paths keep theirs, so `/api/api/v1/login` arrives as
`/api/v1/login`. Build with `VITE_API_BASE_URL=/api` (step 6). Requests are then same-origin, so the
backend's `CORS_ALLOWED_ORIGINS` needs nothing for staging. Uploads up to 100 MB pass nginx (the
backend's own limit is 50 MB).

**6. GitHub values** (see *GitHub setup* below for where they go):

| Name | Value |
|------|-------|
| `STAGING_ENV_FILE` (repo secret) | `/var/www/complymgmt_lite.vite-old/.env.stage` with `VITE_API_BASE_URL=/api` |
| `STAGING_RUNNER` (repo variable) | `self-hosted,complymgmt-frontend-staging` |
| `DEPLOY_PATH` | `/var/www/complymgmt_lite` |
| `APP_URL` | `http://complymgmt-lite.staging.kmc.com` |

**7. First deploy.** *Actions → Deploy → Run workflow* on `develop` (or merge into `develop`). When it
is green, `curl http://complymgmt-lite.staging.kmc.com/version.json` shows the release, a POST to
`/api/api/v1/login` with no body gets the backend's JSON error, and the old
`/var/www/complymgmt_lite.vite-old` folder can go.

HTTPS: once the internal CA issues the shared `*.staging.kmc.com` certificate, enable the 443 blocks
in `deploy/nginx/00-default.conf` and `deploy/nginx/staging.conf`, and set `APP_URL` to
`https://complymgmt-lite.staging.kmc.com`.

## Production server: `https://complymgmt.ai`

`prod-server` (Azure VM, Ubuntu 24.04) already runs nginx with TLS for `complymgmt.ai` and the backend
`api.complymgmt.ai`. The frontend reuses the server's `deploy` user, which already deploys the backend
through its own runner (`~deploy/actions-runner`, backend repo only).

**1. Runner for this repo**, as `deploy`, in `~deploy/actions-runner-frontend` (step 3 of *One-time
server setup*), with name and label `complymgmt-frontend-production`.

**2. Turn the hand-copied build into the first release.** Before the pipeline, `/var/www/complymgmt_lite`
held a build copied there by hand, which nginx served directly. Packaging it as a release keeps the site
up through the switch and gives the first pipeline deploy something to roll back to:

```bash
sudo chown -R deploy:deploy /var/www/complymgmt_lite
sudo -iu deploy
id=20261008T151609Z-9eda8c2          # when it was copied, and main at the time
tmp=$(mktemp -d)
cp -a /var/www/complymgmt_lite/{assets,index.html,vite.svg} "$tmp/"
printf '{"release":"%s","commit":"9eda8c2","branch":"main","builtAt":"2026-10-08T15:16:09Z","run":"hand-copied before the pipeline"}\n' "$id" > "$tmp/version.json"
tar -czf "/tmp/$id.tar.gz" -C "$tmp" . && rm -rf "$tmp"
curl -fsSLo /tmp/remote.sh https://raw.githubusercontent.com/karma-global/complymgmt_lite_frontend/develop/deploy/remote.sh
bash /tmp/remote.sh activate /var/www/complymgmt_lite "$id" "/tmp/$id.tar.gz"
exit
```

**3. Point nginx at `current`.** In `/etc/nginx/sites-available/complymgmt.ai.conf` (back it up first),
change `root /var/www/complymgmt_lite/;` to `root /var/www/complymgmt_lite/current;` and add
`location = /version.json { add_header Cache-Control "no-store"; }`. Then
`sudo nginx -t && sudo systemctl reload nginx`. `curl https://complymgmt.ai/version.json` should now show
the release from step 2, and the site should look the same. After that, the old top-level `assets/`,
`index.html` and `vite.svg` can be deleted.

**4. GitHub values.** `PRODUCTION_ENV_FILE` (repo secret) is `.env.prod`
(`VITE_API_BASE_URL=https://api.complymgmt.ai/`). `PRODUCTION_RUNNER` (repo variable) is
`self-hosted,complymgmt-frontend-production`. On the `production` environment, set `DEPLOY_PATH` to
`/var/www/complymgmt_lite` and `APP_URL` to `https://complymgmt.ai`, plus required reviewers and the
`main` branch rule.

## GitHub setup

**Settings → Secrets and variables → Actions → Repository secrets**

| Secret | Value |
|--------|-------|
| `STAGING_ENV_FILE` | Full contents of `.env.stage` (`VITE_API_BASE_URL=/api`, `VITE_SECRET_KEY=...`) |
| `PRODUCTION_ENV_FILE` | Full contents of `.env.prod` |

These are repository secrets (not environment secrets) so the build can run before production approval.
Remember that every `VITE_*` value ends up in the public JavaScript bundle; nothing in these files is
hidden from users, so never put server-side secrets there.

**Settings → Variables → Actions → Repository variables**

| Variable | Value |
|----------|-------|
| `STAGING_RUNNER` | Labels of the staging server's runner, e.g. `self-hosted,complymgmt-frontend-staging` |
| `PRODUCTION_RUNNER` | Labels of the production server's runner, e.g. `self-hosted,complymgmt-frontend-production` |

Required: a deploy or rollback stops at *Plan* when its runner variable is empty.

**Settings → Environments**: create `staging` and `production`, each with these variables (no secrets:
the runner is already on the server, as the right user):

| Variable | Value |
|----------|-------|
| `DEPLOY_PATH` | `/var/www/complymgmt_lite` |
| `APP_URL` | URL the health check hits **from the server**, e.g. `https://complymgmt.ai` |
| `KEEP_RELEASES` | Optional, default `5` |

On **production** also set:
- *Required reviewers*: who approves production deploys (and production rollbacks, since the Rollback
  workflow uses the same environment). Turn off *Prevent self-review* if one person must be able to
  roll back alone in an emergency.
- *Deployment branches and tags*: selected branches → `main`. Staging: `develop`.

**Fork pull requests** (Settings → Actions → General → *Fork pull request workflows from outside
collaborators*): choose **Require approval for all outside collaborators**. The repo is public, and a
fork's PR runs its own copy of the workflows, which could otherwise target the self-hosted runners on
the staging and production servers.

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

## Where each job runs

| Job | Runner |
|-----|--------|
| CI, Plan, Build, Notify | GitHub-hosted (`ubuntu-latest`); Node.js and the build never touch the servers |
| Deploy, Rollback | The target server's own self-hosted runner (`STAGING_RUNNER` / `PRODUCTION_RUNNER`) |

A server only needs outbound HTTPS to GitHub; nothing connects into it. That works the same for a cloud
VM and for an on-prem box on a private network (like staging).

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
