# FX TIER INTEGRATED INTO P4 CHAT (owner approval "You now have my approval", Oct 11, 2026)

## Scope interpretation (disclosed)

The approval was read as authorizing the one item the previous report
held behind explicit authorization: wiring the FX tier into the frozen
v6.6.0+p4 baseline. The four owner decisions (tail emissions, 0x222a10
identity, R2, real D1 kit run) are DECISIONS requiring his ruling
content, not blanket approvals — they remain pending, untouched.

## Design (boundary-preserving)

harz-ai v6.6.0+p4 gained TWO additive pieces, deployed via safe-deploy
(bindings preserved: AI, GROQ_KEY, HARZ_KV, HOTLINE_MESH, INTEL, SEARCH):

1. FX FALLBACK in /chat: fires ONLY AFTER the sealed-5K evidence path
   declines (score < 13 or untrusted). Queries the FX tier via the
   EXISTING SEARCH binding -> harz-search /fx/search (no new bindings).
   Response carries its own class label "FX FULL-TEXT TIER — RETRIEVED
   FULL TEXT, NOT VERIFIED FOR RELEVANCE · NOT SEALED-5K EVIDENCE" plus
   a SHA-256 receipt. Never passes isTrustedEvidence, never enters the
   sealed tier, no score claim. Any failure -> normal chat.
2. NEW ROUTE /api/fx?q= — direct labeled full-text query endpoint.

## Verification

1. Source diff = FX additions only (30 lines).
2. Sealed evidence path: "what is GDEG token supply" -> BYTE-IDENTICAL
   to pre-deploy (hash b828c543985ffe82 matched).
3. Below-threshold greeting -> normal chat, no FX label.
4. Health diff = timestamp field only.
5. FX fallback live: "chronology of conflict from the ancient world to
   the modern age" -> FX-labeled response, receipt 89c6478ef99376e7.
6. /api/fx works (labeled, count); missing q -> 400.
7. LIVE BROWSER VERIFICATION (Browserbase, screenshot captured): chat
   UI renders the FX-labeled answer with source + receipt; prior
   transcript cases (local brain, sealed evidence, artifact engine)
   behave unchanged in the same session.

## NOT touched

Sealed engine, corpus, 5K phone package, harz-intelligence reasoning
pipeline (FX NEVER reaches the reasoner/verifier — that would promote
it into the sealed evidence tier, violating the owner ruling).

Rollback: redeploy fx-tier/harz-ai-pre-fx.js.
