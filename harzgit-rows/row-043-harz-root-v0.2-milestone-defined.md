# HarzGit D1 row 43: harz-root-v0.2-milestone-defined

**Description:** Owner correction recorded: precise evidence-backed claim replaces the ICANN comparison wording. Root v0.2 milestone defined (height 2 succession + 2-of-3 witnesses + /anchor). Self-correction: /zone-pub exists (my audit missed the v3 rename); only /anchor is a real gap. Division of labor recorded; nothing deployed; root v0.1 stays frozen.
**Filed:** 2026-09-21 (Africa/Lagos)
**Author:** Aisha (Superagent seat)

---

ROOT v0.2 MILESTONE DEFINED — OWNER CORRECTION RECORDED (2026-09-21, Rabiu)

CLAIM CORRECTION (supersedes the closing sentence of my audit row 42):
Owner tightened the conclusion. The comparative claim "verification model is already ahead of ICANN" is NOT frozen as a demonstrated fact. The precise, evidence-backed statement:
"HARZ Root has demonstrated a deterministic, independently verifiable, offline-capable trust model at 77-name scale, while ICANN's DNS root operates at vastly greater global scale and institutional maturity."
No hype required. Row 42's evidence stands; only the comparison's wording is corrected.

AUDIT SELF-CORRECTION (Aisha):
My row 42 gap list said "no /pub endpoint". Wrong in part: v3 renamed /pub -> /zone-pub (recorded in row 27). /zone-pub is live and serves the active king 90062faa (verified again today). The real gap is only /anchor (trust-bootstrap endpoint with independently-asserted anchors).

ROOT v0.2 MILESTONE (owner-defined, the next move — no new names yet):
Height 2 -> successor king key, signed prev_digest = cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb -> 2-of-3 witness authorization -> /anchor + /pub endpoints -> mirrors independently verify and adopt height 2 -> old key rejects unauthorized height-2 mutations -> browser test -> offline verification test -> restart/death test -> byte-parity across all nodes -> freeze evidence.
Purpose: turn Root from "a signed snapshot" into an evolving trust chain.

DIVISION OF LABOR (audit-first, nothing deployed yet):
OWNER-SIDE (CEREMONY LAW, Node 1 Termux only, ink cards, finish-ceremony.js track — no new ceremony tools): run the succession — successor ink key #4 signs the height-2 zone (same 77 names, prev = cac16833), 2-of-3 witnesses co-sign, send me the PUBLIC outputs only: successor KING PUB, the two participating WITNESS PUBs + their SIGs, and the height-2 zone. No private material ever leaves Node 1.
AISHA-SIDE (source + tests only, after approval): root worker v0.2 (height-2 verification law + /anchor), mirror v1.1 (rotation law: successor authorized only with witness quorum 2-of-3 AND prev matching pinned digest; old-king-only or foreign-key height 2 = REFUSED; no height skipping), then the full test battery + freeze receipts.

STATUS: awaiting owner approval and ceremony outputs. Root v0.1 remains frozen and serving.
