# RECEIPT — PORTABILITY LAW v1, RUNG 1 (HARZ Search → Node C), workbench stand-in

Date: 2026-09-25 (WAT) | Verdict: WORKBENCH STAND-IN PASS — field run pending

## Frozen inputs (sha256, first 16)
- search-core.js 853dc0ff8af3eb45 (frozen v0.1.1 contract, unchanged from Sep 19 seal)
- engine.js f442a6a52fa89832 (unchanged)
- server.js 010b8a13c7e2622c (unchanged — ZERO new server code for the phone substrate)
- index-export.json 1232208752dd41ed (11,337,603 bytes, 1,409 docs, index digest 8bdec9df4eb4df5ae3b1f9720d04b478092a021d93b4485832e776e562644d72)
- Suite: 30 frozen queries, canonical = JSON with took_ms deleted (law L9)

## Rung files
- fed-test-c.js d83c16e8a20e6020 (Node C federation suite)
- phone-search-start.sh 633e1ff824ad44ff (one-command phone bring-up)
- DEATH-TEST-PLAN.md fc32a4c1b77f4f1a (11 steps mapped to this rung)

## Test executed
Node A (sandbox, port 8791) vs Node C stand-in (phone bundle files, port 8795):
- Both booted from the same artifact, boot digest 8bdec9df… on BOTH (determinism proof at boot)
- FEDERATION A-vs-C 30/30 — BYTE-IDENTICAL (node-c-federation.json, sha 3e4b1e0bddea259f)

## Honest labels
1. STAND-IN evidence only: both instances ran on the sandbox substrate. The bundle, contract, and state portability are proven; the PHONE substrate (Termux/Android) is NOT yet proven. No sovereignty claim from this receipt alone (law: two independent substrates required).
2. Live CF Node B observed same day serving corpus v0.2 state (10,471 docs, digest b9395e53, "search-core v0.2"). fed-test.js A(v0.1 artifact)-vs-B(v0.2) = 2/30 — state-version difference, NOT a portability failure, recorded for honesty. The death test kills B by design and carries ONE artifact (v0.1) to Node C.
3. Field run (owner's hands): copy node-c-search/ to Termux → bash phone-search-start.sh → airplane mode + hotspot → second device runs fed-test-c.js against the phone LAN IP → 30/30 byte-identical + digest match + Internet OFF = RUNG 1 CLOSED (then restore + digest re-verify = reconciliation, step 11).

## Law
PORTABILITY LAW v1 frozen same day at .agents/rules/portability-law.md — the owner's seven principles verbatim + evidence requirement (frozen inputs, exact suite, hashes, PASS/FAIL, no claims from diagrams).
