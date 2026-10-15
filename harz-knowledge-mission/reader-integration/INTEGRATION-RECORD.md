# READER INTEGRATION — COMPRESSED STORE WIRED AND LIVE (Oct 15, per owner GO)

Worker harz-million-corpus v0.5.1 deployed (source committed beside this record). KEEP_DB binding added (harz-keep-bodies-00); DB, BODIES_DB, secrets preserved.

Routes:
- /api/doc: body resolution now (1) keep-store for keep-class hashes (sha256 verified per request; explicit 422 on corrupt-part/corrupt-or-truncated-bundle/body-hash-mismatch — NO fallback to legacy when the keep store is corrupt), (2) explicit legacy-bodies label for docs not yet in the keep store, (3) explicit 404 when nowhere. Every response declares body_source.
- /api/doc-keep: keep-store-only route (explicit not-found/corrupt errors).

LIVE TEST RESULTS (executed, not projected):
1. Keep-class happy path: 200, source keep-store, sha256 returned and verified.
2. /api/doc keep-class doc: body_source=keep-store, byte-exact.
3. Legacy doc: body_source=legacy-bodies (explicit label; no silent fallback).
4. Missing hash: explicit "not in keep store" 404.
5. Wrong key: 401.
6. RANDOM 30-doc sample across all 8 keep sources: 30/30 ok, each returned body sha256-verified against its original hash.

Engineering notes (honest):
- First deployment had a real cross-runtime bug: JS text-unit slicing vs byte offsets in the bundle index (worker returned body-hash-mismatch). Fixed by byte-slice logic in keepBody; store itself was byte-correct from Gate 2 (a suspected index defect was disproven; the re-index script asserted and exited without mutation).
- Binding lesson recorded: script upload without bindings in metadata CLEARS bindings; settings PATCH (multipart) restores them. Sequence used: upload script, then PATCH settings.

VOLUME SET CONTENT (parallel start): 11,304 substantive domains measured (114,843,346 bytes total). Balanced 4-volume selection committed (VOLUME-SET-CONTENT-MANIFEST.json): V1 2,820 domains / 28.5MB, V2 2,724 / 28.5MB, V3 2,812 / 29.3MB, V4 2,948 / 28.5MB. Volume 1 assembly into the one-file reader shell is the next build step; Infinix fail-fast physical test before volumes 2-4.

STORAGE (actual, after deployment): 17,459,892,800 bytes across 47 DBs (originals preserved per conditional ruling; retirement awaits the Infinix gate). Reclaimable at the retirement step: bodies 9.04GB + master 3.85GB + fx-idx 0.99GB -> replaced by keep-store 82MB + rebuilt metadata/FTS; projected post-retirement account ~4.1GB, to be MEASURED not projected at that gate.
