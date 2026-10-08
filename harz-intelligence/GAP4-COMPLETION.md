# GAP-4 MULTIMODAL ROUTER V1 — COMPLETION RECORD

**Date:** 2026-10-07
**Contract:** contracts/GAP4-MULTIMODAL-ROUTER-CONTRACT.md (frozen pre-impl, vault fe83c68)
**Builder order:** Dad ("Go" — build order after contract freeze, same day)
**Live worker:** harz-intelligence.harz.workers.dev — version a61fe3d0-lineage, final f400e37e-a7d5-4499-b4ae-9155fbef6ff6

## What was built (additive, byte-neutral)

The door now accepts `instruction + typed input_refs` and routes each ref through its
FROZEN reader lane. The router owns zero readers, zero parsers, zero graders — it only
detects and binds:

1. **Route lanes:** text_file (M1 ingestFile), pdf (M3), ebook (M4), image (M2), audio
   stream (V2-A), audio_stream_id, video pair (vidParse + honest no-reader refusal).
   Detection = declared type + magic bytes; a lying content-type refuses (R7 green).
2. **Route selection:** MULTIMODAL_RESEARCH_AND_COMPOSE (attachments + report language),
   MULTIMODAL_RESEARCH (attachments, no compose clause), single-lane ingest-only,
   text-only tasks fall through to the unchanged door (R1 green — byte-neutral).
3. **Crossing:** each lane's artifact is ingested, then the scoped instruction carries
   the artifact names so TASKH's intake scope binds the orchestrate clause to the
   ingested units — provenance-bound input, no silent textification.
4. **One lineage:** intake -> orchestrate -> compose in ONE TaskRecord (R14 green),
   states earned, receipted close, zero external calls everywhere.
5. **Console:** front door takes file attachments (any lane); TaskRecord renders
   lineage, evidence refs, verified claims, artifacts, verdict, receipt.

## Gate — testrouter1 (designed pre-build, 15 cases)

15/15 PASSED, run one AND run two (determinism under dedup), external calls: 0.
Cases: R1 text door unchanged; R2/R3/R4 lane ingests; R5 TWO-LANE PDF+TEXT -> REPORT
crossing verified; R6 VOICE -> REPORT crossing verified; R7 lying type refuses; R8
poisoned bytes preserved + disclosed, zero fabricated facts; R9 gapped voice stream
crosses with disclosure (no speech manufactured in the gap); R10 injection crosses as
data, never a command (no leak, report delivered); R11 routing loop guard (content
never reroutes); R12 determinism + dedup disclosed; R13 un-routable video pair refuses
honestly; R14 one lineage one TaskRecord; R15 refused crossing = CLOSED + refused +
receipt + zero artifacts.

**Frozen regression bar on the final build:** testim1 24 passed 0ext; testvs1 30 passed
0ext; testcreation1 24 passed 0ext; testsem1 12/12; testter1 12/12; testsemvid1 16/16;
agents test 13/13; test8 5/5. All green except one PRE-EXISTING red (below).

## Browser (display law, GAP-5 discipline)

/console in a real browser: a verified close rendered fully — STATUS CLOSED |
PATTERN INFORMATIONAL, lifecycle states, evidence refs, verified claims, verdict
verified, sovereign=true, external calls: 0, receipt 6a60f47d… Screenshot captured.
Also verified in-browser: a task saying "attached documents" with nothing attached
REFUSES at the door with receipt — honest refusal displayed understandably.
Honest boundary: the file-attach click-through cannot be browser-driven (OS file
dialog); the attach path is proven at the API layer with the exact crossing payloads
(R5/R6/R10), and the console handler is the same API call.

## Findings (recorded, UNPATCHED — frozen layers untouched, for Dad's ruling)

