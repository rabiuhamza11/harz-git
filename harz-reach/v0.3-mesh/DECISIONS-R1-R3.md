# GATE 3 DECISIONS — R1/R2/R3 (Sep 21, 2026, ~01:25 WAT)

Status: ruled under standing delegation (owner "Go on" following published
recommendations; owner may override any item with one word).
Channel ruling (R3, in force for this record): GitHub repos are the AUTHORITATIVE
receipt store for cross-desk work. Each seat's row ledger mirrors and cites the
commit SHAs. This file lives in the authoritative store so both seats can read it.

## R1 — FIELD-TRACK WIRE PROTOCOL
The G1/G2 field track is the FROZEN v2.1 binary wire: rebuild1 (Kotlin commit
12b5991) + the JS twin (mesh-frame.js / mesh-core.js, byte-interop proven both
directions, audit/INTEROP-RUN.txt). It is frozen, interop-proven, and
phone-runnable today over Termux.

FORK DISPOSITION (fork-refusal discipline — halt, no silent reconciliation):
- The v2.2.1 protocol written by the desk seat (JSON frames + PSK encryption +
  immutable-core Ed25519) is a NEW protocol candidate, NOT v2.2.x.
- It must NOT wear the v2.2.x version line (collision with rebuild1, which owns it).
- It enters the field ONLY through an explicit freeze ceremony ordered by the
  owner. Never by version collision, never by silent replacement.
- Until that ceremony: rebuild1 + JS twin is the only field-track protocol.

## R2 — RADIO ARMS vs HOTSPOT LAN
The zone-carry field sentences may be earned over hotspot LAN via the JS twin
(RUNBOOK-PHONES-MESH.md), with the honest label: transport = LAN TCP, not the
frozen radio arms. Wi-Fi Direct / BLE arms remain UNCOVERED until a compiled
Android app passes a field test. One phone session may earn both sentences:
zone-carry first (sealed runbook, no code changes), then the arms per this ruling.

## R3 — AUTHORITATIVE LEDGER
GitHub repos (harz-git et al.) = authoritative receipt store for cross-desk
receipts; append-only, cross-seat readable, read-back verified. Desk row ledgers
mirror and cite SHAs. This resolves the mutual-invisibility divergence recorded in
the Sep 21 cross-desk audit (my receipts in harz-git, the desk's rows in
harz-survivor/anchors/ledger.md ending Sep 14 08:40Z, neither citing the other).
Mirror obligation: each seat records the other's SHAs in its ledger rows.

## STAMP (corrected per cross-desk audit, supersedes prior wording)
GATE 3 — WORKBENCH PROVEN · LIVE-FIRE PENDING.
The 16/16 battery, harness 20/20, and byte interop are workbench evidence. The
live-fire claim waits for the two-phone field run. Harness clarification: the
"existing harness 20/20" is the Kotlin SelfTest of commit 12b5991 (always labeled
so in audit/G3-1-HARNESS-RUN.txt); the desk's row-17 harness (8/8) is their ledger's
internetless battery, a different artifact.

## FIELD-SESSION CORRECTION
The runbook's pull loop fetches FIVE files (mesh-phone.js, mesh-frame.js,
mesh-core.js, zone-carrier.js, reach-core.js). Earlier messages saying "six files"
were a miscount — the runbook text governs.
