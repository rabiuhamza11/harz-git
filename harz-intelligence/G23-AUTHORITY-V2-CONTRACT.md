# G23 SOVEREIGN ORIGIN AUTHORITY — CONTRACT (AUTHORITY-V2, ruling B)

Frozen: 2026-10-03, BEFORE build. Anchor: c0c294f (G22 frozen as FAILED
— the proof that pre-key architecture cannot distinguish two
lawful-looking authorities; the G22 attack state is evidence, never
patched away).

## THE AUTHORITY MODEL (Dad's law, verbatim intent)
Public topology proves WHAT was said. The origin signature proves WHO
was authorized to say it. One pinned public key -> one authorized
origin; alternate sovereign-looking nodes may reproduce the entire
topology but cannot manufacture authority.

## FROZEN LAW (minimum, per ruling)
1. ORIGIN KEYPAIR: the HARZ sovereign origin owns an Ed25519 signing
   key. The private key NEVER enters the verifier, the mirror, any
   export, or ordinary public state (worker secret in deployment;
   uncommitted key file in the kit).
2. PINNED PUBLIC KEY: fresh verifiers carry the expected origin public
   key as the trust anchor. The URL/domain is NOT the root of authority.
3. SIGNED DESIGNATION: every designation is signed over its canonical
   bytes (the G21 meaningful-identity/topology data — resolver,
   conflict/resolved memberships with content hashes, order-bound
   evidence, law+version+record). The signed payload includes the
   key identity (fingerprint = sha256 of the SPKI public key bytes),
   so key rotation is explicit, never ambiguous. The G21 public
   designation_receipt hash REMAINS (frozen formula untouched); the
   signature is an additive layer.
4. VERIFIER RULE: a designation is authoritative ONLY if (a) canonical
   bytes recompute, (b) receipt/content hashes recompute, (c) topology
   constraints verify (all G21 laws), AND (d) the signature verifies
   against the pinned origin public key.
5. ATTACK TEST (re-run G22): same topology with D as resolver, signed
   under a FRESHLY GENERATED attacker key. Expected: topology VALID,
   hashes VALID, artifact VALID, signature UNAUTHORIZED, overall
   authority verdict NOT VERIFIED.
6. LEGITIMATE TRANSITION: the pinned key is never silently replaced.
   An origin-key replacement is an explicit key-transition policy act,
   itself signed under the EXISTING authority (transition record:
   old fingerprint -> new public key -> new fingerprint, signed by the
   old key). Verifiers accept a new key only through a valid signed
   transition chain rooted at the pinned anchor. Rotation without the
   chain = unauthorized.
7. DEATH TEST: same topology, same records, same hashes, same public
   formula — different signing key. The legitimate origin VERIFIES;
   the parallel authority FAILS.
8. G22 STAYS FAILED: the G22 attack state remains frozen exactly as
   committed (c0c294f), re-measured under the new verifier as unsigned
   -> NOT authoritative. It is the pre-key evidence.
9. SOVEREIGNTY: the authority primitive must not secretly depend on
   Cloudflare. Build and test in the portable Node Kit first; deploy to
   the existing harz-intelligence worker (runtime available; 1042
   blocks only new scripts). Zero external CAs, zero external
   providers — HARZ-owned keys only.

## GATES
G1 contract frozen before build
G2 origin keypair generated; private key confinement proven (never in
   vault/git/export; attacker and verifier hold only public material)
G3 signed designation emission built additively (frozen formulas
   untouched; unsigned origins simply emit no signature)
G4 fresh-node verifier with pinned trust anchor: legitimate origin
   state -> VERIFIED (bytes + hashes + topology + signature all pass)
G5 attack replay: attacker key -> topology VALID, hashes VALID,
   artifact VALID, signature UNAUTHORIZED -> NOT VERIFIED
G6 key transition: v1-signed transition record introducing v2 ->
   v2-signed state VERIFIES under pinned v1; forged/unsigned
   transition -> NOT VERIFIED
G7 death test: same everything, different key -> legitimate VERIFIED,
   parallel authority NOT VERIFIED
G8 G22 frozen state under the new verifier: NOT VERIFIED (unsigned),
   state itself untouched
G9 production: the true origin (harz-intelligence) emits signed
   designations with the production key; live record verified against
   the pinned anchor; G19-G21 chains recompute unchanged (additive)
G10 determinism + fresh-node portability (three files + anchor)
