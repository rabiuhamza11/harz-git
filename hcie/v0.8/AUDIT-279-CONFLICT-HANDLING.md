# AUDIT 279 — Conflict handling in HCIE contributions (audit only, nothing changed)

Date: 2026-10-31 (Aisha), on Rabiu's "Go". AUDIT FIRST: this receipt reports state; no fix has been applied.

## What the code actually does (hcie_worker v0.8.5, lines 62-125 and 150-190)
1. Contribution identity is CONTENT ONLY: id = "C-" + first 16 hex of SHA-256 of the text. The title is not part of identity.
2. A second submission with identical text returns the existing row with duplicate:true. Nothing records the second submitter.
3. A submission with the SAME TITLE but different text gets a new, unrelated id and queues independently.
4. On approval each contribution publishes under its own source_key "contribution:<id>", so every approved note is v1 of its own
   key. There is no thread, no "revises X", no comparison between same-titled objects.
5. idOf(text, author) is defined and never called: dead code (No Duplicates violation, harmless but should go).

## Live test performed (rows created, then removed)
Same title, different content, two claims that contradict each other:
  Phone A "Gembu road is passable..."          -> C-10f9da8e033d454a QUEUED, integrity VERIFIED
  Phone B "Gembu road is NOT passable..."      -> C-dfb1c0083025cc40 QUEUED, integrity VERIFIED
  Result: two ids, both QUEUED, no conflict flag, no cross-reference. Both would have approved into two independent v1 objects.
Same text, three phones, three authors:
  Phone A -> C-10f9da8e033d454a authored "AuditPhoneA"
  Phone C, identical text -> same id, duplicate:true, author stays "AuditPhoneA"; the third submitter is nowhere in the database.
  Result: duplication is prevented, but a phone's authorship claim is silently dropped.

Cleanup verified: 2 reviews + 2 contributions deleted, 0 objects were ever created from them, queue back to 0,
published 5, objects 27. No test residue remains.

## The conflict is not hypothetical: it is already in the published corpus
  title "Harz" -> 2 PUBLISHED rows: object 28 (Cele, 55 bytes, sha 842d2ec5d9ea) and object 29 (Hamza, 57 bytes, sha f7e8dc85ec46).
  title "Road watch" -> 2 rows: one PUBLISHED (object 27), one REJECTED_INTEGRITY.
Both "Harz" objects are in the manifest as separate v1 entries. Nothing in the manifest says they disagree, and nothing says they
share a title. A reader retrieving both cannot tell whether these are two views of one fact or a contradiction.

## Options (no work starts until Rabiu chooses)
A. SHOW THE CONFLICT AT REVIEW (recommended first). For each queued card, look up same-titled published/queued items and display
   them: "Conflicts with object 28 (Cele, 55 bytes, sha 842d...)". Approve stays possible, with the note field as the record.
   Advantages: no schema change, no publish change, ends the silent-contradiction hole immediately, keeps immutability intact.
   Disadvantages: reviewer must resolve by hand; no permanent machine-readable link between the two objects; adds one query per card.
B. CONFLICT GROUP AT INTAKE. Add a conflict_key column (normalized title) and group queued items side by side on /review.
   Advantages: disagreements visible before approval; grouping survives in the database.
   Disadvantages: one schema change; title matching is heuristic (capitals, spacing, Hausa/English spelling); still no merge semantics.
C. THREAD VERSIONS AT PUBLISH. Publish under "contribution:title:<hash>" so a second approval becomes v2 of the same title.
   Advantages: revision history per subject, manifest shows v1/v2 rather than two unrelated v1s.
   Disadvantages: changes what a contribution object MEANS; needs a ruling because it touches the append-only story and the
   existing 5 published objects would sit outside the scheme unless reconciled.

## Separate small defect worth its own decision
Attribution loss on identical text (finding above). Cheap additive fix: when a duplicate arrives, write an hcie_reviews row
"ALREADY_SUBMITTED_BY" with that phone's author and device, so every claim is recorded even when the bytes are identical.
No schema change, no publish change, does not touch verification.

## Boundaries respected
No object overwritten. No verification weakened. No phone-wide corpus sync. No expansion of the Oct 25 two-phone claim.
Nothing declared complete.
