# C4 — CHAT PROOF-BOUNDARY AUDIT V1 (2026-10-10)

Audit order: Dad, Oct 10 ("audit /api/chat and /api/tasks/v1 as they exist
today; determine whether the chat response clearly distinguishes retrieved
evidence from actual proof"). No code changed. All six regression gates
untested-unchanged (no build occurred).

## HOW EACH SURFACE WORKS TODAY (source + live)

FRONT DOOR (/api/tasks/v1, planDoorTask): a deterministic WHITELIST planner.
Proof-type instructions match no supported pattern -> REFUSED with reason,
0 external calls, receipted CLOSED. Live 2026-10-10: "Prove that GDEG is the
best token in Africa." -> REFUSED, receipt 8eed77da... (browser-verified on
/console, screenshot in the report).

CHAT (/api/chat): greetings/capability/clock-build handled deterministically;
EVERYTHING ELSE -> orchestrate() -> classifyTask (no proof class exists) ->
Search-1 packet -> reasoner composition -> harz-verify-1 claim check ->
answer with receipt. There is NO proof-verb or judgment handling anywhere in
the chat path.

## THE PRECISE FAILURE (proven live, 3 probes + browser)

The chat surface answers proof/verification/judgment instructions with
evidence composition and never states that retrieved evidence is not proof:

1. "Prove that GDEG is the best token in Africa." -> composed GDEG
   marketing quotes, 【S1-S3】 citations, receipt. No proof, no disclaimer.
2. "Is GDEG the best token in Africa?" -> task_class evidence_qa, claim_check
   all-supported (the QUOTES are genuinely in the corpus), answer ends
   "CONFIDENCE: medium — grounded in evidence" — readable as confidence in
   the JUDGMENT, which was never established (browser-verified on the PWA,
   receipt 28d253e80f6e, screenshot in the report).
3. "Verify that the GDEG payment rate is 15 naira." -> task_class fee_lookup,
   claim_check verdict 2-UNSUPPORTED — yet the answer text presents fee
   quotes and never says verified or not-verified.

The verification OBJECT is honest (per-claim support, receipts). The ANSWER
TEXT carries no evidence-vs-proof distinction, and no verified/not-verified
verdict for verification demands. The same instruction refuses at the door
and composes at chat: two surfaces, one honesty standard, different behavior.

## SMALLEST JUSTIFIED CORRECTION (proposed, NOT built — awaiting Dad's Go)

OPTION A1 (recommended, minimal): a deterministic disclosure appended to the
chat ANSWER TEXT when the instruction matches a proof/judgment/verification
demand shape (prove|verify that|is/are ... the best|better than|superior etc.):
fixed wording, zero model calls, e.g.
"DISCLOSURE — evidence, not proof: the lines above are retrieved evidence
related to your request. They do not prove the claim asked. HARZ answers from
evidence; evaluative claims (best/better/superior) cannot be established from
it. Proof-type tasks are refused outright at the front door (/console)."
Additive at the /api/chat answer layer (chat, stream, and job paths return
through orchestrate — one insertion point). Search-1, reasoner, verify-1,
claim_check: UNTOUCHED. Ordinary evidence questions: byte-identical behavior
(the disclosure fires only on the matched shapes). Gates: F1/F2/F3/F5
untouched (frozen batteries do not pass through the chat handler);
F4 untouched (no provider change); F6 strengthened.

OPTION A2 (optional strengthening, later): for verification demands, add a
VERIFIED/NOT-VERIFIED line derived from the existing claim_check verdict
("verified: no — 2 claims unsupported" for probe 3).

## EVIDENCE SEPARATION

evidence_remcap_audit.json remains desk-side and untouched. This audit is a
new, separate record. No baseline was modified.
