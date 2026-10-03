# G23 SOVEREIGN ORIGIN AUTHORITY — TRACE (2026-10-03)

Contract: G23-AUTHORITY-V2-CONTRACT.md (frozen ac08d3d, anchor
c0c294f). Ruling: B (Dad, verbatim law: "Public topology proves what
was said. The origin signature proves who was authorized to say it.")

## THE PRIMITIVE (built additively, frozen formulas untouched)
The HARZ sovereign origin owns an Ed25519 keypair. The private key is
a worker secret in deployment (production fingerprint
74270fd52cc9d965...) and a confined, gitignored file in the Node Kit
test keys. It NEVER enters a verifier, mirror, export, or public
state. Every designation is signed over the G21 canonical bytes
(resolver identity, memberships with content hashes, order-bound
evidence, law+version+record) and carries the signing key fingerprint,
making rotation explicit. The G21 public designation_receipt hash
REAINS (frozen formula untouched) — the signature is an additive
layer: origins without ORIGIN_KEY simply emit no signature, disclosed
unsigned state refused by anchored verifiers. Fully sovereign: Web
Crypto Ed25519, no external CA, works identically in Node Kit and
Cloudflare Workers — the authority primitive does not secretly depend
on Cloudflare (proven by the entire kit test being run in Node).

## GATE RESULTS (all measured live)
G1 contract frozen before build (ac08d3d).
G2 key confinement: origin key 771fdb0a..., attacker key 9eea8110...
   (freshly generated for the attack), origin key 2 4ceff73d...,
   production key 74270fd5... — private keys gitignored (keys/*.pem
   in .gitignore); only public anchors and fingerprints committed.
G3 signed emission built additively; syntax + deploy clean.
G4 LEGITIMATE ORIGIN (kit) vs pinned kit anchor: topology VALID,
   hashes VALID, artifact VALID, signature AUTHORIZED -> VERIFIED.
G5 ATTACK REPLAY (the exact G22 attack, attacker's own fresh key):
   topology VALID, hashes VALID, artifact VALID, signature
   UNAUTHORIZED -> NOT VERIFIED. "Topology alone is not authority."
G6 KEY TRANSITION: v2-signed state without the transition record ->
   NOT VERIFIED (no silent rotation). v2-signed state WITH the
   v1-signed transition record (old key signs the introduction of the
   new key) -> VERIFIED under pinned v1. Forged transition (attacker
   key pretending to be introduced) -> REFUSED at the transition
   signature. Rotation is an explicit signed policy act, never silent.
G7 DEATH TEST (same topology, same records shape, same hashes, same
   public formula, different signing key): legitimate VERIFIED,
   parallel authority NOT VERIFIED. Also measured against the
   PRODUCTION anchor: attacker state (9eea8110) NOT VERIFIED, kit
   origin state (771fdb0a) NOT VERIFIED — only the production key
   (74270fd5) verifies. Anchor binding works in both directions.
G8 G22 FROZEN EVIDENCE under AUTHORITY-V2: the G22-era attack state
   (unsigned, exact frozen bundle rebuilt from c0c294f) -> topology
   VALID, hashes VALID, artifact VALID, signature UNAUTHORIZED ->
   NOT VERIFIED. The attack that VERIFIED under the pre-key
   architecture now fails on the signature alone. G22 stays FAILED
   as the pre-key evidence; nothing was patched away.
G9 PRODUCTION: harz-intelligence deployed with the ORIGIN_KEY
   secret; live missions emit signed designations (fingerprint
   74270fd52cc9d965..., Ed25519); fresh node verifies the live
   production state against the pinned production anchor: VERIFIED.
   Browser-verified live record (m-mission-d5b69ed6-699) serving the
   signed designation, sovereign: true. Regressions after deploy:
   G19 chain 11/11 VERIFIED, G20 chain VERIFIED, G21 chain VERIFIED —
   old records recompute unchanged (additive only).
G10 DETERMINISM: identical verdicts across repeated fresh-node runs.

## THE ANSWER TO G22'S FINAL QUESTION (now exact)
"Can the system distinguish 'the authorized origin changed the
topology' from 'someone changed who the authorized origin appears to
be'?" — YES, now: the first case carries a signature from the pinned
key; the second case can reproduce every public hash and still cannot
manufacture the authority's signature. One pinned public key -> one
authorized origin.

## HARNESS SLIPS DISCLOSED (test-side only)
1. The first attack topology used wrong task ids (the compose
   referenced itself; both authorities failed identically —
   determinism, at least) — fixed to the G21 topology and re-run.
2. The kit in-memory stores die on restart; sealed states reference
   their artifacts, so attacker records were re-run after a restart
   to restore the store before the final death-test leg.
Neither touched origin, formulas, or frozen state.

## KEY INVENTORY (public material; private keys confined, uncommitted)
kit origin key 1: 771fdb0a43020e4b129f7267... (pinned kit anchor)
kit origin key 2: 4ceff73d1101678dc65984c4... (transition target)
attacker key:     9eea8110dacbc9e46e5bffca... (the parallel authority)
production key:  74270fd52cc9d9656744284b... (deployed ORIGIN_KEY)
transition record: keys/key-transition-v1-to-v2.json (signed by key 1)

## ADDENDUM: CONFINEMENT SLIP AND THE FIRST REAL ROTATION (2026-10-03)
A law was broken during the audit itself, and the response is
disclosed here rather than hidden: the first push of the G23 commit
(2db1897) accidentally included the private key PEMs — the gitignore
pattern `keys/*.pem` did not match the nested audit path. Exposure
window ~3 minutes on the private harz-git remote. Response:
1. The commit was reset, the pattern corrected (`**/keys/*-key.pem`),
   private keys removed, and history force-cleaned (8994e76) so the
   remote tip contains no private material.
2. The PRODUCTION key was ROTATED IMMEDIATELY — not as an exception,
   but THROUGH the frozen transition law: production key 1
   (74270fd52cc9d965...) signed the introduction of production key 2
   (8ae5337b973f8e53...); harz-intelligence redeployed with key 2;
   fresh live records verified against the pinned key-1 anchor +
   the signed transition record -> VERIFIED; without the transition
   record -> NOT VERIFIED (no silent rotation in production either).
The rotation mechanism G23 built was exercised for real on its first
day, by the very slip that proves why it exists. The law that was
broken is the law that answered it.

## KEY INVENTORY (updated; private keys confined, uncommitted)
kit origin key 1:   771fdb0a43020e4b129f7267... (pinned kit anchor)
kit origin key 2:   4ceff73d1101678dc65984c4... (kit transition target)
attacker key:       9eea8110dacbc9e46e5bffca... (test-fixture parallel authority)
production key 1:   74270fd52cc9d9656744284b... (pinned production anchor; ROTATED OUT post-slip)
production key 2:   8ae5337b973f8e53f35e91c0... (current production signing key)
transition records: keys/key-transition-v1-to-v2.json (kit), keys/production-key-transition.json (production)

## DAD'S CLOSE-OUT RULING (2026-10-03, G23 CLOSED/PASSED) + FROZEN REVOCATION LAW
Dad confirmed G23 PASSED and ordered the following statement frozen
permanently in the audit record (verbatim):

  "The exposed key is permanently revoked/retired and must never
  again be accepted as an origin signer. Don't rely on the repository
  cleanup as the security boundary; the cryptographic transition is
  the boundary."

Frozen as keys/revocations.json (HARZ-KEY-REVOCATION-V1):
- production origin key 1, 74270fd52cc9d965... — REVOKED permanently
- kit origin key 1, 771fdb0a43020e4b... — REVOKED permanently
- kit origin key 2, 4ceff73d1101678d... — REVOKED permanently
- attacker key, 9eea8110dacbc9e4... — never an authorized origin

The signed transition harz-production-key-1-to-2 PREDATES the
revocation and stands as the recorded containment boundary. The
revocation applies to designation signing from this record forward.
STANDING ANCHORS (pinned directly, post-revocation):
- production: 8ae5337b973f8e53... (origin key 2 — the live signer)
- kit: de2a86867d6d447f... (origin key 3 — fresh, never exposed)

ENFORCEMENT IS CRYPTOGRAPHIC, NOT DOCUMENTARY: the authority-verifier
now loads the revocation list and refuses any designation signed by
a revoked fingerprint — MEASURED: a state signed by revoked key
74270fd5, presented with the old anchor plus the valid transition
chain (which would otherwise accept it), is REFUSED with the
revocation verdict; the current production state (key 8ae5337b)
verifies against the standing anchor. A revoked key cannot return
through a chain, an anchor, or an export.

The audit progression, final form (Dad):
G20 topology can be manipulated. G21 topology becomes content-bound.
G22 content-bound topology still permits parallel authorities.
G23 authority becomes cryptographically bound to the sovereign origin.
G22 remains FAILED — the pre-key evidence, never patched away.
