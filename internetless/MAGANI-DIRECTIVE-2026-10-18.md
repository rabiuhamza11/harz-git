# MAGANI DIRECTIVE — V2 PHONE-GATE REPAIR BACKLOG (owner-authorized, zero-budget)
Issued by Hauwa seat per Dad's instruction Oct 18 ("use magani inside the ecosystem, he can do everything for free").
All work via existing free KV/git tooling. Standing laws apply: honest failures, no fabricated availability,
one authoritative build (/v2), sealed library identity 7831974-126edf37cd18b12c untouched.

## A. STALE DOC CACHE PURGE (root cause of owner's current complaint) — HIGHEST PRIORITY
Evidence: owner tapped restored Read-more link (doc 1 -> 566, v0.8.1 linkify shipped by Hauwa, shell sha 96bf821b).
Phone opened doc 566 with EMPTY BODY while library claims 1069 stored.
Server-side verified by Hauwa Oct 18 06:5x: /v2/doc/566 serves FULL text 6,508 chars, sha256==content_hash.
Diagnosis: phone holds a stale/garbage cache entry for /v2/doc/566 from the pre-repair window (SW r2 era cached
404s/errors; route serves cache-control immutable 1yr). Sync-state count reads the list, not the cache contents.
Fix: SW cache-name bump r3->r4 with old-cache purge (proven pattern from r2->r3), then owner reloads online +
re-syncs once. Acceptance: doc 566 opens FULL BODY offline on Infinix via the Read-more link.

## B. CAC PACK RECAPTURE (owner: "only cac give trouble" — worst defect)
Evidence: pack opens as raw React source (50 <img>, only 27 embedded; /_next/image?... server paths dead offline).
Root cause known from build record: client-rendered site, rendered-DOM capture stage needed.
Fix: re-capture rendered DOM after hydration; embed all images as data URIs. If not achievable free: honest
"not captured offline" pack state. Acceptance: pack opens offline as a readable page, zero raw code.

## C. NYSC PACK: 2 MISSING IMAGES
Evidence: img/news4.jpg + "img/NYSC NDPR AUDIT 2023.png" not inlined (13/15 embedded). Owner screenshot 6:47 shows alt-text boxes.
Fix: embed both. Acceptance: all pack images render offline.

## D. PACK RELATIVE-LINK CATCH
Evidence: "packs/about.html" inside NYSC pack -> Chrome ERR_FAILED page offline (owner screenshot 6:49).
Fix: extend pack bridge to catch relative hrefs -> honest not-captured message (never leave the pack).
Acceptance: tapping about.html shows the honest message offline, no browser error page.

## E. V0.8 CAPTURE NOISE (Daily Trust / Businessday)
Evidence: article texts begin with site chrome ("LOGO script async...", "dt_mini_MENU USING CHECKBOX HACK", "masthead_ad", "[[email protected]]").
Fix: extraction cleanup pass on the 137 v0.8 pages (titles/anchors/hashes re-bound if text changes, per rehash-20261017 law).
Acceptance: article bodies begin with actual content.

## F. VERIFY V0.8.1 LINKIFY ON DEVICE (after A)
115 simulated cross-article links (396 honest no-match, 0 false). Owner must see doc 1 -> 566 -> doc 566 full body.
Also still open from device matrix: COLD START (swipe-kill + reopen + search) — last untested matrix item.

## Known/flagged (do NOT re-report): 17 docs with lossy nbsp artifacts (0xC2 stray) disclosed in
v2.final-state-20261017; 1019-hit claim unverified (desk audit f5bb7b6); onefile v0.7 hash mismatch flagged.
