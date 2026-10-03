# G12 EVIDENCE -> CREATION CONTRACT AUDIT — CONTRACT (EVIDENCE-CREATION-AUDIT-V1)

Frozen: 2026-10-03, BEFORE any code change. Anchor state: f30fbe6 (G11 closed).
Frozen and untouched: createParse + V3 Studio + all frozen readers + reasoner +
verify1Check + planner + search/packet. If a test exposes a defect, freeze the
defect record, minimal fix at the owning layer, disclose. No cross-layer rescue.

## THE SEAM (measured at G11)
Verified research evidence has NO path into Creation. Chained missions run both
tasks but compose receives exactly one input: its instruction (proven
byte-identically, artifact d9a9d659 standalone == chained). G12 builds and tests
ONLY the missing handoff.

## THE LAW (Dad, verbatim invariant)
Research discovers. Verification establishes. Evidence carries provenance.
Creation consumes evidence. Creation does not certify evidence. The reader
judges the artifact. Missions orchestrate the chain.

## HANDOFF DESIGN (explicit, inspectable — no hidden context)
1. SELECTION: only EXPLICIT evidence_from references — a compose task names the
   prior task ids it consumes. NO automatic consumption of mission memory. A
   referenced task is eligible ONLY if it exists in the same mission AND its
   state is 'verified' AND it carries a receipt. Missing or unverified evidence
   = honest refusal, never improvisation.
2. PACKAGING: the executor builds ONE canonical package per reference — fixed
   key order: { evidence_ref, source_task_type, source_instruction,
   answer_sha256 (computed from the stored verified answer bytes),
   answer_text (the stored verified answer, byte-exact, never rewritten),
   task_receipt, provenance_law }. The package is serialized by explicit
   construction — no caller-supplied evidence fields are ever read. Evidence
   enters from the executor's OWN stored task records only.
3. CREATION CONTRACT: the creator receives exactly two things — the
   instruction and the evidence packages, concatenated as:
   instruction + '\n\n[VERIFIED EVIDENCE PACKAGE — provenance preserved,
   byte-exact; use but do not certify or alter]\n' + JSON. The exact bytes
   received are proven by createParse's prompt_sha256, which chains into the
   artifact receipt. The frozen 4000-byte prompt limit remains — oversized
   evidence is an honest parser refusal, NOT a parser change.
4. CREATOR BOUNDARY: the evidence package is immutable input bytes inside the
   prompt. The creator cannot alter the answer (byte-exact in package +
   prompt), cannot forge the receipt (packages come from executor records, not
   request payloads), and certifies nothing — the evidence's own verification
   remains the claim_check of the source task, unchanged.
5. VERIFICATION DISTINCTION: 'derived from evidence' is PROVEN by the sha chain
   answer_sha256 -> prompt_sha256 -> artifact_sha256 (+ byte-exact prompt words
   in PNG metadata). An artifact merely CLAIMING evidence cannot produce this
   chain — its prompt sha would not contain the evidence package bytes.
6. INSPECTABILITY: the compose task record discloses evidence_refs, each
   answer_sha256 and task_receipt it consumed. The chain is auditable from the
   mission record alone.

## TEST MATRIX (frozen before execution)
P1 Positive: explicit mission [orchestrate 'What is HARZ Wallet? Cite your
    sources.' -> compose 'Create an image about HARZ Wallet' evidence_from[1]]
    -> both verified, mission verified, evidence chain present and recomputed
    locally (prompt sha = sha(instruction + package) recomputed from the
    mission record).
N1 Missing evidence: evidence_from[3] (no task 3) -> honest refusal.
N2 Unverified evidence: evidence_from[2] where task 2 refused -> honest refusal.
N3 Fabricated evidence: caller supplies junk evidence/answer/receipt fields in
    the request body -> executor ignores ALL of them; artifact must be
    byte-identical to the clean P1 run (prompt sha unchanged). Injection is
    data, never input.
N4 Modified bytes: the package's answer_sha256 is computed by the executor
    from the stored answer — proven by recomputing sha256(answer_text) from
    the mission record and matching the package bytes inside the recorded
    prompt. Any mismatch would be a packaging defect.
N5 Valid evidence + conflicting instruction: verified HARZ Wallet evidence +
    instruction to create an unrelated image -> mission completes with BOTH
    shas disclosed in the receipt; the artifact claims nothing about the world
    (creation is never evidence); the evidence bytes remain unaltered and
    uncertified.
D  Determinism: repeat P1 -> byte-identical artifact + identical receipts.
S  Sovereignty: every test at external_calls 0.
R  Regression (G11 intact): plain compose unchanged (kasuwa artifact sha
    7500bb17...); proof-request still refuses; research mission still verifies
    through the G10 gate.
B  Browser: mission record + artifact fetched live in the browser; evidence
    chain and all states verified through the actual HTTP surface.

## GATES
G1 explicit selection law enforced (eligibility + refusals): P1, N1, N2
G2 canonical packaging, no silent rewriting, injection ignored: N3, N4
G3 exact creator input proven (prompt sha chain): P1, N3
G4 creator boundary holds (no certification, no alteration): N4, N5
G5 verification distinction demonstrable (derived vs claiming): P1 vs N3
G6 determinism: D
G7 sovereignty: S
G8 regression + browser + trace + receipt + commit: R, B, this document
