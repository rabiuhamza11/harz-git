# OWNER "CONTINUE" RECEIPT + WRITER CONFLICT FLAG (Nuruddeen, Oct 22 ~09:45 WAT)

## Ruling recorded
Owner word "Continue" (09:41) = the curation swap proceeds: Gate B finish (keep-fts-00 index
upload + live search re-test), Gate C regression, then Gate D retirement, one DB at a time,
size measured after each. Team F continues; Nuruddeen verifies each gate independently.

## Live state at this receipt (measured)
- harz-keep-fts-00 (26d47514): created 08:28, still empty (only _cf_KV) — index upload in progress.
- dump-enwiki writer STILL ACTIVE: master 1,342,482 (baseline) -> 1,343,697+ and climbing,
  rate ~150-170 docs/min (accelerating from ~70/min at 09:27). Bodies DB grew +1,375 rows
  in the 09:1x window and is still growing.

## STANDING-RULING CONFLICT (flagged for owner + desks)
The re-armed dump-enwiki writer CONTRADICTS standing owner receipt cad1b49 (Oct 15 ~12:2x):
"D1 STAYS CAPPED at 1,342,482 docs (master 3.85GB + bodies 9.04GB; no further D1 bodies;
ingest-stop stays in force until [growth] path is live." R2 growth layer was later ruled OFF
(free-tier-only). The morning gate removal re-armed a writer the standing ruling says is stopped.
Risk: bodies DB (9.04GB) is ~0.96GB under the D1 10GB per-DB HARD LIMIT; at current rate the
writer adds ~10-20MB/hour of bodies; a hard-limit hit crashes ingestion uncleanly mid-swap.
All dump-enwiki writes are DELETE-class (retire with the bulk at Gate D) — they are baseline
noise + billing-relevant interim growth + hard-limit risk, nothing else.

## Recommendation (Nuruddeen, verifier seat)
1. Corpus lane re-gates the ingest route per standing receipt cad1b49. Owner word needed: "re-gate"
   (enforces standing law), or an explicit supersession if he wants the writer running.
2. Gate C must scope regression to keep-class + sealed assets + v2 corpus (NOT the moving master
   count), with the writer state honestly disclosed either way.
3. Gate D retirement naturally kills the writer when the bulk DBs drop — but a stable baseline
   before Gate C is cleaner than a moving one.

Nothing in this receipt authorizes any seat to touch another lane's production; it is a flag
and a request for the owner's word.
