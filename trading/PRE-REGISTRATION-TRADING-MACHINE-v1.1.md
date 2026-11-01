# PRE-REGISTRATION - TRADING MACHINE v1.1

Status: sealed before any v1.1 ticket exists. Paper only. No capital, no sold signals.
Filed 1 November 2026, WAT. Custody: HarzGit row, hash computed from these bytes.
Owner authorization for BUILD recorded; authorization for DEPLOY and for any live
execution is NOT given by this document.

## 1. What v1.1 is

A tamper-evident measuring instrument, not a money printer. Its job is to distinguish
truth from luck. Success is an honest number, not a profitable one.

Nov 6 2026 decides v1.0 evidence only. v1.1 begins after that, as a paper experiment.

## 2. Frozen invariant (must not vary between arms)

- Entry zone, stop derivation basis, confluence rule: as in v1.0 frozen rules.
- Liquidity floor: 60,000,000 USD absolute, unchanged. Bar width is a separate Nov 6
  decision and is deliberately not touched here.
- One prediction = one ticket. Terminal outcomes are permanent.
- Test and synthetic symbols excluded from every reported number.
- Providers: OKX + Gate.io union, volume ranked, as deployed.
- Excluded from tables as non-tradeable artifacts: stablecoins (USDC), and any symbol
  with a >100% 7-day move plus RSI>85 in-window (listing artifacts, e.g. AIN).

## 3. Three books, one variable at a time

Book B1 - stop geometry alone. v1.0 mechanics with target at 1R. Arms 1.5R and 2R
        recorded alongside, not substituted.
Book B2 - B1 plus ATR(14) stop at 1.5x, target 3x ATR (2R), costs modelled per ticket.
Book B3 - B2 plus mirrored short rule (close < EMA20 < EMA50, RSI 25-60, negative
        histogram, negative momentum). Reported as its own book, never pooled with B1/B2.

Regime gate: shipped DISABLED by default behind a per-arm flag. It is present because
it must be testable, not because it is believed. Enabling it requires its own arm and
its own row.

## 4. What the stored artifact actually says (pinned, receipt 288, row 404)

Out-of-period, gross, before any fees - the honest expectation:

  1R targets, out-of-period:  limit/low10 44.7% win, -0.188R, PF 0.69 (n=331)
                              limit/atr2  46.0% win, -0.157R, PF 0.73 (n=313)
                              market/low10 44.0% win, -0.188R, PF 0.69 (n=252)
  1.5R targets, out-of-period: -0.327R to -0.381R, PF 0.51-0.56
  2R targets, out-of-period:   -0.451R to -0.652R, PF 0.30-0.47

In-period positives exist (limit/low10/1.0 at +0.024R PF 1.05; limit/atr2/1.0 at
+0.091R PF 1.20; market/low10/1.0 at +0.146R PF 1.35). These are NOT evidence. They
are the overfitting signature: every arm is positive in-sample and negative out.

Pre-registered expectation for all three books, net of modelled costs:
-0.20R to -0.40R per trade in a regime like the current one. A result outside that band
must be explained, not celebrated.

## 5. Metrics, all of them per book

1. Resolved count (terminal outcomes only: STOPPED, TARGET_HIT).
2. Fill rate - FIRST-CLASS gate metric. Filled and never-filled reported separately.
   Filled-trade expectancy without fill rate is flattering and is not acceptable.
3. Win rate, average win R, average loss R.
4. Expectancy in R, GROSS and NET of modelled costs.
5. Profit factor. Maximum drawdown in R.
6. Random-entry benchmark over the same window, same universe, same fill logic.
7. Every ticket carries rule_sha256, entry/stop/target, and the cost assumption used.

## 6. Promotion gate (all must hold, none may be waived)

1. 172 resolved per arm, or an equivalent sequential test that can detect ~0.22R at
   80% power. 30 resolved is an INTERIM checkpoint and can never promote.
2. Net expectancy >= +0.15R after modelled costs.
3. Must beat v1.0 over the same window.
4. Must beat the random-entry benchmark by >= 0.30R.
5. Maximum drawdown < 8R.
6. Every ticket costed. Untested data marked NOT TESTED, never filled with an assumption.

Failure archives the arm as falsified with its full record. No rescue, no reinterpretation.

## 7. Tamper evidence

- prediction_ledger_v11 and hunt_runs_v11 in the existing single D1 instance.
- Per-ticket rule_sha256; daily anchor = hash chain over that day's tickets.
- The desk verifies the chain at every review and records the verification.
- Any retroactive edit to a sealed prediction becomes detectable by construction.

## 8. Custody and authorship

- This document must exist as a HarzGit row with its own sha256 before any v1.1 code.
- Worker code, build, and deploy: the owning seat only, under the deploy lock
  (claim, deploy, quiet window, complete, verify). No other writer stages code.
- Deployment requires the owner's explicit word, separately, per deploy.

## 9. Retractions on the record

- Claim "the regime gate would block most of v1.0's ten losses": RETRACTED. Measured:
  BTC was above its daily EMA50 on 11 of 12 terminal entries including all ten losses;
  the only sub-EMA50 entry was RUNE, the sole winner. Breadth above EMA20 never
  exceeded 35% in-window (peak 2026-10-20), so the joint gate blocks 100% of the
  sample. A gate that forbids every trade is a switch and teaches nothing.
- Claim "one confluence pass in the $10M-$60M band": RETRACTED. Recomputed with the
  machine's own rule: two passes, ZEC and PEPE.
- Unverified and therefore not used: the 40.8% figure attributed to the 1R arm. The
  stored artifact gives 44.0-46.0% out-of-period for 1R arms. Any 40.8% claim needs
  its own row before it enters a decision.
