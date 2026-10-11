# P2 LANGUAGE MATCHING — DEPLOY RECORD V1 (2026-10-11)

Dad's Go: Oct 11, 2026, after P1 acceptance (6fbc0fb). P2 only; P3 untouched.

## ROOT CAUSE

chatAI's system prompt asked the model to match the question's language, but
the Hausa-first framing ("AI na farko da ke magana da Hausa") biased the
primary model (CF llama-3.3-70b) to answer English questions in Hausa
(verified live pre-P2: the lightning question answered in Hausa).

## CHANGE (smallest targeted)

1. New deterministic helper detectReplyLanguage(msg): explicit overrides
   first (answer/reply/respond in English|Hausa, amsa da Hausa|Turanci),
   then dominant-language scoring (Hausa token lexicon vs English token
   lexicon, "me ya/ake/ke" bigram booster; ties/no-signal default English,
   which protects English questions). Unit-tested 13/13 locally before
   deploy (see harz-ai-p2-detect-lang-tests.js).
2. chatAI appends ONE binding directive to the unchanged identity prompt:
   Hausa detection -> "HARSHE: Ka amsa da Hausa KAWAI a wannan sako."
   English detection -> "LANGUAGE: Reply to this message in English ONLY."
   Hausa-first identity/branding preserved verbatim.
3. Evidence path (P1) interplay: retrieved evidence is NEVER translated
   (constraint 5). When the user's detected language is Hausa and evidence
   fires, a fixed Hausa note is appended explaining the evidence is shown
   in its original language, untranslated, meaning unchanged (LURA note).
4. Everything else byte-identical: P0 dispatcher, P1 gate/threshold,
   offline brain, getHausaResponse fallback, code/math/weather modes,
   harz-intelligence v0.8.1.

## ACCEPTANCE RESULTS (raw, deployed + real browser)

1. E1 "Why do we see lightning before we hear thunder?" -> ENGLISH answer
   (the original defect case; browser-verified with screenshot).
2. E2 "What is the capital of Kano state?" -> evidence path fired on a
   weakly-relevant match (Daily Trust Dangote article, score 19.1, "capital"
   false-friend) - SEE FINDING below.
3. H1 "Me ya sa muke jin yunwa?" -> Hausa answer (browser-verified).
4. H2 "Yadda ake dafa wake da shinkafa?" -> Hausa answer.
5. O1 "What is the capital of Nigeria? Answer in Hausa." -> override
   detected; evidence fired (Legit.ng, 17.72) shown literal + LURA Hausa
   note appended live.
6. O2 "Me ya sa muke jin yunwa? Answer in English." -> English answer.
7. M1 "Kana lafiya? I want to know what HARZ AI can do." -> dominant
   English -> English answer.
8. M2 "Please amsa min da harshen Hausa game da GDEG?" -> dominant Hausa;
   evidence fired (HARZ Digital, 13.67) + LURA note live.
9. EV UBA evidence question: unchanged - receipt 5c5b6b11f77e6abc,
   relevance 14.15, account matches frozen record (programmatic), no
   LURA note (English user). P2 did not break evidence retrieval.
10. MT "Build me a clock and a calculator." in the deployed browser: both
    tasks reported; clock built 8/8 receipt 3549f83274bf0f00; calculator
    overlay opened. P0 intact after P2.

## FINDING (P1 threshold limitation, live instances — NOT changed, needs ruling)

Three of the new P2 test questions pulled weakly-relevant evidence at
score >= 13: E2 (19.1, "capital" matched "capital market"), O1 (17.72,
Legit.ng Hausa-idioms editorial), M2 (13.67, generic HARZ Digital page).
All are honestly labeled with source so the user can judge relevance, but
the threshold is confirmed PROVISIONAL as ruled in P1 acceptance: the
mismatch is semantic, not just score-based. No change made (P1 is
accepted/frozen); recommend a separate evidence-relevance review with a
larger sample before tuning.

## DEPLOY

Worker: harz-ai (a1), 6.6.0+p2, safe-deploy, all 6 bindings verified
incl. GROQ_KEY secret. Offline unchanged (server-only diff; /app shell
byte-identical). OpenRouter 401 separate (owner key).
