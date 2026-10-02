# HARZ Network App v0.1 — Core + Desktop Adapter (Oct 2, 2026)

Owner word: "Build" (Oct 2, after the honest .harz conversation). Magani build, my own runs, receipts below.

## What is built
1. `harz-dns-core.js` — the frozen answering engine. Substrate-free: zero network calls, zero FS reads after boot, zero clock dependence. Pinned trust: king 90062faa, zone digest cac16833, floors 77 records / height 1. Fail-closed boot (digest + Ed25519 sig + anchor + floors), honest NXDOMAIN, deterministic receipts (sha256 over name|status|endpoint|digest; performance metadata outside the contract per law).
2. `harz-dns-core-battery.js` — 10 gates, all my own runs: B1 boot-verify; B2 sweep 77/77 exact endpoints (frozen priority https>harz-native>mesh>dial>local); B3 honest NXDOMAIN + positive control; B4 tamper → REFUSED (digest mismatch, nothing served); B5 foreign anchor → WRONG ANCHOR; B6 forged signature → KING SIG INVALID; B7 airplane-by-construction (static proof: zero network primitives in core source); B8 determinism 100x identical receipts; B9 cold-reboot byte-identical sweep; B10 receipts on every answer incl NXDOMAIN. **VERDICT 10/10 PASS.**
3. `harz-dnsd.js` — desktop adapter (UDP+TCP :53). *.harz answered from the sealed book → 127.0.0.1 (local door); non-harz forwarded upstream. LIVE-TESTED in sandbox: kasuwa.harz → 127.0.0.1 rcpt 48c3a325, pay.harz → 127.0.0.1 rcpt fd258227d8dc, ghost.harz → rcode 3 honest NXDOMAIN. Upstream forwarding not provable in this sandbox (UDP 53 egress blocked, HTTPS-only egress) — desktop field run confirms.
4. `harz-door.js` — local HTTP door. Host header → core lookup → 302 to the sealed endpoint, x-harz-receipt on every open. LIVE-TESTED: kasuwa.harz → 302 https://harz-dialweb.harz.workers.dev/site/39 (the sealed book's answer, not a guess); unknown host → honest 404 with receipt.

## Honest limits (workbench-only, per law principle 8)
- All evidence above is workbench. No field claim. No sovereignty claim.
- The desktop path makes `store.harz` open in the stock browser on a machine running dnsd+door (sudo, port 53/80). Field run on a real laptop still pending.
- Kasuwa resolves to dialweb/site/39 because the SIGNED ZONE says so. If the owner wants kasuwa elsewhere, that is a zone change signed by the king's ink, not a code edit.
- Offline truth: the namespace resolves offline by construction. Internet endpoints (https) still need the internet. Local/harz-native endpoints serve offline where they exist. The door never invents.

## Corrections to earlier statements (honesty ledger)
- "Android Private DNS pointed at our DoT doorway" — OVERSTATED. Private DNS requires DNS-over-TLS (TCP 853). Cloudflare Workers cannot listen on 853. That adapter needs a TCP-capable substrate (Pi/VPS). Corrected on record Oct 2.
- The extension path needs one install PER BROWSER and cannot load at all on Chrome Android (the owner's phone). Both facts are on record from Sept; restated plainly to the owner Oct 2.

## Next rungs (owner's word each time)
1. Android VPN adapter (the Infinix path): VpnService DNS interceptor + local door, source built next, APK build needs the Android toolchain. The filmed airplane-mode phone run remains the gate for any claim.
2. HARZ Browser integration: embed the core in the browser app so its address bar resolves .harz natively (works on the phone today, no VPN).
3. Desktop field run: owner's hands, laptop with dnsd+door, film `store.harz` opening in the stock browser.

Book: 18/43, 49b7cf42 at build time. Engine pin 691fc5d8 untouched. No live system modified. No deploys.
