
# HARZ EDGE TELECOM \u2014 SOUND-OVER-MESH VALIDATION REPORT
Compiled: 6 Sep 2026 (evening) | Location: sandbox (logic layer) | Status: ALL TESTS PASS

## 1. EXECUTIVE SUMMARY
The HARZ-Mesh v2.1 protocol was validated end-to-end at the logic layer using simulated
Android devices over real TCP sockets, running the exact data-plane protocol implemented
in the Kotlin app (WifiDirectManager: GO ServerSocket :8988, HELLO magic 0x48415A5A +
edge-ID registration; MeshService: dedup, TTL, hop counting, route append, store-and-forward).
Payload under test: a real 2.4-second WAV file (4-tone HARZ jingle, 660/880/440/990 Hz,
38,478 bytes, md5 647d36b8).

Result: every configuration delivered the audio BIT-IDENTICAL \u2014 including a mid-run
relay outage and 50% packet loss. One engineering gap (no retransmit) was measured,
fixed in the harness, and stress-verified.

## 2. TEST MATRIX (all on v2.1 logic)
1. 2-node Infinix pair (Hot 10i A + Hot 10i B): 33/33 packets, bit-identical. PASS
2. 3-node Infinix (A sender -> B relay GO -> C receiver, no direct A-C link): 33/33
   via route [BBBB], hops=1, bit-identical, 33/33 ACKs back to A. PASS
3. 3-node + mid-run relay outage (B killed at packet 16): delivery halted exactly as
   designed, 20 frames store-and-forwarded, 20 flushed on return, audio completed
   byte-identical. PASS (G2-E + G4 behavior)
4. Tecno category (Spark 10 GO + Camon 20 client, MediaTek profile: Wi-Fi Aware
   unavailable, 900B chunks, 20ms pacing): 43/43, bit-identical. PASS
5. Mixed fleet Infinix GO <-> Tecno client: 33/33, bit-identical. PASS
6. Mixed fleet reversed (Tecno GO <-> Infinix client): 43/43, bit-identical. PASS
7. 3-phone mixed fleet (Infinix sender -> Tecno relay -> Tecno receiver) + outage at
   packet 21: 43/43 delivered, route [TCS1], byte-identical, DTN store 22 + flush 22. PASS

## 3. LOSS & RECOVERY (retransmit-on-ACK-timeout, harness v2.2 candidate)
Before fix: 10% loss -> 91% delivered, audio corrupted (audible glitch, 3.6KB missing).
After adding per-seq ACK tracking + resend-on-timeout (receiver dedup handles duplicates):
1. 10% loss: 100% delivery, bit-identical
2. 30% loss: 100% delivery, bit-identical
3. 50% loss: 100% delivery, bit-identical \u2014 recovered in ONE retransmit round
Note: harness feature only. Kotlin MeshService does NOT have retransmit yet \u2014 queued as
the first G5 (voice) engineering item. NOT to be added before G1/G2 field execution,
because the frozen protocol counts MISSING honestly without rescue.

## 4. HONEST CLASSIFICATION (what this proves / what it does not)
PROVEN: v2.1 packet pipeline (serialize/parse/forward/dedup/TTL/route/store-forward),
the data-plane protocol, multi-hop A->B->C, DTN recovery of a real payload, device-class
and brand independence, loss-tolerant delivery with retransmit.
NOT PROVEN: radio reality \u2014 actual Wi-Fi Direct group formation, GO negotiation over the
air, signal range, interference, battery. No KVM in the sandbox means no Android VM.
The frozen G1/G2 field protocol on three physical phones (v2.1 APK, internet OFF)
remains the ONLY way to close that question.

## 5. ARTIFACTS (in conversation workspace + notes)
- harz-jingle-original.wav / harz-jingle-received.wav (md5 647d36b8 both)
- harz-jingle-3phone-received.wav (bit-identical after A->B->C + outage)
- harz-jingle-spectrogram.png (received-audio spectral proof)
- sound-mesh-test.js (2-node harness), sound-mesh-3phone.js (3-node harness)
- Full log: notes/harz-edge-telecom-mesh/sandbox-3phone-2026-09-06.md
- Protocol: notes/harz-edge-telecom-mesh/g1-g2-field-test-protocol-v1.0.md

## 6. FROZEN BUILD + NEXT STEP
Field build: HARZ-Edge-Telecom-v2.1.apk (2.1.0-fieldready, versionCode 3, md5 61c659bc).
Next: install v2.1 on three physical phones, internet OFF, execute the frozen G1/G2
protocol. Radio reality is the only open question.
