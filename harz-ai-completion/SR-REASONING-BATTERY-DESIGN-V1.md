# S-R REASONING BATTERY V1 — DESIGN ONLY (GAP 1, authorized by owner ruling 2026-10-11)

Owner rulings this design implements:
1. Knowledge Core 5K ACCEPTED (seal 0a5c75d4) — closed, no rework.
2. 20K: D1+FTS5 strategy accepted, expansion still BLOCKED; R2 unchanged
   (unmeasured until enabled or explicitly waived).
3. GAP 1: DESIGN AUTHORIZED ONLY. No execution, implementation, deployment,
   or promotion. The run requires an explicit owner authorization.
4. GAP 2: implementation on HOLD (classification design is a later scope).
5. GAP 3: E1 PWA integration stays DEFERRED.
6. GAP 4: human acceptance remains OPEN until the human checks are done
   and recorded; machine PASS never substitutes.

## What this battery measures

Independent (sovereign) reasoning on UNFAMILIAR problem combinations.
By construction it EXCLUDES the already-accepted capability domains:
arithmetic normalization (lbArithNorm patterns), direct-form fact keys
(S-C2), and deterministic procedures (clock, calculator, notes,
greetings). Every prompt was written to be non-intersecting with those
patterns, and uses fictional entities so no corpus document can contain
the answer. Novelty audit per case: harz-search FTS lookup must not
return an answering document (checked at freeze; breach = void, never
silent substitution).

## Frozen set

25 cases, 5 dimensions (5 each): compositional multi-step (R01-R05),
constraint and ordering logic (R06-R10), counterfactual and
false-premise reasoning (R11-R15), word problems beyond normalization
patterns including plan generation (R16-R20), abduction and
best-explanation reasoning (R21-R25).

Exact prompts, expected answers, valid reasoning chains, acceptable
answer envelopes, per-case predictions and bleed watches: frozen in
SR-BATTERY-FROZEN-V1.json, seal 21b08759d52ffd70.

## Predeclared scoring (per case)

C correctness 0/1 — inside predeclared envelope.
V reasoning validity 0-2 — chain valid/implicit/lucky-guess.
E evidence use 0-2 — grounded in premises or honestly labeled.
U uncertainty handling 0-2 — correct confidence OR correct refusal.
T task completion 0/1 for plan cases (R18, R19).

PRIMARY METRIC — sovereign reasoning score: cases attributed LOCAL
(providers_called empty, zero external calls, verified offline) with
C=1 AND V>=1, over 25. Secondary: external-assisted correct; honest
refusal quality on R14; arithmetic-bleed count; E distribution.

## Attribution

Both arms per case. ONLINE: production flow as deployed, providers
receipts captured. OFFLINE: network-death verified (TCP/DNS probes),
local brain only. Attribution derived from receipts, never
self-declared. Run only under the existing accepted deployment; no
config changes for the run.

## Failure, inconclusive, success

Successful run: all 25 x 2 arms with full receipts, frozen hashes
match, no provider outage. Failed case: no attribution or lost output.
Inconclusive: >3 failed cases; rerun only with re-freeze + disclosure.

## Kill conditions

1. Any rubric, prompt, or threshold change after freeze.
2. Provider outage/401 mid-run: abort, no partial claims.
3. Corpus answer found for any case: void + disclose, no substitution.
4. Any relabeling of external answers as sovereign.
5. Any success redefinition after seeing results. No exceptions.

## Prediction record (stated before any run)

Sovereign reasoning score: 0/25 = 0.0% predicted.
Basis: S-A measured reasoning 6/6 correct but 100% external; the
local brain is a deterministic rule set with no compositional engine;
D-Arith's accepted 71.0% covers arithmetic and facts, none of these 25
patterns.
Offline arm: 20-25 honest refusals predicted; C=0 throughout.
Online arm: 19-23/25 externally correct predicted.
Predicted failure modes: R14 answered instead of premise-challenged;
arithmetic-router bleed watch on R02/R05/R16/R20 (predicted NO
hijack); R18 answered from a memorized famous variant; envelope
over-narrowing at grade time (kill condition 5 guards this).
Honest intent: this battery is expected to CONFIRM the reasoning gap.
A low sovereign score is a finding, not a battery failure.

## Comparison against existing baselines

S-A denominators (31 substantive / 48 operational) and D-Arith
results (22/31 = 71.0% substantive, 32/48 = 66.7% operational) are
frozen, untouched, and never merged with S-R. S-R is reported as its
own battery over its own denominator (25). The report will present the
three side by side, with the explicit statement that S-R measures
general compositional reasoning while the baselines measure
evidence/arithmetic/fact capability. No battery weakening, no
denominator reuse, no percentage inflation.

## Status

DESIGN ONLY. Frozen for review. The battery does not run until the
owner explicitly authorizes the run.
