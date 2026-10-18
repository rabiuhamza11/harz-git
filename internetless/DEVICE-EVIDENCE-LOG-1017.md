# OWNER DEVICE EVIDENCE — Infinix, Oct 17 01:26-02:13 WAT (Dad's hands, WhatsApp screenshots)
Logged by Hauwa's seat. Devices > desktop. Airplane icon verified in status bar unless noted.

## HARZ Circle (harz-circle workers.dev) — connected + airplane
- 01:26 online: create/open/add member/record/seal all work (circle c3e0d1f4e0dc, member Musa, N10,000 seal 48a4db0a; D1 cross-check by desk matches).
- 01:44 AIRPLANE: shell opens from cache; write refused honestly ("OFFLINE... Nothing was saved"). PASS (sealed-ledger design: writes online-only).
- 01:48 "Circle created" with airplane icon ON — verified REAL server-side (D1 row e58a4cf948af created 00:48:08Z) => WiFi leaked through airplane mode. Device caveat: airplane icon != offline; note in every verdict.
- Defects found+fixed by desk (confirmed live on phone by 01:44): blank button labels (ok-class collision), creating... hang. At 01:48 phone again showed BLANK button = stale cached shell served offline.
- Test data to clear on owner signal: 3 circles (c3e0d1f4e0dc, 2c4dd99af435, e58a4cf948af), member Musa, 1 entry. Trials end Oct 24 (N500/mo each after).

## v0.3 one-file Reader — airplane (the sealed library)
- 1,209-page file (5,743,839 chars): 01:56-01:57 airplane search "Facebook" 22 results 2ms; two articles opened FULL TEXT with offline badge + hash + source URL. PASS open/search/read.
- 01:56 search "Nigeria" 1,019 results 60ms; top article opened full 6,170 chars. PASS.
- 932-page Reader (5,906,020 chars, v2 corpus): 02:08 airplane shell load after fresh tab (tab count 47->48; full app-close not yet confirmed). Cold-start PROVISIONAL.
- 02:13 AIRPLANE honest-miss: typed punchng.com + OPEN OFFLINE => "Nothing gathered from punchng.com yet..." + REQUEST option. PASS (directive: no dead clicks; truthful unavailable + alternative).
- Still open on device: full app-close cold start; search+open on the 932-page file; LIBRARY SITES -> site -> article; article internal links; /v2 airplane (sync prerequisite); Volume 1 one-file (sha b35601d7) not yet phone-tested.

## Known defects (open)
- v2 KV store: doc 3 (Maroko) failed hash verify online (expected 82608eba / computed 5fc6b8fa) => store rebuild needed before /v2 airplane test can pass all docs.
- Circle: stale cached shell can resurface offline (01:48 blank button).

## Addendum 02:18 (airplane, 932p Reader)
- Search "Businessday.ng" => 0 results (2ms). Honest zero (not in this corpus; businessday lives in the 1209p file and Volume 1). PASS.
- Browser box businessday.ng => "Nothing gathered..." + REQUEST tap => button honestly re-labels "You are OFFLINE - requests need a little data. Try again when online." PASS (offline request refusal, category E).
- Coverage note for convergence: owner is hunting businessday.ng content across files; the one-authoritative-build must merge corpus coverage (932p sealed + 1209p + Volume 1 3,040 docs) so one library holds all verified pages.

## Addendum 02:22 (v2 shell, airplane, owner device)
- v2 shell LOADED OFFLINE on Infinix: "OFFLINE - CACHED DATA" badge + full provenance banner (SW cache served shell). PASS (v2 shell airplane load).
- Search "NYSC" => 0 results + honest-empty box ("no guessing") + coverage label "all 932 titles + 0 stored bodies. Un-sync bodies are searchable after Sync (honest limit)". PASS honest-empty; ROOT CAUSE of 0 = Sync not yet run (titles-only index), NYSC exists as visual pack not corpus text.
- BLOCKED on v2 device gate: Sync prerequisite (online, once, ~932 bodies + 3 packs), then airplane re-test. Maroko doc still hash-corrupt in store (repair pending) - owner may see INTEGRITY FAILURE on it.

## Addendum 02:26 + 02:32 (owner device)
- v2 AIRPLANE: navigated destination not-in-cache => NOT CAPTURED box ("retrieval failed: Failed to fetch. Honest outcome - no silent redirect, no guessing, no blank page"). PASS category E on v2. (Nuance: "Failed to fetch" is the Sync-not-run limit; honest wording could improve after store repair + sync.)
- 932p Reader AIRPLANE: search "nigeria tax" => results; opened article => FULL BODY, "OFFLINE, local copy" badge + hash + source URL. PASS search+open on this file.
- Device matrix now: Circle shell/refusal PASS; 1209p search/open PASS; 932p shell/honest-miss/zero-search/request-refusal/search/open PASS; v2 shell-offline/honest-empty/NOT-CAPTURED PASS.
- Remaining device tests: full cold-start (swipe from recents) on 932p reader; LIBRARY SITES -> site -> article; v2 online Sync then airplane re-test (blocked also by Maroko store repair).

## Addendum 07:56 (v3, airplane, owner device)
- Article open AIRPLANE: "Africa's plants" full body 6,895 chars, HASH VERIFIED de574c08a6c3, OFFLINE-local-copy badge, cached timestamp, source URL. PASS (device, full retrieval + verify offline on v3). Whether via full Sync or single-doc cache TBD: confirm with coverage line / offline Madagascar body search.

## Oct 18 07:53 (v2, airplane, owner device) — CAC PACK PASS
- CAC pack opens offline as a rendered page (logo, content, AI Lawyer Assistant widget) — Magani's rendered-DOM recapture WORKS on device. Item B of directive: PROVEN.
- Tapping icrp.cac.gov.ng (uncaptured subdomain) → honest alert "this original link needs an internet connection". Correct refusal behavior on device.
- Pending device proof: NYSC pack hero images post-r8, Read-more link full body (doc 566), cold start.

## Oct 18 09:2x (real browser, Hauwa seat) — PACK NAVIGATION PROVEN LIVE
- NYSC pack (new capture 2026-10-18 "internal pages stored"): clicked FAQs in nav → navigated to /v2/packs/nysc.gov.ng/faq.html → FULL FAQ content rendered (registration, concessions, corrections, exemption, camp docs — complete text). Screenshot sealed.
- CAC pack (new capture 2026-10-18): clicked FAQ in Resources footer → navigated to /v2/packs/cac.gov.ng/resources_faq.html → full FAQ page (10 questions, contact block, AI Lawyer widget). Screenshot sealed.
- Proof class: real-browser click navigation on live routes. Offline layer (SW r9 cache) same proven pattern as corpus docs; full offline pack nav still requires owner device airplane test after sync.

## Oct 18 09:42 (owner device) — NYSC SUB-PAGE NAVIGATION + IMAGES PASS
- Owner screenshot: NYSC Director-General's Gallery page open on phone, 2x3 grid of six real thumbnails rendering (dggallery.html sub-page — the 65/66-embedded page from the link audit).
- Proves: pack -> sub-page navigation works on device; pack images render; sync of the 62-pack set landed on the phone.
- Matrix state: pack navigation CLOSED (pending confirm airplane). Remaining: Read-more link (freshwater -> 6,508 chars) + cold start.
