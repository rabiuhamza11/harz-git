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

## UPDATE — SESSION 1 CLOSED (Sep 16, 11:32 WAT)

Owner confirmed by word: all 3 cards written per the ink protocol (rows of 24, slash at
row 5, CHECK values in corners). The successor private key now exists ONLY as ink.
Terminal side closed (reset). PUB 7f970c91... recorded above and in git.

STORAGE LAW (owner's D6 structure): the 3 cards go to 2+ SEPARATE places — Bauchi office,
trusted person, Jalingo safe-or-desk. Storage is a hands-act: as soon as travel allows.

NEXT CEREMONY SESSION: witness seats W1/W2/W3 (gen-key --role witness --split-hex x3,
cards to INDEPENDENT hands — Y3: one hand holding all seats = quorum theater), then the
manifest signed on Node 1, then freeze, then true-mode killer test, then live migration.

OPEN HYGIENE (from burns #1-#3): delete the 4 detected secrets from Base44 Security
settings ($HARZ_CEREMONY_KEY x4), delete the old WhatsApp messages, destroy VOIDed cards.

## UPDATE — Sep 20, 2026, ~18:45 WAT: FOUNDING KING RE-FORGED (ink key #5)

Owner ordered the re-forge after candidate #4's ink cards went unfound: three typed
attempts Sep 20 all reconstructed witness W3 (a1348ed9); #4's cards never located;
legacy ZSK private also unfound (see LOST-KING-RECORD correction 008698ca).

NEW FOUNDING KING — generated on Node 1 (ceremony-kit.js gen-key --role successor --split-hex):
PUB (ed25519): 21a268f4ca06f936147a2060a6a0bff04fbd8bd8c244ea5152185864604eb035
PUB-SHORT: 21a268f4ca06
Private: 2-of-3 split, three hand-copy cards, INK ONLY after the phone wipe.

CANDIDATE #4 (7f970c910c75783d4b763028303bfc5eba9b8ca462fec92e3f357d7e57f5af0d) is
RETIRED as founding candidate. If its cards ever surface, they are archive only —
NEVER name #4 in any manifest.

Finisher updated to crown #5: git commit e7705b60.
Ceremony path: ink protocol (rows of 24, slash opens row 5, CHECK corners) ->
kit verify via copy/paste (never typing) -> founding signed from byte-perfect
copies -> digital wiped (rm + reset). Ink becomes the only keystore.
Witness bench W1-W3 unchanged. Burns #1-3 law unchanged.

## CORRECTION — Sep 20, ~19:20 WAT: INK #5 BURNED BEFORE SIGNING

The founding king recorded above (PUB 21a268f4...) was burned before the founding
act was signed: all three card share lines were pasted into the WhatsApp chat
(exposure #4 — see BURNED-KEYS.md #4). It never signed anything and must never be
named in a manifest. A fresh key (#6) must be generated on Node 1 before the
founding can complete. Candidate #4 (7f970c91) remains retired. The finisher
currently crowns the burned #5 — it MUST be re-pointed to the new key before any
use. New permanent rule recorded in BURNED-KEYS.md: the key window is a no-chat
window; only the PUB line leaves the phone before signing.

## INCIDENT (NOT A BURN) — Sep 20, ~19:33 WAT: KEY #6, ONE CARD LINE REACHED CHAT

During the no-chat ceremony session for fresh key #6 (pub not yet shared by owner), the
owner pasted a card's content as a check-card.js COMMAND ARGUMENT instead of into the
pA.txt file; the resulting ENOENT error — whose path IS the card line — was then pasted
into WhatsApp as a bug report.

EXPOSURE: exactly ONE card (two 96-hex shares of the 3-way split).
VERDICT: NOT A BURN. One card cannot reconstruct the key — the split requires any TWO
of three cards (kit design law: "one photo = nothing"; burns #1-#4 were all full
exposures). Key #6 remains cryptographically sound and the founding may proceed.

MARGIN REDUCED: the two remaining cards now carry the entire secrecy margin.
LAW: any further exposure of EITHER remaining card = BURN ON SIGHT.
The exposed card remains usable for 2-of-3 recovery but is public knowledge.

Hygiene requested: delete the WhatsApp message (delete for everyone).
New user rule recorded: never paste anything containing long hex into chat — describe
errors in words. Card content never goes on a command line; it goes inside the file
(cat > pA.txt, press Enter FIRST, then paste, Enter, Ctrl-D once).

## OWNER RULING — Sep 20, ~19:40 WAT: NO-CHAT WINDOW RULE REPEALED

By owner order ("remove this law now"), the no-chat window rule enacted after burn #4
is REPEALED. The owner may communicate with the agent at any point during the
ceremony, including inside the key window (gen-key -> paper -> verify -> sign -> wipe).

STANDING UNCHANGED (owner kept these by choice):
1. The burn law — full key material reaching any chat burns the key on sight
   (burns #1-4 stand; single-card exposure ruled an incident; key #6's margin is
   the two unexposed cards; any further card exposure = burn on sight).
2. Agents never receive, hold, combine, or verify card share material (0xCA28 law).

Note for the record, honestly: the open chat carries exposure risk; the owner accepts
it as ruling authority. The agent's duty is to judge what reaches the chat, not to
gag the owner.

## CORRECTION — Sep 20, ~20:30 WAT: THE REFUSAL THAT SAVED THE CEREMONY

The owner ran the v3 finisher; it printed: REFUSED: BURNED key #4. This proves
king-pub.txt contained 21a268f4 — the BURNED king's pub. The gen-key screen the
owner copied from all evening was the OLD output from ~18:50 (burn #4's key). No
fresh key was ever generated after burn #4.

What this corrects: the earlier incident entry framed the ENOENT card line as
"fresh key #6's card" — it was actually the burned king #5's card. Nothing changes
about the burns: key #5 (21a268f4) was already burned at 19:20 when all three card
lines reached the chat.

What happened at 20:27: the owner's card files pA/pB/pC (all CHECK-MATCHed) and
king-pub.txt reconstructed the BURNED king. The finisher's REFUSE list caught it at
the last gate. NOTHING WAS SIGNED. Fail-closed held exactly as designed.

Cleanup ordered: rm pA.txt pB.txt pC.txt king-pub.txt; VOID and destroy the #5
paper cards. NEXT: a REAL fresh generation (gen-key), then paper, PUB, verify,
finisher — the owner has now practiced every step.
