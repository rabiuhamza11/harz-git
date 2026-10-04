# INTERNETLESS v0.2 — CHARTER (owner ruling G27, Oct 4, 2026)

"Make v0.2 brutally small." Exactly three items. No new features. No scope additions without owner word.

## 1. Atomic/detectable append recovery
Invariant: ACK => recoverable durable record.
- The append path must never leave the node unable to boot honestly.
- On boot/read, a malformed or torn tail must be DETECTED, CLASSIFIED, and EXPOSED
  (torn-line count disclosed on every read; a torn tail is evidence, not garbage).
- Preferred: durability before ACK (flush/fysnc semantics) so an ACKed record is never torn.
- Acceptance: kill -9 timed during append (repeated battery), then:
  (a) node restarts, (b) every ACKed record is present and verifies, (c) any torn tail is
  reported with a machine-readable receipt line — zero silent drops.

## 2. Read-time cryptographic re-verification
Invariant: READ => REVERIFY. Stored verdicts are cache, never authority.
- inbox/serve reads must re-verify every envelope signature against its embedded pub.
- Tampered record displays UNVERIFIED/corrupt with a disclosure line; honest records unchanged.
- Acceptance: A6 attack re-run — tampered sig on disk shows UNVERIFIED on read; honest records all
  still [VERIFIED]; performance acceptable on phone hardware (2GB RAM Infinix).

## 3. S6 — local write + seal path
Shape: local write -> seal -> persist -> kill -> recover -> verify.
- One allowed local operation only. Sealed (signed and digest-chained), persisted to disk,
  survives kill -9, recovers on boot, verifies on read under rule 2.
- Gated by the existing walkout/HPR discipline: writes are allowed, sealed, receipted — never
  fabricated. Exactly-once, replay-safe.
- Acceptance: full cycle battery: write, kill -9, reboot, read — record present, sealed,
  verified; duplicate/replay refused; tamper refused and disclosed.

## Non-goals (explicit)
- No new transports (BLE, Wi-Fi Direct stay parked).
- No merge engine changes (book layer belongs to rung 2).
- No features. The battery stays the product.

## Gate
Workbench acceptance for all three, then the two-phone field run under the evidence law:
real device -> airplane mode -> browser -> recorded receipt. Field closes the stage.
