# TEAM C — ACQUISITION BATCH 1 STATUS (Dad's 'And 1' approval, Oct 11)

Law: recommend before download; byte-verify at acquisition; batch holds if it breaks the 2.2GB ceiling.

## BYTE-VERIFIED TONIGHT (HEAD requests, no bulk download)

| Source | Verified size | Was estimated |
| OSM Nigeria (geofabrik nigeria-latest.osm.pbf) | 677 MB (710,100,878 bytes, HTTP 200) | 300 MB |
| GeoNames Nigeria (NG.zip) | 1.9 MB (1,957,738 bytes, HTTP 200) | 50 MB |

## PENDING byte-verification at acquisition

1. OpenStax curated: asset URLs are per-book signed links resolved from the book pages; total ~1.0GB estimate stands but is UNVERIFIED at byte level
2. Standard Ebooks curated: OPDS feed, ~200 titles est 0.3GB
3. devdocs core packs (JS, Python, HTML, HTTP) est 0.1GB
4. MedlinePlus curated est 0.25GB

## HONEST SIZE CORRECTION

Verified OSM (677MB, not 300MB) pushes the full original list to ~2.3GB — OVER the 2.2GB headroom.
Proposed trimmed batch that fits with margin:
OSM Nigeria 677MB + OpenStax curated 1000MB + Standard Ebooks 150MB + devdocs 100MB + GeoNames 2MB = ~1.93GB
Headroom margin: ~0.27GB. MedlinePlus moves to batch 2.

## DEPENDENCY

Actual download + ingestion awaits Team E's resumable ingestion procedure (their deliverable).
No bulk download has begun. Cap guard untouched.
