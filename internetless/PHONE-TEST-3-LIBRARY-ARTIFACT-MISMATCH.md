# PHONE TEST 3 — OFFLINE LIBRARY, AIRPLANE MODE (owner Infinix, Oct 17, 01:56-01:57 WAT)
Evidence: three owner screenshots (forwarded), airplane icon visible, address bar "...390.workers.dev".

## What the phone proved (device evidence, AIRPLANE mode, for the artifact it was running)
1. One-file reader "HARZ Offline Browser v0.3 one-file" starts offline; badges SEALED - ALL CHECKS PASSED,
   1209 full pages, 5,743,839 chars, OFFLINE ONE-FILE.
2. Offline search works: "Facebook" -> 22 results in 2 ms; "book" -> 30 results in 26 ms.
3. SEARCH RESULT -> FULL BODY (the step earlier photos did not show): PASS for one document.
   Opened "Lexhan Investments Chairman unveils new book to mark 70th birthday" (businessday.ng):
   badges OFFLINE - local copy, CACHED 2026-10-08T00:59:36, FULL TEXT 3,195 chars no truncation;
   content_hash 9a0b5f22f635c564 and source URL shown; BACK TO SEARCH present; in-page FIND bar present.
Not shown / not proven: hash re-verified against the body (a photo cannot prove this), article links,
back/forward/refresh, missing-page handling, images.

