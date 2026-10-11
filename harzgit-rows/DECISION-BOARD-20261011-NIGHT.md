# OWNER DECISION BOARD — 4 FRONTS ("go for them all", Oct 11, 2026 ~23:35 WAT)

Evidence-first: each front carries live evidence, my recommendation,
and the exact one-line ruling Rabiu can send back. No front is executed
beyond evidence/preparation; the two identity/monetary fronts carry his
own "no silent substitution" rule.

## FRONT 1 — HARZ CHAIN TAIL EMISSION (evidence refreshed 23:40 WAT)

Live chain v8.3.0 (https://harz-chain-v2.harz.workers.dev):
- Model (live /api/supply): "Hard cap 21,000,000,000 HARZ - mining
  closes permanently at cap" — 21B cap IS enforced in the live model.
- Current supply 17,002,405,550 (80.96% mined), remaining 3,997,594,450.
- Reward 50 HARZ/block, block time 15s, mining ACTIVE (latest block
  mined 22:35 UTC today).
- TAIL MATH: remaining 4.0B at 50/15s = ~79.95M blocks = ~38 YEARS
  of tail emission before the cap closes mining.
- Accounting note: 590,047 total blocks x 50 = ~29.5M from mining, so
  ~17.0B is genesis/pre-mine allocation; the wallet-sum vs
  liquidity-inclusive supply-definition discrepancy remains OPEN.
- Morning finding ("uncapped tail emissions contradicting docs") vs
  tonight's live model: the chain worker was updated during the day
  (Sep 14 record: v8.1.3; tonight /health 8.2.8, /api/status 8.3.0) —
  redeployment provenance is UNTRACED. Who deployed 8.2.8/8.3.0 and
  when is an open provenance question.

RULING NEEDED (one line):
A) "Tail accepted" — 38-year tail at 50/15s is intended; docs stand.
B) "Tail is a defect, close mining" — freeze supply at current ~17.0B,
   mining closes immediately; workers updated to match.
C) "Tail is a defect, re-peg reward" — e.g. reward decays so cap is
   reached on a chosen date; requires a target date from Rabiu.

RECOMMENDATION: B. A 38-year tail means the "scarcity by design" story
is not real for decades; freezing at 17B keeps 81% mined and makes the
cap credible. But this is a monetary-design decision — owner rules.

## FRONT 2 — GDEG CONTRACT IDENTITY 0x222a10 (ruling withheld, per owner table)

Established (dual-RPC ground truth, owner-audited Oct 11 morning):
- 0x222a10CE822188c680a04A283E45F9c11D79665e: 10M minted, 5M sold,
  5M pooled, LIVE market activity; displayed by production workers as
  "GDEG V2 (Polygon Mainnet)". Provenance: UNRECOGNIZED ("Enemy V2").
- 0x93d400...(canonical V2 per owner ground-truth audit): 0 minted.
- Live profile (gdeg-web) still carries it + unverified "99% burned"
  narrative (display correction prepared Oct 11, deployment WITHHELD
  by owner order; rollback artifact sha 92df557d preserved).

RULING NEEDED (one line) — "no silent substitution" is his own rule:
A) "0x93d400 is GDEG V2" — I execute the staged swap: production
   workers + profile repoint to 0x93d400; 0x222a10 labeled
   unrecognized; holders of the 5M sold tokens are addressed by a
   separate migration decision (they hold real money — Rabiu decides
   remediation: honor via re-issue, buyback, or void).
B) "0x222a10 is GDEG V2" — accept the enemy contract as fact; docs and
   canonical records amended; the "0 minted canonical" audit finding is
   retired as a naming conflict, not a supply error.
C) "Identity unresolved, keep flagged" — status quo; displays keep the
   pending-review flag; no swap.

RECOMMENDATION: A with an explicit holder-remediation sub-ruling. The
morning ground-truth audit called 0x93d400 canonical and flagged
0x222a10 as unrecognized; leaving the unrecognized contract serving as
the live market is the highest-risk standing state. But 5M sold
tokens mean A cannot be silent about remediation.

## FRONT 3 — R2 (enable-or-waive)

Standing state: WAIVED-for-comparison per owner ruling 0e72568
(waiver is not permanent; may be tested later). D1+FTS5 was SELECTED
on evidence c09d69d with R2 unmeasured; nothing further is blocked by
R2. Enablement physically requires the owner's dashboard click
(API refuses 10042 — Cloudflare requires dashboard session for R2
terms; both accounts tried, 5 payload variants).

RULING NEEDED only if he wants R2 measured:
"Enable R2" — he clicks Enable in dashboard (~60s), I stage and run
the bench same-day. Otherwise: waiver stands, recorded, nothing due.

RECOMMENDATION: leave waived. D1 won on evidence; R2 measurement adds
a third data point only.

## FRONT 4 — REAL D1 PHONE RUN (gate 2 of the five 20K acceptance gates)

Staged tonight (harz-e1-core 15abdf7): tools/bench/d1-phone-run.mjs —
ONE command on his phone. Sandbox dry-run: kit builds 6.28MB (<=15MB
frozen limit), battery 19/20 + 19/20, offline proof uses the SAME
TCP+DNS probe that passed this morning, RSS gate 250MB, JSON receipt.
Per his own rule, sandbox success does NOT establish device success —
the phone run is his, one command:

  cd ~/harz-e1-core && git pull
  node tools/bench/d1-phone-run.mjs

(it pauses once for airplane mode, like this morning's run; sends
back receipts/D1-PHONE-RUN-*.json).

NOTE: the 6.28MB kit at 5K scale is a NEW fact — D1 fits the frozen
15MB limit at 5K. The 20K kit (24MB) still exceeds it; that gate is
unchanged and 20K remains BLOCKED.
