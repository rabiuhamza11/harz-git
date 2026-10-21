# PHASE 1 GATE REPORT — MEASURED EVIDENCE (Oct 21, 21:4x WAT, Hauwa desk; Magani audit order delivered separately)

Object under test: doc 815 "Day Zero deferred..." (Cape Town water crisis, cnn.com)
Trusted expected hash (shell TX seal map, third copy in git history): de216a7cd334a425e438e46843a6e07846681376d28dbe948b3606d5658efe63

GATE 1 — Two independent storage nodes reachable online: PASS (by construction).
Node A: https://harz-offline-browser.hamzarabiu390.workers.dev/v2/doc/815 (Cloudflare Workers + D1)
Node B: https://rabiuhamza11.github.io/harz-git/node-b/docs/815.json (GitHub Pages, static)
Independence = different providers, storage engines and failure domains (Cloudflare vs GitHub/Microsoft). Honest limits: an actual take-one-down outage test = NOT-TESTED (cannot down a provider); Node B content originates as a mirror exported from Node A, so independence is storage/failure, not independent capture.

GATE 2 — Both nodes hold the same immutable object: PASS. Both return sha256 de216a7cd334a425… identical, matching the trusted seal. Node A: 9884B HTTP 200. Node B: 9901B HTTP 200.

GATE 3 — Fresh client retrieves from either: PASS. Fresh curl clients fetched from both nodes independently (Node A 0.53s, Node B 0.09s). Earlier fresh-browser test (never-synced) retrieved doc 815 from Node A on demand and verified. Honest limit: the phone shell currently routes only to Node A; client-side A→B fallback is the next action.

GATE 4 — Client verifies hash against trusted expected hash: PASS. Correct seal -> ACCEPTED. Deliberately wrong expected hash (000…0) -> REJECTED. Trusted source: the sealed TX map in the shell, versioned in git history as a third independent record. Integrity proven; authenticity rests on the seal map's provenance chain (sealed corpus identity 7831974-126edf37cd18b12c).

GATE 5 — Only the requested object is transferred: PASS. 10.7KB fetched (one doc JSON) vs 15,026KB full mirror / 5.9M-char corpus. No full sync anywhere in the path.

TIMINGS: Node A 0.53s, Node B 0.09s. Bytes: 9884 / 9901. HTTP: 200 / 200.

NEXT ACTIONS (in order): 1) client-side resolver fallback A→B in shell (marker gate) so the phone itself satisfies Gate 3 from either node; 2) Magani independent audit confirmation of this report per the delivered order; 3) retention+replication policy draft (which objects mirror where, how many replicas, when nodes may drop content); 4) larger-object chunking + chunk-hash manifest design (not built, do not claim).
