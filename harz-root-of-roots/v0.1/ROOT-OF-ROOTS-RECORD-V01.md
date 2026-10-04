# ROOT OF ROOTS v0.1 — TREATY LAYER PROTOCOL PROOF (Oct 4, 2026, owner: "Ok go")

## Owner rulings that shaped this build
- Oct 4: "If it is to build but I don't want kings" — PLAIN ROOTS. No ceremony, no cards, no ink,
  no succession theater. Authority = a signature. Keys born IN the worker (member-gate law),
  private JWK only in its own D1, never travels.
- The treaty record is called a LINK (no "king-to-king" language anywhere in the build).

## What stands live (all TEST, honestly labeled on every page)
ROOT ONE — https://harz-root-alpha.hamzarabiu390.workers.dev (namespace alpha)
  anchor 8717c7c309b44792288add4304ca0b0eadaacbe9c6552441cc17ac73be34ff28, fp d48d628ee5be23c7
ROOT TWO — https://harz-root-beta.hamzarabiu390.workers.dev (namespace gembu — the Gembu seed)
  anchor 17e81378fe1f2886327e60dacaca534ae70250d9ad38c154a28ecc90e43f24b3, fp e899c1c111d77f06

Two DIFFERENT signers. Neither root holds any of the other's key material — each link record
pins only the peer's PUBLIC anchor, fetched live and verified against the peer's served zone.

## Protocol laws proven by measurement (receipts below)
1. CROSS-ROOT RESOLUTION BOTH DIRECTIONS: alpha resolved coop.gembu (ok:true, chain carries
   pinned peer anchor, peer zone height, link sig valid); beta resolved one.alpha likewise.
2. INDEPENDENT SIGNATURE VERIFICATION (raw bytes, this seat): both zones VALID, both link
   records VALID, pinned anchors MATCH the peers' real served anchors.
3. TAMPER DISCRIMINATION: beta's zone verified against alpha's anchor (impostor root) ->
   REFUSED, SIGNATURE FAILED. Byte-flipped peer zone vs real sig -> REFUSED. A lying relay
   or swapped zone cannot pass; it can only fail closed.
4. NAMESPACE LAW: link/set with peer_ns == own ns -> "namespace collision refused (fork-refusal
   law)". resolve-x of a name outside the linked namespace -> refused.
5. HONEST ABSENCE: ghost.gembu -> NXDOMAIN "not in peer zone (honest absence)".
6. UNILATERAL REVOCATION, FAIL-CLOSED: beta revoked (20:33:05Z) -> beta's resolve-x refused
   with timestamp; alpha's own link record unaffected (beta cannot forge or revoke alpha's
   record — only alpha's key signs it). Alpha revoked (20:33:15Z) -> alpha's resolve-x refused.
   Mutual teardown proven. Both links then re-cut; final state ACTIVE both directions.
7. BROWSER-VERIFIED (Sept 6 law): ROOT ONE page rendered, coop.gembu typed into the cross-root
   resolve box, VALID resolution rendered in-browser. ROOT TWO page rendered, one.alpha typed,
   VALID rendered. Screenshot taken. Pages are light-theme PWAs: manifest.json + service
   worker (cache-first shell, live routes pass-through) + theme-color #f0f2f5 on both.

## Substrate constraint, disclosed honestly
CF free plan blocks worker->workers.dev subrequests (error 1042, hit live at link-set). A
service binding was REJECTED as a fix: it would couple the roots at the substrate level —
the treaty must work between roots that know nothing of each other's deployment. Instead:
TRANSPORT RELAY (ror_relay on the Superagent backend, strict allowlist of exactly the two
root hostnames, refuses everything else including the production root). The relay is
transport only — authority never rides it: each root verifies the peer zone's Ed25519
signature against its OWN pinned anchor, so a tampering relay cannot forge a zone, only
refuse service (honest failure). On a paid plan or custom domains the relay disappears and
roots fetch each other directly; the protocol does not change. Principle 2 held: substrate
hosts, never defines.

## Honest limits
- Both keys are desk-side throwaways per the recommended TEST split; no real second seat
  exists. A production treaty requires a real second key holder (owner names the seat).
- Link routes on test roots are ungated by design (disclosed in the /link/set response);
  production roots gate with an env admin key (member-gate pattern).
- These roots use fresh TEST namespaces (alpha, gembu) — the PRODUCTION .harz zone carries
  NO link record yet. Real integration = one record in the real zone at height 6, signed
  by the current pen (cd9adbc6, desk custody) — owed by the desk, on the owner's word.
- Zones are height 1 with honest PENDING identities — no real services behind the names yet.

## Receipts in this folder
root-alpha-worker.js, root-beta-gembu-worker.js — deployed source (secrets-swept clean)
alpha-zone.json, gembu-zone.json — live signed zones
alpha-link.json, gembu-link.json — live signed link records
D1: harz-root-alpha-db (5b46310c), harz-root-beta-db (fee05884) on account c0bea6cf

## The sentence this build earns (TEST scope only)
Two sovereign roots that never exchanged keys resolve each other's names through a link
either can revoke unilaterally — and a lie on the wire is refused by math, not by trust.
