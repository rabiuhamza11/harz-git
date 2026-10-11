# FX-1 IMPLEMENTATION — DEPLOYED (under Rabiu's "Go", Oct 11, 2026)
## New isolated service. Existing corpus/search/reader untouched. 100K pilot still NOT authorized.

## Interpretation of authorization (disclosed)

Rabiu's last stage message ended with the open decisions D-1..D-6 and
"one word and the next stage moves." His reply was "Go." Executed as:
proceed with the staged FX-1 implementation, gate-v2, and the
evidence-based queue recommendation, accepting the PROPOSED defaults
where Rabiu's word ratified them (D-1 cap 512KB; D-6 robots honored
strictly; D-4 gate-v2; D-5 trim per recommendation; D-3 resolved by
constraint: D1+FTS5 was already Rabiu's ruled engine (2940dd5) and R2
remains unmeasured/unenabled, so the only deployable strategy is
chunked D1 — R2 stays parked until he enables it). The 100K Wikipedia
pilot remains NOT authorized and was NOT started.

## 1. Gate-v2 deployed (closes confirmed bypass F-B1)

harz-offline-browser redeployed via safe-deploy (HARZ_BROWSER KV
preserved, reader seal unchanged 8344922-a44ceec55e61f3a4).
Change: rejection rules now sweep ALL domain suffixes (label-wise),
so prefix-anchored rules can no longer be evaded by www./subdomain
labels. Auto-allow still tests the FULL domain only (prevents
allow-evasion via bad subdomains of good domains). Local regression
19/19 (including www.googleoptimize.com, edu.googleoptimize.com,
hentai.europeana.eu, hentai.belta.by all correctly rejected; okstate/
weatherspark/belta/en.wikipedia correctly allowed).
Live probes: all bypass attempts now 403; eligible passes; queue
intact. V1's default-allow limitation for UNKNOWN junk (F-B2) stands,
disclosed — gate is category-rejection, not an allowlist.

## 2. Standing queue trimmed 22 -> 4 (D-5)

Kept only the sources the provenance check proved gatherable:
upbhulekh.gov.in, weatherspark.com, belta.by, latrobe.edu.au.
Full 22-domain list preserved in KV key gather-queue-backup-22-
20261011 (readback verified). Live queue verified: 4 domains.

## 3. FX-1 store: new D1 database

harz-fx-v1 created on a2, UUID f8ca1ce5-886a-437e-ac3f-112dabd43286
(referenced by account+UUID per collision rule). Schema: docs_fx
(all status/reason/provenance columns incl. prior_version_sha and
robots_status), chunks (64KB chunking — below D1's ~100KB statement
ceiling), fx_fts (FTS5, rowid = chunk id for direct join), indexes.

## 4. FX-1 service: harz-fx-ingest worker (fx1-js-1.0.0)

https://harz-fx-ingest.hamzarabiu390.workers.dev
Endpoints: /fx1/ingest (POST ?url=), /fx1/search (?q=, FTS5 with
snippet highlighting + doc metadata), /fx1/doc/:id (chunks rejoined),
/fx1/stats (counts by status).
First deploy: D1 binding included explicitly in metadata (new worker,
nothing to strip; safe-deploy used for all subsequent deploys and
preserved the d1 DB binding). workers.dev route was off by default
and was enabled explicitly.

## 5. Live acceptance through the actual public interface

1. Small doc (Kano): complete, 1 chunk, stored doc 1.
2. Long doc (World War II): complete, 187,074 chars -> 3 chunks;
   doc fetch rejoins 187,074 chars with head and tail intact.
3. Re-ingest same URL: unchanged (sha match, no duplicate row).
4. Dead DNS: failed_fetch RECORDED (doc 3).
5. LIVE bot wall (heritage.org): unsupported RECORDED (doc 4).
6. Search "global conflict": correct doc, 3 chunk hits, highlighted
   snippet; nonsense query returns 0.
7. Stats: 2 complete / 1 failed_fetch / 1 unsupported; 4 chunks;
   190,110 chars.

## 6. Bugs found and fixed during deploy (all disclosed)

1. Stats SQL referenced a nonexistent column (SUM(char_len) on
   chunks); fixed to SUM(LENGTH(text)); redeployed via safe-deploy.
2. Design gap: failed/unsupported extractions were not being stored
   (Requirement 3 requires recording every extraction result);
   storeFailure added and verified live — all statuses now recorded
   and queryable.

## 7. Honest limitations

A-8 full browser-UI verification: PARTIAL. The service was verified
through its actual public HTTP interface (ingest/search/doc/stats),
but there is no reader/search UI wiring for the FX tier yet — that is
the per-source tiered integration, which stays behind its own
authorization. No corpus-scale ingestion was performed (2 documents
ingested as acceptance evidence only). The 100K pilot remains parked
with pre-registered measurements.

## Rollback

harz-fx-ingest and harz-fx-v1 are additive and isolated: deleting the
worker + database removes FX-1 entirely; nothing existing was modified.
Gate-v2 rollback: previous worker-gated.js preserved at
/tmp/ob-worker/worker-gated.js (pre-v2 content in git history of this
record's commit).
