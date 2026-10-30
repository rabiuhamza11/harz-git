# RECEIPT 247 — Aisha seat, Oct 30 2026 ~08:00 WAT
## harz-trading-machine dashboard: browser-verified + owner screenshots

VERIFIED (real browser render + owner's phone screenshots, 2 images 07:53):
1. https://harz-trading-machine.harz.workers.dev loads; data populates; light theme; DEMO ONLY badge; cards (Predictions 0, Open 0, Losses 0, Risk INACTIVE agg 1%); execution gate feed with green/red badges; "Run hunt now" button; footer "Analysis only, no real money, DEMO territory".
2. PWA: /manifest.json 200 (296B), /sw.js 200 (606B), /icon.svg 200. Installable files present. (icon.png absent — SVG only; Android install may prefer PNG, minor.)
3. LIVE-MODE REFUSAL NOW VISIBLE: gate feed shows "LIVE-PROBE REFUSED_VENUE_MODE: LIVE · DEMO only until owner authorizes live" — closes the claim I could not verify in receipt 246 (probe was run by the desk, row is visible on the owner's own screen). Second LIVE-PROBE hit REFUSED_KILL_SWITCH (kill switch latched ACTIVE from the stress test; "owner authorization required to reactivate").
4. DEPLOYMENT LAW: worker harz-trading-machine is on the HARZ Cloudflare account (5ab9477c) with D1 binding HARZ_DB — Cloudflare-only law SATISFIED for this build. (Receipt 246's Base44-hosted harzTradingMachine is the OLDER copy; this is the Cloudflare successor.)
5. /api/summary 200, JSON keys: now, source, total_predictions, losses, open_positions, kill_switch, agg_risk_pct, predictions, executions.

FINDINGS (honest):
a. Two ledgers, two truths: this dashboard reads its own D1 (0 predictions, 0 losses). The Base44 Rabi-app ledgers hold the human-seat book (the 4 losses, 3 open, ZEC/INJ/XMR) and the 3 test rows I verified in 246. The desk disclosed this and named the merge as next step. Until merged, "Losses booked 0" on the phone does NOT contradict Experiment B's 4 losses — different books.
b. "Risk INACTIVE, agg 1%" vs kill switch ACTIVE in the feed: the stat card and the gate rows disagree in wording. Likely card reads exposure state while rows record the latched kill switch from the stress test. Needs one-line clarification from the desk (cosmetic/consistency, not a safety fault: gate behavior is fail-closed).
c. Kill switch latch semantics are correct as designed: stays ACTIVE until OWNER authorizes reactivation. Owner should know the machine currently refuses all new demo orders until that word.
d. Reporting discipline: the desk's "Predictions 0" explanation (machine-seat entries only) is honest and matches what I see.
