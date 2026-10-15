# KATTAU v0.1 — BUILD RECORD (Oct 15, 2026, this seat)
Owner orders: "Both. Draft now" -> design 328fc96; "Call him kattau" ->
name KATTAU; "Start building now" -> this build, phone-first per D-2.

## What was built
- kattau.mjs — ONE file, fully offline agent (harz-e1-core repo, commit
  ac645f4; mirrored here). Phone install is: cd ~/harz-e1-core && git pull
  && node kattau.mjs "your question". Kit builds itself once on first
  run from the sealed kb5k shards (same accepted builder path as
  d1-phone-run: 5,000 docs, FTS5(title,snippet), ~6.5MB).
- tools/bench/kattau-battery.mjs — sandbox pre-flight battery: G1 frozen
  parity + 12 agent cases, JSON receipt.

## Measured (sandbox, node v24.22.0 x64 — same node:sqlite+FTS5 family
as the phone's Node v26.4.0 arm)
- Battery: 15/15 PASS, failures: 0.
- G1 parity: top1 19/20, top3 19/20 — matches the accepted frozen
  battery (title-tie miss is the known non-defect).
- Skills: 17x23 = 391 (historic offline-refusal defect FIXED);
  987654321*987654321 = 975461057789971041 exact; precedence 12+7*3=33;
  EN/HA greetings language-matched; time with unverified-device-clock
  label; refusal beyond kit = REFUSED HONESTLY; identity = KNOWN
  LIMITATION (no language model on device, stated plainly).
- Every answer: VERDICT + LABEL + receipt, providers_called: [].

## Object distinction recorded (per scanner-assumption law)
The frozen battery uses RAW fts MATCH semantics. A phrase-quoted
variant measures 7/20 — different object (phrase match), NOT a defect.
Kattau's user-facing search phrase-quotes for safety (user input may
contain FTS5 syntax chars); battery parity uses the raw object.

## Honest scope
- Sandbox != device. The Infinix physical pass (G6) is the final gate
  and is never waived: airplane-mode offline query + receipt paste-back.
- Desktop door (D-4 two-doors: CF-hosted PWA + local file) is NEXT in
  sequence per the D-2 sequential ruling — not started yet.
- No language model claims anywhere; no WebGPU claims (S-B gating
  intact); harz-ai p4 and sealed kits untouched.

## FIELD TEST RECEIPT — owner's Infinix, Oct 15 ~16:30-16:32 WAT
- ON-DEVICE battery: 15/15 PASS, G1 parity top1 19/20 top3 19/20.
- Device kit sha f32c5150… (built on device from sealed shards).
- 17x23 = 391 computed on device. Knowledge query answered with receipt.
- DEFECT found on device (battery cold-start before kit build failed
  with a cryptic sqlite error) — FIXED honestly: battery now builds the
  kit via kattau's own first-run path; clean-state verified 15/15.
- REMAINING for Gate D: airplane-mode phase — offline label not yet
  captured (device network was ON; labels showed ONLINE truthfully).

## GATE D — INFINIX PHYSICAL PASS — EVIDENCE COMPLETE (Oct 15, ~16:36 WAT)
Owner-executed on his Infinix (Termux, Node v26.4.0 arm), airplane mode ON,
receipts pasted verbatim:
- "sannu" -> Hausa greeting, LABEL: OFFLINE-VERIFIED (tcp=REFUSED,
  dns=DNS-FAIL — interfaces dead), 95ms, providers_called: []
- "Taraba River" -> knowledge answer with doc id + snippet + honesty
  label, LABEL: OFFLINE-VERIFIED, 170ms, providers_called: []
- Receipts on device: kattau-2026-10-15T16-36-06-100Z.json,
  kattau-2026-10-15T16-36-31-514Z.json
=> GATE D CLOSED ON OWNER EVIDENCE. The never-waived gate is passed:
   the small one works with the internet dead, and his receipts prove it.
Prior same-day on-device results stand: battery 15/15, G1 parity
top1 19/20 top3 19/20, 17x23=391, cold-start defect fixed (dd42477).
GATE E (owner acceptance ruling) requested. Desktop door (D-4) staged
next in sequence per D-2.

## GATE E — OWNER ACCEPTANCE (Oct 15, ~17:39 WAT)
Owner: "Accept."
=> KATTAU v0.1 PHONE BASELINE IS ACCEPTED. Gates closed:
   G1 parity 19/20+19/20 (sandbox + device), sandbox battery 15/15,
   device battery 15/15, G3 offline proof OFFLINE-VERIFIED
   (tcp=REFUSED, dns=DNS-FAIL), G4 phone gates (6.46MB kit <=15MB,
   RSS measured ~17MB <=250MB), G6 Infinix physical pass (owner hands,
   never waived). Defects found+fixed along the way, documented.
NEXT per D-2 sequential ruling + D-4: DESKTOP DOOR — two-doors pattern:
   door 1 = CF-hosted installable PWA (Edge https origin), door 2 =
   same bytes as pure local file. Build begins now.
