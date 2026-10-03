# G25 — HARZ-CHAIN CHECKPOINT ANCHOR: TRACE & MEASUREMENT (2026-10-03)

Contract frozen and committed BEFORE implementation (05bceff).
Dad's ruling verbatim honored: "HARZ-chain is a checkpoint authority,
not a replacement for the sovereign origin."

## WHAT WAS BUILT (all additive; G24 frozen primitive untouched)

ORIGIN (harz-intelligence, additive act):
- originFingerprint(): the origin's public identity, derived exactly
  as originSign derives it.
- POST /api/continuity/v1 {action:'checkpoint'}: reads the sovereign
  tip, builds checkpoint {law: HARZ-CHECKPOINT-V1, origin_id,
  chain_height, state_hash, notarized_at}, signs it as an ORIGIN ACT
  (Ed25519 over complete canonical bytes, signature BEFORE
  notarization), notarizes through the CHAIN_SVC service binding
  (the sovereign direct call — the same law as the Studio direct
  call; the public-URL path is hit by the workers.dev-to-workers.dev
  subrequest limitation and returns a non-JSON block page), stores
  the anchored checkpoint in KV.
- GET /api/continuity/v1 now serves tip + acts + checkpoint, law
  string extended: "the chain observes, the origin authorizes".

CHAIN (harz-chain-v2, additive endpoints; deployed from the CURRENT
live source v8.3.0 — no rollback):
- POST /api/checkpoint: verifies the HARZ-INTELLIGENCE origin's
  Ed25519 signature against the pinned public key (WebCrypto spki
  import) — a checkpoint is notarized ONLY as a valid act of the
  sovereign origin; unsigned/forged checkpoints are refused at the
  door (403). Notarization lands in a new chain_checkpoints table
  + a chain_transactions row (status HARZ-CHECKPOINT-V1) anchored to
  the CURRENT tip block.
- GET /api/checkpoint/latest, /api/checkpoint/list: public.
- Block hash formula untouched (SHA-256 id|prev_hash|timestamp|
  miner|nonce|difficulty, uppercase); the anchor block hash
  RECOMPUTES under the public formula.

FRESH NODE (continuity-verifier, additive layer over G24):
- Checkpoints enter by bundle or by live fetch (chain_url).
- Every checkpoint is verified: law; origin signature vs pinned
  anchor + standing revocations (a forged or revoked-key checkpoint
  is refused); origin_id must match the signing key; the anchor
  block hash must recompute under the chain's public formula (a
  forged anchor is refused); canonical signed bytes EXCLUDE the
  anchor (the origin signs before notarization — the chain's
  witness is added after).
- Freshness is MEASURED, never asserted: age from the signed
  notarized_at against an explicit window (default 24h), printed in
  every verdict with FRESH/STALE OBSERVATION.
- Evaluation (the five ruled behaviors + the advance case):
  agrees -> ANCHORED; local behind -> STALE, NOT CURRENT; same
  height different hash -> CONFLICT, NOT CURRENT; local ahead with
  the anchored state on the local chain -> LOCAL AHEAD, disclosed;
  anchored state absent from local history -> CONFLICT, NOT
  CURRENT; none -> G24 honest boundary retained (disclosed);
  chain unreachable -> disclosed, G24 boundary; competing valid
  checkpoints -> surfaced, NEVER silently chosen.
- THE SUCCESS LAW held everywhere: the checkpoint layer only
  DEMOTES. It never promoted anything; G24's per-record validity
  checks are unchanged.

## THE TEN DECISIVE ATTACKS (kit origin, fresh never-exposed key 3)
C0 anchor case: ANCHORED, age 0.0h FRESH.
1  stale replica behind checkpoint: STALE — height 2 behind the
   anchored 3; the locally valid history is NOT CURRENT. ✓
2  conflicting local fork (tipB branch) vs checkpoint (tipA state,
   same height): CONFLICT — local tip DIVERGES; NOT CURRENT. ✓
3  forged checkpoint (signature flipped): REFUSED — not a valid act
   of the sovereign origin. ✓
