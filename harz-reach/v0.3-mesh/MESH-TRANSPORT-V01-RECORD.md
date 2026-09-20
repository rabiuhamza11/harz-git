# HARZ MESH TRANSPORT v0.1 — GATE 3 (Sep 20, 2026, ~23:55 WAT)

Owner's order: stop adding root functionality; prove the same signed state can
travel over a NON-ROOT transport. Audit first, then harness, then adapter only.

## WHAT WAS AUDITED (the owner's precondition)
- The frozen G1/G2 v2.1 protocol, deep-read at the source (commit 12b5991, unchanged):
  MeshCore.kt, MeshFrame.kt, EdgeId.kt, DedupCache.kt, StoreAndForward.kt,
  MeshProtocol.kt, TcpTransport.kt, SimulatedPhone.kt, SelfTest.kt
- The Sep 6 field report pulled into audit/g1-g2-field-test-protocol-and-report.md
- Wire format verified line by line: magic 0x48415A5A, type/src/dst/seq/ttl/hops/
  route/sig/payload/crc32, 4-byte length-prefix TCP framing, HELLO/HELLO_ACK
  registration, 900B chunks, 20ms pacing, TTL 0/1/2+ laws, dedup on (src,seq),
  store-and-forward hold/flush byte-identical.
- The Sep 6 sound-mesh JS harness files were LOST from all workspaces — what remains
  frozen and runnable is the Kotlin core + its SelfTest. That is what was run.

## G3-1 — EXISTING HARNESS, UNCHANGED
Kotlin core SelfTest on JVM (frozen compiled classes from the Sep 16 build):
20 passed, 0 failed — ALL PASS. Sections T1 (direct+ACK), T2 (multihop, route
[A,B], hops=1, ACK return), T2b (chunked reassembly 43/43), T3 (TTL 0/1/2+),
T4 (dup 3x → 1 delivery), T5 (outage: 20 held, byte-identical flush, store drained).
Full log: audit/G3-1-HARNESS-RUN.txt

## THE ADAPTER (the ONLY new thing)
mesh-frame.js — byte-exact JS twin of the frozen Kotlin MeshFrame (CRC32 over all
preceding bytes, same layout, same field laws).
mesh-core.js — JS twin of the frozen data plane: HELLO registration, dedup on
(src,seq), G2-C TTL semantics, hops+1 and route append, ACK return, store-and-forward.
zone-carrier.js — THE transport adapter: SIGNED ZONE → header+canonical bytes →
900B chunks → mesh packets → receiver reassembles by seq → canonical bytes recovered
→ Ed25519 verification vs the BAKED king → 77-name + height-1 floors → local
verified cache → Reach resolves .harz. Fail at ANY point = REFUSED, cache untouched.
mesh-phone.js — two-phone field wrapper (fetch / go / join / resolve / --corrupt).
reach-core.js — copied UNCHANGED from Reach v0.2 (the verification law is the same).

## INTEROP PROOF (the twin is not an imitation)
InteropDriver.java against the frozen Kotlin classes (kotlin-stdlib 1.9.23, JVM):
- Kotlin encodes a DATA frame → JS decodes all fields → JS re-encode is BYTE-IDENTICAL
  (Buffer.compare === 0, 329 bytes).
- JS encodes a routed frame (route [AAAA,BBBB], hops 1) → frozen Kotlin MeshFrame.decode
  decodes it perfectly → payload extracted BYTE-IDENTICAL (cmp exit 0).
Log: audit/INTEROP-RUN.txt

## GATE 3 BATTERY — 16/16 ALL PASS (real TCP sockets, live zone from the frozen root)
G3-2   A → B signed-book transfer (20 chunks / 17,558 bytes incl. header)
G3-3   B independently verifies the king signature (local WebCrypto Ed25519)
G3-4   digest/height/name-floor invariants (cac16833, height 1, 77 names)
G3-5   B resolves pay.harz → harzpay.harz.workers.dev
G3-6   unknown .harz stays honest NXDOMAIN
G3-R   receipt records transport mesh-live, node mesh:AAAA
G3-7   ONE BYTE corrupted inside the signature region mid-flight (frame CRC resealed
       so the transport saw a valid frame) → REFUSED: SIGNATURE FAILED, cache untouched.
       No warning. No best effort. Refused.
G3-8   foreign signed book — PROVEN validly signed BY ITS OWN KEY — → REJECTED:
       WRONG ANCHOR. A correct signature from the wrong king is worth nothing.
G3-AUTH THE LAW: a mesh node mints a NEW 78-name book with its own valid key → REFUSED.
       The phone can carry, cache, relay, verify — it cannot create authority.
G3-AUTH2 local cache tamper → SIGNATURE FAILED (the cache serves only verified state)
G3-9   duplicate packet (same src,seq x3) → delivered EXACTLY ONCE, deterministic
G3-10  mid-transfer link kill → frames HELD (15) → B reconnects → HELLO → flush →
       book completes byte-identical (digest cac16833…)
G3-11   exactly once at the application layer (appDeliveries = 1 after the flush)
G3-12   roots A/B both unreachable → the mesh-delivered verified book still serves
        .harz (transport mesh-live; roots ALL REFUSED in the same run)

## FIELD EXPERIMENT (owner's two-phone design — runbook: RUNBOOK-PHONES-MESH.md)
Commands proven end-to-end in the sandbox first (same files the phones will run):
fetch → go --push-to → join → "BOOK DELIVERED … INDEPENDENTLY VERIFIED, pay.harz →
harzpay"; attacker mode --corrupt → join → "REFUSED: SIGNATURE FAILED … cache
untouched: yes". Film B's screen for the field evidence. TRANSPORT = hotspot LAN
(the v0.1 ruling; BLE stays on the Edge APK track).

## HONEST LABELS
- Sandbox battery + interop = WORKBENCH EVIDENCE. The live-fire claim waits for the
  two-phone field run (same standing ruling as internetless v0.1).
- The Sep 6 sound-mesh JS harness is lost; the frozen Kotlin core is the protocol of
  record and it is what the harness ran and the interop driver proved against.
- One field hop in the runbook (A↔B direct). Multihop is battery+harness-proven, not
  field-proven. BLE/WiFi-Direct radio reality still the Edge APK track.
- Build bug found + fixed during this run: a synchronous Atomics.wait sleep blocked
  Node's event loop and silently starved all socket I/O — the transfer died with no
  error. Every sleep is now async. This bug would have hit the phones too.
- The frozen chain is untouched: root A/B serving v3.0/v2 zone (height 1, 77 names,
  king 90062faa), Reach v0.1/v0.2 unchanged, zero new infrastructure deployed.

The boundary crossed tonight (owner's words): internet endpoint → alternate endpoint
→ cached state → INDEPENDENT MESH TRANSPORT. The last is workbench-proven and
field-armed: two phones and 30 minutes earn the sentence.
