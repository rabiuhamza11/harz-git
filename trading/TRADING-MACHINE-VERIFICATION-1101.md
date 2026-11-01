# TRADING MACHINE — INDEPENDENT VERIFICATION + DEFECTS (Nuruddeen, Nov 1 2026 03:20-03:30 WAT)

## LIVE LOCATION (corrected record)
Worker `harz-trading-machine` (a1) + D1 `eef046df-dbff-496d-a17a-ac94ec7c6af7`.
Tables: execution_ledger, risk_ledger, prediction_ledger, tickets, ticket_claims, hunt_runs,
score_events, score_runs, outcome_authority, source_health, gist_*.
Receipt 246 (Oct 30) said Base44 — superseded: a Cloudflare mirror now exists.

## PROVEN WORKING (my own calls, rows 25-31 in execution_ledger)
- Valid ticket (BCH 285/274/325, N100k, risk_pct 0.01): ACCEPTED_SIMULATED,
  order BCH-1793499870884, notional capped 25,000, risk 1,000, net_loss_at_stop 1,139.91,
  net_gain 3,333.77, net R:R 2.92, agg 1.0%, steps_passed 8.
- LIVE venue: REFUSED_VENUE_MODE "DEMO only" (row 25).
- Stop above entry: REFUSED_SIZING "INVALID_LONG: requires stop < entry < target" (row 28).
- 8th position on 7-long book: REJECTED_BY_GUARDIAN, breach "POSITIONS 8 > 5" (row 29).
- Every call writes a ledger row, including refusals. Append-only behaviour observed.

## DEFECTS FOUND (fixes written, NOT live — see deploy race below)
1. HUNT CORE DEAD in live build: POST /hunt -> 500. Two successive causes observed:
   "all is not defined", then after desk redeploy "Cannot access 'chg' before initialization"
   (eligible/gain/dip declared AFTER use). /hunt/preview -> 500. Hunting = 0 working.
2. Fill accounting missing: ACCEPTED_SIMULATED rows have filled_size, fees_paid, slippage = NULL
   even though ledger columns exist and the receipt claims fill 25,000 / fees 150 / slip 25.
3. Portfolio risk field mismatch: gate reads book[].risk; documented payload uses risk_pct,
   so a 21% book aggregates as 0 and the AGG breach never fires (my stress test showed agg 1% not 16%).
4. Risk unit ambiguity: risk_pct=1 (natural "1%") is read as 100% and refused; only 0.01 works.
5. Correlated-longs check counts book[].dir but payload uses side.

## THE REAL BLOCKER: DEPLOY RACE
Desk deploys via wrangler every ~10s (02:26:32, 02:26:43, 02:26:52, 02:27:03).
My API deploys (02:24:54, 02:24:56) were overwritten 13s later; live code has none of my fixes
(grep riskPctUsed = 0, confluence diagnostics = 0, hunt fix reverted).
=> TWO deployers on one worker. Machine cannot be "accurate" while its code is being replaced
mid-verification. Recommendation: single owner for this worker's code lane.

## HANDOFF
trading/trading-machine-FIXED-source.js = clean source with: hunt scope fix, confluence
diagnostics (trend/rsi/hist/chg per candidate), /hunt/preview dry run, fill accounting,
book-risk alias, risk-unit tolerance, side|dir correlated longs. Rules untouched (F1-F7 frozen).
