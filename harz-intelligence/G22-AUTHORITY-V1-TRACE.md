# G22 ORIGIN/AUTHORITY SEPARATION AUDIT — TRACE (2026-10-03)

Contract: G22-AUTHORITY-V1-CONTRACT.md (frozen e057719, anchor 11ad42d).
Dad's final question: can the system distinguish "the authorized origin
changed the topology" from "someone changed who the authorized origin
appears to be"?

## MEASURED ANSWER: NO. THE WALL HAS FALLEN.
The fresh node reached VERIFIED on the second authority's state — with
every seal intact, every law satisfied, every artifact verified through
the frozen readers. The same fresh node also verified the true origin's
legitimate designation change. The two cases are cryptographically
indistinguishable. The system has no origin authentication: "origin" is
an unauthenticated string field in the export, and the designation
receipt is a bare public hash with no issuer binding. G21 sealed WHAT
the topology says; it did not seal WHO said it.

## THE ATTACK (executed live, per the frozen gates)
The second authority is REAL: the same frozen public worker bundle
(byte-identical to the deployed harz-intelligence code) running as a
sovereign local node with its own store (g22-authority-audit/mirror/).
On it the attacker ran its own topology — A,B conflict; A,B,C,D
carried; D designated resolver — and the mirror issued its OWN
designation seals by the same public formula (receipts 85e59f14...,
5c055efad6...). The attack export presents the mirror as the origin
that issued every designation (export.origin = mirror). Deterministic
creator -> same artifact bytes, served from the mirror's own store.
The ORIGINAL origin seal was never touched.

## GATE RESULTS
G1/G6 the exact G21 sealed state re-verified VERIFIED before and
   after the attack (byte-identical verdicts) — the true origin state
   is intact and unchanged throughout.
G2 all valid receipts and content hashes preserved in the attack
   state (fixture receipts 42f63fe1.../f1dfdff1.../5ca4beb4.../
   82d253c5... identical to the true origin's — same content, same
   public formulas).
G3 second legitimate-looking authority introduced (mirror, same
   frozen code, own store, own seals).
G4 the mirror presented as the designation origin (fresh node
   fetched records AND artifacts from it).
G5 every downstream artifact recomputed consistently; frozen readers
   accepted the mirror's artifact.
G7 fresh node (three files) verdict on the attack export: VERIFIED.
   REQUIRED: REFUSED. The finding is the hole.
G8 contrast: the TRUE origin's legitimate designation change
   (G21 gate-11 record) verifies VERIFIED on the same fresh node.
   Unauthorized authority substitution and legitimate authority
   transition currently produce the SAME verdict — indistinguishable.
Determinism: attack verification deterministic across runs.

## WHAT G21 DID AND DID NOT PROVE (now exact)
G21 proved an attacker cannot substitute D for C while keeping the
TRUE origin's designation seal — because recomputing the derived
references produces bytes that no longer match the origin-emitted
receipt. But "forging" that receipt is trivial: the formula is public
and unkeyed. G22's attacker never needs to forge anything — it ISSUES
its own state as a parallel authority, and the fresh node has nothing
to check the issuer against. The portability boundary trusts
whichever origin the export names.

## MINIMAL AUTHORITY BINDING (specified, NOT implemented — for ruling)
The fix must answer: WHO is allowed to author topology.
  Option A — pinned origin trust root: fresh-node verifiers ship with
    the authoritative origin identity pinned; designation bytes gain
    the issuer; the mirror's seals carry the mirror identity -> not in
    the root -> REFUSED. Weakest: the identity is a URL string;
    DNS/redirect attacks move the name.
  Option B — sovereign origin keypair (recommended): the origin holds
    a HARZ-owned key (worker secret, Web Crypto, no external CA);
    every designation receipt is issued-with-key (signature or keyed
    hash over designation bytes + origin identity + nonce); fresh
    nodes pin the PUBLIC key. The mirror cannot reproduce the
    issuer's secret -> REFUSED, even while every public hash still
    recomputes. A legitimate authority transition is the authorized
    owner installing the new origin's public key in the trust root —
    a policy act by Dad, never an attacker act. This closes the exact
    hole: topology authorship becomes key-authenticated, and "who
    changed" is finally distinguishable from "who is allowed".
  Recommended: B. Cost: one origin secret, one verifier-side pinned
  key, designation issuance gains a signature step; zero frozen
  historical formulas touched (additive layer, the G21 pattern).
  Requires Dad's ruling before build.

## INFRA FINDING (disclosed, outside the audit's scope)
Deploying the mirror as a second live workers.dev script FAILED: the
account currently refuses runtime on ANY new worker script (error
1042 on every path, including a minimal hello-world; existing workers
including harz-intelligence run normally — grandfathered). The mirror
therefore ran as a local sovereign node running the same public
bundle — an honest deviation from the contract's "live mirror
deployment" clause, disclosed here; the finding is unaffected (the
fresh node has no origin-authentication mechanism at all, wherever
the second authority hosts). Dad should know: new Cloudflare workers
cannot be deployed-to-runtime on this account right now (plan/quota
limit) — this will affect the pending HNS wiring and any new builds.
