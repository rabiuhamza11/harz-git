# ROOT v0.2 — CEREMONY RUNBOOK (Rabiu's side, Node 1, one sitting)

**Principle: the ink is the keystore. Card content never leaves the phone. Only PUBs and
signatures are printed — all public data. Chat may stay open (no-chat rule repealed) but
key material still never enters it: burn law stands.**

## BEFORE the session (Nuruddeen's side)
1. Fresh successor key: on Node 1 run `node ceremony-kit.js gen-key --role successor --split-hex`
   — hand-copy the 3 cards to paper FIRST (rows of 24, slash opens row 5, CHECK corners,
   cards to separate places), save the PUB line, then wipe per the kit.
2. Send Nuruddeen the PUB line (public). Nuruddeen runs prepare-h2-input.js and hands you
   the h2-input.json URL (77 live records + the PUB — public data).
3. On Node 1: `curl -o h2-input.js …` (the kit files: sign-height2.js, rotation-law-v11.js,
   h2-input.json — all public).
4. Self-test the coordinator first: `node sign-height2.js self-test` — must print PASS.

## THE SESSION (four key windows, wipe between each)

**Step 1 — KING (90062faa's cards):**
```
cat > pA.txt   (type king card A from paper, Enter per row, Ctrl-D)
cat > pB.txt   (type king card B)
node sign-height2.js king
```
Prints KING SIGNED + wipes the cards itself. If any card mistypes, the tool refuses
honestly — retype. Never photograph cards; never paste them anywhere.

**Step 2 — WITNESS seat 1 (choose any two of W1/W2/W3):**
```
cat > pA.txt   (that seat's card A)
cat > pB.txt
node sign-height2.js witness
```
Quorum line must read 1/2. Tool wipes the cards.

**Step 3 — WITNESS seat 2 (a DIFFERENT seat):**
Same as step 2. Quorum line must read 2/2 — "QUORUM MET".

**Step 4 — SUCCESSOR (the fresh key's cards):**
```
cat > pA.txt   (fresh key card A)
cat > pB.txt
node sign-height2.js successor
```
The tool assembles height 2, signs it, and SELF-VERIFIES with the law before printing.
Only a passing height 2 is written to h2-signed.json. Then:
```
rm -f pA.txt pB.txt pC.txt h2-state.json    ls    (must show no pX/state files)
```

## AFTER the session
1. Paste/send Nuruddeen the h2-signed.json content IN FULL — it is public data
   (signatures and PUBs only, no key material — the coordinator never prints key data).
2. Nuruddeen independently verifies it against rotation law v1.1 with the pinned real
   world, then deploys root v3.1 (/anchor + /pub + the height-2 book).
3. The witness seat (Magani) deploys node-b independently and verifies from his own copy.
4. Tests: browser render (both nodes), offline verification, restart/death test,
   byte-parity across all nodes — then the evidence freezes.
5. The 77 names do not change in this ceremony. New names ride a later king-signed height.

## FAILURE RULES (all fail-closed, nothing is ever half-signed)
- Wrong cards at any step: honest refusal, retype. State waits.
- Quorum incomplete: successor step refuses.
- Law self-verify fails: NOTHING is printed or deployed, honest reason given.
- A refusal is never data loss: h2-state.json holds only public signatures.
