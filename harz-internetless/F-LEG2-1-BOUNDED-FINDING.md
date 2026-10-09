# F-LEG2-1 — THE LYING ACK: RULED BOUNDED FINDING (Dad, Oct 7, 2026)

## The defect
appendDurable uses writeSync and ignores bytesWritten. Under a kernel file-size cut (ulimit
-f 2) or natural ENOSPC, writeSync does a silent short write (observed: 1308/2111 bytes).
The node fsyncs the FRAGMENT and acks "SEALED #2 ... fsynced to disk BEFORE this ack" for
a record never fully on disk. After reboot the record is gone; its sequence number is
reused by the next valid link. Reproduced twice (workbench rehearsal + field on PHONE_A).

## The ruling
BOUNDED FINDING, preserved as a known v0.3 defect. Evidence over cleanup: a silent late
fix would reopen a closed proof. Any fix happens only in a deliberately opened future
version (v0.3.1 candidate: check bytesWritten, refuse honestly, disclose the incomplete
write, preserve evidence), attacked separately before promotion.

## Why it does NOT violate a frozen invariant
1. Identity law (nonce, valid signature): the ack is not a record, carries no nonce, never
   entered the chain. Not violated.
2. Frozen replacement semantics: on reboot the torn tail was quarantined to seals.torn,
   the phantom record never became a seal, chain re-verified INTACT. The frozen law
   executed exactly as ruled, under the exact trigger that produces the lie.
3. "Memory never gets to remember a truth disk can no longer prove": governs authority at
   verification. On reboot disk won completely; the false ack had zero standing. Not
   violated.
4. Evidence preservation: fragment preserved in seals.torn, timestamped, never erased. Held.
5. Determinism, no manual repair: LEG 2 battery 6/6 on the frozen primitive. Held.
The lie is told to a CALLER, not to the RECORD SYSTEM. No frozen truth law is broken.

## Trigger disclosure
Nature: ENOSPC (disk full on a phone). Not remotely reachable. Liveness layer only;
safety (chain truth) intact in every observed case.
