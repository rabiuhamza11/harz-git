# HNS DEATH TEST — RECEIPTS (Sep 16, 2026)

Clean full run (12/12 GO, exit 0), one sitting:
PASS 0  Live D1 located from worker binding (c120ae12, first run; dynamic since v1.1)
PASS 1  Pre-kill: live zone serves height 1, empty registry — zone body sha256 7e4c72c9eec5…
PASS 2  Pre-kill: chain verifies at bridge — fp b1c00ed8320bddf5 match, Ed25519 over state hash TRUE
PASS 3  Pre-kill receipts: 3 tables schema, 0 names, 0 reglog, 5 KV
PASS 4  KILL: production harz-names D1 deleted (real)
PASS 5  Death confirmed (GET 404; worker served HTTP 500 during death — honest dead)
PASS 6  RESTORE: fresh harz-names D1 created
PASS 7  RESTORE: all bytes back (schema + rows + KV identical; chain state + sig + fp intact)
PASS 8  MIGRATE: deployed source (32677B) downloaded, re-uploaded, worker re-bound to new D1
PASS 9  RESURRECTION: live zone serves again
PASS 10 UNMUTANT: state INVARIANT under death — byte-identical zone, same height+hash, sig TRUE
PASS 11 API parity after death: /recent identical, unknown still NXDOMAIN
PASS 12 Binding on record: worker DB -> new D1

Worker source: harz-names-worker.js, 32677 bytes, sha256 4ab8cbad88f063a2…
Secret scan: CLEAN (Ed25519 keypair generated at runtime into D1 KV by the worker; source
embeds only secp256k1 public constants for EIP-191 checks; PEM string is /pub export).
D1 lineage: c120ae12 (killed) → c785720d (killed) → 3671f01c (killed) → 6ec2508c (LIVE).
Zone state hash (invariant across all three kills): d7123e3b48f7b85a3834601209195bc835f237795fa5e05488492d145dc4ad9a
Fingerprint: b1c00ed8320bddf5. Height 1. Records 0 (registry empty — deaths cost nothing).
