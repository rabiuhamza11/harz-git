# B2B Demonstrator — HARZ Phone Verification (Client Side) v1.0
Date: Sep 21, 2026 | Track: build-to-demand (B2B demonstrator #1)

## What
Mobile-first client-side demo for the phone-verification buyer requests (OTP flows).
Rides the LIVE HARZ Gateway OTP API (real SendChamp SMS delivery, DND-aware, all NG networks).

Live: https://harz-phone-verify.harz.workers.dev
Gateway: https://harz-gateway.harz.workers.dev (service binding, same-account)

## Flow (buyer sees exactly this)
1. Enter any NG number → network auto-detected from prefix map (MTN/Glo/Airtel/9mobile badge)
2. Send code → REAL SMS arrives (6-digit, 5-min expiry, from HARZ sender)
3. Enter code → verified screen with receipt (number, network, time, otp_id)
Honest failure paths: wrong code (attempts left), expiry countdown, too-many-attempts lock, 60s resend rate limit (429 + retry_after).

## Architecture (zero-dependency, Cloudflare-only)
- harz-phone-verify worker: demo UI (PWA: manifest + SW + icon, gate-passed), /demo/otp/send, /demo/otp/verify, /demo/pricing
- Demo API key = secret binding DEMO_API_KEY (never in source, never in browser)
- Worker→gateway via SERVICE BINDING (GATEWAY_SVC → harz-gateway) — same-account workers.dev fetch returns CF 1042, service binding is the ecosystem-standard fix
- Demo wallet: dedicated gateway_accounts row "HARZ Demo — Phone Verification", funded 20,000 (≈50 OTPs at 400/OTP); merchant/customer balances untouched

## Verified (3-level standing order)
1. DEEP AUDIT: gateway OTP source read (X-API-Key auth, D1 gateway_otps, attempts cap 3, 5-min expiry, SendChamp verification API, balance debit fail-closed)
2. TEST: real OTP sent to 08028687857 through full stack (browser + API), wrong code → attempts_remaining 2, rate limit 429 retry_after, pricing live
3. BROWSER TEST PASS: real browser loaded the demo, Airtel badge fired on input, Send code clicked → step 2 rendered with live countdown ("Code expires in 271s"), merchant section renders

## Build findings (real, fixed same session)
- CF classic-format (body_part) script uploads SILENTLY DROP bindings (env shows only request/actorState) — module format (main_module) required for binding injection
- Same-account workers.dev HTTP fetch returns 404 error 1042 from inside a worker — service binding required (matches ecosystem pattern)
- "harz-verify" subdomain was already claimed by a different account's old script; renamed to harz-phone-verify, ghost script on this account deleted
- handlePricing missing env arg → 1101 on service-binding call; fixed

## For bids
Attach link in proposals: "working demo of your exact flow, built before hiring — try it with your own phone."
Embed snippet + 3-call API contract on the page itself. Offline mesh delivery = differentiator line.
