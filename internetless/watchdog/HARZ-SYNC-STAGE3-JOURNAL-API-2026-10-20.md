# HARZ SYNC — STAGE 3 FROM SEAT A: JOURNAL API LIVE
*Oct 20, 2026. Follows the reviewer's two findings and the committed hook spec. Companion reports: HARZ-SYNC-STAGE1-2-BUILD-REPORT-2026-10-20.md.*

## Finding 1 — FIXED: true chronology

- `occurred_at` (when it happened) and `event_source` columns added; `ts` now means strictly "when it was journaled."
- All 457 founding rows backfilled with their true event times (baseline: Oct 17 re-seal; hash-rebinds: Oct 17 integrity repair; reseals: Oct 17 pack reseal). Verified: every row carries occurred_at.

## Finding 2 — JOURNALED: the pack gap, with one new honest discovery

- Catch-up rows added (kind `pack-update`, version 2, origin `desk-pack-pipeline`): all three packs changed since the Oct 17 reseal —
  nysc.gov.ng fc995ce3 → 72fefe8f, cac.gov.ng 2d732442 → 04db1a3c, efcc.gov.ng 663dd7e3 → ab114f74.
- occurred_at is NULL on these rows, honestly: the source pipeline recorded no change time. This is exactly what the wiring fixes.
- NEW FINDING for the desk: the current pack headers no longer carry the `sha256(packed):` seal line at all — the Oct 17 sealing convention did not survive the pack updates. Pack-write wiring must restore sealing AND journal it.

## THE JOURNAL API — BUILT, DEPLOYED, END-TO-END TESTED

Worker: `harz-sync-journal` at https://harz-sync-journal.hamzarabiu390.workers.dev (D1-bound to the existing corpus database; no new storage deps; workers.dev route had to be enabled post-deploy — now on).

**Contract for the desks (the hook spec, executable):**

1. `GET /health` — open. Returns `{ok, rows, last_id}`.
2. `POST /append` — token-gated (`X-Journal-Token` header). Body: `{kind, resource_url, store, doc_id, version, origin, old_sha256, new_sha256, occurred_at, event_source, note}`. Inserts a row in state `pending`. EVERY write point journals here: wave ingest (new/updated docs), pack re-capture, registry reseals.
3. `GET /since?id=N&limit=M` — OPEN READ (truth is public). The delta feed: a device asks "what changed since journal id N" and gets the events. This is the online→device incremental basis.
4. `GET /pending` — token-gated. The undelivered queue.
5. `POST /ack {id, ack_hash}` — token-gated. Delivery receipt: sets `delivered` + `delivered_at` + receipt hash. A change is delivered only after this.

**State language (unified, both layers): `pending` → `delivered` → `recorded`.**

**End-to-end test evidence (live, Oct 20 11:59 UTC):**
- append WITH token → row 461, state pending, occurred_at distinct from journal ts
- append WITHOUT token → HTTP 401 (twice, including once pre-route where the wall returned 404 — now clean 401)
- `/since?id=460` → the new event in the delta feed
- `/pending` → 1 event queued
- `/ack` → state delivered, receipt `stage3-selftest-receipt`, timestamp recorded

## Status

- Writer token: set as the worker's secret, archived conversation-side. Delivery to the desks happens via Yaya's word when the desks are ready to wire (recommend handover through a private channel, not group chat).
- Remaining for the desks: wire their write points to `POST /append`; restore pack sealing on pack writes; device sync receipts via `/ack`.
- Still awaiting Yaya: the review-queue ruling (auto-sync+verify, review before public visibility — recommended).
- The physical wall is unchanged: Infinix, WiFi sync, airplane mode, one deliberate interruption.
