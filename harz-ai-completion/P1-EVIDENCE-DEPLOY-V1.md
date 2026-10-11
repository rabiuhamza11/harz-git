# P1 HARZ SEARCH EVIDENCE INTEGRATION — DEPLOY RECORD V1 (2026-10-11)

Dad's Go: Oct 11, 2026, after P0 acceptance (74ea832). P1 only; P2/P3 untouched.

## SAFEGUARD AUDIT FIRST (how can the chat reach HARZ Search today?)

- harz-ai bindings before P1: AI, GROQ_KEY(secret), HARZ_KV, HOTLINE_MESH, INTEL.
  NO path to HARZ Search; public-URL worker-to-worker fetch is blocked (1042 law).
- HARZ Search live interface (existing, no rebuild): GET /search?q= returns JSON
  {results:[{title,url,snippet,score,source,...}],total,strict_total}. UBA question
  retrieves exactly 1 result (HarzPay Onboarding page, score 14.15) whose snippet
  contains the account number. NO second index, NO corpus duplication, NO new
  retrieval path: one new service binding SEARCH -> harz-search (a1), same index.
- Noise floor measured live (Oct 11): greetings 7.83, "why is the sky blue" 12.47,
  "president of France" 10.05 (all irrelevant matches) vs real ecosystem facts:
  UBA 14.15, HarzPay wallet 15.07, "What is HARZ" 25.6. Threshold 13 separates
  all six test points cleanly.

## CHANGE (smallest targeted, server-side, /chat handler only)

Inserted between the existing clock-build branch and the chatAI call: if the
SEARCH binding exists and the message <= 300 chars, query HARZ Search via the
binding; if the top result scores >= 13, return an evidence answer composed of
LITERALLY the retrieved snippet + provenance (title, URL) + SHA-256 evidence
receipt (first 16 hex of title+url+snippet+score) + relevance score, labeled
"● LIVE · HARZ SEARCH EVIDENCE (retrieved, not inferred)". Below threshold, on
binding absence, or on ANY error: fall through to the normal Groq chat path,
byte-identical. Sovereign path only (own worker via service binding); NO
external AI providers involved. Client shell (renderApp), offline localBrain,
build paths, harz-intelligence v0.8.1: UNTOUCHED (diff-verified: only the /chat
handler changed; /app HTML byte-identical, so offline behavior is unchanged).

## ACCEPTANCE RESULTS (raw, deployed + real browser)

1. UBA REGRESSION (frozen record N1 / B2 candidate):
   - API: evidence answer with receipt 5c5b6b11f77e6abc, relevance 14.15,
     source HarzPay Onboarding + URL.
   - Programmatic verification: answer's account number MATCHES the frozen
     record in harz-intelligence/B2-COMPUTE-CLAUSE-CONSISTENCY-CANDIDATE.md
     (both masked here on purpose; compare done in code, True).
   - Provenance and receipt preserved in the user-facing answer.
   - Browser (real UI): same evidence answer rendered; the pre-P1 honest
     failure ("I don't have access to specific account numbers...") remains
     directly above it in the same transcript as before/after proof.
2. EVIDENCE INTEGRITY:
   - "Why do we see lightning before we hear thunder?" (12.47) -> normal chat
     answer, NO evidence presented (correct: no evidence exists in corpus).
   - "Who is the president of France?" (10.05) -> "Emmanuel Macron" from the
     normal path, NO false evidence.
   - "Hello, how are you?" (7.83) -> unchanged greeting answer.
   - Second evidence case: "How do I add money to my HarzPay wallet?" (15.07)
     -> correct onboarding snippet + provenance + receipt.
   - Every evidence answer states it is retrieved, not inferred.
3. REGRESSION PROTECTION:
   - Conversation (API): unchanged.
   - Multi-task build (browser, after P1 deploy): clock+calculator both
     built/reported; clock receipt 71a4493e77e401ca; calculator preview open.
   - Single clock (API): unchanged (receipt 4cae2e9f family, 8/8 tested).
   - Offline: server-only change, /app shell byte-identical (diff-verified);
     offline localBrain path untouched.
   - Sovereign paths: evidence path uses only the SEARCH service binding;
     zero external AI calls introduced.
4. REAL-BROWSER VERIFICATION: done (see above + screenshots in working
   history: evidence answer, multi-task regression, calculator preview).

## DEPLOY

Worker: harz-ai (a1), 6.6.0+p1. Deployed via safe-deploy variant that adds the
SEARCH service binding; all prior bindings preserved (AI, GROQ_KEY secret kept,
HARZ_KV, HOTLINE_MESH, INTEL) + new SEARCH -> harz-search. Post-deploy settings
verified all 6. Health: 6.6.0 operational. Compatibility date 2025-01-01
(matches deployed worker settings; prior deploys used 2024-01-01 harmlessly).

## REMAINING LIMITATIONS (honest)

1. Threshold 13 is measured, not proven for all inputs; an ecosystem page
   scoring >=13 on an unrelated question would be shown as evidence WITH its
   source visible, so the user can judge relevance. Watch and tune with data.
2. Evidence answers are literal snippets - no composition, no synthesis
   across multiple results (deliberate: retrieval must not masquerade as
   inference).
3. "search again" is NOT a command; wording avoided in the answer.
4. OpenRouter 401 (harz-intelligence external profiles) unchanged: owner key.
5. P2 language matching and P3 offline user bubble: WAIT per Dad's ruling.
