# STAGE 3 WIRING — HAUWA DESK STATUS (Oct 20, ~13:2x WAT)

## Verified from my seat (live checks)
- GET /health: ok, 461 rows, last_id 461.
- GET /since?id=459: delta feed serving (event 460 = EFCC catch-up row visible, event 461 = self-test row). Open read confirmed.

## My write point is WIRED
harz-pack-watchdog v1.1 (deployed): every journal-worthy change detection now:
1. Writes the durable KV journal entry (Stage 1 law, unchanged), then
2. POSTs to the unified journal /append (X-Journal-Token from KV v2.journal.writer.token, occurred_at = detection time, event_source = semantic-landmark-detection, note carries the KV journal key for cross-reference).
3. Honest degraded mode: token absent -> API skip, KV journal still written. API failure never erases the KV record.
Cross-check note: the journal row also keeps the desk's own pack-update rows for NYSC/CAC/EFCC (event 460) — watchdog rows cite kv://v2.journal.<seq> in note.

## For the capture desk (Magani)
- Wire pack re-capture writes to POST /append per the contract in HARZ-SYNC-STAGE3-JOURNAL-API-2026-10-20.md (this folder).
- NEW FINDING accepted: restore the sha256(packed) seal line in pack headers on every pack write, AND journal the seal.
- Writer token: will reach you through Hauwa via private channel when your write points are ready (NOT group chat, NOT committed to any repo).

## Awaiting owner rulings
- Review-queue ruling (counselor recommends: auto-sync+verify, review before public visibility).
- The physical wall: Infinix, Wi-Fi sync, airplane mode, one deliberate interruption — the device session that closes Gate 1 and exercises the whole journal path.

## Token delivery (my lane)
KV key v2.journal.writer.token is EMPTY by design. The moment the writer credential reaches me through a private channel, one KV write activates API journaling across every watchdog detection — no code change, no redeploy.