3b forged anchor block (hash does not recompute): REFUSED. ✓
4  valid OLD checkpoint (30h) replayed as latest, node at the
   anchored state: ANCHORED but age 30.0h STALE OBSERVATION —
   disclosed; the replay manufactures nothing. ✓
4b first contact pinned to height 1 with a matching old
   checkpoint: ANCHORED, age disclosed STALE OBSERVATION — the
   node KNOWS the observation is old; liveness beyond the window
   is never assumed. ✓
5  checkpoint withholding: G24 boundary retained, disclosed. ✓
6  competing checkpoints (forkA + forkB states both notarized at
   height 4): CHECKPOINT CONFLICT surfaced — never silently
   chosen (no timestamp/arrival/chain-position preference). ✓
7  origin advanced after checkpoint (local 3 > checkpoint 2):
   LOCAL AHEAD, disclosed. ✓
8  fresh node first contact (only height-1 state; checkpoint names
   height 3): STALE — the node KNOWS it is stale. THE G24 N1
   BOUNDARY IS CLOSED: first-contact stale serving is now bounded
   by the public anchor. ✓
9  HARZ-chain unavailable: disclosed fetch failure; G24 honest
   boundary retained. ✓
10 checkpoint restored after the outage: re-anchored, no history
   edit — the state hashes never moved. ✓

## LIVE (production, not kit)
- First real checkpoint NOTARIZED by the sovereign origin through
  the chain's signature gate: height 3, state f3bc50b99dca3b7b...,
  tx ckpt-AFB6AD1EF47AB3F36D7101F06FF0F2A312B33F80, anchored at
  HARZ-chain block 11355047.
- Fresh node vs LIVE HARZ-chain: every record AUTHENTIC, s3
  CURRENT, CHECKPOINT (live): ANCHORED, age 0.1h FRESH.
- Browser-verified both sides: /api/checkpoint/latest serves the
  notarized checkpoint publicly; /api/continuity/v1 serves tip +
  matching checkpoint; tip == checkpoint exactly.
- Regression: the G24 N1-N5 matrix re-ran byte-identical (no
  checkpoints -> boundary lines only; no verdict changed). The
  chain's own status after everything: live, height intact, mining
  cron unaffected.

## HARNESS DEFECTS (disclosed, corrected without touching any law)
1. My chain deploy metadata carried keep_bindings limited to
   secret_text, which REMOVED the D1 and KV bindings for ~2 minutes
   (chain showed status limited, height 0 at the edge). Caught,
   fixed by redeploying with the full binding set; chain restored
   live, height and data intact. The chain never lost data; blocks
   simply could not be written during the window.
2. The vault's chain source (8.1.x) was STALE vs live (8.3.0). The
   first deploy attempt failed on module name and NO stale code was
   pushed: the patch was re-applied to the CURRENT live source
   before the successful deploy.
3. Kit process death mid-build (in-memory store): the fresh node
   honestly refused unfetchable artifacts until the kit restarted;
   chains rebuilt fresh; nothing from a dead instance entered any
   verdict.
4. The verifier's first checkpoint layer computed canonical bytes
   including the anchor (mismatch with the origin's sign-before-
   notarization flow). Fixed: canonical bytes exclude the anchor.
   Caught by the C0 anchor case refusing a valid checkpoint BEFORE
   any attack was claimed — the kit did its job.
5. mint-checkpoint harness arg bug (fingerprint passed as a file
   path): fixed test-side.

## THE ANSWER TO G24's RESIDUAL
"Two fresh nodes encountering conflicting histories without a
prior shared checkpoint" is now closed against the public root:
both nodes anchor first contact to the same on-chain observation
(case 8 vs case 1: a node can no longer be silently pinned to
stale history; a fork can no longer pose as current — case 2).
What remains honest and disclosed: a node with NO checkpoint keeps
the G24 boundary (case 5/9); an old observation anchors only what
it notarized and says its age (case 4/4b). Integrity closed at
G24; convergence closed at G25 against the external root.
