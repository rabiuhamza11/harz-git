# RECEIPT 264 - HCIE v0.3.1: VERSION FIX + READ PAGE, EXECUTED AND PROVEN
(Team F / Hauwa desk, Oct 31 2026, live vs harz-hcie @ harz.workers.dev, D1 harz-root-db ceaea454)

## FIX 1 - VERSION NUMBERING: PROVEN
1. Sequential history in live table: canary-github v1(1f32e6ab)/v2(1d2f140b); dailytrust v1(813d7d42)/v2(378fd9b7)/v3(e2bf8c1b); guardian-ng v1(9823e319)/v2(93dab4f1)/v3(9010057b)/v4(c9881ffb)/v5(a137c1f2). Zero duplicate (source,version) pairs.
2. Assignment inside DB insert path: INSERT..SELECT COALESCE(MAX(version),0)+1, ux_hcie_obj_version unique index (inspected), UNIQUE-collision retry 4x backoff.
3. Concurrency (executed): 5 parallel INSERT..SELECT, same source -> versions 1-5, zero errors, zero duplicates (proof rows cleaned).
4. Real collision: Oct 31 15:11 overlapping cycles (clock + manual) -> guardian v5 created ONCE, no duplicate version.
5. Fresh captures live: run17 guardian v5 (17982B verified=1 http200); run20 dailytrust v3 e2bf8c1b (object 16).
6. Guardian reconcile: v1-v3 originals untouched, v4-v5 appended, zero history loss.

## FIX 2 - OFFLINE READ PAGE: CODE+API VERIFIED
- /read 6892B, fetches /api/hcie/manifest (verified only); browser SHA-256 recompute + refuse on mismatch; localStorage stores TEXT keyed by object (not URL); labels LIVE/CACHED/OFFLINE/UNAVAILABLE; manifest API 10 entries all carry version (vundefined defect closed).
- NOT claimed: airplane-mode device test (owner step), fresh browser visual re-test (staged).

## DEFECTS FOUND + FIXED
1. Cycle overlap -> DB lease (hcie_lease 240s) added; proven refused second fire + expiry honored.
2. Run reports swallowed error text -> fixed; run22 detail: guardian-ng ERROR error "http 403" (external rate-limit after test bursts; backoff applies). Also caught+repaired my own patch bug.

## BOUNDARIES HELD
No immutable overwrite; verification not weakened; no full-corpus sync; Oct25 two-phone failure untouched; HCIE not declared complete.

## NEXT
Circulation proof chain -> device session pending owner.
