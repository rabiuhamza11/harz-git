# G25 — CLOSED (Dad's ruling, Oct 4, 2026)

G25 = CLOSED.
Checkpoint cadence = ON-DEMAND, FROZEN.
Signing key = KEY 2 (8ae5337b), FROZEN.
No G26 build until these policies are deliberately reopened.

Verbatim: "The wall is standing; freeze the wall."

Authority hierarchy (final):
  sovereign chain -> signed checkpoint -> replica/node observation

The checkpoint can demote. It cannot promote.

## Frozen policies (rationale, Dad verbatim intent)
1. Cadence stays on-demand: automatic cadence is a new policy surface
   before evidence shows it improves convergence. "A checkpoint exists
   because the sovereign origin explicitly chose to anchor that state."
   Any future automation must be an EXPLICIT policy with measurable
   freshness guarantees, never implicit background behavior.
2. Key rotation deferred: rotation is its own authority-transition
   problem. If ever reopened, it requires an explicit rotation record
   binding old key -> new key -> effective height/time -> authorization
   -> revocation status, and must survive the same forgery, replay,
   fork, withholding, and recovery attacks.

## The progression (closed)
G20 manipulable -> G21 content-bound -> G22 parallel authorities
(FAILED, permanently preserved) -> G23 sovereign authority +
revocation -> G24 "can the state prove its own integrity?" ->
G25 "can an external/replicated state falsely converge upward into
sovereign authority?" — NO, under the tested boundary.
