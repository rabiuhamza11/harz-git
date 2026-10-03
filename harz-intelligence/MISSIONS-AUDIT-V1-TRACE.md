# MISSIONS-1 VERIFICATION AUDIT — TRACE (2026-10-03)

Contract: MISSIONS-AUDIT-V1-CONTRACT.md (frozen 0415679 BEFORE any change).
Scope: Missions v0.1 verification gate only. Frozen and untouched: planner, reasoner
1.1.6, search, packet, and the verifier (family-runtime.js verify1Check).

## THE PROVEN HANDOFF (exact, from source at 0415679)
1. verify1Check (family-runtime.js:66-68) emits AGGREGATE verdicts ONLY from
   { 'no-claims' (0 claims), 'all-supported' (unsupported === 0), 'N-unsupported'
   (N >= 1) }. The bare string 'supported' is a PER-CLAIM verdict — never emitted
   as the aggregate.
2. orchestrate() ships claim_check { verdict, supported, unsupported } to the
   mission executor (worker.js:5350).
3. Mission gate (worker.js:9037-9038): claimOk = !v.claim_check ||
   v.claim_check.verdict === 'supported'. A string the frozen verifier CANNOT
   emit. Therefore every answered mission task with evidence units had claimOk
   false -> else branch -> refused.
4. Live evidence of the mismatch (pre-fix): mission m-mission-495424ec,
   reasoner receipt 9ae4d401 IDENTICAL to the passing chat, claim_check
   'all-supported' (supported 2, unsupported 0), mission refused with
   'verification did not establish grounded support'. CONTRACT MISMATCH, not an
   intelligence failure. The v0.5 gate benches already used the correct
   vocabulary (.includes('unsupported'), counts) — the defect was only ever in
   the two mission-gate lines.

## THE MINIMAL LAWFUL FIX (applied)
Vocabulary normalization at the contract boundary: the mission gate now accepts
'exactly the ONE aggregate verdict that means zero unsupported claims':
'all-supported'. No truthy acceptance, no substring matching, no new semantics.
Refusal behavior preserved: 'no-claims' still refuses, any 'N-unsupported' still
refuses, !claim_check (units empty) still passes claimOk as before.

## FROZEN PREDICATE TEST (all pass)
Full aggregate vocabulary: no-claims -> REFUSE (expected REFUSE); all-supported
-> PASS (expected PASS); 1-unsupported / 2-unsupported / 17-unsupported -> REFUSE
(expected REFUSE). Truthy/junk rejection: 'Supported', 'SUPPORTED',
'all_supported', 'partially-supported', 'supported-ish', '', null -> ALL REFUSE.
no claim_check (empty units) -> PASS (unchanged). ALL PASS.

## LIVE REGRESSION (deployed fix)
G1 supported mission passes: mission 'What is HARZ Wallet? Cite your sources.'
-> STATUS: verified, TASK 1 [orchestrate] -> verified, answer 'HARZ Wallet v3 —
Honest Registry 8 Chains 【S1】', ext_calls 0, task receipt 9ae4d401... (chained to
the same reasoner receipt as the passing chat), mission receipt 5e85766d...
G3 negative mission refuses: 'Who won the 2026 Bloboland national elections?'
-> STATUS: refused (honest, planner-level). Predicate test additionally proves
'partially-supported'/'N-unsupported' refuse deterministically.
G4 determinism: repeat identical mission -> identical task receipt
(9ae4d401 both runs).
G5 zero external calls: verified mission ext_calls 0.
G6 upstream/downstream regression: frozen 5-question chat battery 5/5
grounded-in-evidence, all ext 0 (Q1 2034326424, Q6 GDEG, Q9 NCC Type Approval,
Q14 HARZ Wallet v3, Q13 HARZ FX).

## BROWSER TEST (standing order honored)
Console -> Missions -> 'What is HARZ Wallet? Cite your sources.' ->
MISSION m-mission-98809a2d: STATUS: verified | PATTERN: RESEARCH | SOVEREIGN: true
TASK 1 [orchestrate] -> verified, ext_calls 0, receipt 9ae4d401...
MISSION RECEIPT: 43ba7a6a0a535ca035b48706c4a79591ce861d85bdf8b21fcea80a9e34596bf7

## GATE SUMMARY
G1 supported mission passes: PASS (verified, chained receipt)
G2 partially supported refuses: PASS (predicate test, full vocabulary)
G3 unsupported/negative refuse: PASS (live negative + predicate)
G4 determinism: PASS (identical receipts)
G5 zero external calls: PASS
G6 chat regression 5/5: PASS
G7 browser/live test: PASS (mission verified through the console UI)
G8 receipt + harz-git: this document (commit follows)

## ARCHITECTURAL NOTE
The full sovereign chain now holds end-to-end at every layer measured:
Search finds -> Packet preserves -> Reasoner judges -> Missions orchestrate ->
Verification enforces independently. Layer disagreements surface as honest
refusals with receipts instead of hidden fabrications — the refusal behavior
made this audit trivial to trace. The fix changed two strings and zero
intelligence.
