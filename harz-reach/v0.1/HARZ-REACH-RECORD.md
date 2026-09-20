# HARZ REACH v0.1 — THE CAPABILITY LAYER ABOVE THE FROZEN ROOT (Sep 20, 2026)

The owner froze the root ("do not change the root again yet") and named the next system:
Reach — a person opens any normal browser and .harz resolves with zero DNS knowledge.
Root: UNTOUCHED tonight. Reach rides ON TOP of the signed book.

THE CONTRACT (owner's 8 points) → delivered:
1. User installs extension → Chrome MV3, load-unpacked, zero config on install
2. No manual DNS configuration → none anywhere; the signed root is baked into the trust bundle
3. pay.harz, search.harz, … resolve through the signed root → door page + DNR redirect
4. Verify the returned zone signature locally → WebCrypto Ed25519 vs king 90062faa, EVERY load,
   even from cache; floors 77/1 enforced (resolver v1.3 law)
5. Follow the service record → auto-follow with receipt + "Follow now"
6. Internet-less fallback → cache-first: verified cached book serves when root is unreachable
   (mesh transport = later rung, as the owner wrote)
7. Unknown .harz names stay unknown → honest NXDOMAIN, no fake resolution, no search hijack
8. Every resolution produces a receipt → stored locally, last 50, popup + receipts page

FILES: reach-core.js (pure law, no chrome APIs — same law as worker v3 + resolver v1.3),
manifest.json + rules.json (DNR redirect: any *.harz main_frame navigation → the door),
reach.html/reach.js (the door: cache-first, verify-always, receipts, auto-follow),
background.js (keeps the book warm, 60min refresh, re-verifies even from cache),
popup + receipts pages (light #f0f2f5, status + receipt log).

BATTERY reach-battery.js — 13/13 PASS against the LIVE root:
R1 live book verifies (anchor+floors+sig) | R2 live == sealed SIGNED-ZONE-V2.json byte-canonical
R3 77/77 resolve | R4 pay.harz → harzpay endpoint | R5 honest NXDOMAIN
R6 shrink REFUSED | R7 rollback REFUSED | R8 wrong anchor REFUSED | R9 tampered REFUSED
R10 cache roundtrip byte-identical | R11 DEATH: root unreachable → cached book verifies + resolves
R12 receipts complete (RESOLVED + NXDOMAIN) | R13 empty world REFUSED (no guessing)

DESK AUDIT FLAGS — honored under the freeze:
- /pub 404: root stays frozen; Reach BAKES the king pub, so the extension door does not wait on
  it. /pub returns only if the owner later orders an unfreeze.
- old extension v1.3 / resolver v1.2 orphaned: correct — Reach v0.1 is their replacement (v2-line).
- hns delegation + kasuwa.harz dead target: both are ZONE CONTENT — they ride the NEXT king
  signing (height 2), never the frozen worker.

HONEST LABELS (no overclaim):
- Extension field test PENDING: sandbox cannot install a Chrome extension. Needs a real
  Chrome (desktop) "Load unpacked". The one behavior only field-testable: DNR
  regexSubstitution relative redirect (*.harz → door page) — the core/door logic is proven.
- Door-page BROWSER TEST PENDING: browser tool outage tonight (410). API/real-fetch verified
  only, per the standing order. The same fetch+verify+render path passed a real browser test
  earlier tonight on the root's /go/pay door (migration verification).
- Chrome on Android does not load extensions — on the Infinix the zero-install door is the
  root's /go/ path (already live). Reach v0.1 targets desktop browsers.
- 2GB Infinix: no impact — the extension is not for it; the root door serves mobile.