**F-GAP4-1 — segment-unit vs page-unit verify asymmetry (fee/value class).**
The intake scope binds orchestrate to SEGMENT units; corpus retrieval binds to PAGE
units. The frozen fee/value answer templates carry boilerplate sentences ("HARZ
evidence declares these fees/prices, quoted verbatim:") that verify1Check supports at
idf-overlap >= 6 against rich pages but NOT against short segments. Result: a
fee-class question over an ingested note produces a byte-supported verbatim quote
(overlap 56.3) yet the aggregate verdict is 2-unsupported -> the mission LAWFULLY
refuses. Generic evidence questions (invoice/report material) cross VERIFIED — the
crossing itself is proven; the asymmetry is between two frozen designs. Both layers
frozen; no cross-layer rescue.

**F-GAP4-2 — HARZ-domain value specialists bypass the intake scope.**
An account-number question with an ingested note attached answered from the CORPUS
(doc 10470), not from the ingested artifact: the specialist class carries its own
corpus retrieval and ignores the intake-scoped packet. The crossing's provenance
bound ("answer from the INGESTED material") is not honored by that specialist class.
Answer was factually correct (same account number in corpus), but the lineage cites
the wrong source class. Frozen reasoner; unpatched.

**Pre-existing red (not a regression, evidence captured): agents test10 part 1,
case fee_variant, 4/5.** "What does HARZ Pay charge per transaction?" quotes doc
10378 (query pricing) instead of doc 10470 (Paystack 1.5%). Reproduced IDENTICALLY on
the pre-router build (git HEAD deployed, version 2acbf791, same 4/5 fee_variant ext=0)
— predates GAP-4 entirely. Recorded for ruling.

## Build-process defects caught by the gate (unsmoothed, honest record)

1. First battery deploy threw 1101: pdfWrap helper was function-scoped, not global —
   fixture inlined at battery scope. No reader code touched.
2. Battery fixtures wrote "N50"/"Naira" — the frozen FEE_MARK grammar is case-exact
   (naira lowercase / ₦ / NGN). Fixtures were wrong, not the reader; fixtures fixed.
3. Battery reruns tripped deterministic dedup (by content sha) — rerun-safe asserts
   written so the gate stays honest across runs instead of hiding dedup.

## Earned sentence

The door now takes the world as it arrives — PDF, voice, zip, image — and either it
crosses provenance-bound into one receipted TaskRecord, or it refuses with the reason
on the record. Nothing in between, nothing fabricated, zero external calls.

---

## DAD'S COUNTERSIGNATURE — Oct 8, 2026 (gate closes on this, not on the report)

**GAP-4 gate: CLOSED.**
The strength is the enforced boundary behavior, not merely 15/15 x2: frozen-lane
crossings, provenance attached end-to-end, lying types refused, poisoned input
preserved + disclosed, injection as data, gapped audio never manufactured,
evidence-backed browser display including honest refusals, zero external calls.

**F-GAP4-1: BOUNDED FINDING — NO PATCH.** Refusal where evidence doesn't meet the
frozen threshold is correct behavior. Threshold not lowered; no cross-layer rescue.

**F-GAP4-2: OPEN ARCHITECTURAL FOLLOW-UP.** Verbatim ruling: "OPEN / REQUIRED
BEFORE CLAIMING UNIVERSAL PROVENANCE BINDING." One specialist class has an
alternate evidence path (corpus retrieval bypassing the ingested packet) — the
invariant is not yet universal across every specialist. The provenance bypass must
eventually be eliminated or explicitly bounded.

**Agents test10 fee_variant: PRE-EXISTING RED — SEPARATE WORKSTREAM.** Reproduced on
the pre-router build; correctly not attributed to this gate.

**Standing decision reaffirmed:** software/build gates before phone field work;
GAP-4 sits on the completed-build side of that line.

**The invariant, Dad's words:** every input either crosses provenance-bound into one
receipted record, or refuses with the reason on the record. No silent third state.

## Oct 8, 2026 — VALUE_REGRESSION RED, SEPARATED (Dad's ruling)
test10 part2 value_regression ("Which Nigerian bank does HARZ use for NGN transfers?" must yield 2034326424 from doc 10470) is RED under the merged index: the value specialist answers OTC-desk junk. Ruling: OPEN / NOT PROMOTED / separate ruling required. Provenance must win over retrieval convenience; no "good enough" patch. The merge did not create the F-GAP4-2 bypass weakness — pre-merge the right doc was reachable, so the test happened to pass; post-merge the bypass became visible. F-GAP4-2 remains the open architectural precondition for universal provenance binding. Next decision: the value-specialist provenance boundary, not another fee patch.
