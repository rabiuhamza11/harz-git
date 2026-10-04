# INTERNETLESS v0.2 — WHAT CHANGED AND WHY (G27 charter, exactly 3 items)

Base: frozen v0.1 node, byte-copied then repaired. Zero new features, zero deps, one file.

## R1 — ATOMIC/DETECTABLE APPEND RECOVERY (law: ACK => recoverable durable record)
- Append path now writes through a persistent fd and calls fsyncSync BEFORE the server replies.
  An ACK is never issued ahead of durability: what is acked is on the platter.
- Recovery: every read detects torn/malformed lines (what kill -9 mid-append leaves).
  Torn lines are QUARANTINED to inbox.torn with a receipt header (timestamp, byte length) —
  evidence preserved, never erased — and the condition is DISCLOSED on every read
  (inbox command + /inbox endpoint both report torn count).

## R2 — READ-TIME CRYPTOGRAPHIC RE-VERIFICATION (law: READ => REVERIFY)
- Every read re-verifies every envelope signature against its embedded pub (ed25519).
  Stored verdicts are cache, never authority.
- Display: [VERIFIED] (reverify passed), [CORRUPT] (stored true but reverify FAILED — disclosed),
  [UNVERIFIED] (arrived failing, stored honestly).
- forward now forwards only records that re-verify — propagation was already fail-closed;
  now the local layer stops lying to its own owner.

## R3 — S6 LOCAL WRITE+SEAL PATH (shape: write -> seal -> persist -> kill -> recover -> verify)
- New command: seal --text "..."  — local sovereign record: envelope signed by the node identity,
  sealed into a local digest chain (seq, prev_tip, env_digest, link signature), appended + fsynced
  to seals.jsonl. New command: seals — re-verifies the whole chain on every read
  (INTACT n / BROKEN at slot k with classification / FORK verdict on divergent prev).
- Kill -9 anywhere in the cycle: what sealed survives; what did not seal is honestly absent.
- Replay: duplicate seq refused. Tamper: detected at exact slot, fail-closed.

## NOT IN v0.2 (charter non-goals, unchanged)
No new transports. No merge engine changes. No features. v0.1 stays frozen, untouched.
