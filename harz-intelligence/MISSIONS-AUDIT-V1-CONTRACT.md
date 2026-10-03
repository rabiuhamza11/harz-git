# MISSIONS-1 VERIFICATION AUDIT — CONTRACT (MISSIONS-AUDIT-V1)

Frozen: 2026-10-03, BEFORE any change. Follows REASONER-AUDIT-V1 (7117774).

## SCOPE
Audit ONLY the Missions v0.1 verification gate (worker.js mission executor,
orchestrate-task branch). Frozen and UNCHANGED: planner, reasoner (1.1.6),
search, packet, and the verifier itself (family-runtime.js verify1Check — the
frozen aggregate verdict vocabulary IS the contract).

## THE TRACED HANDOFF (proven, line numbers at commit 7117774)
1. Reasoner answers; verify1Check splits claims, checks each against evidence.
2. AGGREGATE verdict vocabulary (family-runtime.js:66-68): 'no-claims' (0 claims),
   'all-supported' (unsupported === 0), 'N-unsupported' (N >= 1 unsupported).
   The bare string 'supported' is a PER-CLAIM verdict only — it is NEVER emitted
   at aggregate level.
3. orchestrate() ships claim_check { verdict, supported, unsupported } in
   verification (worker.js:5350).
4. Mission gate (worker.js:9037-9038):
   claimOk = !v.claim_check || v.claim_check.verdict === 'supported'
   grounded = status === 'grounded-in-evidence' || status === 'no-external-evidence'
              || (v.claim_check && v.claim_check.verdict === 'supported')
5. Any answered mission task with evidence units has claim_check.verdict
   'all-supported' -> claimOk false -> else branch -> refused with receipt.
   Observed live: mission m-mission-495424ec on 'What is HARZ Wallet?' — same
   reasoner receipt as the passing chat (9ae4d401...), claim_check 'all-supported',
   supported 2 / unsupported 0, mission refused: 'verification did not establish
   grounded support'. CONTRACT MISMATCH, not an intelligence failure. The gate
   string-matches a string the frozen verifier can never emit.

## THE MINIMAL LAWFUL FIX (vocabulary normalization at the boundary)
Align the mission gate's expected string with the verifier's frozen emitted
vocabulary: 'all-supported' (and only it, among aggregate verdicts, means every
claim passed). NO truthy acceptance, NO substring guessing, NO new semantics:
- 'no-claims' still refuses (unchanged from today's behavior)
- 'N-unsupported' still refuses (any N >= 1)
- only !v.claim_check (units empty) or verdict 'all-supported' passes claimOk

## REGRESSION GATES
G1 supported mission passes: mission on a grounded question -> state verified,
  receipt chained
G2 partially supported refuses: predicate-level frozen test over the ENTIRE
  aggregate vocabulary: no-claims -> refuse, all-supported -> pass,
  1-unsupported -> refuse, 2-unsupported -> refuse (deterministic, no live
  nondeterminism dependency)
G3 unsupported/negative missions refuse: negative question -> orchestrator honest
  refusal branch (evidence 0), unchanged
G4 determinism: repeat identical mission -> identical verification receipt
G5 zero external calls in the mission path
G6 reasoner/packet/search regression: frozen 5-question chat battery still 5/5
  (nothing downstream or upstream broke)
G7 browser/live test BEFORE report (standing order)
G8 TRACE + harz-git commit + receipt

## LAWS
Freeze-first; no planner/search/packet/reasoner/verifier changes; no semantic
guessing; preserve every refusal behavior that exists today except the single
mismatched string; disclose everything.
