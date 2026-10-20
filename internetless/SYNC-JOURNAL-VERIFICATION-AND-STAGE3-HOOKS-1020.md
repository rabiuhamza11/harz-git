# SYNC JOURNAL INDEPENDENTLY VERIFIED + STAGE 3 HOOK SPEC (Oct 20, 2026 ~13:15 WAT, Nuruddeen)

## Verification verdict: TRUE (direct D1 read, not report-trust)
Table sync_journal in harz_search_v02 (a2, db 6ec47ea7): EXISTS.
Rows: exactly 457 = 1 baseline + 453 hash-rebind + 3 reseal, as claimed.
Sample rows inspected: real history (escaped-text fix hash rebinds with old/new hashes;
pack reseals with honest external-refs notes). Delivery state taxonomy in live use (recorded x457).

## Two honest findings from the review (convention fixes, not blockers)
F-1 TIMESTAMP CONVENTION: seeded history rows carry the SEEDING time (2026-10-20 11:49-11:50),
not the EVENT time (Oct 17 repair). The journal's chronology is false for its own founding rows.
Fix for Stage 3: distinct event_ts (when it happened) and recorded_ts (when journaled);
backfill event_ts for the 457 from the repair records.
F-2 THE JOURNAL PROVES ITS OWN GAP: reseal rows record nysc/cac/efcc pack seals as of Oct 17
(fc995ce3/2d732442/663dd7e3), but actual pack bytes TODAY hash differently (be7cee1c/9066206b/918b78da)
because packs legitimately changed since (NYSC 45 subpages Oct 18, readability fixes, dedup, news
conversions Oct 20). NO rows exist for any of those changes — exactly the Stage 3 wiring gap.
Correct behavior for history; the missing wiring is the next build.

## Layer reconciliation (two journals, one convention)
- D1 sync_journal (desk): corpus layer. KV v2.journal (Nuruddeen, 285 entries): visual pack layer.
  Both are correct per layer architecture; conventions MUST align for Gate 3 bundles:
  STATE TAXONOMY: adopt desk's pending / delivered / recorded everywhere.
    (KV journal's "stored" = "recorded" legacy alias; unify on next write.)
  IDENTITY FORMATS: kv://v2.pack.<domain>[.<slug>], d1://<db>/<table>/id/<id>, corpus://<scope>.
  EVENT/RECORD TS split per F-1. ack_hash reserved for device receipts (Stage 2 of phone panel).

## STAGE 3 HOOK SPEC — exact write points (for the owning desks)
H-1 WAVE INGEST (corpus worker, each resource claim resolution): row per outcome —
    new/updated/removed/dup-rejected/failed/requeued/dead, old+new sha256 from actual bytes.
H-2 PACK RE-CAPTURE (watchdog change -> re-capture path): row kind=updated, resource kv://v2.pack.<d>,
    old sha256 from journal/registry, new sha256 from stored bytes, origin=trigger URL.
H-3 PACK REGISTRY SEAL CHANGES (shell sha256 writes): row kind=reseal, old->new registry hash.
H-4 DEVICE SYNC (app auto-heal + corpus client sync): per-batch rows pending->delivered with
    delivered_at + ack_hash (banner data: fetched/verified/packs/timestamp). Never mark delivered
    without verified local receipt (law: attempted != successful).
H-5 Every hook: event_ts (real) + recorded_ts (insert), origin, version increment only when
    content hash actually changes.
Sequencing: H-2/H-3 wiring pairs with the existing 15-min watchdog; H-1 with the wave worker
(owning desk coordinates); H-4 with the Stage-2 phone panel (Nuruddeen's lane).
