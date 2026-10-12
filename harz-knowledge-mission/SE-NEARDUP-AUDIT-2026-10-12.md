# Standard Ebooks Near-Duplicate Audit — 2026-10-12 (closes the pending cleanup item)

Prior estimate (Batch 4 receipt): "~19 classics in two near-duplicate versions,
~30-40MB". Full audit of all 372 standardebooks-cc0 docs shows the real
overlap is ~100x smaller:

* Recipe A wave: 19 books, fixed ~42KB chunks ("X - Standard Ebooks, part N").
* Recipe B wave: 6 multi-part books + 19 single front-matter docs (prefaces,
  introductions, endnotes; "Book — Section (part N)" naming).
* Cross-recipe overlap: exactly ONE book — The Art of War (same Giles/SE
  edition). Recipe A holds it fully in 11 chunks (~438KB incl. bibliography);
  recipe B holds Preface + Endnotes in 3 docs (~104KB).
* Redundancy sampling: 30/36 sixty-word windows of the B docs appear in A
  (83%). The remaining windows include content A's chunking does not cover
  contiguously.

DECISION (audit-first, no destructive op): keep both versions. Cost is
~104KB of 7.27GB (0.0014%); deleting risks losing the non-overlapping
fragments for a saving that is effectively zero. The original 30-40MB
estimate assumed all 19 A-books were re-ingested by wave B — false; the two
waves covered different book sets almost entirely.

Note: identical-looking "size" values within recipe A are the fixed chunk
size, not duplicates — verified by distinct content/norm hashes.
Also verified: 371 distinct titles across 372 docs (one title repeats
legitimately across recipes). No exact duplicates exist (INSERT OR IGNORE on
content_hash + norm_hash guards held).

Corpus unchanged: 1,327,988 docs. Nothing deleted. Item closed.
