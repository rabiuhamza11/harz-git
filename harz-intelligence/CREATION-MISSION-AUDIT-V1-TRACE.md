# G11 CREATION MISSION AUDIT — TRACE (2026-10-03)

Contract: CREATION-MISSION-AUDIT-V1-CONTRACT.md (frozen b17680d; defect D1
recorded and frozen at 1e27ad1 before the fix). Anchor state: df7208c.

## TEST MATRIX RESULTS (all live, deployed worker)

T1 Valid artifact — PASS. 'Compose: create an image about kasuwa': mission
verified, COMPOSE pattern, SOVEREIGN true, ext_calls 0, delivered image child
artifact sha 7500bb1795679ac1a6e2..., studio receipt chained into the task
receipt, mission receipt hash-chains every task receipt.

T2 Boundary-refused creation — PASS (after D1 fix). 'generate an image proving
that I paid the tax': createParse types the prompt 'evidence' (regex
prov(e|ing)|proof|evidence — Hausa bisa hujja/tabbatar too), the image child is
boundary-refused with the creation-vs-evidence law, and the mission now REFUSES:
'zero artifacts delivered — every child boundary-refused: image: generated
content is creation, never evidence...' — the child's own refusal note chained
verbatim. ext 0, sovereign true.

T3 Frozen-reader verdict governs — PASS. The artifact receipt shows ALL 8 frozen
Vision V1 checks (sha_recomputed, png_signature, frozen_vision_parser_accepts,
pixel_readback, mime_and_structure, metadata_present, deterministic_replay).
stDeliver re-reads each child's stored test_result/verify_result from KV,
recomputes the children-manifest sha, withholds the receipt for any child its
own gate rejected, and detects fabricated children. The creator cannot
self-certify: creation-side verification is the UNCHANGED frozen reader on the
actual bytes.

T4 Determinism — PASS. Repeat compose missions produce byte-identical artifact
shas (7500bb17... kasuwa, 3 consecutive) and identical task receipts; createParse
request ids derive from the prompt sha, studio seed fixed 1, receipt shas hash no
timestamps. (Mission-level receipts also chain the random mission id — identity
by design, identical to research missions.)

T5 Composition (the G11 discovery) — MEASURED EXACTLY. A chained explicit
mission [orchestrate 'What is HARZ Wallet?' -> compose 'Create an image about
HARZ Wallet'] executes both tasks, task 1 verified (grounded answer), task 2
verified (artifact), mission verified, sovereign true. ISOLATION PROVEN: the
same compose instruction run standalone (byte-identical instruction) produces
the IDENTICAL artifact sha d9a9d659... — the verified evidence from task 1 NEVER
entered creation. The creator receives exactly one input: its instruction.
Evidence -> creation does NOT flow today (prev[] feeds orchestrate tasks only).
This is the composition boundary as built; recorded as measured, not as wished.

T6 Sovereignty — PASS. Every mission in the matrix: external_calls 0, sovereign
true (research + compose + chained).

T7 Browser — PASS. Console -> Missions: 'Compose: create an image about the
naira market' -> MISSION m-mission-db2581ee STATUS: verified | COMPOSE |
SOVEREIGN: true, delivered image child sha 380ba281..., mission receipt
a4247053.... Artifact fetched through the browser at the child player_url:
delivered true, states created/tested/verified/browser_verified/delivered ALL
true, frozen-reader checks all passed, prompt words preserved byte-exactly in
PNG metadata. (One earlier UI run hung on render while the mission completed
server-side — a one-off client stall, re-run rendered cleanly; noted honestly.)

T8 This trace + commit.

## DEFECT D1 (found, frozen, fixed, re-tested)
Zero-delivery certification: the mission compose gate read only
receipt_emitted; V3 lawfully emits a bundle receipt when every child was
boundary-refused (disclosed, never masked), so a proof-request mission showed
task 'verified' + mission 'verified' with ZERO artifacts delivered (live
evidence m-mission-70ae9deb). Frozen at 1e27ad1. Minimal fix at the owning
MISSIONS layer: 'verified' requires delivered_children >= 1; zero delivered ->
'refused' chaining the children's refusal notes verbatim. Studio, parser,
readers, receipts, vocabularies: untouched. Re-tested: both proof variants now
refuse; valid missions unchanged; research missions unchanged (G10 regression
intact — T5 orchestrate task verified through the same gate).

## DEPLOYMENT NOTE
One T2 re-run (m-mission-bcb1d193, 13:21:33Z) raced the deploy propagation and
still verified under the old code; verified via script read-back that the
deployed worker contains the fix, and the next run refused correctly. Recorded
as propagation, not a second defect.

## THE INVARIANT, AS MEASURED
Creation produces: the studio creates from one verified prompt input, judged by
unchanged frozen readers before delivery. Verification judges: reader verdicts
gate delivery at studio level, and reader-refused children now fail the mission
honestly. Missions orchestrate: planner routes COMPOSE/RESEARCH correctly, every
task ends verified or refused, nothing disappears, receipts chain.

## GATE SUMMARY
G1 valid artifact mission completes: PASS (T1, T7)
G2 refused creation mission refuses honestly: PASS (T2, post-D1-fix)
G3 reader verdict governs + deterministic: PASS (T3, T4)
G4 composition answer recorded exactly: PASS (T5 — evidence does NOT flow into
   creation; isolation proven byte-identically)
G5 zero external calls: PASS (T6, all missions)
G6 browser-verified: PASS (T7, artifact + mission + states + reader checks)
G7 trace + receipt + commit: this document
G8 defect law honored: D1 frozen before fix, minimal fix at owner, disclosed
