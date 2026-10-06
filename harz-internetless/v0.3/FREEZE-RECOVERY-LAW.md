# FREEZE — RECOVERY LAW (Dad's ruling, Oct 6, 2026)

> "Deduplication may suppress only a record that has itself re-verified successfully. A
> corrupt, stale-signature, or otherwise unverified disk record cannot reserve its nonce
> against a valid record."

FROZEN by Dad's ruling on the REC3 evidence boundary (vault commit 72f2950): the recovery
law AND its implementation, promoted as the next earned primitive.

## THE FROZEN IMPLEMENTATION

internetless-node-v03.js (sha256 98dcdd624a4901b0e35e42bd8b3f1695d644cbb44339a08260345252ac25a5c39)
— promoted from candidate internetless-node-v03rc.js (sha256
0a3ae10ec0162a9efaf80a97cdea2986520d9ecdff248ec53703dfd31bf249b3, the exact file that
survived the REC3 battery 29/29 twice) with a header-only diff; non-comment code verified
byte-identical, and the promoted file smoke-verified live after promotion (convergence +
corrupt-present heal + evidence preservation).

## THE RULED REPLACEMENT SEMANTICS (part of the freeze)

Identity = (nonce, valid signature). If a valid record arrives whose nonce already exists
on disk in corrupt form, the valid record wins and replaces the corrupt copy. Not coexist.
Not reject. Not wait for quarantine. The corrupt copy moves to inbox.corrupt as timestamped
evidence — never erased, never forwarded, never treated as evidence of validity. The
resulting state is deterministic across restart.

## WHAT THE FREEZE EARNED (the ruling's own evidence list)

1. The frozen v0.2 primitive remained untouched (hash-gated at both batteries).
2. The candidate was separately built and hash-gated.
3. REC3 battery 29/29, two consecutive clean runs.
4. F-REC1 closed: plain loss heals without reboot.
5. F-REC1-2 closed: corrupt-present heals through valid re-delivery.
6. F-REC1-3 closed: tamper-first + reboot — the exact remotely-triggerable poison — heals.
7. Corrupt evidence is preserved, never silently erased.
8. Invalid material never becomes evidence of validity.
9. REC1's authority and conflict laws remain intact (regression-verified).
10. Local seals remain local, chains intact.
11. Kill/restart preserves the resulting state.
12. Deterministic in both directions (both nodes), rapid-fire both orders, repeated restart.

The deepest improvement, in Dad's words: "Memory no longer gets to remember a truth that
disk can no longer prove." This closes the liveness hole without turning reconciliation
into an authority mechanism.

## SCOPE OF THE FREEZE (exactly as ruled)

This freezes the recovery law and its implementation as the next earned primitive. It does
NOT freeze the whole Internetless project — that workstream remains active. The frozen v0.2
primitive remains untouched as historical evidence of the defects (REC2's history is never
rewritten). The known operational duplicate (fresh-nonce identical content stores twice)
remains disclosed and unfrozen — a candidate next attack surface. The two-phone field gate,
when hardware exists, runs on THIS stronger primitive, not the flawed v0.2 behavior.
