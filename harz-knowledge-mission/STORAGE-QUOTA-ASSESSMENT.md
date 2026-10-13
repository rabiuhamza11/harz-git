# D1 STORAGE-QUOTA ASSESSMENT (Ruling 002 requirement; official docs, Apr 21 2026 edition)

## The owner's five questions, answered

1. WHAT DO THE FIGURES REPRESENT? Cloudflare meters D1 storage as the
   database file size (API field file_size), the sum of all databases in the
   ACCOUNT, with "tables and indexes both counting". It is allocated storage
   (includes SQLite free pages not yet vacuumed).
   - harz-million-corpus: 3.84 GB (post-migration; includes free pages from
     the emptied text columns — a VACUUM may reclaim an estimated ~1-2 GB;
     VACUUM is a write operation: NOT executed, requires owner approval).
   - harz-corpus-bodies-db: 8.78 GB (live text, 7.65 GB content + overhead).
   - harz-fx-idx: 0.99 GB (contentless FTS5 index; ~13% of text size).

2. SAME QUOTA AND BILLING BOUNDARY? YES — storage is billed on the SUM of
   all databases in the account. Workers Paid: first 5 GB/month included,
   then $0.75/GB-month. There is no per-database storage allowance; the
   10 GB per-database HARD SIZE LIMIT is separate (each of our three is
   below it; a database that reaches 10 GB stops accepting writes).

3. REPLICAS: read replication (beta) bills no extra storage for replicas;
   usage billing stays row-based. We run no replicas. Not a factor.

4. GROWTH PROJECTION as corpus expands (measured ratios from the real build):
   - bodies: ~1.0-1.15x text bytes (7.65 GB per current corpus).
   - FX index: ~0.13x text bytes (0.99 / 7.65 measured).
   - metadata/docs table: ~0.25x text bytes (1.9 GB for 7.65 GB text).
   TOTAL FOOTPRINT = ~1.4x corpus text. The 1B-doc target at ~5.75 KB avg
   text/doc (current corpus average) would be ~5.75 TB — EXCEEDS D1's 10
   GB/database hard limit by ~500x. D1 alone cannot host the 1B target; that
   is the strategic storage decision the owner will eventually rule on
   (R2 remains ruled out for now; sharded D1 was the prior default).

5. DUAL REPRESENTATION DURING MIGRATION: any future migration briefly holds
   both old and new representations (~2x transient) — with the current
   corpus that is ~15-16 GB transient total. Must be planned in the budget.

## CURRENT ACCOUNT FOOTPRINT (all 40+ DBs)
Corpus stack (13.61 GB) + remaining account DBs (~7-8 GB estimated from the
Oct 12 listing) ~= 21+ GB total, i.e. ~$12/month D1 storage at $0.75/GB-mo
over the included 5 GB (rough estimate; dashboard is authoritative).

## ANSWER TO THE RULING'S CORE QUESTION
The original 9.55 GB figure was ONE database (per-DB file_size basis, and its
10 GB hard limit was the binding constraint). That problem IS now relieved
(main corpus 3.84 GB). But the account-total billing basis now meters
13.61 GB across the three corpus-stack databases. The 9.5 GB owner cap, as
originally set, referenced the single corpus DB. Whether the owner now
wants a cap on (a) main corpus DB, (b) corpus stack total, or (c) account
D1 total — is HIS policy ruling to set. No ingestion until he does.
