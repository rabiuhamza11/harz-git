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
