# RULING RECEIPT — R2 GROWTH LAYER + D1 CAP (owner, Oct 15, ~12:2x WAT)
Owner ruling (composite of options 2+3): "Open R2 and do all that will add
GB. Stay capped."
=> R2 AUTHORIZED as the corpus growth layer: ALL future storage growth
   (new bodies/full text) goes to R2. This SUPERSEDES the Oct 12 ruling
   "go on first and don't try r2" for corpus growth.
=> D1 STAYS CAPPED: corpus frozen at 1,342,482 docs; master 3.85GB /
   bodies 9.04GB. No further bodies into D1. The ingest-stop deployed
   today stays in force until the R2 path is live.
Design (staged, ready): new docs -> metadata+FTS rows in D1 master
(small, ~3KB/doc, 6GB headroom; required for search) + body blob ->
R2 object keyed content_hash. Reader: bodies D1 first, R2 fallback.
Existing reads byte-identical (additive fallback only).
BLOCKER (owner one-time action, not executable from API): R2 is not
enabled on the account — API returns error 10042 "Please enable R2
through the Cloudflare Dashboard." Owner must open
dash.cloudflare.com -> R2 -> enable (one click; free tier 10GB;
payment method required on file; no subscription fee). Until then:
bucket creation fails, CORPUS_R2 binding cannot deploy, ingest stays
stopped. Everything else is staged in this commit.
