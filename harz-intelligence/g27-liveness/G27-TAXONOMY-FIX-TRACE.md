# G27 — TAXONOMY CORRECTION: TRACE (2026-10-04)

Ruling frozen 4697f89 BEFORE the patch. The record stands exactly
as Dad wrote it: G27-A PASS, G27-B PASS, G27-C = 2 disclosure
defects + 1 conservative behavior finding, G27-D = no authority
repair required. The authority battery did not fail.

## THE PATCH (disclosure layer only; no authority decision logic touched)
C1 FIXED: anchorless states now print
  "currency UNKNOWN — no authoritative anchor known; relative
  observation: tip of the standing valid chain (height N), not
  superseded, not forked, not retired within known history;
  silence is evidence of absence of knowledge, not evidence of
  authority"
When an anchor IS known, the existing classification governs and
the label notes it. The verdict header annotates anchorless
currency as "UNKNOWN — no authoritative anchor known".
C2 FIXED: availability-caused unverifiability now prints
  "AUTHORITY UNAVAILABLE / UNVERIFIABLE — origin unavailable;
  authenticity could not be established (reason preserved: ...);
  never read as forged, never read as valid"
Cryptographic failures keep NOT AUTHENTIC. "I cannot verify
this" is no longer expressed as "this is false."
C3 KEPT: the fork deferral is unchanged and now a standing
regression test: a valid anchor may establish authority for what
it actually names; it must not manufacture authority over an
unresolved competing history.
The permanent sentence joined the no-checkpoint boundary line.

## THE DISCLOSURE REGRESSION (small, as ordered)
35/35 bundles decision-identical pre-patch vs post-patch:
- 11 G27 liveness bundles
- 14 G24/G25 regression topologies
- 10 G26 authority lifecycle attacks
Decision signature compared: exit code, verdict class (CHAIN
VERIFIED / REFUSED / FORK DISCLOSED), anchor class (ANCHORED /
STALE / CONFLICT / NO VALID / NO CHECKPOINT / UNAVAILABLE), and
per-record accept/refuse counts. ZERO authority decisions changed.
Only label text changed, in the C1/C2 directions only.
Harness honesty note: the first automated pass produced 24
vacuous comparisons (a cd failure made both sides empty); caught
and re-run with correct paths before any claim was made. The
35/35 result is from the corrected run.

## STATUS
G27 COMPLETE: A PASS, B PASS, C classified + corrected per
ruling, D no authority repair, E regression 35/35 identical.
The progression now stands: integrity (G24) -> convergence
(G25) -> authority lifecycle (G26) -> liveness (G27), with the
permanent sentence in the wall:
> Silence is evidence of absence of knowledge, not evidence of
> authority.
