# RECEIPT 293 - Scorecard made re-derivable, snapshots consolidated

Date: 1 November 2026, WAT. Authorized by owner ("Go on").

## Problem fixed

Snapshots recorded `acc_sha` of the RAW response body. /api/accuracy embeds `as_of`
with milliseconds and /api/summary embeds `now`, so every run produced a new hash for
an unchanged book. Evidence: 8 snapshots, 8 distinct acc_sha, identical verdict and
identical book. Stored hashes could never be re-derived, which defeated the purpose of
recording them.

## Fix

- Canonical hashing: parse JSON, delete volatile fields (`as_of`, `now`), sort keys
  recursively, serialise with no whitespace, then SHA-256.
- Raw body hash retained separately as `raw_sha256` for forensics; `as_of` kept as
  metadata beside the hash, never inside it.
- Snapshots table moved out of the new D1 `harz-scorecard-store` (e61cae59) into the
  single trading D1 (eef046df), honouring the one-instance rule. 11 rows migrated.
- SCOREDB binding re-pointed to eef046df.

## Artifacts

- pre-fix source  HarzGit trading/scorecard/source-v1.0.0.js  13,866 bytes
                  sha256 bd24f8d1b33c80ee97f79e6ab22f0be09adfebf5770c0ef0c9444bdc72264ba9
- fixed source    HarzGit trading/scorecard/source-v1.0.1.js  14,527 bytes
                  sha256 6b206e95ad8109f878c98977ccd32f7f0500f787d2370f742e108b7e0b4c4cfc
- Both round-trip verified byte-identical after insert. node --check PASS on both.
- Deployed 2026-11-01T06:43:56Z to harz-scorecard. gates_version now 1.0.1.

## Verification

1. Canonical hash cross-checked in two independent implementations (python and node)
   against the live accuracy payload: both 50e081715fe8baba5c6043bcd64d294ec5...
2. Four consecutive live runs at 06:44:09, 06:44:13, 06:44:17, 06:44:25 all record
   acc 50e081715fe8ba and sum d128bc768981. Stable across changing clocks.
3. Book identical across runs: 21 tickets, 11 resolved, 1 win, 10 losses, -0.773R,
   PF 0.15, fill 66.7%.
4. Snapshots landing in eef046df, count 18 at 06:44:25Z.
5. Browser render: gates judge correctly, 4 FAIL 1 PASS, verdict NOT READY.

## New defect found during verification (NOT fixed, awaiting approval)

sw.js is cache-first for every GET, including /api/*:

    const m = await c.match(e.request); if (m) return m; ...

Consequence: the instrument serves cached API responses. Observed live: the browser
page showed 8 stale snapshots and an older verdict line while the API already held 18
rows and the canonical hashes. A tamper-evident instrument that can display a stale
verdict is telling a falsehood by omission. Proposed: network-first for /api/*,
cache-first only for static shell, cache version bump to v2.

## Also open

- Every GET of /api/scorecard appends a snapshot, so the log inflates with page views
  (18 rows in 8 minutes). Proposed: write only when the canonical hash changes.
- Old D1 harz-scorecard-store (e61cae59) still exists, now unused. Deletion is
  destructive and is left to the owner.
- Machine /icon.svg still returns 500 (missing ICON_SVG constant).
- /api/economy/balance returns 400 "Valid phone number required", not the 502 claimed.
