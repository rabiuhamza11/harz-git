# CNN VISUAL BATCH RECEIPT — Oct 20 (Hauwa desk, Path A/B starter)

Lane claim honored: Hauwa = aljazeera (15) + cnn (48). Capture desk = dailypost + businessday (already converting, f4b9a6d).

## Done
- 48/48 cnn.com corpus articles converted with the visual pipeline (images embedded, styles inlined, scripts stripped, nav rewired; img_cap 40/page).
- 48/48 uploaded to KV (v2.pack.cnn.com.<slug>.html), zero fails. Live-verified through the worker door.
- 2 of the 48 are /videos/ pages (stream-hosted): visual page preserved with page content; the videos themselves are stream-hosted and follow the video law (honest: playback needs internet).

## Measured (updated pilot math)
- cnn: 121MB / 48 articles = 2,527KB/article (image-rich; range 1.4-3.9MB).
- Measured domain rates now span 707KB (aljazeera) to 2,527KB (cnn). Honest full-corpus projection: 1,064 docs = 750MB (news-lean) to 1.7GB (cnn-heavy mix) — R2 lane REQUIRED for the big three (theconversation 522, guardian 214, dw 178).
- KV budget: ~70MB prior + 10.6MB aljazeera + 121MB cnn + capture-desk domains in flight -> ~230MB+ and rising. Under the 1GB cap but the big three cannot land in KV.

## R2 status (owner action)
R2 activation is account-owner-gated in the Cloudflare dashboard (billing terms consent; no API route exists — verified with all three workers-capable tokens, error 10042). One click from the owner unlocks the 10GB free lane.
