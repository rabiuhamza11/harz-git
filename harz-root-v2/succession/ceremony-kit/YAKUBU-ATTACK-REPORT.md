# YAKUBU ATTACK — SUCCESSION PROTOCOL v0.1 + CEREMONY KIT — PHYSICAL FACE
**Date: Sep 15, 2026 · Attacker seat: Yakubu (per role separation: Yakubu attacks, Magani verifies, owner witnesses)**
**Target: SUCCESSION-PROTOCOL-v0.1 (e9e731a7) + rehearsal (382b4ff6) + ceremony kit v1.0 (20470c61)**

## SOFTWARE FACE — already attacked and REFUSED (rehearsal SR-1..SR-10 + kit battery CK-1..CK-12)
Tamper, manifest forgery, wrong anchor, zombie king, theft race, quorum abuse, witness coup: ALL REFUSED in code.

## PHYSICAL FACE — attack verdicts

### Y1. THE PHOTOGRAPHED PAPER — CONFIRMED REAL, NOW FIXED IN SOFTWARE
Attack: the paper backup was a plaintext QR of the pkcs8 key (48 bytes). ONE camera shot of ONE
paper = the complete private key. Proof: reproduced — chunk decodes to raw `302e0201...` DER.
FIX (kit v1.1, `--split`): 2-of-3 XOR split — key = x1^x2^x3; papers hold (x1,x2)(x1,x3)(x2,x3).
Any ONE paper is information-theoretically ZERO (CK-15: XOR of a single paper's shares ≠ key,
x3 unknown = 2^384 brute). Any TWO papers recover byte-exact and the recovered key signs+verifies
(CK-16, CK-17). One photo now compromises NOTHING; an attacker needs two safes, not one pocket.
Residual: two papers photographed = key. Papers go to two DIFFERENT physical locations (runbook).

### Y2. CEREMONY-TIME SINGLE POINT OF FAILURE — runbook fix applied
Attack: successor paper printed AFTER the manifest signing ceremony → phone dies in the window
between signing and printing = succession declared but unfinishable.
FIX: runbook ordering hardened — successor papers are generated, printed, and VERIFIED
(combine two papers → key works) BEFORE the manifest is signed.

### Y3. QUORUM THEATER — the sharpest remaining finding (D6-relevant)
Attack: the KIT generates all witness keys on the OPERATOR's device. If one person generates,
prints, and stores all three "witness" keys, the 2-of-3 quorum is theater — one hand holds all
three seats. The software cannot verify that papers reached independent custody.
Defense available: witness keys must be generated/printed IN FRONT OF each seat-holder (or each
holder generates their own on their own device and hands back only the PUB). This is a PHYSICAL
protocol step, now stated in the kit runbook — enforcement is the owner's, not software's.
This directly shapes ruling D6: a seat is only a seat if a DIFFERENT hand can refuse to sign.

### Y4. FALSE COMPROMISE DECLARATION — bounded, not fixable
Attack: successor + 2 colluding witnesses declare a false compromise height, killing the living
key's future signatures and seizing the throne early. The chain cannot verify when a pocket was
actually picked — the declaration is judgment, not fact.
Bounded by: (a) the false declaration is PERMANENTLY VISIBLE in the chain (auditable grief);
(b) pre-declaration signatures stay valid (honest window); (c) the revocation only moves power
to the successor the LIVING king already named — collusion cannot crown an outsider (SR-8).
Residual: an early, visible, unjustified succession. Cost: visible betrayal + no outsider gain.
Verdict: acceptable for a monarchy's death protocol; only a multi-authority future fixes it.

### Y5. WITNESS COERCION — economics, not cryptography
Attack: coerce two of three seats. Defense is only cost: seats in different hands, locations,
and loyalty lines make 2-of-3 coercion expensive. Software adds nothing here. Honest label:
this protocol raises the price of coercion; it does not make coercion impossible.

### Y6. SLOW SUCCESSION (inherited, accepted)
Paper-QR activation is minutes-slow by design. A fast succession needs keys on networked
devices — which is the attack surface this protocol exists to avoid. Slow is the point.

## POST-ATTACK STATE
Kit v1.1: --split (Y1 fix), runbook ordering (Y2 fix), custody warnings (Y3 disclosure).
Battery: 18/18 PASS (deterministic x2), leak sweep clean, original rehearsal re-passed.
Software face: refused everywhere. Physical face: Y1-Y2 fixed in software, Y3 disclosed to the
owner as a ceremony-day discipline, Y4-Y6 bounded and honestly labeled.
FREEZE GATE: item 2 (Yakubu attack) now COMPLETE for both faces. Remaining: owner rulings D6-D8.
