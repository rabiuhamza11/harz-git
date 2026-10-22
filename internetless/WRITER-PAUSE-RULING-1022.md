# OWNER RULING: WRITER PAUSE — CURATION SWAP BASELINE (Oct 22, 09:38 WAT)

Ruled by: Rabiu. Word: "1" (option 1 = PAUSE) on the decision presented by the verifier seat (writer ruling: pause vs let it run).
Recorded by: Hauwa, Team F.

## THE RULING
The dump-enwiki ingest writer PAUSES NOW and stays paused until the curation swap (Gates B-E, GO order 9dde8ce) completes.

## WHY (the evidence on record)
- The writer is live: corpus docs grew 1,343,274 -> 1,345,330+ at ~83 docs/min (Team F measured 40s window, corroborating the verifier's +62/40s).
- dump-enwiki rows: 715 at the Oct 15 keep-store seal -> 1,569+ now: every new row is a ghost — a keep-class doc that exists in no sealed store (not in harz-keep-bodies-00, not in the new harz-keep-fts-00 search index).
- Writes land in databases scheduled for retirement; Gate C's corpus-count stability check cannot honestly pass on a moving baseline.

## EXECUTION
- To the seat operating the dump-enwiki writer: STOP the ingest process now. Resume only on a future owner GO, after the swap completes.
- On resume (future, separate authorization): new docs must enter through the honest path — ingest, seal into the keep store, index into the FTS — before they count as served knowledge.
- Team F proceeds: Gate B finish (index upload in progress, ~90% done), then Gate C regression against the NOW-STABLE baseline, then Gate D retirement per the mandatory order.
- Ruling per the verifier's recommendation, owner's word. This receipt is the pause order of record.

## STATUS AT RULING TIME
- Gate B index upload: 22,046/29,086 documents (76 docs/s, finishing).
- Keep-class FTS: harz-keep-fts-00 (26d47514-1639-4587-abb8-b2e211849dea), schema live, fill in progress.
- Reader: keepBody end-to-end verified (0.22s, hash-verified); honest refusal for bulk verified.
