# HarzGit D1 row 58: harz-ecosystem-fix-kasuwa-verify

**Description:** Fix receipt: kasuwa.harz 404 fixed (added /site/:code route to harz-dialweb, seeded KASUWA Market pages in D1, browser-verified) + verify.harz rebuilt as HARZ Verify v1.0.0 browser zone-verifier (real-browser VERDICT PASS, all 5 checks green). Nuruddeen's HARZ Browser default-engine claim independently verified (31 results in-frame). 75/77 names now serve.
**Filed:** 2026-10-02 (Africa/Lagos)
**Author:** Aisha

---

ECOSYSTEM FIX — KASUWA + VERIFY RESTORED (Aisha, 2026-10-02 10:35 Lagos, owner word: 'Fix')

FIX 1 — kasuwa.harz (was 404):
- Root cause: zone maps kasuwa.harz -> https://harz-dialweb.harz.workers.dev/site/39, but DialWeb had NO /site/:code HTTP route (USSD-only service). Site 39 'KASUWA Market' existed in its sites table with empty pages.
- Fix: added a read-only /site/:code HTML route to harz-dialweb (renders any site's pages as a light-theme #f0f2f5 page; USSD branches untouched; publish API untouched; code-39 reservation untouched). Deployed with DIALWEB D1 + ORBITAL_SVC bindings preserved. All existing routes re-tested 200 (/, /api/sites, USSD *4279*39# demo branch preserved as-is).
- Seeded KASUWA Market site 39 pages directly in D1 (publish API reserves 39): home + products (GDEG N15, NRL N100, real rates) + buy (UBA 2034326424 code 033, GDEG Polygon wallet) + contact (CAC RC 321424, USSD *4279*39#). All texts <=160, options valid — USSD-compatible.
- Browser-rendered and screenshot-verified: https://harz-dialweb.harz.workers.dev/site/39 -> 200.

FIX 2 — verify.harz (was 404, worker deleted):
- Rebuilt as HARZ Verify v1.0.0 at https://harz-verify.harz.workers.dev: browser-based zone-chain verifier. Client-side WebCrypto Ed25519 verification — fetches /zone from root + mirror A + mirror B, checks signature against published /zone-pub anchor (3-node agreement), mirror byte-parity, floors (records>=77, height>=2). PWA (manifest, sw.js, icon), light theme, no server trust required.
- Deployed via API (module worker, no bindings), workers.dev subdomain enabled.
- REAL-BROWSER TEST PASSED: 'Verify now' run in browserbase -> fetched 3/3, parity 3/3, anchor agreed 3/3, signature VALID, floors ok. VERDICT: PASS — height 2 (77 records, prev cac16833, signed_at 2026-10-01T16:06:28Z, anchor 609d4b2f, sig 485ec45e).

CROSS-SEAT CLAIM VERIFIED (desk seat, forwarded to owner): HARZ Browser now defaults to HARZ Search. Independently confirmed: source shows searchEngines[0]=HARZ (harz-search.harz.workers.dev/?q=) with activeEngine=0 default and localStorage 'harzBrowserEngine' persistence; live browser test: typed 'harz exchange', engine=HARZ Search, 31 results rendered in-frame (HARZ Telecom Exchange, HARZ Exchange OTC Buy & Sell Desk, HARZ FX Live Exchange Rates...). Claim is accurate.

REMAINING (needs desk-vault zone re-sign, owner decision): content.harz + dial.harz have no endpoint in the signed zone. Options: assign endpoints at height 3 (requires anchor key in Nuruddeen's vault) or leave reserved. Ecosystem now 75/77 serving.