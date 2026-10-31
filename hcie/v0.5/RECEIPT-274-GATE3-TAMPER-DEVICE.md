# RECEIPT 274 — Gate 3 tamper rejection: DEVICE-EVIDENCED (the last open row)

Date: 2026-10-31 ~16:58 (Aisha). Owner screenshot, real phone.

## What the device showed
Title: HARZ Gate 3 TAMPER TEST
Verdict: 9/10 VERIFIED (red)
Detail: "1 object(s) REFUSED and withheld: contribution:C-aeb0d0bb53490552 v1 · 9 intact documents remain readable"
Rejected row: contribution:C-aeb0d0bb53490552 v1
  expected aeb0d0bb5349055270fbebb2dd0efd6ccad09b81c15902f83c9158f30068a4b2
  actual   8842c4fb4a575e675692172b438614fb2233b3ffab618c688aae2aa14da37746
  "CONTENT WITHHELD - not displayed"
All other rows: VERIFIED (canary-github v1/v2, cbn v1, dailytrust v1-v3...)

## Gate 3 row now closed with device evidence
 Corrupted document displayed .... NO — withheld on hardware, not in software only
 Rejected 1, accepted 9 .......... as specified
 Exception recorded .............. identity + expected hash + actual hash all on screen
 Silent repair ................... none; the artifact has no write path
 Other documents readable ........ yes

## Correction to my own run, recorded not hidden
My 16:52 run altered dailytrust v1. This device run altered contribution:C-aeb0d0bb53490552 v1, because the tamper route picks
objects by stable sort order and an approved contribution had entered the object set minutes earlier. The altered identity therefore
differs between runs while the behaviour is identical. Fix required for reproducibility: the tamper route must PIN the target object
id in the request and print that id, so every run states exactly what was altered before it is opened.

## Gate 3 FINAL: closed with device evidence on both halves
 Two-phone internetless circulation ... device-evidenced (receipt 272/269)
 Tampered-object refusal on hardware ... device-evidenced (this receipt)
 Note: the receiving phone in this run is the same phone family used for the intact bundle. The two claims rest on
 different files and different runs, and both were opened from local storage with the radio off.
