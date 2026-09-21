# HARZ ROOT DOORS v2.2 — build report (Sep 15, 2026)

## What was built (owner order: "open on simple browser not setting" + "think of the way to open it on browser without setting")
Three doors on the LIVE production-signed root (harz-root.harz.workers.dev):

1. **Address door (P1/P2)** — /dns-query now answers A/AAAA in RFC-8484 wire format
   (what Chrome's Secure-DNS custom-provider setting actually speaks) AND in a
   human/browser JSON view (?name=X&type=A). The .harz name resolves to the real
   endpoint IPs (upstream-resolved via Cloudflare public DoH, 5-min isolate cache,
   host allowlist: workers.dev/base44.app/github.io/pages.dev/getly.store/gumroad.com).
   Reserved names (content.harz, dial.harz) return HONEST NXDOMAIN — no fabrication.
2. **Zero-setting doorway (P3)** — /go/<name>: 302 to the live endpoint from the
   signed zone. Works in ANY vanilla browser on Earth. No extension, no setting.
   Invalid/NXDOMAIN/reserved names get honest 400/404 pages.
3. **Law restored (P4a-d)** — fail-closed: 503 when zone sig invalid on data routes;
   /resolve: 400 invalid, 404 NXDOMAIN (the v2.1 regression was live again after
   the Sep-14 v2.3 deploy — fixed).

## Bugs found and fixed during the build (honest log)
- **P4c mis-target**: the "not in canonical zone" line-search hit the newly-inserted
  jsonView line instead of the /resolve line → JSON NXDOMAIN 500'd and /resolve
  NXDOMAIN stayed 200. Fixed in cfFixHarzRootDoors2 (F1/F2), re-verified.
- **Multipart tail**: the CF GET returns source wrapped in multipart; the trailing
  --boundary-- line is invalid JS ("Invalid left-hand side in prefix operation").
  CF rejected the first deploy (good defense-in-depth). Patcher now strips it.
- **SW cache leak (ECP-1 class)**: the embedded service worker cached EVERY GET
  cache-first, including /dns-query and /resolve — returning visitors would get
  stale answers forever. Fixed: data routes are network-only, cache name hr21→hr22.
- **JSON MIME**: browsers DOWNLOAD unknown MIME on navigation (application/dns-json)
  — human visitors saw nothing. Fixed with MIME negotiation: document navigations
  get application/json (renders inline), API clients keep application/dns-json.

## Verification battery (all live, Sep 15)
- A JSON: pay.harz → Status 0, [104.21.88.241, 172.67.187.66]; crm/estate/harz/wallet ✓
  (estate.harz resolves to its OWN distinct IPs — abuja-estate-city, not pay's IPs)
- Wire A (Chrome dialect): Status 0x8400, 1 answer, qname pay.harz, TTL 300, real rdata ✓
- TXT JSON + wire: unchanged ✓
- NXDOMAIN: 404 honest (json + /resolve) ✓; invalid: 400 ✓; non-.harz wire: REFUSED 5 ✓
- /go/pay → 302 → https://harzpay.harz.workers.dev ✓; /go/ghost → 404 ✓; /go/content → 404 ✓
- Zone: byte-identical e94b9693e94a2290... ✓ | Ed25519 VALID (production ZSK) ✓
- BROWSER TEST (vanilla Chrome, fresh context): root page renders (77 names, VALID);
  /dns-query?name=pay.harz&type=A renders the JSON answer with real IPs (screenshot);
  /go/pay lands on the live HARZ Pay page. All three doors browser-verified.

## Honest boundaries
- The TARGET's address comes from public DNS (1.1.1.1) — the .harz name is sovereign,
  the endpoint's IP is not (endpoints live on workers.dev etc. today).
- Wire A works for the Secure-DNS setting; typing bare "pay.harz" in an UNSET browser
  still needs the setting (or the /go door) — connect-layer cert wall remains the frontier.
- ADDR cache is per-isolate, 5 min — addresses can lag an endpoint's real IP change.

## Digests
- Live source sha256 after doors+fixes: 4ce0d0f2ee3e93b5897cd5a2afe11c8dbbef749f767db63597c4ed2b59246a0f (42,836 + P5/P6 → 43,234 bytes)
- Zone digest unchanged: e94b9693e94a2290... (pin)
- Rebuild recipe: cfPatchHarzRootDoors.ts → cfFixHarzRootDoors2.ts → cfPatchHarzRootDoors3.ts
  (all in this folder; they fetch live source, patch by anchors, deploy — no secrets inside)
