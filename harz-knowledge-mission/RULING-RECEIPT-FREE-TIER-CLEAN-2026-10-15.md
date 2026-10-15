# RULING RECEIPT — FREE TIER CLEAN (owner, Oct 15, ~12:2x WAT)
Owner: "Free tier clean."
=> ACCOUNT TARGET: zero billing; all usage within free tiers.
=> R2 is OFF (activation requires billing on file; declined).
=> D1 must come down to <= 5GB TOTAL (free tier limit).
Current measured D1 total: 17.44GB. Reduction of ~12.5GB required.
Composition:
- harz-million-corpus master (metadata, 1,342,482 docs): 3.85GB
- harz-corpus-bodies-db (FULL TEXT of the corpus): 9.04GB
- harz-fx-idx (search index, contentless FTS5): 0.99GB
- legacy/mining DBs (harz-mine x5, harz-mine-7, etc.): ~3.4GB
- misc small DBs: ~0.2GB
HARD MATH: even deleting ALL legacy DBs + index, master alone (3.85GB)
+ index (0.99GB) = 4.84GB — at the free ceiling with ZERO full text.
Free-tier-clean CANNOT retain the corpus full text at current scale.
=> A curated reduction is the only path that keeps a real, searchable,
free corpus. MITIGATING FACT: the bulk of deletable text (Wikipedia,
Gutenberg, GeoNames, OSM) is re-fetchable from public dumps at any
time — curation deletes re-obtainable data, not unique sovereign data.
Unique content (659 gov.ng docs, hunted Nigerian sources, the sealed
5K core, seals) all stay.
NOTHING DELETED YET. Two items requested from the owner:
1. Check dash.cloudflare.com -> Billing and report the truth (API shows
   "Workers Paid — state: Expired" yet D1 writes beyond free limits
   succeeded this morning; either the view is stale and he IS being
   billed ~$9.3/mo, or the plan lapsed and enforcement is pending).
2. Authorize the curation DRAFT: this seat will produce the exact
   keep/delete list (doc counts, sources, byte budget per source) for
   his approval BEFORE any deletion. No deletion without that approval.
Options on the table: A curated free corpus (recommended), B index-only
corpus (all bodies deleted, search finds titles only), C stay capped
(not free-tier-clean).
