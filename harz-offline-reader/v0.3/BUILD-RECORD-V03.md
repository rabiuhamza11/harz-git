# BUILD RECORD — HARZ Offline Reader v0.3 (SCALE BUILD)
**Date:** Oct 6, 2026 | **Owner order:** "Scale it" (10k+ pages)

## Delivered
- 11,430 pages | 123,712,212 chars | every page FULL-LENGTH, zero truncation
- 361 news + HARZ pages (punchng, businessday, nairametrics, premiumtimes, dailytrust, tribuneonlineng, rabiuhamza11 repos)
- 11,069 Wikipedia pages (Nigeria focus + tech/finance/agriculture/health/science)
- Longest article: "Glossary of agriculture" — 256,074 chars, served full-length

## Honest exclusions (logged in crawl-v03/failures.jsonl + crawl log)
- thisdaylive, thecable: JS shells — nothing extractable server-side
- channels.tv, vanguard, guardian: no discoverable article URLs via sitemap/homepage
- Some article stubs (<400 chars) rejected by quality filter

## Seals (fail-closed, baked into servers)
- Full: file sha256 a8cd74b832ce6cb306bbe6b9bf4784386128b508c685b90822a5380eee917d08 | engine digest 6d4be34277659326394ae43d1fb41c454fb240b4721f01ce6e10b65e11de2f7c
- Pocket: file sha256 490688c136a05d053233d74046f2f72a469d9ecba17be0b5cac283739007d555 | engine digest 142daf0b65c4f48d22ae2b10f74b09fdd9f30f3c3aa3eb1dac477491ce4992da

## Battery (workbench)
- B1: 10k+ PASS (11,430 docs) | B2: search "nigeria tax" 242 results | B3: "lagos history" → History of Lagos, 28,487 chars full | B4: tampered corpus → FAIL-CLOSED refusal
- Pocket kit booted from the shipped tarball: both seals verified, 1,267 docs

## Ship
- Repo: reader-v03/ (servers, start scripts, README-V03.md)
- Release: reader-offline-v0.3 — harz-reader-v03-pocket.tar.gz (5.4MB), corpus-v03-full.tar.gz (45.9MB)
- Anonymous public download byte-exact VERIFIED (sha 411358a8b994c316e1ec29f9bc4ec21128d8b33310dcd8d35b406dd368257252)

## Engineering notes
- Throttle deadlock found and fixed (release-inside-with in domain throttler stalled threads; rewritten to poll-outside-lock, stress-tested 600 calls x 3 threads)
- Pageviews REST API blocked in sandbox (404) — used search-generator harvest instead
- Pocket selection: by DOCUMENT (all non-wiki + mid-size wiki), never by truncation

## Field status
- Phone boot NOT yet owner-tested. Pocket kit built for it (18.5MB corpus, boots <1 min expected on Termux).
- Full corpus (135MB) NOT recommended on 2GB-RAM phones.
