# HARZ SEARCH → NODE C — DEATH TEST PLAN (PORTABILITY LAW v1, RUNG 1)

Owner-ruled Sep 25, 2026. Sovereignty is evidence-based: frozen inputs, exact suite, hashes, PASS/FAIL. No sovereignty claim from architecture diagrams alone.

## Frozen inputs (receipt part 1)
- search-core.js — sha256 853dc0ff8af3eb45cc74… (frozen v0.1.1 contract L1-L10)
- engine.js — sha256 f442a6a52fa898321fff…
- server.js — sha256 010b8a13c7e2622c049f… (substrate adapter, byte-identical on A and C — ZERO new server code for the phone)
- index-export.json — 11,337,603 bytes, 1,409 docs, digest 8bdec9df4eb4df5ae3b1f9720d04b478092a021d93b4485832e776e562644d72
- Suite: 30 frozen queries, canonical JSON with took_ms excluded (law L9)

## The 11 steps, mapped to this rung
1. Build — DONE (v0.1.1, frozen Sep 19)
2. Deploy to Cloudflare — DONE (Node B live)
3. Verify — DONE (30/30 certified Sep 19; B now serves corpus v0.2 state — recorded honestly, irrelevant to this test since B dies at step 4)
4. Remove Cloudflare — FIELD: worker harz-search stays untouched but is NOT contacted for the duration; the test nodes resolve nothing from it
5. Same service+state on independent node — Node C = owner's phone (Termux), same server.js + same index-export.json (phone-search-start.sh, one command)
6. Cut Internet — airplane mode / hotspot with no mobile data on the phone
7. Connect nodes locally — hotspot LAN: Node C serving, second device probing via LAN IP
8. Same workload — node fed-test-c.js <nodeC-LAN-IP> (30 frozen queries)
9. Verify — 30/30 BYTE-IDENTICAL canonical outputs (plus /health digest 8bdec9df on C)
10. Restore — reconnect Internet
11. Reconcile — re-run digest verification on C: index digest must still equal 8bdec9df (state is read-only artifact; reconciliation is deterministic re-verification)

## Evidence so far
- WORKBENCH STAND-IN PASS (Sep 25, sandbox): Node A (port 8791) vs Node C stand-in (port 8795, phone bundle files) — 30/30 BYTE-IDENTICAL, node-c-federation.json written. Honest label: both instances ran on the sandbox substrate; this proves the bundle and contract, NOT the phone substrate.
- Live CF Node B checked same day: serving corpus v0.2 (10,471 docs, digest b9395e53, "search-core v0.2") — the v0.1 vs v0.2 state-version difference explains fed-test.js A-vs-B divergence (2/30). NOT a portability failure; recorded for honesty. The death test carries ONE artifact (v0.1) to Node C and kills B by design.

## What the field run needs (owner's hands)
1. Copy node-c-search/ folder to the phone (Termux): server.js, engine.js, search-core.js, index-export.json, fed-test-c.js, phone-search-start.sh
2. On the phone: bash phone-search-start.sh → prints LAN address
3. Airplane mode ON, hotspot ON (no mobile data), second device (laptop/second phone) joins hotspot
4. On second device: node fed-test-c.js http://<phone-LAN-IP>:8795
5. PASS = 30/30 byte-identical + digest 8bdec9df + Internet was OFF
6. Restore Internet, re-verify digest → receipt complete

## Verdict rules
- PASS on phone substrate + receipt → RUNG 1 CLOSED, HARZ Search declared sovereign on the spine definition (two substrates, state carried, functional equivalence).
- Any FAIL → honest report, no sovereignty claim, fix and re-run.
