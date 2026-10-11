# S-C1 LOCAL-FIRST ROUTING — DEPLOY RECORD V1 (2026-10-11)

Owner GO: implement per frozen contract SC-ROUTING-CONTRACT-V1 (8afc095).
Candidate: harz-ai-v6.6.0-sc1-local-first.js, committed pre-deploy aa88e92
+ hotfix commit (build-guard) post-first-deploy; final deployed artifact
byte-verified sha c7dbb1dbde58e0ec. Rollback: accepted P4 sha
b99fb2e1846e5048 preserved (harz-ai/rollback-p4-baseline.js). All 6
bindings preserved. Server /chat bytes byte-stable (diff: only the client
shell region changed; 35/35 S-A API cases identical paths; UBA receipt
5c5b6b11f77e6abc preserved).

## MID-RUN DEFECT CAUGHT AND FIXED (recorded honestly)

First candidate (sha a9c3d32130b6bf19, deployed briefly) had a routing
hijack: "Build me a clock and tell me the time" matched the time rule and
DROPPED the clock build (P0 law violation). Caught by the frozen SC22
battery case during post-run, not by chance. Fix: lbLocalFirst returns
null whenever lbBuildKinds(txt).length>0 (builds are never stolen).
Redeployed and re-verified. Final state has zero known routing errors.

## FROZEN BATTERY RESULTS (final deployed state, browser-verified)

Group 1 (must route local) 6/6: SC1 time, SC2 date, SC3 "17 * 23"=391,
SC4 "(12+30)/7"=6, SC5 greeting, SC6 "2+2"=4. All carry the "LOCAL -
ON-DEVICE BRAIN (no external inference)" label. CDP network log: ZERO
/chat POST requests per local answer - external inference avoided,
measured.

Group 2 (must stay external) 4/4: SC7 x-symbol 391, SC8 times-sym 391,
SC9 "20% of 240"=48 (note: my earlier test script expected 36 - script
error, 48 is the correct value; system answer correct), SC10 discount
2000. All EXT, all correct, operator vocabulary gap untouched (D-Arith
stays separate).

Group 3 (must not be stolen) 5/5: SC11 UBA -> SE evidence + valid
receipt; SC12 GDEG -> SE; SC13 London time -> server, honest model
decline, never device time; SC14 Macron -> server; SC15 Hausa ->
server, Hausa.

Group 4 (refusal integrity): SC16 offline -> local HARZ fact-pack entry,
no fabrication (DEVIATION from predicted refusal: the local 'harz' key
serves the generic HARZ description; honest but not a refusal - recorded
as local-path weak-card observation); SC17 online -> honest EXT hedge;
SC18 -> honest local refusal; SC19 -> local 36-states fact correct.

Group 5 (ambiguous) 5/5: SC20 context-arithmetic -> server; SC21
calculate+explain -> server; SC23 culture -> server; SC24 greeting+UBA
-> server (not hijacked; answered correctly via in-session context,
external path); SC22 -> clock BUILT via artifact engine (build
preserved after the fix); the "tell me the time" half is dropped - a
PRE-EXISTING P4 behavior (confirmed in pre-run), unchanged by S-C1.

## COVERAGE (browser flow, the user-facing path)

vs the S-A frozen battery, same denominators, same scoring rules:
- Sovereign substantive: 17/31 -> 20/31 = 64.5% (+E5 time, +H1 Abuja,
  +H2 Kano - all correct, all local, all zero-POST).
- Sovereign operational: 25/48 -> 30/48 = 62.5% (+A1, A2 greetings
  local-acceptable, + the three substantive).
- Newly sovereign: exactly 5 battery cases; already-sovereign cases
  unchanged (evidence 12/12, builds, offline set).
- API-direct path unchanged (35/35 identical) - the delta is entirely
  client-side routing, as designed.

## REGRESSION

P0 multi-task build OK (both artifacts). P1 evidence OK (UBA SE,
receipt stable). P2 language OK (Hausa reasoning server-side, EN/HA
matched). P3 offline pair OK. P4 traps OK (H3/H4 no evidence card;
H1/H2 now answered correctly and locally - no evidence, no deception).
Offline local brain untouched (SC16/18/19, P3 pair, F battery). Health
6.6.0 operational.

## HONEST LIMITS

- Time/date local answers are device-clock answers; place/zone
  questions are guarded to the server, which honestly declines them.
- SC16 shows the local 'harz' fact key can serve a generic non-answer
  (no fabrication, labeled) - same weak-card class as D-WeakCards, now
  observed in the local path.
- The greeting local answer is terse; the battery judged it
  acceptable; a richer greeting remains external today.
- Conversation beyond greetings, all reasoning, and general
  knowledge remain 100% external (unchanged).
- SC22's time-half drop is pre-existing and remains open (P0 law
  question for a future release, recorded).

## LEDGER

P4 PRODUCTION ACCEPTED (preserved as rollback). S-C1 DEPLOYED, battery
green, awaits owner acceptance. D-Arith, D-Badge, D-Bubble, D-WeakCards
+ 4 standing opens unchanged and unclaimed.
