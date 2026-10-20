# PILOT RECEIPT — ALJAZEERA VISUAL CONVERSION (Oct 20, ~09:5x WAT)

Owner ruling: "Go on your path" (Path A: R2 lane for full corpus + Path B starter set now).

## What was done
1. Starter-domain corpus inventory extracted from the live shell map: businessday.ng 52, cnn.com 48, dailypost.ng 46, aljazeera.com 15 = 161 article URLs.
2. Aljazeera (smallest domain) converted END-TO-END as the pilot: 15/15 articles.
   Pipeline laws: images downscaled+embedded (cap 40/page), styles inlined, scripts stripped, navigation rewired, honest placeholders.
   Note: 2 of 48 cnn URLs are /videos/ (stream-hosted: titles+thumbnails+honest label per the video law, not full visual).
3. Uploaded: 15 KV keys (v2.pack.aljazeera.com.<slug>.html). Live-verified through the worker door.

## MEASURED PILOT MATH (real, not estimated)
- aljazeera: 10.6MB / 15 articles = 707KB per visual article (range 673-746KB, stable).
- Starter set projection: 161 docs x 707KB = ~114MB. KV currently ~70MB used; starter fits (~184MB total, under 1GB cap).
- Full directive corpus (1,064 docs) x 707KB = ~752MB. Does NOT fit KV free cap alongside existing content. Requires the R2 lane (free 10GB).

## R2 LANE STATUS
R2 not yet activated on the account: API returns "Please enable R2 through the Cloudflare Dashboard."
ONE OWNER ACTION: activate R2 in the Cloudflare dashboard (free; no card change; no paid plan needed). Then capture desk wires the bucket + pack route.

## INTEGRATION STAGED FOR CAPTURE DESK (single-writer law respected — I did NOT touch the live shell)
- aljazeera pack keys are additive and fetchable now.
- Needed from desk: PACKS entry for aljazeera.com (15 pages) OR resolver preference: corpus card for an aljazeera URL -> stored visual pack page first, live fetch second, text body third.
- Watchdog v0.9 should fingerprint the 15 aljazeera article URLs at integration.
- Per the directive's rule (d): device screenshot owed per domain at owner's next session.

## NEXT (pending owner R2 activation + desk integration)
1. cnn (48) + dailypost (46) + businessday (52) batches -> KV (~104MB projected).
2. R2 bucket + pack-route extension (desk) -> then theconversation (522), guardian (214), dw (178) -> R2.
