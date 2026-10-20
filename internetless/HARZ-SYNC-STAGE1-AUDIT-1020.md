# HARZ SYNC — STAGE 1 AUDIT (Oct 20, 2026 ~12:45 WAT, Nuruddeen)
# Response to the Bidirectional Sync Engine design (owner-forwarded). Audit-first per law.

## HONEST VERDICT
Direction A (online -> device): ~60% built. Direction B (device -> online): 0% built.
The advisor's caution was correct: parts exist and must be reused, not rebuilt.

## The seven capabilities vs live system (evidence)
1. Durable change journal: ABSENT. Watchdog detects changes but no journal entry with delivery
   state exists anywhere durable. Build: v2.journal in KV (append entries: id, resource, version,
   origin, hash, state), periodic compaction (KV 25MB law).
2. Stable resource identity: PARTIAL. Corpus docs have stable ids + urlmap; pack pages have
   key identity (v2.pack.<domain>.<slug>). No version numbers anywhere. Reuse urlmap convention.
3. Version tracking: ABSENT. Freshness is by capture-date label only. Add version to journal +
   pack labels.
4. Content-addressed verification: PARTIAL. Corpus seal + byte-verified copies exist (proven);
   watchdog uses semantic landmarks (not content hashes); PACKS sha256 fields are PLACEHOLDERS
   ("—") — honest admission: per-resource hashes are NOT recorded today. Build: fill them.
5. Resumable transfer: ABSENT. SW downloads are atomic whole-value fetches; the 37MB mirror
   file is host-side sharding, not resumable. Later stage, not first.
6. Conflict detection: ABSENT (and currently moot — no device authoring path exists).
7. Delivery receipts: ABSENT. No ack channel from phone exists (no device telemetry at all).
   Build: guarded /ack route on ob-worker + sync-status UI with receipts.

## What exists and is reused (no rebuild)
Watchdog v0.9 (detection, 15-min, zero false positives, honest miss records), corpus seal +
seal header check, auto-heal packs + SW r11+ (pull-based distribution), urlmap identity,
freshness labels, .harz bundle design (already queued as the Gate1+Gate3 transfer unit —
it becomes the Stage-5 P2P unit too). KV/Workers/D1 only (R2 stays out, per owner law).

## Build order (grounded)
Phase 1: v2.journal + per-resource sha256 recording + pack labels gain version.
Phase 2: /ack receipt endpoint (guarded) + phone sync-status panel showing received/verified/pending.
Phase 3: interrupted-transfer deliberate failure test + the advisor's 9-step reconciliation test.
Phase 4: .harz bundle export/import ships (already designed).
Phase 5: P2P extends the same identity+hash+receipt model (after voice-mesh proof).

## Decision answered (pending owner final word)
Offline contributions: REVIEW QUEUE, endorsed by Nuruddeen. Auto-verify and sync the INFORMATION
into HARZ immediately (so nothing is lost), but public publication waits for source/permission
review. Operational metadata (receipts, hashes, provenance) syncs automatically — it is system data.
Working default = review queue until owner overrules.

## Honest scope note
The phone is currently a read-only consumer of the library. Direction B has no authoring UI yet —
that is a NEW capability, not a sync defect. Recommend: Direction A closure (journal + receipts +
first real change proof) BEFORE any authoring UI work, consistent with single-phone-first ladder.
