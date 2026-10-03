# G21 DESIGNATION-BINDING AUDIT — TRACE (2026-10-03)

Contract: G21-DESIGNATION-BINDING-V1-CONTRACT.md (frozen a26e61e +
amendment A1, both committed BEFORE build; anchor 76d7a39). Dad's
ruling: Option B. No frozen formula changed. SUCCESS CONDITION MET:
every semantically different conflict-resolution topology now has a
different cryptographic designation state (C designation bytes_sha
d238d875... vs legitimate-D c2dc93a8...), while historical mission
receipts recompute unchanged.

## THE SEAL (built as frozen)
designation_receipt = sha256('designation:' + mission.id + ':'
  + sha256(canonical designation_bytes))
The bytes bind MEANINGFUL IDENTITIES, never bare integers (Dad's law):
  conflict record: conflict_refs = [{task, receipt, claims_sha256,
    answer_sha256}] — membership bound WITH content hashes.
  resolution record: resolver = [{task, receipt, claims_sha256,
    answer_sha256, act {type, instruction, fixture_id}}] (the COMPLETE
    designated resolver identity), resolved = [same binding],
    evidence = [order-bound, same binding], law + version + record id.
Origin-emitted at record time (additive field; zero frozen formulas
touched; records predating the field simply lack it). The verifier
RECOMPUTES the bytes from essential state (frozen receipt formulas +
claims extraction + answer shas) and compares against the
origin-emitted receipt — the mission.receipt trust model.

## AMENDMENT A1 (recorded before build, honest infeasibility)
The resolution record cannot know record-1's mission receipt at
emission time. conflict_root is therefore bound AS CARRIED (resolved
refs with content hashes); record-1's own designation seal covers the
same membership from its side; the verifier enforces the cross-record
designation edge (sealed conflict membership SUBSET of sealed
resolved membership — subset, because resolved lawfully carries
additional unresolved material).

## GATE RESULTS (all measured live)
G1 frozen: contract + A1 committed before any build
G2 built: additive origin emission + designation-verifier.js
G3 clean C designation -> VERIFIED, 14 checks (both designation seals,
   cross-record designation edge, legitimate-D acceptance, G20 laws,
   request_id==key prefix, artifact via frozen readers, all three
   mission seals PASS — unchanged by the emission)
G4 the EXACT G20 attack (C->D, fully re-derived refs, every origin
   seal left untouched) -> REFUSED: recomputed resolver identity
   (D's receipt 82d253c5.../claims 7503d7cf.../act G20-FIX-D) !=
   origin-emitted designation seal 7f7c7515... The hole G20 exposed
   is closed by an additive seal.
G5 conflict membership mutation -> REFUSED (record 1's designation
   seal over the cited acts with content hashes)
G6 resolver's underlying evidence mutated (C's answer bytes
   800->900) -> REFUSED (designation seal mismatch; the resolver's
   answer sha + claims sha are bound). G6b note: tampering a STORED
   derived pointer (claims_sha256 inside evidence disclosure) changes
   NO judgment — verifiers recompute shas from content and never
   trust stored derived pointers (G19 law, by design, not an escape).
G7 role integer alone flipped -> REFUSED (law 9085 + acceptance law)
G8 designation_receipt deleted -> REFUSED (essential)
G9 fresh node (three files only): valid state replayed twice ->
   byte-identical VERIFIED
G10 backward compat: after deploy the G19 chain verifies 11/11 and
   the G20 chain verifies all 12 checks, byte-identical; all three
   new records' mission receipts recompute unchanged (emission is
   purely additive)
G11 legitimate different designation: a FRESH live mission with D
   actually authorized by the caller -> VERIFIED with a DIFFERENT
   VALID designation state (resolver 4, act G20-FIX-D, resolved
   [1,2,3], receipt fcb59221...). Difference accepted, not rejected.
G12 transport substitution: the G20 export attack replayed across
   the portability boundary against the fresh node -> REFUSED
   (designation seal mismatch + law violation). The passive
   substitution attack of G20 is now dead: it requires FORGING an
   origin seal.

## HARNESS ERRORS CAUGHT AND FIXED DURING TESTING (test-side only)
1. The cross-record edge law was initially coded as set EQUALITY —
   wrong for this topology (resolved lawfully carries D as unresolved
   material); corrected to SUBSET before any tamper conclusion.
2. The G6 mutator initially replaced '500' in an answer that says
   800 — a no-op mutation; the first "ESCAPED" was re-measured with a
   real byte mutation and REFUSED. Both slips disclosed; neither
   touched origin or sealed state.

## BROWSER (standing order)
Record 2 (m-mission-136f59ca-d2d) fetched live through the browser:
origin serves the true assignment with the designation seal; fixture
D live with receipt 82d253c5... The artifact was fetched live by the
verifier itself.

## THE RESULT (in the contract's own words)
Content integrity AND topology integrity are now sealed. Every
semantically different conflict-resolution topology produces a
different cryptographic designation state; historical mission
receipts remain backward-recomputable and unchanged; the frozen
formulas were never reopened. Mission receipt + designation receipt
= complete authoritative mission state.
