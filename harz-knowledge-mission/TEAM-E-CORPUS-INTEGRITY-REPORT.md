# TEAM E — CORPUS INTEGRITY REPORT (this seat, Oct 14, ~08:3x WAT)
Method: D1 API direct queries (read-only), FTS probes, endpoint probes.
No writes, no repairs, no content inspection of quarantined docs.
Master corpus: harz-million-corpus (ea622de9-44a6-499e-8839-a42cd5a690d5).
FX index: harz-fx-idx (389b1bdf-c3d7-4265-9399-d023a7c506df).

## ITEM 1 — Exact desk-shard counts  [MEASURED]
Total docs: 1,341,437 (ids 1..1,341,437, contiguous). Distinct sources: 47.
Top: wikipedia-ccby-sa-4.0 887,301 | gutenberg 163,003 | geonames 152,664 |
osm-nigeria-odbl 38,548 | wiktionary-50k 35,838 | cloud-wave 12,719 |
devdocs-* ~24,546 | hunted-recrawl 6,156 | hunted-stage2 4,389 |
openstax 4,102 | web 3,480 | medlineplus 3,052 | door-onefile-v06 783 |
who-eml 650 | news-rss 625 | standardebooks 372 | ... (47 total, top 25 =
1,339,232 of 1,341,437; remaining 22 sources = 2,205 docs).
FX index bands (all 'done'): band0 450,000 docs @ids 1-450,000;
band1 450,000 @450,001-900,000; band2 430,515 @900,001-1,328,715.
fx_fts rows: 1,329,429.

## ITEM 2 — Fresh live-seal vs prior reconciliation  [SEAL HOLDS, EXACT]
Prior record (freeze enforcement, Oct 14 07:40 WAT): max id 1,341,437;
last write 2026-10-14T04:58:03.212Z.
Fresh measurement (~08:30 WAT): max id 1,341,437 — UNCHANGED; last write
2026-10-14T04:58:03.212Z — IDENTICAL to the recorded seal. Zero writes
since stub enforcement. FX index: band2_last_id 1,328,715 (migration
parity), last run 2026-10-13T09:57:07Z, docs_done=0 across last runs —
NO reindex of quarantined docs. harz-corpus-wave stub still serving
freeze notice (endpoint 200 with notice, not verified this run — prior
measurement on record).

## ITEM 3 — Quarantine: recorded, not inspected  [AS RULED]
Range: ids > 1,328,715. Count: 12,722 (matches prior record exactly).
Labels: cloud-wave 11,939 + door-onefile-v06 783.
fetched_at spread: 2026-10-09T05:27:20Z .. 2026-10-14T04:58:03Z.
No purge, no release, no content read. Quarantined docs are NOT in the FX
index (band2_last_id 1,328,715; measured, not assumed).

## ITEM 4 — Population-swap question, measured from scratch  [MEASURED]
Master corpus (this seat's population — a DIFFERENT OBJECT from the wave
seat's 932-doc live-reader population, distinction preserved per the
c8f21a3 adjudication):
- gov.ng URL docs: 659 (hunted-stage2 404, hunted-recrawl 206,
  team-b-recovery-20261012 23, cloud-wave 22, door-onefile-v06 4)
- FTS MATCH 'NIMC': 4 docs — master corpus DOES contain NIMC content
- Ukrainian markers: 60 docs by title markers (україн/Київ/Укр);
  79 FTS matches (українська OR Київ)
=> Master population is NOT swapped-empty of Nigerian/gov content, but
foreign-language content IS present (consistent with the known ingestion
defects; wave-origin docs historically banked). The 932-doc live-reader
population itself is held on the wave seat and is NOT inspectable from
this seat — recorded as such, not measured here.

## HONEST DISCREPANCIES (recorded, not repaired — frozen state)
1. band2_docs counter (430,515) exceeds its id-range size (900,001..1,328,715
   = 428,715) by 1,800 — counter semantics unexplained from records.
2. fx_fts rows (1,329,429) is 1,086 below the band-sum (1,330,515) —
   likely empty/unindexable docs (the known 160-doc text-loss class +
   others), but NOT verified this run; recorded as an open counter delta.
Both are evidence questions, not repairs. Nothing touched.

## VERDICT
Live seal HOLDS exactly (both corpus and index). Quarantine intact and
uninspected per rule. Shard counts published. Population composition
measured from scratch with the master-vs-wave object distinction
preserved. Counter deltas flagged honestly. Read-only throughout.
