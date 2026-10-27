# MISSION ORDER — MAGANI: READ-ONLY ENGINEERING AUDIT (commercial readiness, Priority One mesh)
# From: Rabiu (owner) via Nuruddeen · Oct 27, 2026 · READ-ONLY: no code changes, no deploys, no corpus writes.

## THE SIX AUDIT QUESTIONS (answer each with actual files, functions, endpoints, and test evidence; if untested, SAY SO)
1. INFINIX NODE: What code or application currently runs on the phone, and what node identity does it use?
2. STORAGE NODE: Where is document 1719 physically stored, and which service can serve its bytes?
3. TRANSPORT: Which local transport is currently implemented and usable between phone and storage node?
4. RETRIEVAL PATH: Is there a working request-to-response implementation, or only registry + storage foundation?
5. INTEGRITY: Where is the trusted hash obtained, and where is the received content verified?
6. DEPLOYMENT: Which components are live, which are only local code, and which remain unimplemented?

## PRE-ANSWERED FROM NURUDDEEN'S SEAT (verified records; confirm or correct, do not re-derive)
- Q1: Phone runs Termux + Node (D1 phone run Oct 14 precedent). NO installed HARZ app, NO node identity system yet. Phase 2A kit commands staged (curl from vault raw URLs).
- Q2: Doc 1719 (17,951B JSON, text sha256 bd3ea5622e2a5f35…, 17,534 UTF-8 bytes) is stored in: a2 Internetless KV corpus shards (served at /v2/doc/1719, HTTP 200 verified Oct 27) and GitHub Pages Node B mirror (node-b/docs/1719.json). Re-verified SEALED-VALID against the live TX map Oct 27. Kit node-store copy staged in vault this turn.
- Q3: LAN HTTP over Wi-Fi hotspot (mesh-node.mjs server + mesh-client.mjs client, no deps, Node 16+). Wi-Fi Direct and Bluetooth: NOT implemented. Hotspot client-isolation is a KNOWN risk (Sunday run failed; step-by-step diagnosis ladder sent to owner Oct 25, actual failure point still unreported).
- Q4: WORKING code exists, sandbox-proven (9/9 workbench legs c9ec23e; my battery: accept, wrong-hash reject, corrupt-409-refuse, unreachable-fail; 1719 ACCEPTED 5ms this turn). DEVICE-PROVEN: NO — the two-phone run is pending the owner's failure report.
- Q5: Trusted hash = mesh-manifest.json (embedded on client, derived from sealed TX map; both 815 and 1719 entries now). Verified client-side (sha256 of text vs manifest, memory-only) AND node-side (integrity check before serve, 409 refusal on mismatch).
- Q6: LIVE = a2 Node A (v2 corpus + packs + journal), GitHub Pages Node B, a1 successor corpus (29,844) + keep store (29,086) + keep-fts-00 + reader v1.1 (doc-level seal). LOCAL-ONLY = mesh node/client scripts (run on demand). UNIMPLEMENTED = discovery protocol (Stage B+), third node, replication policies, phone publishing workflow, commercial packaging.

## THE FIRST ACCEPTANCE TEST (owner's plan, for reference; device run is owner-hands)
Object 1719, storage node holds it, Infinix offline, request via local transport, bytes received, hash verified, document opens, retrieval time recorded. NOT sufficient evidence: registry entries, cached copies, API health checks, pre-stored objects. Failure cases required: unreachable peer, wrong hash, interrupted transfer, missing object.

## EXECUTION ORDER (owner's plan, restated for the fleet)
1 audit mesh components -> 2 connect Infinix to one node -> 3 retrieve 1719 -> 4 failure/recovery tests -> 5 third node -> 6 integrate mesh into Internetless -> 7 close browsing/search defects -> 8 sync + review workflow -> 9 full commercial audit.
Telecom stays outside the critical path. No corpus rebuild, no root identity change without a concrete defect.
