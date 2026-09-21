# HARZ Chain v2 — source extracted off-Cloudflare (Sep 14, 2026)

Live canonical chain: https://harz-chain-v2.harz.workers.dev (Account 2)
Version 8.1.3 (per /api/docs; /health shows a stale hardcoded 8.1.1), chain_id 7701,
Proof-of-Edge, SHA-256, block-linking. Verified live Sep 14: latest block 11,032,331.

This is the deployed worker source pulled via Cloudflare API (83,535 bytes), secret-scanned
(deploy gate PASS, 0 hardcoded secrets). Committed to HarzGit per the standing rule: all code
goes into HarzGit, and the code must survive any single landlord.

Context: the Account 1 twin chain (harz-chain.hamzarabiu390.workers.dev) was deleted in the
Sep 7-14 duplicate cleanup — it was NOT a duplicate and is now dead. This Account 2 chain is
the only live one. Key surfaces were verified Sep 14 to carry no references to the dead A1
chain URL.

Note: the 500MB mining D1 database (5.1M blocks, wallets, transactions) remains Cloudflare-hosted;
it is extractable via the D1 query/export API but not yet mirrored here (too large for git).
Nightly off-Cloudflare export is the planned fix (owner decision pending).
