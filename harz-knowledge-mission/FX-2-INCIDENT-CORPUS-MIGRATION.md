# INCIDENT + REPAIR: corpus body-migration during FX-2 verification (Oct 13, ~11:00 WAT)

## What happened
At ~09:57-10:00 UTC (10:57-11:00 WAT) the harz-million-corpus worker's
body-migration endpoint (WAVE_KEY-gated) was executed to completion by a key
holder (not Nuruddeen). The migration moves doc text into a separate BODIES_DB
(a75c7faf-c04d-4f0f-88cf-88ab991e5fda, table bodies, keyed content_hash) and
sets docs.text='' in the main corpus. Effect: the corpus converted to a
two-tier layout (docs = metadata; bodies = text).

Timeline:
- 09:57:07 UTC: last FX builder run read REAL text (build completed intact).
- 09:59-10:00 UTC: all docs.text reads return empty (both HTTP API and binding paths).
- FX-2 Gate A (running concurrently) surfaced it as "160 missing docs", then as
  all-empty text on direct inspection.

## Data safety: VERIFIED, not lost
- bodies: 1,328,715 rows = every corpus doc.
- Spot-check doc 2774: bodies text sha256 == stored content_hash (exact match).
- Recovered docs (the 160): bodies text present for all 160, hashes verify.
- Main corpus metadata intact: sizes, hashes, titles, 1,328,715 rows, SUM(size) 7,650,278,939.

## Storage after migration (all measured)
- harz-million-corpus: 9.55 GB -> 3.84 GB (text offloaded; headroom restored).
- bodies DB: 8.78 GB (new).
- harz-fx-idx: 0.99 GB complete (contentless index; well under projection).

## Impact on FX-2 and repairs (same morning)
1. FX search/doc reads returned empty (they read docs.text). REPAIRED:
   harz-fx-search v1.1.0 (fx2-js-1.1.0) now reads text from BODIES_DB by
   content_hash (new read-only binding); snippets and /fx/doc verified
   hash-exact after repair.
2. Migration raced the builder's final windows: 160 docs (4 runs of 40) got
   empty reads and were never indexed. REPAIRED: all 160 indexed from bodies
   with the existence guard (160 parts inserted, 0 dupes, 0 missing bodies).
3. harz-fx-build builder reads docs.text — NOT updated to bodies (no re-index
   needed; noted for any future re-index).
4. The 160 were NOT a corpus defect — the earlier "empty-text at ingest"
   hypothesis is RETRACTED (they were migration-cleared mid-build).

## Owner questions (adjudication)
- WHO executed the migration and under what authorization (WAVE_KEY holder)?
  It restructured the production corpus during frozen-ingestion + open
  reconciliation. The migration itself is sound engineering (it directly
  relieves the 9.5GB cap flag), but authorization + sequencing must be his ruling.
- Storage basis after migration: main corpus 3.84GB vs bodies 8.78GB vs index
  0.99GB — the cap basis question applies to the sum (13.6GB account total now).

## Gate status after repairs (Oct 13 ~11:20 WAT)
- GATE A (reconciliation): PASS — 1,328,715 corpus docs; 1,328,715 distinct
  indexed; 0 missing; 0 unexpected; 0 duplicate rowids; checkpoints = completed work.
- GATE B (tail): PASS — final checkpoint 1,328,715 = max corpus id; last 5 docs
  indexed with correct part counts (95KB doc = 2 parts); tail docs searchable
  ("yam cash crop west africa" -> top hit = the tail docs themselves).
- GATE C (retrieval + parity): PASS — recovered doc 504106 hash-exact;
  multi-part doc full text exact; a1/a2 identical on 3 queries; harz-ai /api/fx
  chain live. All snippets/doc text served from bodies (single text source).
- GATE D (offline) + GATE E (final acceptance): PENDING — owner's phone, per
  his sequencing. Artifacts and procedure to be staged for his run.
