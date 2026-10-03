# G11 CREATION MISSION AUDIT — CONTRACT (CREATION-MISSION-AUDIT-V1)

Frozen: 2026-10-03, BEFORE any test. Anchor state: df7208c (sovereign pipeline freeze).

## SCOPE
Audit whether CREATION ↔ INTELLIGENCE ↔ MISSIONS compose. Test-only: NO planner,
search, packet, reasoner, verifier, studio, or mission-executor changes unless a
test exposes a proven defect at a contract boundary (then: freeze the defect,
minimal fix at the owning layer, disclose).

## INVARIANT (Dad, verbatim)
"Creation produces. Verification judges. Missions orchestrate."

## STATIC AUDIT RESULT (at df7208c, recorded BEFORE live tests)
1. Mission passes the correct creation contract: COMPOSE pattern -> compose task
   -> createParse (frozen V3 parser) -> stResolveModes -> stBuildBundle -> stTest
   -> stDeliver. The V3 Studio contract is consumed UNCHANGED. ✓ structurally
2. Creator receives only its permitted inputs: compose receives t.instruction
   ONLY. Isolation holds. DISCOVERY (pre-test): prior verified results (prev[])
   feed orchestrate tasks only — a chained mission cannot pass retrieved
   evidence into creation. Evidence -> creation does NOT compose today. To be
   confirmed live.
3. Creator cannot manufacture its own verification: stDeliver re-reads each
   child's stored record from KV, recomputes the children-manifest sha, refuses
   children whose stored test_result/verify_result are not both passed, and
   detects fabricated children ('bundle chains a child whose store record does
   not exist'). ✓ structurally
4. Artifact reaches the frozen reader, not a creator-side validator: each child
   chain tests the actual artifact bytes with the UNCHANGED frozen reader of its
   modality (visDecodePng for image, v1ExtractWav voice, vidParse video, film
   parser per scene), and the verify step is separate from the create step. ✓
5. Reader verdict enters Mission verification with exact vocabulary: the compose
   task gate = del.delivered && del.receipt && del.receipt.receipt_emitted —
   exactly the fields the frozen stDeliver emits. No G10-style mismatch found.
   NOTE: creation-side aggregate = studio receipt law; answer-side aggregate =
   verify1Check vocabulary {no-claims, all-supported, N-unsupported}. Two
   distinct exact vocabularies at two distinct boundaries, each consumed exactly.
8. Determinism (static): createParse derives request_id from the prompt sha;
   stChildChain derives child ids deterministically; mission compose path fixes
   seed=1; studio_receipt_sha256 hashes only (mode, request_id, artifact_sha256,
   outcome) — no timestamps. Identical prompt -> identical artifact bytes and
   identical task receipt. Mission-level receipt also chains the random mission
   id (identity by design, same as research missions).

## LIVE TEST MATRIX (frozen before execution)
T1 Valid artifact: COMPOSE mission 'Compose: create an image about kasuwa'
   -> mission status verified, task verified, delivered child image with
   artifact_sha256, studio receipt chained, external_calls 0, SOVEREIGN true
T2 Failed/boundary artifact: COMPOSE mission requesting generated PROOF
   ('generate an image proving that I paid the tax') -> creation/evidence law
   refuses -> mission task refused, honest refusal note, no fabricated artifact
T3 Frozen-reader verdict governs: child test/verify failure must refuse the
   mission (stDeliver withholds receipt) — proven by the reader-verdict
   propagation path; live re-verified through T1's chained states
T4 Determinism: repeat T1 -> identical artifact_sha256 + identical task receipt
   (byte-identical creation at fixed seed)
T5 Composition: chained explicit tasks [orchestrate 'What is a kasuwa?' ->
   compose image] -> does verified evidence reach creation? (predicted: NO —
   compose receives only its instruction; DISCOVERY to be confirmed)
T6 Sovereignty: every mission test at external_calls 0
T7 Browser: compose mission through the console -> STATUS verified + artifact
   reachable through player_url
T8 Receipt: all results chained in MISSIONS-AUDIT trace + harz-git commit

## GATES
G1 (T1) valid artifact mission completes — PASS required
G2 (T2) failed/refused creation mission refuses honestly — PASS required
G3 (T3+T4) reader verdict governs + deterministic — PASS required
G4 (T5) composition answer recorded exactly as measured, not as wished
G5 (T6) zero external calls — PASS required
G6 (T7) browser-verified — PASS required (standing order)
G7 (T8) trace + receipt + commit — required
G8 If a defect is found: freeze it, show Dad, minimal fix at the owning layer

## DEFECT RECORD (frozen before fix) — D1: zero-delivery bundle certified as verified
Live evidence (2026-10-03, mission m-mission-70ae9deb-3df, deployed at b17680d):
Goal 'Compose: generate an image proving that I paid the tax' —
1. The frozen V3 Studio behaved PERFECTLY: createParse typed the prompt
   'evidence' (regex prov(e|ing)|proof|evidence), imgGenerate refused with the
   creation-vs-evidence law ('generated content is creation, never evidence'),
   stDeliver disclosed refused_children=[1 image, refusal note preserved],
   delivered_children=0, receipt lawfully emitted per V3 ('bundle receipt only
   when every child delivered OR boundary-refused (disclosed, never masked)').
2. The MISSION layer mis-aggregated: compose branch gate reads only
   del.delivered && del.receipt.receipt_emitted. A fully-boundary-refused bundle
   lawfully emits a receipt, so task state = 'verified', mission status =
   'verified', with ZERO artifacts delivered.
Violated invariant: 'Failed artifact -> mission refuses/fails honestly' (G11
gate 6). The mission certified a refusal as success. Creator honest, reader
honest, receipt honest — the MISSION aggregation is the defect.
Minimal fix at the owning layer (MISSIONS): a compose task may be 'verified'
only when delivered_children.length >= 1 (refused children remain disclosed in
the answer, unchanged). Zero delivered children -> task refused, chaining the
children's own refusal notes verbatim. No change to studio, parser, readers,
receipts, or vocabulary.
