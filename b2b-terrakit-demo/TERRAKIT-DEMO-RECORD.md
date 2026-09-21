# HARZ TerraKit-style Farmer Advisory — B2B Demonstrator #3 (Sep 21, 2026)

## Target
OpenInfra Africa (TerraKit) founding-CTO brief — Nairaland post May 12, krysten (Birmingham UK, account since 2012). Contact verified: info@10mg.co.uk (their own post; Zoho MX live; terrakit.org/.io registered+parked; OpenInfra Africa CIC not yet on Companies House = early stage as stated).

## What the demo proves (requirements comprehension, built in <24h slice)
1. Maize/rice crop advisory engine — 31-state demo knowledge base from published Nigerian agro-climatology (agro zone, rainfall range, onset, season length, planting windows with live window-status, varieties, spacing, practice tips, per-state risk note, irrigation notes). Bimodal south (Oyo 2 windows) modeled.
2. Climate data layer — /api/climate per state; honest label: production swaps in live CHIRPS/TAMSAT rainfall + station data.
3. Farmer data infrastructure — D1 tables (farmers, queries ledger, menu_sessions); registration via API AND via menu.
4. Clean public JSON APIs — advisory, climate, farmers register/list, stats feed.
5. WhatsApp/SMS menu engine — POST /menu state machine (persisted in D1): advisory flow, farmer registration flow, climate summary. A WhatsApp bot bridges 1:1 to this (HARZ menu-architecture law).
6. Low-bandwidth mobile PWA — light theme #f0f2f5, tiny payload, offline shell via service worker.
7. Live data dashboard — /dashboard renders real D1 counts (farmers by state/crop + hectares, query ledger).

## URLs
- Console: https://harz-terrakit-demo.harz.workers.dev
- Dashboard: https://harz-terrakit-demo.harz.workers.dev/dashboard

## Deploy facts
- Worker: harz-terrakit-demo (module worker, zero-dependency)
- D1: harz_terrakit_demo (uuid 3bae80eb-363a-4d92-829b-23cb9a190ffc), binding TK_DB
- Deploy gate v1.1: PASS (0 warnings) — initial run caught missing SW registration, fixed pre-deploy
- Deploy quirk: multipart filename must equal main_module (worker.js)

## Verification (3-level standing order — ALL PASSED)
1. DEEP AUDIT — source reviewed; D1 inspected directly; found real bug via D1 query: menu registration confirmation rendered AFTER save({step:main}) clobbered session state → "undefined advisories for undefined" (DB row was correct; only the message was wrong). Fixed: message built before save. Redeployed.
2. TEST (live API battery) — health OK (31 states); advisory Kebbi rice + Oyo maize (2 bimodal windows) + Taraba maize; unknown state → honest 400 with state list; climate Benue; 5 API + 2 menu farmer registrations (7 total incl. Kebbi/Taraba/Oyo/Kano/Benue/Anambra); menu state machine full journey (advisory, registration, climate) with D1-persisted sessions; /api/stats real group-bys.
3. BROWSER TEST — landing renders advisory (Taraba maize, real window status) + full menu flow walked in real browser (1→Kebbi→2→rice advisory rendered); dashboard renders real data: 7 farmers, 7 queries, 6 states, per-state hectares, maize/rice query split.

## Honest limits
- Demo knowledge base is simplified published climatology — NOT live satellite/station data (labeled in every response: "demo-kb-v1").
- No real alerts sent to farmers; no live WhatsApp bridge attached (menu API is the bridge point).
- Farmers/queries in this instance are real registrations made through the demo itself during the battery.
- Advisory window-status math uses fixed 2026 day-of-year comparison (demo scope).
