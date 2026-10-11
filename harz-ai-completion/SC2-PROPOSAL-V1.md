# S-C2 PROPOSAL — WIDENING THE LOCAL-FIRST ROUTER (DESIGN ONLY, NOT IMPLEMENTATION)

Owner requirement Oct 11: short proposal before any implementation.
No code changed by this document. S-C1 accepted state is production and
is not touched. S-B still blocked on CPU facts. Research 11 unopened.

## PRINCIPLE

S-C2 routes capabilities the local brain ALREADY POSSESSES (proven
offline) into the online flow, with guards. It does NOT expand the
brain: no new knowledge, no new operators, no new reasoning. Anything
requiring new brain code (symbol-form % and x operators) stays in its
own defect (D-Arith) and is NOT proposed here.

## 1. EXACT ADDITIONAL CAPABILITIES PROPOSED (4)

C1. Word-form arithmetic: "plus", "minus", "times", "multiplied by",
"divided by", "percent of". Existing offline normalization + strict
evaluator, already serving users offline. Example: "What is 12 plus
30" -> 42; "20 percent of 240" -> 48.
Boundary: single expression, <= 40 chars post-normalization, all
remaining tokens consumed by the wrapper strip + operator words;
any leftover word -> server. Symbol forms ("20% of", "17 x 23")
remain external (D-Arith, untouched).

C2. Numeric comparisons: "Is 5 greater than 3" -> TRUE; "Is 10 less
than 3" -> FALSE. Existing offline comparator.
Boundary: exactly one comparison of two numbers; any qualitative
comparison ("is HARZ greater than...") -> server.

C3. Recompute-and-verify: "verify 17 * 23" -> recomputed twice,
VERIFIED/MISMATCH disclosed. Existing offline verification path.
Boundary: "verify" + single valid expression only; "verify that the
clock works" -> server.

C4. Bare farewells + direct-form fact keys: "sai anjima"/"goodbye"/
"good night" (<= 4 tokens, no second intent); and the direct-answer
fact keys water/H2O, photosynthesis, gravity, sun, moon, earth -
ONLY in direct interrogative form ("what is water").
Boundary: the answerability guard below.

## 2. ANSWERABILITY GUARD (the SC16 lesson, made a rule)

Possession of related information is not possession of the answer.
The router may serve a fact key ONLY when the question's interrogative
form matches the fact's answerability: what-form facts answer
what-form questions only. "Who is the CEO of HARZ", "why is water
wet", "what is water made of", "tell me about water" all -> server.
Interrogative-form mismatch or trailing qualifiers -> server, always.
The 'harz', 'gdeg', 'uba', 'pay' keys stay EXCLUDED from online
routing entirely (evidence domain, first claim belongs to HARZ Search).

## 3. PROTECTION (owner requirement 4, unchanged from S-C1)

Build intent: lbBuildKinds guard retained and extended to the new
rules - any build verb or tool noun in the message means the router
stands down entirely (D-SC22's fix is NOT part of this proposal).
Evidence: ecosystem-noun questions and every SE-scored query path
untouched; UBA/GDEG battery cases must remain byte-stable.
Fail-open: any router error -> normal server flow.
Server /chat bytes: frozen, byte-verified pre/post.
Disclosure: every new local answer carries the S-C1 LOCAL label.

## 4. FROZEN TEST SET (draft, to be finalized before implementation)

Positive (10): 12 plus 30 / 100 divided by 4 / 5 times 6 / 20 percent
of 240 / is 5 greater than 3 / is 10 less than 3 / verify 17 * 23 /
sai anjima / what is water / what is photosynthesis.
Negative (8): 17 x 23 (symbol, D-Arith) / 20% of 240 (symbol) / shirt
prose with "20 percent discount" / who is the CEO of HARZ / what is
the UBA account number / what is the GDEG price / what is HARZ /
is HARZ greater than other ecosystems.
Ambiguous (7): "12 plus 30, and why is addition useful" / "verify
that the clock works" / "what is water made of" / "why is water
wet" / "tell me about water" / "is water good for farming" /
"good night, can you also build a clock".
Plus the S-C1 24-case battery rerun (must be 100% identical) and
the S-A regression (P0-P4 gates).

## 5. MEASUREMENT PLAN (owner requirement 5)

Denominators and scoring rules unchanged. Baseline = accepted S-C1
state (64.5% substantive, 62.5% operational). Newly sovereign is
counted ONLY when: LOCAL label + zero /chat POST (CDP-measured) +
independently recomputed correct.
IMPORTANT HONESTY NOTE: none of the proposed capabilities appear in
the S-A frozen battery in routed form (S-A's arithmetic cases are
symbol-form, which stay external per D-Arith). Expected S-A battery
delta: ZERO flips. The S-C2 gains will therefore show in the S-C2
battery and zero-POST measurements, not in the S-A percentage. We
will NOT claim coverage-percentage improvement from S-C2 unless a
post-run actually flips a battery case - and any flip will be listed
individually with justification.

## 6. IMPLEMENTATION GATE

Requires owner GO on this proposal. On GO: finalize test set, freeze
predictions, pre-run on deployed S-C1, implement client-side routing
only, deploy, post-run, full S-C1 + S-A + P0-P4 regression, browser
verification, separate release record.
