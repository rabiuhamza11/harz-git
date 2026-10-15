# CURATION DRAFT v1 — KEEP/DELETE LIST FOR OWNER APPROVAL
**Status: DRAFT FOR APPROVAL. NOTHING DELETED. Per ruling receipts 0e71d55/c025a20: free tier only, D1 must shrink 17.44GB -> <=5GB, curation removes re-obtainable data, not unique sovereign content, exact list before any deletion.**
**Precondition law: NO deletion happens until the evacuation copies of bodies + master are complete and verified (bodies chunked dump in progress; master export done: 705,222,539 bytes, sha256 7dcc9dd983a6858c...). Restores must be possible from the evacuation copies.**

## MEASURED COMPOSITION (docs table, 1,342,482 docs, 49 sources, Oct 15 read-only)

### PROPOSED DELETE — re-fetchable public dumps (92.1% of declared size)
| Source | Docs | Declared size | Re-fetch path |
|---|---|---|---|
| wikipedia-ccby-sa-4.0 | 887,301 | 4.802GB (61.9%) | Wikipedia dumps; the curated 5,000-doc sealed kit + reader corpus keep the sovereign selection |
| gutenberg-public-domain | 163,003 | 2.345GB (30.2%) | Gutenberg mirrors (and 2.3GB of it is public-domain classics, bulk-fetched) |
| openstax-ccbyncsa/ccby | 4,102 | 0.183GB | OpenStax CMS API (source of record, receipted) |
| geonames-ccby-4.0 | 152,664 | 0.039GB | GeoNames dumps (76,332-doc Nigeria subset retained in vault as FILE + kit) |
| devdocs-* (12 packs) | ~25,900 | ~0.09GB | DevDocs.io packs |
| wiktionary-50k, python-docs, standardebooks, medlineplus, osm-nigeria (docs copy), dump-enwiki, gutenberg-pd-us | ~77,300 | ~0.05GB | public sources; OSM pbf (677MB) stays in the vault as FILE |
| **Total delete class** | **~1,310,200 docs** | **~7.42GB declared / ~7.15GB of bodies text** | |

### PROPOSED KEEP — unique / hunted / sovereign (~0.17GB declared)
| Source | Docs | Declared size | Why keep |
|---|---|---|---|
| hunted-recrawl + hunted-stage2 | 10,545 | 0.071GB | hunted Nigerian sources — unique captures, not re-obtainable |
| web (mixed captures) | 3,480 | 0.022GB | unique web evidence incl. gov.ng 659 docs |
| cgspace-unspecified | 218 | 0.012GB | curated agriculture for Taraba personas (CGSpace API exists but these are the curated, licensed picks) |
| door-onefile-v06 + team-b-recovery | 1,090 | 0.011GB | onefile/recovery captures — unique |
| cloud-wave (incl. quarantine 12,722 class) | 13,043 | 0.091GB | DISPOSITION PENDING Decision B — quarantined rows keep quarantine in force; delete-capable rows stay pending your ruling, not this draft |
| sealed 5K core + kit texts | within above classes | — | the 5,000-doc binding verified by Team D stays intact |

## RESULTING SCALE (honest math)
- bodies text after delete class: 9.04GB -> ~1.9GB
- master docs: metadata only (~130MB live payload; 3.85GB file shrinks via REBUILD, since D1 blocks VACUUM — verified SQLITE_AUTH on PRAGMA; delete-then-rebuild is the shrink path)
- fx-idx: rebuilt from kept docs -> ~0.2-0.3GB (index is derived, rebuildable)
- Corpus stack total after curation + rebuild: ~2.3-2.5GB (vs 12.88GB now)
- Account total: corpus ~2.4GB + other 44 DBs ~3.56GB = ~5.9GB — the Sept relic databases ruling (recorded as separate owner decision) closes the remaining ~0.9GB to reach <=5GB. The sovereign vault shard (89,629 docs, ~275MB compressed, v0.2 bundles) is inside "other DBs" and stays.

## EXECUTION SEQUENCE (each gate owner-authorized, none auto-chained)
1. Evacuation copies verified (bodies dump + all-DB API exports + receipts) — IN PROGRESS
2. Owner approves THIS list (or amends it)
3. Rebuild path: new bodies-KEEP DB populated with kept hashes only; new master docs rebuilt; fx-idx rebuilt; byte-identical read regressions on kept content (5K kit, reader, FX search) per Migration Protocol v1
4. Old databases deleted ONLY after the new stack passes gates and the evacuation copies exist
5. Account total re-measured; relic-DBs ruling executes if needed to cross under 5GB

## HONEST LIMITS
1. Deleting rows does not shrink a D1 file (no VACUUM authorization in D1) — the shrink is by REBUILD, so deletion is really "rebuild-keeping", not in-place cleanup.
2. Cloudflare's free-tier enforcement timing is unknown (Workers Paid shows Expired yet over-limit writes succeeded this morning — billing ambiguity already flagged for dashboard verification by owner).
3. The quarantine 12,722 + Decision B are NOT resolved by this draft; their rows are inside cloud-wave and stay pending.
4. Wikipedia/Gutenberg deletions remove searchable full text from the live reader until re-fetch is authorized — the 5,000-doc kit and sealed core keep Nigeria/mission-critical content live; the offline reader v0.3 corpus (11,430 pages, shipped tarballs) is independent and unaffected.
