# HARZ Root v2 — Strategic Architecture (DRAFT v0.9, awaiting owner freeze)

Status: DRAFT — proposed by owner (Rabiu) Sep 14, 2026, reviewed by witness seat (Magani).
Freeze happens on the owner's explicit word. No live system changes until frozen.

## The Definition
HARZ is NOT another DNS. HARZ = a sovereign naming, identity, trust, state, routing,
and application-continuity layer that can use the public Internet when available
but does not fundamentally depend on it.

## The Central Invariant (frozen candidate)
ONE HARZ NAME → ONE CANONICAL IDENTITY → ONE CANONICAL STATE →
MANY RESOLUTION METHODS → MANY TRANSPORTS → MANY PHYSICAL NODES.

## The Three Roots
1. Naming Root — "What is pay.harz?" (canonical zone → service identity)
2. Trust Root — "Is this actually the legitimate pay.harz?" (pubkey → signature → proof chain)
3. State Root — "What is the latest legitimate state of pay.harz?" (canonical state → height → signed records → reconciliation)

## Five Components
A. harz-root — canonical namespace + signed zone (LIVE: worker v2.1.1, zone e94b9693, production ZSK 86a507a42df64df2)
B. harz-resolver — ONE resolution engine with multiple projections: DNS / DoH / browser bridge / native runtime / mesh (partially exists: /resolve API, extension resolver, dial resolver — unification is the work)
C. harz-gateway — public Internet ↔ HARZ translation (NEW surface; harz.ng is the doorway INTO .harz, never its replacement; deterministic mapping pay.harz ↔ pay.harz.ng; canonical identity remains pay.harz)
D. harz-state — canonical state, signatures, gossip, convergence, reconciliation (exists: capsule book v14 49b7cf42, gossip adoption proven, byte-identical across CF/Deno/Termux)
E. harz-transport — Internet + WiFi + BLE + Dial (SMS/USSD) + DTN store-carry-forward (+ LoRa as a SLOT ONLY — unproven, zero hardware owned; must never appear in claims as if real)

## Service Registry (record schema v2 — the real new engineering)
77 names are not merely DNS records — they are the HARZ Service Registry.
Target record shape per name:
  identity (Ed25519 public key) / service type / state (current signed state ref)
  endpoints (https, harz-native, mesh, dial, local) / routing (reachable nodes) / policy
Today's zone carries URL targets only. Schema v2 migration is the core engineering task.
One book, many projections: DNS projection, DoH projection, native root projection —
all render from the SAME canonical book (matches the canonical-book discipline already proven).

## The Killer Test (acceptance gate for HARZ Root v2 — falsifiable, staged)
1. Create service test.harz
2. Resolve it through: DNS, DoH, HARZ-native resolver, mesh
3. Kill Node A → 4. Node B continues serving
5. Disconnect Internet → 6. Mesh resolves it
7. Modify state on Node B → 8. Reconnect Node A → 9. Gossip converges
10. Verify: same identity, same canonical state, same proof, same service
Then: kill the gateway → HARZ-native network must still work.
STAGING: software-mode run first (sandbox, honestly labeled, per standing orders);
physical run gated on Node 1 hardware + mesh APK + second device.

## Sequencing (witness-seat proposal)
1. Owner freezes this spec (word: "freeze")
2. Record schema v2 design (pure software, sandbox)
3. Resolver unification — one engine, four projections
4. Gateway fabric — requires harz.ng purchase (the ONE purchase; also unblocks Node 1 tunnels)
5. Killer test, software mode → then physical
ICANN round 3 = reach expansion ONLY, never a dependency. Same network, same namespace,
same canonical book — the bridge (harz.ng) simply gets removed if delegation ever happens.

## Honest Boundaries (standing)
- LoRa: unproven, no hardware — slot only, never claimed
- Software-mode results are workbench evidence, never sovereignty claims
- Physical sovereignty claims only from HARZ-owned hardware (Node 1 / Pi)
- No architecture change to LIVE systems without owner agreement (Yakubu's rule)
