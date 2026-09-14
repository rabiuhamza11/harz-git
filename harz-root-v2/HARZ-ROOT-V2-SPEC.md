# HARZ Root v2 — Strategic Architecture (FROZEN v1.0)

Status: FROZEN v1.0 — Sep 14, 2026, 23:27 WAT. Owner amendment applied and freeze
called final: "HARZ is software-defined infrastructure. Physical hardware is an
external substrate, not a HARZ architectural dependency." Hardware gates REMOVED
from the plan before freeze, per explicit owner order: (x) "Gateway fabric needs
Node 1 hardware" — FALSE, gateway fabric is provable entirely in software;
(x) "Physical run waits for HARZ-owned hardware" — FALSE, offline/partition runs on
simulated partitions + independent software nodes; physical hardware is later ONE
deployment substrate, never a requirement.

## The Definition
HARZ is NOT another DNS. HARZ = a sovereign naming, identity, trust, state, routing,
and application-continuity layer that can use the public Internet when available
but does not fundamentally depend on it.

## Frozen Principle (owner amendment, Sep 14)
HARZ is SOFTWARE-DEFINED INFRASTRUCTURE. Physical hardware is an external SUBSTRATE,
not a HARZ architectural dependency. A node is software, not a box. Nodes run on
cloud, VPS, PC, phone, browser, or edge runtime, and can migrate between substrates
while retaining the same HARZ identity and canonical state.
(Consistent with proven work: capsule v14 survived death and ran byte-identical
across Cloudflare, Deno, and the phone — portable runtime, no owned hardware.)

## The Central Invariant
ONE HARZ NAME → ONE CANONICAL IDENTITY → ONE CANONICAL STATE →
MANY RESOLUTION METHODS → MANY TRANSPORTS → MANY SOFTWARE NODES.

## The Three Roots
1. Naming Root — "What is pay.harz?" (canonical zone → service identity)
2. Trust Root — "Is this actually the legitimate pay.harz?" (pubkey → signature → proof chain)
3. State Root — "What is the latest legitimate state of pay.harz?" (canonical state → height → signed records → reconciliation)

## Five Components
A. harz-root — canonical namespace + signed zone (LIVE: worker v2.3, zone e94b9693, production ZSK 86a507a42df64df2; /zone /pub /zone.sig byte-exact vs git)
B. harz-resolver — ONE resolution engine, multiple projections: DNS / DoH / browser bridge / native runtime / mesh
C. harz-gateway — public Internet ↔ HARZ translation; PROVEN ENTIRELY IN SOFTWARE: live DoH endpoint /dns-query (RFC 8484) on the production root since Sep 14 (commit 0bf2029); harz.ng is an optional accelerator/doorway, never an architectural dependency
D. harz-state — canonical state, signatures, gossip, convergence, reconciliation (exists: capsule v14 49b7cf42)
E. harz-transport — Internet + mesh + Dial (SMS/USSD) + DTN store-carry-forward + local/offline (+ LoRa = slot only, unproven, zero hardware owned)

## Service Registry (record schema v2 — the core new engineering)
Per name: identity (Ed25519 public key) / service type / state ref / endpoints
(https, harz-native, mesh, dial, local) / routing (reachable nodes) / policy.
One book, many projections (DNS, DoH, native root) — all render from the SAME canonical book.

## The Killer Test (v2 wording, per owner amendment)
"Can a HARZ service survive the DEATH, MIGRATION, DISCONNECTION, and REPLACEMENT of
its software node while preserving one identity and one canonical state across
different software substrates and transports?"
Full sequence: create test.harz → resolve via DNS/DoH/native/mesh → kill Node A →
Node B serves → disconnect (simulated partition) → mesh/offline resolves →
modify state on B → reconnect → gossip reconciles → same identity, same state, same
proof, same service → kill the gateway → HARZ-native network still works.
EXECUTION MODE: SOFTWARE MODE FIRST — independent software nodes, simulated network
partitions, real death/restart of processes. This proves the architecture without
pretending we own physical infrastructure we don't own. Physical hardware later
becomes ONE deployment substrate, not a requirement.
PROVEN: sovereignty-test.js v1.1 — 16/16 GO, 3 consecutive clean runs (Sep 14).
Extends v1.0's death/offline/recovery 12 checks with the migration/replacement
elements of the amended killer test: (13-15) the PRODUCTION canonical book migrated
live from the Cloudflare Workers substrate to a local Node.js runtime — zone+sig+pub
fetched from the live routes, production signature verified on arrival (fingerprint
86a507a42df64df2), and gov.harz served byte-identically on the new substrate;
(16) a fresh replacement node built from canonical state serves the same
identity/state/proof as the network. Known gap on record: resolver.v1.1 loads the
zone at boot only — Root v2 needs a gossip->resolver hot-reload hook.

## Sequencing (revised — hardware gates removed)
1. Owner freezes this spec (word: "freeze")
2. Record schema v2 (pure software)
3. Resolver unification — one engine, four projections (pure software)
4. Gateway fabric — software proof (DoH endpoint + deterministic pay.harz ↔ pay.harz.ng mapping when/if the domain exists)
5. Killer test, SOFTWARE MODE (no hardware gate)
6. Physical substrate (Node 1 / Pi / extra phones) = OPTIONAL later deployment, not a prerequisite
ICANN round 3 = reach expansion only, never a dependency.
harz.ng purchase = optional accelerator (public doorway + stable tunnels), not a dependency.

## Honest Boundaries (standing, unchanged in spirit)
- LoRa: unproven, no hardware — slot only, never claimed
- Software-mode results prove the ARCHITECTURE; they are honestly labeled as
  software-mode evidence — they are not claims of physical infrastructure ownership
- Sep 9 ruling preserved in claims discipline: no sovereignty-over-rented-compute
  claims from sandbox evidence alone; the architecture claim and the ownership
  claim stay separate
- No architecture change to LIVE systems without owner agreement (Yakubu's rule)
