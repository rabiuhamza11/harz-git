# RECEIPT 281 — HCIE Circulation: verified baseline, honestly graded

Date: 2026-10-31 18:5x WAT (Aisha). Owner order: prove bidirectional circulation, no Cloudflare upgrade, no simulated success,
distinguish PASS / PARTIAL / FAIL / NOT TESTED, keep the Nov 1 05:00 WAT unattended verification.
This is an EVIDENCE receipt, not a completion claim. Continuous circulation is NOT declared.

## Part 1 — Internet -> HARZ (LIVE, unattended, real sources)
Cron */15 on harz-hcie, created 2026-10-31T14:57Z. 12 most recent cycles (runs 23-34) inspected from D1 hcie_runs.
  changed=14  new_objects=14  unchanged=34  errors=0  changed == new_objects EXACTLY
  run 30 = 0 changed / 4 unchanged (a full no-change cycle, no object written)
Genuine change detection on a real news source, Guardian Nigeria:
  v13 d28427a9ec93 (16:45:32Z) -> v14 ca794cf66c22 (17:00:28Z) -> v15 8d387c46f6f4 (17:15:27Z) -> v16 fa509a03a9d5 (17:30:27Z)
  Four distinct hashes in 45 minutes, each with source_key, captured_ts and provenance. Nothing overwritten.
Store-wide integrity: duplicate content hashes = 0 | duplicate (source_key,version) = 0 | objects with verified<>1 = 0 |
objects without provenance = 0 | 27 objects total.
Journal is append-only and tallies coherently: DETECTED 25, ACQUIRED 25, VERIFIED 25, PUBLISHED 25, UNCHANGED 75.
GRADE: PASS for acquire / new hash on change / no duplicate on unchanged / provenance + integrity.

## Part 2 — HARZ -> Internetless
Bundle re-exported today from the current corpus (https://harz-hcie.harz.workers.dev/gate3/download):
  23,255 bytes, 10 embedded objects, external network references = 0
  All 10 hashes recomputed independently in Python from the embedded text: 10/10 match both the declared value and the
  canonical hash held in D1. Nothing trusted from the bundle's own claim.
Device evidence already on record (Receipt 274, physical phones): 10 objects read in airplane mode; tampered object
  rejected 9/10 with expected-vs-actual hashes shown and content withheld.
GRADE: PASS for bundle integrity and for device airplane reading OF THE EARLIER BUNDLE.
  PARTIAL overall: the freshly re-exported bundle has not been opened on a phone.
  NOT TESTED: propagation to a SECOND HARZ NODE. Only one HCIE node exists; no node-to-node transfer has ever occurred.

## Part 3 — Internetless -> HARZ
Mechanism live and server-verified: /write author page, /api/hcie/contribute with integrity-first hashing, carry file that
self-verifies offline, /api/hcie/queue, /api/hcie/review. Contribution lifecycle proven live (Receipts 273, 275, 280):
correct hash queues UNPUBLISHED, wrong hash refused as REJECTED_INTEGRITY, approval publishes a verified object into the
manifest, identical resubmission keeps content identity but records separate provenance.
5 contributions published to date; 1 rejected on integrity; 1 rejected at review.
GRADE: PARTIAL. The authoring step has NEVER been performed on a phone in airplane mode and then delivered.
  Device leg = NOT TESTED.

## Part 4 — HARZ -> Internet
Audited, not built: harz-hcie holds ZERO worker secrets; no authorised internet destination is configured anywhere in the
chain. The sandbox does hold a GitHub credential for the harz-git repo, but publishing from the sandbox is not a HARZ
publish, and moving a credential into a Cloudflare secret is a key-material decision reserved for the owner.
GRADE: NOT TESTED / BLOCKED on two owner decisions (destination + credential handling). No simulated publish was performed.

## Part 5 — Continuous circulation
10-row matrix grades:
  1 New information acquired ................ PASS   (14 change events, 12 cycles, real sources)
  2 Changed information -> new hash ......... PASS   (guardian v13->v16, 4 distinct hashes)
  3 Unchanged -> no duplicate ............... PASS   (34 unchanged events, 0 duplicate hashes, run 30 clean)
  4 HARZ mesh transfer verified ............. PARTIAL (bundle self-consistent 10/10; no second node exists)
  5 Internetless retrieval .................. PASS   (device, Receipt 274)
  6 Airplane-mode reading ................... PASS   (device, earlier bundle) / new bundle NOT TESTED
  7 Offline contribution received ........... PARTIAL (path verified server-side; device leg NOT TESTED)
  8 Reverse publication verified ............ PARTIAL (5 real approvals published; none device-authored)
  9 Failed transfer -> recovery ............. NOT TESTED (no failure injected yet; no test instrument approved)
 10 Repeated cycles, no silent losses ...... PARTIAL (12/12 runs ok, 0 errors, counts reconcile; 24h unattended window
                                              began 14:57Z and completes 2026-11-01T14:57Z)

## November 1, 05:00 WAT unattended verification — STATE
Searched every scheduling mechanism reachable: all 169 worker cron schedules in the account (none fires at 04:00 UTC /
05:00 WAT), Base44 workflows (only "Root King Watch", inactive), and receipt history. NO JOB EXISTS at 05:00 WAT Nov 1.
What does exist: harz-hcie runs every 15 minutes unattended, so by 05:00 WAT Nov 1 it will have completed roughly 90 cycles
across the 24h window. If the intended verification was something else, it is not scheduled and must be defined and set.

## Constraints respected
No Cloudflare upgrade, no new tables, no schema change, no new worker, no secret created, no source added, no object mutated,
no contribution auto-published, cycle journal append-only. Nothing was simulated: every number above is read from live D1,
live cron runs, or a live endpoint.
