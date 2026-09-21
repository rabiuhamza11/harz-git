# HARZ Record Schema v2 — Service Registry Records
Status: BUILD-TIME DRAFT (per Root v2 FROZEN v1.0, first build task). Sep 15, 2026.

## Purpose
The v1 zone answers one question: "where does this name point?" (TXT → URL).
The v2 record answers the strategic questions: WHAT it is, WHO controls it
(identity), WHAT its latest legitimate state is, HOW to reach it on every
transport, and WHERE it currently lives (routing).

## Record format (per name)
```json
{
  "v": 2,
  "name": "pay.harz",
  "service": "payments",
  "identity": "ed25519:<32-byte-pub = 64 hex chars>",
  "state": { "height": 1, "digest": "<sha256-hex>" },
  "endpoints": {
    "https": "https://...",
    "harz-native": "<node-id>",
    "mesh": "<node-id>",
    "dial": "<dial-code>",
    "local": "<lan-addr>"
  },
  "routing": { "nodes": ["node-1", "node-b"] },
  "policy": { "trust": "canonical" }
}
```

## Field law
1. `v` MUST be 2. Records are strict — any unknown field makes the record INVALID.
2. `name` MUST be lowercase, end in `.harz`, no leading dot, `[a-z0-9-]` labels.
3. `identity` is an Ed25519 public key (`ed25519:` + 64 hex chars = 32 bytes) OR the
   literal marker `PENDING` — honest placeholder while a service has not yet
   performed its own key ceremony. PENDING is always visible; never fabricated.
4. `state.height` is monotonically increasing per name; `state.digest` is the
   sha256 of the name's canonical current state. A record with no state ref
   yet uses `state: { "height": 0, "digest": "" }`.
5. `endpoints` keys are the fixed set {https, harz-native, mesh, dial, local};
   ABSENT keys mean "not reachable on this transport" — absence is honest data.
   Present keys MUST be non-empty strings.
6. `routing.nodes` is a lexicographically SORTED array of node ids; empty array
   = no live node currently serves this name (also honest).
7. `policy` holds governance directives; unknown policy keys are INVALID.

## Canonical serialization (signature scope)
Deterministic bytes, so any node on any substrate produces identical output:
1. UTF-8 JSON, NO whitespace, keys sorted lexicographically (RFC 8785-style).
2. Arrays: `routing.nodes` MUST already be sorted; serializer enforces.
3. The ZONE file is:
```json
{
  "height": 1,
  "prev": null,
  "records": [ ...sorted by name... ],
  "sig": "ed25519:<hex>",
  "signed_at": "<ISO-8601>",
  "signed_by": "ed25519:<pubhex>",
  "v": 2,
  "zone": "harz"
}
```
`sig` is Ed25519 over the canonical bytes of the zone object WITHOUT the
`sig` field itself (i.e. {height, prev, records, signed_at, signed_by, v, zone}).
`prev` is the sha256 of the previous height's canonical signed zone —
the chain-of-custody from the capsule book, now in zone form.

## Verification law (fail-closed, inherited from v2.1.1)
A v2 zone with a broken or absent signature is REFUSED — no partial serving.
Records referencing `PENDING` identities are served but MUST display PENDING.

## Honest boundaries
- This schema is a DRAFT artifact. The LIVE production zone remains v1
  (signed by the owner's production ZSK) until the killer test passes and
  the owner orders migration.
- TEST signatures in the test suite use ephemeral keys generated IN MEMORY
  and discarded — no private key is ever written to any file (standing law).
- Real per-service identities are created by each service's own ceremony on
  its node — never fabricated in bulk by an agent.
