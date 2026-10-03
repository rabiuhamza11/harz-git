# G22 ORIGIN/AUTHORITY SEPARATION AUDIT — CONTRACT (AUTHORITY-V1)

Frozen: 2026-10-03, BEFORE any build. Anchor: 11ad42d (G21 closed).
Dad's question, verbatim: can the system distinguish "the authorized
origin changed the topology" from "someone changed who the authorized
origin appears to be"?

## THE HYPOTHESIS (stated before measurement)
G21 sealed WHAT the topology says. It did not seal WHO said it. The
designation_receipt is a bare public hash formula — no issuer identity
enters the bytes, and a fresh node's verifier trusts st.origin (an
unauthenticated string field in the export) as the fetch base. An
attacker who stands up a SECOND origin running the same public frozen
code — a mirror — can issue its own self-consistent records, receipts,
and designation seals. Predicted: the fresh node reaches VERIFIED on
the mirror's state, believing the mirror is the authority. The wall
would fall: authority substitution, unlike G21's ref substitution,
requires no forged seal at all — only a legitimate-looking second
issuer.

## THE ATTACK (built live, per Dad's 8 points)
The mirror is a REAL second deployment of the same public worker code
(harz-intel-mirror, own KV namespace, disclosed test fixture — the
"attacker" legitimately runs the sovereign stack; zero external
calls). On the mirror, the attacker runs its own topology: A, B
conflict; A, B, C, D carried; D designated resolver. The mirror
issues ITS OWN designation_receipts by the same public formula. The
attack export = mirror records + origin = mirror URL. Everything
downstream recomputes consistently; the ORIGINAL origin seal is never
touched.

## GATES (Dad's, mapped)
G1 the exact G21 sealed state preserved and re-verified before AND
   after the attack (byte-identical verdicts)
G2 all valid receipts and content hashes preserved in the attack
   state (mirror recomputes everything lawfully — that is the point)
G3 second legitimate-looking authority introduced (live mirror,
   same frozen public code, own KV)
G4 the mirror presented as the origin that issued the designation
   (export.origin = mirror; its records claim the authority)
G5 every downstream artifact recomputed consistently (deterministic
   creator: same prompt -> same artifact bytes, served from the
   mirror's own store)
G6 the original origin seal untouched throughout (gate 1 re-proven)
G7 fresh node (three files) verification of the attack export ->
   measure the verdict. REQUIRED: REFUSED. If VERIFIED, the wall has
   fallen and the finding is the hole, characterized exactly.
G8 the legitimate contrast: the ACTUAL authorized origin changing the
   designation (G21's legitimate-D record) -> VERIFIED on the same
   fresh node. Unauthorized authority substitution != legitimate
   authority transition — or the measurement shows they are currently
   indistinguishable.

## DISCIPLINE
No fix is implemented inside this audit. If the attack verifies, the
finding + the minimal authority binding are specified for Dad's
ruling (the G20 pattern: measure, characterize, spec, rule, then
build in the next gate). The mirror is a disclosed test fixture; its
disposition after the audit is Dad's call.

## MINIMAL BINDING (to be specified exactly IF the wall falls)
Candidate layers, ranked:
  A. Verifier trust root: fresh nodes pin the authoritative origin
     identity; designation bytes gain the issuer; mirror seals carry
     the mirror identity -> not in the root -> REFUSED. Weakest
     (identity = URL string; DNS/redirect attacks move the name).
  B. Origin keypair: the origin holds a sovereign key (worker
     secret); the designation seal becomes issued-with-key (sign or
     keyed-hash with a nonce); fresh nodes pin the PUBLIC key.
     Mirror cannot reproduce the issuer's secret -> REFUSED.
     Legitimate authority transition = the authorized owner installs
     the new origin's key in the trust root (a policy act, never an
     attacker act). Strongest, fully sovereign (Web Crypto in-worker,
     no external CA). Recommended, for ruling.
