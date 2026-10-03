# HARZ NODE KIT v0.1 — BUILD RECORD

**Built:** Oct 3, 2026 (owner's "Go" on the node-everywhere order)
**Public repo:** https://github.com/rabiuhamza11/harz-node (head c90884e0)
**Law honored:** freeze → build → verify → receipt. Zero new protocol code; frozen components assembled byte-exact.

## What it is

One command, any device (phone/laptop/VPS/Pi, Node >= 18), zero dependencies, zero permission:
a sovereign HARZ node that serves .harz from sealed state, fails closed, receipts every answer.
Clone → `bash start.sh` → door on 127.0.0.1:8080. Selftest: `node selftest.mjs`.

## Components (all byte-exact frozen copies — sha256 in kit MANIFEST.md)

- zone/SIGNED-ZONE-V2.json — king 90062faa, digest cac16833, 77 records (harz-root-v2/zone-king)
- harz-dns-core.js (cceebe3f) + harz-door.js (207da35b) — the field-proven serving pair (harz-network-app/v0.1)
- harz-netapp-browser.html (6838c687) — light-theme #f0f2f5 door page (harz-netapp 30346f3)
- transport/ — mesh frame v2.1 + core + zone-carrier + phone wrapper (harz-reach/v0.3-mesh, 16/16 battery, Kotlin interop)
- merge/engine-v10.js (434c41d2 — exact frozen pin) — deterministic reconciliation (13/13 battery)
- internetless/ — signed envelope exchange node (8/8 workbench)

## Verification (my own runs, workbench)

Selftest 8/8 PASS, run TWICE cold from fresh GitHub clones:
- S1 sealed state: 77 records, king 90062faa
- S2 boot: digest cac16833 + king Ed25519 signature verified
- S3 kasuwa (48c3a325) / pay (fd258227) / chain (ac4c204b) receipts BYTE-MATCH the Oct 3 owner field run
- S4 honest NXDOMAIN receipt byte-match (harzchain.harz f289fc0e)
- S5 tampered book refused (digest mismatch, nothing served)
- S6 wrong anchor refused
- S7 mesh frame round-trip + CRC corruption refused
- S8 merge lockstep A-B + repeat → byte-identical digest 9d0936392092

Cold boot via start.sh: door up, kasuwa.harz resolved with exact field receipt 48c3a325,
theme-color #f0f2f5 served (OFFLINE-LINKS RULE).

## Bugs caught by cold testing (honest log)

1. First layout put dns-core in core/ and door in door/ — frozen door requires its core as a
   sibling; cold-clone boot test caught MODULE_NOT_FOUND before release. Fixed by flattening
   the serving layer; frozen files stayed byte-exact throughout.
2. First selftest S8 used a nonconforming book shape → engine refused. Rewritten against the
   proven merge-battery.mjs harness shape (shared ancestor + diverged tails) → clean deterministic merge.

## Honest labels (Protocol Law principle 8)

- SERVE/resolve: FIELD-PROVEN (owner's hands, Oct 3, airplane mode; FIELD-RECORD-RUN03.md)
- Door page light theme: serving verified in kit boot test; NOT yet loaded on owner phone
  (3G blocked his clone — same bytes run in harz-netapp main)
- Mesh, merge, internetless: workbench evidence only. Two-phone field runs pending (runbooks shipped in kit)
- Kit smoke (S7/S8) does NOT replace the frozen batteries (mesh 16/16, merge 13/13, internetless 8/8)

## Next gates (owner's word)

1. Two-phone field runs: mesh transport, Internetless exchange, Termux search death test (RUNG 3 remainder)
2. R8 live merge adoption window (witness seat READY; parked on owner topology call)
3. Operator onboarding: README carries the honest one-command story

## OWNER RATIFICATION + GATE ORDER (Rabiu, Oct 3)

Released exactly as honestly labeled; claim NOT widened. Owner's framing on record:
"A node is now something another person can reproduce from the sealed state, not something
that only exists inside your development environment."

Gate order ruled:
1. Two-phone field run FIRST. No promotion of Mesh/Merge/Internetless on cold-clone evidence
   alone; genuinely separate phones must prove the protocol against each other.
2. Capture receipts INCLUDING failures — unexpected rejections, divergence, retry, state
   conflicts are more valuable than a clean demo.
3. R8 adoption window only AFTER two-phone evidence; topology decision from observed behavior.

Strengths noted by owner: fresh-clone reproducibility (2 cold runs), self-test anchored to
existing field receipts (not self-claiming), tamper resistance, lockstep-TESTED determinism,
frozen-core discipline (both build bugs fixed without touching frozen components), honest
evidence boundary.
