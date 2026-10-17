# V2 PHONE FINDINGS - ROUND 1 (owner photos 02:22-02:26 WAT, Oct 17) + fixes
Evidence: owner Infinix photos. 02:22 airplane: /v2 shell boots offline (PASS). 02:25 online: home loads
(Sync NOT run). 02:26 airplane: opening a library page -> "NOT CAPTURED ... retrieval failed: Failed to fetch".

## Finding 1 - ROOT CAUSE of the 02:26 failure: service worker never controlled the page (code-verified)
- Page registered the SW with scope "/v2/" but the shell lives at "/v2" (no trailing slash). "/v2/" does not
  cover "/v2", so the SW never saw the page's fetches and cached NOTHING.
- Proven in a real browser: the first version ended "docs fetched 932/932 - verified in phone cache 0/932".
- The 02:22 offline shell open was the browser HTTP cache (sw.js/shell were served immutable for a year), NOT the SW.
- sw.js was immutable 1 year => phones would never receive a fixed worker.
FIX: register scope "/v2"; Service-Worker-Allowed: /v2; sw.js + shell no-cache; SW cache -> r3;
sync waits for SW control, otherwise reloads once and says so.
RE-TEST (real browser, fresh profile): "SYNC COMPLETE - docs fetched 932/932 - verified in phone cache 932/932 - packs 3/3".

## Finding 2 - misleading UI (my defects), fixed
- Site list claimed "N pages stored offline" / "OPEN OFFLINE" before anything was stored.
- Sync swallowed all errors and printed "sync complete" regardless.
- Failure card said "not in your offline library" when the page IS in the library but not stored on the phone.
FIX: per-page "STORED ON PHONE / NOT STORED" read from the real cache; sync counts failures, verifies against the
cache, one automatic retry pass; parallel batches of 6 (3-4 min -> ~1.5 min); message "NOT STORED ON THIS PHONE YET".

## Finding 3 - INTEGRITY CHECK WAS WRONG (my error) - important
v2 compared sha256(text) with content_hash. For 427 of 932 docs they differ even inside the sealed corpus:
theconversation 221, theguardian 139, dw 49, aljazeera 15, cnn 3. No normalisation explains it (9 tried).
The sealed engine NEVER hashes text against content_hash; it uses content_hash only as an id inside the index
digest ("id:content_hash"). So content_hash is the original-capture identifier, not a hash of the stored text.
=> v2 was refusing 46% of the library as "INTEGRITY FAILURE" although the text is identical to the sealed copy.
=> The earlier "HASH VERIFIED" badge on doc 0 was true only because doc 0 is one of the 505 that happen to match.
   That earlier claim overstated the library's guarantee. Corrected here.
FIX (two separate guarantees):
 1. TRANSPORT integrity (real pass/fail): sha256 of the shipped text vs a per-doc hash computed from the
    byte-verified sealed corpus (sealed corpus re-checked against pinned seal 2b35293a... = True).
    Anchor over all id:hash pairs: 0ce51e9db956908dacae9e74347b09bf93db3cfc4954312092d21a9ea8e339ce.
    Badge now reads "IDENTICAL TO SEALED COPY".
 2. content_hash shown as "source id" provenance only, with an honest tooltip.
PROOF: all 932 docs fetched from production = byte-identical to the sealed corpus: 932/932, 0 mismatch, 0 errors,
5,906,020 chars (exactly the sealed total). Doc 64 (previously refused) now opens in full.
Sealed library untouched: x-harz-seal 7831974-126edf37cd18b12c.
OPEN QUESTION (not claimed): why 427 content_hash values do not match their text - likely hash of the raw page
before extraction; unverifiable from this corpus alone.

## Status
Desktop-browser evidence only (labelled): Sync 932/932 verified in cache, site list truthful, doc 64 opens.
NOT TESTED: airplane-mode matrix on the phone with a completed Sync. The phone must (a) load the new shell,
(b) tap Sync with data on and see SYNC COMPLETE 932/932, (c) then airplane mode.

## Finding 4 - SEARCH READ THE WRONG CACHE (found via forwarded desk note, confirmed in code, Oct 17 ~03:00 WAT)
After the SW cache was renamed to harz-internetless-v2-r3, search still opened "harz-internetless-v2" (shell line 280),
so it could never see a stored body, whatever was synced. This is also why "NYSC"/body searches showed "0 stored bodies".
My regression: I renamed the cache and missed one reference.
FIX: one constant CACHE_NAME ("harz-internetless-v2-r3", must equal CACHE in /v2/sw.js); all 3 references use it.
Forwarded desk note: items 1 (worker scope) and 3 (mislabeled message) were ALREADY fixed here; its "needs a new
versioned address" no longer applies because /v2 and /v2/sw.js are now no-cache. The note's item 2 was valid.
TEST: body-only word "madagascar" (in 20 article bodies, 0 titles) - result recorded below.
RESULT (real browser, fresh profile, 02:51-02:55 WAT): Sync "SYNC COMPLETE - 932/932 fetched - verified in phone cache
932/932 - packs 3/3". Search "madagascar": 20 results, all "body match (stored)"; coverage line "932 stored bodies";
independent count of docs with the word in body and not in title = 20. Doc 0 first. PASS (desktop browser, labelled).
Phone matrix still NOT TESTED: the phone held the OLD shell (immutable cache) and old worker at 02:47.

## Phone finding 5 (03:46 WAT Oct 17, owner photo): NEW SHELL CONFIRMED ON INFINIX, sync not yet run
Photo shows the NEW shell offline (badge OFFLINE - CACHED DATA, honest-empty search card, coverage line
"all 932 titles + 0 stored bodies"). Verdict: CORRECT HONEST BEHAVIOUR, not a defect:
- "Madagascar" is in 20 article BODIES, 0 titles. Body search needs stored bodies; phone has 0 (no completed Sync).
- Empty result + honest-coverage line is the system refusing to guess. PASS as designed.
Status: shell update on device = DONE. Sync on device = NOT DONE. Airplane matrix = NOT TESTED.
Next: data on -> /v2 -> Sync all -> confirm "SYNC COMPLETE 932/932 - verified in phone cache 932/932" ->
airplane -> re-search "madagascar" (expect 20 body matches) -> matrix.

## Finding 6 - PARALLEL WRITER / VERSION SPRAWL (Oct 17 06:30-06:40 UTC = 07:30-07:40 WAT) - READ THIS FIRST
Owner phone photos 07:32/07:33 show "HARZ Internetless v3" with "0 stored bodies" online AND offline.
v3 was created by ANOTHER agent ("V2-FIX SHIP v1" / "V2 SCOPE GUARD v1") at 02:44 UTC; no commits, no notes.
That agent also overwrote v2.shell with its own patch, silently rolling back Findings 1-4 (scope, SW control, cache name, hashes).
Its v3 is itself broken: SW scope /v3/ but worker intercepts only /v2 paths; shell opens cache v2-r2 while SW writes elsewhere;
no transport hashes; location.replace("/v2/") bounce. Result: nothing can be stored -> "0 stored bodies" is the CORRECT consequence.
Restored v2.shell/v2.sw to the verified build (sha aaacad5b2f02 / b2f79401dc5a). A concurrent writer then re-wrote v3.shell
6 seconds after my upload (proven by read-back: 8799e2e6a2fb -> 75e3a847777a). I stopped overwriting.
RULING RECORDED: build.authoritative (KV) + internetless/BUILD-AUTHORITATIVE.json. /v2 is the one build. Do NOT write v2.* or v3.*
without reading this file; any change must be committed here with a test result. Phone must use /v2 until v3 == v2 byte-for-byte.
