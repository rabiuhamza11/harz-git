# RECEIPT 275 — Gate 4: offline authoring + carry file (the missing half)

Date: 2026-10-31 (Aisha). Worker harz-hcie. Owner ruling this turn: close Gate 3, move to Gate 4.

## Built
- /sw.js — service worker caches the /write shell so authoring opens with no connection; API calls are never cached.
- /write — added "Export carry file (.html)" and "Load a carried contribution file".
- Carry file harz-contribution-<sha12>.html — one file, contains the canonical text, the author's device identity, the declared SHA-256, and its own SHA-256 implementation (inlined from the page). Opens anywhere, verifies itself, and its "Queue when online" button POSTs to /api/hcie/contribute only when a connection exists. It states plainly: NOT PUBLISHED.
- /gate3/tamper now accepts ?target=<object id or source:version> and prints the altered identity in the page, fixing the reproducibility gap from receipt 274.

## Verification performed (actual shipped code, not a mock)
1. Real browser export: filled the form on /write, clicked export. Page showed
   sha256 7cd4be4049420e50459679f53ba270f174d787552a3a8ebfdfd0293df72807dd and logged "CARRY FILE EXPORTED".
2. Same page logic executed in Node with stubbed DOM produced a 4,426-byte carry file whose declared hash is
   7cd4be40... — identical to the browser's, and its embedded JSON payload parses.
3. The carry file's own verification script was executed: verdict "VERIFIED LOCALLY",
   status "NOT PUBLISHED. This file proves the text is intact. It becomes knowledge only after it is queued and reviewed."
   Recovered hash equals the declared hash.
4. SHA-256 implementation in the page matches known vectors: empty string e3b0c442...b855 and "abc" ba7816bf...15ad,
   and equals Python hashlib on the same canonical text.

## Two real faults found and fixed during this build (recorded, not hidden)
1. ESCAPE EATING: the import regex was written inside a template literal, so [\s\S] was served as [sS] and </script>
   terminated the page's script early. The author page was broken by that deploy. Fixed by double-escaping; verified the
   served page now carries [\s\S] and 2 clean script tags.
2. DOM-COUPLED HASH: shaHex wrote a "computing…" label using document.getElementById('hash'). Inlining shaHex into the
   carry file would therefore have crashed on a file that has no such element, i.e. every carried contribution would have
   failed to verify itself. shaHex is now pure; the progress label moved to the caller. Verified by running the carried
   script with only the elements the carry file actually has.
3. Also fixed: export used shaHex(t).then(...) although shaHex is synchronous, so the first export attempt logged nothing.
   Handlers rewritten linear; the browser export now logs success.

## Honest limits
- The carry file has not been moved phone-to-phone yet. The path proving it end to end on hardware is:
  author offline -> export -> carry -> open on second phone -> verify -> queue on reconnect -> appears in the queue unpublished.
- Import on /write was not exercised through a real file picker in a browser; its payload parsing and refusal logic were
  verified by the same code executed against a real carry file.
- No review screen yet: approval is still an API call.
