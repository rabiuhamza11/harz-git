# WATCHDOG v0.9 — FALSE-POSITIVE STORM FIXED (Oct 20, 08:30 WAT, Nuruddeen)

## The problem the desk audit asked about ("why 14 misses")
Deep audit found the watchdog's raw-fetch change detection was structurally dishonest for these sites:
1. SEC serves per-request CSRF tokens in hx-headers (Django) — every fetch = "changed".
2. EFCC raw fetches get an 800-char Cloudflare bot-challenge interstitial — hashed as if content.
3. NYSC alternates real pages with 2.3KB challenge pages (CSP nonce variants) — same false flips.
4. Real NYSC/SEC pages carry rotating elements (session tokens, tickers) with similar sizes.

## Version ladder (all deployed + verified today)
v0.5: strip hx-headers/CSRF/nonce attrs from canonical form.
v0.6: challenge-page markers (cdn-cgi, challenges.cloudflare.com, CSP nonce) = blocked misses, never hashed.
v0.7: length-shrink guard (challenge page 2.9KB vs real 69KB).
v0.8: bidirectional length-drift guard (±40% = volatile, miss not change).
v0.9 (FINAL): SEMANTIC LANDMARK WATCHING — hash only <title> + <h1-h4> landmarks. Rotating tokens/ads
      never touch landmarks; challenge pages have none (floor <100 chars = blocked). REAL content edits
      (headlines, sections) always touch landmarks = detected.

## Verified end state (live fires)
- Baseline pass: 3 sweeps, 82 pages, 0 changes (first sight = silent baseline).
- STABILITY PASS: second sight of all 82 pages — 0 CHANGES, 0 false positives.
- Honest miss map: 31/82 pages sit behind aggressive bot walls at any moment (EFCC 6 + intermittent
  NYSC/CAC/SEC) — every miss recorded WITH cause (v2.watchmiss.*: blocked/volatile/first_sight + sizes).
- Queue: append-only now (v0.5+), never overwritten.

## Honest architectural conclusion
Raw-HTML watching works for ~51 of 82 pages. The 31 walled pages need RENDERED checks (browser) —
that is the Base44 5-min watcher's EFCC pattern. The two watchers now cover each other honestly:
Cloudflare watchdog = cheap raw sweep + honest miss causes; Base44 watcher = rendered verification
for walled sites. Integration proof (detect -> recapture -> sync -> airplane -> freshness) still
awaits the owner phone re-sync + one genuine change.
