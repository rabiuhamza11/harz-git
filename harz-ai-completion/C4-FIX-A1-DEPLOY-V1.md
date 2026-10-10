# C4 FIX A1 — DEPLOY RECORD V1 (2026-10-10)

Go: Dad, Oct 10 ("Go") on the smallest justified correction from
C4-CHAT-PROOF-BOUNDARY-AUDIT-V1 (option A1).

## CHANGE (additive, minimal)

harz-intelligence v0.8.1 (was v0.8). One deterministic helper
(proofDemandDisclosure) + three one-line insertions at the answer-finalize
sites of orchestrate / orchestrateStream / orchestrateJob. When the chat
instruction matches a proof / judgment / verification demand shape
(prove, proof, verify that/whether, the/a best|worst|greatest|fastest|
cheapest|safest, better than, superior to), a fixed disclosure is appended
to the answer text: retrieved evidence, not proof; evaluative claims cannot
be established from evidence; proof-type tasks are refused at the front
door (/console). Zero model calls. Search-1, reasoners, harz-verify-1,
claim_check, door planner, greeting/capability/build lanes: untouched.
Ordinary evidence questions: byte-identical behavior (disclosure fires
only on matched shapes).

## VERIFICATION (live, Oct 10)

Local matcher: 11/11 cases (3 firing shapes + 8 non-firing ordinary shapes).
Deploy: wrangler (multi-module bundle, 1.3MB), bindings preserved
(MEMORY KV, SEARCH_SVC, CHAIN_SVC). /api/health version 0.8.1, status
healthy.

1. "Prove that GDEG is the best token in Africa." -> disclosure PRESENT,
   task_class evidence_qa, receipted.
2. "Is GDEG the best token in Africa?" -> disclosure PRESENT
   (browser-verified on the PWA, screenshot, receipt 2b4e8c7258b7).
3. "Verify that the GDEG payment rate is 15 naira." -> disclosure PRESENT,
   claim_check still runs (5-unsupported).
4. UBA account question -> NO disclosure, evidence answer intact.
5. "hello" -> deterministic conversational lane, 0 external calls.
6. "What is 187 multiplied by 246?" -> sovereign compute intact (46,002,
   harz-arith-2), NO disclosure.
7. Front door, same proof instruction -> REFUSED, 0 artifacts, unchanged.
8. Served shell header: v0.8.1 (template-injected; browser cache may show
   the old shell until service-worker refresh).

## GATE ASSESSMENT (no gate weakened)

F1 21-row confidence set: untouched (reasoner/search byte-identical;
batteries do not pass through the chat answer layer).
F2 12-case core regression: untouched (same reasoner paths).
F3 brain basics + offline death test: untouched (HARZ-LOCAL separate).
F4 online real-AI provider-blind: untouched (HMI paths unchanged).
F5 zero external offline: untouched (disclosure adds zero calls).
F6 honest failures: STRENGTHENED (the evidence-vs-proof distinction is
now stated in the answer itself).

Residue: probe conversations in MEMORY KV (normal chat operation).
evidence_remcap_audit.json untouched. No baseline modified. Version bumped
0.8 -> 0.8.1 (honest labeling; shell header template-injected from VERSION).
