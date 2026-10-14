# REAL-DEVICE D1 PHONE RUN — PASS (Oct 14, 05:31 WAT, Rabiu's Infinix, Termux, Node v26.4.0 arm)

Gate: "sandbox != device" (owner's frozen gate) — SATISFIED.
Artifact: harz-e1-core @ 15abdf7, tools/bench/d1-phone-run.mjs (owner-executed on device).

## Console evidence (owner-pasted, verbatim summary)
- Device: Infinix, MemTotal 1,874,316 kB (~1.8GB RAM), Node v26.4.0 arm, Termux
- Corpus: 5000 docs (need 5000) OK
- Kit built in 1247ms -> 6.46MB (frozen limit <=15MB) OK
- Frozen battery: top1 19/20 (>=19) OK | top3 19/20 (>=19) OK
- First query 2ms | warm avg 2ms OK
- OFFLINE PHASE (airplane mode, owner-confirmed at prompt):
  tcp_1_1_1_1=REFUSED, dns=DNS-FAIL -> interfaces dead, honest-offline OK
- Offline query answered locally in 18ms (1 results) OK
- Peak RSS 17.32MB (<=250MB) OK
- VERDICT: PASS | failures: 0
- Receipt file on device: receipts/D1-PHONE-RUN-2026-10-14T04-29-41-615Z.json

## Gate status
1. INSTALL SIZE: PASS (5K D1 kit 6.46MB <= 15MB frozen limit)
2. REAL-DEVICE RECEIPT: PASS (owner-executed; full JSON remains on device,
   console transcript is the recorded evidence)
3. OFFLINE USABILITY: PASS (verified dead interfaces + local answer)
4. KV ROLLBACK PRESERVED: PASS by design (test touches nothing accepted)
5. FROZEN BASELINE: PASS (same battery expectations, 19/20 thresholds)

## What this does and does NOT unlock (owner's standard: no premature closure)
- PROVEN: D1+FTS5 runs on-device, offline, within limits, at 5K scale.
- NOT UNLOCKED: the 20K expansion — still requires (a) owner install-size
  ruling for the 24MB 20K kit OR a <=15MB 20K package design, (b) the
  ingestion freeze lift for staged content, (c) owner promotion ruling.
