# FRONT-DOOR USABILITY — ACCEPTANCE RECORD (IAE-1 + Conversation, Dad's Oct 9 usability ruling)

**Date:** Oct 9, 2026. **Ruling honored:** conversation first, task execution through the same
front door, proof in the live browser, no false claims, no hidden external dependency.

## What was built (all additive; frozen layers untouched)

1. FRONT-DOOR CONVERSATION LAYER (doorConverse v0.1): deterministic greetings, how-are-you,
   and honest capability self-description. No model call, no corpus retrieval, no evidence
   claim. New verdict class 'answered' (distinct from evidence 'verified' and 'refused');
   conversational records carry lifecycle not_applicable annotations for EVIDENCE_GATHERED/
   VERIFIED/CREATED/ARTIFACT_VERIFIED and an additive conversational_answer field.
2. IAE-1 THROUGH THE FRONT DOOR: pattern IAE_BUILD (build/create/make/construct/design +
   clock/watch/timepiece, media nouns excluded to their sealed lanes) -> task type
   iae_build through the mission spine -> artifacts[0] mode interactive_app with player
   URL, sha receipt, provenance chain; CREATED/ARTIFACT_VERIFIED earned at create.
3. CHAT LANE USABILITY: same conversational + build pre-dispatch at /api/chat (greetings
   answered naturally, capability question answered, "Build me a clock" returns the built
   app URL). No more junk corpus evidence for greetings.
4. CONSOLE DISPLAY LAW: conversational answers render (ANSWER section), interactive_app
   artifacts render as an open-link PLUS a live iframe of the running app inside the
   console page.
5. HONEST REFUSAL DISCLOSURE: unsupported requests now list what IS supported today.

## THE BROWSER-CAUGHT DEFECT (record: the gate did its job)

The FIRST shipped clock artifact passed the in-worker battery (11/11) but THREW in the real
browser: wrangler's minifier injects an esbuild __name helper into .toString() output
("const p2 = __name(...)"), undefined inside the artifact's browser context. Display showed
"--:--:--". The live browser functional test — exactly the step Dad's gate mandates — caught
it. FIX (EMBED LAW): the artifact now embeds a HELPER-FREE function text as a frozen string
constant (IAE_CLOCK_EMBED_SRC; hash-covered by the artifact sha); the worker-side
iaeClockRender is the reference implementation for the 8/8 test vectors; the LIVE BROWSER
FUNCTIONAL TEST is the acceptance evidence for the shipped artifact (display ticks,
12/24-hour toggle verified, theme toggle verified). Lesson recorded: in-worker batteries
prove worker logic; only the real browser proves the shipped artifact's runtime.

## Live acceptance results (all through the DEPLOYED front door, real browser + HTTP)

| Dad's milestone phrase | Result |
| Hi | CONVERSATION, verdict answered, greeting displayed in browser, receipted, 0 ext |
| What can you do? | CAPABILITY, honest capability list incl. stated limitations, receipted |
| What are you good at? | CAPABILITY (the exact screenshot phrase that returned junk evidence) |
| Build me a clock | IAE_BUILD, verdict verified, interactive_app delivered, provenance chain, 0 ext |
| Build a clock whatch | IAE_BUILD (Dad's original screenshot phrase now works) |
| Knowledge flagship (UBA account) | INFORMATIONAL, verdict verified, grounded doc 10470, value 2034326424, cited |
| Research + report | RESEARCH_AND_COMPOSE, verified, report artifact delivered |
| Build a spreadsheet application | REFUSED honestly with the current supported list disclosed |
| Clock in live browser | 12:41:13→:18→:21→:26 ticking; 12-hour toggle shows PM; theme toggle verified; screenshot captured |
| Clock inside console | iframe renders the running app directly in the TaskRecord output |

## Regression (post-change, frozen bar intact)

agents 13/13, test8 5/5, test10 5/5, creation1 24/24, im1 24/24, sem1 12/12, ter1 12/12,
semvid1 16/16, router1 15/15, vision 15/15, vision2 22/22, m2 17/17, m3 16/16, m4 16/16,
testiae1 11/11. ALL GREEN.

## Honest boundaries (disclosed, never masked)

1. OFFLINE: construction-verified only (cache-first service worker + zero external URLs +
   device-clock operation). The on-device offline run (airplane mode, kill, restart) is a
   disclosed PENDING human field test — never claimed as executed.
2. OpenRouter credential remains EXPIRED (standing blocker); the flagship knowledge
   question still verified via the deterministic value chain (no model call). Report path
   verified live. Deeper reasoning lanes degrade honestly until the credential returns.
3. Two stale-edge observations during deploy propagation (a region briefly served the old
   worker): recorded as harness knowledge — browser acceptance runs must retry after
   deploys.
4. F-ROUTING-1 deeper finding stands: interactive-artifact kinds beyond clock, and live
   price data, remain separate future contracts per the one-gap-at-a-time law.

## Status

BUILD COMPLETE + LIVE-BROWSER VERIFIED. NOT self-declared closed: promotion ruling is
Dad's. A generated image of a clock does not pass the interactive-clock test.
