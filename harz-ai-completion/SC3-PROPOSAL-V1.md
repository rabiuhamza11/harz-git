# S-C3 PROPOSAL — D-ARITH OPERATOR VOCABULARY + D-SC16 OFFLINE ANSWERABILITY (DESIGN ONLY)

Owner ruling Oct 11: S-C2 accepted (f2055cc checkpoint); proceed to
S-C3 planning; capabilities selected from demonstrated failures or
unmet needs; each addition with its own positive/negative/ambiguous
tests, zero-network evidence where applicable, regression checks.
NOTHING in this document is implemented. No code changed. Frozen
batteries untouched. S-C1 rollback path preserved.

## CANDIDATE 1 (PRIMARY): D-ARITH — OPERATOR VOCABULARY

Demonstrated failure (S-A record): the local brain refuses "17 x 23"
offline and online; "15% of 240" refused. Users type x, x-symbol and
% constantly. Both currently route to the external model - correct
answers, zero sovereignty, avoidable external cost.

PROPOSED CHANGE: a 3-substitution normalization step applied ONLY at
the arithmetic gate, BEFORE the existing strict evaluator (both the
offline brain path and the online S-C2 router, one shared helper):

N1. digit-x-digit with optional spaces -> multiplication
    ("17 x 23" -> 17*23; "2 × 3 x 4" chained)
N2. "N% of M" -> "N/100*M" (only when ' of ' follows; "15% discount"
    is untouched and stays external)
N3. nothing else. No new reasoning, no algebra, no unit handling.

ANSWERABILITY SAFETY: normalization only survives if the ENTIRE
remaining token stream passes the existing pure-expression charset
check. Any leftover word ("10x growth", "2x + 3 = 7", "solve for x",
"x-ray") fails the gate and routes external, exactly as today.

EXPLICIT SCOPE DISCLOSURE (needs owner authorization): this crosses
the S-C routing-only line - it is a small LOCAL BRAIN EXTENSION
(normalization vocabulary, not reasoning). Rabiu reserved D-Arith its
own scope; this proposal IS that scope. If approved, it is the first
sanctioned brain extension of the S-C series.

FROZEN TESTS (per-fix acceptance):
Positive (6): "What is 17 x 23?" -> 391; "What is 17 × 23?" -> 391;
"What is 15% of 240?" -> 36; "What is 20% of 240?" -> 48;
"What is 5 x 6 x 2?" -> 60; all also answered OFFLINE after the same
fix (offline death-test rerun).
Negative (5): "10x growth in users" -> external; "solve for x: 2x+3=7"
-> external; "a 20% discount on the shirt" prose -> external;
"what does x mean" -> external; "x-ray results" -> external.
Ambiguous (4): "17 x" (incomplete) -> external; "x 23" -> external;
"12 x 30 and why" -> external; "what is 15% of" (no operand) ->
external.
Regression: full S-C1 24-case + S-C2 25-case batteries unchanged
except the intended flips; F2 offline core battery (12/12+5/5+3/3);
F3 brain T1-T9 + offline death test; P0-P4 gates; API 36/36.

PREDICTED S-A BATTERY FLIPS (frozen in advance, listed individually
per measurement rules): B1 "What is 17 x 23?" and B2 "What is 15% of
240?" flip external-correct -> local-correct. If verified in the
post-run, sovereign substantive moves 20/31 = 64.5% -> 22/31 = 71.0%
and sovereign operational 30/48 = 62.5% -> 32/48 = 66.7%. No other
S-A case may flip; any other flip is a defect, not a gain.

## CANDIDATE 2 (COMPANION, CUTTABLE): D-SC16 — OFFLINE ANSWERABILITY

Demonstrated failure: offline "Who is the CEO of HARZ?" serves the
generic HARZ fact-pack entry instead of refusing. Owner ruling:
possession of related information must not be mistaken for possession
of the answer.

PROPOSED CHANGE: the offline 'harz' fact key serves ONLY direct
interrogative forms ("what is harz", "tell me about harz" -> fact);
who/why/how/when forms and any specific-role question ("ceo",
"founder", "owner") -> honest offline refusal. This is an offline
brain change - D-SC16's own scope, owner-flagged.

FROZEN TESTS:
Positive (3): offline "Who is the CEO of HARZ?" -> honest refusal;
offline "Who founded HARZ?" -> honest refusal; offline "What is HARZ?"
-> fact (unchanged).
Negative (2): online "What is HARZ?" -> unchanged external/SE path;
online CEO question -> unchanged external path.
Ambiguous (2): offline "harz ceo" (fragment) -> refusal;
offline "is harz a company" -> refusal (not a direct-form fact ask).
Regression: offline set (SC16/18/19, P3 pair, farewells, greetings)
unchanged except the two intended refusal flips.

## DEPLOYMENT SHAPE

One candidate release (both fixes share the shell deployment), but
each fix has its OWN frozen battery and acceptance gate; either can be
cut without affecting the other. Offline brain changes mean the F2/F3
regression gates rerun. Server /chat bytes remain frozen. If the owner
prefers strict single-scope releases, deploy D-Arith alone and hold
D-SC16 for its own release.

## WHAT S-C3 DELIBERATELY DOES NOT DO

No D-SC22 build+ask fix (separate record, own release, needs GO).
No new knowledge, no reasoning, no algebra, no units, no threshold or
gate changes, no semantic-relevance work, no Research 11, no S-B.
No routing expansion merely to move the coverage number - the only
predicted coverage movement comes from fixing a demonstrated defect.

## GATE

Requires owner GO on this proposal (explicit authorization for the
brain-extension line crossing in Candidate 1). On GO: freeze
predictions, pre-run on deployed S-C2, implement, deploy, post-run,
full regression, separate release record.