## ARTIFACT MISMATCH (this is the finding)
Phone artifact:  1,209 pages / 5,743,839 chars / includes businessday.ng / title "Offline Browser v0.3".
Live /v2 build:  932 pages / 5,906,020 chars / 5 domains / NO businessday.ng / seal 7831974-126edf37cd18b12c.
Volumes (/vol/*): 855 docs (400+385+70), no businessday.ng.
Live root HTML: no businessday.ng; the only "1209" hits are hash fragments.
=> The phone's library is NOT the artifact the v2 build and its 932-doc urlmap were built on, and it is
   not served by the current live origin. Not proven where it came from (most likely a file saved earlier;
   repo history shows other sealed one-files, e.g. Volume 1 with 2,820 docs).
=> Under the final integration directive (one build, one matrix) these results CANNOT be merged with the
   v2 results. They are valid for the 1,209-page artifact only.

## v2 status on the phone
No evidence that /v2 was opened or Synced on the device. Internetless v2 library AIRPLANE gate: NOT TESTED.
Circle: separate component, tested (commits 409544d, af35379).

## Next (owner hands, minimal)
1. Identify the artifact: in the phone browser, note the full address and, if it is a saved file, its name.
2. With data on, open https://harz-offline-browser.hamzarabiu390.workers.dev/v2 , tap Sync all, wait for
   "sync complete", then airplane mode and open: a site, an article, search "plants", the NYSC pack.

## ADDENDUM 1 (Oct 17, ~02:10 WAT) - second owner photo + correction of an unproven claim
New device evidence (02:01, AIRPLANE, address bar "...390.workers.dev" = the live worker origin, NOT a saved file):
- Search "Nigeria" -> 1019 results in 60 ms.
- Result 1 opened: "FG targets 1m export-linked jobs in 2030 through hire from Nigeria" (businessday.ng).
  Badges OFFLINE - local copy, CACHED 2026-10-08T01:16:40, FULL TEXT 6,170 chars no truncation,
  content_hash 42b39928e82c25fa, source URL shown, BACK TO SEARCH + FIND present.
- Search->full-body now PASS on TWO documents (artifact: the 1,209-page v0.3 one-file).

CORRECTION (my error): an earlier message stated the 1,209-page copy was "the October 8 early-morning bake,
re-baked later". That was a guess presented as fact. It is NOT proven. Retracted.
Also retracted: the "saved file" theory (the address bar shows the live origin).

PROVEN by server probes this session:
- Server root (fetched with the phone's browser UA): 7,832,278 B, title "HARZ Offline Reader v0.7",
  corpus seal 2b35293aa5a2b9af, 932 docs, no businessday.ng, x-harz-seal 7831974-126edf37cd18b12c.
- Phone page: "HARZ Offline Browser v0.3 one-file", 1,209 pages, 5,743,839 chars, businessday.ng.
=> The server is NOT serving the phone's page. Different files.
PROVEN by reading the deployed root SW (harz-browser-v2): '/' is served CACHE-FIRST from cache harz-browser-v2;
sealSync() refreshes it in the background only when the x-harz-seal header differs from the stored one.
UNPROVEN (needs the phone): why the phone still holds the 1,209-page page. Candidates: (a) phone cached '/'
under an earlier worker/seal and has not refreshed; (b) refresh needs one more online visit after the seal change.
TEST (owner, one step): with data ON open the root address, wait 10 s, close the tab, reopen; report whether
the badges still say 1209 pages or now 932 pages. That settles it without guessing.

## ADDENDUM 2 (Oct 17, 02:08 WAT) - ARTIFACT MISMATCH RESOLVED
Owner photo, AIRPLANE mode, after one online visit to the root address:
- Phone now shows "HARZ Offline Reader v0.3 one-file" | SEALED - ALL CHECKS PASSED |
  *932 full pages* | *5,906,020 chars* | OFFLINE ONE-FILE.
=> The phone's service worker refreshed to the CURRENT sealed artifact (seal-sync as designed).
=> VERSION ON PHONE (directive item 1): the current 932-page sealed library, identical to the server
   artifact and to the corpus the v2 build was built on. The 1,209-page page is gone from the phone's
   root view; it lived in the stale SW cache.
=> Device evidence (airplane): current artifact boots offline, SEALED checks pass, search box and
   BROWSER / OPEN OFFLINE / LIBRARY SITES / HARZ APPS controls visible.
Still not device-proven on the CURRENT artifact: search run + result -> full body (was proven on the
1,209 artifact), the v0.3 reader's known defects (dead "open offline" click, plain-text articles)
still apply, and the v2 library sync + airplane matrix remains NOT TESTED.
NOTE: the v0.3 reader on the phone is the SEALED text library - do not edit it; v2 exists to add the
navigation layer. Phone keeps working offline as-is.

## ADDENDUM 3 (Oct 17, ~02:14 WAT) - honest not-captured flow on device (v0.3 reader, current artifact)
Owner photo: BROWSER tab, domain "punchng.com" entered, current 932-page artifact (SEALED badge visible).
Result: "Nothing gathered from punchng.com yet - the offline library holds only what HARZ has gathered.
Any site in the world can be requested into the library:" + button "REQUEST punchng.com FOR OFFLINE
GATHERING".
=> Device evidence: HONEST NOT-CAPTURED outcome works on the phone in the v0.3 reader flow (truthful
   "not in library" card + request-the-wave CTA, no dead end). This is the old reader's own input path,
   NOT the v2 resolver. The library legitimately holds 5 sites; punchng.com is not one of them.
Still pending: v2 (/v2) sync + airplane matrix - untouched by this test.

## ADDENDUM 4 (Oct 17, ~02:17 WAT) - businessday.ng gap surfaced (device, airplane mode)
Owner searched "Businessday.ng" in the v0.3 reader: "0 results (2 ms)" + honest not-gathered card
("Nothing gathered from businessday.ng yet") + REQUEST button.
FINDING (product-level, not a bug): the stale 1,209-page copy the phone previously ran DID contain
businessday.ng articles (owner was reading them earlier tonight). The current 932-page artifact never
gathered businessday.ng - its 5 sites are theconversation/theguardian/dw/cnn/aljazeera. The refresh
therefore swapped a library richer in Nigerian news for one without it. Truthful behaviour, real content gap.
PATH: the REQUEST businessday.ng button queues it for the nightly gathering wave. Nigerian sources are
on the hunt list; next bake can include them. Content expansion happens AFTER the navigation gate
(mission law: finish Internetless navigation first).

## ADDENDUM 5 (Oct 17, 02:18 WAT) - REQUEST button in airplane mode (device)
Owner tapped REQUEST businessday.ng FOR OFFLINE GATHERING with the airplane icon on. The button label
changed to: "You are OFFLINE - requests need a little data. Try again when online."
=> PASS: honest offline outcome. The request was NOT sent and nothing pretends it was queued. That is the
   correct behaviour (a gathering request needs the network).
=> Not yet shown: the same request with data ON (would queue the nightly wave). Needs one tap when online.

## ADDENDUM 6 (Oct 17, 02:22 WAT) - FIRST v2 DEVICE EVIDENCE (phone, offline)
Owner photo: /v2 on the Infinix, app pill "OFFLINE - CACHED DATA", provenance line intact
(932 pages, sealed library untouched), searched "NYSC" -> 0 results, honest empty card, BACK/HOME present.
=> DEVICE PASSES (v2, offline): shell boots from cache, provenance displays, offline label correct,
   search runs offline, honest empty result, no guessing, no fallback.
=> Coverage line honestly showed "0 stored bodies" => Sync had NOT been run. Full-text corpus search and
   pack/doc offline storage still pending the owner's Sync tap.
GAP FOUND BY OWNER: "NYSC" returned nothing although NYSC exists in v2 as a VISUAL PACK — v2 search only
covered corpus titles/bodies. FIXED same session: search now also matches visual packs (searching "NYSC"
shows the pack card "Visual pack: nysc.gov.ng — preserved website, OPEN OFFLINE"); coverage line updated.
Shell redeployed (KV v2.shell), verified live.
REMAINING GATE: owner taps Sync all (data on), then airplane: site card -> article -> search -> NYSC pack.
