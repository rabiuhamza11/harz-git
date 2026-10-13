# FX-2 VERIFICATION BATTERY (Oct 12, 22:10 WAT — Rabiu's 7-task battery)

STATUS (owner's exact wording adopted): FX-2: INTEGRATED; FULL CORPUS REBUILD
IN PROGRESS; FINAL ACCEPTANCE PENDING.

## Root-cause fix for rebuild stalls
Sandbox builders died at every sandbox recycle (08:00, 08:57; 13h idle until 21:48).
FIX: builder moved to the cloud — worker harz-fx-build (fxbuild-1.0.0) on a1,
bindings DB_CORPUS+DB_IDX, cron "* * * * *", same checkpoints/meta as the sandbox
builder (fully interoperable). Bounded step: 18s wall, 2MB windows, 90-param
chunked reads (D1 100-param limit found and fixed), per-window rowid guard,
D1 batch() inserts. /step and /status HTTP routes for manual driving + audits.

## Storage accounting (owner request: identify 7.6GB precisely)
- Master corpus harz-million-corpus: D1 file_size 9.55 GB (AT/ABOVE the 9.5GB
  growth cap — FLAG: no further ingestion fits without a growth ruling;
  9.55GB file = 7.64GB of stored doc text + SQLite overhead/indexes/tables).
- FX index harz-fx-idx: 0.08 GB so far; contentless FTS5 stores ONLY the inverted
  index; projected final ~3-4 GB (estimate, will be measured at completion;
  index DB is separate from the corpus, corpus remains sole text source).
- Temp build storage: sandbox /tmp only, transient, negligible.
- Corpus remains the ONLY text store; index holds no text (design verified by
  retrieval test below).

## Battery results (this pass)
1. BUILD RECONCILIATION — mid-build snapshot: 22,302 parts / 22,180 distinct
   docs / 0 duplicate rowids. Expected total 1,328,715 docs. FULL reconciliation
   (missing/unexpected/duplicate IDs) runs at build completion.
2. RESTART TEST — PASSED (controlled): rewound band2 checkpoint 907141->905341
   (1,800 already-indexed docs), re-ran step: dup_skipped=1800, parts_indexed=1400
   (new territory only), duplicates after=0, errors=0, checkpoint advanced correctly.
   Organic evidence: 15 parts written past checkpoint by the dying sandbox builder
   were correctly skipped by the guard on the next pass (0 duplicates).
3. TAIL VERIFICATION — PENDING (runs at build completion: final partial batch
   + last-doc coverage proof).
4. RETRIEVAL VERIFICATION — PASSED: doc 2774 served via /fx/doc == corpus text
   byte-identical; SHA-256 528e708f6ddf7b3f... == stored content_hash == hash of
   corpus text; size 957 == 957. Snippets and full text come from the master
   corpus, index contains no text.
5. TWO-NODE PARITY — PASSED (rebuild-underway conditions disclosed): identical
   counts, ID order and result meta on a1 vs a2 for 'kano commerce' (9/9),
   'nigeria constitution' (12/12), 'diabetes' (12/12). Both nodes serve the same
   index (a1 via service binding, a2 via public URL — the only documented
   infra difference).
6. REGRESSION — core /search byte-stable on both nodes (a1 top score 32.11,
   a2 13.96, unchanged pre/post FX-2). Pilot FX-1 verified used ONLY under
   documented fallback: during the a1 1042 loop-protection window, fallback
   fired and returned pilot results (engine string proved it); after the
   service binding fix, primary FX-2 serves all traffic.
7. OFFLINE VERIFICATION — PENDING: offline kit (KV onefile, 5K core, seals)
   untouched by FX-2 by design; no-network verification to be run on the phone
   kit before final acceptance (owner's standard: live endpoint tests alone do
   not establish offline capability).

## Incident record
Contaminated-build incident + recovery preserved in FX-2-CORPUS-WIRING.md
(shared-tmpfile collision, checkpoint corruption, full index drop, clean
rebuild, isolation safeguards). Owner directive: keep as audit evidence.

## Standing owner rulings (Oct 12, 21:48)
- Tail emission + 0x222a10: owner will NOT rule without exact proposals and
  supporting evidence. Action: prepare both decision packages with full
  on-chain evidence, present for ruling.
- 20K phone test: stays pending until precise test artifact + acceptance
  criteria exist. Action: prepare exact artifact + criteria.
- Do not declare corpus complete until: coverage, full-text availability,
  source diversity, and offline answer capability are separately measured.

---

## OCT 13, 03:55 WAT — owner conditional rulings + cloud builder corrections

OWNER RULINGS (Oct 13, 03:49): all five reported test PASSes are rulings on
reported results for the tested scenarios only, NOT independent verification;
restart-test evidence must not be generalized to every interruption/concurrency
failure without corresponding tests. Growth INGESTION FROZEN until cap/size/
headroom reconciled and FX-2 completes. Cloud builder accepted PROVISIONALLY.
Gate order fixed: A corpus reconciliation, B tail, C retrieval+parity,
D offline (incl. NEW REQUIREMENT: prove what HARZ can DO with content offline,
not just find/display it), E final acceptance on 4 separate dimensions
(coverage, full-text availability, source diversity, offline answer capability).

### DISCLOSED DEFECT: cron never registered (overnight stall)
The Oct 12 deploy response reported "1 cron trigger" from metadata triggers
field, but GET /schedules returned []. 5.5h of zero build progress overnight.
FIX: PUT /schedules with bare-array body [{"cron":"* * * * *"}] (the
{"schedules":[...]} wrapper shape returns 10026 parse error — documented).
Verified live: cron fires every minute now.

### Builder v1.1.0 (owner's 7 guarantees)
1. Durable checkpoints: D1 meta (unchanged, interoperable with v1).
2. Idempotent retries: per-window rowid-existence guard (re-proven by runs).
3. Process isolation: single worker; per-run nonce in lock.
4. Duplicate protection: guard + 0 dupes across all runs to date.
5. Failure visibility: runs table (ts, mode, wall_ms, batches, docs_done,
   parts_indexed, dup_skipped, errors, ok) + last_run meta + ok=false at >5 errors.
6. Verifiable progress: checkpoints + runs log both queryable.
7. Safe recovery: SINGLE-WRITER LOCK (owner requirement): build_lock meta key
   with 120s TTL + per-run nonce; overlapping invocations skip with reason
   "another step holds the lock"; stale lock self-expires.
Cron is NOT treated as proof of success: every run records its outcome.

### Storage reconciliation (owner question: accounting basis of the cap)
TWO bases, disclosed separately:
- TEXT basis (sum of stored document sizes): 7.650 GB / 1,328,715 docs.
  Headroom under a 9.5 GB text cap: ~1.85 GB.
- FILE basis (D1 file_size, what Cloudflare meters toward the 10 GB D1 limit):
  harz-million-corpus = 9.546 GB = ~46 MB OVER the 9.5 GB figure.
The cap has been tracked on both bases historically (batch records used text
basis headroom while noting file size). INGESTION REMAINS FROZEN per owner
ruling. The governing basis is the owner's call when ingestion resumes.
- harz-fx-idx file_size: 0.127 GB at 37,725 parts / 37,725 distinct (0 dupes).
  Interim index-to-text ratio ~55% on small docs; final projection revised to
  ~3.5-6 GB honest range, MEASURED at completion (not estimated).

### Build driving (03:55 WAT)
Cron ~4,000 docs/min, 0 errors, 0 dupes. Bands complete sequentially.
Estimated completion: several hours; runs log is the evidence.
