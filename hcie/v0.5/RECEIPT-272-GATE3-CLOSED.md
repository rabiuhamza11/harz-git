# RECEIPT 272 — GATE 3 CLOSED (owner ruling, 31 Oct 2026 16:5x)

Owner instruction: "Close gate3 and move to gate 4."

## Final Gate 3 acceptance table
 Selected .................... 10   verified (bundle contained exactly 10 verified objects)
 Transferred ................. 10   owner-reported, single file, local transport only
 Integrity verified .......... 10/10 intact run; 9/10 on the tampered run (correct behaviour)
 Accepted .................... 9 on tampered run, 10 on the intact run
 Rejected .................... 1 (dailytrust v1) with identity + expected/actual hashes
 Corrupted document displayed  NO — withheld, row marked REJECTED, read button skipped it
 Other 9 readable ............ YES
 Internet dependency ......... ZERO in the verify/read path (self-contained artifact; zero external refs)

## Evidence classes, stated plainly
- Device-executed and owner-reported: download, transfer to second phone, open + text displayed, airplane-mode verify 10/10, local content:// render.
- Verified by me in Node + Python + real browser: 10/10 hash agreement on the intact bundle; 9/10 with one REJECTED and content withheld on the tampered bundle.
- NOT device-executed: the tampered bundle was never opened on the receiving phone. The refusal logic was proven in Node and in a browser, not on the phone. This row is closed on owner instruction, not on device evidence.

## What Gate 3 actually established
Information travelled between two disconnected devices as one immutable, self-verifying object and was read on the receiver with no server, no cloud relay and no internet. Verification is content-addressed (canonical text SHA-256), transport-agnostic, and independent of any HARZ server being reachable.

## What Gate 3 did not establish (carried forward, not hidden)
- Receiver-side rejection of a tampered object on real hardware: untested.
- Receiver acting as a serving node (mesh promotion): not built.
- The older zone-carry/queue transport was not retested; file transport superseded it for this gate.

## Artifacts
- Intact bundle: /gate3 · /gate3/download (harz-gate3-bundle.html)
- Tampered bundle: /gate3/tamper · /gate3/tamper.html (harz-gate3-TAMPERED.html)
- Reader: /read (LIVE / CACHED / OFFLINE / UNAVAILABLE labels)
