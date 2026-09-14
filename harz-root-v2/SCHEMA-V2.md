# HARZ Service Registry — Record Schema v2 (FROZEN sequencing step 1)

Status: v2.0 — WALLET record type defined and PROVEN (pay-to-name-test.js 7/7 GO,
Sep 14, 2026). Canonical book remains frozen at height 1 until the owner-side
height-2 ceremony; this schema defines what the next mint carries.

## The Law
Every record rides as a signed TXT line in the canonical zone. A record that does
not verify against the zone ZSK can never be served by any HARZ resolver
(fail-closed, proven by test check 6: tampered wallet address + valid-context sig
= resolver refuses to load, port stays dead). Agents never generate, hold, or
store wallet private keys — registry entries carry PUBLIC addresses only.

## v1 record (live today, 77 names)
{ "record_type": "SERVICE", "service_id": "...", "url": "...", "note": "..." }

## v2 NEW — WALLET record (pay-to-name)
{ "record_type": "WALLET", "address": "0x…40 hex…", "network": "polygon", "note": "..." }
- address: EVM address, 0x + 40 hex, checksum format encouraged
- network: default "polygon"; other chains allowed per record
- Naming convention: wallet names ride at <owner>.wallet.harz
  (e.g. rabiu.wallet.harz, magani.wallet.harz)
- Reason: resolver v1.1 serves one TXT record per name — dedicated wallet names
  keep v2 deployable NOW without a resolver upgrade; multi-record-per-name is
  the desk's resolver v1.2 upgrade, not a blocker for v2 rollout.
- Pay-to-name client contract: resolve <name>.wallet.harz -> TXT -> JSON ->
  assert record_type==WALLET and address format -> return {ok, name, address,
  network}. Unknown name = NXDOMAIN, never a silent fallback (test check 4).

## Future record types (slots per Root v2 spec — NOT yet implemented)
- IDENTITY: { "record_type": "IDENTITY", "ed25519_pub": "…" } — login/CA use
- STATE:   { "record_type": "STATE", "ref": "…", "height": N } — state root link
- ENDPOINTS: { "record_type": "ENDPOINTS", "https": "...", "harz_native": "…", "mesh": "…" }
- ROUTING: { "record_type": "ROUTING", "nodes": ["…"] }
- POLICY:  { "record_type": "POLICY", "…" }
Each rides as a signed TXT line; each verified on load; each added by schema
bump + zone re-ceremony, never by editing the frozen book in place.

## Production rollout (owner-side, honest sequence)
1. Owner supplies PUBLIC wallet addresses for canonical wallet names
   (agents never touch private keys — standing law since the 0xCA28 compromise).
2. canonical-names.json updated on Node 1; build-canonical.js re-run;
   zone-generator.js re-signs with production ZSK 86a507a42df64df2 at height 2
   (offline ceremony on Node 1; the height-1 digest e94b9693 stays the frozen
   witness; height 2 gets a new digest + sig relayed with receipts).
3. Gossip pushes height 2 to all nodes; every resolver, DoH client, the
   extension, and Dial gateway read pay-to-name live. No code changes required
   anywhere — the record type was already proven end-to-end on the wire.

## Proof artifact
pay-to-name-test.js — 7 checks, exit 0 = GO:
1 WALLET record minted+signed  2 rabiu.wallet.harz resolves via real DNS wire
3 second wallet name resolves  4 unknown = NXDOMAIN no fallback
5 SERVICE records unaffected (backward compat)
6 TAMPERED address can NEVER serve (fail-closed)  7 good node unaffected by
tamper attempt elsewhere. Testnet key = runtime-ephemeral TEST zone-signing key;
address in test record = standard dead-address TEST stand-in, never real.
