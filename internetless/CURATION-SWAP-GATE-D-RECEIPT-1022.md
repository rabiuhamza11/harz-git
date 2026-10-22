# CURATION SWAP — GATE D RECEIPT, PART 1: READER SWAP EXECUTED (Team F, Oct 22, ~10:5x WAT)

## What was built and proven (nothing dropped yet)
1. harz-million-corpus-v2 (0945015e): 29,844 KEPT docs (exact draft-list complement: all sources EXCEPT the 13 delete sources and devdocs-%), metadata + provenance tables carried whole (meta 17, hunt_provenance 3,249, six_body_receipts 6, identity_corroboration_receipts 6, vol1_keep_hashes 29,086, vol1_selection_domains 2,820). Inline text intentionally NULL: bodies serve from the sealed keep store + legacy fallback (the post-swap design).
2. harz-corpus-bodies-v2 (a31a671d): exactly the 1,473 kept docs NOT sealed in the keep store (incl. the 155 cloud-wave ghost bodies — preserved, not stranded).
3. THE READER SWAP IS LIVE: harz-million-corpus redeployed (same v0.5.1 source, keep_bindings preserved secrets) bound to v2 corpus + v2 bodies + unchanged keep store. LIVE PROOF: /api/stats now answers n=29,844 (was 1,343,890); /api/doc-keep answers 401 unauthorized (route + binding live); /health ok.
4. Ghost resolution per the draft list: the 1,253 dump-enwiki ghost rows retire with the bulk (dump-enwiki is a delete-list source); the 155 cloud-wave ghosts are preserved in v2 with bodies.

## Account (measured, no drops yet)
18.511GB across 49 DBs (two v2 DBs added; originals untouched).

## THE HOLD: physical drops blocked by live bindings (the gate law applied to my own plan)
Three deletions remain: old harz-million-corpus (3.860GB) + old harz-corpus-bodies-db (9.352GB) + fx-idx (0.990GB) = 14.202GB.
BLOCKED: harz-fx-search and harz-fx-build (LIVE workers, verified answering on harz.workers.dev) bind the old corpus (DB_CORPUS), old bodies (BODIES_DB on fx-search), and fx-idx (DB_IDX). Dropping now breaks live services.
RULING NEEDED (owner): (a) Team F re-points the two FX workers at the v2 stack (mechanical, ~minutes, keeps them live; their bulk searches become honest empty), then the three drops proceed one DB at a time with size measured after each; or (b) the FX seat re-points its own workers. Everything else in Gate D part 1 is done, verified, and reversible (originals intact).
