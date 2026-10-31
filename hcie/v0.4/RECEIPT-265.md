# RECEIPT 265 — GATE 3 transport artifact built (two-phone run NOT yet executed)
Date: 2026-10-31 16:2x (Aisha)

## What was built
harz-hcie v0.4.0 → single self-verifying bundle file:
  GET /api/hcie/bundle.html?n=10        (renders inline)
  GET /api/hcie/bundle.html?n=10&dl=1   (downloads as harz-gate3-bundle.html)

Properties verified:
- 10 objects, 92,753 bytes of document text, 100,346 byte file
- zero external references (no src=http, no href=http) → opens and works with no network
- pure-JS SHA-256 (UTF-8 byte level, TextEncoder based) so verification works on file:// where WebCrypto is unavailable
- bundle embeds manifest (id, source, version, sha256, bytes, captured) + full document text
- refuses and labels REJECTED any object whose recomputed hash differs

## Evidence collected
1. In-node independent check of the bundled implementation against the same 10 documents: 10/10 verified (sha_check.js, output "IN-BUNDLE JS SHA256: 10/10 verified").
2. Python hashlib cross-check of payload hashes: match.
3. Real browser render (browserbase): page shows "10/10 VERIFIED · 92,753 bytes", each object listed VERIFIED, and "Open first object" renders the stored text inline.

## Defect found and fixed during build
First SHA implementation was ASCII-only; it returned '' for any document containing non-ASCII characters (dailytrust and guardian failed 7/10). Replaced with UTF-8 byte-level SHA-256. Would have silently broken on real Nigerian news pages.

## HONEST STATUS
- Artifact: BUILT and browser-verified.
- Two-phone transfer: NOT EXECUTED. No phone-to-phone run has happened.
- Gate 3 acceptance table (10 selected / 10 transferred / 10 hash-verified / 10 offline-read / zero internet / zero corrupted accepted / zero missing advertised): UNFILLED.
- Oct 25 two-phone failure: REMAINS OPEN.

## Runbook handed to owner
On Phone A (online): open bundle URL with &dl=1, save file. Both phones: mobile data off, Wi-Fi off (or local hotspot only). Transfer the single HTML file by any local means (Wi-Fi Direct share, Xender local mode, USB, Bluetooth). On Phone B: open the received file in the browser. Expected: "10/10 VERIFIED"; mismatched objects would show REJECTED and would not open. Then airplane mode and reopen the same file.
