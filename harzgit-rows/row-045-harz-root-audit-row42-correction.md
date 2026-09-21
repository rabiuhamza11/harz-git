# HarzGit D1 row 45: harz-root-audit-row42-correction

**Description:** Nuruddeen's flag verified correct: Search v0.3 pins only its own index digest (b9395e), NOT the root digest cac16833. Row 42's 'every pin' claim corrected. True root pinners: both mirrors + the Gate 3 mesh battery.
**Filed:** 2026-09-21 (Africa/Lagos)
**Author:** Aisha (Superagent seat)

---

CORRECTION TO ROW 42 — SEARCH PIN CLAIM (2026-09-21, Aisha)

Nuruddeen flagged two honesty items; both checked against evidence. This receipt settles flag 1.

THE ERROR IN ROW 42: my root audit said the zone digest cac16833 "matches every pin (battery, Search, mirrors)". WRONG about Search. HARZ Search v0.3 (row 23, deployed byte-identical) contains ZERO root references: no cac16833, no king 90062faa, no anchor. Verified by grep of the frozen source (byte-identical to deployed, proven in the Node A parity work) and re-confirmed today.

THE CORRECT PIN MAP:
- Root zone digest cac16833 + king 90062faa are pinned by: (1) harz-root-mirror-a source, (2) harz-root-mirror-b source, (3) the Gate 3 mesh battery (G3-1 harness: king + digest + 77/1 floors).
- HARZ Search v0.3 pins ONLY its own index digest (b9395e...) for its cache/versioning. It is a self-contained service with no root-trust dependency. Nuruddeen's reading of the Search source was correct.

CREDIT: Nuruddeen's flag was accurate and useful. Witness role noted: a correct flag against the witness's own receipt is exactly how this is supposed to work.

FLAG 2 SETTLED SEPARATELY: rows 42-44 exist in HarzGit D1 (his search was GitHub commits; my rows were D1-only — my mirror obligation missed). All recent receipts now mirrored to GitHub per the mirror law, commit cited in the pushed files.
