# G20 LINEAGE-ROLE BINDING AUDIT — TRACE (2026-10-03)

Contract: G20-ROLE-BINDING-V1-CONTRACT.md (frozen a1417a9 before any
build; anchor 28e929e). Success condition met: ambiguity characterized
exactly -> exploitability measured -> minimal lawful binding identified
-> NO formula changed.

## TOPOLOGY (built live, sealed as g20-role-audit/sealed-state.json)
A(500) + B(800) -> conflict {A,B} refused (record 1). A,B,C,D carried
to creation in evidence order [1,2,3,4], resolver C designated
(record 2). D = G20-FIX-D, a NEW additive decoy fixture (authoritative
audit note, also affirms 800 — a plausible alternative resolver; zero
receipt formulas touched; regression: the G19 chain still verifies
11/11 after the addition). True assignment verified by role-verifier.js
(12 checks: both seals, both acceptance laws, executor laws 9081/9085,
cross-record subset edge, request_id == artifact key prefix, artifact
via frozen readers). One build slip during the additive deploy (a lost
closing brace made esbuild fail silently into a stale bundle; caught by
the live run refusing fixture D, repaired, redeployed, re-run) —
disclosed, no test data affected.

## THE ANSWER (Dad's question, measured)
The sealed state does NOT commit to the topology. Two different valid
topologies produce byte-identical sealed roots:
  TRUE assignment:     resolver C(3), resolves [1,2,4]
  SECOND assignment:   resolver D(4), resolves [1,2,3] (consistently
    re-derived: resolution_from/sources -> [4], resolves_conflict
    re-derived as evidence-minus-resolver with correctly recomputed
    claims shas)
Both pass EVERY non-hash law (executor 9081 resolver-in-evidence, 9085
derived resolves, resolution_from==sources, cross-record subset edge)
and EVERY seal (byte-diff proof, gate 6): record 1 mission receipt
IDENTICAL, record 2 mission receipt IDENTICAL, compose receipt
IDENTICAL (same artifact key 5fd62ed4..., same artifact sha, same
prompt sha, same request_id). Only 19 fields differ: the role ref
integers and their per-reference derived pointers (answer_sha256 /
source_receipt pointing at the newly-referenced task — correctly
re-derived by construction). Content integrity != topology integrity:
proven.

## GATE 7 — does creation lineage disambiguate? NO.
The prompt seals the evidence SET and ORDER (which claims, which
order) via prompt sha -> request_id -> compose receipt -> chain. It
carries no role marker. Both assignments produce the same request_id
and the same artifact bytes; the artifact's iTXt metadata carries the
four claims byte-exactly and zero designation bytes. Creation lineage
cannot tell the receiving node which act resolved the conflict.

## GATE 8 — deletion/substitution matrix over every role reference
CAUGHT (8/10):
  conflict ref deleted (structural: conflict incomplete)
  conflict ref substituted [2]->[3] (structural: record 1's only
    other task is its own refused compose — nothing else to cite)
  resolver deleted (acceptance law)
  resolver flipped WITHOUT re-derivation (acceptance laws)
  sources diverged from designation (acceptance law)
  resolves ref substituted alone (executor law 9085: derived
    resolves must equal evidence minus resolver)
  evidence order swapped [..,3,4]->[..,4,3] (PROMPT SEAL: sha mismatch)
  evidence ref deleted (PROMPT SEAL: sha mismatch)
ESCAPED (2/10):
  conflict ref ORDER swap [2,1] — semantically empty (the conflict is
    a set; ordering is not truth-bearing; identical shas)
  THE resolver flip C->D with consistent re-derivation — the ambiguity.

## EXACT CHARACTERIZATION
Within this topology the ONLY truth-bearing role mutation that
escapes every seal and every law is the RESOLVER DESIGNATION among
evidence members. The evidence order is prompt-sealed; the conflict
set is structurally pinned; the resolver is law-constrained but
cryptographically unsealed. Exploitability: not origin corruption —
the origin serves the true refs (browser-verified live) — but
transport-level state substitution: an independent node receiving the
second assignment over the G18/G19 portability boundary reaches
VERIFIED believing a different act resolved the conflict. History
falsification with valid seals, at the exact boundary the last two
gates built. Deeper-topology note: with more verified tasks than
roles, the escapable surface grows accordingly (any evidence member
can be claimed the resolver).

## GATE 10 — THE MINIMAL LAWFUL BINDING (specified, NOT implemented)
Option A (frozen-formula extension, one line each):
  compose receipt input gains the designation bytes:
    current: sha256(JSON([{mode, request_id, artifact_sha256}]))
    bound:   sha256(JSON({children:[...same...], designation:
              {resolution_from, resolution_sources, resolves}}))
  record 1's refusal receipt text gains the conflict refs:
    'refused:' + text + '|conflict:' + JSON(conflict_refs)
  COST: frozen formula change — every historical compose/conflict
  receipt recomputation breaks unless versioned. Requires Dad's
  explicit ruling and a chain-version decision.
Option B (additive seal, zero frozen formulas touched):
  each record gains designation_receipt =
  sha256('designation:' + record.id + ':' + JSON(role_refs)), sealed
  BESIDE the mission receipt; the verifier's root of trust becomes the
  PAIR. All historical records remain valid (their designation
  receipts are recomputable from their own records); the resolver flip
  then breaks the designation receipt and REFUSES.
RECOMMENDATION (for ruling, not executed): Option B — smallest lawful
binding, no historical breakage. Gate 9 held: nothing was changed.

## GATE SUMMARY
G1 topology + inputs frozen before testing (a1417a9)
G2 true assignment established + live-verified (12 checks)
G3 receipt chains recomputed independently (both seals PASS)
G4 second assignment constructed (consistent re-derivation)
G5 BOTH assignments produce valid state (measured)
G6 ambiguity proven: byte-identical roots, 19 field diff (refs+derived only)
G7 creation lineage does NOT disambiguate (same request_id, same artifact)
G8 matrix: 8 caught (structural/laws/prompt-seal), 2 escaped (order
   swap = empty; resolver flip = THE ambiguity)
G9 no formula modified
G10 minimal binding specified exactly (Option A vs B, for Dad's ruling)
Determinism: both assignments verify byte-identically across runs.
Browser (standing order): the live record fetched — origin serves the
true assignment (resolver [3]); fixture D live with receipt 82d253c5...
