# DEPLOY DIRECTIVE — harz-pack-watchdog (Oct 20, owner ruling: living mirror)

## Owner ruling (verbatim intent)
"I want the library to be updating the preserved sites the second there is a change online, so that no new added information will escape us."

## What exists and is ready
- Worker code: harz-pack-watchdog.js (this folder, detection-only, honest law: no fabrication, first-seen = baseline not a change, fetch failure is not a change).
- Watchmap: v2.watchmap ALREADY LIVE IN KV (4 sites, 82 pages: sec.gov.ng 25, nysc.gov.ng 37, cac.gov.ng 15, efcc.gov.ng 6 — all URLs verified 200 on Oct 20).
- Queue key on change: v2.recapture.queue (JSON {queued_at, changes[]}).
- Optional wake: v2.wake.url (agent webhook; empty until set).

## Deploy steps (Magani, one shot)
1. Create worker "harz-pack-watchdog" from harz-pack-watchdog.js (module syntax).
2. Bind KV: HARZ_BROWSER -> namespace 409fead4fdc24e288efe5af2bb5a1de7.
3. Add cron trigger: */15 * * * * (free-tier floor; "the second" is honestly "within ~15 minutes").
4. Verify: after 15 min, KV keys v2.watch.* and v2.watchts.* appear; v2.watch.lastcheck set.

## After deploy (Hauwa's lane)
- Wake webhook (Base44 inbound) -> set v2.wake.url -> automatic recapture by the capture agent.
- Incremental phone sync (per-pack sha256, re-pull only changed packs).
- Freshness labels in the library ("checked HH:MM, no change" / "updated X ago").
