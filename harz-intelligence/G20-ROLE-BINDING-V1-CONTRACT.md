# G20 LINEAGE-ROLE BINDING AUDIT — CONTRACT (ROLE-BINDING-V1)

Frozen: 2026-10-03, BEFORE any build or probe. Anchor: 28e929e (G19
closed). Dad's question, verbatim: are semantic roles in the evidence
graph cryptographically bound to the records they describe, or can two
different valid topologies produce the same sealed roots?

## THE RICHER TOPOLOGY (frozen before testing)
Fixtures: A = G15-FIX-A (price 500), B = G15-FIX-B (price 800),
C = G16-FIX-C (registry: authoritative 800), D = G20-FIX-D (NEW,
additive: registry audit note — "the price record is correct and
stable at 800 HARZ"). D is a verified, authoritative-toned DECOY:
plausible alternative resolver to C. Adding D to the frozen fixture
table is an ADDITIVE test-data change: zero receipt formulas touched,
zero existing fixtures/records altered (same class as G18's fixture_id
disclosure; disclosed here per Dad's change-audit law).

RECORD 1 (conflict mission): tasks A, B + compose, evidence_from
[1,2], NO resolution -> refused, conflict object cites {A,B}
(the established G15 shape).
RECORD 2 (resolution mission): tasks A, B, C, D + compose,
evidence_from [1,2,3,4], resolution_from [3], same instruction.
Intended assignment: conflict {A,B}, resolver C, D carried as
unresolved material (resolves_conflict = evidence minus resolver =
{A,B,D} — derived law, executor line 9085).

## THE HYPOTHESIS (stated before measurement)
Role references never enter any hash formula. Predicted ambiguity:
flipping the designation C -> D (with resolves_conflict consistently
re-derived to {A,B,C}) satisfies EVERY runtime and verifier law —
resolution_from ⊆ evidence_from (executor 9081), resolution_from ==
resolution_sources, resolver outside the record-1 conflict, conflict
shas ⊆ resolves shas cross-record — while EVERY sealed value stays
byte-identical: both mission receipts, the compose receipt, the
prompt sha, the request_id, the artifact. If measurement confirms, the
sealed state does NOT commit to the topology: content integrity ≠
topology integrity.

## GATES (Dad's 10, mapped)
G1 freeze topology + canonical inputs (this file + commit) BEFORE testing
G2 intended role assignment established (above), live missions run,
   records fetched, receipts recomputed by the role-aware verifier
G3 current receipt chain recomputed independently on the TRUE assignment
G4 second assignment constructed: resolver D, resolves {A,B,C}
   re-derived; every non-hash law checked, none may be violated
G5 both assignments produce valid state? (verdict from measurement)
G6 if yes: ambiguity PROVEN by identical sealed roots — byte-diff of
   the two exports must show ONLY role refs + derived shas differing,
   with every hash value identical
G7 artifact/request lineage disambiguation test: the prompt seals the
   evidence ORDER (which claims, which order) but carries no role
   marker; prove both assignments produce the same request_id/artifact
G8 deletion/substitution matrix over every role reference: conflict
   refs, resolver refs, evidence-order refs (the sealed one), each
   deleted and substituted; record caught-vs-escaped per ref
G9 NO receipt formula modified (gate 9 of the audit)
G10 the minimal lawful binding specified EXACTLY (which formula, which
   bytes) — a contract decision for Dad, not implemented

## SUCCESS CONDITION (Dad's law)
ambiguity characterized exactly -> exploitability measured -> minimal
lawful binding identified -> no formula changed without explicit
ruling. This is a measurement audit, not a hardening pass.

## TOOLS
Role-aware verifier (role-verifier.js, g20 dir): generalizes the G19
min-verifier — evidence length free, resolves_conflict re-derived as
evidence-minus-resolver, cross-record edge as conflict-shas ⊆
resolves-shas, executor law resolution_from ⊆ evidence_from encoded,
plus the two G19 acceptance laws. All refusals are honest failures;
no repair path; zero env reads.
