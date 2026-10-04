# INTERNETLESS v0.2 — ACCEPTANCE RECORD (Magani, Oct 4, 2026, owner word: "Go")

Charter: G27, exactly 3 items, brutally small, no new features. v0.1 untouched (frozen).
Battery: v02-battery.sh, 12 scenarios, run-03 (v02-run-03.log), single-instance lock, disk is truth.

## VERDICT: 12/12 PASS — all three charter items accepted at WORKBENCH level.

R1 — ACK => RECOVERABLE DURABLE RECORD:
- B1: kill -9 mid-blast, acked==stored (12==12), zero torn tails (fsync-before-ack).
- B2: injected torn tail disclosed on read (machine-readable line), evidence preserved in
  inbox.torn with byte-count receipt, valid records untouched by quarantine.

R2 — READ => REVERIFY (stored verdicts are cache, never authority):
- B3: the v0.1 A6 attack now FAILS to lie — tampered disk signature reads [CORRUPT];
  honest records re-verify [VERIFIED] (11/11).
- B4: forward propagates ONLY what re-verifies NOW — corrupted record does not spread.

R3 — S6 LOCAL WRITE+SEAL PATH (write -> seal -> persist -> kill -> recover -> verify):
- B5: seal loop + kill -9 mid-loop: every acked SEALED record recovered, chain INTACT.
- B6: tampered seal verdicted BROKEN at exact slot (#2), explicit classification
  (ENV DIGEST MISMATCH / ENVELOPE SIG FAILED), exit 1 — fail-closed.

Regressions held: mesh delivery (B7 12+5=17), replay exactly-once (B7 17->17),
corrupt identity fail-closed (B8). Build bug caught and fixed pre-acceptance: arg parser
double-dashed "--" + "--name" (my bug, not v0.1's — v0.1's callers pass the full flag).

## HONEST BOUNDARY

Workbench acceptance only. The crown is the two-phone field run under the standing evidence
law: real device -> airplane mode -> browser -> recorded receipt. v0.2 ships into the Node Kit
field path; S6 field acceptance = seal on phone, kill power, reboot, verify — filmed.
