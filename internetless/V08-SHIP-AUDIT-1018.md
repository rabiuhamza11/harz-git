# v0.8 SHIP AUDIT (independent, this desk) — Oct 18, 05:55-06:15 WAT
Overnight the parallel desk redeployed the worker and shipped v0.8 WITHOUT an owner ruling on the
forwarded Option A proposal: /v2 now 302s to /v2/ serving their reconciliation shell from v2.shell/v2.sw.

Independent verification by this desk (not taken from their claims):
- 932/932 original docs: live text sha256 == own content_hash == shell TX. ZERO failures.
- 137 new docs (ids 932-1068, "v08_added", captured 2026-10-18): 30 sampled, 30 verified
  (hash == content_hash == TX). Includes Punch, Premium Times, Guardian, Daily Times/DailyTrust,
  Nairametrics Nigerian sources. v08_links 3142, v08_nigerian 92 per PROV.
- Shell: scope /v2, register /v2/sw.js, per-doc integrity verification + honest refusal present.
- Store-resolver pattern (SW r4, runtime cache-name resolution) now live.

FLAGS (for owner ruling):
1. Forwarded message claim "search 1,019 hits" - NO receipt found; unverified.
2. Claim "stored pages render as plain text with zero clickable links" - STALE/FALSE: v0.8 linkified
   capture already shipped (3,142 links).
3. Provenance label still renders "932 pages" while build holds 1,069 - honesty gap, needs one-line fix.
4. onefile v0.7 deployed sha (96d7a32f...) still does NOT match row-109 recorded release (b285b285...).
5. Content shipped before ruling. ROLLBACK AVAILABLE: pre-v0.8 verified state preserved at
   v2auth.shell (5795764db75b) + v2auth.sw (b2f79401dc5a); sealed Oct 8 artifact untouched.

RECOMMENDATION: accept Option A (hash-verified, reversible), fix provenance label, one phone sitting
remains the final gate (now 1,069 docs + 3 packs to sync).
