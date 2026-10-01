# HARZ-CREATION-V3 v1.0 — SOVEREIGN CREATIVE STUDIO CONTRACT
## FROZEN BEFORE IMPLEMENTATION — October 1, 2026, ~13:35 WAT
## Dad's order: "Go" (V3 Creative Studio — the composition surface over the completed multimodal stack)

**Executor status at freeze: NOT IMPLEMENTED. This document is committed to the vault before any build code is written.**

## Constitutional problem
HARZ has five proven sovereign creators: Text->Image (V2-A), Text->Voice (V2-B), Text->Music (V2-C), Image->Video (V2-D), Story->Film (V2-E). The Studio is the honest composition surface: one request, many artifacts, each produced by its OWN unchanged creator chain — the Studio orchestrates, it never grades, never parses, never fabricates.

## Pipeline (verbatim intent)
verified text -> mode resolution (explicit or inferred, ALWAYS disclosed) -> per mode: the FULL unchanged child chain (generate -> test by the frozen readers -> verify -> honest receipt) -> studio bundle (children manifest, per-child states) -> studio verification (every child claim re-checked against its store record) -> delivery: every child advances through its OWN delivery function on a real fetch -> studio receipt ONLY when every requested child reached an honest terminal state (delivered, or boundary-refused with the refusal disclosed, never masked) -> browser

## Studio laws
1. ORCHESTRATOR ONLY: the Studio ships ZERO parsers and ZERO new graders. Every child artifact is judged ONLY by the UNCHANGED frozen reader of its own modality (Vision V1 for images, v1ExtractWav for voice and music, vidParse + Vision V1 for video frames, filmParse + the inherited frozen readers for film). The Studio never grades a child weaker or stronger than its own gate.
2. ROUTING LAW: modes are explicit when given; otherwise inferred from the parsed requested_type; the decision (and any default) is disclosed in every bundle, never silent. Injection in the text cannot alter routing — routing reads only the parsed type and explicit mode list.
3. FULL CHILD CHAINS: every mode runs the complete child chain (generate, test, verify, receipt) with its own manifest, seed, and store record under the child's own KV key. No partial children, no summary artifacts.
4. COMPOSITION LAW: video mode composes inside the bundle: a full V2-A source-image child (role disclosed: source-for-video) feeds a full V2-D video child. The source image must survive the frozen Vision V1 decoder before the video child may run (V2-D intake law inherited).
5. BUNDLE RECEIPT LAW: the studio receipt chains EVERY requested child: mode, request_id, artifact sha256, child states, child receipt. receipt_emitted = true only when every requested child is delivered (real fetch advanced through its own delivery function) OR honestly refused at a creation boundary (refusal disclosed in the receipt, never masked). A failed child (failed test, corrupted bytes, undeliverable) withholds the receipt and is disclosed in what_remains — never claimed, never hidden.
6. BUNDLE INTEGRITY: the bundle record carries a sha256 over its canonical children manifest; delivery recomputes it. A tampered bundle, a claimed child that has no store record (fabricated child), or a children count lie = honest failure, zero fabricated completion.
7. STATES HONESTY: bundle states are aggregated from real child states, never asserted. No receipt before delivery. NOT FINISHED says NOT FINISHED.
8. Creation-vs-evidence and creation-vs-footage laws inherit through every child and through the Studio itself: a studio artifact is creation, NEVER evidence; NEVER real footage; refusals happen at the child boundaries BEFORE evidence refusal (precedence preserved and disclosed).
9. Unknown stays unknown. Injection is data. External dependency unavailable = honest labeled failure per child, zero fabricated bytes.
10. BROWSER + PWA: the Studio surface is a PWA (manifest, service worker, icons, light theme) per the ecosystem standing law, and the browser test is part of the gate before any report.

## Scope
IN: one route (POST/GET /api/creation/v1/studio), mode resolution over the five modalities, bundles of up to all five children per request, studio bundle record + receipt, PWA home page (light theme) linking the existing sovereign players, 12 contract cases + 18 death tests harness.
OUT: interactive editing, rendering quality changes, new modalities, changes to ANY frozen child law. A real HARZ creative model swaps in behind the SAME child adapters.

## Dad's 18 death tests (frozen now)
DT-1 empty text | DT-2 oversized text | DT-3 child malformed generation | DT-4 corrupted child store at delivery | DT-5 bundle integrity lie (tampered bundle sha) | DT-6 wrong declared bundle totals (child count/sha mismatch) | DT-7 mode/routing contradiction (claimed modes vs children) | DT-8 changed child hash | DT-9 nondeterministic child replay inside the bundle | DT-10 prompt injection (routing obeyed by nothing) | DT-11 external adapter unavailable | DT-12 empty output (zero children created) | DT-13 claimed child states contradict the store | DT-14 fabricated child (receipt chains a child that never existed) | DT-15 real-footage request refused at the child boundary BEFORE evidence refusal, disclosed in the bundle | DT-16 false completion | DT-17 browser delivery failure (unknown bundle id honest not-found; corrupted child stays undelivered) | DT-18 studio receipt before every child's playback verification

## 12 contract cases
VS1-1 verified text + modes (explicit override inference, disclosed) | VS1-2 bundle structured (children manifest, shas, seed chain) | VS1-3 component provenance (text sha -> child shas -> bundle sha) | VS1-4 status explicit (states machine, NOT FINISHED) | VS1-5 deterministic routing replay | VS1-6 every child survives its UNCHANGED frozen reader (studio ships no parser) | VS1-7 routing honest and disclosed | VS1-8 child refusal propagation (a refused child is disclosed, never masked; siblings unaffected) | VS1-9 unknown not guessed | VS1-10 prompt injection data | VS1-11 external generator unavailable | VS1-12 studio receipt (full bundle chain, real KV fetch, all children delivered)
