# MISSION 001 — RECOMMENDATION 1 & 2 EXECUTED
## D1 Row Audit + Gather-Queue Eligibility Gate (2026-10-11)

Owner's authorization: "Both" — D1 audit first, queue gate before the
next wave. Executed read-then-write: all audits ran before any change.

## PART 1 — D1 ROW AUDIT: 42,622 vs 11,365 RESOLVED

Finding: there is NO discrepancy. Two DIFFERENT D1 databases share the
name "harz_search_v02" on two different Cloudflare accounts, each
holding a DISJOINT corpus:

Store | Account | Docs | Unique URLs | Unique content_hash | Profile
harz_search_v02 (big node) | a2 (c0bea6) | 42,622 | 42,622 | 42,622 | Nigeria news + Wikipedia (source of the 5K core)
harz_search_v02 (live index) | a1 (5ab947) | 11,365 | 11,365 | 11,365 | corpus-hunting waves (tech docs, gov, reference)

Evidence:
1. Zero URL overlap: 300 random live-index URLs tested against the big
   node — 0 hits.
2. Zero duplicate content_hash inside each store.
3. Domain profiles are disjoint: big node = en.wikipedia.org 11,069,
   businessday.ng 4,577, nairametrics 3,383; live index = mozilla.org,
   kernel.org, postgresql.org, sec.gov.ng, nafdac.gov.ng.
4. The E1 manifest's "42,622" is the big node; the live /stats
   "11,365" is the a1 index. Both numbers were always true.

Additional hard findings:
1. Snippet ceiling is 2,000 chars in BOTH stores. The big node averages
   1,850 chars (min 333); the live index averages 1,371 with 46 docs
   under 100 chars. Full text exists NOWHERE. Confirms Assessment V1:
   full-text extraction is a Stage-1 requirement, not an option.
2. Operational risk flagged: identical database names across two
   accounts invite future confusion. Any stage design MUST reference
   stores by account ID + DB UUID, not by name.
3. True unique document total across both search stores: 53,987
   (42,622 + 11,365, disjoint).

## PART 2 — GATHER-QUEUE ELIGIBILITY GATE: DEPLOYED

Worker: harz-offline-browser (a2), binding HARZ_BROWSER preserved
(verified via safe-deploy, 3x HTTP 200).

Gate design (corpus-eligibility-v1):
1. Auto-allow: .edu/.gov/.ac suffixed domains + known library/reference
   roots (europeana, gutenberg, archive, wikisource, etc.).
2. Rule-based rejection with reason: test/example, internal .harz,
   search-engine portals, CDN/ad-tech/tracking infra, adult,
   piracy/streaming/gaming-spam, gambling, retail/booking/transactional,
   paywalled copyright-sensitive (chegg), mining/crypto infra,
   content farms/blog hosts, brand/infra/low-value corporate,
   high-abuse TLDs (tk pw club fit futbol xyz top click gq cf ml work
   live gg tv store trade).
3. Default-allow for everything unmatched (conservative V1 — no
   whitelist-only gate that would break agent hunting).
4. Every rejection logged to KV key gather-gate-log (last 200, with
   domain, reason, timestamp) — auditable record.

Honest incident disclosure: the first deployed version threw HTTP 500
on every enqueue. Root cause: the gate call was inserted between a
braceless `if` and its `return`, making it the if-body, so the gate
variable was undefined for normal domains. The reader, queue read, and
all other surfaces were unaffected. Fixed (gate call re-anchored after
the private-host return), full local mock-KV regression 9/9 passed,
redeployed, and verified live: junk -> 403 with reason, eligible ->
queued, sealed-source and idempotent paths intact, reader seal
unchanged (8344922-a44ceec55e61f3a4).

## PART 3 — STANDING QUEUE CLEANED (reversible)

Pre-clean queue: 153 domains (measured; the earlier "237" figure was
stale).
Classification: 22 keep / 131 drop.
Dropped categories: 14 Google ccTLD portals, 11 awsdns/DNS entries,
piracy (vegamovies.futbol, movieffm.net, napthe.vn), adult
(arabshentai.com, lovense-api.com), ad-tech (adsappier, snigelweb,
decibelinsight, mediav, rokt-api, pem-teads), CDNs (gtimg, bdstatic,
sinajs, yusercontent), streaming (vudu), retail (ray-ban, shopcider,
bestwestern, thomann, leroymerlin, amazon.cn), gambling-adjacent,
high-abuse TLDs, test domains, and observed-junk one-offs (bc0a.com,
mczbf.com, five64dmv.com, etc.).

Kept 22: tnebnet.org, kvs.gov.in, upbhulekh.gov.in, baike.com,
savvasrealize.com, muckrack.com, weatherspark.com, heritage.org,
latrobe.edu.au, globalsources.com, belta.by, sme.sk, okstate.edu,
pearltrees.com, dowjones.io, ns.gov, bellybelly.com.au, mq.edu.au,
tyc.edu.tw, europeana.eu, builtin.com, pitchbook.com

Reversibility:
1. Original 153-domain list preserved in KV key
   gather-queue-backup-20261011 (verified readback: 153 domains).
2. Full pre-clean queue response also archived at
   /tmp/ob-worker/queue-backup.json (conversation workspace).
3. Live queue verified via worker readback: 22 domains exactly.

## STATUS

1. D1 audit: RESOLVED (no missing rows; two disjoint stores).
2. Eligibility gate: DEPLOYED and live at enqueue time.
3. Standing queue: CLEANED before the next wave, backup restorable.
4. Next Mission 001 items (each needs its own authorization): full-text
   extraction design (retire the 2,000-char snippet ceiling), and the
   instrumented 100K Wikipedia-XML pilot as the Stage-1 feasibility
   proof.
