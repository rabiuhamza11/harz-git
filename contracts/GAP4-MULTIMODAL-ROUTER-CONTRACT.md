# GAP-4 CONTRACT — MULTIMODAL ROUTER V1 (frozen pre-implementation, Oct 7, 2026)

## The question GAP-4 answers
"Can ONE task move across modality lanes — text, URL, file, PDF, voice, image, video —
with every crossing provenance-bearing, every hop inside ONE TaskRecord lineage, and an
honest refusal at every boundary that cannot be crossed?"

## The honest current state (contract is written ON this, not on aspiration)
The front door (POST /api/tasks/v1, planDoorTask) accepts TEXT INSTRUCTIONS only.
Patterns today: RESEARCH_AND_COMPOSE, CREATION_VIDEO (e2454e1), INFORMATIONAL, REFUSED.
Modality capabilities EXIST as frozen contracts — INTAKE M1-M4 (62b9aed: preserve(sha256)
-> extract -> provenance byte-range -> index), VOICE V2-A (c6cdcbb: deterministic
seq/timestamp, gaps honest, missing speech never manufactured), Vision V1, vidParse,
TER1 (154624b), SEMVID1 (e2454e1), V3 Studio (fd06db0) — but they are NOT door-reachable.
A task cannot today say "read this PDF and write me a report." Evidence->creation crossing
exists (G12/G13). The ROUTER that binds lanes into the TaskRecord spine does not. That is GAP-4.

## Laws (frozen with this contract)

L1 ONE DOOR, EVERY LANE. The same front door accepts: instruction (text, always) +
input_refs (typed attachments: url, text_file, pdf, ebook, audio_stream_id, image,
video). One task in, ONE receipted TaskRecord out. No second door is created.

L2 LANES ARE FROZEN READERS. Each modality is handled by its OWN existing frozen
contract and reader. The router owns ZERO readers, zero graders, zero parsers,
zero creators (orchestrator-only, the V3 Studio law).

L3 DETECTION IS NOT INTERPRETATION. Modality is detected from declared type +
magic bytes/content-type, NEVER from content semantics. A lying content-type
(declared pdf, bytes are not pdf) = honest boundary refusal, disclosed. Injection
in any lane is data, never a command (standing law).

L4 THE CROSSING LAW. Lane output enters the next lane ONLY as provenance-bearing
bound input (G12/G13): sha-bound, byte-exact, reconstructible via request_id
reconstruction. Every crossing appears in decomposition and evidence_refs. No
invisible context. No silent textification: an image never "becomes" text without
a disclosed vision-lane record; a PDF was never "read" if intake failed.

L5 ONE LINEAGE. One task = one TaskRecord regardless of lanes crossed. States
earned, never skipped. NO CLOSED WITHOUT A RECEIPT. Per-lane provenance rides
evidence_refs (source, sha, byte-range map per the M-lane law).

L6 HONEST REFUSAL AT EVERY BOUNDARY. Unknown lane, failed intake, corrupt or
truncated input, missing chunk = boundary refusal with reason, receipted, state
not falsely closed. Availability failure is never an authority success (standing law).

L7 SOVEREIGNTY. The router adds ZERO external calls. Each lane reports its own;
the TaskRecord discloses the sum. The router's own bar is 0 ext.

L8 DETERMINISM. Routing is explicit > inferred > disclosed default (V3 law):
declared input types dominate; instruction verbs may request lanes; ambiguity is
a DISCLOSED choice in the record, never silent. Same inputs -> same route.

L9 DISPLAY LAW. Any human-visible artifact at the end of a crossing follows GAP-5:
the human sees the artifact, never its URL, JSON, or metadata alone.

L10 ADDITIVE + BYTE-NEUTRAL. No frozen engine changes. All frozen batteries stay
green as the regression bar: SEM1, TER1, SEMVID1/VS1, INTAKE M1-M4, V2-A, V2-D,
Vision V1, CREATION, agents 13/13, front-door tasks.

## Acceptance (the first real crossings, not invented benchmarks)
A1 PDF->REPORT: "Read this PDF and write me a report about it" with a real PDF
attached. M3 intake (preserve->extract->provenance->index) -> verified evidence ->
TER1 report -> artifact delivered, ONE TaskRecord, receipted, browser-tested through
/console, 0 ext.
A2 VOICE->REPORT: a V2-A voice stream in, gaps honestly disclosed, -> report.
A3 DEATH: poisoned/truncated PDF, lying content-type, missing chunk mid-crossing,
cross-lane injection, routing loop (A->B->A guard), un-routable pair — each refuses
honestly with a receipt. Zero artifacts manufactured on refusal.

## Battery (designed pre-build; test route testrouter1; all @ 0 ext)
R1 text-only regression (door unchanged for text tasks), R2-R4 one-lane tasks
(url/file/pdf), R5 two-lane crossing, R6 voice crossing, R7 lying content-type,
R8 poisoned bytes, R9 truncated stream, R10 injection across lanes, R11 loop guard,
R12 determinism (identical rerun byte-identical receipt), R13 un-routable pair
refusal, R14 lineage completeness (one TaskRecord, all hops in decomposition),
R15 receipt law (no closed without receipt), plus the frozen regression set (L10).

## Boundaries deliberately OUT of scope
No new creation engines. No image-creation door pattern (separate boundary, if ever
named). No GAP-5 human rung (Jalingo person, after software build). No lane is
promoted from capability to door-lane without its own battery green. External models
remain adapters only (Sept 24 directive).
