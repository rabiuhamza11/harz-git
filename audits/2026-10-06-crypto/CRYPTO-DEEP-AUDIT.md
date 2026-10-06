# CRYPTO SECTION DEEP AUDIT — Oct 6, 2026, 06:25 WAT (Magani, own runs, browser-verified)

Method: live API probes (my curl/RPC), Polygonscan in real browser, UI browser tests. No key handling.

## Healthy (verified live)
- HARZ Chain v8.3.0 /api/status: live, tip h11,368,811. TIP BLOCK HASH-LINKS VERIFIED INTACT 4/4
  by my own RPC walk (the Oct 2 broken-links scar does NOT extend to the current tip).
- HARZSwap v6.0.10: pools = REAL on-chain reads only (QuickSwap V3 HARZ/WPOL 0x8A34, V2 GDEG
  0xb965, V2 NRL 0x30D6). /api/swap correctly refuses server-side execution (device-key signed
  on-chain only). Honesty line holds: "no internal/synthetic pools exist" — on the SWAP side.
- HARZ Exchange v6.1: prices market-derived (owner law), NGN 1,331 live FX, UI renders.
- HARZ Wallet v3.3 Honest Registry: browser-verified render; keys generated+encrypted client-side
  (PBKDF2-150k + AES-256-GCM), server stores public addresses only. PWA compliant.
- GDEG V2 supply INTACT: 10,000,000 max total on Polygonscan (post-burn verified). All 6 crypto
  workers pass PWA manifest+SW sweep.

## FINDING 1 — CRITICAL MISLABEL: attacker wallet labeled "HARZ treasury wallet"
harz-swap /api/pools LP section labels 0x608110Ca7CDCe4D0ec92416C2CD73218B935aaC1 (100% LP holder
of GDEG/WPOL and NRL/WPOL pools, claim 5M GDEG + 5M NRL + WPOL) as "the LP position of the HARZ
treasury wallet". POLYGONSCAN-VERIFIED: that wallet is the Sep 16 attacker bot — funded by
"RAILGUN: Relay Adapt" 54 days ago, 465 txs of nonstop Multicall3 aggregate loops (latest 11 hrs
ago), holds $30.99 across 38 looted tokens. The LP belongs to the attacker, NOT the treasury.
The swap UI tells the owner his treasury still owns what was stolen. FIX: relabel honestly.

## FINDING 2 — FICTIONAL L1 PRICES presented as market (exchange)
Exchange /api/prices: GDEG ₦21,958.95, NRL ₦27,898.47, both "stale: false, source: market".
Derivation is CIRCULAR: L1 AMM pools (HARZ Chain internal, wrapped contracts 0x9773 GDEG /
0xa56a NRL on chain-id 7701) price GDEG at 1,353 HARZ; HARZ itself is priced from the Polygon
HARZ/WPOL pool whose ENTIRE real depth is $16.22. Real Polygon market: GDEG ≈ 1M per WPOL
(pool depth $1.09). The exchange figure overstates real GDEG value by ~60 million x. Technically
sourced, economically fictional. The chain-internal AMM (11.2B HARZ TVL claims) is a closed book
unconnected to the real tokens. FIX: label internal AMM prices as L1-internal, or bridge real supply.

## FINDING 3 — EIP-7702 DELEGATION ACTIVE on deployer wallet 0xCA28...
Deployer (funded by Binance 53, 55d ago): 0 POL, $0.02 in 2 tokens, last activity 49d ago —
but carries a LIVE EIP-7702 authority delegation to 0xEd277e2F...F483da5D8 (no HARZ record
identifies this address). If not ours: wallet is under persistent external control — anything
sent to it is gone. Exposure today: $0.02. The "EIP-7702 Wallet Security Monitor" workflow
exists but is INACTIVE. RULING NEEDED: is 0xEd27... known to the owner?

## FINDING 4 — chain counters do not reconcile
height 11,368,811 vs total_blocks 181,100 vs supply 17,000,759,499 at 50/block vs block_time 15s.
No pair reconciles: height implies 5.4 years at 4/min (chain is ~7 weeks old); supply implies 340M
blocks; total_blocks implies 9M HARZ. Height/supply are cosmetic counters on a Worker+D1 ledger,
uncapped emission. Block storage is a rolling window (~500K-1M deep; tip-1M null, genesis null).

## FINDING 5 — honest economic size
Real tradable depth of the entire crypto section on Polygon: HARZ $16.22 + GDEG $1.09 +
NRL $1.09 ≈ $18.40 total. GDEG V2 holders: 2 (pool + one other). Marketing language must not
imply otherwise. Version drift cosmetic: /health 8.2.8 vs /api/status 8.3.0.
