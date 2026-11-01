# RECEIPT 287 — Canonical source tree for harz-trading-machine (worker v1.2)

Date: 2026-11-01 ~04:00 WAT · Worker: harz-trading-machine · No deploy performed.

## 1. My own custody error, found and fixed

Receipt 286 pinned HarzGit row 244 as the canonical bundle. That row was wrong: it captured the
raw `content/v2` **multipart response**, so its first lines are a `--boundary` marker and a
`Content-Disposition` header. It is 57,411 bytes, not the module.

It was caught because the assembler refused: `node --check` failed at line 2 on
`Content-Disposition: form-data; name="worker.v1.2.js"`.

Correction: the payload was re-extracted by parsing the multipart body properly.
Clean module: **worker.v1.2.js**, 57,149 bytes, sha256 `4ab5eff9e5b16048…`, `node --check` PASS,
38 `__name(` markers, helper `var __name = …` present at the top.

Row 244 is **kept, not deleted**, with its description rewritten to "DEFECTIVE CUSTODY — captured the
multipart envelope, not pure JavaScript; superseded". Audit trail over tidiness.

## 2. Clean custody

HarzGit row **323** — `harz-trading-machine/deployed-worker-v1.2.js` — holds the clean module with its
sha256, length, deploy id and capture time in the description.

## 3. Readable source tree (lossless, not a refactor)

The module is split at top-level statement boundaries into **76 parts** stored as rows
`harz-trading-machine/src/P001-…` … `P076-…`. The split is lossless by construction: concatenation
in name order reproduces the module byte for byte. No logic was rewritten, so nothing can drift.

- `harz-trading-machine/build/manifest.json` — pinned `whole_sha256`, byte length, part count.
- `harz-trading-machine/build/assemble.js` — joins parts in name order and **refuses** unless the
  result hashes to the pinned value, then writes worker.js.

## 4. Verification (from HarzGit rows, not from local files)

```
parts read back   76 / 76
bytes             57,149 / 57,149
sha256            4ab5eff9… == pinned   TRUE
byte-identical    TRUE
node --check      PASS
__name markers    38 · helper present  TRUE
vault rows        321
```

The defect that caused Cloudflare 10021 can no longer happen silently: a patch that loses the helper
changes the hash, and the assembler refuses before anything reaches the worker.

## 5. Still open

- Deploy rule not yet in force (one writer, deploy only from a HarzGit row, quiet window, keep helper).
- Three deployed-code defects unchanged and unfixed: `real_fills` counts simulated fills; correlated
  longs count a field the schema calls `direction`; `hunt_runs` insert is shared with the preview path.
- No strategy claim is audited yet: neither the −0.17R backtest nor the +0.079R replication has an
  artifact in HarzGit.
