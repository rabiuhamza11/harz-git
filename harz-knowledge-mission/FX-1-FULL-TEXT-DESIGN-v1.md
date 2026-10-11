# FULL-TEXT EXTRACTION ENGINE — FX-1 DESIGN (DESIGN ONLY)
## Status: authorized as design (Rabiu's ruling, Oct 11, 2026). Implementation NOT authorized. 100K Wikipedia pilot NOT authorized.

Owner's ruling recorded verbatim in intent: proceed with full-text
extraction design first; each stage retains its own authorization gate;
no live changes from this assessment.

---

## PART 0 — FOLLOW-UP AUDITS PERFORMED (read-only, no live changes)

### 0a. Gate bypass probe battery (9 probes, live)

Result: 7/9 correctly rejected. TWO findings:

F-B1 (CONFIRMED BYPASS): "www.googleoptimize.com" was ACCEPTED and
queued. Root cause: prefix-anchored rules (^google, ^hao123,
^duckduckgo) do not match after a www. or subdomain label. Any junk
domain can evade prefix rules by prepending a label. Probe residue was
removed immediately and the queue restored to the clean 22 (verified
live: 22). No unauthorized domain remains queued.

F-B2 (V1 KNOWN LIMITATION, not new): "evil.com" passed as default-allow.
V1 is a category-rejection gate, not an allowlist; unknown junk passes.
Residue also removed.

GATE-V2 PROPOSAL (NOT deployed, needs its own authorization): (1)
normalize the domain (strip www., lowercase) BEFORE the gate; (2) match
rules against every dot-separated label AND the registrable domain, not
just the string prefix; (3) keep the rejection log. Estimated change:
small, but it is a live change and stays unauthorized until ruled on.

Rejected correctly: case variants, protocol+path variants, subdomains of
known-bad domains (watch.vegamovies.futbol, m.arabshentai.com,
gov.vegamovies.futbol, sub.movieffm.net), path-suffix content.

### 0b. Provenance check of the 22 kept queue sources (live, read-only)

Each kept source was probed for DNS resolution, HTTP status, and title.

4 do not resolve from this environment: tnebnet.org, dowjones.io,
ns.gov, tyc.edu.tw (dead, geo-blocked, or nonexistent — likely
unusable as acquisition targets).
9 sit behind anti-bot walls (Cloudflare challenge etc.): muckrack.com,
heritage.org, okstate.edu, mq.edu.au, europeana.eu, pitchbook.com,
sme.sk, bellybelly.com.au, baike.com (403), globalsources.com (429).
The nightly wave's fetcher will likely receive challenge pages, not
content, unless it can pass those walls (it currently does not).
3 responded healthily: upbhulekh.gov.in (200), weatherspark.com (202),
belta.by (200). savvasrealize.com responded 200 (login-walled
education portal; content likely behind auth).
2 redirect (latrobe.edu.au, pearltrees.com). 1 responded 200 but the
title reveals it is a JOB BOARD: builtin.com — my V1 allowlist treated
it as a tech-content site; the live site is recruiting listings. This
is a content-quality miss, disclosed.
2 anti-bot-walled (muckrack, heritage) overlap the above.

Honest conclusion: of the 22, only 3-4 are realistically gatherable as
public knowledge text (upbhulekh.gov.in, weatherspark.com, belta.by,
and possibly latrobe.edu.au after redirect). The queue cleanup
reduced junk correctly, but the KEPT set still fails Rabiu's
acquisition-basis bar for most entries. NO further queue change was
made — that ruling belongs to Rabiu. The wave may claim these domains
and will mostly get challenge pages; that is harmless but wasted
acquisition budget.

---

## PART 1 — FX-1 DESIGN: SIX REQUIREMENTS

### Requirement 1 — Source preservation

Every extracted document carries forward ALL existing evidence and adds
new provenance: original URL (unchanged), domain, redirect_chain
(already in schema), original fetched_at, the original snippet and its
content_hash (cross-referenced, never overwritten), plus new fields:
extraction_fetched_at, extraction_url (if URL moved), robots_status,
license_note. The existing accepted corpus is never modified in place;
FX writes to a parallel store keyed by source_doc_id.

### Requirement 2 — Full-text extraction

Pipeline (sovereignty: our own extractor code, no third-party reading
service):
S1 FETCH: follow redirects, record full chain, capture raw HTML, byte
count, final status code, content-type.
S2 PERMISSION: respect robots.txt (fetch and honor per-path), meta
robots noarchive/noindex, and login/paywall detection. "Where
permitted" is enforced, not assumed.
S3 PAGINATION: follow rel="next"/canonical page chains and numbered
page links up to a configurable cap (default 10 pages); record every
page fetched in the extraction log.
S4 EXTRACTION: own readability pass — strip script/style/nav/aside/
footer/boilerplate, density-score candidate blocks, preserve headings,
lists, tables as text. Versioned (extractor_version) so results are
reproducible.
S5 NORMALIZE: NFC, whitespace collapse, image/link URLs absolutized
for attribution.
S6 CLASSIFY + STORE: status taxonomy below, sha256 of full text,
lengths, page count.

Per-document full-text cap: proposed 512 KB (open decision D-1). Over
cap → status=truncated with the truncation point recorded, never a
silent cut.

