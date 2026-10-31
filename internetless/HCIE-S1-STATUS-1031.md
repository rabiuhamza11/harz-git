# HCIE S1 — WATCHER→RECAPTURE WIRING (Oct 31, 2026, Team F)

## DONE (deployed, live)
- harz-pack-watchdog v1.0 deployed on account 1 (c0bea6cf…): detection (checkSlice) + NEW consumer (drain) in one worker, cron */15 preserved, KV HARZ_BROWSER preserved, RECAPTURE_KEY secret set.
- New routes: GET /run?k=… (manual drain), POST (wake from detection), /health (v1.0 live, verified 200).
- Drain logic: fetch changed URL → canonical landmark hash (identical algorithm to detection) → verify against detection baseline → store immutable capture (v2.capture.<page>, doc_sha256 + landmark_sha256) → freshness stamp → receipt log (v2.recapture.log) → queue rotation.
- Real queue confirmed: sec.gov.ng/for-investors/whistleblowing/ queued 2026-10-29T10:15:33Z by live detection.

## WALL FOUND (honest engineering finding)
- First drain attempt: fetch+hash of the SEC page SUCCEEDED, then failed at first KV put: "KV put() limit exceeded for the day."
- Root cause: KV free tier = 1,000 puts/day. The watchdog's own write pattern (40 pages/sweep × baselines + journal entries + misses, every 15 min) exhausts it before any recapture can persist. Detection has been writing on a budget it structurally overruns.
- CORRECTION (S1.5, next slice): move write-heavy state to D1 (free tier ~100,000 row-writes/day): watchmap baselines, journal, recapture queue, capture log. Keep KV for read/CDN keys (packs, shell) only. This also serves "Cloudflare may host HARZ, never define HARZ" — the state becomes queryable and portable.

## STATUS
- S1 code: DONE + DEPLOYED. S1 execution: BLOCKED by today's KV write cap (resets UTC midnight). No fabrication: the SEC change remains queued; it will be captured on the first successful drain.
- Next: S1.5 D1 state migration → then full-cycle real-change proof end to end.
