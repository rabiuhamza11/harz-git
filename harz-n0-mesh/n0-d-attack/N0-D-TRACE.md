# N0-D — OPERATIONAL ATTACK: RECEIVE/PERSIST/ACK/RECONCILE (trace, Oct 4, 2026)

Target: the REAL v0.2 node primitive (internetless-node-v02.js, sha256
d0dfbfb0e66e94799f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61 —
verified UNMODIFIED at start and end; zero edits, zero patches
during the battery). Seven real nodes (A-G) ran the actual
serve/send/forward/inbox path on live ports, carrying REAL
sovereign records (the G28-1 bundle: s1-s3 + fork tips + v3/v4
checkpoints + rotation + revocations) as envelope payloads. At
every arrival, the standing fresh-node verifier measured what
the machine actually delivered.

## THE BATTERY, MEASURED

D1 BASELINE FIDELITY: PASS. 9/9 pieces A->B->C with durable
ACKs; bundle rebuilt from C's OWN stored inbox; verdict
BYTE-IDENTICAL to ground truth: FORK DISCLOSED, CURRENCY
UNDETERMINED, anchor defers to the fork verdict.

D2/D11 POWER LOSS AT APPEND: PASS. Real kill -9 of the true
listener mid-flood (port verified DOWN; no phantom ACKs after
death). Sender held 12 durable ACKs; disk held 12/12; ZERO
ACKed-but-vanished. fsync-before-ACK held under a real process
kill.

D3 TORN TAIL AFTER ACK: PASS WITH THE HONEST BOUNDARY. The
injected corruption landed ON an ACKed record (FLOOD5-011).
Boot disclosed: "1 torn inbox line(s) quarantined — evidence
preserved, never erased." Machine-readable TORN receipt (380
bytes, timestamped, content preserved in inbox.torn). The
ACKed record is no longer servable, but its remains are
preserved evidence and the loss is DISCLOSED, never silent.
Per the frozen v0.2 law (detect, classify, expose, never
silently erase): held. The boundary: durability is disclosed,
not immortal — physics can corrupt after the ACK; the system's
promise is evidence, never silent loss.

D4 DUPLICATES: OPERATIONAL FINDING, NO AUTHORITY IMPACT. Dedup
is per-envelope-nonce. Same-envelope replay dedups (v0.1
battery, held). Fresh-nonce resend of IDENTICAL content stores
a second copy (18 records for 9 messages). The bundle rebuild
is content-addressed, so no verdict changed; the finding is
record amplification (availability), not authority. Reported
for Dad's ruling: content-hash dedup is a candidate v0.3 item,
not an N0 repair.

D5 REORDERED DELIVERY: PASS. All 9 pieces delivered in REVERSE
order (tipB first, s1 last). Verdict identical to ground
truth. Arrival order never touched authority.

D6 DELAYED ANCHOR, MASKING ORDER: PASS. The G28-2 masking
bundle delivered with the fresher LOWER anchor arriving LAST —
exactly the order an attacker wants. Verdict: CONFLICT, local
tip NOT CURRENT. The G28 repair survives the transport; a
later-arriving weaker observation cannot mask a stronger
sovereign observation. The hard rule held IN THE MACHINE.

D7 COMPETING HISTORIES: PASS (embedded in D1/D5). Both fork
tips transported in either order: FORK DISCLOSED, CURRENCY
UNDETERMINED, never silently picked by arrival.

D8 AUTHORITY ROTATION THROUGH THE MESH: PASS. Double rotation
(T1+T2) + middle-key acts transported. The post-window act
was REFUSED (AUTHORITY WINDOW PASSED) at the far node; the
successor's anchor governs; ANCHORED. Windows survive
transport.

D9 STALE SERVING + LABEL SEMANTICS: PASS. The node served
the full inbox including stale s1 with ZERO currency claims:
no 'current', no 'latest', no 'authority' in any node output.
The only label is [VERIFIED] = envelope signature re-verified
NOW (R2). The node is authority-blind AND SAYS SO — it claims
transport authenticity, never origin authority. Stale records
serve as what they are: history.

D10 PARTITION + RECONNECT + CATCH-UP: PASS. TRUE partition
(listener killed, port verified down): sends failed ECONNREFUSED,
ZERO records stored while down, no ACK without a live durable
store. After reconnect + full catch-up: verdict identical to
ground truth. Reconciliation added nothing, resolved nothing
silently; the competing histories still surface.

## THE OPERATIONAL DISTINCTION — CONFIRMED BY MEASUREMENT
> The node may be operationally available without being
> authoritative.
Node B served 590+ verified envelopes with zero authority
claims; authority lived ENTIRELY in the verifier's
measurement of the transported content. Availability and
authority stayed separate under every failure mode thrown.

## HARNESS DEFECTS (all caught before any claim, re-verified)
1. `ps` unavailable + $! pid-file misses: the first two
   kill -9 attempts never fired (suspicious 300/300 ACKs and
   a "successful" send during a supposed partition exposed
   both). Fixed with /proc-resolved listener PIDs + mandatory
   port-down verification; both tests redone and measured
   properly.
2. A self-matching /proc PID finder killed collateral
   processes (A and C) — bracket-pattern fix, clean mesh
   restart, all subsequent kills verified against port state.
3. One python syntax error in the label check — fixed, re-run.
Void or damaged runs were never counted as results.

## ARCHITECTURAL NOTE (for Dad's ruling, not a violation)
The node identity layer (envelope signatures) has no
revocation/rotation concept — by design: it is transport, not
authority, and it never claims otherwise. If node-identity
revocation (a compromised phone) ever becomes a requirement,
it is a v0.3+ design question, not an N0 failure. The five
walls were never touched by the mesh: they rode through it
intact, byte-identical, and enforced only by the verifier.

## VERDICT
N0-D: PASS. The machine behind the wall respects the wall.
Zero authority violations across all attacks. One operational
finding (nonce-level dedup) + one honest durability boundary
(disclosed, evidence-preserved) reported for ruling.
