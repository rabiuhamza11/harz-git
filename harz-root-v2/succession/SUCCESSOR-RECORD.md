# SUCCESSION RECORD — successor key candidates (append-only)

## SUCCESSOR CANDIDATE #4 — LIVE CANDIDATE (Sep 16, 2026, ceremony Session 1)

PUB (ed25519, for git/manifest): 7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d
PUB-SHORT: 7f970c91

STATUS: candidate. PUB recorded; 2-of-3 plain-hex cards (193 chars each) hand-written on
paper per the ink protocol (rows of 24 characters, slash starts row 5, CHECK sha8 in each
card corner). NOT yet named in any manifest. Private key exists ONLY on the paper cards —
nowhere digital, by law.

FLOW OF RECORD (kit v1.2.1 no-typing ceremony): gen-key --role successor --split-hex on
Node 1 (Termux, Infinix), fresh run after burns #1-#3 (see BURNED-KEYS.md — all
predecessor PUBs refused forever).

LAW: this PUB becomes authority ONLY via a valid SUCCESSION manifest signed by the
living king (ZSK, on Node 1) naming it. Witnesses COMPLETE, never APPOINT. Nothing else
crowns this key. Until that manifest exists and is signed, this is a candidate, not a
successor.

NEXT CEREMONY STEPS: witness seats W1/W2/W3 (gen-key --role witness --seat W1/W2/W3
--split-hex; Y3 LAW: a witness seat is only real when its papers live in a DIFFERENT
hand — Bauchi office / trusted person / Jalingo safe-or-desk, two buildings two hands
minimum; papers held by one hand = quorum theater) -> manifest (ZSK never enters chat;
Rabiu signs on Node 1) -> freeze -> true-mode killer test -> live migration to v2.
