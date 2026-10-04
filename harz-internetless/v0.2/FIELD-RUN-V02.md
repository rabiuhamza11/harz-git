# INTERNETLESS v0.2 FIELD GATE — RUNBOOK (owner-defined, Oct 4, 2026)

Owner's gate: "Two phones. No internet. Camera recording." 11 steps, then the mesh test.
Evidence law: real device -> airplane mode -> receipt on screen -> recorded. No theater.
The run closes when the BROKEN verdict is filmed with no repair or smoothing.

## PREP (once per phone, while still online)
1. Termux installed (F-Droid), then:
   pkg update -y && pkg install nodejs -y
2. Pull the v0.2 node (one file, zero deps):
   curl -o internetless-node-v02.js https://raw.githubusercontent.com/rabiuhamza11/harz-git/main/harz-internetless/v0.2/internetless-node-v02.js
3. Make a folder: mkdir nodeA && cd nodeA

## THE GATE — S6 SOVEREIGN STATE OPERATION (film from step 2)
STEP 1  Airplane mode ON. Mobile data OFF. (Airplane stays ON for the whole gate except the hotspot in the mesh test.)
STEP 2  Create identity + seal a record (in nodeA):
        node ../internetless-node-v02.js init --name PHONE_A
        node ../internetless-node-v02.js seal --text "field proof record 1"
STEP 3  Screen shows: SEALED #1 link <12 hex> — fsynced to disk BEFORE this ack. That line is the receipt. Film it.
STEP 4  Kill the process: force-stop Termux (or swipe it away), then power the phone OFF.
STEP 5  Power back on. (Real reboot — not a warm restart.)
STEP 6  Reopen Termux, cd nodeA. Do NOT re-init. The node must recover from sealed state.
STEP 7  Run: node ../internetless-node-v02.js seals
STEP 8  Screen shows: SEALS: 1 records — CHAIN INTACT (every link + every signature re-verified just now).
        This is independent verification — the read re-proves the chain, it does not trust disk labels. Film it.
STEP 9  Tamper with the sealed record (exact Termux-safe one-liner):
        node -e 'const f=require("fs");const L=f.readFileSync("seals.jsonl","utf8").split("\n").filter(Boolean).map(JSON.parse);L[0].env.text="tampered by attacker";f.writeFileSync("seals.jsonl",L.map(JSON.stringify).join("\n")+"\n")'
STEP 10 Run: node ../internetless-node-v02.js seals
STEP 11 Screen shows: BROKEN at slot #1: ENV DIGEST MISMATCH; ENVELOPE SIG FAILED
        ... SEALS: 1 records, 1 BROKEN — explicit verdicts above, no smoothing.
        The command exits 1. Do not repair anything — the broken verdict IS the pass. Film it.

OPTIONAL (stronger receipt): seal 3 records in step 2, tamper #2, expect BROKEN at slot #2 with slots 1 and 3 still verified.

## THE MESH TEST (two phones, filmed)
Phone B: Settings -> Hotspot ON (a LAN, not Internet). Phone A: join B's hotspot, keep airplane mode ON.
On B (its own folder, its own init --name PHONE_B):
  node ../internetless-node-v02.js serve --port 8990     (prints B's LAN address)
On A:
  node ../internetless-node-v02.js prove-offline --peer <B-LAN-IP>:8990
  LEG 1: Internet probe FAILED (Internet gone) / LEG 2: HARZ peer ANSWERED. Film the VERDICT line.
  node ../internetless-node-v02.js send --to <B-LAN-IP>:8990 --text "v0.2 mesh field packet"
  B's screen: RECEIVED + VERIFIED + FSYNCED — durable before ACK. Film it.
On B:
  node ../internetless-node-v02.js inbox     -> [VERIFIED] via re-verification just now
Kill B hard (force-stop + reopen), run inbox again: record still [VERIFIED] after kill+restart. Film it.
On A (kill/restart survivor + durability receipt):
  Both sides now carry receipts that the internet was never what made the record trustworthy.

## PASS CONDITION (owner ratification, Oct 4)
Every step's receipt on camera, airplane mode visible in the pull-down in at least one frame,
BROKEN verdict filmed unrepaired. Proof structure: create -> seal -> persist -> kill -> reboot ->
independently verify -> tamper -> detect -> refuse.

The honest sentence this run earns, and ONLY this run:
"The record carries its own evidence; connectivity carries it, but does not make it trustworthy."

## SCOPE OF THE CLAIM (owner ruling, Oct 4 — keeps the achievement honest and stronger)
If this run passes exactly as frozen, HARZ Internetless v0.2 is FIELD-PROVEN as the
integrity/durability primitive. This does NOT claim that every possible HARZ service is
automatically internetless. Narrow scope, exact wording:
  PROVEN: a sealed record survives power death, verifies independently with zero server and
  zero connectivity, and corruption is detected and refused, never repaired or smoothed.
  NOT CLAIMED: internetlessness of services that have not been built or tested against this battery.
No server tells the phone the record is authentic. No internet is present. No cached [VERIFIED]
label overrides the cryptographic evidence.
