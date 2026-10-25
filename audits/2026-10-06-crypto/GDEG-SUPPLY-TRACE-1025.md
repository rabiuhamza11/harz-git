# GDEG 10M SUPPLY — COMPLETE ON-CHAIN TRACE (Nuruddeen, Oct 25 2026 ~09:1x WAT)
# Method: free sources only (polygon.drpc.org current state + Polygonscan public pages). NO archive key needed.
# Supersedes the forensics seat's "one unknown wallet" finding — the route is fully decomposed.

## THE COMPLETE ROUTE (tx-verified)

1. Aug 14 2026: 10,000,000 GDEG minted (block 91,951,509) -> deployer 0xCA28482979D463225ad33f1b70FcE5F89C7E8537
2. Aug 14: deployer -> QuickSwap pair 0xb9658A00F69508f53b50Aa88Ff2b6912fd206ea8: 5,000,000 GDEG
   (liquidity add; reserves now 5 WPOL : 5M GDEG; LP totalSupply 5,000 — 100% held by
   0x608110Ca7CDCe4D0ec92416C2CD73218B935aaC1 = HARZ treasury, documented in HARZSwap v6.0.12
   source as "Rabiu's own wallet". This 5M is owner-recoverable via removeLiquidity.)
3. Aug 14: deployer -> pair: another 5,000,000 GDEG (raw transfer, NO liquidity — became
   unaccounted excess inside the pair contract)
4. Aug 14 03:27 PM UTC (block 92,010,802, tx 0x7ef913b97e11d5d21d4a419c265313a9e941598b0b29f754526abac0a2b67eb5):
   wallet 0x111F183B5DB6D76f5564Faa86A7DEED4c2BdE28a called skim() on the pair and extracted
   the 5,000,000 excess GDEG (+0 WPOL) to itself. Fresh EOA, unknown to all HARZ records,
   zero movement since. It paid 0.0025 POL gas and holds the 5M to this day.

## CURRENT STATE (verified live today)
- totalSupply: exactly 10,000,000 (nothing burned)
- GDEG holders in the world: exactly 2
  1. QuickSwap pair 0xb9658A00…: 5,000,000 (50%) — LP 100% = HARZ treasury 0x608110Ca (owner side)
  2. 0x111F183B5DB6D76f5564Faa86A7DEED4c2BdE28a: 5,000,000 (50%) — UNKNOWN, holds since Aug 14
- deployer balance: 0. Delegation grantee balance: 0.

## EIP-7702 DELEGATION (independently extracted from live chain)
- deployer code = 0xef0100ed277e2f451d4884ac3f77ef7c3a8dcf483da5d8
- FULL grantee: 0xEd277e2f451d4884ac3f77ef7c3a8dcf483da5d8 (vault had only the truncated form)
- delegation LIVE as of Oct 25. Grantee holds 0 GDEG / 0 LP today.

## OPEN RULING (owner only)
Does Rabiu recognize 0x111F183B…935aaC1 as his own wallet?
- YES -> supply fully accounted: 5M pool (his LP) + 5M cold wallet. Close the incident.
- NO  -> half the supply was extracted Aug 14 via the compromised deployer path (dump-to-pool +
  skim to fresh EOA). The pattern reads as extraction laundering. Actions then: identity ruling
  on 0x222a10, display correction (0-circulating is now known-inaccurate: 10M minted, 10M exist),
  and the delegation incident record (Sept 2) becomes the root-cause candidate.

## ALSO VERIFIED THIS TURN
- harz-crypto-wallet.harz.workers.dev: 200, Wallet v4 rendering (browser + curl)
- harz-swap.harz.workers.dev: 200, HARZSwap serving
- Etherscan v2 API requires a key; Polygonscan web + drpc sufficed for this entire trace.

## CLOSURE (Oct 25, ~09:0x WAT, owner word)
Owner reiterated: the delegation-wallet matter is CLOSED (ruled Oct 2-6: old path written off, treasury 0x608110Ca confirmed owner-owned, re-issue-on-clean-contracts strategy stands). This trace stands as HISTORICAL RECORD ONLY. No further old-path wallet forensics; 0x111F183B is part of the written-off path.
