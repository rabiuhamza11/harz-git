# NODE KIT v0.2 — SEARCH MODE (Oct 6, owner order: "start using harz search engine and harz browser without internet")

Public repo rabiuhamza11/harz-node @ 4b83342. ADDITIVE: v0.1 serving pins untouched.

## What shipped
search/ — byte-exact frozen copies (sha256 verified vs HarzGit originals BEFORE push):
  server.js 2794cb73 (Node A server, full UI + PWA built in), engine.js f442a6a5,
  search-core.js 853dc0ff (frozen v0.1.1 contract), index-export.json (corpus v0.1
  portable artifact, digest 8bdec9df4eb4df5ae3b1f9720d04b478092a021d93b4485832e776e562644d72,
  1409 docs / 219 domains / 45484 terms), start-search.sh (boot script: wakelock,
  integrity prints, PORT 8795 exported, 3-min boot patience loop, airplane-mode banner).

## Workbench evidence (my own runs, Oct 6)
1. Kit node booted from kit copies: /health digest 8bdec9df EXACT MATCH frozen contract.
2. Federation suite kit-vs-vault-originals (both live, both from independent copies):
   30/30 BYTE-IDENTICAL (took_ms excluded by contract).
3. All 30 query totals match the Sep 25 Node C recorded evidence exactly.
4. Live-vs-Node B divergence is the DOCUMENTED corpus-version gap (Node B serves
   corpus v0.2 digest b9395e53; kit ships federation-proven v0.1) — state version
   difference, not a portability failure.
5. UI serves at / with zero external URLs; sw.js + manifest 200 (PWA, offline-capable
   by construction: 127.0.0.1 only). Fixed 2 real bugs in my start script before push:
   PORT not exported (server fell back to 8787), boot wait 30s too short (boot ~2 min).

## Honest boundary
Workbench API + determinism + page-structure verified. The PHONE browser test
(Chrome + airplane mode + searching the UI) is the owner's hands per evidence law —
same pattern as kit v0.1 door (Oct 3, owner-ratified).

## Owner usage
With internet (one-time pull, ~11MB): cd harz-node && git pull
Then airplane-friendly forever: bash search/start-search.sh -> Chrome http://127.0.0.1:8795/
Browser/door (v0.1, field-proven): bash start.sh -> http://127.0.0.1:8080
