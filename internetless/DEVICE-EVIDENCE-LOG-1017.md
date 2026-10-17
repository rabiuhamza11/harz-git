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
