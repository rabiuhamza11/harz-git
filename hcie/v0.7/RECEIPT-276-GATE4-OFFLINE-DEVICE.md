# RECEIPT 276 — Gate 4 offline authoring: DEVICE-EVIDENCED

Date: 2026-10-31 ~17:09-17:11 (Aisha). Owner screenshots of /write on his own phone (Infinix hot10i, status bar 17:09, airplane icon visible).

## What the device showed, in order
1. OFFLINE entry (oldest in the log): "OFFLINE — no connection. Your text is safe on this device. It is not queued yet; queue it when you have a connection."
   -> authored with the radio off, page refused to pretend the submission reached HARZ.
2. QUEUED — NOT PUBLISHED, C-f7e8dc85ec46d9d5, sha256 f7e8dc85ec46d9d5d8930180a93ca23c0f37567fca81ca5a953593d0df77b9b6
3. Same QUEUED line repeated a second time (see defect below).
On-screen hash is identical to the server hash. The hash was computed on the phone, not by the server.

## Server side, checked not assumed
/api/hcie/queue?state=QUEUED returns exactly ONE record for that id:
  id C-f7e8dc85ec46d9d5 | author Hamza | device Infinix hot10i | integrity VERIFIED | state QUEUED | created 2026-10-31T16:06:07Z | reviewer null
/api/hcie/queue?state=PUBLISHED count = 1 (the earlier approved test contribution, not this one).
-> The phone-authored note is queued, verified, UNREVIEWED and UNPUBLISHED. No duplicate row was created by the second press.

## Gate 4 row status
 Authored offline on real hardware ............ PASS (device)
 Local hash computed on device ................ PASS (matches server byte for byte)
 Refused to claim delivery while offline ...... PASS (device)
 Queued on reconnect .......................... PASS (device)
 Still unpublished pending review ............. PASS (server)
 Server-side duplicate protection ............. PASS (one row, two presses)
 UI duplicate labelling ....................... FAIL — cosmetic (below)
 Two-phone carry of a contribution file ....... NOT TESTED (same phone used for both roles)

## Defect observed (not fixed, awaiting ruling)
The page logs "QUEUED — NOT PUBLISHED" for a repeated submission because the handler tests state before the duplicate flag,
so a second press reads as a fresh queue even though the server answered duplicate:true. The data is correct; the wording is
not. One-line ordering fix, plus a distinct "ALREADY QUEUED — no new record created" label.

## Also still open
- No review screen: approving or rejecting a queued note currently requires an API call.
- The pending text saved in localStorage on the OFFLINE press has no surfaced retry control; the owner re-typed and pressed again,
  which worked, but the stored pending copy is invisible. No auto-resend exists.
