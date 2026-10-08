# ROW 064 — HARZ OFFLINE READER v0.3 FIELD PROOF — ONE-FILE MICRO READER (Oct 7, 2026)

## What is sealed here
The complete offline search → open → find chain of the HARZ Offline Reader on the
owner's real phone (Infinix Hot 10i, 2GB RAM, Jalingo, WAT), captured as dated
field receipts, closing the last open item of the v0.3 field proof.

## The artifacts
1. *Micro kit* (reader-v03, default install path): 411 full pages,
   3,503,364 chars, engine digest 2e02a4067c63f247…, download 1.15MB
   (5x smaller than the pocket kit — owner's 3G download completes in minutes).
2. *One-file reader* harz-reader-onefile.html — no server, no Termux, seals
   verified in-browser. Build sha (fixed build): 47adb9e6…

## Field receipts (owner's hands, screenshots on camera)
1. *Receipt #2 — Oct 7, 8:54PM:* airplane mode ON, micro reader at
   http://127.0.0.1:8802 — search "Nigeria tax" returned 135 results (workbench
   count matched), header shows 411 full pages / 3,503,364 chars / digest
   2e02a4067c63f247, results labeled OFFLINE with READ LOCAL COPY.
2. *Receipt #2b — Oct 7, 8:53PM:* full local article read offline from the
   micro kit (full-length char badge shown).
3. *Receipt #3 — Oct 7, ~11:40PM:* one-file reader in Chrome offline — article
   view OFFLINE local copy, CACHED 2026-10-06T20:38:24Z, FULL TEXT 5,013 chars
   (nairametrics INEC article), and the in-page FIND highlighted "INEC".
   This closes the FIND-in-article test, the last open item.

## Honest notes
1. First one-file build FAILED FAIL-CLOSED on the phone: template newline change
   altered the hashed bytes; fixed and re-verified in real Chrome before shipping.
2. Known quality issue (open, not blocking): extracted text can begin with site
   nav-menu junk; cleanup is scheduled as a corpus-side transform with its own
   seal (engine stays byte-frozen).
3. The banner label printed "POCKET" in a micro boot once (installer text bug);
   kit identity was never ambiguous — seals and download size verify the kit.
   Installer fixed same night (commit ef113010abdb label dynamic).

## Claim earned
Offline search, open, and find-in-article are field-proven on the owner's
phone with zero internet, on two builds (server micro kit + one-file).
The engine and search core remain byte-frozen; corpus growth continues
append-only under the standing honest-boundary rule.

Verified by Magani from owner-supplied screenshots (airplane-mode icon, URLs,
counts, char badges, digest, FIND highlight visible in each). Field evidence
is owner's hands per the standing evidence law.
