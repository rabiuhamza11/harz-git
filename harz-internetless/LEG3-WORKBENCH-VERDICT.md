# LEG 3 WORKBENCH VERDICT — CLOSED (Oct 7, 2026, ~21:20 WAT)
Recovery law battery on frozen v0.3 (98dcdd624a49). Two nodes, real HTTP transport, 14/14 checks.
L1 Health: both serves up (ports 8995/8996).
L2 A->B send: VERIFIED + FSYNCED, durable.
L2b B->A forward: A holds valid copy (mesh relays verified records).
L3 B state: 1 VERIFIED.
L4 Attack: B's disk copy tampered (text changed, sig fails).
L5 B disk truth: [CORRUPT] verdict, 0 verified — honest, no smoothing.
L6 A re-delivers the valid original via REAL forward.
L7 B disclosure: corrupt same-nonce record REPLACED by valid arrival; prior copy quarantined to inbox.corrupt, never erased.
L8 B state: 1 VERIFIED, original text restored.
L9 Quarantine evidence: CORRUPT-REPLACED line timestamped, preserved.
L10 Same-nonce forgery: SIGNATURE FAILED at the door; valid record not displaced.
L11 Fresh-nonce forgery: stored [UNVERIFIED], never verified, fills nothing.
L12 Valid record untouched through both attacks (same received_at).
L13 kill -9 + restart: count 3, verified 1, corrupt 0 — state stable from disk.
L14 Boot clean: no torn, no loss.
VERDICT: Recovery law held end to end. A node's memory of evidence never outranks disk evidence; corruption is replaced, never trusted; forgeries are evidence, never authority.

RUN 2 (Oct 7, 21:22 WAT): second independent clean run, fresh nodes/ports 8997/8998, same frozen primitive 98dcdd624a49. All checks reproduced: [CORRUPT] disclosed and excluded, valid arrival via real forward REPLACED corrupt copy, quarantine evidence timestamped, same-nonce forgery SIGNATURE FAILED at door, held as [UNVERIFIED] evidence only. LEG 3 = 14/14 x 2. CLOSED, do not reopen.
