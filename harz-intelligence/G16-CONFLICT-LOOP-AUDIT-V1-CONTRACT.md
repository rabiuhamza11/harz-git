# G16 RESEARCH-ON-CONFLICT LOOP AUDIT — CONTRACT (CONFLICT-LOOP-AUDIT-V1)

Frozen: 2026-10-03, BEFORE any code change. Anchor: b8ab52b (G15 closed).
G15 fixtures A/B and contracts are already frozen (13e383a, b8ab52b) — they
are REUSED byte-identically here, never modified.

## THE QUESTION (Dad, verbatim)
Can Missions lawfully respond to a conflict refusal by initiating the next
research operation, rather than stopping or inventing an answer?
The smallest lawful cycle — NOT a general autonomous loop.

## THE NEW RESOLUTION FIXTURE (frozen, test data, outside the corpus)
G16-FIX-C answer (sha256 ceb241291e9c53063b481e8f4a383332ba82e07abf0af636f3d01a16260508dc):
  **Answer**

  The GDEG test widget price registry states the authoritative price is 800 HARZ 【S1】

  Sources: [s1] G16 SYNTHETIC RESOLUTION FIXTURE C — test data outside the production corpus

  CONFIDENCE: high — fixture-defined resolution, verified against the frozen G16 fixture record only (synthetic test data, never corpus evidence)
Caller-explicit fixture tasks only; the planner never invents them; never
searchable; never corpus evidence.

## STRUCTURED CONFLICT STATE (requirements 1-2)
When the G15 resolution refusal fires, the refusal MESSAGE stays byte-identical
to the frozen G15 text (receipt-identical regression), and the compose task
record gains a STRUCTURED conflict object:
  conflict = {
    state: 'unresolved',
    unresolved_claims: [ { source_task, source_task_type, source_instruction,
      source_receipt, claims, claims_sha256, confidence, provenance } ... ],
    resolution_law: 'resolution requires a separate research act — explicit,
      caller-designated; composition never adjudicates',
    next_lawful_step: 'create a follow-up mission with an explicit research or
      fixture task that seeks resolution evidence, then compose with
      resolution_from designating that task'
  }
and the mission record gains conflict_detected: true. Refusal stays
first-class (task state refused).

## THE RESOLUTION_FROM LAW (requirements 3, 5, 8)
A resolution-requesting compose (G15 patterns match, 2+ evidence sources) may
proceed ONLY in a follow-up mission whose caller EXPLICITLY designates the
resolution act: resolution_from: [task_id]. Rules, deterministic, disclosed:
- resolution_from must be a subset of evidence_from (the resolution claim must
  reach the creator as carried material, not merely authorize)
- every designated task must exist, be verified, and carry a receipt — i.e.
  satisfy the FROZEN verification contract (research: reasoner claim_check;
  fixture: sha match to the frozen record)
- the mission layer verifies the resolution act's ELIGIBILITY only. It does
  NOT semantically judge whether the resolution is correct — that judgment
  belongs to the reader of the artifact and the provenance chain. The adapter
  carries all claims byte-exactly (conflicting + resolution) and adds nothing.
- no valid designation -> the structured conflict refusal (G15 law, unchanged)
- resolution_from present but the instruction requests no resolution ->
  disclosed as not_applied, composition proceeds conflict-preserving
- a designated resolution task that is refused/inconclusive -> refusal:
  inconclusive research cannot authorize resolution (requirement 9)

## HISTORY IMMUTABILITY (requirements 6-7)
The original conflicting mission records are never rewritten by new
evidence. Fixtures are re-instantiated byte-identically (same frozen shas);
each mission's receipt chain stays independently valid; new tasks produce
their OWN receipts and provenance (requirement 5). Nothing retroactive.

## DETERMINISTIC TERMINATION (the loop negative)
1. STRUCTURAL: the executor is a single pass over a bounded explicit task
   list (max 10); every task runs at most once; a mission never re-runs a
   task and never spawns another mission. No auto-iteration exists.
2. CYCLIC/SELF REFERENCE: evidence_from/resolution_from pointing at the
   compose itself (or any not-yet-verified task) refuses — 'not verified'.
3. INCONCLUSIVE RESOLUTION refuses rather than retrying or guessing.
An 'endless loop' therefore cannot form: each conflict yields ONE refusal
with a next_lawful_step disclosure; the caller decides the follow-up.

## G16 INVARIANT (Dad, verbatim)
A conflict can trigger research; research can change the available evidence;
research cannot rewrite history or authorize itself as the resolution.

## TEST MATRIX (frozen before execution)
T1 STRUCTURED CONFLICT: [fixA, fixB, compose resolution-request, NO
   resolution_from] -> refusal byte-identical to G15 + task.conflict object
   with both unresolved claims/provenance (shas recomputed) +
   mission.conflict_detected true.
T2 FOLLOW-UP WITH RESOLUTION: [fixA, fixB, fixC, compose resolution-request
   evidence_from [1,2,3] resolution_from [3]] -> compose VERIFIED; byte-proof:
   prompt = instruction + claimsA + '\n\n' + claimsB + '\n\n' + claimsC;
   resolution designation disclosed (receipts, shas, acceptance law); artifact
   delivered; reader judges; mission verified.
T3 FOLLOW-UP INDEPENDENCE: [fixA, fixB, orchestrate 'What is HARZ Pay?
   Cite your sources.', compose conflict-preserving evidence_from [1,2,3]] ->
   orchestrate receipt IDENTICAL to the standalone run (no injection, D2 law
   held).
T4 HISTORY IMMUTABILITY: after T2, refetch T1's mission record -> receipt
   chain recomputes and matches; fixA/fixB claims byte-identical across
   missions (same claims_sha256); T1 record untouched by T2's new evidence.
T5 INCONCLUSIVE RESOLUTION: [fixA, fixB, orchestrate 'What is the true GDEG
   test widget price? Cite your sources.' (corpus honestly lacks it ->
   refused), compose resolution-request evidence_from [1,2,3] resolution_from
   [3]] -> orchestrate refuses honestly; compose refuses (designated
   resolution task not verified); conflict disclosed; NO retry, NO loop.
T6a CYCLE REFUSAL: [fixA, compose resolution-request evidence_from [2] (the
   compose itself)] -> 'not verified' refusal; single deterministic attempt.
T6b TERMINATION STRUCTURE: mission count unchanged by T5/T6a beyond the
   created missions themselves; no background re-runs (list missions, verify).
T7 REGRESSION: G13 (4811ba9f), G14 (aa5db44c), G15 conflict-preserving
   (f300ca53), G15 resolution refusal receipt-identical, G15 single-source
   (6ef68cb4), kasuwa (7500bb17), proof-request refusal, research receipt
   (9ae4d401), corpus uncontaminated.
T8 DETERMINISM: repeat T2 -> byte-identical artifact + identical receipts.
T9 SOVEREIGNTY: all external_calls 0, sovereign true.
T10 BROWSER: T2 artifact + T1 structured conflict record + T5 refusal record
   fetched live through the actual HTTP surface (standing order).

## GATES
G1 structured conflict state with claims + provenance: T1
G2 explicit follow-up research task, own receipt, no injection: T2, T3
G3 resolution accepted only via explicit designation + frozen verification: T2, T5
G4 history immutable, no retroactive rewrites: T4
G5 inconclusive resolution refuses; deterministic termination: T5, T6
G6 regressions + determinism + sovereignty + browser + trace + receipt: T7-T10
