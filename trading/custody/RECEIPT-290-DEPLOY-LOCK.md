# RECEIPT 290 - Deploy lock: single-writer as a mechanism

Filed 1 Nov 2026 - seat Aisha - Status CLOSED

## What was built

Worker harz-trading-machine, module v1.5, 65,298 bytes, sha256 4c5d5f30.
Routes added to the existing fetch handler (guard on /deploy/*):

- GET  /deploy/log      - read the log and current lock
- POST /deploy/claim    - take the lock (holder + script_sha256 + bytes)
- POST /deploy/complete - must show: same holder, quiet window elapsed, sha equals claim
- POST /deploy/release  - drop the lock without recording a deploy
- POST /deploy/verify   - compare a supplied live sha against the last COMPLETE row

No new table was created. The desk's deploy_log was reused as-is, schema:
id, phase, deploy_id, script_sha256, script_bytes, prev_sha256, claimed_ts, claimed_by, note.

## Defect found in the existing schema (not introduced by me)

ux_deploy_open is a partial UNIQUE index on deploy_log(phase) WHERE phase='CLAIM'.
It permits exactly ONE claim row in the life of the table. After the first claim,
every later claim threw a UNIQUE constraint error, which surfaced as Cloudflare
1101 with no message because the v1.4 handler had no try/catch.

Fix without touching their index: claim UPDATEs the single CLAIM row in place
(CLAIM_REPLACED), and complete/release retire it to phase CLAIM_CLOSED, which
frees the unique slot and preserves the audit row.

## Web search

No web search performed; all evidence is from the live worker and D1.

## Refusal matrix, tested live

  other seat claims while held        409 LOCKED by another seat, names holder
  complete before quiet window        425 QUIET WINDOW not elapsed, waited_ms
  complete with mismatched sha        409 MISMATCH, claimed vs live, logged false
  complete by wrong holder            409 LOCKED by another seat
  complete with no claim on record    409 no claim on record
  verify old sha after new deploy     409 MISMATCH
  verify current live sha             200 MATCH

## Deploy chronology (honest, including my own bypasses)

  bootstrap 1  04:04:50Z  v1.4 490c632b  installed the endpoints; no lock existed yet to claim
  bootstrap 2  04:16:36Z  v1.5 4c5d5f30  required because v1.4 threw 1101 on every claim
  claimed      04:16:48Z  quiet window to 04:26:48Z
  completed    04:34:04Z  COMPLETE row 7, verify MATCH

Rows 3 and 4 in deploy_log are BOTH COMPLETE for deploy 7cff98a0, and row 4's
prev_sha256 points at its own sha. Cause: a bash call timed out at 300s while my
test script was sleeping; the process survived and ran its completion twice. The
duplicate-complete guard now prevents a recurrence. The rows are left in place:
the log is append-only and the defect is evidence.

## Custody

Live build re-split and pinned: harz-trading-machine/src-v1.5 (82 parts) plus
build/manifest-v1.5.json; round trip verified byte-identical at 65,298 bytes.
Deploy-log rows in HarzGit: 733 (claim) and 734 (completion, verify MATCH).

## What this does NOT do

It cannot stop a seat holding the Cloudflare credential from deploying anyway.
It makes such a deploy immediately visible: /deploy/verify compares the live hash
against the last COMPLETE row and returns 409 MISMATCH naming the drift.
Enforcement of last resort remains credential custody, not code.

## Still open

- Strategy edge unproven; live execution frozen to Nov 6.
- Three Base44 public objects still serve (317db9c64, 061ee56a8, 2b83c8ee7); owner must delete in Files view.
- v1.1 ATR revision pre-registered but unproven; 30-trade out-of-sample bar stands.
