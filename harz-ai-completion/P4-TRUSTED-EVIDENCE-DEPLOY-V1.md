# P4 TRUSTED EVIDENCE GATE — DEPLOY RECORD V1 (2026-10-11)

Dad's GO: C-1 + C-3 + C-4 as v6.6.0+p4 (C-2 rejected). Approval scope:
the exact validated candidate, nothing else.

## VERSIONS & CHECKSUMS

- Platform version: 6.6.0 (unchanged display string); phase p4.
- P3 baseline (rollback artifact): sha256 a92545f2283f4439 (worker-p3.js,
  preserved as harz-ai/harz-ai-v6.6.0-p3-offline-bubble.js + rollback-p3-baseline.js).
- Candidate: sha256 b99fb2e1846e5048, committed pre-deploy at 1fd801b.
- DEPLOYED worker fetched post-deploy and verified BYTE-IDENTICAL to the
  intended artifact (sha256 b99fb2e1846e5048). All 6 bindings preserved
  (AI, GROQ_KEY secret, HARZ_KV, HOTLINE_MESH, INTEL, SEARCH).

## THE CHANGE (exactly four edits, diff-verified against p3)

1. C-1: isTrustedEvidence() gate — exact hosts (rabiuhamza11.github.io,
   harz-cloud-backend.onrender.com) + Cloudflare account suffixes
   (.harz/.hamzarabiu390/.harzco-business.workers.dev). Not substring
   matching. 14/14 hostile-probe unit pass, extracted from the deployed
   candidate itself.
2. C-1: gate condition adds "AND isTrustedEvidence(top.url)". Rejected
   evidence falls through to the unchanged chat path.
3. C-4: label now reads exactly:
   "● LIVE · TRUSTED ECOSYSTEM SOURCE — RETRIEVED CONTENT, NOT VERIFIED
   FOR RELEVANCE" — trusted provenance never implies proven relevance.
4. C-3: receipt metadata line carries match tier, strict_total, trusted
   flag. Receipt HASH INPUT unchanged, so the sha256 receipt contract is
   stable across p1-p4.

Everything else byte-identical to p3: chat path, language directive, offline
shell/brain, build paths, LURA note, footer caveat.

## POST-DEPLOY RAW RESULTS

Traps (expect honest chat, no evidence label):
T1 capital of Kano -> "The capital of Kano state is Kano." (chat) PASS
T2 capital of Nigeria -> "The capital of Nigeria is Abuja." (chat) PASS
T3 UBA transfer charges -> honest bank-charges chat answer PASS
T4 best bank savings -> honest depends-on-needs chat answer PASS

Legit evidence (expect new label + diagnostics + valid receipts) — 9/9:
EV1 UBA, EV2 wallet, EV3 HARZ, EV4 GDEG price, I2, S2a fee, S2b cashback,
S2c HARZ Chain, S2d Super App: all fired with the new label, diagnostics
line present, receipts recompute against /search raw output.

UBA provenance: receipt 5c5b6b11f77e6abc PRESERVED (hash input untouched);
diag line: "match and · strict_total 1 · trusted source"; account number
present; no account details exposed beyond the public corpus snippet.

Browser regression (deployed PWA, screenshots captured):
- New label renders in live UI (GDEG price answer, receipt 84fafb2959a594bc,
  "match relaxed · strict_total 0 · trusted source").
- T2 in browser: "The capital of Nigeria is Abuja." — no evidence card.
- P0: "Build me a clock and a calculator." -> both built (clock 8/8 via
  artifact engine; calculator overlay opened and functional).
- P2: Hausa question answered in Hausa; English question in English (API).
- P3: forced-offline "4 + 6" -> paired user bubble + "4 + 6 = 10
  (calculated on-device)"; offline reload persistence unchanged.
- Health: 6.6.0 operational.
- Historical transcripts still render old labels — correct persistence
  behavior (stored bytes preserved, not rewritten).

## HONEST LIMITATIONS (unchanged, on record)

- C-1 is source eligibility, NOT semantic relevance: remaining FPs are
  ecosystem-sourced weak snippets (e.g. EV3 root-zone page, S4b care-line,
  stale GDEG page served faithfully). 36% FP rate stands; no claim of
  reliable relevance is made.
- The stale "GDEG V2 (Polygon Mainnet)" content is served verbatim and
  PRESERVED as evidence, per Dad's data-integrity ruling. Separate open item.
- "Current GDEG price" phrasing gap (11.4 both gates) remains open.
- OpenRouter 401 remains a separate owner-credential issue.

## DEVIATIONS

None. The deployed artifact is the exact committed candidate; no
acceptance criterion was modified.

## LEDGER

P0 ACCEPTED | P1 ACCEPTED (relevance limitation recorded) | P2 ACCEPTED |
P3 ACCEPTED | P4 (C-1+C-3+C-4) DEPLOYED — this record | C-2 REJECTED |
GDEG data integrity OPEN | semantic relevance OPEN.