### Requirement 3 — Integrity

full_text_sha256 recorded for every extraction; extraction_result JSON
(per-stage timings, byte counts, page list) stored with the doc; prior
versions kept as a hash chain (prior_version_sha). A verification step
recomputes the hash from stored bytes on read of a random sample
(pilot: 5% or 50 docs, whichever is smaller).

### Requirement 4 — Completeness taxonomy

Exactly six statuses, recorded per document, queryable:
1. complete — full readable text captured, no caps hit, no pagination
   remains.
2. truncated — cap or pagination limit hit; truncation point recorded.
3. failed_fetch — DNS/HTTP/timeout error; error code recorded.
4. failed_extract — HTML retrieved but extraction below 500 readable
   chars.
5. unsupported — paywall, login wall, bot challenge, binary/PDF
   (V1), or JS-only rendering (V1 limitation; no headless browser on
   Workers — honest, disclosed, not papered over).
6. unchanged — re-extraction hash equals prior; no new version stored,
   last_verified_at updated.

Nothing is ever reported as complete without the extractor asserting
all caps passed.

### Requirement 5 — Search integration (no silent replacement)

New D1 store: harz-fx-v1 (name reserved; referenced by account ID +
DB UUID per the collision rule — the name alone is never again
sufficient identity). Contains: docs_fx table (Requirement 1+3 fields),
FTS5 virtual table over full_text, versions table.
The existing search index and the accepted 5K core are untouched.
Search serving becomes tiered: tier-0 = existing snippet index
(unchanged behavior); tier-1 = FX full text, OPT-IN per query, results
labeled with extraction status. Replacing snippet results for a source
with full-text results requires a per-source authorization record.
FTS5 is the accepted engine per ruling 2940dd5; KV remains the
protected offline fallback.

### Requirement 6 — Recovery and verification

Extraction is repeatable: pipeline is deterministic given
(extractor_version, URL, robots policy). Prior versions preserved
(never overwritten; version chain per Requirement 3). Verification is
through the ACTUAL interfaces, not internal calls only: the offline
reader must open extracted documents offline, and the search interface
must return full-text results with their labels. Acceptance includes a
browser-executed test with screenshots.

---

## PART 2 — ACCEPTANCE BATTERY (must pass before any scale-up)

A-1 Long documents: 10 articles over 50K chars (e.g., long Wikipedia
entries) — complete, no truncation.
A-2 Pagination: 5 multi-page documents — all pages followed, page list
recorded, complete.
A-3 Dynamic pages: 5 JS-rendered pages — expected result: status=
unsupported with reason. PASS = correct labeling, not extraction.
A-4 Malformed HTML: 10 broken/malformed pages — extractor degrades
gracefully (complete/failed_extract), never crashes the run.
A-5 Extraction failures: 10 dead/erroring URLs — failed_fetch with
error codes.
A-6 Duplicate content: 5 pairs of same-content different-URL — hash
dedupe, single canonical, cross-ref recorded.
A-7 Changed pages: 5 previously acquired pages, edited upstream — new
version stored, prior version preserved, diff recorded.
A-8 Browser verification: full battery re-verified in the actual
reader + search UI offline and online.

## PART 3 — MEASUREMENTS before large-scale strategy selection

M-1 Storage growth: bytes/doc full text vs snippet (expected 5-15x);
D1 DB size after battery; FTS5 index overhead ratio.
M-2 Throughput: docs/hour end-to-end in the 3h wave window; per-stage
time; failure mix by category.
M-3 Cost: D1 rows read/written per document; Workers CPU-ms per
document.
M-4 Quality: extraction success rate by domain class; readability
sample (10 docs human-checked by Rabiu per GAP-4 rule — no agent
acceptance).

Decision point: only after M1-M4 does the 100K strategy get selected
(D1-only vs D1+R2), and only with Rabiu's explicit authorization.

## PART 4 — 100K WIKIPEDIA PILOT (PARKED, NOT AUTHORIZED)

Recorded for later, per Rabiu's own measurement list: unique documents
successfully acquired; full-text extraction success rate; duplicate and
unusable content; coverage across subjects and languages; search
relevance before/after; storage consumption and indexing performance;
offline usability; licensing and attribution compliance. Target: 100K
documents PROCESSED under explicit acceptance criteria, not 100K
queued URLs. The pilot does not begin until this design is reviewed
and authorized, and each measurement above has a pre-registered
pass/fail line.

## PART 5 — OPEN DECISIONS FOR RABIU

D-1 Per-document full-text cap (proposed 512 KB).
D-2 Dynamic-page strategy: accept unsupported in V1, or invest in
browser-side capture later.
D-3 R2 enablement or formal waiver (still unmeasured).
D-4 Gate-v2 deployment authorization (fixes F-B1; also strip www.
before gate and match per-label).
D-5 The 22 kept sources: drop the unreachable/bot-walled/job-board
entries (my evidence-based recommendation: keep only upbhulekh.gov.in,
weatherspark.com, belta.by, latrobe.edu.au) or let the wave try them
and record failures.
D-6 Robots.txt policy ratification (proposed: honored strictly,
disallow = unsupported with reason).

No implementation of FX-1 begins without a separate authorization
covering Part 2's battery scope.
