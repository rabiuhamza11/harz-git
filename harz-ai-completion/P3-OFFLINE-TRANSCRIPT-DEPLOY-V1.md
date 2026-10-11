# P3 OFFLINE TRANSCRIPT RENDERING — DEPLOY RECORD V1 (2026-10-11)

Dad's Go: Oct 11, 2026, after P2 acceptance (aeb3fa9). P3 only.

## AUDIT FIRST (transcript lifecycle, before any change)

- addMsg(t,c) renders the bubble AND persists it: saveMsg appends {t,c} to
  localStorage 'hzai_chat_v1' (cap 300). /app boot re-renders the saved
  transcript on every load (verified live: a fresh session restored the
  full P0-P2 test transcript).
- chatHistory/hzai_ctx_v1 is the MODEL CONTEXT (last 60, sent to online
  AI), separate from the transcript.
- DEFECT: sendText's offline branch rendered ONLY the local-brain answer
  (addMsg(m,'ai')); the user's question was never shown. Online messages
  persisted; offline answers persisted as orphans without their questions.

## CHANGE (one insertion, client-side only)

In the offline branch of sendText, before invoking localBrain:
  if(txt){addMsg(esc(txt),'user');}
The user's question now renders immediately and persists through the
EXISTING saveMsg lifecycle (no new storage layer, per Dad's constraint C).
chatHistory deliberately untouched: offline exchanges stay out of the
online model context, so online behavior is byte-identical (P0/P1/P2
protected). Server code, localBrain, offline answers, labels: UNTOUCHED.

## ACCEPTANCE RESULTS (raw, deployed browser, real offline emulation)

Offline (Network.emulateNetworkConditions offline + onLine forced false;
CDP per the documented onLine-emulation lesson):
1. "2 + 3" -> user bubble "2 + 3" + "● OFFLINE · LOCAL BRAIN
   2 + 3 = 5 (calculated on-device)".
2. "What is the price of tea in China?" -> user bubble + honest refusal
   ("my local brain is small...").
3. "Sannu da zuwa" -> user bubble + local greeting.
4. Reload WHILE OFFLINE -> /app shell reopens (service worker) and the
   ENTIRE transcript restores from hzai_chat_v1 including the new user
   bubbles: exactly the documented persistence design.
5. Screenshot of the three paired bubbles captured.

Online (emulation disabled, page reloaded):
6. "Build me a clock and a calculator." -> 2 tasks reported; clock built
   8/8 via artifact engine; calculator BUILT ON-DEVICE overlay opened.
7. English question -> English answer (P2 intact).
8. Hausa question -> Hausa answer (P2 intact).
9. UBA question -> LIVE · HARZ SEARCH EVIDENCE, receipt 5c5b6b11f77e6abc,
   relevance 14.15 (P1 intact). Screenshot captured.

Honest labels preserved: OFFLINE · LOCAL BRAIN on local answers; LIVE on
evidence; BUILT ON-DEVICE on local builds. No external AI implication
offline. All 6 bindings verified post-deploy incl. GROQ_KEY secret.

## NOTES / LIMITATIONS

1. Offline messages intentionally do NOT enter chatHistory (model
   context): keeping local-brain text out of online AI requests is the
   conservative choice; revisit if multi-turn offline context is wanted.
2. Pre-P3 orphaned offline answers (from earlier sessions) remain in old
   transcripts as historical data; new offline exchanges pair correctly.
3. OpenRouter 401 remains a separate owner-key issue. Retrieval-relevance
   audit remains a separate investigation per Dad's ruling.
