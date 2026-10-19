# SHELL COLLISION + FRESH-PHONE RE-SYNC — Oct 19, 2026 ~20:30-20:55 WAT (Nuruddeen)

## Owner device evidence (6 photos, 8:22-8:31 PM, airplane)
- CAC/EFCC/NYSC/SEC all "This page is not stored on this phone yet" (honest fallback working).
- Photo at 8:31 PM showed an OLD shell on the phone: EFCC "6 section pages", no SEC, "Sync all 1965 pages
  + 68 pack pages", last sync 10/17 8:09 AM, in phone cache 932/1965, packs 3/3.
- Reading: phone cache was wiped by SW r12 activation (my bump) and had not re-synced; the shell it
  displayed was a stale fallback copy.

## Root cause of repeated regressions: ONE KV KEY (v2.shell), THREE WRITERS
Desks (SEC pack, v0.9 library growth to 1,965 docs, EFCC pack pages) each read-modify-wrote v2.shell
from stale bases. Last writer wins -> EFCC Videos, SEC entry and pack counts reverted and reappeared.
Observed 4 different live states in ~40 minutes.

## What was done
1. Read the TRUE current KV value (not via worker). It was the v0.9 build (TITLES=1,965) — legitimate
   newest base. Patched ONLY the PACKS block (assert: bytes outside the block identical).
2. Compare-and-swap by hand: re-read immediately before write; ABORTED once when another desk had
   written in between (SEC entry restored by them). Re-merged on top of their value.
3. Final PACKS: efcc (7 incl. Videos), cac (14), nysc (45), sec (24; label 19.8MB, anchor 4fd5c7de).
   Total pack URLs = 94 (4 roots + 90 pages). Written once; KV readback byte-identical; live 957,571B.
4. SW fallback text corrected: removed hardcoded "packs 62/62" (stale; real total is 94 and will change).
   SW stays r12. Uploaded with size + syntax guard; live verified (0 stale '62/62').

## HONEST INCIDENT (my fault, second shell-emptying tonight)
In the merge step a Python assert failed (base lacked SEC) but the shell script continued to the
upload line (no set -e), uploading a non-existent file => v2.shell was 0 bytes for ~1-2 minutes.
Detected by readback (0 bytes), restored from last known-good copy (shell-recheck, 957,548B) with the
EFCC change applied and hard-stop guards (set -e, file-exists, size>900KB, byte-identical readback).
Lesson now enforced: every KV shell write is CAS + set -e + size + readback. Never again a bare pipe.

## Verified end state (fresh browser session, clean context)
Library v0.9: 1,965 pages. Packs: EFCC 7 pages (Videos included), CAC 14, NYSC 45, SEC 24.
"Site packs: 94/94 stored on this phone ✓ (auto-downloaded)". Sync button: all 1965 pages + 94 pack pages.

## Recommendation (needs owner ruling): single-writer rule for v2.shell
Introduce v2.packs.json as the ONLY thing desks edit; shell PACKS generated from KV key list at
request time. Removes the race permanently. Awaiting go.
## Phone proof pending: online open -> wait 94/94 -> Sync 1965 -> airplane -> EFCC/CAC/NYSC/SEC.
