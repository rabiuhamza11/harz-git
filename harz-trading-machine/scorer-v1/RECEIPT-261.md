# RECEIPT 261 — Automated Outcome Scoring, closure (Aisha seat)
Date: 2026-10-31 | Owner decision: GO on Fix #1 only, no strategy changes

## Delivered
- Scorer: /score (POST), /score/status, /score/board on harz-trading-machine.
- Automatic: cron 0 5,19 * * * runs hunt then scorer.
- Feeds: OKX -> Binance -> Gate.io -> KuCoin -> Kraken, first that answers wins.
- Provenance: every authoritative event carries candle_source + timeframe + evidence OHLC.
- Guards: (a) authoritative-source filter on dedupe/terminal/fill lookups,
  (b) hard REFUSAL to write FILLED/STOPPED/TARGET_HIT/OPEN/UNVERIFIED without a real source,
  (c) partial-window guard: refuses to score if candle window starts after publication,
  (d) sandbox provenance gate with correction_of release.

## Corrections (append-only, originals preserved)
- 6 sandbox rows (H-XMR, H-QNT, H-RUNE) superseded via SOURCE_REJECTED[:id], correction_of set.
- 4 source-less rows (incl. 2 test tickets) superseded via PROVENANCE_UNKNOWN[:id].
- Re-scored from worker-reachable feeds: XMR=Kraken, QNT=Gate.io STOPPED -7.92%, RUNE=Gate.io OPEN.

## Verification evidence
- Two consecutive cycles: zero duplicate (ticket,event,source) triples.
- New UNKNOWN-provenance events after fix: 0.
- /score/status browser-rendered: last_successful_scoring 2026-10-31T13:26:10.350Z, 17 tickets.
- /score/board browser-rendered: 65 events with OHLC evidence, sources OKX/Gate/Kraken.
- Terminal protection: STOPPED/TARGET_HIT/UNVERIFIED_AMBIGUOUS block re-scoring and downgrade.

## Open, disclosed
- Test tickets T-TERM-RESOLVED and T-OPEN-UNRESOLVED remain in the production tickets table (inserted by another seat). Not mine to delete; recommend marking seat='test'.
