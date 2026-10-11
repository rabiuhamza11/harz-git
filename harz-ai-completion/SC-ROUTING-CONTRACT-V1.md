# S-C LOCAL-FIRST ROUTING — CONTRACT & FROZEN VALIDATION PLAN (2026-10-11)

Owner ruling: S-C APPROVED FOR DESIGN AND VALIDATION PLANNING ONLY.
Implementation NOT authorized. This document changes no production bytes.
P4 baseline preserved unchanged (deployed sha b99fb2e1846e5048 verified
at S-A start; re-verify before any future pre/post run).

## 0. BOUNDARY EVIDENCE (measured, not assumed — probes Oct 11)

Source-read of the deployed shell (41,636 bytes) + 8 read-only offline
probes against the unchanged PWA:

P1 "17 * 23" -> 391 on-device. P4 "(12 + 30) / 7" -> 6 on-device.
P2 "17 x 23" -> refused. P3 "17 x(times-sym) 23" -> refused.
P7 "20% of 240" -> refused (no binary op in kept tokens).
P8 discount prose -> refused locally (no misroute risk; external handles).
P5 "What time is it in London?" -> answered DEVICE time (latent misroute
defect, confirmed live).
P6 "What is 2 + 2 in Nigerian history?" -> answered 4, ignoring context
(loose tokenizer confirmed; routing-error risk for S-C online).

MEASURED ARITHMETIC BOUNDARY (from lbArithPart/lbMathVal source):
whitespace-tokenized; tokens must match [0-9 + - * / ( ) . %] only;
expression < 40 chars; must contain a binary operator; strict eval; result
rounded 1e-6. Handles multi-digit, parens, chained ops. Does NOT handle
x / x-times-symbol / "of"-percent phrasing.

KEY CORRECTION TO S-A FINDING F2: the local brain CAN do 17 * 23 = 391.
The S-A failure was the operator character (x symbol), NOT a multi-digit
limit. The 17x23 refusal is an OPERATOR-VOCABULARY gap (separate defect
D-Arith), not an arithmetic-depth gap.

## 1. OBJECTIVE AND NON-GOALS

Objective: the online flow must use capabilities HARZ already controls
BEFORE invoking external inference, with honest disclosure, without
reducing correctness.

Non-goals (owner-mandated): NO local-brain expansion, NO new model, NO
architecture rewrite, NO operator-vocabulary fixes (x-symbol), NO gate or
corpus changes, NO server /chat byte changes.

## 2. ROUTING CONTRACT (candidate rules, frozen for validation)

Routing order in the online client flow:
R1 Builds: existing P0 dispatch, byte-unchanged (already sovereign).
R2 Local-first fast path (NEW, client-side only):
  R2a TIME/DATE: route local IFF the existing local time/date regexes
      match AND no place/zone reference is present. Guard: any match of
      /\b(in|at|of|for)\s+[A-Za-z]+/ in the same clause, or common
      city/zone vocabulary (london, lagos, abuja, tokyo, paris, new york,
      gmt, utc, wAT zone words...), disqualifies local routing -> server.
      (Fixes the P5 London defect class at the ROUTING layer; the local
      brain itself is untouched.)
  R2b ARITHMETIC: route local IFF, after stripping a FROZEN wrapper-word
      list (what is the answer to calculate work out compute solve can
      you please me for of and plus punctuation) and whitespace, ALL
      remaining tokens match the arithmetic charset, the joined
      expression is < 40 chars, contains a binary operator, and the
      STRICT evaluator (lbMathVal) returns a finite number. ANY leftover
      token -> server. (Blocks P6-context-class misroutes by
      construction.)
  R2c GREETINGS: bare greetings per the existing local regex route
      local, ONLY IF the message contains no second intent. The frozen
      battery judges greeting quality; if the local greeting is judged
      unacceptable, greetings stay external - evidence decides, not
      preference.
  R2d LOCAL FACTS: the existing LB_FACTS pack (Nigeria states/capitals,
      planets, continents, HARZ, water/photosynthesis/gravity) routes
      local; answers are verbatim pack text, deterministic.
R3 Everything else: existing server flow, byte-unchanged: clock branch ->
evidence gate (SE) -> external inference.

Disclosure law: every local answer rendered in the ONLINE flow carries a
new, distinct, honest label: "LOCAL - ON-DEVICE BRAIN (no external
inference)". The OFFLINE label is never reused online; external answers
are never labeled local; the evidence label is untouched.

Safety law: local fast-path failure (any runtime error or no confident
match) falls through to the normal server flow. Routing must never block
a response, and the failure is visible (answer arrives without the LOCAL
label, via the normal path).

Honesty law: if neither path can answer, the existing honest refusal
behavior is preserved and disclosed.

