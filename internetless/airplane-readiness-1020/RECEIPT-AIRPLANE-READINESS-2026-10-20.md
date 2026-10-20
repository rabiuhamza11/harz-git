# AIRPLANE-READINESS LAYER (Nuruddeen, Oct 20 2026 ~17:30 WAT)

Trigger: owner's Infinix airplane test attempt (17:07-17:09). Phone honestly reported
192 "failed transfers" and unstored packs (CBN, NAFDAC, NIS, Al Jazeera) — root cause: the
256MB pack download kept getting interrupted (airplane mid-run, 4G drops, screen-off doze),
and the UI gave no readiness signal. Receipts worked; the phone was simply not finished.

## THREE FIXES SHIPPED (SW + shell, both KV-deployed, readback-identical, live-verified)
1. AIRPLANE READY BANNER: the receipts panel now leads with a status box —
   "NOT READY FOR AIRPLANE — X of 232 stored. Stay online and keep this page open."
   flips to green "AIRPLANE READY — all 232 stored and hash-verified" only when
   verified==total AND corrupt==0 AND failed==0 AND pending==0. Impossible to start the
   airplane test too early without seeing it.
2. AUTO-RESUME: heal loop now guards against overlap, retries each URL 3x with a 120s
   per-fetch timeout (AbortController), auto-starts a new round 20s after an incomplete
   finish (up to 12 rounds), and a 60s kicker keeps resuming while the page is open.
   No Sync tap needed for packs; interrupted downloads always continue.
3. HONEST OFFLINE SEPARATION: SW now tags fetch failures that happen while offline as
   err:'offline'; panel shows them as "offline attempts (not errors)" instead of scary
   failures. Real online failures stay 'failed'. (Phone picks this up with the SW update;
   banner + auto-resume are shell-side and live immediately.)

## BROWSER VERIFICATION (live, Oct 20 ~17:25)
- Banner renders: "NOT READY FOR AIRPLANE — 200 of 232 stored…"
- 200 delivered & verified, ZERO corrupt (every completed download hash-matches the
  served-layer journal — no storage/served mismatch remains).
- Auto-resume observed live: rounds re-kick, per-run progress "8/11 this run", kicker active.

## OWNER RUNBOOK (the Infinix gate)
1. WiFi on, open the library, keep the page open with the screen on (~256MB total; the
   largest single packs are 8-15.7MB; SON 15.7MB, NDIC 14.0MB, Premium Times 13.3MB).
2. Wait for the green banner: AIRPLANE READY — all 232.
3. Airplane mode. Everything opens: corpus docs, visual packs, CAC video.
4. Honest limits: the 24h SW update throttle means the offline-tagging fix may land on
   the phone a day late; banner and auto-resume apply immediately (shell-side).

## FILES
sw-airplane.js, shell-airplane.html (deployed bytes, readback-verified).
