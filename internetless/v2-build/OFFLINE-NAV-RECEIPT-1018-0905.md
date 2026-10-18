# OFFLINE NAVIGATION RECEIPT Oct 18 09:05 WAT (browser-grade airplane test)

Owner ask: "open cac,nysc offline in browser, navigate, show me."
Method: real Chromium. Network cut at PAGE (emulateNetworkConditions offline) AND at the
SERVICE WORKER (Fetch blackhole: every network request the SW attempts is failed with
ConnectionRefused; SW kept alive via 2s heartbeat so it does not idle-terminate and un-arm).
navigator.onLine forced false. SW r10, cache harz-internetless-v2-r10, contents: 1069 docs + 62 packs.

Honesty probe first: fetch of a never-stored pack URL -> 404 "pack not stored offline"
(network provably dead, honest fallback, no fake success).

RESULTS (all offline, served from SW cache):
1. NYSC home opens - banner "captured 2026-10-18 (internal pages stored)", title NYSC - Home
2. Menu click FAQs -> /v2/packs/nysc.gov.ng/faq.html, title "NYSC - FAQs", 9750 chars of content
3. CAC home opens - banner 2026-10-18, title Corporate Affairs Commission
4. Click "About us" -> about.html, "Who We Are | Corporate Affairs Commission", 4481 chars
5. Click "Organizational Structure" (THE link that failed on the owner phone with the old
   blocking alert) -> opens: "Organizational Structure | Corporate Affairs Commission", 995 chars
6. NYSC camps.html opens, 5/5 images painted (data URIs)

Receipts served from own infra (KV v2.shot.*, worker route /v2/shot/<name>, base64-stored,
byte-identical verified): nysc-home, nysc-faqs, cac-home, cac-about, cac-org-structure, nysc-camps.

Conclusion: server + SW + packs are proven offline-ready. The owner device failures are stale
local cache (2026-10-16 copies). Device must refresh online once: open /v2, tap Sync (62/62),
verify banner says 2026-10-18, then airplane.
