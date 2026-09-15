# HARZ Root Authority (HRA) — The Second ICANN
## Architecture DRAFT v0.1 — FOR OWNER REVIEW, NOTHING BUILT YET
Status: DRAFT — Rabiu's review pending. No component of Layer 3 is built.
Date: Sep 15, 2026. This document exists so the owner can see the whole
architecture BEFORE any build begins.

---

## 1. What "a second ICANN" actually is
ICANN is not a website. It is four functions bundled together:

1. ROOT DATABASE — the one true list of names (the root zone)
2. TRUST ANCHOR — the key the world trusts as the source of truth
3. REGISTRY OPERATIONS — registering, updating, retiring names
4. POLICY AUTHORITY — who may register, what names are legal, how disputes die

HARZ already owns functions 1 and 2 outright. Function 3 and 4 are the
unbuilt half. When all four exist, HARZ is a root authority — a second
ICANN — sovereign on the domain side: its namespace cannot be seized,
deactivated, repriced, or vetoed by any registrar, government, or company,
because there is no contract between HARZ and anyone. The root is a KEY.

## 2. The Sovereignty Spine (EXISTS — receipts on file)
- The root is the OWNER'S CEREMONY KEY (production ZSK, ceremony f5ae008,
  Sep 14; private key lives only with Rabiu on Node 1).
- Zero-ICANN Law (spec v1.0.1, eb5cffb5): no registrar, no renewal, no purchase.
- Fail-closed verification everywhere (v2.1.1 law + schema v2 battery 11/11).
- Anchor travels out-of-band: ceremony, QR rail (46 chunks), extension bundle.

## 3. Layer 1 — The Root Book (EXISTS, v2 BUILT Sep 15)
The canonical signed zone IS the root database — the analog of the ICANN
root zone file. 77 names today. v2 record schema: identity, state, endpoints,
routing, policy — strict schema, zone chain via prev-digest, Ed25519 signatures,
honest PENDING identities, honest reserved names. Battery 11/11, committed.

## 4. Layer 2 — The Doors (EXIST, 5 FREE DOORS, battery 11/11)
How the world reaches the namespace — the analog of "DNS works everywhere":
1. DoH (RFC 8484 JSON) on existing free hosts
2. Browser extension (installed door)
3. Native runtime (CLI/HTTP)
4. Offline mesh cache (zero network)
5. QR rail (camera is the registrar — 46 chunks carry the whole zone)
All five serve byte-identical answers from the same signed book.

## 5. Layer 3 — The REGISTRY (NOT BUILT — the real "ICANN function")
This is what makes HRA a root authority rather than a private zone:

### 5.1 Registration protocol (signed mutation chain)
- A registration is a SIGNED MUTATION REQUEST: applicant's key signs the
  request → registry validates (label law, availability, policy) → new zone
  HEIGHT is cut (height+1, prev-digest chain already in schema v2) →
  inclusion proof returned to the applicant.
- Every zone height is a page in the book. History is the chain. Nothing is
  ever overwritten — names retire, they are never erased silently.
- The applicant's key becomes the name's identity in the book (kills the
  PENDING marker honestly — identity by ceremony on the holder's side).

### 5.2 Name lifecycle (honest states, mirrors registry reality)
MINT → ACTIVE → (RENEW/TRANSFER) → EXPIRED → RESERVED → releasable.
Every state transition is a signed mutation at a new height. Expired names
keep their history visible — the book never lies by omission.

### 5.3 WHOIS/RDAP analog (public name records)
A public query door: who owns a name, since when, at what height, with what
key. Privacy level = OWNER POLICY DECISION (see §7).

### 5.4 The registry seat (where it runs)
Software node on the free rails (Workers + the sandbox engine), same
fail-closed law. The registry is ALSO portable — the portability rule applies:
the registry must be movable to another substrate without identity loss.

## 6. Layer 4 — Policy Authority (NOT BUILT — the owner IS the authority)
- Level 0 (Rabiu) sets registry policy: legal labels, reserved list, pricing,
  dispute rulings. Policy itself lives IN THE BOOK as signed records —
  policy changes are height changes, fully auditable.
- Later (owner's choice, far future): delegated policy for customer-owned
  sub-namespaces — the multi-stakeholder analog. NOT in v1.

## 7. OPEN DECISIONS — THE OWNER RULES ON THESE BEFORE ANY BUILD
D1. WHO may register .harz names — HARZ only / paying customers / anyone?
D2. FEE MODEL — free / flat NGN / GDEG-priced registrations?
D3. IDENTITY VISIBILITY — public owner key / pseudonymous / private contact?
D4. EXPIRY — permanent ownership or renewable leases?
D5. DISPUTES — owner ruling / written evidence-based policy?

## 8. Honest boundaries (unchanged discipline)
- HRA is sovereign OVER .harz — it does not and cannot control the legacy
  root or other people's computers. Devices without a door see nothing.
  This is what every alternative root in history has been: opt-in.
- Sovereignty claim is ARCHITECTURAL (own key, own policy, zero external
  dependency) — never a claim of control over the public Internet.
- No customer-facing claim before the killer test passes in software mode
  and the registry battery is green.

## 9. Proposed sequence (AFTER owner review — nothing starts before the word)
S1. Owner rules on D1-D5 → architecture FROZEN
S2. Registry mutation protocol build (software, schema v2 native)
S3. Registry battery: mint/renew/transfer/expire/refuse-tamper/inclusion-proofs
S4. Registry seat deployed on free rails + doors serve the new heights
S5. Killer test SOFTWARE MODE (death/migration/partition/recovery)
S6. First REAL external registration = the acceptance test

## 10. What this is NOT
- Not a claim that the world's DNS will resolve .harz tomorrow
- Not a replacement for the legacy root — a SECOND root, standing beside it
- Not a purchase of anything. The root is a key, the doors are free rails,
  the registry is software. Total external cost of the architecture: ₦0.
