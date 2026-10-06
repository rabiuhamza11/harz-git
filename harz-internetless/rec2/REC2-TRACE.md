# REC2 — RECOVERY SEMANTICS ATTACK TRACE (Hauwa, Oct 6, 2026, Dad's F-REC1 re-attack order)

Order honored verbatim: no fix built first; F-REC1 attacked from all angles; the invariant
wording deliberately NOT frozen as law — the attack was allowed to define the correct
recovery semantics.

Target: the FROZEN v0.2 primitive, UNMODIFIED (sha256 d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61,
verified at start and end of every run). Independent standing verifier (../rec1/rec1-verify.js)
re-verifies every record from raw disk bytes on every measurement; disk is truth; harness
hardened per REC1 lessons (orphan sweep, port gates, PID-at-spawn kills).

## VERDICT

34/34 PASS, two consecutive clean runs (rec2-run-03.log, rec2-run-04.log). Runs 01-02 logged
unsmoothed: run-01 caught my own ledger errors AND exposed the third finding (below); run-02
isolated the mechanism; a crashed patch script (escaping bug) and a mis-ordered reboot were
caught before any claim.

## THE THREE MEASURED RECOVERY SEMANTICS FINDINGS

F-REC1 (confirmed exactly as before): a node that loses a stored record from disk while its
process runs masks the peer's valid re-delivery (boot-seeded in-memory dedup set), and the loss
HEALS across a restart, which re-seeds the dedup set from disk. SCENARIO: single loss + 3
forward replays + direct re-POST — all masked mid-run; restart -> healed, digest-identical.
Multi-loss (3 records): same, all three healed in one round. Earliest-record loss: same (the
envelope layer has no cross-record dependency; digest equality proves record-IDENTITY-exact
restoration). Loss from a REORDERED store: same — verification is set-semantic and order-blind.

F-REC1-2 (corrupt-present): a record tampered ON DISK (parseable, signature now stale) is
exposed [CORRUPT] on every read and never forwarded — but it is never quarantined, so it
re-seeds the dedup set at EVERY boot. The peer's valid original is masked FOREVER. Restart
does not heal this class. The sets honestly diverge; nothing is smoothed.

F-REC1-3 (NEW, found by this battery — remotely triggerable): a tampered envelope that a node
honestly stores as UNVERIFIED EVIDENCE carries the victim's ORIGINAL NONCE. At the next boot,
the dedup re-seed reads ALL disk lines regardless of validity, so the evidence line poisons
the dedup set and the VALID ORIGINAL is masked forever. Isolated in SCN6b: tamper-first (post
a tampered copy of a record the node has lost / not yet re-received), reboot, and the peer's
valid delivery can never enter. Mid-run the node still survives tamper-first (the receive path
does not add unverified nonces to the in-memory set — the poison activates at boot). SAFETY
HELD in every phase: nothing invalid was ever verified, nothing fabricated, no authority
impact. LIVENESS: an attacker who can reach a node's port can permanently block any record's
future receipt by pre-sending a tampered copy that shares its nonce.

THE ROOT, COMMON TO ALL THREE: the dedup set is seeded from ALL stored lines (valid or not)
instead of from records that re-verify NOW, and the receive path consults memory, never disk.

## THE HEALING BOUNDARY (the sharpest measured contrast)

Torn-class loss (unparseable line) is the ONE loss class that heals: readAndQuarantine MOVES
the torn line out of the main file (atomic rewrite), so the next boot's dedup re-seed EXCLUDES
its nonce and the peer's valid re-delivery is accepted. Quarantine is the boundary between
healing and permanent masking: plain loss heals (absent at boot -> not seeded); torn heals
(quarantined away -> not seeded); corrupt-present and poison-evidence never heal (present,
parseable, re-seeded forever).

## SLOT INTEGRITY (attack 10 — fully held)

A tampered copy of a missing record can NEVER become valid by filling the slot: stored as
evidence only, [UNVERIFIED]/[CORRUPT] on read, refused identically after restart, never
forwarded, excluded from every verified set and digest. An unrelated VALID record does not
fill the slot either — records are identity, not slots (the set stays honestly divergent
until the valid original arrives). No-restart reconciliation paths exhausted: forward,
direct re-POST, prove-offline — none deliver a lost record while the process runs; a
fresh-nonce resend re-enters the CONTENT but not the record identity. Seal-chain loss:
BROKEN at the exact slot, fail-closed, no transport path by design (sovereign-local).

## THE MEASURED CLASSIFICATION MATRIX (attack 11)

1. already possessed (verified, memory+disk): duplicate, skipped exactly-once
2. previously possessed, now plain-lost: masked mid-run, heals across restart
3. previously possessed, content-level: content re-enters via fresh nonce, identity does not
4. corrupt-present on disk: PERMANENT masking (F-REC1-2)
5. unverified evidence carrying a valid record's nonce: POISON, permanent masking (F-REC1-3)
6. torn-present on disk: quarantined, disclosed, heals from peer across restart
7. never possessed: accepted + verified + fsynced before ACK (survives tamper-first mid-run)
8. invalid: evidence-only forever, never verified, never legitimized by restart
9. stale but valid: accepted as history, node is authority-blind, no currency claim
10. seal lost mid-chain: BROKEN at exact slot, fail-closed, no mesh path by design

## WHAT THE ATTACK SAYS THE CORRECT RECOVERY SEMANTICS ARE (for Dad's ruling — NOT frozen)

The candidate invariant held in spirit and failed in v0.2 fact: a node's memory of having seen
evidence DOES outrank the evidence on disk, permanently, in two classes (F-REC1-2/3). The
measured semantics suggest a remedy must:
1. seed and consult dedup ONLY from records that re-verify NOW (disk truth: signature-valid),
   never from all stored lines;
2. key dedup by (nonce, signature-valid) — not nonce alone — so unverified evidence keeps its
   evidence role without blocking the valid original;
3. decide what happens when a valid record arrives whose nonce already exists on disk in
   corrupt form (replace? co-exist? disclose?) — an explicit semantics choice, not an accident.
No patch was made; v0.2 stays frozen pending the ruling. The field gate is unaffected in safety
(no false verification under any scenario) and affected in liveness (a reboot after receiving a
tampered copy can permanently block that record on a phone until manual disk surgery).

## BROWSER/LIVE LEG

Same as REC1: the live leg on the workbench is the real wire (real ports, real kill -9,
socket-verified, refusals captured); a cloud browser cannot reach a sandbox-localhost node —
by design. The phone field gate remains the browser leg, unchanged and pending.
