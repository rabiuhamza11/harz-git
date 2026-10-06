# REC5 — SOVEREIGN SEAL CHAIN ATTACK TRACE (Hauwa, Oct 6, 2026, Dad's "keep attacking")

Target: the FROZEN v0.3 primitive (98dcdd62...), hash-gated start and end; v0.2 untouched.
The seal layer was the least-tested layer of the frozen stack (touched only by SCN4b and
R3-8). This battery attacks the chain itself: tamper at every slot, fork, withholding
(middle and tail), reorder, duplicate, torn tail, identity rotation, transport, possession.
NO REMEDY BUILT FIRST. The attack decides.

## VERDICT

16/16 PASS, two consecutive clean runs (rec5-run-03.log, rec5-run-04.log). Runs 01-02 logged
unsmoothed: run-01's one FAIL was my scenario design (the forwarding node held seals but no
inbox records to relay); run-02's one FAIL was the grep-lines-vs-occurrences harness defect
— the same defect class that bit me in REC3, caught by the gate both times. The machine
itself passed from the first run.

## WHAT HELD (the chain as designed, measured)

S5-1..3 tamper at FIRST / MIDDLE / LAST slot: BROKEN at the exact slot, ENV DIGEST MISMATCH
+ ENVELOPE SIG FAILED, exit 1, no smoothing; a middle tamper leaves every other slot still
verified.
S5-4 FORK: a forged prev-link discloses FORK/DIVERGENT and the seal signature over the
original chain fails — two independent proofs of the same break.
S5-5 MIDDLE WITHHOLDING CAUGHT: deleting seal #4 of 5 surfaces SEQ GAP (expected 4) — the
sequence number is a completeness witness; no silent shrink.
S5-7 REORDER refused: swapped slots surface SEQ GAP/FORK verdicts — order is not cosmetic.
S5-8 DUPLICATE seal line refused: SEQ GAP (expected 6, got 2) — repetition cannot extend a
seal chain (the non-voting law, independently holding in the seal layer).
S5-9 TORN tail: quarantined to seals.torn with DISCLOSURE, remaining records verify INTACT,
evidence preserved — the same quarantine discipline as the inbox.
S5-11 TRANSPORT: a node holding 5 seals + 2 inbox records forwards ONLY the inbox records —
seals never transport; the sovereign journal cannot leak through the mesh.

## THE THREE FINDINGS (reported for Dad's ruling; nothing patched)

F-REC5-1 TAIL WITHHOLDING IS INVISIBLE (S5-6): deleting the LAST seal leaves a valid prefix
that reads CHAIN INTACT, exit 0. The chain proves continuity, NOT completeness — no length
authority exists at this layer, so a node cannot know a tail seal is missing. Honest
consequence: a seal chain's "CHAIN INTACT" verdict means "every seal present here verifies
and links," never "no seal is absent." (The seq check catches only interior gaps.)

F-REC5-2 THE CHAIN IS DATA CONTINUITY, NOT KEY CONTINUITY (S5-10/10b): swapping
identity.json does not break history — every seal self-verifies via its embedded key, so
records carry their own evidence (identity.json only authorizes NEW seals). But the sharper
half: a NEW key can seal onto the old chain and every slot still verifies — rotation
mid-chain is possible and UNDISCLOSED by the verdicts. Authority at this layer = each
record's own signature, never a fixed sovereign key. This is the G26 rotation question
returning in the seal layer: a key-transition disclosure (who sealed, key continuity)
would require a deliberate semantic choice.

F-REC5-3 POSSESSION DISPLAYS OWNERSHIP (S5-12): another folder fully accepts a copied seal
chain — every slot self-verifies, so "sovereign local" means BY-POSSESSION + self-verifying;
there is NO binding between folder, identity, and chain. Copying a journal is lawful at
this layer and undisclosed. This is the price of self-verification: what verifies is true
wherever it stands. It is also what makes the field gate possible (a phone that owns the
file owns the history) — the same property is a strength in sovereign hands and a
portability fact in anyone else's.

## SCOPE (honest)

Workbench proof against the frozen v0.3 primitive; no remedy built; v0.3 and v0.2 untouched.
All three findings are disclosure-level semantics questions for the ruling, not safety
failures: nothing false was ever verified in any scenario. The field gate (Hot 10i in Dad's
hands) is unaffected and standing by.
