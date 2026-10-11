# RETRIEVAL-RELEVANCE AUDIT V1 — FROZEN TEST SET & CRITERIA (2026-10-11)

Dad's Go: Oct 11, 2026 (after P3 acceptance 164ce0c). Rules: NO code changes,
no deploys, frozen set, raw results, explicit pass/fail, retrieval failures
separated from reasoning failures.

## System under audit (as deployed)

- harz-ai 6.6.0+p3 (chat surface). Evidence gate: SEARCH binding -> /search,
  top result score >= 13 -> literal snippet + provenance + receipt. The gate
  IGNORES the /search match tier ("and" | "relaxed") and strict_total.
- harz-search v0.5 (index): tier-1 strict AND over query terms; tier-2
  deterministic relaxation ONLY when tier 1 is empty (drops terms with no
  postings first, then least-informative by df); BM25 (k1=1.2, b=0.75);
  responses carry match, dropped, strict_total, top.score.

## FROZEN TEST SET (16 cases)

Category EV — evidence SHOULD fire and answer the question:
1. EV1 "What is the UBA account number used for HARZ Pay bank transfers?"
2. EV2 "How do I add money to my HarzPay wallet?"
3. EV3 "What is HARZ?"
4. EV4 "What is the GDEG token price?"

Category CH — NO evidence should fire (general knowledge / greeting):
5. CH1 "Why do we see lightning before we hear thunder?"
6. CH2 "Who is the president of France?"
7. CH3 "Hello, how are you?"
8. CH4 "How do I cook jollof rice?"

Category TRAP — keyword overlap, different meaning (false-relevance risk):
9.  T1 "What is the capital of Kano state?" (known FP: "capital market")
10. T2 "What is the capital of Nigeria?"
11. T3 "What are the bank transfer charges for UBA in Nigeria?"
12. T4 "Which Nigerian bank is the best for savings?"

Category INS — ecosystem-adjacent, evidence likely insufficient:
13. I1 "Who is the CEO of HARZ?"
14. I2 "What is the HarzPay customer care phone number?"

Category GND/T — grounding + traceability (run over every EV/INS/TRAP case
where evidence fired):
15. G1 evidence body must be the VERBATIM /search snippet (zero composition)
    plus the fixed provenance/caveat lines.
16. T1 receipt must recompute: sha256(title+"\n"+url+"\n"+snippet+"\nscore:"+score)
    first 16 hex; source URL must return 200; top.score must equal /search.

## EXPLICIT PASS/FAIL CRITERIA (frozen before running)

R-RELEVANCE: EV case PASSES iff evidence fires AND the top snippet actually
  addresses the question (human-judged, rationale recorded).
R-NOFALSE: CH case PASSES iff NO evidence label appears (normal chat path).
R-TRAP: TRAP case PASSES iff evidence does NOT fire, OR fires and the snippet
  actually answers the question. FAIL = weakly-relevant evidence displayed.
R-INSUFF: INS case PASSES iff no evidence (chat handles honestly) OR the
  evidence shown actually answers; showing non-answering evidence = FAIL
  (mitigation: caveat line exists, recorded).
R-GROUND: PASS iff evidence body verbatim-matches the /search snippet; any
  paraphrase/composition in the evidence body = FAIL.
R-TRACE: PASS iff receipt recomputes, score matches /search, source URL 200.

REASONING vs RETRIEVAL separation: a case is a RETRIEVAL failure when the
wrong/weak document was admitted or the right one missed. It is a REASONING
failure only if the chat path (no evidence) answers with unsupported
ecosystem-specific claims, or an evidence answer contains text NOT in the
retrieved snippet. Judged per case, recorded with the raw response.

Method: each question POSTed to https://harz-ai.harz.workers.dev/chat (raw
response recorded); parallel GET https://harz-search.harz.workers.dev/search?q=
for the same query to capture match/dropped/strict_total/top score; receipt
recomputed in Python; source URL HEAD-checked. No mutations, no deploys.
