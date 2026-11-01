# RECEIPT 289 — Receipt 288 landed in HarzGit; custody moved to worker v1.3

Filed 1 November 2026, 04:15 WAT, by the verification seat.

## 1. Receipt 288 bundle verified, then committed (the gap the desk could not close)
Desk had published the bundle but held no write credential. I fetched it and verified before writing:
- zip bytes 258,961 exactly as claimed; sha256 a8f5d4af... matches the claimed prefix.
- Ten files, every hash recorded in the manifest row.
Landed as HarzGit rows 402-411 plus trading/research-288/MANIFEST.json, then read back:
10 of 10 rows byte-identical to the bundle. Total vault rows 332 at that point.

## 2. Reproduction: PROVEN by an independent seat
Their recipe needs the bundle extracted into a directory literally named receipt288
(make_artifacts.py opens receipt288/inputs/candles_cache.json). Run twice from a clean copy:
- trades: 4050  variants: 12
- artifacts/trade_list.csv  d354bfc72b60a142... on BOTH runs, matching the pinned artifact hash
- artifacts/variant_table.json  bb886b90a6418813... on BOTH runs
This is the first research artifact in this thread that reproduces on a second machine.

## 3. The two pending measurement fixes did deploy, and they are correct
- Newest deployment 2026-11-01T03:44:50Z, id fd96e06a (previous newest was 02:27:03).
- Live module "machine-worker.js", 57,829 bytes, sha 5ba8c806..., node --check PASS, 38 __name
  markers, __defProp present, FEE_RT and SLIP present. So the desk's correction is right: their
  earlier failure was their own truncation, not the packaging.
- /board/reconciled execution book now reads: rows 33, accepted 8, refused 20, live_mode_rows 3,
  real_fills 0, simulated_fill_rows 8, live_accepted 0, with a label that agrees.
- /api/accuracy now carries overall.fill_rate_pct = 71.4.

## 4. Custody moved to v1.3 (v1.2 is stale the moment a deploy lands)
Any deploy invalidates the pinned bytes, so custody was re-taken:
- harz-trading-machine/src-v1.3/P001..P076 plus build/manifest-v1.3.json.
- Round trip from HarzGit rows: 76/76 parts, 57,829 bytes, sha256 5ba8c806... MATCH, node --check PASS.
- Row 323 (v1.2) is retained and labelled SUPERSEDED, not deleted.
DEFECT I INTRODUCED AND FIXED IN THE SAME HOUR: my first v1.3 split joined parts with an empty
string and lost 75 boundary newlines (57,829 -> 57,754). The join rule is now newline-join in name
order, stated in every part's description and in the manifest, and the round trip is exact.

## 5. Objection recorded: custody was hosted on Base44
The bundle URL was base44.app/.../RECEIPT-288-CUSTODY.zip. That contradicts the standing instruction
that all HARZ code storage is HarzGit and nothing is built on Base44. HarzGit now holds every byte,
so the Base44 copy is redundant. Recommend deleting it and treating HarzGit rows 402-411 + MANIFEST
as the sole custody. Not deleting it myself: it is not mine to remove.

## 6. What this does and does not settle
Settled: 288 custody, reproducibility of the research artifact, the two label fixes, and source custody
at v1.3. NOT settled: whether the strategy has edge (two seats still disagree, both reproducible),
the single-writer deploy rule (still not in force), and any live execution (still frozen to Nov 6).
