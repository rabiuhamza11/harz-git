# HARZ OFFLINE AGENT v0.1 — DESIGN DRAFT (owner: "Both. Draft now", Oct 15 2026)
DRAFT ONLY. No code, no deploy, no changes to any closed baseline.
Targets: (1) Rabiu's Infinix (1.8GB RAM, XOS), (2) desktop Edge.

## 0. Audit-first: what already exists and is MEASURED (no duplication)
- harz-ai v6.6.0+p4: RELEASE CLOSED — this design does NOT touch it.
  Reuses its proven patterns: local brain branches, honest refusal law,
  offline transcript (P3), evidence receipts (P1), UBA labels.
- E1-KNOWLEDGE-2 5K kit: ACCEPTED + phone-proven (Infinix, Termux node,
  6.46MB install, 2ms queries, 19/20 battery, airplane-mode verified
  TCP REFUSED + DNS FAIL). Sealed 0a5c75d4, pack 5333dc8a.
- Capability Contract V1 (fd1d783): three-outcome law PASS / REFUSED
  HONESTLY / KNOWN LIMITATION — the agent's core honesty engine.
- Universal App Contract (Oct 8): 6 principles incl. death test.
- S-A sovereign coverage report: local skills measured (clock, time,
  small arithmetic, greetings, builds, honest refusals; reasoning 0/25
  sovereign — the gap this design is honest about).
- S-B ruling: local-model slot gated on CPU facts + owner approval. NO
  performance claims until measured. This design obeys it.

## 1. What "the offline agent" is (and is not)
A single-page agent that opens with ZERO internet, runs an agent loop in
local code, answers from local skills + the sealed knowledge kit with
receipts, and refuses honestly beyond its measured ability. It is NOT a
language-model chatbot on the phone: per Capability Contract, beyond its
knowledge it says REFUSED HONESTLY / KNOWN LIMITATION. It never fakes
being smarter offline (owner's standing law).

## 2. Architecture (one codebase, two delivery modes)
### 2.1 Agent loop (offline, pure code)
intent classify -> { skill | knowledge-search | refusal } -> compose
answer + receipt + honesty label. Loop, tools, and routing are plain JS:
no model call required anywhere in the offline path.
### 2.2 Skills layer (local brain, measured set)
kept: clock/time, calculator, unit/currency facts from kit, notes/build,
greetings EN/HA (language-match law), honest refusal.
fixed by design: arithmetic must MATCH the online claim (S-A defect:
17x23 refused offline while self-described broader -> v0.1 ships a
bignum-safe calculator skill so the skill ceiling is real, not cosmetic).
### 2.3 Knowledge layer
5K D1+FTS5 kit in the ACCEPTED sealed format. Phone: same 6.46MB kit
(under the 15MB frozen gate). Desktop Edge: same kit at v0.1 (larger
desktop kit = the blocked 20K expansion, NOT smuggled in; separate ruling
as already frozen).
### 2.4 Model slot (S-B, desktop only)
adapter interface only: if a WebGPU local model is later approved and
measured, it plugs in as an optional reasoning tool. On the phone there
is NO model slot (1.8GB RAM — honest refusal instead). No WebGPU/WASM
performance claims anywhere in v0.1.
### 2.5 Honesty layers
UBA labels (LIVE/CACHED/OFFLINE/STALE — offline state is the default,
shown plainly); receipts (kit SHA + doc id + snippet); three-outcome law
on every answer; offline proven by TCP+DNS dead probes (same standard as
the accepted phone gate).

## 3. Delivery modes
- PHONE (Infinix): proven Termux+node runtime (E1 pattern, 22s run,
  4.57MB install, RSS 113MB measured) as the reference runner. PWA+WASM
  mode on 1.8GB RAM is UNPROVEN — listed as open feasibility, not a claim.
- DESKTOP (Edge): PWA + service worker shell, kit served from local
  storage, full agent loop + optional S-B slot. Death test mandatory.

## 4. Gates before any acceptance (owner's standard)
G1 battery: frozen 20-case accuracy set (kit) — must match 19/20 or
better with the title-tie miss understood.
G2 death test: ON->open->use->OFF->close->reopen->continue->ON->sync->
verify (UBA clause 6).
G3 offline proof: airplane-mode / TCP+DNS dead, providers_called == [].
G4 phone gates: install <=15MB, peak RSS <=250MB, cold <=3s.
G5 Capability Contract regression set (F1-F6 family adapted to agent).
G6 Infinix physical pass = final gate (owner's standard, never waived).

## 5. Explicitly OUT of scope for v0.1
External fallbacks (OpenRouter/Groq/CF AI) — not part of the offline
agent at all; 20K kit expansion (blocked, own ruling); S-B model
implementation (gated on CPU facts + approval); any change to harz-ai
p4 (closed) or the sealed kits; corpus changes (frozen at 1,342,482).

## 6. Open decisions for the owner
D-1: approve this design as the v0.1 build target (or amend).
D-2: phone runner: Termux reference (proven) first, PWA feasibility
     audit second — or both in parallel?
D-3: agent name/branding within HARZ ecosystem + super-app listing
     (5-check rule applies when it ships).
D-4: desktop host: pure local file/PWA, or also served from own infra
     (harz.workers.dev) with offline SW (hosting stays CF per standing
     law)?
Nothing executed. Draft only, per "Draft now".
