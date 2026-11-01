# RECEIPT 292 - v1.1 pre-registration sealed

Date: 1 November 2026 WAT. Authorized by owner ("say go, on the seat's terms").

## Artifact

- HarzGit row 821: trading/v1.1/PRE-REGISTRATION-v1.1.md
- 5,399 bytes, sha256 47105387f45130673643062750adc4bb5e3034336aaa318043b05fc10dabb1ae
- Round trip verified byte-identical after insert.
- Companion copy committed here at trading/PRE-REGISTRATION-TRADING-MACHINE-v1.1.md

## What is sealed

Three books, one variable at a time: B1 stop geometry alone (1R primary, 1.5R and 2R
recorded), B2 plus ATR(14) 1.5x stop / 3x ATR target with per-ticket costs, B3 plus
mirrored shorts as its own book. Regime gate present but DISABLED by default behind a
per-arm flag. $60M liquidity floor frozen. Promotion requires 172 resolved (~0.22R
detectable at 80% power), net +0.15R, beat v1.0, beat random by 0.30R, drawdown under
8R, every ticket costed. 30 resolved is an interim checkpoint only. Fill rate is a
first-class gate metric.

## Pinned expectation from stored artifact (row 404, receipt 288)

Out-of-period 1R arms: 44.0-46.0% win, -0.157R to -0.188R gross, PF 0.69-0.73.
1.5R arms -0.327R to -0.381R. 2R arms -0.451R to -0.652R. All in-period positives are
recorded as overfitting signature, not evidence. Pre-registered expectation net of
costs: -0.20R to -0.40R per trade in this regime.

## Retractions logged

1. Regime gate "would block most of the ten losses": measured false. BTC above its daily
   EMA50 on 11 of 12 terminal entries including all ten losses; the only sub-EMA50 entry
   was RUNE, the sole winner. Breadth above EMA20 peaked at 35% (2026-10-20), so the joint
   gate blocks 100% of the sample.
2. "One confluence pass in the $10M-$60M band": recomputed with the machine's rule, two
   pass (ZEC, PEPE).
3. The 40.8% win figure for the 1R arm is unverified; stored rows say 44.0-46.0%.

## Not authorized by this receipt

Build may proceed. DEPLOY requires the owner's separate word. Live execution remains
frozen to Nov 6 and requires trade-only key, no withdrawal rights, owner authorization,
smallest venue size, four-test battery.
