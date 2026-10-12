# BATCH 2 RECEIPT — 2026-10-12 (corpus growth, R2 ruled out by owner)

Owner ruling recorded 02:21 WAT: "Go on first and don't try r2" — R2 ruled OUT for corpus
growth. All growth stays inside the D1 9.5GB cap; at the cap boundary growth stops unless
the owner rules otherwise.

## Ingested (verified by D1 count queries after run)

| Source | Docs | Bytes | License | Verification |
|---|---|---|---|---|
| Constitution of Nigeria 1999 (as amended), via Wikisource full-text extract | 10 | ~0.4MB | Public domain (federal law) | COUNT + SUM(size) D1 query; 10 parts, 383,603 chars; split at ~45KB paragraph boundaries |
| WHO Model List of Essential Medicines 2023 (23rd list, EML/2023.02, iris.who.int bitstream 289a875c...) | 4 | ~0.2MB | CC BY-NC-SA 3.0 IGO (stated in doc text) | 71-page PDF sha256 9617e1dee5f9772e, pypdf extraction, 4 parts, 164,401 chars |
| OpenStreetMap Nigeria (geofabrik pbf, transform executed) | 38,548 | ~5.7MB | ODbL 1.0 (attribution in every doc) | Survey pass + extraction pass + ingest; see reconciliation below |

## OSM transform reconciliation (the honest numbers)

* Survey: 22,898 named places (16,389 villages, 4,053 hamlets, 876 towns, 76 cities, 35 states), 10,477 major named roads (motorway-tertiary), 2,009 named waterways, 12,518 named amenities.
* Extracted docs: 47,902 (places with lat/lon, amenities with lat/lon, roads with class+ref, waterways; ODbL attribution string in every doc).
* Unique docs in D1: 38,548. The 9,354 difference is exact-duplicate collapse by the
  content_hash/norm_hash dedupe law — primarily repeated way segments of the same named
  river/road with identical rendered text. Dedupe working as designed, not loss: no
  distinct text was dropped. (Roads/waterways carry no coordinates in text by design,
  since way geometry requires a node index that OOMs the sandbox at this pbf size.)
* Resumability re-proven: run was interrupted once mid-ingest (tool timeout), rerun
  completed with INSERT OR IGNORE idempotency — zero duplicate rows introduced.

## Honest defers (verified dead ends, not failures of effort)

1. OpenStax direct download: details pages are a JS SPA; the "Download a PDF" href is a
   client route (/books/<slug>/pages/<slug>.pdf) that SPA-intercepts and 404s via plain
   HTTP. Internet Archive temporarily offline tonight; archive.cnx.org unreachable from
   sandbox (code 000, same family as devdocs). OpenStax books verified CC BY-NC-SA 4.0 on
   the live details page — corrects the earlier CC-BY catalog assumption. SUPERSEDED by
   Team C's staged batch (row-121/122): OpenStax 20/20 books resolved via the
   stable-unsigned-URL law; ingest of staged docs is the follow-up.
2. NigeriaLII acts digest: nigerialii.org IS reachable (200) but its legislation library is
   EMPTY — "/legislation/all" returns "0 documents" server-side AND in a live JS browser.
   Site currently hosts only judgments/gazettes. The 8MB acts estimate from the reconciled
   batch is unobtainable from this source. Alternative: laws.africa API (requires an API
   key — owner credential) or NASS/PLAC portals (follow-up design task).
3. devdocs (carried over): unreachable from sandbox via default route; Team C row-122
   reports DevDocs 12 packs 6,028 docs staged with UA required — re-verify via their staged batch.
4. MedlinePlus 0.25GB (batch 2 planned): no prebuilt ZIM; curated NLM export requires a
   designed scraper (~1,000 topic pages). Not started tonight — next queue item after the
   staged batch ingest.
5. Wiktionary 50K pack: needs dump-based extraction design; deferred.

## Corpus state after batch 2

1,181,232 docs / 7.287GB content under the 9.5GB cap (~2.2GB headroom, unchanged material).
Batch 2 additions total ~6.3MB / 38,562 docs.

## Standing laws honored

Dedupe-before-write (intra-batch collapse disclosed above), 9.5GB cap guard with 0.2GB
margin, zero-budget (only unsigned/freely-reachable sources), frozen systems untouched
(sealed 5K, p4, KV, FX all intact; D1 writes only into `docs`).
