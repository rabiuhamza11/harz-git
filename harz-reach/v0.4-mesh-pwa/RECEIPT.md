# RECEIPT — HARZ Mesh PWA + Voice (Gate 3, Track A browser path) — Oct 18, 2026

## Owner directives served
- Oct 18 ~10:51: "You know I hate Termux. Please build PWA link." → no Termux, thumbs only.
- Oct 18 ~10:55: strategic roadmap — seal Internetless v2 (done); next = HARZ Edge + Mesh Telecom TRACK A (two-phone, internet-disabled); queuing/reconnection after; Track B radio later; AI after; paying customer alongside.
- Oct 18 ~13:54: "We move to harz telecom. I need my voice to move from one phone to another on harz." → VOICE added over the frozen wire.

## What it is
- harz-reach/v0.4-mesh-pwa/index.html — self-contained page (QR gen + jsQR + BarcodeDetector + frozen data plane + VoiceCarrier inlined, 375KB), served FREE on GitHub Pages (rabiuhamza11.github.io). No Termux, no typing, no app install.
- Data plane: BYTE-EXACT browser twin of the frozen G1/G2 v2.1 frames (magic 0x48415A5A, seq, TTL/hops/route, ACK, 900B chunks, 20ms pacing, CRC32). Verified against the frozen Termux twin as ORACLE.
- Voice: MediaRecorder (opus/webm) on A → bytes → VoiceCarrier (start/chunks/end control frames) → same frozen DATA frames, same ACKs, same CRC. B reassembles, checks byte count, plays via Audio. Incomplete transfer = REFUSED, no playback.
- Transport: LAN WebRTC DataChannel over the hotspot (browsers cannot open listening TCP sockets — honest deviation from "LAN TCP" label; UI verdicts label it "mesh-live over LAN WebRTC"). QR codes carry the WebRTC handshake (camera scan, vibrate per code).
- Ed25519 book verification via WebCrypto on the receiving phone. THE LAW kept: the mesh carries authority, it never creates it. REFUSED means refused.

## Evidence
1. Node battery (battery-node.mjs): 21/21 PASS — incl. byte-identity of frames vs frozen twin, real book verify (height 2, 77 names), 21-chunk delivery 21/21 ACKs, DEATH TEST refusal, corruptHook timing-safe at pre-registration (BUG FOUND AND FIXED), VOICE round-trip (14 chunks byte-exact, all ACKed), incomplete-voice REFUSED.
2. Live browser self-test on the Pages URL (?selftest=1): 12/12 ALL PASS — frame round-trip, king sig verified, QR channel lossless (4 parts), book over REAL WebRTC loopback 21 chunks/21 ACKs verified, DEATH TEST over the live channel (chunk 20 flipped → REFUSED: SIGNATURE FAILED, fail-closed, cache untouched), VOICE over the live channel (14 chunks, 12000 bytes, 3.0s, bytes recovered intact). Screenshots sealed to owner Oct 18 (S4/S5 + S6).

## URL (free, first-party, https)
https://rabiuhamza11.github.io/harz-git/harz-reach/v0.4-mesh-pwa/index.html

## Honest boundaries
- The live WebRTC loopback proves the full data plane + voice carrier + death test in Chrome; the PHYSICAL two-phone mic→speaker run over the hotspot remains the field test (owner devices).
- Store-and-forward/queuing proof (Track A items 3+4) NOT yet in the PWA — frozen core has it (JVM T5: hold/flush/drained); PWA demo is next after the basic transfer + voice passes.
- Track B (Wi-Fi Direct/BLE APK) untouched, per order.
- GitHub Pages origin: page must be loaded once online, tab kept open for the offline run.
- Autoplay policy: B may need a tap on REPLAY THE VOICE if the browser blocks auto-play.

## v0.6 (Oct 18, 14:31) — owner asked: why the scan camera + simplify
- Camera = the phone-to-phone introduction. With zero internet and zero servers there is no other channel between two browsers on separate phones; the QR pictures carry the WebRTC handshake, after which the phones talk directly over the hotspot. Now explained on the screen itself.
- gzip+base64 handshake compression (CompressionStream, H0 fallback): pairing codes cut from ~4-6 per side to typically 1-2 (selftest S7: 2464B→135B on the synthetic sample).
- Plain-language buttons: START THE MESH / SCAN PHONE A'S CODES / SCAN PHONE B'S REPLY, plus on-card explanation lines.
- FIELD BUG FIXED pre-run: A was showing the raw SDP while B parsed it as JSON — the very first scan would have failed. Both sides now send JSON{type,sdp} compressed.
- Selftest: 13/13 ALL PASS (S1-S7 incl. compression round-trip, live book, death test, voice over live channel).

## v0.7 (Oct 18, 15:01) — owner: "redesign it without camera"
- CAMERA AND ALL QR CODE REMOVED. Page 377KB → 62KB. Only permission left: microphone (for voice).
- New pairing (one-time, online): the phones introduce each other through the FROZEN HARZ Edge Telecom registry (v5.4.0 /api/msg + /api/inbox store-and-forward, 400-char parts, gzip-compressed handshake, sid-grouped reassembly). Reuses Dad's own foundation per his Oct 18 directive ("we should not discard this work").
- Then the internet is KILLED (A data OFF): connection establishment, book push, king signature verify, death test, and voice are all pure LAN WebRTC over the hotspot. Honest label on screen and in verdicts.
- Selftest v0.7 live: ALL PASS — S1 frames, S2 book, S7 compression, S4 loopback book 21/21 acks, S5 death test refused, S6 voice byte-exact, S8+S8b LIVE registry round-trip A→B and B→A byte-exact against the real worker.
- Known cosmetic: selftest RESULT line prints before async S8/S8b complete (they PASS seconds after).
- Field sequence: both online → A fetch book → A hotspot ON + data ON, B joins hotspot → A PREPARE, B PREPARE → both PAIRED → A data OFF → A CONNECT → book lands, then voice. Death test same, with mode checked before CONNECT.
