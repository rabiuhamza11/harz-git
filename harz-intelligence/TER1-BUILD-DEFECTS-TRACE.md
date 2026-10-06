# TER1 BUILD DEFECTS TRACE — harz-create-report-semantic v0.1 → v0.1.1
**Date:** 2026-10-06 (Africa/Lagos) | **Contract:** harz-create-report-semantic v0.1 (3baec55) | **Battery:** TER1 12/12 @ 0 ext

Build defects found by the gate itself during the frozen battery + browser/live test, fixed at the report-engine layer only. No frozen primitive touched (reasoner 1.1.6, studio router, TaskRecord formula, dual-sha law all unchanged).

## Defects found and fixed

1. **D1 — `packages` scope leak.** The report branch referenced `packages` outside its declaring block; front-door RESEARCH_AND_COMPOSE compose errored ("packages is not defined"). Fix: branch moved inside the evidence_from block; `reportHandled` hoisted to the executor head.
2. **D2 — TDZ error.** `reportHandled` declaration sat after its first assignment (Cannot access before initialization). Fix: declared before the evidence_from block.
3. **D3 — broken verifier link ("exactly once").** The original link demanded each claim appear exactly once, but the design carries every claim in BOTH SUMMARY and FINDINGS — the law as implemented could never pass. Fix: reportVerify rewritten to structural section checks: (a) every numbered finding binds byte-exact to a carried claim in order, (b) ANY numbered line must be a bound finding — an unbound "13. The fee is N5." refuses regardless of wording, (c) exactly one summary line per claim, byte-exact, [cN]-bound, (d) orphan-assertion law, (e) provenance carries every source claims_sha256 in BOTH the finding source lines and the provenance section (a provenance-only break now refuses instead of hiding behind an intact copy).
4. **D4 — `q` scope leak in the report delivery route.** GET /api/creation/v1/report threw (worker exception 1101) — the query object was not in scope at the route's location. Fix: local `new URL(request.url)` parse.
5. **D5 — sentence segmentation without the /g flag (CARRY-LOSS class).** Deterministic sentence segmentation matched only the FIRST sentence per line: any additional claims on the same line were silently DROPPED from the report. This is the most serious defect of the build — a lawful carry contract violated by a missing regex flag. Fix: /g added; TER1-7 injection case now carries both sentences as bound claim units.

## Disclosed amendment
TER1-7's assertion granularity amended (line → sentence units) after the segmentation refinement; the LAW is unchanged — injection text carried byte-exact as data, verify passes, routing unaltered.

## Remaining disclosed boundary (no silent fix attempted)
The live UBA report still renders one segment: the reasoner's carried claim for this query is a single unpunctuated harvested-table line. Byte-exact carry means the report cannot split it without a semantic act, and the frozen reasoner answer format is not the report engine's to rewrite. Named for Dad's ruling: text-report readability for harvested answer formats is bounded by the frozen reasoner output.

## Verification state
TER1 12/12 @0ext; testim1 24/24; testvs1 30/30; testcreation1 24/24; testsem1 12/12; agents 13/13; 23/23 TaskRecords CLOSED with receipt; browser/live test: person's exact request through /console → ONE TaskRecord (full lifecycle, dual sha, receipt fc42cdff) with the report text rendered human-readable below the record.
