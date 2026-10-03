# REASONER-1.1 CONFIDENCE AUDIT — TRACE (2026-10-03)

Contract: REASONER-AUDIT-V1-CONTRACT.md (frozen eb8f421 BEFORE any change).
Frozen inputs: packets-frozen.json (21 cases, exact Search-1 v0.4 + packet v1.1
outputs, full evidence texts). Frozen reasoner: 1.1 @ 9683a00. Weights digest
unchanged throughout: 88eaff62...

## THE CENTRAL QUESTION, ANSWERED
For Q13/Q14 (gold at packet rank 1), the exact refusal condition was:
best-cosine < TH (0.1308) → guard 'below-threshold'. Measured: Q13 best 0.1193
(gold unit itself), Q14 best 0.1061 (a NON-gold unit; gold wallet page scored
0.0326). The cosine was computed between the FULL natural-language question and
the full 480-char windows, with function words in the query vector.

## PROVEN DISEASES (trace numbers, frozen corpus)
D1 evidence-confidence bug — CONFIRMED, primary. Query vector included function
words (what/is/does + instruction frames cite/sources, default idf 2.5) diluting
qNorm and matching generic UI text; window-size uNorm diluted short queries
below a threshold calibrated on longer benchmark queries. Q14 even MIS-RANKED:
the Super App page beat the actual Wallet page on what/is overlap (0.1061 vs
0.0326).
D4 entity-alignment bug — CONFIRMED. 'harzswap' (query) never matched 'HARZ Swap'
(evidence): compound tokenization gap. Q12 best 0.0630.
Composition disease — CONFIRMED during the fix. Sentence picking ignored titles:
'Same wallet' (2 words, faucet page) beat 'HARZ Wallet v3 — Honest Registry 8
Chains' purely via the length penalty.
Layer-separation disease — CONFIRMED. The reasoner re-ranked the packet by its own
cosine, discarding Search-1's ranking: the packet's S1 WAS the wallet page, but a
faucet page mentioning 'wallet' 8x (uw 18.03 vs wallet-page 9.01) won the
re-rank, so the wallet page's sentences were never extracted.
D2 composition-confidence collapse — not present (no composition step reached).
D3 multi-part penalty — not present (T2's refusal is the price-guard + arithmetic
incapability, honest). D5 threshold-too-high — NOT diagnosed as the disease and
the threshold was NOT lowered. D6 correct refusal — true only for the corpus gap
case (no HARZ-consensus doc for 'consensus mechanism' beyond the Chain Explorer's
'Proof of Edge', which the fixed reasoner now cites).

## THE FOUR LAW FIXES (1.1 → 1.1.6, deterministic, no special cases)
R1 content-terms-only query vector; FN_WORDS extended with instruction frames.
R2 camelCase compound split on both sides.
R3 title-anchor: unit vector TITLE x2 + BODY x1; sentences from title-anchored
units gain the title term's idf.
R4 layer separation: packet S-order IS the rank — sentence extraction and guards
read packet top-3; cosine remains only the answerability gate.

## FROZEN-CORPUS A/B RESULT (original vs 1.1.6)
12/12 previously-answering cases: same mode, same guards, scores equal or higher.
5/5 below-threshold refusals flipped to grounded answers, each leading with the
subject page's definitional sentence:
Q5 → Chain Explorer 'Proof of Edge' (the actual consensus)
Q12 → 'HARZSwap Sovereign DEX on HARZ Chain ... L1 AMM with signature verification'
Q13 → 'HARZ FX v2.0 | Live: ER-API + CoinGecko ...' (gold S1)
Q14 → 'HARZ Wallet v3 — Honest Registry 8 Chains 【S1】'
Q17 → 'HARZ Ecosystem 25+ platforms'
3/3 negatives: unchanged honest refusals. T2 price-guard: unchanged (arithmetic is
registry-declared incapability; refusal stands).
Determinism: identical sha256 across repeat runs (2abbdc36...).

## LIVE VERIFICATION (deployed 1.1.6)
G3 frozen 5-question battery: 5/5 PASS (was 3/5) — Q1 2034326424, Q6 GDEG, Q9 NCC
Type Approval, Q14 HARZ Wallet v3, Q13 HARZ FX, all grounded-in-evidence.
G4 live determinism: identical evidence + identical answers across repeat asks.
G5 negatives live: qwizzleblatt + Bloboland both refuse honestly, zero fabrication.
G6 zero non-HARZ calls: reasoner path is pure in-worker arithmetic; receipts show
EXTERNAL CALLS: 0.

## BROWSER TEST (standing order honored)
Console chat 'What is HARZ Wallet? Cite your sources.' → 'HARZ Wallet v3 — Honest
Registry 8 Chains 【S1】', sources listed, receipt 9ae4d401..., EXTERNAL CALLS: 0.
Missions: RESEARCH mission on the same question now REACHES the answer (same
receipt 9ae4d401) but the mission layer STILL refuses — NEW FINDING, see below.

## NEW FINDING (recorded, NOT fixed — out of audit scope)
The Missions v0.1 verification gate (worker.js, mission executor) requires
claim_check.verdict === 'supported' EXACTLY, but the frozen verifier emits
'all-supported' when every claim passes (Q14: claim_check 'all-supported',
supported 2, unsupported 0 — yet mission refuses: "verification did not establish
grounded support"). A vocabulary mismatch between the verifier's own verdict
strings and the mission gate's string equality. One-line class of fix (accept
the verifier's verdict vocabulary), but it belongs to the MISSIONS layer:
recommend MISSIONS-1 VERIFICATION AUDIT as the next rung, same freeze-first law.

## GATE SUMMARY
G1 trace completeness: PASS (all 21 cases, reasoner-traces.json)
G2 regression: PASS (12/12 unchanged; 5 flips are all diagnosed-law fixes, each
    leading with subject-page evidence)
G3 end-to-end >= 4/5: PASS 5/5 live
G4 determinism: PASS (offline digest-identical, live answer-identical)
G5 negatives honest: PASS (all, zero fabrication)
G6 zero non-HARZ calls: PASS
G7 browser test: PASS (console answer + receipt + zero external calls; mission
    path traced to the missions-layer verdict mismatch, disclosed)
G8 receipt + harz-git: this document (commit follows)
