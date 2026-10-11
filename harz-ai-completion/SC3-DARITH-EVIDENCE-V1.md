# S-C3 D-ARITH — BUILD + VALIDATION EVIDENCE (NO DEPLOYMENT, 2026-10-11)

Owner ruling: GO for D-Arith ONLY. NO-GO: deployment, D-SC16, all
out-of-scope changes. NOTHING was deployed. Production remains the
accepted S-C2 artifact (byte-verified unchanged this session).

## CANDIDATE

harz-ai-v6.6.0-sc3-darith.js = S-C2 source + 4 edits:
1. lbArithNorm helper: (digit)[x/](lookahead digit) -> multiplication
   [lookahead form so chains work: 5 x 6 x 2 -> 5*6*2]; N% of M ->
   N/100* M (only with ' of ' after the percent).
2. Online R2b gate tokenizes the normalized text.
3. Online word-form chain normalizes before word-operators.
4. Offline brain mtxt chain normalizes first (shared logic, one
   helper, both surfaces).
D-SC16 was STRIPPED from the candidate per the deferral ruling:
the offline 'harz' fact map is untouched, no CEO-related answers
introduced, verified by grep (no gate present) and by the live
offline probe (CEO question still serves the generic fact, i.e.
D-SC16 behavior bit-identical to S-C2).

## MID-VALIDATION DEFECTS CAUGHT (never shipped, none reached
production since no deploy occurred)

D1: chained x-substitution consumed the shared middle digit
   ('5 x 6 x 2' -> '5*6 x 2' -> null). Fixed with a lookahead
   regex in the unit phase.
D2+D3: browser-injection infrastructure errors (doubled escaping;
   function-scoped eval hid the overrides). Fixed; they only
   affected the validation rig, never the candidate or production.

## EVIDENCE (pre-deploy, candidate validated WITHOUT deployment:
unit harness + CDP injection of the exact candidate functions into
the live deployed S-C2 browser shell)

1. FROZEN 15 D-ARITH TESTS: unit 15/15 AND browser-injected 15/15.
   Positives (6) LOCAL at ZERO /chat POSTs with correct values:
   17 x 23=391, 17 x 23 (x-symbol)=391, 15% of 240=36, 20% of
   240=48, 5 x 6 x 2=60, 10 % of 50=5. Negatives (5) external:
   10x growth, solve for x, shirt prose, what does x mean,
   x-ray. Ambiguous (4) external: "17 x", "x 23", "12 x 30 and
   why", "what is 15% of" (incomplete expression safely external
   because the strict evaluator returns null).
   NOTE (pre-run finding): "10 % of 50" was ALREADY sovereign in
   S-C2 (spaced percent matched the word-form rule). Net-new
   sovereign positive forms: 5 of 6.
2. OFFLINE (candidate localBrain injected, CDP offline emulation):
   17 x 23=391, 15% of 240=36, 5 x 6 x 2=60 all answered with the
   OFFLINE label; regressions green: honest refusal (France),
   36-states, 4+6=10, 12 plus 30=42, greeting, farewell, and
   D-SC16 behavior UNCHANGED per deferral.
3. S-C1/S-C2 REGRESSION SET: 9/9 in the injected browser run
   (time, 17*23, word-form, comparison, water fact, London time
   -> server, CEO -> server, build+farewell -> build dispatch,
   2+2 in Nigerian history -> server).
4. P0 MULTI-TASK: both tasks disclosed and executed with the
   candidate live (clock built w/ receipt, calculator BUILT
   ON-DEVICE).
5. API REGRESSION: 36/36 identical (server bytes untouched by
   construction; UBA receipt preserved).
6. PREDICTED FLIPS — VERIFIED EXACTLY 2, NO OTHERS:
   B1 "What is 17 x 23?" external -> LOCAL 391 (posts=0).
   B2 "What is 15% of 240?" external -> LOCAL 36 (posts=0).
   No other battery case flipped in any regression run.
   With owner release: sovereign substantive 20/31 (64.5%) ->
   22/31 (71.0%); operational 30/48 (62.5%) -> 32/48 (66.7%).

## STATUS

Built and validated per gates 1-5. AWAITING OWNER RELEASE RULING
for deployment (gate 6). S-C2 remains live production. Rollback
artifacts untouched. No D-SC22, no threshold or semantic changes,
no Research 11, no S-B.
