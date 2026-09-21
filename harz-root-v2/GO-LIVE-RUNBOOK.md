# GO-LIVE RUNBOOK — CEREMONY → KILLER TEST → LIVE M2 (v2)
**For: Rabiu (owner hands) + Magani (operator) · ~25 minutes total · frozen Sep 15, 2026**
**Pre-flight: `node go-live-check.js` must print SWEEP VERDICT: GO (7 batteries, 88 tests).**

## DAY MAP (3 short sessions, in order, no skipping)

### SESSION 1 — THE CEREMONY (~10 min, needs paper + pen, Node 1 = your signing device)
1. Magani runs `node succession-ceremony-kit/ceremony-kit.js plan` — prints your D6-D8 seats.
2. Successor key: `gen-key --role successor --split --no-priv` → 3 QR papers (A/B/C).
   PRINT the three papers. Magani verifies TT-3 live: combine A+B → key works. THEN store:
   paper A → Bauchi office; paper B → trusted person; paper C → Jalingo safe (D6).
3. Witness keys ×3: `gen-key --role witness --seat W1/W2/W3 --split --no-priv` — each seat's
   papers handed to that seat's hand, in person (Y3: a different hand must be able to refuse).
4. Manifest: `manifest --successor <pub> --witness <pub1>,<pub2>,<pub3>` → canonical bytes.
5. YOU sign the canonical bytes with the production ZSK ON NODE 1 (the key never leaves it,
   never enters chat). Paste the signature back; Magani verifies with `--sig`.
6. Commit: manifest + PUBs to HarzGit harz-root-v2/succession/manifest/ (leak sweep first).
   TT-1, TT-2, TT-3 PASS recorded. SUCCESSION IS FROZEN AND ARMED.

### SESSION 2 — TRUE-MODE KILLER TEST (~5 min, the death)
Per TRUE-MODE-TEST-PLAN.md TT-4..TT-7. Node 1's ZSK declared dead at the recorded height.
Zombie refusal, honest window, offline survival, QR chain transfer — all live, all binary.
PASS = the namespace survived the king's death with witnesses completing what he named.

### SESSION 3 — LIVE MIGRATION TO v2 (~10 min, on your migration word)
1. Rollback artifact pinned (TT-9): v1 zone + worker source byte-committed.
2. Registrar/zone builder produces the v2 migration zone (77/77 parity, height+1, prev-digest).
3. YOU sign the v2 zone with the ZSK on Node 1; Magani deploys; doors re-verified
   (DoH, /go/, JSON view, extension); fail-closed law intact. TT-8 PASS.
4. The live root serves the v2 book. THE SECOND ICANN IS LIVE INFRASTRUCTURE.

## THE LAWS THIS RUNBOOK CANNOT BEND
Fail-closed everywhere (a failure = REFUSED, never a guess). The ZSK private key never enters
chat, files, or the kit. HarzGit at freeze time, never after. One hand cannot hold all three
witness seats. If ANY step refuses, we STOP and report — a refusal is the system working.
