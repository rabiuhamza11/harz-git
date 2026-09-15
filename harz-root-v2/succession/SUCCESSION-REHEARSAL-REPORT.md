# SUCCESSION CEREMONY REHEARSAL — SOFTWARE MODE — REPORT
**Date: Sep 15, 2026 · Protocol under test: SUCCESSION-PROTOCOL-v0.1 (draft, e9e731a7)**
**Keys: TEST ONLY, in-memory. This proves the CEREMONY LOGIC, not the event.**

## VERDICT: 10/10 PASS

| Step | Ceremony / attack | Result |
|------|-------------------|--------|
| SR-1 | Seed: K0 signs height 1 under the out-of-band anchor | PASS |
| SR-2 | Manifest: K0 pre-authorizes successor K1 + 3 witnesses, policy 2-of-3 | PASS |
| SR-3 | PLANNED ROTATION: K1 enthroned via K0-signed manifest | PASS |
| SR-4 | ZOMBIE KING: K0 signature after its own revocation → refused | PASS |
| SR-5 | DEATH PATH: K1 + 2-of-3 witness quorum accepted; K0 revoked from compromise height | PASS |
| SR-6 | THEFT RACE: K0 signature after the death act refused (revoked AND post-compromise laws, belt and braces); pre-compromise heights stay valid (honest window) | PASS |
| SR-7 | QUORUM FAIL: 1-of-3 witnesses → refused | PASS |
| SR-8 | WITNESS COUP: full quorum cannot appoint a successor the king never named | PASS |
| SR-9 | MANIFEST TAMPER: swapped witness list fails K0's signature | PASS |
| SR-10 | Honest labels: software mode, test keys, ceremony logic only | PASS |

## Validator law encoded (the rehearsal's real product)
- Authority = anchor ∪ enthroned-by-valid-act. Self-declared keys are NOT trust (anchor law, KT-8 lineage).
- The SUCCESSION_ACT is examined BEFORE the authority check — the act is what legitimizes the
  successor's own signature on the zone that carries it.
- A successor is only acceptable if the LIVING authority pre-authorized them in a signed manifest.
  Witnesses cannot appoint (SR-8) — they can only complete a succession the king already named.
- Death path: quorum (2-of-3) verified over the act body; compromise declaration closes the theft
  race at the declared height; K0's pre-compromise signatures remain valid (honest window).
- Zombie king: revocation is checked at every zone; a stolen old key cannot come back to life.

## Honest boundaries
- Software mode with test keys: the CEREMONY LOGIC is proven; the EVENT (real key ceremony on Node 1,
  real witnesses, paper QR successor) is not. Real ceremony needs owner rulings D6-D8.
- The rehearsal encodes the protocol v0.1 draft faithfully; if the owner rules different seats/quorum,
  the parameters change (policy, witnesses) but the law structure stands.
- One design note surfaced during rehearsal: after a death act, the revoked-key and post-compromise
  laws overlap on stolen-K0 signatures (belt and braces, both fire); the honest window
  (K0 signatures at/below the compromise height) remains valid by design.

## Reproduce
`node rehearsal.js` — deterministic; run twice, same verdicts.

## Freeze gate status (per protocol v0.1)
1. Owner rulings D6-D8 — PENDING (witness seats, quorum, freeze timing)
2. Yakubu attack of the protocol — this rehearsal covers the SOFTWARE attack face (tamper, coup,
   quorum abuse, zombie king, theft race); the PHYSICAL face (paper-key forgery, witness coercion)
   remains judgment work for the attack seat
3. Software-mode ceremony rehearsal — THIS, 10/10 PASS
4. Commit at freeze time — rehearsal + report committed now; protocol freezes only after 1+2
