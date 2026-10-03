# G14 MULTI-EVIDENCE COMPOSITION AUDIT — CONTRACT (MULTI-EVIDENCE-AUDIT-V1)

Frozen: 2026-10-03, BEFORE testing. Anchor: 2db8438 (G13 complete, closed).
Nature: AUDIT of the G13 adapter under multiple independently verified
sources. The multi-source loop is already built (evidence_from accepts an
array); G14 proves exactly what happens. No code change unless a defect is
found — and then: freeze the defect, minimal fix at the owning layer,
disclose. No automatic semantic merging of evidence. The adapter is a
carrier, not an editor, not an arbitrator.

## THE QUESTION (Dad, verbatim)
Does the architecture remain honest when Creation consumes multiple
independently verified tasks? Research A + Research B -> verified claims
package -> Creation -> Reader.

## THE LAWS UNDER TEST (all frozen, all must survive)
- The creator cannot become its own verifier (G13 asymmetry).
- Evidence carries provenance; creation consumes claims; creation never
  certifies; the reader judges alone.
- Missing or unverified evidence = honest refusal, never improvisation, never
  silent narrowing (a caller-referenced source that is ineligible refuses the
  WHOLE handoff — partial evidence is never silently composed).
- No semantic rewriting of any claim (byte-exact slices, frozen markers).
- No invented relationships: the adapter joins claims with a fixed neutral
  separator and adds NOTHING between them — no 'and', no reconciliation, no
  ordering rationale, no dedup, no arbitration.

## TEST MATRIX (frozen before execution)
M1 Multi-source positive: [orchestrate A, orchestrate B, compose
   evidence_from [1,2]] -> mission verified; claims from BOTH sources carried
   byte-exactly; per-source evidence disclosure (receipt, confidence,
   provenance separately attributed); derivation proven by request_id
   reconstruction from the mission record alone.
M2 Ordering: claims enter in the caller's evidence_from order, exactly;
   swapped order [2,1] produces a different (lawful, deterministic) prompt
   and artifact — the caller composes the order; the adapter never reorders.
M3 Duplicate reference: evidence_from [1,1] -> the same claims carried twice
   (byte-exact, deterministic). The adapter does NOT dedup — dedup would be
   semantic arbitration. Disclosed as measured.
M4 Mixed eligibility: [verified, refused-task] -> WHOLE handoff refused;
   [verified, missing-ref] -> WHOLE handoff refused. Never partial evidence.
M5 Conflicting claims: carry-both, no-merge, proven at byte level. If the
   corpus yields a genuine contradiction, test it live; if not, record that
   finding honestly (no fabricated conflicts) and prove the no-merge law with
   distinct claims — the architecture's answer is identical either way.
M6 Attribution: each source's receipt/provenance/confidence separately
   disclosed; the mission receipt chain covers every task; locally recomputed.
M7 Regression: G13 single-source composition unchanged (artifact 4811ba9f...);
   proof-request refusal intact; plain compose unchanged (kasuwa 7500bb17...);
   research mission verified; unverified-evidence refusal intact.
M8 Determinism: repeat M1 -> byte-identical artifact + identical receipts.
M9 Sovereignty: every test external_calls 0, sovereign true.
M10 Browser: the delivered multi-evidence artifact fetched live through the
   browser — all states true, frozen reader checks green, PNG metadata
   carries BOTH claims byte-exactly (standing order).

## GATES
G1 deterministic ordering of claims: M1, M2
G2 conflicting/duplicate claims carried without arbitration: M3, M5
G3 mixed eligibility refuses whole handoff (never partial): M4
G4 attribution preservation per source: M1, M6
G5 creator cannot invent relationships (bytes only, nothing added): M5 + proofs
G6 reader still judges independently: M1, M10
G7 regressions unchanged: M7
G8 sovereignty + determinism + browser + trace + receipt: M8, M9, M10

## DEFECT D2 — FOUND DURING G14, FROZEN BEFORE FIX (recorded 2026-10-03)
MEASURED: in any explicit multi-research mission, EVERY second-position
orchestrate task returns the same generic canonical-URL fallback answer
(claims len 264, question-independent: 'I do not have a canonical URL matching
this request... I will not quote an unrelated URL from the evidence...').
Probed live: Pay, Faucet, Oracle, Health as second tasks — all identical.
ROOT CAUSE (missions executor, this layer): the executor appends prior task
answers to the research message as 'context' (line: message = t.instruction +
'\n\nVerified results from earlier mission tasks (context, not new
evidence):\n' + prev...). The FROZEN reasoner's question decomposition
(taskPlanSteps) splits the combined message into fragments and routes
per-fragment; with the appended answer text the route collapses to
canonical_url fallback. The frozen reasoner is ANSWERING HONESTLY what it was
given — the defect is the executor's message construction, not the reasoner.
CONSEQUENCE: multi-research missions cannot produce independent verified
sources; second answers also mention 'evidence' and lawfully refuse at the
frozen creation intake — multi-evidence composition is blocked.
DESIGN CONFLICT: silent context injection contradicts the explicitness law Dad
set for evidence handoff (no auto-consumption of mission memory). Independence
of sources (Dad's G14 framing: 'multiple independently verified tasks') is
violated by construction — task 2's answer depends on task 1's text.
MINIMAL FIX (owning layer only — missions executor): research tasks receive
exactly their own instruction. prev[] context injection removed for
orchestrate tasks. No frozen layer touched. Consequence disclosed: deliberate
chained-context research is no longer silently available; if Dad wants context
chaining later, it must be an EXPLICIT reference design (its own contract),
never silent injection. Nothing in MISSIONS-V1's frozen law (every task ends
verified or refused; nothing disappears) depends on context injection, and no
audit ever positively verified chained-context answer quality.
