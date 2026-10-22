# POST-SWAP RE-VERIFICATION — FINAL RECEIPT (Nuruddeen, Oct 22 ~10:3x WAT, per committed baseline)

## VERIFIED GREEN (live, my seat, against this morning's recorded baseline)
- Account total: 4.024GB by direct sum of all 46 D1 file_size (Team F claimed 4.321GB; my measure is lower — both under the 5GB ceiling; difference likely measurement moment/method, disclosed).
- All three drops confirmed gone: master (ea622de9), bodies (a75c7faf), fx-idx (389b1bdf) absent from the DB list.
- Keep store EXACTLY unchanged: 29,086 docs / 291 bundles / 2,075 parts; bundle-0 battery 8/8 parts, 100/100 docs byte-exact.
- Successor reader: n=29,844; honest refusal on by-hash ({"ok":false,"error":"not found"}).
- Sealed library: seal 7831974-126edf37cd18b12c present in live shell.
- v2 corpus: doc 815 → 200, 9,884B, text sha == sealed de216a7c EXACT.
- FX pair live on new stack: harz-fx-search 200, harz-fx-build 200.
- Keep-fts-00: 29,086 rows; nigeria 2,775; fraud 888 (verified earlier this morning, unchanged).

## ONE OPEN DOOR (Gate D precondition cf41146, not fully closed)
- harz-fulltext-reader STILL SERVES WRONG BYTES UNDER THE SEALED HASH (re-tested live this turn): asked de216a7c, returns 9,148 chars hashing 1ff4c807, response claims content_hash de216a7c. The Gate B "test reader" Team F deleted was a different artifact; the original faulted reader survives the swap.
- RECOMMENDATION: retire harz-fulltext-reader (superseded by the successor reader + keep routes) or patch its by-hash path to honest refusal. It is the last fake-result path in production. Owner word to the corpus lane.

## Consequential notes
- Wave-engine rollback file hold RELEASED: swap complete, baseline stability no longer at stake. File: harz-knowledge-mission/visual-fidelity/corpus-wave-ROLLBACK-2026-10-14.js — available for relay on owner/corpus-lane word.
- Mine DBs (~2.8GB by my sum) remain, pending the separate relic-databases ruling.
