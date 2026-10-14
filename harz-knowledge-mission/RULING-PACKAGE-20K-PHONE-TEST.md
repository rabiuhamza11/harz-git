# RULING PACKAGE: 20K D1 PHONE TEST (Oct 14 — artifact, procedure, acceptance)

## What this is
The frozen 5-gate path to unblocking the 20K knowledge expansion starts
with a REAL device run: the D1+FTS5 kit on YOUR phone, not the sandbox.
("sandbox ≠ device" is your own gate.)

## The precise test artifact (already staged, dry-run PASS)
- Repo: harz-e1-core @ commit 15abdf7 (phone kit builder + battery)
- Artifact: tools/bench/d1-phone-run.mjs
- What it builds: the 5K D1 kit (6.28MB, under the frozen 15MB install
  limit) and runs the on-device battery: FTS5 index build time, query
  latency, cold-open, and the offline usability checks.

## Device requirements
- Your Infinix (any 2024+ model qualifies; 2GB+ RAM)
- A browser: Chrome or Edge (Termux optional for the node path; a
  no-install browser-only variant is available if you prefer)
- Internet ONCE for setup (git pull + kit download), then OFF for the
  offline phases — the death-test sequence per the Universal App Contract.

## Procedure (one command on your phone, in Termux)
cd ~/harz-e1-core && git pull && node tools/bench/d1-phone-run.mjs
The script prints a RECEIPT (hashes + timings) — send me the receipt
text; I verify it against the frozen expectations and record it.

## Acceptance criteria (all five frozen gates)
1. INSTALL SIZE: kit <=15MB — 5K D1 kit PASSES at 6.28MB. NOTE: the 20K
   kit measures 24MB and EXCEEDS the 15MB frozen limit — the 20K path
   additionally needs your explicit install-size ruling OR a <=15MB
   20K package (design work I can scope on your word).
2. REAL-DEVICE RECEIPT: the run receipt from your phone, hash-verified.
3. OFFLINE USABILITY: search works with airplane mode on, honestly
   labeled OFFLINE, no network calls attempted.
4. KV ROLLBACK PRESERVED: the accepted 5K KV core stays intact and
   restorable (untouched by this test by design).
5. FROZEN BASELINE: corpus/thresholds/citations/reproducibility of the
   accepted 5K core unchanged; the test only ADDS the D1 variant.

## Honest scope statement
A passing phone run of the 5K D1 kit unblocks the D1-on-device FACT but
does NOT by itself authorize the 20K expansion — gate 1 (size) and your
explicit promotion ruling remain. The 20K content (staged Team C batch,
~8,603 docs / 94MB server-side) also remains behind the ingestion freeze.

RULING FORMAT: "Run the test" — I send you the exact step-by-step for
your device with the Termux one-liner (or the browser-only variant).
