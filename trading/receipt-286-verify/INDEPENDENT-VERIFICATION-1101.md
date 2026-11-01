# RECEIPT 286 — INDEPENDENT RE-RUN BY THE VERIFICATION SEAT (Nuruddeen, Nov 1 2026 04:00 WAT)

## 1. Bundle integrity — 6/6 hashes MATCH
cache_candles.py, grid2.py, grid3.py, grid_v11.py, candles_cache.json (506,821 B),
HARNESS-MANIFEST.md — every declared SHA-256 verified byte-for-byte after download. Nothing shifted.

## 2. Their numbers REPRODUCE EXACTLY (my run of grid3.py, their code, their cache)
okx signals 311 | kraken 928 | out-of-period 626 — identical to their report.
market/low10/2.0  A 28/-0.13/0.83  B 31/-0.21/0.73  C 207/-0.54/0.39
limit/atr2/1.0    A 51/-0.07/0.87  B 29/+0.65/5.42  C 322/-0.18/0.70
market/atr2/1.0   A 66/-0.34/0.50  B 60/+0.13/1.32  C 394/-0.15/0.74
market/atr2/1.5   A 56/-0.43/0.47  B 43/+0.04/1.06  C 331/-0.25/0.66
sd 1.004R; n required for +0.15R at 95% = 172. Withdrawal of Receipt 286 CONFIRMED independently.

## 3. Control experiment the desk did not run — random entries, identical geometry
Out-of-period window, same ATRx2 stop, same resolution/ambiguity/cost rules, random bars:
  atr2/1.0  random n=741 exp=-0.203R PF=0.66 win=43.3%
  atr2/1.5  random n=578 exp=-0.400R PF=0.49 win=26.8%
  atr2/2.0  random n=500 exp=-0.624R PF=0.31 win=14.8%
Signal vs random (same window/geometry):
  1.0R  signal -0.153 vs random -0.203  -> +0.051R
  1.5R  signal -0.245 vs random -0.400  -> +0.155R
  2.0R  signal -0.459 vs random -0.624  -> +0.166R
Buy-and-hold 10-day baseline (660 samples): mean -1.33%, median -1.76%.
FINDING: the confluence signal is NOT pure noise — it beats matched random entries by
+0.05 to +0.17R. But the entire window is a downtrend, so long-only loses regardless.

## 4. Directional test — mirror the SAME signals as shorts (out-of-period)
  1:1.0  LONG -0.153R PF 0.74 win 46%  |  SHORT -0.010R PF 0.98 win 54%
  1:1.5  LONG -0.245R PF 0.66 win 34%  |  SHORT -0.122R PF 0.82 win 39%
  1:2.0  LONG -0.459R PF 0.46 win 21%  |  SHORT -0.283R PF 0.64 win 27%
FINDING: the long-only constraint is a structural drag, not merely a parameter choice.
Shorts reach break-even at 1R in a bear window (PF 0.98) — still not profitable after real costs.

## 5. Regime split is vacuous by construction
The confluence rule requires close > EMA20 > EMA50, so 100% of signals are already above EMA50
(n=394 above, n=0 below). The rule IS an uptrend filter; it cannot gate itself by trend.
A market-wide breadth/regime gate would have to be a separate input, not this signal.

## 6. Verdict
No edge is demonstrated in any window — the desk is right. Additions from this seat:
(a) the signal carries small positive information vs matched random (do not discard the signal);
(b) direction symmetry is the largest single structural defect found so far;
(c) the 172-trade pre-registered bar stands; nothing here justifies capital.

Scripts used: trading/receipt-286-verify/null_model.py, regime_short.py (run against their cache).
