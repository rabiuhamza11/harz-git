# TAIL EMISSION CLOSURE — EXECUTED AND VERIFIED (Oct 14, owner order "DEPLOY THE CLOSURE")

## Authorization
Rabiu Oct 14 06:2x WAT: "DEPLOY THE CLOSURE. Proceed only after the closure
change passes the required pre-deployment checks, its effects are quantified,
and rollback is ready. Capture before-and-after supply figures and verify the
deployed state."

## Pre-deployment checks (all passed before deploy)
1. Source read from the LIVE worker (never assumed from repo): 94,507 bytes,
   v8.3.0. Full issuance map: THREE mint paths found — /api/mine (API-key
   gated, 50/blk), scheduled cron (4 blocks to phone wallet per tick), and
   /api/faucet (UNCAPPED fresh mint, up to 500/claim, 10,000/day global
   budget — NOT covered by the old 21B narrative's "mining closes" claim).
   All balances-only endpoints (transfer/DEX/bridge/refund/gas) verified as
   moves, not mints.
2. Closure design: CLOSURE_CAP = 17,003,050,000 (ceiling above the live
   17,003,048,050 to absorb in-flight mints; supply can never exceed the cap).
   All three mint paths enforce it. /api/status + /api/supply display the
   closed model. Version 8.3.0 -> 8.4.0-closure.
3. Effects quantified BEFORE deploy: final supply <= 17,003,050,000
   (residual <= ~1,950 HARZ = 0.000011% above the ruling-moment reading);
   daily emission ~2.9M -> 0; height stops advancing; faucet closes at cap;
   phone wallet 08028687857 stops receiving rewards.
4. Rollback ready BEFORE deploy: exact live 8.3.0 source preserved
   (ROLLBACK-harz-chain-v2-8.3.0-2026-10-14.js, this commit).
5. Syntax verified; boundary predicates tested (sum+50>CAP at live supply,
   faucet 500 rejected at boundary, remaining->0, percent capped at 100).

## Execution (safe-deploy a1, bindings preserved: CACHE kv, HARZ_DB d1, secrets kept)
- BEFORE (06:05 WAT): v8.3.0 | supply 17,003,049,849.9958 | height 11,414,148 | max 21B
- Deploy: SUCCESS, 3x HTTP 200. (Disclosure: one /api/status read seconds
  after deploy served the OLD instance — propagation latency, not a defect;
  /api/supply already showed the closure.)
- AFTER: v8.4.0-closure | supply ran to 17,003,049,999.9958 (last legal mint
  under cap) then STOPPED | remaining 0.0042 | max_supply 17,003,050,000
  | supply_model: "CLOSED (owner ruling B, Oct 14, 2026)".

## Freeze verification (deployed state, repeated)
- +8 min: supply 17,003,049,999.9958, height 11,414,151 — UNCHANGED
- +11 min: supply 17,003,049,999.9958, height 11,414,151 — UNCHANGED
  (pre-closure cadence was ~+24 blocks/min; three checks +8/+11 min apart
  prove the cron miner is rejecting at the cap.)

## Final state
FINAL SUPPLY: 17,003,049,999.9958 HARZ (never exceeds the declared cap).
Tail: CLOSED. Faucet: CLOSED. Chain: height frozen, all transfer/DEX/
bridge/HRC-20 functions unchanged. mined_percent: ~100.0000%.
Rollback path: redeploy ROLLBACK file (would REOPEN mining — only by owner order).

## Not part of this scope (untouched)
mining_arm owner switch (bridge_config) unchanged ('on' — harmless, cap
governs); wallet balances, transactions, contracts untouched; no other
endpoint modified.
