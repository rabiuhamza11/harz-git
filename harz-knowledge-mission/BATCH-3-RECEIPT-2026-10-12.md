# BATCH 3 RECEIPT — 2026-10-12 (owner: "Go on" / "Keep working non stop")

Batch 3 = the OpenStax full library + DevDocs packs + Standard Ebooks classics + Gutenberg
verification. All growth inside the D1 9.5GB cap per the Oct 12 ruling (no R2).

## 1. OpenStax full library — 74 books, 3,857 docs ingested

* Source of record: OpenStax CMS API (openstax.org/apps/cms/api/v2/pages?type=books.Book),
  which exposes live pdf_url + license_name per book. 84 live English books found; 74 with
  clear licenses ingested (70 CC BY-NC-SA 4.0, 4 CC BY 4.0). 10 books with no license
  metadata (Spanish translations) were honestly SKIPPED.
* One Spanish book (Física universitaria volumen 1, CC BY 4.0) passed the locale filter
  because its CMS locale field says 'en' — kept, correctly license-labeled.
* 68,078 PDF pages extracted with PyMuPDF (page markers preserved), chunked at ~42KB with
  per-part headers carrying title, publisher (Rice University), license, and part number.
* Source PDFs: 7,387MB downloaded, sha256'd per book (manifest.json); text in D1 is ~157MB.
* Honors the Team C slug law indirectly: CMS API supersedes slug-guessing entirely (cleaner
  resolution than the stable-unsigned-URL pattern, same assets.openstax.org files).

## 2. DevDocs 12 packs — 17,045 docs ingested

Packs: html, css, javascript, dom, http, node, git, bash, typescript, express, c, cpp
(documents.devdocs.io index.json + db.json, UA required — the Team C law, confirmed live).
python and postgresql packs returned 403 tonight — honest misses, retry later.
Dedupe caught prior-wave overlap (typescript +2 of 79, express +1 of 24 — most of those
packs were already in the corpus from another wave; c +633, cpp +5,617 fresh).

## 3. Standard Ebooks — 19 books, 262 docs ingested

19 of 26 candidates resolved (epub law confirmed: ?source=download + Referer).
7 misses (huckberry-finn slug, verne, plato, lao-tzu, paine, seneca, douglass) overlap with
Team C's recorded render-misses — resolved instead via Gutenberg (below).

## 4. Gutenberg reconciliation — 1 doc inserted, 68 deduped honestly

The 7 missed classics were fetched from Project Gutenberg (all PD). The dedupe law rejected
68 of 69 parts: a prior wave had ALREADY ingested 163,003 gutenberg-public-domain docs,
including all these titles. Verified live in D1 (Huckleberry Finn, Douglass, etc. present).
This is dedupe working as designed, not a failed run — no duplicates written.

## Batch 3 totals

21,165 new docs (3,857 + 17,045 + 262 + 1). Content added ~171MB.
Concurrent waves from the corpus-hunting mandate were also writing during this run, so
absolute D1 totals are shared corpus state, not batch 3 alone.

## Standing laws honored

Dedupe-before-write (INSERT OR IGNORE on content/norm/prefix hashes; all collapses
disclosed), 9.5GB cap guard (~2GB headroom remaining), zero-budget (all sources free and
directly reachable), frozen systems untouched (sealed 5K, p4, KV, FX intact).
