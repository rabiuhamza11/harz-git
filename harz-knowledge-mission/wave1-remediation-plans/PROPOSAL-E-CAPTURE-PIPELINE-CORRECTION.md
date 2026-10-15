# WAVE-1 REMEDIATION PROPOSAL E — CAPTURE-PIPELINE TEMPLATE-LITERAL CORRECTION
**Status: PLANNING PROPOSED — EXECUTION NOT AUTHORIZED (owner ruling Oct 14; this document authorizes nothing)**
**Blocker addressed:** TF-4 (template-literal capture class: immigration stamp resource URL `${e?.bg?.image.src}`; SMEDAN desk D-5: `${logo}`, `${item}` + 4 external font loads)
**Owner's constraint (verbatim substance):** the correction must distinguish genuine resource URLs from unresolved JavaScript expressions, be regression-tested, and SMEDAN D-5 must receive its own evidence and regression case — never assumed identical to immigration just because the class is similar.

## 1. Root-cause class
The capture pipeline records resources found in the DOM. Some values are unrendered JS template literals (strings containing `${...}`) rather than resolved URLs. The pipeline then fetches and hashes them as if they were resources — producing phantom resource entries with real-looking sha256s, or failed fetches.

## 2. Proposed correction (for review)
1. **URL validity gate at intake:** a candidate resource URL must pass a strict grammar check (scheme://host/path, no `${`, no `{` interpolation tokens, no whitespace, RFC-3986 subset) before it enters the resource manifest or fetch queue.
2. **Classification, not discard:** rejected candidates are recorded in a new manifest field `unresolved_expressions: [{value, context, source_element}]` — honest disclosure of what was skipped and why; nothing silently dropped.
3. **Regression suite (frozen cases, must all pass before any acceptance request):**
   - IM-1: `${e?.bg?.image.src}`-style expression in an image attribute → classified unresolved, not fetched, manifest entry skipped, disclosed in unresolved_expressions. (immigration case)
   - SM-1: SMEDAN pack reproduction: `${logo}` and `${item}` tokens → same classification, PLUS its own evidence file comparing the SMEDAN pack before/after. (desk D-5 case — own case, per ruling)
   - LEG-1: legitimate URL containing `{` or `}` as data (rare but legal in query strings) → must still pass the grammar if properly percent-encoded; adversarial anti-over-block case.
   - LEG-2: dynamic-but-real URLs (protocol-relative, data URIs, blobs) → classified correctly, no false positives.
   - NEG-1: expression-only attribute with no URL at all → no resource entry, disclosed.
   - RERUN: re-capture of a controlled page with known injected expressions must yield a manifest with zero phantom resources.
4. **Cross-pack census after fix:** re-scan all packs for the defect class (script-block-excluded method from e929b8c) — the fix is proven by the census going to zero on new candidates, with the frozen packs' historical entries preserved as evidence of the defect (never rewritten).

## 3. Acceptance criteria
1. All frozen regression cases pass; the suite itself is committed with the proposal's implementation.
2. SMEDAN D-5 evidence pack produced separately from the immigration evidence pack.
3. Second-seat reproduction with declared tokenization assumptions.
4. No change to any frozen pack; new captures only.

## 4. Explicitly out of scope
No stamp re-writing (Proposal C), no CSS/font embedding (Proposal D), no deployment, no merge.
