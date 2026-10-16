# HARZSwap v6.0.12 — L1 POOLS WIRED INTO EVERY SURFACE (Oct 16, ~08:2x WAT)
Owner: "Wire it. We can't continue fixing things before getting results.
Fix well, I don't want future excuses."

## Root cause found (worse than reported)
The swap UI's loadPools() calls /api/amm/pools on ITS OWN ORIGIN — a route
that DID NOT EXIST on harz-swap v6.0.11. The UI silently rendered
"No pools yet" forever. The app's own market display was dead, not just
the /api/pools listing gap reported to the owner.

## Fix (deployment 03173ef6, bindings preserved: CHAIN->harz-chain-v2, PRICE_KV)
1. /api/amm/pools ROUTE ADDED: returns the L1 AMM pools (live via CHAIN
   service binding, last-good memory + KV fallback, staleMs marking) in
   exactly the shape the UI renders (pool_id, reserves, price_harz_per_token).
2. /api/pools ENRICHED: now returns 6 pools — the 3 Polygon external/bridge
   venues + the 3 L1 AMM pools (GDEG/HARZ, NRL/HARZ, NDT/HARZ) with
   price_ngn_per_token, tvl book values, and the honest book-value caveat
   (L1 USD/NGN totals are BOOK VALUE via the HARZ oracle — realizable cash
   for size is a fraction of book). The stale "No internal/synthetic pools
   exist" honesty string replaced with the two-venue truth.

## Verified live (curl + real browser, screenshot in chat record)
- /api/amm/pools: success:true, pools GDEG/HARZ 1,353.74 HARZ/GDEG live.
- /api/pools: 6 pools; GDEG/HARZ NGN 19,410.32; NRL/HARZ NGN 24,660.47.
- App UI: "ONLINE · LIVE DATA" pill, LIVE badge, all 3 L1 pools rendered
  with reserves + rates; swap/add/remove selectors populated.
- node --check passed pre-deploy; no other routes touched; offline contract
  paths (SW cache, localStorage poolcache, honest labels) untouched.
- Pricing law intact: no price policy anywhere; the market dictates.

## Rollback
harz-swap-pre-v6.0.12.js would be the pre-patch source (retrievable from
deployment 03173ef6's predecessor via the API); current source committed
here as harz-swap-v6.0.12-l1-wired.js.

## THREE-WAY AUDIT + VERSION HONESTY FIX (Oct 16, ~08:3x WAT)
Owner order: "Audit harzswap, harz wallet and harz exchange."

AUDIT FINDINGS:
- HARZSwap: one defect — self-reported "6.0.11" in 3 places after the
  v6.0.12 route fix (version honesty). FIXED: bumped, redeployed,
  /api/status now reports 6.0.12; amm pools route re-verified live.
- HARZ Exchange (v6.1): PASS — /api/prices serves market-dictated L1
  pool prices (GDEG ₦19,377.90, NRL ₦24,619.29 at audit time); all
  routes its UI calls EXIST (/api/ngn, /api/p2p/offers, /api/prices —
  no missing-route disease); honest LIVE/CACHED/OFFLINE badges; PWA
  (SW+manifest); real-browser load verified, ONLINE·LIVE pill.
- HARZ Wallet (GitHub page harz-wallet.html, July-era): light theme,
  live GDEG price from swap /api/prices (market, post-wiring), balance
  via harzpay /balance (11.33B HARZ phone wallet, frozen height
  11,414,151). DEFECTS: no manifest/SW (5-check PWA fail — predates the
  Universal App Contract), no honest data labels, no offline shell.
  Needs the contract treatment as a separate release (owner ruling).
