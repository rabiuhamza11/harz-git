# RUNBOOK ADDENDUM — RUN 4: STORE-AND-FORWARD (Track A extension, Oct 18 2026)

Owner ruling Oct 18 (Track A first; friend's matrix): queued messages must survive a tested
disconnection. The frozen MeshCore already holds frames for absent peers (sendChunk -> store,
flushStore on rejoin) — this run exercises that law on real phones. NO protocol changes:
mesh-frame.js / mesh-core.js / zone-carrier.js / reach-core.js untouched. Only the field
wrapper mesh-phone.js gained --hold mode (harness tool, same as the Oct 18 morning h2 update).

NEW COMMAND (Phone A):
  node mesh-phone.js go --id AAAA --port 8988 --push-to BBBB --hold
  -> queues the book for BBBB IMMEDIATELY (B offline): prints "[store-and-forward] held BBBB:N"
  -> also accepts stdin: 'push' (queue another copy any time), 'status' (queue state)

RUN 4 SEQUENCE:
1. A: go --hold (B NOT joined yet) -> "queued: 21 chunks ... held for [BBBB]"
2. B: join -> BOOK DELIVERED, signature VALID (first flush proof)
3. B: Ctrl-C (leave the mesh). A: type 'push' + Enter -> "B is OFFLINE: 21 chunks HELD in queue"
4. B: join again -> BOOK DELIVERED AGAIN (the queued copy survived the disconnect — the pass sentence)
5. Honest label: transport = LAN TCP (hotspot). Store-and-forward proven at the node layer
   on real devices; multihop relay remains battery-proven only (Kotlin harness).

SANDBOX PRE-FLIGHT (this commit, real sockets, Oct 18): held 21 chunks offline -> join#1
BOOK DELIVERED (sig VALID) -> disconnect + 'push' while offline -> join#2 BOOK DELIVERED
(sig VALID) -> resolve pay.harz from cache + honest NXDOMAIN -> RUN 2 regression REFUSED
SIGNATURE FAILED, cache untouched. One harness defect found and fixed during pre-flight:
hold mode double-pushed (flush + peer-joined push) and B's verifier honestly REFUSED the
doubled transfer — fixed by suppressing the peer-joined push in hold mode. The refusal itself
was correct verifier behavior (two books, different seq ranges, concatenated = REFUSED).
