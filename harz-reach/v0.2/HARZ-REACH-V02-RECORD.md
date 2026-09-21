# HARZ REACH v0.2 — ALTERNATE NODE (Sep 20, 2026, ~23:20 WAT)

Owner's order: alternate-node rung. Reach v0.1 FROZEN — its contract unchanged.
v0.2 only ADDS: two known nodes + the supplying node in every receipt. The king's
signature stays the authority. MANY NODES, ONE SIGNED BOOK, ONE KING, ONE STATE.

TOPOLOGY (both live tonight):
Node A — https://harz-root.harz.workers.dev (the frozen root v3.0, UNTOUCHED)
Node B — https://harz-root-b.harz.workers.dev (NEW: independent deployment, same
sealed canonical bytes, independent code, boot-verifies before answering, floors 77/1,
honest NXDOMAIN, RFC-8484 JSON DoH, PWA light. /proof = the browser-proof page.)
Node B is NOT an authority — it mirrors the sealed book. Zone content changes (kasuwa
target, hns delegation) ride the NEXT king signing at height 2, same as Node A.

OWNER'S 12 REQUIRED TESTS — all in reach-battery.js (17/17 total PASS, live network):
1. Node A fetch → verify → resolve pay.harz ✓ (live)
2. Node B fetch → verify → resolve pay.harz ✓ (live)
3. canonical bytes A/B IDENTICAL ✓ (17,461 bytes, byte-for-byte)
4. digest A/B identical == true digest cac16833 ✓
5. both sigs verify vs the BAKED king 90062faa ✓ (independent verifies)
6. Node A blocked → Reach attempts Node B ✓ (A entry unreachable, DNS-dead)
7. fallback automatic — no user action, no config ✓
8. pay.harz resolves via Node B ✓
9. receipt records the supplying node ✓ (node: https://harz-root-b...)
10. tampered zone at Node B → REJECTED (SIGNATURE FAILED, fail-closed) ✓
11. older valid /zone-v1 book → REJECTED as non-authoritative ✓
12. different transport locations, identical signed state → both accepted ✓
    (A and B ARE this test: two URLs, one 17,461-byte identical answer)

4-PHASE DEATH TEST:
D1 A alive → A resolution ✓
D2 A dead → B resolution ✓ (receipt: node B)
D3 A+B unreachable → cached verified book serves (re-verified from cache, node: cache) ✓
D4 A+B unreachable + cache cleared → HONEST FAILURE (REFUSED receipt, no endpoint,
   no authority fallback — "I don't know" stays "I don't know") ✓

INVARIANT TEST: every zone accepted anywhere in the battery = signed_by 90062faa,
true digest cac16833, 77 records, height 1. A foreign book cannot enter through any node.

BROWSER TEST (standing order — real browser, NOT data-URL proxy):
https://harz-root-b.harz.workers.dev/proof renders live: BOTH NODES SIGNATURE-VERIFIED
in-browser (WebCrypto Ed25519), canonical bytes A==B 17,461 identical, pay.harz →
harzpay, honest NXDOMAIN null, full receipt with both nodes recorded.
Node B landing renders: chain harz-root-v2, king 90062faa, height 1, 77 names.

HONEST LABELS (no overclaim):
- Node A "dead" in the battery = client-side block (unreachable entry). The frozen root
  stayed up and untouched. Actually killing A is the owner's real Phase-2 call, anytime:
  Reach is already proven to fall to B.
- The Chrome desktop field test remains PENDING — not silently marked passed. The
  DNR redirect is still the one field-only behavior. The /proof page proves the verify
  chain in a real browser, which is what a sandbox can honestly prove.
- Node B carries the same honest gaps as A: kasuwa.harz dead target (v1 carryover),
  no hns delegation — both ride the next king signing.
- data-URL browser testing BLOCKED by Chromium (opaque origin can't fetch) — /proof
  page on Node B used instead, which is the better evidence anyway.

FILES: reach-core.js v0.2 (v0.1 laws + fetchVerifiedZone + node in receipts),
reach.js v0.2 (door shows supplying node), manifest 0.2.0, battery 17/17,
node-b/worker.js (the alternate root). All sealed in HarzGit, read-back verified.
