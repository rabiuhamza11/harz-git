# N0 — OPERATIONAL BOUNDARY FREEZE (Dad's order, Oct 4, 2026)

The wall is finished. This gate tests whether the machine behind
the wall respects it. No new mesh feature is ordered or implied
(N0-C). This document freezes, it does not build.

## N0-A: THE FIVE-WALL AUTHORITY CONTRACT — FROZEN AS THE DEPENDENCY

Every operational component of HARZ (node, mesh, transport,
storage, reconciliation, serving) now depends on these frozen
boundaries. They are not features; they are the law of the
operational layer.

1. INTEGRITY (G24): a valid signature proves a state was
   authorized; the standing continuity chain determines whether
   it is still current. Height + prior_state_hash + payload,
   complete canonical structure signed. Height alone is never
   authority.
2. CONVERGENCE (G25): replicated state can never rise to
   sovereign authority. The checkpoint can demote, never
   promote. Currency relative to the anchor, always disclosed.
3. AUTHORITY LIFECYCLE (G26): authority changes only through
   signed transition records with act-time windows. Replay,
   rollback, forgery, ambiguity: refused. Silence never
   re-authorizes.
4. LIVENESS (G27): liveness may disappear; authority must never
   be fabricated. Silence is evidence of absence of knowledge,
   not evidence of authority. Anchorless states are UNKNOWN,
   never CURRENT.
5. COMPOSITION (G28): the HIGHEST valid sovereign observation
   governs; timestamp only breaks same-height ties (disclosed);
   every additional valid anchor is disclosed, never silently
   discarded.

THE HARD RULE CARRIED FORWARD (verbatim, binding on all
operational ordering, reconciliation, and message handling):
> Never let a lower-quality observation mask a stronger
> sovereign observation merely because it arrived later.

THE OPERATIONAL DISTINCTION (the N0 question, verbatim):
> The node may be operationally available without being
> authoritative.
That distinction must survive the ACTUAL transport and storage
machinery, not merely the verifier.

## N0-B: THE NODE KIT PRIMITIVE — FROZEN AS IT STANDS

The field system is the internetless node workstream
(harz-internetless/, owner-directed; sibling session Magani):

FROZEN (v0.1, FREEZE-G27.md, commits df93aef/ae5fd4e):
- internetless-node.js v0.1: one file, zero dependencies;
  init / whoami / serve / send / inbox / forward /
  prove-offline; canonical signed envelopes (frozen key order —
  any change forks the protocol); the private key never prints,
  never enters chat, lives in identity.json on device only.
- 12/12 survival battery PASS; 2 vulnerabilities demonstrated,
  0 hidden, 0 patched during the battery; S6 (local write+seal)
  explicitly unavailable in v0.1 — honest boundary.
- KNOWN VULNS (frozen as-is, repair belongs to v0.2):
  V1 torn-tail line silently swallowed (an ACKed message can
  vanish unflagged); V2 read trusts the stored verified flag
  (tampered signature still displays [VERIFIED]).
- v0.2 CHARTER (owner-frozen, exactly 3 items, no new
  features): (1) atomic/detectable append recovery — ACK means
  recoverable durable record; (2) read-time cryptographic
  re-verification — READ => REVERIFY, stored verdicts are cache
  never authority; (3) S6 local write -> seal -> persist -> kill
  -> recover -> verify.
- Evidence law standing: real device -> airplane mode ->
  browser -> recorded receipt. No simulated offline flag, no
  hardcoded response, no theater.

N0 does NOT modify the v0.1 files or the v0.2 charter. The
five-wall contract and the primitive freeze meet at N0-D.

## N0-C: NO NEW MESH FEATURE
Frozen. Nothing in N0 builds transport, merge engines, BLE,
Wi-Fi Direct, or any mesh capability. The battery stays the
product.

## N0-D: THE ATTACK (defined now; launched only on Dad's order)
> Can a real HARZ node transport, persist, reconcile, and serve
> state without violating the five-wall authority rules?

The real path under attack:
receive -> persist -> acknowledge -> disconnect -> recover ->
reconcile -> resolve
deliberately combined with:
stale state; competing histories; authority rotation; power
loss; partition; delayed messages; duplicate messages; reordered
messages; restored connectivity.

Classification law (from G28, binding): any composed verdict
that promotes a state to authority without sovereign evidence
for THAT state is a FAIL. Silent timestamp-selection over
valid sovereign evidence is a FAIL. Availability never converts
into authority (G27). A torn tail never silently vanishes (v0.2
law 1). A stored verdict never outranks re-verification (v0.2
law 2). Each result classified: authority failure vs
operational/disclosure failure. No patching during the battery.

## STATUS
N0-A frozen. N0-B frozen. Awaiting Dad's order for N0-D.
