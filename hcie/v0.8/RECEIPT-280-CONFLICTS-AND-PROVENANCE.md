# RECEIPT 280 — Conflict visibility at review + duplicate attribution preservation

Date: 2026-10-31 (Aisha). Approved by Rabiu: "Approve Option 1, together with the attribution fix. Do not implement Option 3."
Worker harz-hcie v0.8.7 (deployed). No schema change. No versioning introduced. No object converted or overwritten.

## 1. Conflict visibility at review (Option 1) — BOARDED
/api/hcie/queue now returns each queued item with its own text, byte length, `collisions[]` and `collision_count`.
A collision is an object already held under the same normalized title (lowercase, whitespace-collapsed) with a DIFFERENT
canonical hash. For each collision the reviewer sees: object id, source_key, version, publication status, author, device,
byte length, full hash, publication time, and a comparable text preview (first 600 bytes, with total byte count stated).
The review screen renders a red-bordered block: "Same title, different text: N other claims" plus
"These are DIFFERENT claims under one title, not duplicates of this one. Nothing is merged or rejected automatically:
decide or leave both." Each queued card also exposes its own submission text in a collapsible block for side-by-side reading.
Nothing is auto-rejected, auto-merged or auto-preferred. Both buttons stay available; the note field records the decision.

## 2. Duplicate attribution preservation — BOARDED
On a byte-identical resubmission the content is still deduplicated (one row, one hash), but the submission is now recorded
as its own attributable provenance row: action ALREADY_SUBMITTED_BY, reviewer = that phone's author, note =
"identical bytes | device <device> | submitted <ISO time> | contributes to <contribution id> ("<title>")
| content held once, submissions held separately | first submission <ISO time>".
The first submitter's own record was also made self-describing: RECEIVED_VERIFIED now reads
"bytes verified | submitted by <author> | device <device> | submitted <time> | queued for human review, NOT published".
So every submission, first or repeated, carries author, device, time and the identity it anchors to.
Provenance is never deduplicated away; only the bytes are.

## Acceptance tests — 23/23 PASS (live endpoints against D1, baseline captured before, restored after)
1a same title + different text is flagged                 -> collision_count=2
1b collision names the published objects                  -> [28, 29]
1c collision carries author + publication status          -> [('PUBLISHED','Cele'), ('PUBLISHED','Hamza')]
1d both texts available for comparison                    -> previews 55 and 57 bytes, own text 73 bytes
2a identical text deduplicates content                    -> same id C-842d2ec5d9eab29b, duplicate:true
2b submission reports provenance recorded                  -> attribution_recorded true
2c author, device, time preserved on the duplicate        -> "identical bytes | device audit-two | submitted 2026-10-31T16:58:43Z ..."
2d original author untouched                              -> still Cele
3a three phones + identical text = one content row        -> C-8f1b9f375ba88a8a
3b three attributable submissions recorded                -> ['PhoneA','PhoneB','PhoneC']
3c devices preserved distinctly                           -> ['audit-a','audit-b','audit-c']
4a objects 28 and 29 byte-identical before/after          -> 842d2ec5d9ea/55, f7e8dc85ec46/57 unchanged
4b no new objects created by submissions                  -> still 27
4c no contribution object above v1                        -> 0 (nothing threaded, nothing converted)
5a disagreement path carries differing hashes             -> 2 distinct hashes, not equal to the submission hash
5b duplication path carries no collision, shows co-submitters -> collisions 0, also_submitted_by >= 1
6a every duplicate left a record (3-phone case)           -> 2 duplicate rows
6b second submitter left a record                         -> 1 row with author + device + time
6c submission count vs anchored records                   -> 7 records for 7 submissions across the test
7a queue endpoint matches QUEUED rows                     -> 2 = 2 at test time
7b published count unchanged                              -> 5 = 5
7c contribution total grew only by test rows              -> 9 = 7 + 2, then restored to 7
7d verified objects reconcile to manifest                 -> 27 = 27
Harness: hcie/v0.8/acceptance_280.py. Two first-run failures were harness faults (expecting the submitter as `reviewer` on
the verification row; a global version>1 count that included news captures). One was a real gap (submitter absent from the
verification note) and was fixed in the product, not in the test.

## Browser verification (VERIFICATION PROTOCOL)
Real browser render of /review with live data, no unlock needed to read the queue:
  "read from HARZ at 17:59:04 | 2 queued | this screen shows only what it loaded"
  Card 1 (identical text): "ALSO SUBMITTED BY (identical text, own record): PhoneB, PhoneC"
  Card 2 (different text, same title): "Same title, different text: 2 other claims"
    "PUBLISHED as object 28 (v1) | author Cele | device Infinix smart10 | 55 bytes | sha256 842d2ec5d9eab29b | published 2026-10-31T16:18:27.295Z"
    "PUBLISHED as object 29 (v1) | author Hamza | device Infinix hot10i | 57 bytes | sha256 f7e8dc85ec46d9d5 | published 2026-10-31T16:18:33.477Z"
Screenshot captured of the rendered page. PWA manifest, service worker registration, icon and light theme (#f0f2f5 body)
unchanged and intact; network-first worker behaviour preserved.

## Cleanup verified
All test contributions and their review rows deleted: C-feb93cdc5f7fe907 (1 review, 1 contribution),
C-8f1b9f375ba88a8a (3 reviews, 1 contribution), plus the AuditTwo provenance row on C-842d2ec5d9eab29b.
Zero objects were ever created from test rows. Residual rows matching AUDIT-% titles: 0. Residual Audit/Phone reviewers: 0.
FINAL: queue 0 | PUBLISHED 5 | REJECTED_INTEGRITY 1 | REJECTED_REVIEW 1 | objects 27 | manifest 27 |
objects 28 and 29 byte-identical to before the test.

## Boundaries respected
Option 3 not implemented: no threaded versions, no automatic versioning, objects 28 and 29 remain separate published objects.
No schema change was needed or made; conflict matching uses existing columns. No publication without human decision.
No key rotation. No protocol change. The review key in use throughout is unchanged (hash prefix f4484c53).

## Known limits, stated not hidden
Title matching is heuristic: it normalizes case and whitespace only, so spelling variants ("Road watch" vs "Roadwatch")
and Hausa/English renderings of one subject will not be caught. Collision previews are capped at 600 bytes per object and the
full body stays one click away in the object itself. Author and device remain self-declared by the submitting phone.
