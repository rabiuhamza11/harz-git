# INTERNETLESS v0.3 FIELD GATE — RUNBOOK (Dad's field-test order, Oct 6, 2026)

Owner's gate: "Two phones. No internet. Camera recording." Adapted from the frozen V02
runbook (Oct 4), now targeting the FROZEN v0.3 RECOVERY-LAW primitive per Dad's ruling:
"when the two phones eventually arrive, the field gate gets this stronger candidate — not
the flawed v0.2 behavior."

Primitive: internetless-node-v03.js
sha256 98dcdd624a4901b4d0034310f22055768716079c8cdb6f6cbea0a1a7083c9a7f
Field-pull URL verified byte-identical to the frozen file on Oct 6, 2026 (Hauwa, workbench
receipt above; re-verify on-device in PREP step 3). LEG 3's full sequence (R1 through R7)
executed and verified on the workbench with the exact one-liners in this runbook on Oct 6,
2026 — first draft defect caught by that verification: A must serve and hold its own copy
(R2b) or the forward in R5 has nothing to re-deliver. Fix applied before the runbook
reached the owner's hands.

Evidence law: real device -> airplane mode -> receipt on screen -> recorded. No theater.
The run closes when every verdict is filmed with no repair or smoothing.

## PREP (once per phone, while still online)
1. Termux installed (F-Droid), then: pkg update -y && pkg install nodejs -y
2. Pull the v0.3 node (one file, zero deps):
   curl -o internetless-node-v03.js https://raw.githubusercontent.com/rabiuhamza11/harz-git/main/harz-internetless/v0.3/internetless-node-v03.js
3. VERIFY THE PULL (the hash is the law — do not skip):
   sha256sum internetless-node-v03.js
   Must print: 98dcdd624a4901b4... (first 12 chars). If it does not match, do not proceed.
4. Make a folder: mkdir nodeA && cd nodeA   (nodeB on the second phone)

## THE GATE — S6 SOVEREIGN STATE OPERATION (film from step 2)
Identical to the frozen V02 gate (seal behavior is unchanged in v0.3):
STEP 1  Airplane mode ON. Mobile data OFF. (Airplane stays ON for the whole gate except the
        hotspot in the mesh test.)
STEP 2  node ../internetless-node-v03.js init --name PHONE_A
        node ../internetless-node-v03.js seal --text "field proof record 1"
STEP 3  Screen shows: SEALED #1 link <12 hex> — fsynced to disk BEFORE this ack. Film it.
STEP 4  Force-stop Termux, then power the phone OFF.
STEP 5  Power back on. (Real reboot.)
STEP 6  Reopen Termux, cd nodeA. Do NOT re-init.
STEP 7  node ../internetless-node-v03.js seals
STEP 8  Screen shows: SEALS: 1 records — CHAIN INTACT. Film it.
STEP 9  Tamper the sealed record (Termux one-liner):
        node -e 'const f=require("fs");const L=f.readFileSync("seals.jsonl","utf8").split("\n").filter(Boolean).map(JSON.parse);L[0].env.text="tampered by attacker";f.writeFileSync("seals.jsonl",L.map(JSON.stringify).join("\n")+"\n")'
STEP 10 node ../internetless-node-v03.js seals
STEP 11 Screen shows: BROKEN at slot #1 ... exit code 1. Do not repair — the BROKEN verdict
        IS the pass. Film it. (Seals have no recovery path BY DESIGN: sovereign local state.)

