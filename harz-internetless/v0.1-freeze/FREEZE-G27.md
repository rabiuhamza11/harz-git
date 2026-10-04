# INTERNETLESS v0.1 — FREEZE RECORD (G27, owner ruling Oct 4, 2026)

Owner verdict: "G27 internetless v0.1: PASS, with v0.2 blockers identified."

Frozen state of v0.1:
- 12/12 survival scenarios executed (attack battery v0.2, run-07, HarzGit commit df93aef)
- 2 vulnerabilities discovered (V1 torn-line swallow, V2 read trusts stored flag)
- 0 hidden
- 0 patched during the battery
- S6 (state mutation) explicitly unavailable by design — honest boundary, not a gap to paper over

Owner laws from this ruling (binding on v0.2):
1. ACK => RECOVERABLE DURABLE RECORD. An ACK creates a promise: "the system accepted this message
   durably." If the process dies and a torn tail is silently discarded, that promise is false. Recovery
   must detect, classify, and expose malformed tails — never silently erase evidence.
2. READ => REVERIFY. A stored [VERIFIED] flag is not evidence; the evidence is the actual signed
   content plus the verification procedure. Stored verdicts are cache, never authority. A local node
   must discover disk tampering itself and display UNVERIFIED/corrupt — not yesterday's trusted label.
3. S6 target shape: local write -> seal -> persist -> kill -> recover -> verify. Connects survival
   guarantees to actual local sovereign state creation.

Evidence law (unchanged, now standing): real device -> airplane mode -> browser -> recorded receipt.
No simulated offline flag. No hardcoded response. No theater. "The standard by which HARZ distinguishes
a real internetless service from an offline-looking demo."

v0.1 files are FROZEN. No edits to v0.1 code. All repair work happens in v0.2.
