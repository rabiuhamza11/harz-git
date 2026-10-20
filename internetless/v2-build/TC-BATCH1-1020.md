# THE CONVERSATION BATCH 1 + KEY DEFECT FIXED (Oct 20, ~10:50 WAT, Nuruddeen)

THE CONVERSATION (biggest domain, ~477 docs):
- Batch 1 captured + stored: homepage (root, 10.4MB, 238 imgs) + 48 articles.
- Shared site.css extracted once (157KB); articles deduped to avg 77KB.
- Registered in shell PACKS: 17 packs total. Readback identical.
- Capture continues in batches of 12; receipt per batch.

KEY DEFECT FOUND & FIXED (audit before device test, no false success):
- Some article pages were stored under keys missing the .html suffix; the pack route looks up
  v2.pack.<domain>.<slug>.html, so those pages would have 404'd offline.
  Affected: theconversation batch-1 (48 keys) + aljazeera batch-1 (14 keys). Both re-keyed and
  spot-verified 200 (tc 74KB, aj 154KB, dp 130KB, bd 456KB). dailypost/businessday keys audited clean.
- Rule added: after every upload batch, spot-fetch one page URL per domain BEFORE registration claims.

Stored article totals now: theconversation 48, aljazeera 14, dailypost 5, businessday 6 = 73 articles
+ 16 homepages + CAC video + 4 shared site.css. Queue continues: tc batch 2+, healthline (295),
guardian (214), dw (178), cnn (48). No domain is DONE without owner airplane-mode photos.
