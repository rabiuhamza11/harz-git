# HARZ ROOT SUCCESSION PROTOCOL v0.1
**Status: DRAFT for owner ruling — NOT frozen, NOT deployed**
**Date: Sep 15, 2026 · Seat: Magani (orchestrator) · Attacks before freeze per standing discipline**

## The problem this protocol answers
Phase-1 attack findings #1 and #2 against the Second-ICANN architecture:
- The production ZSK lives on one phone (Node 1, the Infinix). One phone is the whole root.
- There is no rotation ceremony, no revocation, no recognized successor. A root without
  a death plan is a personal list, not infrastructure.

Zero-ICANN law makes this MORE important, not less: the Naming Root IS the KEY.
No registrar exists to fall back on. Key survival = namespace survival.

## Definitions (reusing what already exists, nothing invented)
- **K0** — the current production ZSK (Ed25519, private on Node 1, ceremony 2026-09-14, sig VALID).
- **Zone chain** — the existing D1 provenance + prev-digest hash chain (already live).
- **Fail-closed validators** — the resolver law already frozen: bad/missing signature = refuse.
- **QR rail** — the existing camera-transfer discipline (root-qr.js, 46-chunk DPB).

## The design — three seats, pre-signed succession, witness quorum

### 1. Succession Manifest (the pre-authorization)
A new record type `SUCCESSION` in the canonical zone, signed by K0 while K0 is alive:
- `successor_pub`: K1 (fresh Ed25519 keypair, private key NOT on any networked device —
  printed as QR paper backup via the existing QR rail, stored physically by the owner)
- `witnesses`: [W1, W2, W3] — Ed25519 pubkeys on distinct substrates
- `policy`: quorum 2-of-3
- `declared_at_height`: zone height at signing
- `max_gap_heights`: succession must be exercised within N zone migrations or re-declared

### 2. Rotation ceremony (planned handover — K0 alive)
1. Owner declares succession day. New zone built and signed by K1.
2. Zone carries SUCCESSION_ACT record: revokes K0 (old pubkey + revoked_at_height),
   proves K1 was the named successor in the last K0-signed SUCCESSION manifest.
3. Validators' new law: a K1-signed zone is accepted ONLY IF the K0-signed SUCCESSION
   manifest naming K1 exists in the accepted chain. Ordered by the hash chain — no fork possible.
4. Resolver bundle (CLI/DoH/extension/native/cache/QR doors) ships BOTH pubkeys with a
   transition window: K0-continuation valid until revoked height; K1 valid from it.

### 3. Death path (K0 lost, stolen or destroyed — the phone question)
1. Owner (or surviving operators) convene the witnesses.
2. 2-of-3 witnesses co-sign a SUCCESSION_ACT over the same K1-signed zone
   PLUS a compromise declaration naming the last known K0-signed height.
3. Validator law: witness-quorum SUCCESSION_ACT outranks continued K0 signatures
   from heights AFTER the declared compromise height. Before that height, K0 rules.
   (This is the only judgment rule in the protocol — flagged for Yakubu attack.)

### 4. Witness seats (candidates — OWNER MUST RULE, none confirmed)
- W1: the desk's Cloudflare account as a KEYSTORE OF RECORD (pubkey only; signing key
  generated inside a worker, extractable never — honest note: rented soil, see attack)
- W2: paper QR in a second physical location (Jalingo + Bauchi office)
- W3: a person Rabiu trusts (family member holding a printed activation card)
Rule carried over from Root v2: PORTABILITY — no witness seat may be "one particular phone."

## What this fixes (measured against Phase-1 attack)
- Finding #1 (one phone is the whole root): the root now survives the phone.
  K0 death no longer kills the namespace; 2-of-3 + paper successor keeps it alive.
- Finding #2 (no succession law): rotation, revocation, death path all become
  deterministic ceremonies with cryptographic receipts, same as the ZSK ceremony.

## What it does NOT fix (honest, per the attack discipline)
- The theft race: if K0 is stolen AND used before a compromise declaration is made,
  both chains look valid until the witnesses act. The chain limits the damage window
  (heights), it does not eliminate it. ICANN has courts; we have quorum + speed.
- Witness soil: if witnesses live on rented platforms (Cloudflare), banning the account
  kills the quorum. Paper QR witnesses survive account death but act slowly.
- The successor key on paper is slow to activate (re-typing/re-scanning) — by design:
  slow succession beats no succession, but it is still slow.

## Open rulings needed from the owner (D6-D8, extending D1-D5)
- D6: Who holds the three witness seats? (candidates above or his own)
- D7: Quorum 2-of-3 confirmed, or 3-of-3 (slower, safer)?
- D8: Succession protocol frozen BEFORE the killer test, or after migration?
  Magani's recommendation: BEFORE — the killer test should also kill the KEY, not just the node.

## Freeze gate
This document is a draft. It becomes law only after: (1) owner rulings D6-D8,
(2) Yakubu attacks it (theft race, quorum collusion, chain reorg, paper-key forgery),
(3) a software-mode ceremony rehearsal passes, (4) commit at freeze time per discipline.
