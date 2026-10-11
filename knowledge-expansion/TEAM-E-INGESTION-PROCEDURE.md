# TEAM E — STORAGE AND INGESTION PROCEDURE v1 (Oct 12, ~00:50 WAT)

Status: DESIGN + tooling. This is the dependency named by Team C's
batch-1 status ("actual download + ingestion awaits Team E procedure").
No download begins under this document until the owner picks the batch.

## LAWS INHERITED (binding)

- 9.5GB cap; measured headroom ~2.2GB; batch holds if it breaks headroom.
- Dedupe-before-write: corpus UNIQUE laws (content_hash, norm_hash,
  prefix_hash) are the ONLY writers' guard; INSERT OR IGNORE only;
  no UPDATE of existing docs in ingestion (backup-first if ever needed).
- Recommend-before-download: owner picks batches; catalog authorizes nothing.
- Byte-verify at acquisition: every file HEAD-verified before download;
  sha256 recorded at download; size re-checked after.
- Zero-budget: only freely licensed sources; license re-verified at
  download time, recorded per-batch.
- Frozen systems untouched: kb5k, Internetless foundations, 15MB limit.

## PROCEDURE (per batch, 7 steps)

1. BATCH MANIFEST: owner-approved list -> batch-manifest.json: each item
   {name, url, license, expected_bytes (HEAD-verified), sha256 (later),
   target table, transform note}. Batch holds if sum(expected_bytes) >
   headroom - 0.2GB margin.
2. ACQUIRE (resumable): ingest-e.mjs downloads to /acquire/<batch>/,
   writes .part files renamed on completion; per-item state in
   acquire-state.json -> rerun resumes exactly where it stopped;
   sha256 computed streaming; any byte mismatch -> item marked FAILED,
   never ingested.
3. TRANSFORM: per-source converter -> doc rows {url, title, content_hash,
   norm_hash, prefix_hash, source, language, size, text}; text cap per
   doc 100KB (FX-1 chunking law for oversized docs); provenance fields
   filled at transform time.
4. PRE-FLIGHT DEDUPE: all rows hashed locally; intra-batch duplicates
   dropped; cross-corpus duplicates checked via content_hash/norm_hash
   sampling BEFORE any write (bulk check via D1 batched IN queries).
5. INGEST (idempotent): chunked INSERT OR IGNORE via the corpus ingest
   API/D1; every chunk records rows_inserted + rows_ignored; rerun of a
   chunk is safe (OR IGNORE). Meta counters updated once per batch.
6. VERIFY: batch-vs-manifest: expected items == acquired items ==
   transformed rows (inserted + rejected-with-reasons); D1 count delta
   matches sum(rows_inserted); size delta matches sum(bytes inserted);
   20-doc random sample fetched back and byte-compared.
7. RECEIPT: batch-receipt.json -> harzgit-rows/row-<n>; failures listed
   per item with reasons; storage after = measured D1 file_size.

## INTERRUPT SAFETY

acquire-state.json (per item), ingest chunks idempotent, meta counters
updated only at batch completion. A killed run resumes with zero
duplicated rows and zero partial writes.

## BATCH 1 (proposed, reconciled)

Hauwa's trimmed batch (byte-verified where marked):
OSM Nigeria 677MB* + OpenStax curated ~1000MB + Standard Ebooks 200
~150MB + devdocs core ~100MB + GeoNames NG 1.9MB* = ~1.93GB
(margin ~0.27GB under 2.2GB headroom; MedlinePlus -> batch 2)
PLUS Nuruddeen's micro-picks (all fit in margin, high usefulness/MB):
1999 Constitution 1.5MB (PD), WHO Essential Medicines 6MB (CC-BY-NC-SA
IGO), NigeriaLIA/LII acts digest 8MB (CC-BY), Python stdlib docs 10MB
(PSF), Wiktionary 50K vocab pack 12MB (CC-BY-SA) = +37.5MB.
TOTAL ~1.97GB, margin ~0.23GB.

AWAITING: owner batch pick -> acquire begins. Nothing downloaded yet.
