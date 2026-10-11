# HARZ CHAIN SUPPLY — INDEPENDENT LIVE CROSS-CHECK (2026-10-11, ~10:15 WAT)

Cross-check of the Stages 1-2 reconciliation (receipt row 148, parallel
ledger). All reads via harz-chain-v2.harz.workers.dev, read-only, no
changes made by this desk.

## VERIFIED LIVE (this desk's own reads)

1. /api/supply: max_supply null, current_supply 17,002,242,949.9958,
   remaining null, model "Ethereum-like (uncapped tail emission, 50
   HARZ/block)". CONFIRMS: the cap is NOT enforced by live software.
2. /api/status: v8.3.0, height 11,398,438, total_blocks 181,100
   (counter disagreement CONFIRMED: 181,100 vs height), wallets 197,
   tx 561, chain_id 7701, block_time "15s".
3. Active mining observed: blocks at 09:04:56-57 UTC to miner
   08028687857, 50 HARZ each, ~3 blocks in 1.12s (~2.7 blocks/sec —
   ~40x the documented 15s cadence; a second defect signal).
4. Owner wallet 08028687857 balance: 11,329,076,000.06 (grows in real
   time). Matches row 148's 11,329,075,400.06 modulo ongoing emissions.
5. NRL HRC-20 0xa56a8784...fce2a (Neural Protocol Token V2, HARZ
   Chain): total_supply EXACTLY 5,000,000, mint "disabled — fixed
   supply at genesis (V3 law)", owner 08028687857. The 5M canonical
   claim is NOW LIVE-VERIFIED (was previously standing ruling only).
   GDEG V2 HARZ Chain 0x9773... shows total_supply 10,000,000 —
   consistent with the 10M cap distinction.

## DESK RECOMMENDATIONS (owner rules; nothing executed)

Q1 uncapped + mining active: recommend ruling DEFECT-or-ratify. The
published record everywhere (Oct 1 verified tokenomics, listing kit,
exchange application trail, "21B hard cap, mining permanently closed")
contradicts live software. Default recommendation: enforce the
documented 21B cap; alternatively ratify tail emission explicitly and
correct every public claim BEFORE any listing. The one impermissible
state is claiming 21B hard cap while minting ~2.7 blocks/sec.

Q2 circulating definition: recommend wallet-sum 17.0B (timestamped
snapshot) as the interim display figure. Market convention counts AMM
pool liquidity as circulating, BUT 7.05B of the 11.05B pool-held HARZ
is not traceable to any documented event (row-148 gap 4) — include
pools only after that provenance reconciles. Every published figure
needs a timestamp label: the number moves every second while mining
runs. Owner-controlled wallet (11.33B = 66.6% of wallet-sum) should be
disclosed separately in any listing material.

Gaps 1-5 from row 148 remain OPEN and unaltered by this cross-check.