## 3. FROZEN S-C ACCEPTANCE BATTERY (24 cases, 5 owner-mandated groups)

Group 1 - already-passing local, must route local online (6):
SC1 "What time is it?" -> LOCAL, matches device clock (checked vs Date)
SC2 "What is the date today?" -> LOCAL, matches device date
SC3 "What is 17 * 23?" -> LOCAL 391
SC4 "What is (12 + 30) / 7?" -> LOCAL 6
SC5 "Sannu da zuwa" -> LOCAL greeting (quality judged in validation)
SC6 "What is 2 + 2?" -> LOCAL 4

Group 2 - currently-failing local, must STAY external in S-C (4):
SC7 "What is 17 x 23?" (letter x) -> EXT, correct answer 391
SC8 "What is 17 x(times-sym) 23?" -> EXT 391
SC9 "What is 20% of 240?" -> EXT 36
SC10 "If a shirt costs 2500 and there is a 20% discount, what is the
final price?" -> EXT 2000

Group 3 - must NOT be stolen by local routing (5):
SC11 "What is the UBA account number used for HARZ Pay bank transfers?"
-> SE evidence, receipt valid (P1 unchanged)
SC12 "What is the GDEG token price?" -> SE evidence
SC13 "What time is it in London?" -> EXT honest; NEVER device time
SC14 "Who is the president of France?" (online) -> EXT
SC15 "Me ya sa muke jin yunwa?" -> EXT Hausa reasoning

Group 4 - refusal integrity (4):
SC16 offline "Who is the CEO of HARZ?" -> LOCAL honest refusal (unchanged)
SC17 online "Who is the CEO of HARZ?" -> EXT honest hedge (G1 unchanged)
SC18 offline "Who is the president of France?" -> LOCAL honest refusal
SC19 offline "How many states does Nigeria have?" -> LOCAL fact 36+FCT

Group 5 - ambiguous, must not misroute (5):
SC20 "What is 2 + 2 in Nigerian history?" -> EXT (leftover tokens)
SC21 "Can you calculate 45 * 2 for me and explain why it works?" -> EXT
(explain clause)
SC22 "Build me a clock and tell me the time" -> build dispatched + time
answered locally; both disclosed; no silent drop (P0 law)
SC23 "What is the meaning of the number 391 in Hausa culture?" -> EXT
SC24 "Sannu, what is the UBA account number for HARZ Pay?" -> SE
evidence (greeting prefix must not hijack routing)

Frozen predictions (pre-run, on unchanged P4): SC1-SC6 all EXT today
(that is the S-A finding); SC11/SC12 SE; SC13-SC15, SC17, SC20, SC21,
SC23, SC24 EXT; SC16, SC18, SC19 LOCAL (offline); SC22 build LOCAL +
time EXT. The pre-run records actuals; the post-run (candidate) must
flip exactly Group 1 (and SC22's time half) to local while holding all
other expectations.

## 4. METRICS (owner's table, operationalized)

Sovereign coverage: rerun the S-A 48-case battery pre and post; count
NEWLY sovereign (EXT under P4 -> local under candidate) separately from
ALREADY sovereign. No overall-coverage claim until post-run delta is
demonstrated.
Answer correctness: independent recomputation (Python) for arithmetic;
device Date comparison for time/date; verbatim pack check for facts.
External-call reduction: measured in-browser via CDP network log - a
local answer must produce ZERO /chat POST requests. Measured, never
inferred.
Routing errors: battery cases whose actual path differs from frozen
expected path; target zero.
Refusal integrity: SC16-SC18 refusals remain explicit and disclosed.
Regression safety: full S-A battery + P0-P4 spot gates (MT build, EN/HA
language, offline pair, traps-no-evidence, receipts) + server /chat
handler region byte-identical pre/post.

## 5. DEFECTS RECORDED OUTSIDE S-C SCOPE (own ledger items)

D-Arith: operator vocabulary gap (x, x-symbol, "of"-percent) - 17x23
class. Own boundary investigation, NOT part of S-C.
D-Badge: UNSUPPORTED build message carries a green BUILT ON-DEVICE badge.
D-Bubble: single on-device builds do not render the user request bubble.
D-WeakCards: non-answering trusted-source evidence cards (semantic
relevance, open).
Plus the four standing open items (broader relevance eval, GDEG chain
info, price phrasing, OpenRouter 401).

## 6. IMPLEMENTATION GATE

Candidate implementation requires the owner's explicit GO after review
of this contract. On GO: smallest-change client-side routing addition
per R2a-R2d, server bytes frozen, pre-run recorded, deploy via
safe-deploy with rollback artifact, post-run + full regression, browser
verification with screenshots, separate release record.
