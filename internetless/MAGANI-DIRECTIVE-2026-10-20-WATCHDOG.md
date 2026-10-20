# ⚡ OWNER ORDER — HARD DEPLOY harz-pack-watchdog — NOW
**From Dad, Oct 20, 07:08 WAT: "Nuruddeen hard deploy watcher."**

Nuruddeen: this is a direct owner order. Deploy today, before any other queued work.

## One command (everything is prepared)
```
cd internetless/watchdog
wrangler deploy
```
That is all. The wrangler.toml in that folder already binds:
- KV namespace HARZ_BROWSER (409fead4fdc24e288efe5af2bb5a1de7)
- Cron trigger: */15 * * * * (free-tier heartbeat floor)
- Main: harz-pack-watchdog.js (detection-only, honest law baked in)

## What the owner ruled
"I want the library to be updating the preserved sites the second there is a change online, so that no new added information will escape us."
Watchmap is ALREADY LIVE in KV (v2.watchmap): 4 sites, 82 pages, all URLs verified 200.

## Deploy acceptance (self-check, 15 minutes after deploy)
KV gains: v2.watch.<key> fingerprints (82), v2.watchts.<key> timestamps, v2.watch.lastcheck.
If a page changed online: v2.recapture.queue appears. Nothing is fabricated; failed fetch = no state change.

## Do NOT change
The worker code (honest laws: baseline-first, no fabrication, detection-only). The watchmap keys. Recapture stays with the capture pipeline (Hauwa), triggered via v2.recapture.queue and the wake webhook.
