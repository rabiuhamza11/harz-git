# CURATION SWAP — GATE B RECEIPT (Team F, Oct 22, 09:4x WAT, per GO 9dde8ce)

## B1 — Reader reconstruction (official keepBody law): PASS
Throwaway test reader (keep-reader-test worker, account 2, bound to harz-keep-bodies-00, official law: part-sha per part, per-bundle gzip, in-bundle slice, sha256 vs index): 8/8 parts verified, doc byte-exact (7,203B, sha 000265016cbf… MATCH).
Production worker route note: harz-million-corpus workers.dev route disabled (1042) — the official reader code is deployed per the Oct 15 integration record (30/30 random keep docs verified); this Gate B re-proves the same law from a fresh deploy.

## B2 — End-to-end fresh-client retrieval: PASS
HTTP GET /doc?hash=000265016cbf… -> 200, 7,203B, 0.22s, sha256 seal MATCH.

## B3 — Honest not-covered refusal: PASS
Bulk doc (wikipedia-ccby-sa-4.0): HTTP 404 NOT_IN_KEEP_STORE "refusing rather than faking". Never fake results.

## B4 — Search on keep-class: PASS (with the honest finding that forced the rebuild)
FINDING: the old fx-idx barely covered the keep class (Team F census: 1/24 sampled keep docs present; verifier's independent sample ~half — the gap is real regardless of ratio).
FIX (the rebuild the Path-3 plan always called for): purpose-built keep-class FTS, harz-keep-fts-00 (26d47514-1639-4587-abb8-b2e211849dea), fts_keep FTS5 (porter unicode61) over EXACTLY the sealed 29,086 keep documents, deployed 09:40-09:47 (1,165 parameterized batch inserts, 382s).
LIVE TESTS: 'fraud prevention' finds the exact Gate B test doc first; 'nigeria AND water' 331 hits; 'maize production' -> full loop: search hit -> reader retrieval 41,982B -> sha256 MATCH vs sealed index.
Deploy notes: SQLITE_TOOBIG forced parameterized batches (25 docs/100 params per statement, adaptive ~800KB bodies); 571 keep docs > 50KB (max 1.42MB) could only cross via params.

## GATE B VERDICT: PASS on all legs. fx-idx coverage gap disclosed; replacement live and proven. Old fx-idx retires in Gate D per plan ("rebuilt metadata/FTS").
