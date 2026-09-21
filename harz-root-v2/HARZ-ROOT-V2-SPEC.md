# HARZ Root v2 — Strategic Architecture (FROZEN v1.0.1)

Status: FROZEN v1.0.1 — owner directive Sep 15, 2026: "build what will not let us
buy ICANN domain." The ICANN domain is OFF the path ENTIRELY. Zero-ICANN Law added
(below). Original freeze Sep 14, 2026, 23:27 WAT. Owner amendment applied and freeze
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

## Frozen Principle (owner amendments 1+2, Sep 14)
1. HARZ is SOFTWARE-DEFINED INFRASTRUCTURE. Physical hardware is an external
   SUBSTRATE, not a HARZ architectural dependency. A node is software, not a box.
2. HARDWARE IS OPTIONAL; ORDINARY USER DEVICES ARE VALID HARZ NODES. No specialized
   HARZ hardware is required. The owner's Infinix is already a live node (Node C,
   harz-survivor, Sep 14) and takes the Node 1 seed role — same phone, two roles.
3. PORTABILITY RULE: nothing may be built that only works because Node 1 is one
   particular phone. The proof of HARZ is: move the runtime to another substrate
   and the identity + canonical state SURVIVE. (Already proven once: capsule v14
   ran byte-identical across Cloudflare, Deno, and the phone.)
4. ZERO-ICANN RULE (owner directive, Sep 15, 2026): HARZ needs NO ICANN domain —
   no purchase, no registrar, no renewal, ever, for any capability. The Naming Root
   is a KEY (the trust anchor), not a domain. The zone travels as a signed
   artifact over FREE rails: DoH on existing hosts, the browser extension bundle,
   the native runtime, mesh gossip, and QR/optical transfer (the camera is the
   registrar). A domain may only ever be voluntarily added as pure reach
   expansion — it is not a step in any sequence and not on any critical path.

Owner refinement (Sep 14, 23:35 WAT): hardware is OPTIONAL infrastructure and
ORDINARY USER DEVICES ARE VALID HARZ NODES — no specialized HARZ hardware is
required. A normal phone is a node: Node 1 = the owner's phone as primary
sovereign/seed node; Node C = another network position (recovery/edge role),
possibly the SAME physical phone at a different role/stage. What matters is the
NODE IDENTITY and the CANONICAL STATE, not the physical device. LAW: nothing may
be built that only works because Node 1 is any particular phone. The portability
proof: move the runtime to another substrate and the identity/state must survive
— proven by sovereignty-test v1.1 checks 13-16 (production book migrated across
substrates, replacement nodes carry the same identity/state/proof).

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
C. harz-gateway — public Internet ↔ HARZ translation riding FREE rails only: the live DoH endpoint /dns-query (RFC 8484) on the existing root host (since Sep 14, commit 0bf2029) and the browser extension. The .harz.ng mapping code exists as inert software (gateway v1.0) — kept, but NO domain acquisition appears anywhere in the build path; it activates only if the owner ever freely chooses one, and nothing waits on it
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
4. Gateway fabric — software proof on free rails (live DoH endpoint; QR/optical root transfer — camera as registrar) — NO domain anywhere
5. Killer test, SOFTWARE MODE (no hardware gate)
6. Physical substrate = OPTIONAL deployment, not a prerequisite; the owner's phone
   already serves as Node 1 seed + Node C — no additional device needed for v1
ICANN = ZERO. No HARZ capability depends on an ICANN domain. The 5 free doors:
DoH (existing hosts), extension, native runtime, mesh/offline cache, QR transfer.
A domain is not a step in any sequence; if ever voluntarily acquired it is pure
reach expansion, and nothing waits on it.

## Honest Boundaries (standing, unchanged in spirit)
- LoRa: unproven, no hardware — slot only, never claimed
- Software-mode results prove the ARCHITECTURE; they are honestly labeled as
  software-mode evidence — they are not claims of physical infrastructure ownership
- Sep 9 ruling preserved in claims discipline: no sovereignty-over-rented-compute
  claims from sandbox evidence alone; the architecture claim and the ownership
  claim stay separate
- No architecture change to LIVE systems without owner agreement (Yakubu's rule)
