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
