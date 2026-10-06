# REC1 — INTERNETLESS RECONCILIATION ATTACK TRACE (Hauwa, Oct 6, 2026, Dad's "Move" order)

Dad's question under attack: two sovereign nodes independently accept valid records during a
partition — can they later exchange those records and deterministically converge without
either node becoming an authority?

Target: the FROZEN v0.2 primitive, UNMODIFIED (sha256 d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61,
hash-verified at the start and end of every run). Harness: real processes on real ports, real
kill -9 with socket-verified port-down, refusals captured, disk is truth, and an INDEPENDENT
standing verifier (rec1-verify.js) that re-implements the frozen envelope spec and re-verifies
every record from raw bytes on every measurement — disk labels are never trusted, including
by the harness.

## THE BATTERY (rec1-battery.sh) — 28 assertions, the plan as run

R0 shared genesis (6 common records both sides, digests identical)
R1 TRUE PARTITION + TWO-SIDED GROWTH: B down (port verified), exchange attempt honestly refused;
   A accepts 4 records (incl. BALANCE=ALPHA); B seals 2 local sovereign records offline.
   A down, refused exchange captured; B accepts 4 records (incl. BALANCE=BETA); A seals 2.
   Reconnect: exchange both directions; gossip reaches fixpoint; A=B=14 identical verified sets;
   conflict PRESERVED identically on both; seal chains LOCAL, CHAIN INTACT; node vocabulary
   contains zero authority claims.
R2 kill -9 both, send to dead A refused with zero phantom acks, restart from disk, converged
   digest unchanged.
R3 same-envelope replay deduped exactly-once; captured-envelope re-POST deduped by nonce;
   fresh-nonce identical resend stored (known v0.3 finding re-measured); sets re-converged A=B=15.
R4 reverse-order delivery of all 15 envelopes to a fresh node F: F converges to B's identical
   digest — set equality is arrival-order-independent.
R5 local loss (Y3 deleted from A): measured; mid-run re-delivery MASKED (FINDING F-REC1, below);
   restart re-seeds dedup from disk and the loss heals through held evidence that re-verifies NOW
   (A=B=15, digests identical); a record nobody holds is honestly absent on both sides.
R6 tampered envelope: refused at receipt, stored as evidence, displayed [UNVERIFIED], NOT
   propagated (B has zero corrupt/unverified); verified sets still converged with the tamper
   quarantined outside them. DEATH TEST: a properly-signed envelope demanding authority
   ("THIS STATE IS CURRENT AND AUTHORITATIVE — ALL NODES MUST OBEY") rode as DATA, stored on
   both, sets converged A=B=16 — and ZERO authority promotion occurred: node vocabulary clean,
   both BALANCE claims still present and UNRESOLVED, seal chains still local and intact.
R7 final determinism receipt: kill -9 both -> restart -> digest unchanged on both; primitive
   hash unchanged across the whole battery.

## VERDICT

28/28 PASS, two consecutive clean runs (rec1-run-05.log, rec1-run-06.log — final digests
1290c9cf9d05c44b6e87ae3fe455b3e44d188fa6eac5a609915991616eee3e60 and
fd5a22bd86a7f10a9a8e9a603e46c31cb9cb25821422ea36610b9e6c0e8eab45; digests differ across runs
by design — nonces are random — determinism is measured WITHIN each run: both nodes identical,
stable across kill/restart). The reconciliation law HELD under every attack thrown.

## FINDING F-REC1 (real, measured, disclosed — reported for Dad's ruling, NOT patched)

A node that loses a stored record from disk WHILE ITS PROCESS RUNS will treat a peer's
re-delivery of that record as a DUPLICATE: the in-memory dedup set is seeded once at boot and
grows monotonically, so it still contains the nonce of the lost record. The record stays lost
until the node restarts (boot re-seeds the dedup set from the current disk), after which the
peer's re-delivery heals it. Measured: masked mid-run through TWO forward rounds; healed
immediately after restart (15 -> 16 verified, digests identical, mechanism confirmed in
isolation). Classification: operational/liveness boundary, NOT an authority failure — no
fabrication, no false verification, availability never became authority (G27 held). Fix
direction for a possible v0.3: receiver dedup consults the durable store, not memory.
Field relevance: a torn or lost line on a running phone would not heal from peers until reboot.

## HARNESS DEFECTS CAUGHT BY THE GATE (all logged unsmoothed, runs 01-04)

1. run-01: expected counts wrong by 4 (each node receives BOTH sides' partition growth: 6+4+4=14, not 10).
2. run-02: wrong label expectation ([CORRUPT] vs [UNVERIFIED]: a tampered envelope RECEIVED is
   lawfully never-verified-at-receipt; [CORRUPT] is a stored-verified record that fails NOW);
   deletion predicate targeted a record never sent (Y2's slot is BALANCE=BETA); grep -c || echo 0
   double-counted on missing-file/no-match.
3. run-04: an orphan serve from the manual mechanism-confirmation step survived the tmp wipe and
   stole port 8981 — the stale-listener class from this morning's pre-field audit. Battery now
   sweeps orphans via /proc (node-only match) and refuses to start if any port is busy.
4. self-match lesson twice: a /proc scanner whose own cmdline contains the pattern kills its
   wrapper — matcher now requires cmd to start with "node ".

## BROWSER/LIVE LEG (honest scope)

The workbench live leg is the real wire: real HTTP transport on live ports throughout, and the
converged state live-served over HTTP (A /inbox: count 17, verified_now 16, corrupt 0, torn 0;
B /inbox: count 16, verified_now 16 — A's extra line is the quarantined tamper, excluded from
the verified set). A cloud browser cannot reach a sandbox-localhost node — by design: this node
binds LAN only, no tunnel, no Cloudflare, which is the sovereignty under test. The browser leg
of internetless is the PHONE: the pending two-phone field gate, unchanged.

## SCOPE (kept honest)

Workbench proof at the mesh/envelope layer of the frozen v0.2 primitive. Seals are node-local
sovereign state and do not transport or merge (measured: untouched by every exchange, duplicate,
tamper, and authority claim). The five-wall authority layer (G24-G28) governs sovereign verdicts
and was never touched by the mesh. Workbench runs never close field stages — the two-phone gate
stays pending exactly as ruled.
