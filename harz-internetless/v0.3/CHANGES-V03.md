# CHANGES — v0.2 -> v0.3 (Recovery Law)

## The one behavioral change

Receive-path deduplication consults DISK TRUTH (scan, re-verified NOW) instead of the
boot-seeded in-memory set. The in-memory set is demoted to bookkeeping and is never
consulted for decisions. Suppression requires a same-nonce line that itself re-verifies
NOW; a corrupt, stale-signature, or otherwise unverified disk record reserves nothing.

## The ruled replacement path

On a valid arrival whose same-nonce disk lines all fail re-verification: the corrupt lines
are atomically moved to inbox.corrupt (timestamped CORRUPT-REPLACED entries — evidence
preserved, never erased, never forwarded) and the valid record is persisted as the
governing copy. fsync-before-ack is unchanged.

## Everything else is behaviorally identical to v0.2

fsync-before-ack; torn-tail quarantine (readAndQuarantine); READ => REVERIFY; forward
relays only what re-verifies NOW; seals are node-local sovereign state and never transport;
node vocabulary is authority-blind ([VERIFIED]/[UNVERIFIED]/[CORRUPT], torn disclosures);
the death line holds: convergence of transport is never resolution of truth.

## Why (evidence chain)

REC1 froze the reconciliation contract (28/28 x2) and found F-REC1. REC2 attacked recovery
semantics (34/34 x2), measured F-REC1 exactly, and exposed F-REC1-2 (corrupt-present masks
forever) and F-REC1-3 (unverified evidence poisons the boot dedup re-seed — remotely
triggerable liveness attack). Dad ruled the remedy semantics and the candidate law;
internetless-node-v03rc.js was built as a separate candidate (v0.2 untouched, REC2 history
untouched) and survived the REC3 battery 29/29 twice (Dad's exact chain both directions,
rapid-fire both orders, repeated restarts, all regressions). Dad froze the law: see
FREEZE-RECOVERY-LAW.md.

## Hash bindings

- Frozen v0.2 (untouched, historical): d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61
- Attacked candidate (REC3 battery target): 0a3ae10ec0162a9efaf80a97cdea2986520d9ecdff248ec53703dfd31bf249b3
- Promoted v0.3 (header-only diff from candidate, non-comment code verified identical,
  smoke-verified after promotion): 98dcdd624a4901b0e35e42bd8b3f1695d644cbb44339a08260345252ac25a5c39

## Known, disclosed, NOT fixed here

Fresh-nonce identical content still stores twice (operational duplicate, disclosed since
REC1 R3, re-measured in REC2 SCN2 and REC3 R3-7 — it re-enters content, never record
identity). It remains an open surface for the next deliberate attack, per the freeze-first,
attack-second discipline.
