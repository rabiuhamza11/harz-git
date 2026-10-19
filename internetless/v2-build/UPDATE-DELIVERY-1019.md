# PACK UPDATE DELIVERY + CROSS-DESK MERGE — Oct 19, 2026 (Nuruddeen)

## Owner device evidence
Owner's photo of the EFCC pack showed the OLD capture (Loading... spinners) — server content was fixed
but the phone served the stale immutable cache. Root cause: SW r11 cache-first-immutable; auto-heal only
fetches MISSING urls; changed pack content never re-downloads.

## Repair
- SW bumped r11 -> r12 (cache name harz-internetless-v2-r12). On next online open the new SW deletes the
  old cache and auto-heal re-downloads all packs fresh (one-time full re-sync, ~35MB+ on data — warn user).
- v2.sw KV redeployed, served no-cache; verified live.

## Cross-desk collision (auto-merge law applied)
- While fixing, another desk deployed a new SEC Nigeria pack (16.7MB, 24 pages, captured 2026-10-19) with a
  shell that REVERTED the EFCC 7-pages entry to the old label/no-pages.
- Merge executed from their current shell: EFCC pages+label restored, SEC entry preserved untouched.
  Domain count identical; no reverts of anyone's work.
- HONEST DEFECT DISCLOSURE: my first merge attempt failed on a unicode-ellipsis pattern; the same command
  uploaded a stale/empty value and briefly emptied v2.shell in KV. Detected within seconds via readback
  (0 bytes), immediately rebuilt from the held good copy (shell-current.html), re-uploaded with a size
  guard (refuse <500KB), and verified: HTTP 200, 577,807B served, EFCC + SEC + 94 pack pages count live.
  Live shell was empty for roughly 1-2 minutes. Lesson recorded: never pipe an upload of a file a prior
  step may not have written; guard every KV shell write by size + readback.

## Verified end state (fresh browser session)
- Library: 4 packs listed — EFCC 0.7MB+7 pages, CAC 5.0MB+14, NYSC 5.0MB+45, SEC 16.7MB+24.
- Sync: 1069 docs + 94 pack pages; auto-heal running (8/94 observed mid-download).
- SW: r12. EFCC pack values: home + 7 pages all 200.
- Phone proof pending (owner): open library online once (re-sync ~36MB), airplane, EFCC home must show
  nav bar + honest labels, zero Loading spinners.
