# RULING RECEIPT — FREE TIER ONLY (owner, Oct 15, ~12:2x WAT)
Owner: "No, I want only free tier."
=> CONSTRAINT: no payment method usage beyond free tiers. This qualifies
   the R2 ruling: R2 may be opened ONLY if it costs nothing (free tier:
   10GB, $0/mo, no subscription). Cloudflare requires a payment method
   on file to ACTIVATE R2 even on the free tier — if the owner declines
   billing on file, R2 is off the table and the corpus stays capped
   (frozen at 1,342,482 docs, no growth).
HONEST MEASURED FACTS for his decision:
1. Account D1 total is 17.44GB — the free D1 tier is 5GB. The corpus
   alone (master 3.85 + bodies 9.04 = 12.89GB) is beyond free. A fully
   free-tier future requires SHRINKING D1 below 5GB = corpus reduction,
   which needs its own explicit owner ruling; nothing will be deleted
   without one.
2. Billing status via API is AMBIGUOUS with this token's scope:
   subscriptions endpoint shows "Workers Paid — state: Expired", yet
   D1 writes succeeded this morning at 17.44GB (beyond free limits).
   Either the view is stale or enforcement has not hit. Owner should
   check dash.cloudflare.com -> Billing for the truth of what is being
   charged today.
PENDING OWNER DECISION (one word):
A = enable R2 (free tier only; I hard-cap the bucket at 10GB; growth
    resumes into R2; requires billing on file to activate)
B = no billing at all (R2 off; corpus stays capped at current size)
No state changed by this receipt.
