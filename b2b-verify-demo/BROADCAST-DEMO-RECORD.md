# B2B Demonstrator #2 — HARZ Broadcast Console (Bulk WhatsApp/SMS Campaigns) v1.0
Date: Sep 21, 2026 | Track: build-to-demand (desk-audit segment #1: WhatsApp/broadcast automation)

Live: https://harz-broadcast-demo.harz.workers.dev
Gateway: harz-gateway via service binding (proven same-account pattern). D1: harz-broadcast-db (fresh schema: contacts, campaigns, sends).

## Buyer workflow proven end-to-end
1. Paste CSV contacts (name,phone,tags) → dedupe, normalization, "stop" tag = opt-out
2. Create campaign with {{name}} personalization + segment tag filter
3. Preview: eligible count, opted-out count, LIVE unit price from gateway (market price law — ₦2.5/SMS at test time, never hardcoded), est. cost
4. Test send to buyer's own phone — REAL SMS arrives
5. Send campaign: real batch capped at 10 for demo (labeled), per-recipient ledger, honest per-recipient failure reasons
6. Delivery report: sent/failed/skipped, costs, message_ids

## Verified (3-level standing order)
1. DEEP AUDIT: full source authored in-repo; D1 schema applied directly; one real bug found+fixed pre-report (demoApi returned plain objects → CF 1101; wrapped in Response)
2. TEST: full API chain live — import (3 contacts incl. 1 opted-out), campaign create, preview (2 eligible / 1 suppressed / live price), TEST SEND real SMS to 08028687857 (hzs_mub46b0mm4327n), full campaign send 2 sent / 0 failed / 1 opted-out suppressed, cost 500, report ledger clean
3. BROWSER TEST PASS: UI-driven flow in real browser — campaign created via UI, preview rendered real recipients with Fatima marked OPTED OUT, live ₦2.5 unit price on screen

## Honest architecture notes (in the UI itself)
- SMS rides the live Sendchamp aggregator rail (proven Sep 21 on the OTP fix)
- WhatsApp channel is channel-agnostic in the engine; WhatsApp sends activate on the BUYER's own WhatsApp Business API credentials — we build orchestration, buyer keeps their Meta account. No pretending personal WhatsApp can legally broadcast.
- Demo cap 10 recipients/campaign send, labeled in UI + API response
- Demo wallet: shared HARZ demo gateway account (400/OTP, 250/SMS debits) — top up before buyer sessions

## Build findings
- CF script PUT metadata "keep_bindings" not used here (fresh bindings declared); workers.dev route enablement must happen AFTER script exists (enable-before-deploy 500s)
- Plain object returns from handler = CF 1101 (Cloudflare requires Response; wrap JSON helpers)
