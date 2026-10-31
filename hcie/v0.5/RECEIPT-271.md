RECEIPT 271 - GATE 3 TAMPER TEST built and self-verified (device transfer pending)
Date: 2026-10-31 (Aisha). Worker harz-hcie v0.5.0.

ARTIFACT
 Download: /gate3/tamper.html  -> harz-gate3-TAMPERED.html
 Inline:   /gate3/tamper
 10 documents; exactly ONE altered by a single character.
 Altered object: id 1, dailytrust v1, sha256 expected 813d7d42d7823b4cafc758223b206e51c9f5a85481a9b2710160edfa0ea87813
 Change applied: one character V -> Z at byte offset 76, length preserved exactly (6507 bytes both sides).
 MANIFEST KEEPS THE ORIGINAL TRUSTED HASHES. No new manifest was generated for the altered text.

INDEPENDENT CHECK 1 (node, bundled SHA-256 over the payload)
 VERIFIED 9/10
 REJECTED 1 (dailytrust v1, tampered=true)
   expected 813d7d42...ea87813
   actual   c43a558250a89f8d9dc6104cdeb159e67fe26c8dda6e707a0daf9a6b860b0d33

INDEPENDENT CHECK 2 (real browser render, browserbase)
 Page shows: "9/10 VERIFIED"
 Detail: "1 object(s) REFUSED and withheld: dailytrust v1 - 9 intact documents remain readable"
 row shows expected hash, actual hash, and "CONTENT WITHHELD - not displayed", pill REJECTED
 "Open first object" opened canary-github v1 (a VERIFIED document), not the corrupted one
 No repair/overwrite path exists: the artifact is read-only, it cannot rewrite the object.

READER BEHAVIOUR AGAINST OWNER TABLE
 Selected .................... 10   PASS (built)
 Integrity verified .......... 9/10 PASS (proven in node + browser)
 Accepted .................... 9    PASS
 Rejected .................... 1    PASS
 Corrupted document displayed  NO   PASS (withheld, marked, and skipped by the read button)
 Rejection recorded with identity + expected/actual hashes  PASS

STILL OWED FOR FULL EVIDENCE (owner device execution):
 Transferred ................. 10   (owner must move the tampered file to the receiving phone)
 Airplane-mode open on receiver, reporting the same 9/10 with one REJECTED.
Until that happens Gate 3 stays OPEN on the receipt, as agreed.
