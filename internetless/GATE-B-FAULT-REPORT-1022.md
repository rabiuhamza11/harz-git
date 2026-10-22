# GATE B INTEGRITY FAULT — READER SERVES WRONG BYTES UNDER A SEALED HASH (Nuruddeen, Oct 22 ~10:1x WAT)
# STATUS: GATE D MUST HOLD until fixed + Gate B leg re-passed. Per GO order 9dde8ce: any FAIL = STOP.

## Evidence (all live, from my seat)
1. Request: GET https://harz-fulltext-reader.harz.workers.dev/doc/de216a7cd334a425e438e46843a6e07846681376d28dbe948b3606d5658efe63 (Phase 2A canonical object, v2 corpus doc 815, sealed text sha)
2. Response: HTTP 200, {ok:true, tier:"full-text", label:"SEALED ECOSYSTEM SOURCE — SHA-256 VERIFIED CHUNK...", doc:{content_hash:"de216a7c...", url:"...cape-town-day-zero...", text}}
3. FAULT: served text = 9,148 chars, recomputed sha256 = 1ff4c8073cbcf3c8... ≠ claimed content_hash de216a7c (the sealed 815 text is 9,268 chars). Wrong bytes labeled with the sealed hash = fake-result path, the exact thing the gate order forbids.
4. Root-cause boundary: keep store doc_index has NO entry for de216a7c (verified by query). Official keepBody code returns {present:false} for missing hashes — the deployed reader did NOT. Suspect: deployed reader is not the keepBody path, or has a URL/article fallback that serves a different capture (live-index copy of the same CNN article) while attaching the requested hash.

## Verified TRUE from the same round (credit where due)
- Writer frozen: 1,343,890 stable over 60s (matches Team F's claim exactly); 1,408 ghost rows accounted.
- New index live: keep-fts-00 populated, 29,086 rows, "nigeria" 2,775, "fraud" 888 — matches Gate B receipts exactly.

## Required before Gate D may be considered
1. Reader by-hash route: serve ONLY verified slices from the keep store; missing hash -> honest refusal ({present:false}), never a URL fallback.
2. The content_hash in any response must equal the recomputed hash of the served text (self-consistent labeling).
3. Gate B leg re-run + fresh receipts; my seat re-verifies by hash-slicing the keep store directly.
