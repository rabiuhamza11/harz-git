# EXPERIMENT B — OWNER FREEZE TERMS + NOV 6 AUDIT CONTRACT
Ruled by: Rabiu, 2026-10-30 11:12 WAT. Binding all desks until the Nov 6 verdict.

## FREEZE TERMS (Oct 30 -> Nov 6)
1. No revenge trading.
2. No moving entry zones to manufacture fills.
3. No changes to frozen prediction rules.
4. No hiding losses or unfilled predictions.
5. Human book (Base44 Prediction ledger) and machine book (harz-trading-machine D1) stay SEPARATE; no merge into one scored number before the verdict.
6. Preserve every result for the final audit.

## NOV 6 DELIVERABLE
A DECISION, not an extension. Independently verified results must include: fees, slippage, stops hit, missed entries (no-fills) and the market regime framing for the window.
Where execution data does not exist for a prediction (no execution row), fees/slippage must be marked NOT TESTED, never estimated silently.

## EVIDENCE INTERPRETATION RULE (owner)
Seven consecutive correlated long losses in one selloff is regime-exposure evidence, NOT proof the strategy is bad. Equally, profitable open positions are NOT proof it works. The verdict rests on the verified ledger, not the narrative.

## AISHA SEAT AUDIT PREP (to be run Nov 6, independent of the desk's report)
- Machine book: D1 prediction_ledger + execution_ledger + risk_ledger (fills, no-fills, guardian refusals, dedupe, kill-switch events).
- Human book: Base44 Prediction + ExecutionLedger entities (row-by-row, outcome_category, zone_filled, fees_paid, slippage).
- Market regime: OKX/CoinGecko OHLC for the window; per-trade stop-hit vs no-fill classification from actual candles.
- Cross-checks: each claimed loss/win reproduced from OHLC; each claimed no-fill confirmed against candle lows/highs in the zone.
- Output: matrix of VERIFIED / REFUTED / NOT TESTED per trade and per aggregate claim.
