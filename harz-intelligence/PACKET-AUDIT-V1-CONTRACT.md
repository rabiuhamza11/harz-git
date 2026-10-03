# SEARCH-1 PACKET AUDIT — CONTRACT (frozen BEFORE any change)

FROZEN: 2026-10-03, before any packet-layer change. Executor: Hauwa. Dad's order: "Go on
SEARCH-1 PACKET AUDIT." Predecessor: SEARCH AUDIT v0.1 (receipt c1b2f6d) — search-core v0.4
frozen and live (15/17 raw battery, flagship rank 1 strict-AND).

## Question this audit answers
Does the evidence-assembly layer preserve the truth the frozen search engine produces?
For every frozen gold case, record the full chain and classify every loss:

query -> raw candidates -> packet candidates -> omitted candidates -> selected evidence
-> final citation -> receipt

Loss stages (each observed case MUST be classified to exactly one, with evidence):
1. VARIANT GENERATION — no variant surfaces the gold doc in the raw 12 (raw-engine gap
   cases Q5/Q7 are SEARCH-side v0.5 candidates, classified `raw_engine_gap`, not packet faults).
2. SCORING — gold doc retrieved but scoreW/scoreCandidate/bonuses rank it below the top 12.
3. TRUNCATION — gold doc in byId but cut by cands.slice(0, 12) (candidate_ids).
4. DEDUPLICATION — gold doc collapsed by mirror-family dedup (title family + jaccard).
5. DIVERSIFICATION — gold doc cut by max-2-per-domain diversify cap.
6. SELECTION — gold doc survives dedup+diversify but is not in TOP_K_EVIDENCE (6).
7. SERIALIZATION — gold doc selected, but the 400-char snippet cut or the 480-char
   bestWindow drops the evidence value the question asks about.
8. COVERAGE GATE — packet status = insufficient_evidence though gold was present.
9. CITATION — gold evidence present in packet, but the final cited answer (reasoner,
   OUT OF SCOPE for modification) does not use it. Recorded, not fixed here.

## Scope (the ONLY files this audit may modify after classification)
- harz-intelligence/search1.js — packet assembly: analyzeQuery variant generation,
  scoreW weighting, scoreCandidate + bonuses, dedupCandidates, diversify, enrich/bestWindow,
  coverageOf, semanticOf/structured candidates.
- harz-intelligence/worker.js — ONLY the search glue it already owns: harzSearch snippet
  limit, search1Baseline limit, search1FetchPage. No orchestrator/reasoner/verifier edits.
OUT OF SCOPE (frozen, never touched): search-core v0.4 + D1 index (SEARCH AUDIT v0.1),
reasoner answer composition, harz-verify-1, missions/planner, Studio, all other workers.

## Laws (inherited + extended)
- S1-S7 of Search-1 v1.0 remain law: no invented evidence; refuse on insufficient
  coverage; packets pure functions of (question, index, corpus); reproducible digests;
  zero external search APIs; mirrors collapsed, contradictions exposed; no LLM in retrieval.
- Freeze first -> trace/classify -> fix -> test -> browser/live test -> receipt -> report.
- NO CROSS-LAYER RESCUE: packet assembly may not work around search-core gaps, search may
  not be re-tuned to feed the packet, the reasoner may not compensate for packet losses,
  and the packet may never be patched to satisfy the verifier.
- Every packet change must be deterministic arithmetic with its reason recorded.
- Dad's standing orders apply: no report before browser test; harz-git commit for every step.

## Battery (frozen, unchanged from SEARCH AUDIT v0.1)
- The frozen 20-question battery (17 gold with verified gold_ids, 3 negative controls),
  file harz-search/battery.json — reused verbatim, question text identical.
- Plus the frozen TASK-H T2 multi-part probe (UBA account + Estate Network URL + GDEG
  rate arithmetic) as case 21.

## Gates (all must pass for promotion; failures reported honestly, never loosened)
G1 TRACE COMPLETENESS: all 21 cases produce the full 7-stage trace record with receipts.
G2 PRESERVATION: every gold case that raw search v0.4 surfaces in its 12 (measured 15/17)
    must end with >=1 gold doc in packet selected_evidence AFTER fixes. Target 15/15.
    Pre-fix baseline recorded first, each miss classified by stage.
G3 END-TO-END: >= 4 of the 5 auditor-selected gold questions answered correctly through
    the UNCHANGED chat API + UNCHANGED verifier (same 5 questions as SEARCH AUDIT v0.1:
    Q1 UBA, Q6 GDEG, Q14 HARZ Wallet, Q9 NCC SIM, Q13 HARZ FX).
G4 DETERMINISM: identical question -> identical evidence_digest, twice, both nodes.
G5 NEGATIVES: negative controls produce no fabricated evidence; subject_absent refusals
    stay honest; the 3 negative questions must NOT return gold-free confident answers.
G6 ZERO NON-HARZ CALLS: packet path calls only the search worker + HARZ-owned pages.
G7 BROWSER/LIVE TEST: search UI + console chat (Mission->Search->Verify) browser-verified.
G8 RECEIPT + harz-git commits at freeze and at promotion, with the full trace table.

## Deliverables
1. TRACE.md — one row per case: variant list, raw candidates per variant, candidate_ids,
   omitted gold candidates + stage classification, selected evidence ids, final citation,
   receipt/search_id.
2. Fixed search1.js (version v1.1, changes + reasons in code comments) deployed + committed.
3. Receipt with gate results; honest failures recorded as failures.

Verdict rule: a stage classification is only valid with direct evidence from the trace
(numbers, ids, scores), never from assumption.
