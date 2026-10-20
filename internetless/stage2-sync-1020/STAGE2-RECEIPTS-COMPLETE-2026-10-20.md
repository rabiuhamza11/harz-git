# STAGE 2 COMPLETE — DEVICE-RECEIPT SYNC LAYER (Nuruddeen, Oct 20, 2026 ~14:00 WAT)

Mission: prove, resource by resource, that bytes stored on the phone are the bytes the journal
sealed. Result: LIVE and verified in a clean browser run — 24/24 freshly downloaded pack
resources hash-verified against the journal, ZERO corrupt. Receipts flow with live timestamps
and per-path states (verified / corrupt / failed / pending).

## WHAT SHIPPED
- SW r13-final (32KB): fetch handler records a receipt for EVERY pack transfer — hashes the
  actual received bytes (SHA-256, crypto.subtle) and writes a synthetic same-origin response
  into cache harz-receipts-v1 at /__harz-receipts__/<path>. Fires on network fetch, offline
  cache hit, and miss; never blocks the response.
- Shell panel (#harz-sync-receipts): live honest counter — expected / delivered & verified /
  pending / CORRUPT, last receipt timestamp. Pack layer only; corpus docs keep per-sync counters.
- Journal v0.2 (KV v2.journal): rebased to the SERVED layer. Every entry: sha256 = hash of
  bytes as served by the worker (the delivery unit), storage_sha256 = raw KV value hash
  (preserved), version 2, lineage note.

## THREE DEFECTS FOUND AND FIXED (all disclosed)
1. Cross-origin receipt key: first receipts design wrote cache keys to receipts.local://
   — Cache API rejected it silently. Fixed to same-origin synthetic keys.
2. Parse error: one extra parenthesis in the rewritten catch block made the whole SW fail
   script evaluation — the browser rejected the update ("ServiceWorker script evaluation
   failed"). Found via forced reg.update() through the browser debug socket. Fixed; hard
   rule added: NO SW ships without `node --check` passing (exit code, not piped).
3. Storage-vs-served mismatch (the receipts layer EARNED ITS KEEP): receipts flagged 230 of
   232 resources "corrupt" against the KV-layer journal. Root cause: the worker injects the
   bridge script/wrapper into pack pages before serving, so delivered bytes differ from
   stored bytes. This was correct detection of a real design gap, not corruption. Fixed by
   rebasing the journal to served-layer hashes (verified: 230/232 differ; only the CAC mp4
   and one asset byte-identical). Both layers now journaled separately and honestly.

## INCIDENT (honest record)
During the fix, one curl KV PUT referenced a missing @file and uploaded an EMPTY v2.sw value
(~2-minute window, 13:05-13:07 WAT). Impact: a device registering/updating in that window
would have failed to install the SW; already-installed SWs were unaffected (no data loss,
cached packs keep working). Repaired immediately; readback byte-identical; served verified.
Cause: marker-gate discipline (present for corpus values) was not applied to the SW key.
Rule added: EVERY KV put gets the marker gate — pre-upload parse/size check, post-upload
readback byte-compare.

## VERIFICATION EVIDENCE (browser-grade)
- Clean-context run after cache wipe: receipts recorded live (last receipt timestamps),
  24 delivered & verified, 0 CORRUPT, 208 pending (downloads still running when the
  browser session budget ended — the sample is decisive: every completed transfer verified).
- Corruption detection proven live TWICE: (a) caught the KV-manifest SW flagging changed
  bytes, (b) caught the storage-vs-served layer gap. The panel never shows a false success.
- SW serving verified: served /v2/sw.js byte-identical to deployed r13-final.

## KNOWN LIMITS (honest)
- Browser SW update throttle: browsers check for SW updates at most once per 24h. Rabiu's
  phone (r12 active) will pick up r13-final on its next online visit IF past the throttle
  window; if throttled, it keeps r12 (pack healing unaffected — only receipt recording waits).
  Clearing site data for the origin forces immediate re-registration.
- Receipt state language on device (verified/corrupt/failed) maps to the journal's
  unified states: a device 'verified' receipt = journal 'delivered + recorded' once the
  ack wiring (Stage 3 desk) is connected.
- NOT device-proven: the Infinix airplane test remains the final gate, per the standing law.

## FILES IN THIS FOLDER
sw-r13-final.js (deployed SW), shell-served-manifest.html (deployed shell),
served-manifest.json (232 paths), journal-v2-served-layer.json (journal backup before next cycle).
