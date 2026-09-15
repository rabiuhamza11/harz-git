# YAKUBU PHASE 2 — ATTACK AGAINST THE DEFENDED STATE — REPORT
**Date: Sep 15, 2026 · Seat: Yakubu attacks, Magani verifies, owner witnesses (roles separated)**
**Defended state under attack: resolver v1.1 (anchor law), QR rail v1.0, doors v2.2, succession protocol v0.1 + kit v1.1**

## PRE-REGISTERED ATTACKS + VERDICTS

### P2-1 SHRINK ATTACK — CONFIRMED REAL, FIXED (engine v1.2)
Attack: a stolen or malicious authority signs a zone with height correctly advanced but only 3 of 77
records. Every check passes (valid sig, valid chain). 74 names silently die under a VALID signature.
Probe: ACCEPTED 3 names — HOLE CONFIRMED empirically.
FIX (resolver v1.2 SHRINK law): holder pins minRecords (namespace floor) out-of-band with the
anchor. Zone below floor → REFUSED. Post-fix probe: REFUSED. Honest growth never blocked (G4).

### P2-2 REPLAY/ROLLBACK ATTACK — CONFIRMED REAL, FIXED (engine v1.2)
Attack: replay an OLD validly-signed zone (height 1, 5 names). No freshness check existed.
Probe: ACCEPTED 5 names — HOLE CONFIRMED. A holder can be silently rolled back.
FIX (ROLLBACK law): (a) holder pins expectedHeight out-of-band; (b) STATEFUL guard — an engine
that has seen height H refuses any later load below H (G3). Post-fix: both refused.

### P2-2b ROLLBACK ACROSS RELOADS — FIXED (stateful lastHeight in the engine)
The engine remembers the highest zone it has served. Stale zones die at the door even without
a pinned floor (defense in depth: pin + memory).

### P2-3 OPEN-REDIRECT DOOR ATTACK — REFUSED (no hole)
Live probes on harz-root.harz.workers.dev: /go/evil → 404, /go/https://attacker.example → 400,
/go/..%2F..%2Fadmin → 400, only real names redirect (/go/pay → 302 harzpay). Name-gated, not open.

### P2-4 DoH GATE ATTACK — HELD (fail-closed live)
NXDOMAIN → 404 + DoH Status 3; pay.harz → 200 with real A records. No fake answers.
COSMETIC FINDING (logged, not deployed): malformed RFC-8484 wire input returns 500 instead of 400.
It refuses (never 200, no data), but the status code is noisy. Queued for the next live patch
window — not worth touching the production root for cosmetics today.

### P2-5 QR RAIL GUARDS — MIRRORED (rail v1.1)
decodeChunks now accepts { expectedHeight, minRecords } in the out-of-band trust bundle.
Replayed/signed-shrunk zones refused AT THE CAMERA, not just downstream. Rail battery 11/11 re-passed.

### P2-6 SUCCESSION AVAILABILITY (inherited, bounded, documented)
A holder pinning only K0's anchor will refuse the successor's zone (availability, not integrity —
fail-closed by design). Fix is discipline, not code: after any succession, the QR rail must carry
the ZONE CHAIN since the last anchor-signed zone (holder runs ceremony-kit verify-chain; z2+z3
accepts where z3 alone refuses). Written into the succession runbook's recovery step.

## THE TRUST BUNDLE (now the honest handout)
anchor pub + expectedHeight + minRecords — all out-of-band, all pinned. Camera/scanner trust
nothing else; every door (DoH, extension, mesh cache, QR) can carry all three guards.

## POST-ATTACK STATE
Resolver v1.2 (shrink + rollback + stateful), battery 16/16 PASS (11 regression + 5 guards).
QR rail v1.1, battery 11/11 re-passed, guard probes: old zone REFUSED, current zone ACCEPTED.
Live doors probed: no open redirect, DoH fail-closed intact, cosmetic 500 logged.
Live root UNTOUCHED today (v1, e94b9693) — engine hardening ships with the migration, not before.

## HONEST BOUNDARIES
The shrink/rollback holes were found in the LAB engine against TEST keys — the live v1 zone was
never attacked, and the production root is intact. The guards protect holders; they cannot
protect a holder who pins nothing (G5: no floors = old behavior, holder's choice).
