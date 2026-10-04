# G27 — TAXONOMY CORRECTION CONTRACT (Dad's ruling, Oct 4, 2026, frozen before the patch)

THE RECORD (Dad's own words, frozen):
  G27-A: PASS
  G27-B: PASS
  G27-C: 2 disclosure defects + 1 conservative behavior finding
  G27-D: no authority repair required
The authority battery did NOT fail. The standing authority
machinery stays FROZEN. Only the presentation/taxonomy layer
changes.

## THE PERMANENT SENTENCE (frozen, verbatim)
> Silence is evidence of absence of knowledge, not evidence of
> authority.

## C1 — FIX (disclosure layer only)
An anchorless state must not display a bare CURRENT label, even
if another line explains that currency is relative. Canonical:
> UNKNOWN — no authoritative anchor known
with the relative observation disclosed separately:
> Relative observation: current relative to known state.
The primary label must never be stronger than the evidence.
When an anchor IS known, the existing classification flow
governs unchanged.

## C2 — FIX (disclosure layer only)
NOT AUTHENTIC is too strong when the verifier cannot establish
authenticity. When failure causes are availability (fetch
unreachable, origin unavailable) with no positive evidence of
forgery:
> AUTHORITY UNAVAILABLE / UNVERIFIABLE — origin unavailable
preserving the reason. "I cannot verify this" != "this is false."
Cryptographic/verification failures keep NOT AUTHENTIC.

## C3 — KEEP (conservative behavior, preserved as an explicit test)
> A valid anchor may establish authority for what it actually
> names; it must not manufacture authority over an unresolved
> competing history.
The L9 behavior (fork retained, CURRENCY UNDETERMINED, anchor
defers) is CORRECT and becomes a standing regression test.

## METHOD
Freeze this correction, patch the labels, run a SMALL DISCLOSURE
REGRESSION — not another authority redesign. Every authority
decision (verified/refused/anchored/stale/conflict/fork verdicts
and exit codes) must remain byte-identical; only label text may
change, and only in the C1/C2 directions. The full G24+G25+G26
regression battery re-runs under the patched labels.
