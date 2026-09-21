# HARZ ROOT RECEIVER v1.0 — the holder's door of the QR rail (Sep 15, 2026)

## What it is
The receiving end of the out-of-band namespace transfer — the piece the QR rail never had:
a holder-facing PWA that takes the 26-46 paper QR chunks with a CAMERA (or paste mode on
desktop), verifies them against the out-of-band trust bundle, and loads the zone into an
offline in-memory resolver. Before this, only the operator-side code existed; a holder had
no tool. TT-7 (QR chain transfer) and every disaster-recovery story needed this door.

LIVE: https://harz-root-receive.harz.workers.dev (worker "harz-root-receive", same CF
account as harz-root; the live root worker itself is UNTOUCHED — v1 zone e94b9693 intact).

## The laws it enforces (fail-closed everywhere)
1. ANCHOR LAW — the zone must be signed by the pinned anchor pub hex. Wrong anchor → REFUSED.
   No anchor pinned → REFUSED (out-of-band trust is not optional).
2. SIGNATURE LAW — WebCrypto Ed25519 over canonical bytes. Tampered content + old sig →
   SIGNATURE FAILED → REFUSED. Browser without Ed25519 support → REFUSED (never a guess).
3. SHRINK LAW — records < pinned floor → REFUSED (valid sig, malicious authority suspected).
4. ROLLBACK LAW — zone height < pinned floor → REFUSED (replayed old zone).
5. COMPLETENESS LAW — missing chunks → INCOMPLETE → REFUSED. Duplicates are safe (dedup).
6. HONEST LABELS — no floors pinned = guards OFF, labeled on screen. Single-zone receiver:
   chain/succession verification is operator-side (ceremony kit). NXDOMAIN is honest absence.
7. PWA + light theme (#f0f2f5) + offline shell SW (installed BEFORE the disaster; after
   install the receiver itself needs no network to run — scan → verify → resolve offline).

## Browser verification (live URL, Sep 15 — three-level audit completed)
Deep audit: source review + deploy gate PASS (caught a real gap: no SW registration call —
fixed before deploy). Test: /, /manifest.json, /sw.js, /icon.svg, /health all 200, health
JSON real. BROWSER TEST (live UI, real interactions):
B1 UI renders all panels (light theme) PASS
B2 paste-mode ingest 3/3 chunks, dedup safe, counter honest PASS
B3 valid test-key zone + anchor + floors (h=10, r=5) → LOADED ✓ 5 names PASS
B4 resolve t1 → FOUND, honest PENDING identity flagged, endpoints real PASS
B5 destructive tamper (broken bytes) → REFUSED at parse PASS
B6 SUBTLE tamper: valid JSON, one service changed "s1"→"EVIL", original signature kept →
   REFUSED — SIGNATURE FAILED. The signature law caught what structure could not. PASS
Screenshot archived in session evidence. TEST KEYS ONLY (in-memory, thrown away);
no production material touched.

## Honest boundaries
- Camera path (BarcodeDetector) is reviewed but not camera-tested — desktop browser has no
  camera loop here; paste mode is the honest fallback built in for exactly this. True camera
  test = Rabiu's Infinix pointing at the printed chunk QR (Android Chrome has BarcodeDetector).
- Single-zone receiver: after a succession, holders whose anchor is K0-only will refuse the
  successor zone BY DESIGN (fail-closed); the runbook's answer is the zone CHAIN via the
  operator kit (verify-chain). v2 upgrade path if ever needed.
- The receiver must be INSTALLED (or at least visited once for SW cache) BEFORE any disaster
  that kills the substrate — that is runbook discipline, recorded in the ceremony docs.

## Files
worker.js — the complete worker (HTML app + manifest + SW + icon inline, zero other assets)
Deployed via cfDeployHarzRootReceive backend function (PUT, multipart, module format).
New-worker note: workers.dev route ships DISABLED by default on fresh CF scripts — had to
POST subdomain enablement (cfEnableReceiveSubdomain). Recorded so future deploys expect it.
