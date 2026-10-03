# REASONER-1.1 CONFIDENCE AUDIT — CONTRACT (REASONER-AUDIT-V1)

Frozen: 2026-10-03, BEFORE any change. Supersedes nothing; follows PACKET-AUDIT-V1 (9683a00).

## SCOPE
Audit ONLY HARZ-Reasoner-1.1 (reasoner11-runtime.js, weights reasoner1-weights.js,
digest 88eaff62..., deployed on harz-intelligence). Its inputs are frozen:
1. FROZEN PACKETS: packets-frozen.json — exact packet outputs (question, status,
   selected evidence with full window text, subject_absent, digests) for the full
   21-case corpus (17 gold + 3 negatives + T2 multi-part + Q5 mirror) captured from
   live Search-1 v0.4 + packet v1.1 on 2026-10-03. NO retrieval changes. NO packet
   changes. NO new fallback.
2. FROZEN REASONER: reasoner11-runtime.js @ commit 9683a00 (already deployed).

## CENTRAL QUESTION
For Q13 ("What does the HARZ FX service provide?") and Q14 ("What is HARZ Wallet?")
— both with gold evidence at RANK 1 in the packet — what exact condition causes
Reasoner-1.1 to classify the answer as below-threshold?

## REQUIRED TRACE PER CASE (Dad's audit order)
evidence received (units, count) | evidence rank of gold | cosine score of each unit
| best score | frozen threshold (0.1308) | contentHit/roleHit/guard evaluation
| exact refusal branch (guard string) | final mode + content | receipt

## DISEASE TAXONOMY (classify, do not guess)
D1 evidence-confidence bug: rank-1 evidence undervalued by the scoring math
D2 composition-confidence bug: facts strong individually, combining collapses score
D3 multi-part penalty bug: multiple clauses penalized as such
D4 entity-alignment bug: evidence present but not recognized as satisfying the query
D5 threshold-calibration bug: confidence internally consistent, frozen threshold too high
D6 correct refusal: evidence genuinely insufficient despite the packet looking good

## LAWS (unchanged, from the standing discipline)
1. NO CROSS-LAYER RESCUE: no retrieval, packet, or verifier changes. If the reasoner
   is wrong, the frozen trace must expose exactly why BEFORE any fix.
2. No threshold lowering and no special-casing until the trace proves which law is
   broken. A fix must be a diagnosed law fix, not a rescue.
3. Negatives must keep refusing honestly after any fix (Q18/Q19/Q20).
4. Freeze-first: this contract + packets-frozen.json committed before diagnosis.
5. Gates:
   G1 trace completeness — every corpus case traced with full numbers
   G2 regression — cases that answered before the audit must answer the same or
      better; cases that honestly refused must still refuse
   G3 the frozen 5-question end-to-end battery >= 4/5 through the UNCHANGED verifier
   G4 determinism — identical inputs produce identical outputs
   G5 negatives honest (no fabrication)
   G6 zero non-HARZ calls in the reasoner path
   G7 browser test BEFORE report (standing order)
   G8 receipt + harz-git commit
6. Reasoner fix (if and only if a disease is proven): deterministic arithmetic only,
   disclosed in REASONER11-CARD.md, weights digest unchanged unless the diagnosed
   law requires it (then: new card, old card preserved).

## DELIVERABLES
reasoner-trace.mjs (harness), REASONER-AUDIT-V1-TRACE.md (findings + classification),
packets-frozen.json (frozen inputs), fixed reasoner if proven, updated card, receipt.
