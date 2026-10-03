# G16 RESEARCH-ON-CONFLICT LOOP AUDIT — TRACE (2026-10-03)

Contract: G16-CONFLICT-LOOP-AUDIT-V1-CONTRACT.md (frozen 6810d24 before
code; anchor b8ab52b). G15 fixtures/contracts reused byte-identically.
Resolution fixture G16-FIX-C frozen (sha ceb24129...). Recorded: AUDIT,
including two implementation defects found and fixed during the audit
(scoping error; missing conflict disclosure on the eligibility path) — both
are executor-layer wiring bugs, disclosed here, with re-test after each.

## TEST MATRIX RESULTS (all live)
T1 STRUCTURED CONFLICT: [fixA, fixB, compose resolution-request, no
   resolution_from] -> compose refused; refusal message byte-identical to
   the frozen G15 text (receipt-identical regression); task.conflict object
   present: state 'unresolved', both claims carried with full provenance
   (receipts 42f63fe1/f1dfdff1, claims_sha256 recomputed locally PASS);
   next_lawful_step disclosed; mission.conflict_detected true. PASS
T2 FOLLOW-UP WITH RESOLUTION: [fixA, fixB, fixC, compose resolution-request
   evidence_from [1,2,3] resolution_from [3]] -> compose VERIFIED; mission
   verified, sovereign true, ext 0. Byte-proof: request_id 76a345d84be73924
   reconstructed from the record alone (instruction + claimsA + '\n\n' +
   claimsB + '\n\n' + claimsC — nothing added). Resolution disclosure on the
   task: resolution_from [3], source receipt 5ca4beb4, acceptance law
   ('eligibility verified, never semantic correctness — the judgment
   belongs to the reader and the provenance chain'). Artifact 6d5eda75...
   delivered; reader checks all green. PASS
T3 FOLLOW-UP INDEPENDENCE: orchestrate 'What is HARZ Pay?' as the THIRD task
   of a chain after two fixtures -> receipt 81daf540... IDENTICAL to the
   standalone run. The D2 law held: no silent injection; the follow-up
   research receives exactly its declared instruction. PASS
T4 HISTORY IMMUTABILITY: T1's mission record refetched after T2/T3's new
   evidence -> receipt chain recomputes and matches; fixture A claims
   byte-identical across missions (same claims_sha256); nothing retroactive.
   PASS
T5 INCONCLUSIVE RESOLUTION: [fixA, fixB, orchestrate 'What is the true GDEG
   test widget price?' (corpus honestly lacks it -> claim_check '1-
   unsupported' -> task refused), compose resolution-request
   resolution_from [3]] -> orchestrate refused HONESTLY; compose refused
   (designated resolution task not verified); the structured conflict
   disclosed on the refusal (both unresolved claims + provenance carried);
   NO retry, NO loop, internal_calls 0, single deterministic attempt. PASS
T6a CYCLE REFUSAL: compose referencing itself -> deterministic 'does not
   exist / not verified' refusal; single attempt. PASS
T6b TERMINATION STRUCTURE: exactly the caller-created missions exist — no
   auto-spawns, no background re-runs, no iteration. PASS
T7 REGRESSION: G13 4811ba9f PASS; G14 aa5db44c PASS; G15 conflict-preserving
   f300ca53 PASS (re-verified after each patch); G15 single-source 6ef68cb4
   PASS; kasuwa 7500bb17 PASS; proof-request refusal PASS; corpus
   uncontaminated. ALL PASS
T8 DETERMINISM: repeat T2 -> byte-identical artifact (6d5eda75) + identical
   receipts. PASS
T9 SOVEREIGNTY: all external_calls 0, sovereign true throughout. PASS
T10 BROWSER: T2 artifact fetched live — all states true, reader's 8 checks
   green, PNG metadata (word-filtered rendition per the G15 correction)
   shows the resolution claim carried with the conflicting claims; live
   mission index shows T5's [verified, verified, refused, refused] and the
   cycle refusal. PASS

## IMPLEMENTATION DEFECTS DURING THE AUDIT (executor layer, disclosed)
D16-a: scoping error — conflictObj declared inside the evidence block but
   read on the refusal path outside it; first T1 run ended in task state
   'error' ('conflictObj is not defined'). Fixed (declaration hoisted),
   re-tested: T1 PASS.
D16-b: contract-fidelity gap — on the T5 path the eligibility refusal fired
   before the conflict disclosure, so the inconclusive refusal did not
   carry the structured conflict (contract requires it). Fixed (failed
   designated resolution act now attaches the conflict object), re-tested:
   T5 PASS, all regressions re-verified after the patch.

## GATE SUMMARY
G1 structured conflict state with claims + provenance: PASS (T1, T5)
G2 explicit follow-up research task, own receipt, no injection: PASS (T2, T3)
G3 resolution accepted only via explicit designation + frozen verification: PASS (T2, T5)
G4 history immutable, no retroactive rewrites: PASS (T4)
G5 inconclusive resolution refuses; deterministic termination: PASS (T5, T6)
G6 regressions + determinism + sovereignty + browser + trace + receipt: PASS (T7-T10)

## THE INVARIANT, HELD THROUGH THE FULL CYCLE
The loop is lawful and CLOSED: conflict detected and disclosed with
provenance -> an explicit, caller-created research act with its own receipt
and no injected context -> resolution accepted only when the designated act
satisfies the frozen verification contract -> composition carries
everything byte-exactly, adding nothing -> the reader judges alone. When
research found nothing, the mission said so and refused — one attempt, no
loop, no guess. A conflict triggered research; research changed the
available evidence; research rewrote no history and authorized nothing.
