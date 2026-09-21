# ROOT v0.2 — ROTATION LAW v1.1 SPEC
**Date: Sep 21, 2026 · Author: Nuruddeen (build seat) · Witnessed from baseline by Magani (row 44)**

## The ruling (witness-seat question, answered)

Witness authorization goes **ON THE ROTATION ACT, not on the zone.** (Agrees with the witness
seat's recommendation; ruled by the build seat.)

Reasons:
1. Ink economics: witness cards are paper-only; every co-sign is a card-reconstruction key
   window on Node 1. Putting witnesses on every zone multiplies burn-risk windows for zero
   law gain. On the act = witnesses reconstruct only when authority moves.
2. Seat law: witnesses COMPLETE a named succession; they never co-govern book content.
   Zone-level co-signing would turn three seats into daily operators.
3. Chain integrity: history is protected by the prev-digest chain + the authority's signature,
   not by witness countersignatures.

## The hole (found in audit — closed by v1.1)

SUCCESSION LAW v1.0 (rehearsed SR-1..SR-10) validated the manifest because it rode inside a
king-signed zone (the SR-2 shape). In the single-zone ceremony — manifest + act inside the
SUCCESSOR-signed height-2 zone — v1.0 required **no king signature at all**: any key holder
could write his own manifest + act into his own zone and crown himself. SR-8 tested witness
coup on the death path only; the planned path's king-less-manifest case was never exercised.

**v1.1 closes it:** manifest.sig AND act.sig MUST verify against the current authority.
No king signature, no enthronement. (V02-6, V02-12 prove the refusal.)

## The law (validateRotation, single-zone rotation at height 2)

A height-2 zone is accepted ONLY if ALL of:
1. v:2, zone:"harz", height:2, prev = the pinned height-1 canonical digest (cac16833…)
2. Zone sig valid by the SUCCESSOR (named in the manifest) — never by the old king
   (zombie law: the old key is revoked AT the rotation height — no same-height fork window;
   v1.0 revoked at height+1, v1.1 closes the gap)
3. SUCCESSION manifest record: signed by the CURRENT king (90062faa), names the successor,
   witnesses = exactly the three recorded seats (no seating by the manifest), policy 2-of-3,
   prev_digest = the pinned height-1 digest
4. SUCCESSION_ACT record (path planned): signed by the CURRENT king, successor = manifest's
   successor = zone signer, prev_digest pinned
5. Witness quorum: ≥2 of the 3 recorded seats, each signature over the KING-SIGNED act
   body (they attest the king's statement), unique seats, king/successor never a witness
6. Name law: the rotation carries the SAME 77 names as height 1 — rotation changes
   authority, never the book
7. Fail-closed: malformed anything = refused with an honest reason. Never a crash.

## Zone shape (height 2)

```json
{ "v": 2, "zone": "harz", "height": 2, "prev": "cac16833…",
  "records": [
    { "type": "SUCCESSION", "current_authority": "90062faa…", "successor_pub": "<new>",
      "witnesses": ["54697e7f…", "a1348ed9…", "c2c6d6b9…"], "policy": 2,
      "declared_at_height": 2, "prev_digest": "cac16833…", "sig": "<king>" },
    { "type": "SUCCESSION_ACT", "path": "planned", "new_authority": "<new>",
      "manifest_height": 2, "prev_digest": "cac16833…", "sig": "<king>",
      "witness_sigs": [ { "by": "<seat>", "sig": "…" }, { "by": "<seat>", "sig": "…" } ] },
    … the same 77 name records …
  ],
  "signed_by": "ed25519:<new>", "signed_at": "…", "sig": "<successor>" }
```

## Evidence

- v02-battery.js: 13/13 PASS against the LIVE height-1 book (test keys in-memory, Sep 21)
- sign-height2.js self-test: PASS (assembly identical to the real steps)
- Kit files: rotation-law-v11.js, v02-battery.js, sign-height2.js (ceremony coordinator),
  prepare-h2-input.js, CEREMONY-STEPS-V02.md, WORKER-PATCH-SPEC.md

## Honest boundaries

Software-mode proofs use TEST keys; they prove the LOGIC, not the EVENT. The event is the
ink ceremony on Node 1 (owner's cards, his hands, agent never holds keys). Fork resolution
beyond the first-seen valid height 2 (two valid rotations racing) is out of scope here and
recorded as future work for height 3+.
