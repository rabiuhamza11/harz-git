# RULING PACKAGE: GDEG CONTRACT IDENTITY 0x222a10 (Oct 14 — for Rabiu's ruling)

## The address and its significance
0x222a10CE822188c680a04A283E45F9c11D79665e is the Polygon contract
displayed across HARZ production workers as "GDEG V2 (Polygon Mainnet)"
— it is the address the market associates with GDEG, and per the
Sep 2 finding its provenance is UNRECOGNIZED (internally labeled
"Enemy V2": a contract nobody in HARZ can prove deploying).

## Evidence (owner-audited Oct 11 + re-verified live Oct 14)
1. 0x222a10CE... — dual-RPC re-verified TODAY (polygon.drpc.org +
   1rpc.io/matic, both agree): totalSupply = 10,000,000 GDEG exactly
   (matches the Oct 11 owner ground-truth audit: 10M minted, 5M sold,
   5M pooled, LIVE market activity).
2. 0x93d400... — the CANONICAL V2 per your own ground-truth audit
   (Oct 11 morning): 0 minted. Full address exists only in your audit
   record — I hold the truncated form; on ruling A you confirm the
   full address and I verify it on-chain before touching anything.
3. Display state (verified live Oct 14): gdeg-web shows 0x222a10 with
   the honest note "identity under review" — the display correction
   deployed Oct 11 (rollback artifact 92df557d preserved). No burn
   claims remain. Row 7 (98,999,000) labeled HISTORICAL V1 SEED DATA.
4. Context: the compromised CA28 deployer wallet owns the Polygon
   GDEG/NRL contracts; the mint leg is BLOCKED pending ownership move
   to a safe signer (0x7e4b or your MetaMask).

## Your options (ruling needed — one line; your own "no silent
substitution" rule governs)
A) "0x93d400 is GDEG V2": I execute the staged swap (production
   workers + profile repoint; 0x222a10 labeled unrecognized) PLUS you
   pick holder remediation for the 5M sold tokens: (i) honor via
   re-issue on canonical, (ii) buyback, (iii) void with notice.
B) "0x222a10 is GDEG V2": accept the unrecognized contract as fact;
   canonical records amended; your "0 minted canonical" finding is
   retired as a naming conflict.
C) "Identity unresolved, keep flagged": status quo; the under-review
   flag stays; no swap.

## Recommendation
A with remediation sub-ruling (i) or (ii) — leaving an unrecognized
contract as the live GDEG market is the highest-risk standing state,
and 5M sold tokens are real money that a swap cannot silently erase.

RULING FORMAT: "A, remediation (i)" — or B / C.
