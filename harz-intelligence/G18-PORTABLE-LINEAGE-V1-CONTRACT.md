# G18 CROSS-NODE LINEAGE RECONSTRUCTION AUDIT — CONTRACT (PORTABLE-LINEAGE-V1)

Frozen: 2026-10-03, BEFORE any build. Anchor: 79359ee (G17 closed).
No origin-node code changes. No reconciliation protocol. G18 answers one
question: is the content-addressed evidence graph ALREADY portable?

## THE QUESTION (Dad, verbatim)
Can another sovereign node reconstruct and verify the same evidence history
without trusting the originating node's in-memory interpretation?

Chain under test (the SAME completed G16/G17 chain, live records):
A + B -> conflict (refused, structured) -> C -> designated resolution ->
creation -> reader.

## THE INDEPENDENT NODE
A fresh Node.js runtime in g18-independent-node/ (separate process, separate
memory, different machine from the Cloudflare origin). It implements the
FROZEN CONTRACT FORMULAS from the documented vault laws (not from origin
memory) and runs the FROZEN Vision V1 reader (visDecodePng + helpers
extracted VERBATIM from the committed frozen source — same judge, different
court). Its only network access: ONE HTTPS fetch of the artifact endpoint
(the transport under test — the same call any reader makes; no third-party
provider is contacted).

## MINIMUM CANONICAL EXPORT (gate 1)
Two records, fetched byte-exact over the origin's public HTTP surface (this
IS the sovereign-node boundary crossing), sealed as one JSON file:
  record 1: the conflict mission (G16 structured conflict) — A+B verified,
    compose refused, structured conflict object, mission receipt chain
  record 2: the G17 lineage construction mission — A+B+C verified, compose
    verified with evidence/resolves_conflict/resolution disclosures,
    delivered child (request_id, artifact sha), mission receipt chain
NOTHING else is exported: no fixture table, no secrets, no origin code, no
artifact bytes (the artifact is re-fetched by the independent node).

## FROZEN FORMULAS THE INDEPENDENT NODE REIMPLEMENTS (from the vault laws)
- sha256/mSha: plain SHA-256 hex of the UTF-8 string (frozen in core).
- fixture receipt: sha256('verified:fixture:' + fixture_id + ':' + sha256(answer)).
- refusal receipt: sha256('refused:' + refusal_text).
- compose receipt: sha256(canonical JSON.stringify of the delivered+
  refused children outcome map: mode, request_id, artifact_sha256, outcome
  (undefined dropped — JS canonical form), concat in delivery order).
- mission chain: sha256('HARZ-MISSION-1|' + id), then per task in order:
  sha256(prev + ':' + (receipt || 'no-receipt')).
- claims extraction: byte-exact section addressing of the frozen reasoner
  format (**Answer**\n\n prefix; claims run to the earlier of the
  '\n\nSources: ' or '\n\nCONFIDENCE: ' boundary).
- creation prompt: instruction + HEADER + claimsA + '\n\n' + claimsB +
  '\n\n' + claimsC (caller order); request_id = sha256('create:' + prompt)
  hex truncated to 24 chars.
- studio/frozen reader: visDecodePng VERBATIM (signature, chunk walk,
  CRC32 per chunk, IHDR, IDAT inflate, scanline unfilter, tEXt metadata,
  pixel readback) over the raw artifact bytes.

## VERIFICATION MATRIX (gates 2-9) — the independent node, from the sealed
## export + one artifact fetch, must independently reach:
V1 recompute every fixture/refusal/compose receipt from record bytes; the
   compose receipt from the recorded children (mode/request_id/artifact
   sha) — all must equal the recorded receipts.
V2 recompute both mission receipt chains; equal the recorded mission
   receipts.
V3 reconstruct the A+B conflict from record 1: claims extracted from the
   fixture answers, claims_sha256 recomputed, conflict object entries
   verified (receipts, provenance); the refusal receipt recomputed from the
   frozen G15 message.
V4 reconstruct C + designation from record 2: resolution_from [3] cites C;
   resolution_sources sha == recomputed C claims sha; resolves_conflict
   shas == recomputed A/B claims shas — AND == record 1's conflict claims
   shas (the cross-record lineage edge: what record 1 refused to resolve is
   exactly what record 2's resolution addresses).
V5 reconstruct the creation prompt and request_id from record 2 alone;
   request_id must equal the recorded child request_id; recomputed prompt
   sha must equal the artifact receipt's prompt_sha256.
V6 re-fetch the artifact endpoint over HTTPS from the independent node;
   recompute image sha from the returned bytes_b64; equal the recorded
   artifact sha; run the frozen reader VERBATIM over the raw bytes — it
   must accept (structure, CRCs, IHDR, inflate, pixels, tEXt metadata).
V7 emit an independent verdict: every check PASS/FAIL + overall — the same
   verification result the origin reached (gate 9).
V8 determinism: run the verifier twice — identical verdicts and outputs.

## TAMPER MATRIX (gate 10) — mutated COPIES of the sealed export must make
## the independent node REFUSE loudly (never repair, never skip silently):
TA remove ancestor: delete fixA's task from record 2 -> the mission chain
   recomputes differently AND the evidence array references a missing
   ancestor -> REFUSE.
TB mutate ancestor bytes: change one byte of C's answer -> fixture receipt
   mismatch -> REFUSE.
TC mutate a lineage edge: change a claims_sha256 in record 1's conflict
   object -> cross-verification against the recomputed claims bytes fails
   -> REFUSE.
Every tamper run must exit with a failure verdict and list the exact broken
edge. No repair path may exist in the verifier.

## INVARIANT (Dad, verbatim)
A node may carry the state, but the state — not the node's memory —
defines the truth of the lineage.

## GATES
G1-G2 minimum export, independent import: export file + verifier setup
G3-G4 independent hash + chain recomputation: V1, V2
G5-G6 conflict + resolution reconstruction (incl. cross-record edge): V3, V4
G7 prompt/request-id reconstruction: V5
G8 artifact re-fetch + frozen reader re-run: V6
G9 same verification result + determinism: V7, V8
G10 tamper refuses, never repairs: TA, TB, TC
Browser (standing order): the exported records + artifact endpoint fetched
live to prove export integrity (origin serves exactly the sealed state).
