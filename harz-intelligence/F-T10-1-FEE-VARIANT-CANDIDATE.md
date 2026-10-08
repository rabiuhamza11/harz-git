# F-T10-1 — fee_variant pre-existing red: ATTACK COMPLETE, v0.10.1 CANDIDATE GATED (NOT YET PROMOTED)

**Date:** 2026-10-08 (opened on Dad's "build now" order, after his ruling named it a separate workstream)
**Layer:** the v0.10 fee specialist (buildFeeAnswer) — frozen battery test10 is the owner gate.

## The attack (no remedy built first)

Reproduced: "What does HARZ Pay charge per transaction?" quoted doc 10378 (HARZ AI Pay query
pricing) three times; doc 10470's 1.5% transaction fee never appeared. Reproduced identically on
the pre-router build (proven pre-existing, not GAP-4's).

Root cause, precisely:

1. The packet for this phrasing does not contain doc 10470; it contains 10378, whose pricing
   quotes ("Pay As You Go ₦50 /query") pass every mechanical gate: FEE_MARK ✓, fee-context gate
   ("per query") ✓, relevance gate (contains "pay") ✓.
2. The fee-targeted fallback retrieval — which WOULD fetch 10470 (it ranks 3rd for the fallback
   query "pay per transaction harz") — only triggers when the packet yields ZERO fee hits. One
   question-unrelated but gate-passing fee page suppresses it. The fallback never ran.
3. Contributing: the qTerms stoplist discards the question's most discriminating word —
   "charge" — so the relevance gate cannot distinguish "charge per transaction" from
   "pay per query."

Nothing false was quoted; the failure was a masking/coverage defect, not a fabrication.

## The candidate (v0.10.1, additive; gates and quotes unchanged)

1. strongTerms: same token split, excluding only generic function words — fee-class words
   (charge/fee/cost/price) stay IN.
2. Fallback trigger widened: runs when hits are empty OR when NO hit carries any strong term.
3. Ranking: strongOverlap (question's strong terms in the quote) descending, then packet
   position. A fee quote of the question's own class outranks a generic pricing quote.
4. FEE_MARK, fee-context gate, relevance gate, verbatim windows, provenance: UNCHANGED.

## Gate results (live candidate, deployed version 961272c2)

test10: 5/5 part 1 + 5/5 part 2 (three part-1 reruns, deterministic).
Healed answer: 10470's "1.5% per transaction" FIRST, 10378 second — both verbatim, both cited.
Full frozen regression bar: agents test 13/13, test8 5/5, testim1 24, testvs1 30, testcreation1
24, testsem1 12/12, testter1 12/12, testsemvid1 16/16, testrouter1 15/15 @ 0 external calls.

## Unsmoothed process record

First patch attempt deployed a NO-OP: the Python anchor used U+20B6 (₶) for ₦ (U+20A6) and
asserted before any edit; the deploy shipped the unchanged file. Caught by the anchor assertion,
not by luck. Second attempt applied 4/4 single-hit edits.

## Awaiting Dad's ruling

PROMOTE v0.10.1 (candidate -> frozen v0.10.1) or REVERT. The live worker currently runs the
candidate; revert = redeploy the pre-candidate source (in git history, commit b33e1b3).

---

## PROMOTED — Dad's ruling, Oct 8, 2026: "Promote."

v0.10.1 is now the frozen fee specialist. The candidate WAS the live worker (version
961272c2) and stands promoted in place; no redeploy needed. Owner battery test10 5/5 + 5/5,
full frozen bar green at promotion time. The pre-candidate source remains in git history
(commit b33e1b3) for any future revert ruling. This closes the fee_variant pre-existing red
named in Dad's Oct 8 GAP-4 ruling. Separate workstream complete.

---

## ADDENDUM — the index moved under the promotion (Oct 8, ~00:45 WAT)

Minutes after the promotion was sealed, test10 re-run: 4/5 + 4/5 — fee_variant red again.
The promoted code is byte-identical (no deploy since 961272c2). The input changed:
the search index was rewritten by the corpus workstream (harz-search /stats:
documents 10,471 -> 11,365, new index_digest aa22a26e, contract v0.4). The independent
workstreams collided on the shared live index.

Evidence: for the fallback query "pay per transaction harz", doc 10470 scored 14.82
(rank 3, inside the top-3 fallback scan) at gate time; it now scores 5.59 (rank 5,
outside the scan window). BM25 idf shifted with ~894 added documents. 10470's content
is intact — fee_paystack still cites its 1.5% via the packet path. The defect class:
the fallback scan window (top-3 of a 6-candidate slice) is fragile against index churn.

Candidate v0.10.2 direction (NOT BUILT, awaits Dad): widen the fallback scan from
top-3 to the full 6-candidate slice. The list already slices 6; the loop caps at 3.
Alternatively Dad may rule the fee battery re-baselined against the v0.4 index, or
revert v0.10.1. No action taken on the promoted layer without a ruling.

---

## v0.10.2 BUILD + GATE (Dad's ruling, Oct 8 morning) — CANDIDATE FALSIFIED, DEEPER DEFECT EXPOSED

Built exactly as ordered: fallback scan 3 -> 6 (the six candidates the path already
slices). Deployed as efee0208. Gate: test10 part1 4/5 + part2 4/5, three runs each — RED.
10470 verified IN the 6-window (rank 5, score 5.59) — the window fix is real but moot:
THE FALLBACK NEVER RUNS.

Proof: with the fallback suppressed, the answer = 10378 x3 (packet hits only). Had the
fallback run, it would scan 10470 (now in-window), whose hit carries strongOverlap 2 and
would rank FIRST. Its absence proves suppression.

The trigger (`!hits.length || !anyStrong`) is the remaining hidden assumption: the packet's
10378 hits contain the generic strong word "pay" (strongOverlap 1) -> anyShort true ->
fallback suppressed exactly when the packet has lost the right doc. The merge removed 10470
from the packet; the trigger keeps the fallback off; correct evidence is unreachable.

## HONEST CORRECTION to the F-T10-1 attack record

At v0.10.1 gate time the packet contained BOTH 10378 AND 10470 (the answer showed 10470
first, 10378 second, with the fallback never needed). v0.10.1's REAL fix was the
strongOverlap-first ranking, which lifted 10470's hit above 10378's earlier-positioned
hits. My original attack attributed the heal to the fallback trigger; that detail was
wrong. The ranking fix was genuine and remains the correct selector; the trigger was
vestigial and is now proven fragile.

## The invariant, restated

Dad's law: "Correct evidence must not become unreachable merely because corpus/index churn
changes candidate ranking." Two halves must both hold: the scan WINDOW (now 6, per ruling)
and the TRIGGER (must not suppress the fallback on generic overlap). Candidate direction
for Dad's ruling: unconditional bounded fallback (always run, 6 candidates, one extra
search + up to 6 fetches per fee answer), strongOverlap ranking stays the sole selector.
NOT BUILT — awaits ruling. v0.10.2 as-ordered stands falsified; not promoted.

## Architectural lesson (Dad's order, to the boundary ledger)

HARZ code can be frozen while its corpus evolves. Therefore retrieval gates must be tested
against corpus/index evolution, not only against a frozen fixture. The corpus did not break
HARZ; the corpus exposed a hidden assumption in the fallback. A live system's index is part
of its input contract, and every gate that depends on ranking must be re-gated whenever
the index digest changes.
