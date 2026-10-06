# REC1 — INTERNETLESS RECONCILIATION CONTRACT (frozen Oct 6, 2026, on Dad's step 12: "freeze only the reconciliation contract once the attack battery earns it")

Earned by: REC1 battery 28/28 PASS, two consecutive clean runs (rec1-run-05.log, rec1-run-06.log),
against the FROZEN v0.2 primitive (sha256 d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61),
verified unmodified at the start and end of every run. Full attack history: REC1-TRACE.md.

## THE RECONCILIATION LAW

1. CONVERGENCE MEANS SET EQUALITY OF RECORDS THAT RE-VERIFY NOW. After exchange, every node's
   verified set is identical (same nonces, same records, identical deterministic digest computed
   by an independent verifier over raw disk bytes), regardless of arrival order, duplication,
   or which side held what during the partition. Gossip must reach a fixpoint: a further round
   delivers nothing new.

2. EXCHANGE IS EVIDENCE, NEVER TRUST. Every arrival is re-verified against its own signature
   before it enters the durable store; duplicate nonces are skipped; stored labels are cache,
   never authority; ACK means fsynced-durable, and a dead node ACKs nothing.

3. CONFLICT IS PRESERVED, NEVER RESOLVED. Two valid but conflicting records both survive the
   exchange verbatim on every node. The mesh never selects, ranks, merges, or discards either.
   Arrival order is disclosed and is never an authority claim.

4. NO NODE BECOMES AN AUTHORITY. Node output may claim transport authenticity only
   ([VERIFIED] / [UNVERIFIED] / [CORRUPT], torn-line disclosures). Currency and authority
   questions live in signed sovereign state and the standing verifier (the five walls, G24-G28),
   never in the mesh.

5. SOVEREIGN STATE NEVER MERGES THROUGH THE MESH. Seal chains are node-local; exchange
   transports envelopes, never sovereign authority. No exchange, duplicate, tamper, or authority
   claim may touch a node's seals.

6. MISSING EVIDENCE HEALS ONLY THROUGH EVIDENCE — WITH THE MEASURED BOUNDARY. A record lost
   locally returns only if a peer still holds it and it re-verifies NOW. F-REC1 BOUNDARY (frozen
   as measured, v0.3 ruling pending): while a node's process runs, its boot-seeded dedup set
   masks re-delivery of records lost from disk after boot; healing completes across a restart,
   which re-seeds the dedup set from disk. In no phase is anything fabricated.

7. A RECORD NOBODY HOLDS IS ABSENT EVERYWHERE, HONESTLY. Exchange never fabricates a missing
   record; both sides agree on the absence.

8. TAMPERED RECORDS ARE EVIDENCE, NEVER VERIFIED RECORDS. Refused at receipt, stored as
   unverified evidence, displayed honestly ([UNVERIFIED] for received-tamper; [CORRUPT] for a
   stored-verified record that fails re-verification NOW), excluded from the verified set and
   from forward propagation. They never break convergence of the verified set.

9. DUPLICATES: same-envelope replay dedups exactly-once by envelope nonce; a fresh-nonce resend
   of identical content stores both (known, disclosed, v0.3 candidate — re-measured here, no
   authority impact).

10. THE CONVERGED STATE IS DURABLE. Kill -9 both nodes at any point after convergence; restart;
    the verified sets and digest are unchanged, re-derived from disk.

11. THE DEATH LINE (verbatim, frozen): CONVERGENCE OF TRANSPORT IS NEVER RESOLUTION OF TRUTH.
    A properly-signed envelope demanding authority rides as data, is stored on both sides, and
    changes no verdict, no seal, no label.

## SCOPE OF THE CLAIM

Workbench proof at the mesh/envelope layer of the frozen v0.2 primitive. This contract does not
claim field closure: the two-phone field gate remains pending exactly as ruled, and workbench
runs never close stages. It does not claim sovereign-verdict convergence: seal chains and the
five-wall layer are separate by design. It earns exactly this sentence:

"Two sovereign nodes that grew apart during a true partition converge — deterministically, from
evidence alone — to one identical re-verified record set on both sides, without either node
gaining a grain of authority, and without the conflict they carry being silently resolved."
