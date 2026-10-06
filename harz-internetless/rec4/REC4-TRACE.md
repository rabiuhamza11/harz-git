# REC4 — DUPLICATE-CONTENT CONVERGENCE SEMANTICS ATTACK TRACE (Hauwa, Oct 6, 2026, Dad's "Build" order)

Surface attacked: the operational duplicate — a fresh-nonce resend of identical content
stores as a second record (disclosed since REC1 R3, re-measured in REC2 SCN2 and REC3 R3-7).
The question Dad sent the attack to answer: does content-identity need its own law, or does
the mesh stay set-semantic and honest?

Target: the FROZEN v0.3 RECOVERY-LAW primitive (98dcdd624a4901b4... — hash-gated at start
and end; the recovery law worked exactly as frozen throughout, nothing re-fixed). The frozen
v0.2 historical primitive also hash-gated. Independent standing verifier; disk is truth;
hardened harness (orphan sweep, port gates, PID-at-spawn kills).

## VERDICT

17/17 PASS, two consecutive clean runs (rec4-run-01.log first-run clean, rec4-run-02.log
confirmation — 18 grep-counted verdict lines). First battery in this workstream to pass
clean on run one: the harness lessons from REC1-REC3 (propagation bookkeeping, per-copy
first-match disk helpers, actuals printed before asserts) did their work.

## WHAT THE ATTACK MEASURED

D1 BASELINE: two fresh-nonce copies of one fact, same sender: both stored — two distinct
signed records of the same content — and they propagate and converge as records (sets
byte-identical on both nodes).

D2 STORM: five more copies from a DIFFERENT sender on the OTHER node: all stored, zero
refusals, cross-sender cross-node duplicates coexist and converge identically.

D3 THE DEATH TEST: 7 copies of BALANCE=ALPHA and 1 copy of BALANCE=BETA on the same store:
both digests identical on both nodes, both claims present, and ZERO voting vocabulary
anywhere — no majority, no consensus, no winner, no ranking. Duplication creates NO
authority gradient. A fact repeated seven times is seven signed statements, not seven votes.
The set stays honest; the mesh refuses to become an electorate.

D4 RECOVERY INTERPLAY: one copy lost while six same-content siblings remain: the EXACT lost
record healed by its own nonce — record-identity recovery is not confused by same-content
siblings (and equally: the six remaining copies did not "fill" the seventh's identity).

D5 CORRUPT-ONE-OF-SEVEN: one copy disk-tampered — [CORRUPT] disclosed and excluded; the
frozen recovery law healed exactly that record by identity, evidence preserved per the
freeze. The content itself was never at risk (six other honest copies kept proving it).

D6 THIRD-PARTY CONVERGENCE: a fresh node received all 14 records including the 7 duplicates
in one forward round, digests identical — duplicate propagation is deterministic.

D7 STORAGE FLOOD (the availability surface, disclosed not fixed): twenty more fresh-nonce
copies — ALL accepted, zero refusals, converged, durable across kill/restart. Nonce-identity
has no content-level quota: an attacker who can reach a node's port can add unbounded valid
records. SAFETY INTACT throughout (every copy is honestly what it claims to be — a distinct
signed statement); the wound is availability/storage, not authority. This is the same
class as any append-only ledger's spam surface.

## FINDINGS FOR DAD'S RULING (no remedy built; v0.3 untouched)

F-REC4-1 (measured, not a defect — a semantics fact): the mesh is strictly set-semantic.
Content duplication is invisible to every authority mechanism: no voting, no ranking, no
resolution. The honest display of "the same fact stated N times" is N records. This is the
cost and the strength of identity = (nonce, valid signature).

F-REC4-2 (measured, availability surface): no content-level quota exists. Remote storage
exhaustion is possible by design; refusing duplicates would require a content-level law
the primitive deliberately does not have. Remedy directions IF ruled (not built):
(a) disclosure-only content-hash index (display layer says "content X appears N times",
    zero authority change), (b) sender-side content-dedup duty (senders SHOULD not resend
    identical content under fresh nonces — a protocol etiquette, not a mesh law),
(c) receive-side quota/rate policy (a sovereignty question: who sets the quota? the node
    owner, per node — never the mesh).

The candidate law wording, unfrozen, for the ruling:
"A duplicate is not a vote. Content repetition carries no authority. Identity remains
 (nonce, valid signature); content-level facts, if ever displayed, are disclosure, never
 selection."

## SCOPE (honest)

Workbench proof against the frozen v0.3 primitive. No remedy built; v0.3 untouched; v0.2
untouched. The two-phone field gate remains pending and unaffected in safety. Duplicates on
a phone cost storage, never truth.