## THE MESH TEST (two phones, filmed)
Phone B: hotspot ON (a LAN, not Internet). Phone A: join B's hotspot, airplane mode stays ON.
On B (own folder, own init --name PHONE_B):
  node ../internetless-node-v03.js serve --port 8990     (prints B's LAN address)
On A, in a SECOND Termux session (A must be reachable too — LEG 3 needs it):
  node ../internetless-node-v03.js serve --port 8990     (prints A's LAN address)
On A, first Termux session:
  node ../internetless-node-v03.js prove-offline --peer <B-LAN-IP>:8990
  LEG 1: Internet probe FAILED / LEG 2: HARZ peer ANSWERED. Film the VERDICT line.
  node ../internetless-node-v03.js send --to <B-LAN-IP>:8990 --text "v0.3 mesh field packet"
  B's screen: RECEIVED + VERIFIED + FSYNCED. Film it.
On B:
  node ../internetless-node-v03.js inbox     -> [VERIFIED] via re-verification just now
Kill B hard (force-stop + reopen), run inbox again: record still [VERIFIED]. Film it.

## LEG 3 — THE RECOVERY LAW (new in v0.3; film every step)
This leg proves the frozen recovery law in the field:
"A corrupt, stale-signature, or otherwise unverified disk record cannot reserve its nonce
against a valid record." Memory no longer gets to remember a truth that disk can no
longer prove.

R1  On A: send the recovery packet:
    node ../internetless-node-v03.js send --to <B-LAN-IP>:8990 --text "v0.3 recovery field packet"
R2  On B: node ../internetless-node-v03.js inbox -> the packet is [VERIFIED]. Film it.
R2b On B: give A its own verified copy (LEG 3 needs A to hold the record):
    node ../internetless-node-v03.js forward --to <A-LAN-IP>:8990
    On A: node ../internetless-node-v03.js inbox -> [VERIFIED]. Film it.
R3  On B: tamper that record on disk (Termux one-liner):
    node -e 'const f=require("fs");const L=f.readFileSync("inbox.jsonl","utf8").split("\n").filter(Boolean).map(JSON.parse);const r=L.find(x=>x.envelope&&x.envelope.text==="v0.3 recovery field packet");r.envelope.text="corrupted on disk: v0.3 recovery field packet";f.writeFileSync("inbox.jsonl",L.map(JSON.stringify).join("\n")+"\n")'
R4  On B: node ../internetless-node-v03.js inbox -> the record now reads [CORRUPT].
    The disk copy can no longer prove itself. Film it.
R5  On A: re-deliver the SAME record (forward relays A's verified copy — the identical envelope, same nonce):
    node ../internetless-node-v03.js forward --to <B-LAN-IP>:8990
R6  On B: node ../internetless-node-v03.js inbox -> the record is [VERIFIED] AGAIN, and the
    screen shows the DISCLOSURE line: corrupt same-nonce record replaced by valid arrival,
    prior copy quarantined to inbox.corrupt. Film BOTH.
R7  On B: cat inbox.corrupt -> the corrupt prior copy is preserved as timestamped evidence,
    never erased, never forwarded. Film it.

Under v0.2 this leg was IMPOSSIBLE: the corrupt copy would have masked the valid original
forever. That is the difference the frozen recovery law earns on a real phone.

## PASS CONDITION (owner ratification)
Every step's receipt on camera; airplane mode visible in the pull-down in at least one
frame; the BROKEN verdict filmed unrepaired; LEG 3 filmed through R7 with the disclosure
and the preserved evidence visible.

Proof structure: create -> seal -> persist -> kill -> reboot -> independently verify ->
tamper -> detect -> refuse; then transport -> verify -> corrupt -> re-deliver -> replace ->
preserve evidence.

The honest sentences this run earns, and ONLY this run:
1. "The record carries its own evidence; connectivity carries it, but does not make it
   trustworthy."
2. "On a real phone, with the internet dead, the truth on disk replaced the lie in memory —
   and kept the lie as evidence."

## SCOPE OF THE CLAIM
If this run passes exactly as frozen, HARZ Internetless v0.3 is FIELD-PROVEN as the
integrity/durability/recovery primitive: sealed sovereign state survives power death and
verifies independently with zero server and zero connectivity; corruption of sovereign seals
is detected and refused, never repaired; corruption of mesh records is healed by valid
re-delivery with evidence preserved. NOT CLAIMED: internetlessness of services not built or
tested against this battery; D7 (no content-level quota) remains an open availability wound,
disclosed, unpatched.
