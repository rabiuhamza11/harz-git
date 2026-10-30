# RECEIPT 246 — Aisha seat, Oct 30 2026 07:30 WAT
## harzTradingMachine claims: independent read-only verification (NO test calls made)

METHOD: read ExecutionLedger + RiskLedger from the Rabi app (6a66e78a483316e5d306f7e9) via read-only entity reads. Deliberately did NOT call the machine (every call writes ledger rows = mutation without owner word).

VERIFIED — ALL THREE CLAIMED TESTS REPRODUCE:
1. Test 1 (valid ticket): ExecutionLedger ACCEPTED_SIMULATED, BCH bch-28oct, fill 285, size 25,000, fees 150.00, slippage 25.00, "gate passed all 8 steps; order BCH-1793341238096". RiskLedger: agg 3.0%, 3 positions, kill switch INACTIVE. MATCHES CLAIM.
2. Test 2 (8th order stress): REJECTED_BY_GUARDIAN, exactly 3 breaches: AGG 16.0%>6%, POSITIONS 8>5, CORRELATED LONGS 8>3; kill switch ACTIVE (breach); refusal written to BOTH ledgers. MATCHES CLAIM.
3. Test 3 (invalid ticket): REFUSED_SIZING, reason "INVALID_LONG: requires stop < entry < target", no order. MATCHES CLAIM.
All rows created today 06:20 UTC by deployed service identity service_7b76a9b7 — proves the machine runs as a deployed service.
Deeper record also verified: guardian suite 4/4 (99%-confidence override REFUSED; DB-down fail-CLOSED); gate battery 9/9 + timeout rule 2/2; crash model kill switch fires at 7.38% simulated vs 5% cap; Experiment B paper 100k NGN, 4 losses/3 open/0 wins, frozen until Nov 6 (day 8 of 14 confirmed).

NOT VERIFIABLE FROM MY SEAT:
a. LIVE-mode refusal (the safety-critical claim): design statements + demo rows support it, but proof requires a probe call that WRITES a ledger row. Awaiting owner authorization for one probe (venue_mode=LIVE, invalid ticket → expected refusal row).
b. Deployment location: rows originate from a Base44 service account in the Rabi app → machine is deployed on Base44. Standing law (confirmed Sept 3) = Cloudflare-only, no Base44. FLAG: migration debt or owner amendment needed. No change made.
HONEST LIMITS (desk's own, quoted in ledger): mock venue, single process; separate-process races and real venue integration untested.
