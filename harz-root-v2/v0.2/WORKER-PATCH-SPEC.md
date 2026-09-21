# ROOT v0.2 — WORKER PATCH SPEC (deploy at ceremony, not before)

Applies to BOTH nodes independently (root = Nuruddeen's deploy; node-b = witness seat's
deploy — independence is the point). Baseline pinned by the witness before any deploy:
digest cac16833, sha256 809a7baf, king 90062faa, height 1, 77 names, byte-identical mirrors.

## Changes to worker-v3.js → worker-v31.js

1. **/anchor** (NEW, JSON): the node's OWN pinned trust root, independent of zone content:
```json
{ "chain": "harz-root-v2",
  "king": "90062faa…",                       // pinned at deploy — NOT read from the zone
  "witnesses": ["54697e7f…", "a1348ed9…", "c2c6d6b9…"],
  "policy": "2-of-3",
  "height1_digest": "cac16833…",            // the pinned baseline
  "serving_height": 2,                      // after adoption; 1 before
  "authority": "ed25519:<successor>",       // the key that signs the SERVED zone
  "law": "rotation-v1.1",
  "note": "anchor pinned at deploy time by the node operator — independent assertion, not circular" }
```
2. **/pub** (NEW, text/plain): the single line `ed25519:<current authority pub>` — the key
   that signs the currently served zone. At height 1: the king. After rotation: the successor.
3. **Boot-verify law (the height-2 gate):** the worker embeds BOTH books (ZONE_V1BOOK at
   height 1, ZONE_V2BOOK at height 2) plus a WebCrypto port of rotation-law-v11's
   validateRotation (async subtle Ed25519, same refuse reasons). Serving rule:
   - If ZONE_V2BOOK passes validateRotation against the pinned world (king 90062faa,
     digest cac16833, witness seats, 77 names) → serve it, /anchor reports height 2.
   - If it fails for ANY reason → **fail-closed: keep serving height 1** and surface the
     refusal reason at /zone-digest. Never serve an unverified height 2.
   - Height-1 /zone bytes MUST remain byte-identical to today (sha256 809a7baf…) whenever
     height 1 is the served book — the witness's baseline check keeps working.
4. **Nothing else changes:** /zone, /resolve, /doh, /zone-v1, PWA, sw.js, /go/* stay as-is
   at height 1; at height 2 /zone serves the new book (records = 79: manifest + act + 77).

## Deployment order (ceremony day)
1. Ceremony completes → h2-signed.json public.
2. Nuruddeen verifies independently (kit verify + own law run) → deploys root.
3. Witness seat deploys node-b from the SAME public h2-signed.json, his own build.
4. Both boot-verify; both serve height 2 or neither does (a node that cannot verify keeps
   serving height 1 — honest, not broken).
5. Evidence battery: /zone byte-parity across nodes (new digest now), /anchor + /pub live,
   /resolve parity, honest NXDOMAIN, browser renders, offline kit verification with the new
   book, restart/death test, then freeze.
