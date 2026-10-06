# SEARCH DEATH TEST — FIELD RECEIPT (Oct 6, 2026, owner's own phone)

## The run
Owner device: Infinix Hot 10i, Termux. Weak 3G killed the 11MB git clone twice;
switched to a 3MB resumable release asset (search-offline-v0.2); curl -C - resume
+ retry loop finished it over several hours on his connection. Extracted, ran
bash search/start-search.sh. Node booted clean: integrity hashes matched
(search-core 853dc0ff, server 2794cb73, engine f442a6a5), /health returned
digest 8bdec9df4eb4df5ae3b1f9720d04b478092a021d93b4485832e776e562644d72,
documents:1409 — exact match to the frozen v0.1 corpus contract.

## The proof (owner screenshot, 8:18 PM WAT)
Phone status bar: airplane-mode icon ON, signal bars absent, battery 22%.
Browser: 127.0.0.1:8795. Query: "Nigeria tax". Result: 57 results, 86ms,
real headlines from businessday.ng (tax audits, exit-tax duties, personal
income tax calculator) with live-looking scored ranking (16.41, 12.51...).
This is a REAL search result set served entirely from localhost with the
radio hardware off — not a cached shell, not a stub page.

## Verdict
RUNG 3 FIELD — SEARCH LEG: PASS. Owner's own hands, own device, airplane
mode, browser, recorded screenshot. Matches the evidence standard set for
the door run (Oct 3) and the Internetless battery — same bar, same proof
shape, now extended to the search engine.
Known honest gap unaffected: Rung 3 mesh/two-phone exchange legs remain open
(different sub-proof; not required for this search leg).

## Standing significance
"HARZ continues to function when the Internet disappears" — the crown
sentence — now has TWO independent field legs closed on real hardware:
(1) the .harz name-resolution door (Oct 3), (2) the search engine (Oct 6).
Both ran on the SAME phone, same owner, same airplane-mode discipline.

## Honest scope correction (owner tested same night, 8:17 PM)
Owner clicked a search result offline and got Chrome's dino/ERR_INTERNET_DISCONNECTED
page. This is EXPECTED, not a defect: the index stores title + snippet + source URL
only, never a cached copy of the external page body. HARZ Search answers "what exists
and where" offline; it does not mirror the destination page. Clicking through to
businessday.ng (or any indexed source) still requires internet, same as any search
engine's result links. The death test above remains valid for exactly what it proved:
query -> ranked results -> snippet, served from zero bytes of internet. Reading the
original source page was never part of that claim and must not be represented as such
in any future report.
