# TEAM C — ACQUISITION BATCH 1 STATUS (Dad's 'And 1' approval, Oct 11)

Law: recommend before download; byte-verify at acquisition; batch holds if it breaks the 2.2GB ceiling.

## OCT 12 (02:15 WAT) UPDATE — BATCH 1 SOURCES COMPLETE, PUSH PENDING WAVE_KEY

Late-night resolution wins (receipt row-122): OpenStax slug law cracked (drop 'of'; accounting = principles-financial-accounting/-managerial; Concepts-Biology hyphen) — 20/20 books staged. devdocs reachable: 12 packs, 6,028 docs. SE at 19 books incl. Plato Republic (via Dialogues/Jowett).

FINAL: 84,935 docs / 112.2MiB text — GeoNames 76,332 | OpenStax 3,612 | SE 624 | DevDocs 6,028. All license-labeled. Zero live-corpus writes. OSM pbf 710MB sha256-verified, held out of D1.

Older table (superseded):

Acquired, byte-verified, transformed, and staged (receipt row-121):

| Source | Acquired | Corpus docs | Text bytes | License label |
| OSM Nigeria pbf | 710,100,878 B, sha256 f49bd5c7... | 0 (binary, held OUT of D1) | n/a | ODbL |
| GeoNames NG | 1,957,738 B zip, 76,332 records | 76,332 | 23.7 MB | geonames-ccby-4.0 |
| OpenStax (15 books) | 1,531 MiB PDFs, 13,368 pages | 2,419 | 31.5 MB | openstax-ccby-4.0 |
| Standard Ebooks (16 books) | 16 epubs | 425 | 11.4 MB | standardebooks-cc0 |
| TOTAL | ~2.4GB source footprint | 79,205 | 61.5 MiB | fits 9.5GB ceiling and 2.2GB headroom |

Resolution laws learned: OpenStax assets are STABLE UNSIGNED URLs (slug_-_WEB.pdf and Title_Case variants) — corrects the 'signed links' note; Standard Ebooks downloads require ?source=download + Referer (interstitial); devdocs HTTP 000 from sandbox tonight.

## PENDING (batch 1b)
1. OpenStax accounting v1+v2, economics 3e, finance, concepts-of-biology (SPA hides asset URLs)
2. SE render-misses: plato/republic, seneca/letters, mill/utilitarianism, paine/common-sense, lao-tzu, plutarch, carnegie, hill
3. MedlinePlus (per capacity ruling)

## BLOCKER (single)
Push via ingest-wave requires WAVE_KEY value from Dad. Local copy lost to sandbox reset Oct 11; rotation rejected (breaks offline-browser secret + Node 1 Termux export). push-batch1.py is resumable and ready in batch1-staging/.
