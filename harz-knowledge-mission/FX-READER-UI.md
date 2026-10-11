# FX FULL-TEXT SEARCH IN THE READER UI (under "move on", Oct 11, 2026)

## Change (additive)

harz-offline-browser (a2) gained three NEW routes; the sealed reader
onefile, the gather gate, the queue, and the seal are UNTOUCHED:
1. /fx — lightweight full-text search page (2.4KB, mobile viewport,
   light theme), labeled "separate from the sealed 5K engine".
2. /fx-api — proxy to harz-fx-ingest via NEW service binding HARZ_FX
   (same-account; loop protection makes public-URL fetch impossible,
   service binding is the correct mechanism).
3. /fx-doc?id= — full document proxy.

Binding note disclosed: safe-deploy preserves bindings but cannot ADD
one, so this deploy used explicit metadata = existing KV HARZ_BROWSER
+ new service HARZ_FX. Post-deploy settings verified BOTH bindings
present.

## Verification

1. Bindings: kv HARZ_BROWSER + service HARZ_FX confirmed.
2. Gate still enforcing post-deploy (bypass probes 403).
3. Reader seal unchanged: 8344922-a44ceec55e61f3a4.
4. Queue intact: 4 sources.
5. /fx page: HTTP 200, label present.
6. Proxy: "global conflict" -> 1 result through the service binding.
7. LIVE BROWSER VERIFICATION (Browserbase): page loaded, query typed,
   result rendered with snippet highlighting and the honest label
   "LIVE · TRUSTED ECOSYSTEM SOURCE — RETRIEVED FULL TEXT, NOT
   VERIFIED FOR RELEVANCE". Screenshot captured.
8. Honest scope note: /fx-api response passes through the fx-ingest
   JSON as-is; the tier field is absent there (the page itself carries
   the labeling). FX tier remains isolated from the sealed 5K engine.

## Also recorded same evening

D1 phone capability probe receipt (harz-e1-core 80c3004): FTS5 works
on-device, 5,000 docs indexed 884ms, 2ms/query; probe score 1/20 is a
known rowid-mapping artifact, NOT a battery result; D1 phone gate
remains OPEN; 20K remains BLOCKED.

Rollback: redeploy fx-tier/ob-worker-pre-fx.js (worker-gated.js
in fx-tier/ is the pre-FX gate-v2 source).
