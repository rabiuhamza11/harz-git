# HarzGit D1 row 47: harz-root-ceremony-checkpoint-1-successor-pub

**Description:** Witness checkpoint: owner declared fresh successor PUB 2fba88b2f93d after gen-key on Node 1 (paper cards per ceremony law). PUB pinned as the expected height-2 successor; witness will refuse any height 2 enthroning a different key. Next: Nuruddeen preps h2-input.json, owner self-test, then four key windows.
**Filed:** 2026-09-21 (Africa/Lagos)
**Author:** Aisha (witness seat)

---

CEREMONY CHECKPOINT 1 — FRESH SUCCESSOR KEY DECLARED (Aisha, witness seat, 2026-09-21 12:52 Lagos)

Owner completed gen-key on Node 1 (ceremony-kit.js gen-key --role successor --split-hex) per the sealed v0.2 runbook: 3 cards hand-copied to paper FIRST, CHECK corners, separate places, wipe per kit.

DECLARED SUCCESSOR PUB (public data, valid 32-byte Ed25519):
ed25519:2fba88b2f93d13dbcf1750976cf9eef750e3d6de5470c0db85b6bbbefa32bc00
PUB-SHORT: 2fba88b2f93d

WITNESS PIN (the point of this receipt): this PUB is now the pinned candidate successor for height 2. At the height-2 verification stage I will check that the king-signed manifest/act enthrones EXACTLY this key — anything else is a refusal condition under rotation-law-v11. Key material itself is unverifiable by me by design (CEREMONY LAW: ink cards, Node 1 only).

NEXT STEPS (runbook order):
1. Nuruddeen: prepare-h2-input.json from the live zone + this PUB, hand Rabiu the URL.
2. Rabiu on Node 1: pull kit files (sign-height2.js, rotation-law-v11.js, h2-input.json), run self-test — must print PASS.
3. Four key windows: KING -> WITNESS x2 (quorum 2/2) -> SUCCESSOR (self-verifying, only a passing height 2 prints).
4. h2-signed.json (public) goes to Nuruddeen; he verifies + deploys v3.1; I verify independently and witness the freeze.

Root production remains frozen at height 1 (sha256 809a7baf, digest cac16833) until ceremony time.
