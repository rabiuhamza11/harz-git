# G18 CROSS-NODE LINEAGE RECONSTRUCTION AUDIT — TRACE (2026-10-03)

Contract: G18-PORTABLE-LINEAGE-V1-CONTRACT.md (frozen 8ea1384; anchor
79359ee). The audit's purpose was to EXPOSE portability gaps — and it did:
two real findings, disclosed below, both resolved inside the audit.

## THE INDEPENDENT NODE (built this gate)
g18-independent-node/: frozen-reader.js (Vision V1 parser + iTXt metadata
reader extracted VERBATIM from the committed frozen source — same judge,
different court) and verifier.js (the frozen contract formulas implemented
independently from the documented vault laws). The node reads ONLY the
sealed export plus ONE HTTPS fetch of the artifact endpoint. No repair
path exists anywhere in it: every failure is a REFUSED verdict, exit 1.

## FINDING F1 (real, exposed by the first verifier run): export insufficiency
The served fixture task records did NOT carry fixture_id — the fixture
receipt formula (sha256('verified:fixture:' + id + ':' + sha256(answer)))
includes an identity that lived only in the origin's fixture table. The
minimum canonical state could NOT recompute fixture receipts: a genuine
'node memory vs state' gap — exactly what G18 exists to catch.
RESOLUTION: minimal disclosure fix at the record boundary (fixture tasks
now record fixture_id; zero receipt formulas touched; a fresh chain was
run so the sealed export is self-describing). Historical records remain
valid history; their fixture identities remain recoverable via the frozen
fixture contracts committed in the vault.

## FINDING F2 (real, formula semantics — a documentation finding, not
## corruption): the image_sha256 formula
The receipt's image_sha256 does NOT mean sha256 of the raw decoded bytes.
The frozen worker hashes the artifact as a JS string: sha256 of the UTF-8
ENCODING of the latin1 string form (TextEncoder over code units >= 0x80
produces multi-byte sequences). sha256(utf8(latin1(raw))) == the claimed
6d5eda75... while sha256(raw bytes) == 6e4c4364... (verified in two
runtimes). The formula is deterministic, bijective, and fully portable —
any node reproduces it from the exported bytes — but an auditor must know
it. Recorded here and in the verifier's frozen-formula documentation.
Related honest note: creator metadata travels in iTXt chunks (UTF-8 law);
the frozen Vision V1 parser reads tEXt and its texts count on creator
artifacts is legitimately 0 — structural acceptance + pixel readback are
its judgment there; metadata readback uses the frozen iTXt reader.

## TEST MATRIX RESULTS (all live)
V1 every content hash recomputed independently from the sealed export:
   fixture receipts (now from exported fixture_id + answer bytes),
   refusal receipts (from refusal text), compose receipts (from the
   canonical children outcome map) — ALL equal the recorded receipts. PASS
V2 both mission receipt chains recomputed independently: PASS
V3 A+B conflict reconstructed from record 1: claims extracted from fixture
   answers, shas recomputed, conflict object verified (receipts,
   provenance), refusal receipt recomputed from the frozen G15 message. PASS
V4 C + designation reconstructed from record 2; resolution cites C
   (receipt + sha verified); resolves_conflict shas verified AND == record
   1's conflict shas — the cross-record lineage edge intact: what record 1
   refused to resolve is exactly what record 2's resolution addresses. PASS
V5 creation prompt + request_id reconstructed from record 2 alone: MATCH;
   independently reconstructed prompt sha == artifact receipt prompt_sha256. PASS
V6 artifact re-fetched over HTTPS from the independent node; image sha
   reproduced via the frozen formula: MATCH; recorded child sha: MATCH;
   frozen Vision V1 parser re-run VERBATIM: accepted (IHDR 102x83, chunk
   CRCs, pixels); frozen iTXt reader: prompt words carried (470 chars). PASS
V7 independent verdict: 18 checks PASS, same result as the origin. PASS
V8 determinism: verifier run twice — byte-identical verdicts. PASS

## TAMPER MATRIX (gate 10) — mutated COPIES, all REFUSED, exit 1, zero repair
TA remove ancestor (fixA deleted from record 2): 4 broken edges listed —
   mission chain MISMATCH, resolves_conflict ancestor not verifiable,
   claims not extractable, prompt sha mismatch. REFUSED.
TB mutate ancestor bytes (C's answer 800->999): 4 broken edges — fixture
   receipt MISMATCH, resolution act sha mismatch, request_id MISMATCH,
   prompt sha mismatch. REFUSED.
TC mutate lineage edge (conflict claims_sha256 in record 1): 2 broken
   edges — conflict claim sha/receipt mismatch + cross-record lineage
   edge broken (record 2's resolution evidence no longer matches record
   1's conflict evidence). REFUSED.
An initial harness roughness (TA refusing via exception rather than edge
listing) was fixed in the verifier and re-tested — the refusal behavior
(fail-closed, never repair) held throughout.

## BROWSER (standing order)
The artifact endpoint fetched live: identical receipt (image sha
6d5eda75..., prompt sha 8c768822..., 8 reader checks green,
what_remains=[]); the two mission records were fetched live during
sealing (byte-exact transfer across the sovereign-node boundary).

## THE ANSWER TO DAD'S QUESTION
Yes — another sovereign node reconstructed and verified the complete
evidence history from transferred state alone: every content hash, both
mission chains, the conflict, the resolution designation, the cross-record
lineage edge, the creation prompt, the request_id, the artifact bytes
through the frozen reader. It reached the same verification result the
origin reached, and it refused every tampered copy, listing the exact
broken edges. The graph is a reconstructible sovereign evidence graph —
with the two honest footnotes the audit surfaced: exported records must
be self-describing (F1, fixed at the record boundary), and hash formula
semantics must be documented to the byte (F2, documented here and in the
verifier). The state, not the node's memory, defines the truth.
