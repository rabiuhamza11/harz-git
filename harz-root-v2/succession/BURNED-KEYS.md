# BURNED KEYS — refused forever (append-only record)

## BURNED SUCCESSOR KEY #1 — Sep 16, 2026 (ceremony Session 1)

PUB (ed25519): 23305bf5e14170a4edf7ed214316a0ec40a7cc8ef0f81ae44e15a7c5f9070a8b

REASON: All three 2-of-3 paper share lines (PAPER A, B, C) were pasted into a networked
chat channel (WhatsApp → Base44 transcript) during ceremony Session 1, before any
manifest was signed. Ceremony law: the paper is the keystore — the private key must
exist ONLY on paper. Once the share lines exist digitally anywhere, the key is
compromised and must be treated as stolen. It is BURNED.

CONTAINMENT (why this was cheap, not fatal): the Y2 ceremony order — successor papers
verified and stored BEFORE the king names the successor — meant nothing had been named
yet. No manifest carries this key. No zone references it. The live root (v1, e94b9693)
was never touched. Cost of the burn: three cards of ink.

LAW: any tool, verifier, ceremony, or future session that encounters this PUB as a
successor, witness, or authority candidate in ANY manifest, zone, or ceremony must
REFUSE it. Void forever. No exceptions, no recovery.

Owner hygiene performed: WhatsApp message deleted for everyone, Termux scrollback
cleared, paper cards marked VOID and destroyed, fresh key regenerated afterward.

## BURNED SUCCESSOR KEY #2 — Sep 16, 2026 (ceremony Session 1, exposure #2)

PUB: NOT YET RECORDED — owner has not sent the PUB line as text. If it is later supplied,
append it here explicitly. Until then, treat ANY successor PUB generated in this second
attempt window as suspect and unusable — do not name it in a manifest.

REASON: All three PAPER QR-CHUNKS (A, B, C) were visible in a screenshot sent into the
WhatsApp chat during ceremony Session 1. Same law as burn #1: paper is the only valid
keystore; any digital appearance of the share lines (paste OR screenshot) burns the key
on sight, regardless of whether the key was ever combined, verified, or named.

DISTINCT FROM BURN #1: this exposure came via a full-screen terminal screenshot, not a
copy-paste. Confirms the ceremony needs a stronger rule than "don't paste" — it is
"don't screenshot or photograph the terminal at all" while PRIV/PAPER material is on
screen. Rule added to the runbook going forward.

CONTAINMENT: the owner's combine attempt used literal placeholder text ("CARD A LINE")
instead of real card content, so this key was never reconstructed, never verified, and
never entered any manifest. No zone references it. Live root (v1, e94b9693) untouched.

Owner hygiene requested: delete the WhatsApp photo (delete for everyone), delete the
screenshot from phone gallery, clear Termux scrollback (`reset`), destroy any cards
written for this key, mark VOID.

## BURNED SUCCESSOR KEY #3 — Sep 16, 2026 (ceremony Session 1, exposure #3)

PUB: NOT YET RECORDED — owner never sent the PUB as text. Treat ANY successor PUB from
this attempt window as suspect and refused. Nothing was named; live root untouched.

REASON: Terminal output containing all three card share lines was pasted into the
WhatsApp chat while reporting a failed echo command. The Base44 platform secret guard
INTERCEPTED the values before they reached the agent (replaced with a placeholder in
transit) but SAVED them as detected secrets in the owner's Security settings
($HARZ_CEREMONY_KEY, _2, _3, _4). Digital storage anywhere = compromised = burned,
same law, no exceptions — even platform-mediated storage.

OWNER HYGIENE: delete the four detected secrets from Base44 Security settings, delete
the WhatsApp message (delete for everyone), clear Termux scrollback (`reset`), mark all
cards from keys #1-#3 VOID and destroy them.

PROCESS FIX (the real lesson — burns #1-#3 were one pattern): the legacy card format
(~300 chars of JSON with quotes and braces, hand-copied and typed back) was hostile to
a human on a 2GB phone. KIT v1.2 --split-hex HAND-COPY MODE: plain-hex cards (193
chars, 0-9 a-f and one slash, no punctuation), a CHECK sha8 fingerprint per card
(safe to write on the card), and check-card.js — typos are caught LOCALLY on Node 1 by
checksum, card content never needs to leave the phone in any form. Battery: cards
3/3 MATCH, typo MISMATCH caught, messy typing tolerated, combine hex + legacy both
RECONSTRUCTED, derive-pub A+B and B+C identical to kit PUB, deterministic x2.
