# HARZ Edge Telecom — REBUILD (from the frozen protocol)

Rebuilt from scratch after the Sep 14 durability loss of the v2.1 sources
(~2000 lines Kotlin) and the frozen field APK (2.1.0-fieldready, md5 61c659bc).
Source of truth for this rebuild: the frozen G1/G2 protocol + the Sep 6
logic-layer validation report (HarzGit 770a225) and the gate definitions
embedded in the live harz-edge-telecom worker v4.0.2.

## Version
2.2.0-rebuild1 (candidate — NOT field-ready). The v2.1 number is retired with
its lost md5. A new freeze happens ONLY after the desk's independent harness
run passes, per the acceptance gate.

## Layout
- `core/` — pure-Kotlin data plane (JVM, no Android imports):
  MeshFrame (wire format), MeshCore (HELLO/dedup/TTL/hops/route/ACK/
  store-and-forward), EdgeId, DedupCache, StoreAndForward, TcpTransport,
  SimulatedPhone (CLI phone for the desk's harness), SelfTest (builder's
  20-check battery), DebugT5.
- `app/` — Android layer: WifiDirectManager (GO ServerSocket :8988),
  WifiAwareManager (G1-A probe; unavailable = finding), BleManager,
  RadioController (fallback chain), IdentityManager (Ed25519, keystore,
  non-extractable), CryptoManager (ChaCha20-Poly1305), MeshService,
  EdgeServer, TestMetricsCollector (raw CSV), MainActivity (light theme).

## Wire protocol
See PROTOCOL-WIRE.md for the exact byte layout the rebuilt core speaks.
Both the desk's harness and this rebuild derive from the same frozen spec:
HELLO magic 0x48415A5A + edge-ID registration, seq, TTL/hops/route, ACK
return, 900-byte chunks, 20 ms pacing, byte-identical store-and-forward.

## Builder's self-test result (Sep 14, sandbox, JDK 17 + Kotlin 2.0.20)
20/20 PASS — T1 direct (100/100 + 100/100 ACKs), T2 multi-hop (100/100,
route=[A,B], hops=1, 100/100 ACKs), T2b 38,478-byte chunked payload in
order, T3 TTL attack (0 no-forward / 1 stops at relay / 2 traverses),
T4 dedup (3x sent, once delivered), T5 outage (20 held, 20 flushed,
store drained). FROZEN RULE honored: no retransmit in the data plane.

## Acceptance path (the desk's gate, not mine)
The desk runs their harness (HarzGit row 17) independently against this
core over TCP. If it passes: new md5, new protocol version, source to
HarzGit same day, then the three-phone G1/G2 field test.

## Honest boundaries
- The Android layer is NOT compiled here (no Android SDK in the sandbox);
  the core IS compiled and self-tested on JVM.
- APK build + md5 freeze happen after the desk's pass, on a machine with
  the Android toolchain — freeze-time HarzGit commit, per the new discipline.
- Radio reality (G1) is only answerable on physical phones, internet OFF.
