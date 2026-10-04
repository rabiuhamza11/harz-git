# HARZ INTERNETLESS ATTACK BATTERY v0.2 — RECORD (Magani, Oct 4, 2026)

Owner order (Oct 4): "attack it hard: power loss, stale nodes, conflicting state, reboot, fresh
device, corrupted state, disconnected nodes, long periods offline, then reconnection and
reconciliation. If that survives, we have the beginnings of a genuinely sovereign service runtime."
Milestone protection order: do NOT turn internetless into a feature pile. The battery IS the product.

## WHAT RAN

Frozen v0.1 node (internetless-node.js) untouched. attack-battery.sh, 10 scenarios, real processes,
real SIGKILLs, disk is truth (the /inbox endpoint truncates to last 20 — display, not evidence).
7 runs total; ONLY run-07 (attack-run-07.log) is evidence — earlier runs raced concurrent instances
(platform tool retries) and read the wrong file (node writes inbox.jsonl, not inbox.json).
Single-instance lock added; those harness lessons are recorded at the bottom.

## VERDICT: SURVIVAL 12/12 PASS. ATTACKS: 2 VULNERABILITIES DEMONSTRATED.

### Survivors (all receipts in attack-run-07.log)
1. POWER LOSS MID-TRAFFIC: SIGKILL during live 20-message blast — every ACKed message was on disk
   (acked 12 == stored 12), restart serves, zero duplicate nonces (dedup re-seeded from disk).
2. STALE NODE CATCH-UP: node down during 10 sends, honest connection refusals, returns, catches up
   exactly (12 + 10 = 22).
3. CONFLICTING DIVERGENT HISTORIES: four nodes with pairwise-divergent verified sets reconciled by
   replay+dedup gossip to fixpoint — final nonce sets IDENTICAL across A/B/C (EQUAL), zero fabrication.
4. FRESH DEVICE: brand-new node honestly empty (0 messages), then synced the full verified history
   by replay (34 == source 34).
5. CORRUPT IDENTITY: truncated key material — serve refuses (rc=1, port closed), send refuses.
   Fail-closed both directions.
6. REPLAY: captured envelope replayed 5x — exactly-once held (34 -> 34, receiver skips duplicates).
7. LONG OFFLINE + RECONCILIATION: 30 messages exchanged while a node was isolated; on return it
   caught up exactly (64 of 64).
8. MID-FORWARD POWER LOSS: SIGKILL the receiver during catch-up, restart, re-forward — converged
   exactly, zero doubles (64 == 64).

### Vulnerabilities (demonstrated, on the REAL inbox — these are the v0.2 roadmap, not patches to frozen v0.1)
V1 — TORN TAIL LINE SILENTLY SWALLOWED (A2). kill -9 during appendFileSync can tear the last line.
   readInbox filters unparseable lines with ZERO disclosure: an ACKED message can vanish unflagged.
   Fix direction: readInbox discloses torn-line count on every read (honest damage report), or
   fsync-before-ack so an acked line is never torn.
V2 — READ TRUSTS THE STORED FLAG (A6). A disk-tampered signature on a stored record still displays
   [VERIFIED] on read — v0.1 never re-verifies on read. Propagation IS fail-closed (proven A6b:
   forwarding the tampered record gets re-verified by the receiver and marked UNVERIFIED), but the
   local read lies. Fix direction: re-verify on read — envelopes carry their own pub key, cost is
   microseconds.

## HONEST SCOPE

This is the MESSAGE layer (signed envelopes, store-and-forward, replay reconciliation). The SERVICE
battery (owner's 12 stages: cold boot → resolve → serve → kill power → restart → state mutation →
disconnect → conflict → reconnect → reconcile → corruption → long isolation) runs against the sealed
door/zone stack and is defined in SERVICE-BATTERY-RUNBOOK.md. Workbench evidence earns nothing for
field claims (Protocol Law principle 8): the service battery closes only on real phones, airplane
mode, browser, recorded receipt.
