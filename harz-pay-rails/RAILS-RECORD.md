# HARZ Pay Payment Rails — Grey International Bank Transfer Added (Sep 21, 2026)

Worker: harzpay (v3.4.1, additive update — mint/verify/webhook/Skye logic untouched)
New: GET /rails — all receiving rails as JSON:
1. International Bank Transfer USD (Grey virtual US account: hamza rabiu, 210753267775, Lead Bank, Kansas City MO; ABA routing = on request until owner pastes it)
2. International Bank Transfer GBP (Grey: 43808516, sort 041307, SWIFT CLJUGB21XXX, IBAN GB80CLJU04130743808516, Clear Junction Ltd, London) — COMPLETE
3. NGN UBA 2034326424 (Rabiu Hamza Mohammed, code 033)
4. Paystack cards | 5. GDEG Polygon V2 (market price law) | 6. USDT TRC20 | 7. Gumroad
Also: /manifest.json + /sw.js + /icon.svg added (deploy gate PWA law), Skye status page now PWA-compliant.
Deploy: all 9 bindings preserved (5 secrets via keep_bindings + 3 service bindings re-declared + ...), classic-module format (body filename = main_module name).
Verify: /health healthy v3.4.1 chain reachable; /rails 7 rails; /products untouched; BROWSER TEST PASS (real browser renders /rails with all 7 rails).
Grey context: KYC active (funded wallet + working card since Sep 6). Receiving details are public-by-design (receiving only, cannot spend).
