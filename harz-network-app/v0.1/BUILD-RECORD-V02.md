# HARZ Network App v0.2 — Phone-Today Path (Oct 2, 2026)

Owner word: "Go on" (Oct 2, after v0.1). The .harz address bar on the owner's Infinix TODAY — no VPN, no extension, no Cloudflare token, no store approval.

## What is built
1. `harz-door.js` v0.2 — the door now also IS the HARZ address bar:
   - `GET /` serves the address bar page (door host ≠ *.harz)
   - `GET /resolve?name=` returns the sealed answer as JSON with receipt (NOERROR 200 / NXDOMAIN 404)
   - `*.harz` Host-header routing to endpoints unchanged (302 + x-harz-receipt)
   - `HARZ_ZONE` env override so Termux deployments can point at the sealed zone file
2. `harz-netapp-browser.html` — a 2.6KB single-file address bar. Type `kasuwa.harz`, press Open: asks the local door, shows the receipt, opens the sealed endpoint. Honest NXDOMAIN displayed with receipt. Built light for a 2GB-RAM Infinix: no framework, no build step.
3. `phone-start.sh` — Termux start: finds the harz-git checkout, boots the door on 127.0.0.1:8080 with the sealed zone, opens the address bar in the phone's stock browser.

## Live tests (my own runs, sandbox)
- Door serves the page (title verified).
- `/resolve?name=kasuwa.harz` → NOERROR, endpoint https://harz-dialweb.harz.workers.dev/site/39, receipt 48c3a325b18c.
- `/resolve?name=ghost.harz` → honest NXDOMAIN, receipt c6d68e3eb111.
- Host routing regression: `Host: pay.harz` → 302 https://harzpay.harz.workers.dev (unchanged).
- Core battery re-run after door changes: 10/10 PASS (core untouched, adapters only).

## Honest limits
- WORKBENCH ONLY until the owner's filmed run on the Infinix (Termux + phone-start.sh, type kasuwa.harz, film the receipt + the open).
- Resolution is local and offline by construction (door + sealed zone on device). Opening an https endpoint still needs internet — the page never invents and the receipt shows which node vouched.
- The address bar lives at http://127.0.0.1:8080 — inside the device, not the stock browser's own URL bar. The stock-browser address bar remains the VPN adapter's rung (Android source next, APK needs the Android toolchain).

## Next rung
Android VPN adapter source (Kotlin, VpnService DNS interceptor + on-device door) — the path that puts `kasuwa.harz` into the STOCK Chrome address bar on the Infinix with airplane mode on. APK build needs the toolchain; the filmed field run stays the gate.
