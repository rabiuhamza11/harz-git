# MISSION 001 — HARZ GLOBAL KNOWLEDGE EXPANSION
## Corpus Scale and Coverage Assessment V1 (2026-10-11)

Direction ESTABLISHED by owner: A (massive corpus) + B (global coverage)
+ C (sovereign distribution), with binding disciplines:
- Milestones are milestones, not achievements; nothing is claimed beyond
  measurement.
- The frozen 20K expansion stays closed without its own authorization.
- Corpus size and knowledge coverage are separate metrics; both are tracked.
- Copyright, access restrictions, licensing and source terms are respected;
  publicly accessible does not mean freely reusable.
- HARZ-generated material stays distinguishable from independently sourced
  evidence.

All measurements below are LIVE reads from the deployed stores on
2026-10-11 (read-only; nothing modified).

## 1. Exact document counts across HARZ stores (measured)

Store | Documents | Measured how
HARZ Search v0.4 production index | 11,365 | live /stats
HARZ Search D1 source node (harz_search_v02) | 42,622 rows | E1 manifest (source of the 5K core)
Knowledge Core 5K (sovereign offline pack) | 5,000 exact | shard recount + manifest seal 0a5c75d4
Offline library corpus (onefile KV) | ~24MB corpus, 107 sealed sources | prior wave records; reader live
Gather queue (next wave) | 237 domains pending | queue read today

Discrepancy disclosed: the D1 source holds 42,622 rows but the live
index exposes 11,365 documents. The difference is UNEXPLAINED — it must
be audited before any stage gate (possible: unindexed rows, partial
ingestion, historical seeds). No claim is made either way yet.

## 2. Completeness and readability (measured — CRITICAL FINDING)

Knowledge Core 5K content lengths: min 396, median 600, max 600,
avg 597 characters. The pack is built with snippet_cap 600: the
accepted core stores EXCERPTS, not complete readable text.

This is the single most important finding of the assessment. The
retrieval accuracy gate passed honestly at snippet scale, but the
owner's Mission 001 bar — "preserve complete readable text, not short
excerpts" — is NOT met by the current substrate. This does not reopen
the accepted 5K core (its gate tested what it tested); it defines the
required upgrade for any Stage 1 pipeline.

## 3. Duplicates, incomplete, unusable (measured on the 5K core)

Exact content duplicates: 3 of 5,000 (0.06%) — clean.
Near-duplicate titles: 88 of 5,000 (1.76%) — watch list, requires
cross-check against the 42,622-row D1 before Stage 1.
Queue quality risk: today's 237-domain gather queue contains a large
fraction of spam/piracy/low-value domains (observed: napthe.vn,
vegamovies, votesokeverytime.com, unlockffbeta.com and similar).
Unfiltered waves would inject exactly the search-spam class the owner
named. A domain eligibility gate is REQUIRED before the next wave.

## 4. Domains, subjects, languages (measured on the 5K core)

73 distinct source domains. Top concentration: en.wikipedia.org 1,384
docs (27.7%), businessday.ng 619, nairametrics.com 412,
dailypost.ng 367, theconversation.com 192, tribuneonlineng.com 184.
Profile: encyclopedic + Nigerian business/news. Subject and language
diversity are LOW: heavily English, heavily Nigeria-focused. Global
coverage (objective B) is currently near-zero outside this profile.

## 5. Storage and document size (measured)

Knowledge Core 5K pack: 4,751,865 bytes for 5,000 docs (~951
bytes/doc at snippet scale; full-text would be an estimated 10-40x).
Offline corpus KV: ~24MB onefile — KNOWN RISK (previously flagged): KV
value limit 25MB will be exceeded by the next full wave; chunking or
R2 migration is required regardless of Mission 001.

## 6. Ingestion throughput and cost — UNMEASURED (honestly)

Current ingestion is wave-based (nightly 03:30 WAT, 81-slot queue
cap). Throughput, cost-per-document, and full-text extraction costs at
Stage-1 scale (100K docs) have NEVER been measured. First Stage-1
design task: instrument the pipeline end-to-end and measure real
throughput on a representative collection before any authorization
request.

## 7. Search quality and latency (measured at current scale)

Live production latency today: 199-212ms end-to-end from the probe
node (matches prior cold measurements; the node proxy measured cold
114ms / warm 16ms earlier). Quality: frozen 20-case battery top-1 95%,
top-3 95%, citations 19/19 exact. Quality at 100K+ scale is UNMEASURED
— the battery must be re-frozen per stage, never reused as a claim.

## 8. Legally reusable large collections (candidate shortlist — proposal, not acquisition)

Wikipedia/XML dumps (CC BY-SA), Project Gutenberg (public domain),
PubMedCentral open access (CC), arXiv (permissive), government open
data portals, Openstreetmap-derived datasets, Stack Exchange CC dumps,
UN/World Bank open datasets. Each requires a rights review pass before
any ingest. No acquisition is authorized by this assessment.

## 9. Distribution (design direction only, nothing built)

Accepted pattern to preserve: global corpus on owned Cloudflare infra
(D1+FTS5 accepted strategy for server-side scale), sealed knowledge
packs for device offline use (phone gate thresholds frozen: install
<=15MB, RSS <=250MB, cold <=3s). At Stage 2+ the pack model needs
partial/pack-by-subject design — proposal only.

## 10. Independent verifiability (measured)

Existing seals verified today: 5K core manifest seal intact
(0a5c75d4...), search index digest exposed live (aa22a26e...).
The assessment recommends: every future stage publishes (a) corpus
count, (b) content-hash commitment, (c) recount instructions, so any
reported number can be recomputed by the owner independently.

## Assessment verdict

Current state: 5,000 verified docs in the sovereign pack; 11,365 in
the live index; 42,622 D1 rows unexplained; zero global coverage
diversity; snippet-only completeness; spam risk in the acquisition
queue; no full-text pipeline, no measured throughput, no billion-scale
design. The gap between current state and Stage 1 (100K) is an
ENGINEERING program, not a crawl.

Recommended order (each its own scope, evidence, and authorization):
1. D1 audit: explain 42,622 vs 11,365 (duplicates? partial rows?).
2. Domain eligibility gate for the gather queue (before next wave).
3. Full-text extraction upgrade design (retire snippet_cap 600).
4. Instrumented pipeline pilot on one representative collection
   (Wikipedia XML recommended: legally clean, well-structured) to
   measure real throughput, cost, dedupe rate, and retrieval quality
   at 100K scale — the Stage 1 feasibility proof.

Nothing in this assessment reopens the frozen 20K expansion, the
accepted 5K core, or any closed release.
