# HarzGit D1 row 60: harz-five-product-build-2026-10-02

**Description:** Owner-ordered 5-product build (USSD checkout, cert verify, verify badge, Root-in-a-Box, offline receipts) — all $0 Cloudflare, 3 workers, unified D1, browser-verified end-to-end.
**Filed:** 2026-10-02 (Africa/Lagos)
**Author:** Aisha

---

FIVE-PRODUCT BUILD (Aisha, 2026-10-02, owner word: 'Build all 5. But reduce the bill.')

BILL REDUCTION: $0 cash, no VPS, no new accounts. 3 workers touched total (2 existing + 1 new). Reuse-first: DialWeb USSD engine carries checkout AND cert-verify; verify.harz carries the badge; one new worker carries Root-in-a-Box + Receipts. Unified D1 kept single-instance (new tables kasuwa_orders, rootbox_leads, harz_receipts in 8132e975 alongside existing carbon_credits/energy_nfts reuse).

P1 USSD CHECKOUT (DialWeb v2.1.0, harz-dialweb):
- *4279*39*5*{1|2}*{qty}# creates order (GDEG N15, NRL N100), shows total + UBA payment details + order code + notarized seal. Orders in D1 kasuwa_orders.
- /api/order/confirm POST marks paid (merchant flow). /api/orders lists (phone excluded from public API).
- Browser-rendered: NRL x50 = N5,000, order KW13711, seal DW-00006. Confirm API: success paid with ref.

P4 CERT VERIFY (DialWeb v2.1.0):
- *4279*39*6*{code}# verifies energy certificates against EXISTING unified tables carbon_credits/energy_nfts (no duplicate data). HTTP page /cert/{code} light theme.
- Browser-rendered: CC-001 and ENFT-001 both VALID (Lagos Solar Farm, solar, 200 kWh, 140kg CO2).

P5 VERIFY BADGE (HARZ Verify v1.1.0, harz-verify):
- /badge.js embeddable one-line badge + /api/zone-status JSON (height, records, anchor, 3-node parity) + /badge-demo live demo page.
- Zone-status served via service bindings ROOT/MIRA/MIRB (workers cannot fetch *.workers.dev directly — error 1042; binding fix deployed with env param).
- Browser-rendered: badge shows 'HARZ zone h2 - 77 names - parity 3/3' live on the demo page. CORS open for third-party embeds.

P2 ROOT-IN-A-BOX (HARZ RootBox v1.0.0, harz-rootbox — NEW):
- Sales PWA: what's-in-box, tiers ESTATE N150K / CAMPUS-CO-OP N250K / CUSTOM N500K, order form -> rootbox_leads.
- /bundle live manifest of components (pulls harz_repos rows + live root/mirror/verify references).
- Browser-rendered: sales page renders; lead form captured RB-2286 (Gwarinpa Estate Abuja) in D1.

P3 OFFLINE RECEIPTS (same worker, /receipts PWA):
- Client-side Ed25519 (ECDSA P-256 fallback) keypair generated on device, never leaves browser (no-AI-key rule honored). Signed receipt JSON + 12-hex verify code. Verify-anyone flow + optional cloud sync (public copies only) to harz_receipts.
- FIXED during build: const-shadowing TDZ bug in create() (const seller=seller.value); Ed25519 sync-throw fallback.
- Browser-rendered full loop: create (Ed25519, RMUQY3MH4HCF3, vc 5D3E60580587) -> verify SIGNATURE VALID + code matches -> sync 1/1 stored. D1 row confirmed.

PENDING (not blockers): Super App nav listing is static (owned by desk seat) — rootbox + receipts should be added by Nuruddeen. Real USSD shortcode *4279# still needs telco provisioning (revenue-gated). Live-sales copy for KASUWA pages (products listed at official rates).