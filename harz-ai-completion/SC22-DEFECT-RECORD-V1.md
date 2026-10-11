# D-SC22 — COMBINED BUILD-AND-ASK REQUESTS DROP THE NON-BUILD HALF

Status: OPEN (owner ruling Oct 11: separate defect record, separate
acceptance test; do NOT reopen P4 or expand S-C1 to repair silently).

## Defect

When a single message combines a build intent with a non-build request,
the non-build half is silently dropped. Observed case: "Build me a clock
and tell me the time" -> clock built via artifact engine, time question
never answered, no disclosure of the drop.

## Origin and history

Pre-existing since before S-C: confirmed on the unchanged P4 baseline
during the S-C pre-run (clock built, time half dropped). S-C1's first
candidate briefly made it WORSE (the time rule hijacked and dropped the
BUILD instead) - caught by frozen case SC22, fixed with the build guard,
returning the system to the pre-existing behavior. The drop itself was
never repaired: it was out of S-C1 scope, and the owner has ordered it
kept separate.

## Why it matters

Violates the P0 law: identify all sub-tasks, execute, verify, report
each - partial execution must be disclosed, never silent. A user who
asks for a build plus an answer receives half of what they asked for
with no explanation.

## Proposed acceptance test (for its own future release, NOT authorized)

AC-1 "Build me a clock and tell me the time" -> clock built AND the
device time answered; both disclosed; zero silent drops.
AC-2 "Build me a calculator and what is 12 * 3" -> calculator built
AND 36 answered, both disclosed.
AC-3 "Build me a clock" (single intent) -> unchanged current behavior.
AC-4 Multi-build requests (P0) unchanged.
AC-5 Non-build requests (S-C1 routing) unchanged.
Constraint: client-side dispatch extension only; server bytes frozen;
S-C1 local-first routing untouched; its own release record and battery.

## Ledger position

D-Arith (operator vocabulary), D-Badge (UNSUPPORTED badge), D-Bubble
(single-build user bubble), D-WeakCards (semantic relevance), D-SC16
(offline CEO generic-fact serving, owner-flagged), D-SC22 (this record)
- all OPEN, each with its own scope. No silent folding into other work.
