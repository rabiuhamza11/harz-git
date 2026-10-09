# HARZ LOCAL v0.1 — PHASE 1 DELIVERABLE (Dad's "Go", Oct 9 evening)

Single-file sovereign client (harz-local-v0.1.html, zero dependencies, works offline):
Task Controller -> 4 lanes (calculator TOOL / clock builder / knowledge evidence-first /
general chat with local brain) -> Verification -> receipted TaskRecords persisted in
localStorage (GAP-1 law: no CLOSED without receipt; T9 re-hash verifies integrity).

Headless verification executed against the sandbox proving ground (live ollama 0.40.2 +
qwen2.5:3b-instruct-q4_K_M at 127.0.0.1:11434, zero keys, zero external endpoints):

1. T2 arithmetic 187x246 -> TOOL lane, answer 46002, model_calls=0 (LAW: tools compute, never the model)
2. T4 144/12 -> 12, model_calls=0
3. T3 clock artifact -> built, interval+render logic present, sha256 e6f34d331c..., runs in iframe
4. T5 knowledge "UBA account number" -> EVIDENCE_GROUNDED, model composed FROM evidence,
   answer cited [doc-10470], 2034326424
5. T1 greeting "Hi" -> "Hello! How can I assist you today?" (ANSWERED)
6. T9 receipt integrity -> 5/5 stored records re-hash to stored receipts

DEFECT FOUND AND FIXED BY THE HARNESS BEFORE DELIVERY (attack loop works):
Weak retrieval let "Paystack account number" match the UBA doc on generic words
(account+number, score 2) and quote it as the answer — a provenance leak. FIX: the
retrieval law now requires EVERY distinctive question term to be present in the doc
(generic question words excluded); after the fix Paystack evidence = none (correct),
UBA question still grounds. Fallback (model down) now labels itself a verbatim evidence
quote with disclosure, never composition.

PERSISTENCE (partial Phase 4 evidence): sandbox restarted between turns; ollama runtime
AND model blob files survived (sha256-verified blobs intact), service restored clean.
In-page persistence: records survive reload via localStorage (T6 in the page's own test suite).

NOT CLAIMED (Dad's own limitation rule): the laptop and Infinix have NOT been configured
or tested. The page ships with a built-in "Acceptance Tests" panel that runs Dad's 9
acceptance tests individually on the actual device. Deliverable upload to chat blocked
by exhausted integration credits — file is in this vault commit; upload to Dad the
moment credits reset (standing deliverable law).

Laptop steps (zero budget): install Ollama for Windows -> `ollama pull qwen2.5:3b-instruct-q4_K_M`
(~1.9 GB, Apache-2.0) -> run `set OLLAMA_ORIGINS=*` if the page can't reach the brain ->
open harz-local-v0.1.html in the browser -> click Acceptance Tests.
