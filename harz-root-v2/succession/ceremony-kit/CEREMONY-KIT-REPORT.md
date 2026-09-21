# SUCCESSION CEREMONY KIT v1.0 — REPORT
**Date: Sep 15, 2026 · Protocol: SUCCESSION-PROTOCOL-v0.1 (e9e731a7) · Law: rehearsal SR battery (382b4ff6)**

## VERDICT: 12/12 PASS — the kit is ceremony-ready (deterministic across 3 runs)

The operator tool for the REAL key ceremony. Runs on Node 1 / Termux. What it does:
- `plan` — prints the ceremony runbook with the D6-D8 ruling blanks (witness seats, quorum, timing)
- `gen-key --role successor|witness [--seat W1]` — keypair in-memory: PUB for git/manifest,
  PRIVATE only as paper-QR chunks (DPB discipline, same rail as the zone transfer). `--no-priv`
  suppresses the private entirely (chat-safe mode).
- `manifest ...` — builds the canonical SUCCESSION manifest; the OWNER signs it on Node 1
  with the ZSK (the private key NEVER enters the kit); `--sig <hex>` verifies his signature.
- `act-planned` / `act-death` — canonical act payloads; witnesses sign the death act with
  their seat keys; the successor signs the enthronement zone.
- `verify-chain` — runs the succession law over a zone chain, fail-closed.

## THE REAL BUG THE BATTERY CAUGHT (why batteries exist)
`--no-priv` is a boolean flag, but the option parser only handled value-options — so the
"chat-safe" mode SILENTLY SKIPPED the suppression and printed the private key anyway.
Found by CK-2's manual run, fixed: dedicated boolean-flag parsing. Also hardened: verify()
never throws on malformed pub/sig material — malformed = NOT verified (fail-closed, not crash).

## Battery (CK-1..CK-12), all through the kit's own CLI
plan runbook ✓ · gen-key pub/suppress ✓ · paper-QR chunks + keystore warnings ✓ ·
manifest canonical + ZSK-never-requested ✓ · owner sig VERIFIED ✓ · wrong sig REFUSED exit 3 ✓ ·
full planned rotation ACCEPTED ✓ · zombie king REFUSED ✓ · death path 2-of-3 quorum ACCEPTED ✓ ·
1-of-3 quorum REFUSED ✓ · act payloads canonical ✓ · honest labels ✓

## Security properties (standing rules honored)
- The production ZSK private key never enters the kit — manifest bytes are signed on Node 1,
  the kit only verifies what's handed back.
- Witness/successor private keys: in-memory, printed as QR payload strings for PAPER only,
  never written to disk by the kit. Leak sweep: no private-key bytes in any artifact.
- Fail-closed everywhere: bad signature, bad quorum, wrong anchor, zombie key = REFUSED.

## Honest boundaries
- TEST keys, software mode: the kit is READY for the real ceremony but the real ceremony has
  not happened. Witness seats are empty until owner rulings D6-D8.
- The paper-QR successor is slow to activate by design — slow succession beats none.
- The live root is untouched (v1 zone, production ZSK, e94b9693). No zone was migrated.

## Reproduce
`node ceremony-battery.js` — deterministic. Leak sweep: `grep -rlE "302e0201050..." *.js *.md`.

## On ceremony day (after D6-D8 rulings)
1. `node ceremony-kit.js plan` — Rabiu reads the runbook, fills D6-D8
2. gen-key x4 (successor + 3 witnesses) — paper cards printed
3. manifest built → Rabiu signs on Node 1 → `--sig` verified → record enters next zone
4. Succession is armed. Rotation or death path exercised through the same kit.
