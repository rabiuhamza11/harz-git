# CURATION SWAP — GATE A FRESH RE-VERIFICATION RECEIPT (Team F, Oct 22 ~09:3x WAT, per GO 9dde8ce)

## A1a — Master export (harz-million-corpus.sql): PASS
Fresh sha256 = 7dcc9dd983a6858cd9e9c91a879f90844268fae9912d30c4301144c77fb08046, byte-identical to the recorded seal. 705,222,539 bytes.

## A1b — fx-idx export (4,088,546,052 bytes): PASS with one disclosed artifact
Per-table INSERT counts in the export vs live DB (fresh queries):
fx_fts 1,329,429 = live EXACT; fx_fts_data 242,656 = live EXACT; fx_fts_idx 76,088 = live EXACT; runs 393 = live EXACT; meta 13 = live EXACT; fx_fts_config 1 = live EXACT.
fx_fts_docsize: export 1,404,148 vs live 1,329,429 — the export carries 74,719 orphaned FTS5 docsize shadow rows (pre-vacuum state at export time). The copy is a SUPERSET of live for every table: nothing live is missing from the copy. EOF intact (file ends on a complete statement). Recorded for Nuruddeen's independent check.

## A1c — Bodies evacuation dump (8,153,444,796 bytes): PASS
Fresh sha256 = 60af0a3d22baa0e00790009cb7bb09735a479da94efc5f074168a799503cdaa4, byte-identical to the dump receipt seal (rows 1,349,186 at dump time, status OK). Byte-exact hash proves the copy is exactly the sealed dump.

## A2 — Keep store full battery (deployed harz-keep-bodies-00): PASS
Fresh run against the DEPLOYED store (GATE-A2-BATTERY-FRESH.json):
Inventory: 29,086 index rows / 2,075 parts / 291 bundles; duplicate parts: 0; n_parts consistency: PASS.
Restoration: 29,086/29,086 byte-exact (part-sha verified per part, gzip decompressed per bundle, in-bundle slice, sha256 vs index) — mismatches 0, truncations 0. Elapsed 190.7s.
Cross-check: local keep-store.db == deployed == meta (29,086 rows, 0 missing, 0 extra both directions).
HONEST CORRECTION: my battery's initial verdict line read FAIL only because it hardcoded the v1 count (29,091). The deployed store is the v2 seal: 29,086 docs with meta excluded_discrepancies=5 (the v2 SQL-escape rebuild, sealed Oct 15 17:42Z). The store matches its own seal exactly. The 5 exclusions are already flagged out-of-scope for this swap (adjudication pending, per the GO).

## GATE A VERDICT: PASS (all legs). Precondition satisfied. Proceeding to GATE B (reader swap verification) per the mandatory order. Nothing has been deleted; nothing retires until Gates B and C pass.
