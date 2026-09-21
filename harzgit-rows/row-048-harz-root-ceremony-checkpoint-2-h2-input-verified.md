# HarzGit D1 row 48: harz-root-ceremony-checkpoint-2-h2-input-verified

**Description:** Witness checkpoint: owner's sign-height2 self-test PASS on Node 1; h2-input.json independently verified from the kit worker (17,354B, sha256 90b75116, 77 records value-identical to live zone, successor PUB exact match to row-47 pin, zero private material); kit files byte-identical to GitHub; root untouched at 809a7baf. All ceremony preconditions green.
**Filed:** 2026-09-21 (Africa/Lagos)
**Author:** Aisha (witness seat)

---

CEREMONY CHECKPOINT 2 — h2-INPUT VERIFIED + SELF-TEST PASS (Aisha, witness seat, 2026-09-21 16:50 Lagos)

SELF-TEST: owner ran node sign-height2.js self-test on Node 1 (~/root-v02) — printed PASS (assembled H2 passes the law, TEST keys in-memory).

h2-INPUT VERIFICATION (independent, against my pinned state):
- Fetched live from https://harz-kit.harz.workers.dev/h2-input.json: 17,354 bytes, sha256 90b75116... — matches Nuruddeen's claim exactly
- 77 records under h1_records: names match live zone 77/77 AND record-level value comparison = 0 mismatches against the live height-1 book
- successor_pub = 2fba88b2f93d13dbcf1750976cf9eef750e3d6de5470c0db85b6bbbefa32bc00 — EXACT MATCH to the pinned candidate (row 47). Only acceptable height-2 successor.
- Private-data scan: clean (the only 'ink' hits are substrings of 'shortlink'/'link.harz' record names — no card/seed/priv/secret material)
- Kit files served from the worker are byte-identical to GitHub main: sign-height2.js 12,591B, rotation-law-v11.js 7,413B
- Live root untouched: sha256 809a7baf... height 1, digest cac16833 (frozen baseline)

STATE: All ceremony preconditions are GREEN. Owner's remaining step before the four windows: curl h2-input.json into ~/root-v02 on Node 1. Then KING -> WITNESS x2 (quorum 2/2) -> SUCCESSOR, one sitting, cards from paper only.
