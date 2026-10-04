# G28 — CROSS-GATE COMPOSITION: TRACE (2026-10-04)

Contract frozen 5e50eb5 before any attack. Authority Wall v1
(G24-G27) frozen as the target. The frozen G27 verifier ran
unmodified for the entire first pass. Kit keys only; production
key 2 untouched; zero production deploys.

## FIRST PASS — eight composition attacks, measured honestly
G28-1 FULL STACK (rotation + partition + stale replica +
  competing history + recovery): FORK DISCLOSED, CURRENCY
  UNDETERMINED; both valid anchors held; the anchor layer
  deferred to the fork verdict (C3 conservative law). Nothing
  promoted. PASS.
G28-2 ANCHOR MASKING BY TIME: FAIL — THE COMPOSITION FOUND THE
  HOLE. Two valid sovereign anchors: older v4 checkpoint naming
  forkB at height 4 + fresher v4 checkpoint naming s3 at height 3.
  The node holds tipA at height 4. The frozen code selected the
  governing anchor by notarized_at alone: the fresher LOWER
  anchor won, the older HIGHER anchor was silently discarded
  (never surfaced — the competing rule covers same-height only),
  and the verdict promoted tipA to "currency CURRENT / LOCAL
  AHEAD" — with ZERO sovereign evidence naming tipA, while valid
  sovereign evidence naming forkB at the same height sat in the
  same bundle. That is an authority promotion without sovereign
  evidence = G28 FAIL per the frozen classification law. The
  individually-safe parts were never wrong alone: LOCAL AHEAD is
  safe (G28-2b), same-height competition is surfaced (G25 C6).
  The hole exists only BETWEEN the walls.
G28-2b BENIGN CONTROL: LOCAL AHEAD disclosed, unchanged, safe.
G28-3 COMPROMISE + PARTITION + FORK + COMPETING CHECKPOINTS:
  the revoked key's anchor REFUSED; the successor's anchor valid;
  the fork verdict governs; UNDETERMINED; nothing promoted.
  PASS (with the frozen G26 finding disclosed: compromise-
  revocation of v3 makes the v3-signed kit records unverifiable —
  printed, not masked).
G28-4 ROTATION + LONG PARTITION + REPLAY + RECOVERY: stale
  replica BEHIND both anchors; old-key 30h anchor honored as
  history; successor's fresh anchor governs; STALE — NOT
  CURRENT. PASS.
G28-5 ERA + ROTATION + ERA-NAMING ANCHOR: the anchor naming an
  unlinked-era state produced CONFLICT — NOT CURRENT; the era
  record stayed era ("never current, never retro-linked"). PASS.
  Note: era records have no chain state hash by law; the anchor
  named the era record's designation-receipt digest — no code
  path promotes era history regardless of what the anchor names.
G28-6 FLAP + MIXED-VERSION + ROTATION + STALE OBSERVATION:
  five identical flap runs; the new-key checkpoint refused every
  time with knowledge disclosure; the 30h old-key anchor
  ANCHORED with STALE OBSERVATION disclosed. PASS.
G28-7 DOUBLE ROTATION + MIDDLE-KEY WINDOW: the middle key's
  post-window act REFUSED (AUTHORITY WINDOW PASSED); its
  mid-window act stands; the successor's anchor governs;
  ANCHORED. PASS.

## THE REPAIR (minimum, on the exposed gap only — the gate order
is Dad's frozen sequence: attack, classify, build only on the
demonstrated authority violation, full regression)
Anchor selection law, corrected: the HIGHEST valid sovereign
observation governs; notarized_at only breaks same-height ties
(disclosed); every additional valid anchor is DISCLOSED ("never
silently discarded"). A fresher lower anchor can never mask an
older higher anchor's demotion. Post-fix G28-2: the height-4
anchor governs -> CONFLICT, local tip NOT CURRENT, exit code
flips to refused-currency; the height-3 anchor disclosed.
G28-2b control unchanged (LOCAL AHEAD retained).

## THE REGRESSION (complete, per the gate order)
Pre-fix vs post-fix across all 43 bundles (8 G28 + 11 G27 + 14
G24/G25 + 10 G26): 42/43 decision-identical; exactly ONE
intended flip (g28-2-masking); zero unexpected diffs; zero
vacuous runs (each side verified to produce a real G24 verdict
line).

## HARNESS DEFECTS (disclosed, all caught before any claim)
1. Vault-record corrections during the freeze push: the G25
   checkpoint-layer verifier and C0-C10 battery bundles existed
   in the working tree but were never committed; committed now
   (0a0d8ea, 00eb5ce) so the vault matches measured reality.
2. Rebase against the sibling internetless workstream
   (harz-internetless/, no file overlap) — clean.
3. Era state-hash mint failure (era records carry no continuity
   cell): the first era anchor minted with an empty state hash;
   re-minted with the era record's designation-receipt digest.
4. TWO vacuous regression passes caught and re-run: (a) the
   pre-fix verifier extraction silently failed (uncommitted
   path) leaving both sides empty; (b) the loop listed bundles
   without .json so every node run failed identically. The
   final regression asserts a real verdict line on every run —
   vacuous results are now structurally impossible.

## THE COMPOSITION ANSWER
Yes — individually-safe failure modes DID compose into an
authority promotion none could create alone (G28-2). The wall
had a hole between its stones: timestamp selection across
different anchor heights. The hole is closed with the
highest-anchor-governs law, and the full battery now measures
true: composed failures surface, defer, demote, or conflict —
never silently select.
