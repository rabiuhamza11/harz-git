# WAVE-1 REMEDIATION PROPOSAL C — PROVENANCE STAMP REPAIR
**Status: PLANNING PROPOSED — EXECUTION NOT AUTHORIZED (owner ruling Oct 14; this document authorizes nothing)**
**Blocker addressed:** TF-1 (stamp-writer 20,000-char truncation; health 19,999/19,999, immigration 19,984/20,000)
**Identity law:** new candidate artifacts only. The frozen packs (sha 63750cdf, 981c8260) are never rewritten in place.

## 1. Scope
Repair the provenance stamp so each pack carries a COMPLETE machine-readable `harz-provenance:` JSON: source URL, capture timestamp, engine, full per-resource manifest (url, mime, bytes, sha256), failed list, excluded scripts, dom_bytes.

## 2. Root cause (measured, both seats)
The stamp writer truncates its JSON payload at 20,000 characters. health and immigration exceed the cap because their resource manifests are large; nimc (11,292 chars) and cac (297 chars) fit.

## 3. Proposed design (for review, not built)
1. **Chunked stamp:** split the manifest into `harz-provenance-part-N-of-M` comments, each under a safe comment size (e.g. 16,000 chars), each independently parseable JSON with `{part, of, total, sha256_of_part}` and a final `harz-provenance` assembly record binding all parts by sha256 chain.
2. **Or external manifest file:** write `provenance.json` beside the pack (separate artifact) and place a one-line pointer comment `harz-provenance-manifest: <sha256>` in the pack. The pointer binds the pack to the manifest cryptographically; the manifest carries full content.
3. **Writer law (either design):** the writer MUST reject its own output if any part is malformed, truncated, or unparseable — fail-closed at generation time, mirroring the reader-side C5-revised scanner check. No silent truncation is ever possible again.
4. **New identity:** repaired candidates are new artifacts (e.g. `health-v2-r1`), hashed, committed, byte-compared against the frozen originals (only the stamp section differs — a diff report proves exactly what changed).

## 4. Acceptance tests (each must pass before any acceptance request)
1. All four packs' stamps parse COMPLETELY with the C5-revised scanner (comment-span extraction, exact-boundary reporting).
2. A generated stamp larger than the cap is chunked/referenced, not truncated — proven by a synthetic 40,000-char manifest test case.
3. Malformed/truncated output is rejected by the writer's own fail-closed check (adversarial test).
4. Diff report: candidate vs frozen original = stamp section only; rendering bytes byte-identical (fonts, CSS, images untouched).
5. Independent reproduction from a second seat with declared tokenization assumptions (Wave-2 scanner law).

## 5. Explicitly out of scope
No CSS/font embedding (that is Proposal D), no capture-pipeline changes (Proposal E), no deployment, no merge. Frozen artifacts untouched.
