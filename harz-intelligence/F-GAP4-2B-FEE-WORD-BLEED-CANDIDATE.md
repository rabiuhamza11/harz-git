# F-GAP4-2b — FEE-WORD BLEED — CANDIDATE (built + gated, awaiting Dad's ruling)

**Deployed:** Oct 9, 2026, worker version `d968c4c2-0841-477c-a14a-02575e39135a`
**Scope:** classifyTask routing layer ONLY (worker.js). Frozen layers untouched: search1.js v1.2 extractor, the F-GAP4-2 value ladder, the F-GAP4-2 universal provenance law, the fee specialist's own gates.
**Acceptance principle (Dad, verbatim):** "The requested value type and admissible evidence must control the answer. A keyword must not steal the question into a different semantic lane."

## Diagnosis (empirical, pre-fix)

classifyTask tested the fee signature BEFORE the identifier signature, with no consultation of the requested value type. Repro (conversation fgap42b-repro-a): "Which bank account does HARZ use for fee collections from customers?" — an account question — was stolen into fee_lookup and answered with a NEIGHBORING VALUE: a Kuda savings-plan fee quote ("Premium customers: earn 20% a year..."), not the requested account. Repro-b ("What is the account number that receives fee payments for HARZ Pay?") was stolen the same way. The boundary defect: keyword PRESENCE overrode the question's requested entity and the evidence-supported value type.

## The fix (routing layer, additive, one rule)

A requested-value-head resolver (`requestedHead`), consulted ONLY when both signatures match:
1. 'how much/how many' asks an amount of money → fee head.
2. Otherwise, the EARLIEST head noun (fee family vs account/bank/ussd family) after the interrogative anchor (what is the / what's the / which / tell me the / what) decides the lane.
3. Only a resolved IDENTIFIER head diverts to identifier_lookup. A fee head or an unresolvable head keeps the frozen fee behavior, byte-unchanged.
4. The identifier rule itself, the fee rule's regex, exactArithmetic precedence, and every other routing rule are untouched.

## Gates (all post-deploy, all 0 external calls)

**Direction 1 — account questions containing fee terminology (must stay account questions):**
1. "Which bank account does HARZ use for fee collections from customers?" → identifier_lookup. The frozen v1.2 extractor refuses this shape honestly (its discriminators are not grounded near the value in any unit) — pre-fix this question returned a neighboring Kuda fee quote; post-fix it returns the requested lane and an honest refusal, never a neighboring value.
2. "What is the account number that receives fee payments for HARZ Pay?" → identifier_lookup, value 2034326424 from doc 10066 with provenance.
3. "Which UBA account does HARZ Pay use for fee processing?" → identifier_lookup, value answered.
4. "Tell me the account details that receive HARZ fee payments" → identifier_lookup, honest refusal (no neighboring value).
5. "Which bank receives HARZ transfer fees?" → identifier_lookup, value 2034326424 answered.

**Direction 2 — genuine fee questions containing account terminology (must stay fee questions):**
6. "What is the fee on account transfers at HARZ Pay?" → fee_lookup.
7. "Which fees are charged to my bank account for HARZ Pay transfers?" → fee_lookup.
8. "How much does HARZ charge for account transfers?" → fee_lookup.
9. "What is the pricing for the HARZ business account?" → fee_lookup, honest refusal when ungrounded.
10. "What rate does the HARZ bank account earn?" → fee_lookup, fee quote answered.
11. "What is the cost of opening an account at HARZ?" → fee_lookup, honest refusal.

**Negative path:** "Which GTBank account does HARZ use for fee collections?" → identifier_lookup, honest refusal; the frozen entity-must law refuses to borrow the UBA value for a GTBank question.

**Sealed-law interplay:** "According to the ingested document, which UBA account receives fee payments for HARZ Pay transfers?" → identifier_lookup, answered from [INGESTED] intake evidence, no corpus substitution, 0 ext. The sealed F-GAP4-2 universal provenance law survives this candidate intact.

**Full frozen regression suite green post-deploy:** agents 13/13, test10 5/5 + 5/5, test8 5/5 + 5/5, im1 24, vs1 30, creation1 24, sem1 12/12, ter1 12/12, semvid1 16/16, router1 15/15, m2 17, m3 16, m4 16 — all 0 ext. (Executed in the frozen hygiene order: battery suite first, intake diagnostics re-ingested after the m2 wipe, intake gates last.)

**Determinism:** repeat runs of the flagship bleed case behaviorally identical (identifier_lookup, honest refusal, no neighboring value), both directions stable.

## Disclosures

**D1 — honest refusals on some account-worded shapes.** Questions like "account for fee collections" route correctly but the frozen v1.2 extractor refuses when the question's discriminators are not grounded near the value in any retrieved unit. This is the sealed title-or-window binding law operating, not a defect of this candidate; pre-fix these shapes returned WRONG-lane neighboring values, which is strictly worse. The acceptance principle permits refusal over a neighboring value.

**D2 — frozen battery carries no both-signature case.** No existing frozen battery question contains both fee and account terminology, so the correction's regression surface within the frozen suite is empty; both-direction behavior is gated by the adversarial set above and recorded here for future batteries.

## Awaiting ruling

**PROMOTE** → F-GAP4-2b closed; the remaining open item in this stack becomes B2 compute-clause consistency. Or **REVERT** → worker redeploy from git main pre-candidate state.

---

## PROMOTED — Dad's ruling, Oct 9, 2026. F-GAP4-2b: PROMOTED → SEALED.

PROMOTION RULING (preserved): The defect was real, the correction at the right boundary, the
evidence supports closure. The router now respects the requested value type ("Which bank account
does HARZ use for fee collections?" → ACCOUNT; "What is the fee on account transfers?" → FEE).
The change is confined to routing; the sealed v1.2 entity-binding law and universal provenance
law remain untouched. Negative cases behave correctly; the GTBank negative refuses rather than
borrowing the UBA account; the ingest-scoped test respects its evidence boundary; the frozen
regression suite passes with determinism stable and zero external calls.

DISCLOSURE RULING (verbatim): "A correctly routed refusal is better than a confidently
delivered value from the wrong semantic lane. Do not weaken the sealed extractor merely to
increase the answer rate. Any future improvement to claim-shape binding should have its own
evidence and regression gates."

REMAINING LIMITATION (preserved): Some correctly routed account questions remain unanswerable
from available evidence — a known capability limitation, not a reason to retain the routing
defect.

Build: d968c4c2. Vault: bddc88b. QUALIFICATION (verbatim): "This ruling accepts the supplied
live and regression evidence; I have not independently executed the deployed build."

NEXT (per ruling): B2 compute-clause consistency — OPEN FOR BOUNDED INVESTIGATION AND BUILD,
without reopening the sealed findings (F-GAP4-2a, 2b, 2c, 2). First establish the failure
boundary and reproduce the inconsistency; do not assume the answer is to increase the timeout.
Promotion contingent on evidence.
