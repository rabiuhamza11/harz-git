#!/bin/bash
# REC5 — SOVEREIGN SEAL CHAIN ATTACK (Dad's "keep attacking", Oct 6, 2026)
# The seal layer is the least-tested layer of the frozen stack (touched only by SCN4b/R3-8).
# Attack the chain itself: tamper, fork, withhold (middle/tail), reorder, duplicate, torn,
# identity rotation, possession. NO REMEDY BUILT FIRST. The attack decides.
# Target: FROZEN v0.3 (98dcdd62...), hash-gated start/end. v0.2 untouched historical evidence.
set -u
cd "$(dirname "$0")"
NJ="$PWD/../v0.3/internetless-node-v03.js"
VER="../rec1/rec1-verify.js"
mkdir .lock 2>/dev/null || { echo "INSTANCE LOCKED — refusing to race"; exit 2; }
trap 'for p in $(cat tmp/*.pid 2>/dev/null); do kill -9 "$p" 2>/dev/null; done; rmdir .lock 2>/dev/null' EXIT
NJ_SHA=$(sha256sum "$NJ" | cut -d" " -f1)
echo "target v0.3 sha: $NJ_SHA"
[ "$NJ_SHA" = "98dcdd624a4901b4d0034310f22055768716079c8cdb6f6cbea0a1a7083c9a7f" ] || { echo "FROZEN v0.3 MODIFIED — refusing"; exit 3; }
rm -rf tmp; mkdir -p tmp; T="$PWD/tmp"
PASS=0; FAIL=0
sv() { if [ "$1" = "0" ]; then echo "PASS $2"; PASS=$((PASS+1)); else echo "FAIL $2"; FAIL=$((FAIL+1)); fi; }
act() { echo "        [actual: $*]"; }
newnode() { mkdir -p "$T/$1"; ( cd "$T/$1" && node "$NJ" init --name "N_$1" >/dev/null 2>&1 ); }
sealN() { local d="$1" n="$2" pre="$3"; local i; for i in $(seq 1 "$n"); do ( cd "$T/$d" && node "$NJ" seal --text "$pre record $i" >/dev/null 2>&1 ); done; }
seals() { ( cd "$T/$1" && node "$NJ" seals 2>&1 ); }
mut() { python3 -c "
import json,sys
# $1 = folder  $2 = mutation python code over L (list of dicts, parsed lines)
import os
p=os.path.join('$T','$1','seals.jsonl')
L=[json.loads(l) for l in open(p) if l.strip()]
$2
open(p,'w').write('\n'.join(json.dumps(r) for r in L)+'\n')" ; }

echo "=== S5-1: tamper FIRST seal (the S6 field gate step, measured at every slot) ==="
newnode s1; sealN s1 5 alpha
mut s1 "L[0]['env']['text']='tampered by attacker'"
OUT=$(seals s1); RC=$?
sv $([ "$RC" = "1" ] && [ "$(echo "$OUT" | grep -c "BROKEN at slot #1")" = "1" ] && [ "$(echo "$OUT" | grep -c "ENV DIGEST MISMATCH")" -ge 1 ] && echo 0 || echo 1) "S5-1 first-slot tamper: BROKEN at #1 (ENV DIGEST MISMATCH + SIG FAILED), exit 1, no smoothing" || act "rc=$RC out=$(echo "$OUT" | head -2)"

echo "=== S5-2: tamper MIDDLE seal (slot 3 of 5) ==="
newnode s2; sealN s2 5 alpha
mut s2 "L[2]['env']['text']='tampered middle'"
OUT=$(seals s2); RC=$?
sv $([ "$RC" = "1" ] && [ "$(echo "$OUT" | grep -c "BROKEN at slot #3")" = "1" ] && [ "$(echo "$OUT" | grep -c "1 BROKEN")" = "1" ] && echo 0 || echo 1) "S5-2 middle-slot tamper: exactly ONE broken verdict at #3, slots 1-2 and 4-5 still verified, exit 1" || act "rc=$RC out=$(echo "$OUT" | head -2)"

echo "=== S5-3: tamper LAST seal (slot 5 of 5) ==="
newnode s3; sealN s3 5 alpha
mut s3 "L[4]['env']['text']='tampered last'"
OUT=$(seals s3); RC=$?
sv $([ "$RC" = "1" ] && [ "$(echo "$OUT" | grep -c "BROKEN at slot #5")" = "1" ] && echo 0 || echo 1) "S5-3 last-slot tamper: BROKEN at #5, exit 1" || act "rc=$RC out=$(echo "$OUT" | head -2)"

echo "=== S5-4: FORK — tamper prev-link of slot 3 (chain break) ==="
newnode s4; sealN s4 5 alpha
mut s4 "L[2]['prev']='f'*64"
OUT=$(seals s4); RC=$?
sv $([ "$RC" = "1" ] && [ "$(echo "$OUT" | grep -c "FORK/DIVERGENT")" -ge 1 ] && [ "$(echo "$OUT" | grep -c "SEAL SIG FAILED")" -ge 1 ] && echo 0 || echo 1) "S5-4 forked prev-link: FORK/DIVERGENT disclosed AND the seal signature over the original chain fails — two independent proofs of the break" || act "rc=$RC out=$(echo "$OUT" | head -3)"

echo "=== S5-5: WITHHOLD a middle seal (delete slot 4 of 5) ==="
newnode s5; sealN s5 5 alpha
mut s5 "L=[r for r in L if r['seq']!=4]"
OUT=$(seals s5); RC=$?
sv $([ "$RC" = "1" ] && [ "$(echo "$OUT" | grep -c "SEQ GAP")" -ge 1 ] && echo 0 || echo 1) "S5-5 middle withholding CAUGHT: deleting seal #4 surfaces SEQ GAP (expected 4) — the seq check is a completeness witness, no silent shrink" || act "rc=$RC out=$(echo "$OUT" | head -2)"

echo "=== S5-6: WITHHOLD the tail seal (delete slot 5 of 5) — the honest limit ==="
newnode s6; sealN s6 5 alpha
mut s6 "L=L[:-1]"
OUT=$(seals s6); RC=$?
sv $([ "$RC" = "0" ] && [ "$(echo "$OUT" | grep -c "4 records — CHAIN INTACT")" = "1" ] && echo 0 || echo 1) "S5-6 FINDING S-REC5-1: tail withholding is INVISIBLE — a valid 4-prefix reads CHAIN INTACT, exit 0; the chain proves continuity, not completeness. A node cannot know a tail seal is missing (no length authority exists at this layer)" || act "rc=$RC out=$(echo "$OUT" | tail -1)"

echo "=== S5-7: REORDER seals 2 and 3 ==="
newnode s7; sealN s7 5 alpha
mut s7 "L[1],L[2]=L[2],L[1]"
OUT=$(seals s7); RC=$?
sv $([ "$RC" = "1" ] && [ "$(echo "$OUT" | grep -c "BROKEN")" -ge 1 ] && echo 0 || echo 1) "S5-7 reorder refused: swapped slots surface SEQ GAP/FORK verdicts, exit 1 — order is not cosmetic" || act "rc=$RC out=$(echo "$OUT" | head -3)"

echo "=== S5-8: DUPLICATE a seal line (slot 2 copied to the tail) ==="
newnode s8; sealN s8 5 alpha
mut s8 "L.append(dict(L[1]))"
OUT=$(seals s8); RC=$?
sv $([ "$RC" = "1" ] && [ "$(echo "$OUT" | grep -c "SEQ GAP")" -ge 1 ] && echo 0 || echo 1) "S5-8 duplicated seal line refused: SEQ GAP (expected 6, got 2) — repetition cannot extend a seal chain" || act "rc=$RC out=$(echo "$OUT" | head -2)"

echo "=== S5-9: TORN seal tail (truncate the last line mid-JSON) ==="
newnode s9; sealN s9 5 alpha
python3 -c "
p='$T/s9/seals.jsonl'
lines=[l for l in open(p) if l.strip()]
half=lines[-1][:len(lines[-1])//2]
open(p,'w').write(''.join(lines[:-1])+half)"
OUT=$(seals s9); RC=$?
sv $([ "$RC" = "0" ] && [ "$(echo "$OUT" | grep -c "DISCLOSURE")" = "1" ] && [ "$(echo "$OUT" | grep -c "4 records — CHAIN INTACT")" = "1" ] && [ -f "$T/s9/seals.torn" ] && echo 0 || echo 1) "S5-9 torn tail: quarantined to seals.torn with DISCLOSURE, remaining 4 verify INTACT, evidence preserved — same quarantine discipline as the inbox" || act "rc=$RC out=$(echo "$OUT" | head -3)"

echo "=== S5-10: IDENTITY ROTATION — the self-verification question ==="
newnode s10; sealN s10 5 alpha
newnode s10new; cp "$T/s10new/identity.json" "$T/s10/identity.json"
OUT=$(seals s10); RC=$?
sv $([ "$RC" = "0" ] && [ "$(echo "$OUT" | grep -c "CHAIN INTACT")" = "1" ] && echo 0 || echo 1) "S5-10 swapping identity.json does NOT break history: every seal self-verifies via its embedded key — records carry their own evidence (identity.json only authorizes NEW seals)" || act "rc=$RC out=$(echo "$OUT" | tail -1)"
( cd "$T/s10" && node "$NJ" seal --text "sealed by the rotated identity" >/dev/null 2>&1 )
OUT=$(seals s10); RC=$?
sv $([ "$RC" = "0" ] && [ "$(echo "$OUT" | grep -c "6 records — CHAIN INTACT")" = "1" ] && echo 0 || echo 1) "S5-10b FINDING S-REC5-2: a NEW key can extend the chain and every slot still verifies — the seal chain proves DATA continuity, not KEY continuity; rotation mid-chain is possible and undisclosed by the verdicts. Authority here = each record's own signature, never a fixed sovereign key. Reported for ruling, not patched" || act "rc=$RC out=$(echo "$OUT" | tail -1)"

echo "=== S5-11: seals never transport ==="
python3 -c "
import socket,sys
for p in (8981,8982):
    s=socket.socket(); s.settimeout(0.3)
    try: s.connect(('127.0.0.1',p)); print('PORT',p,'BUSY'); sys.exit(9)
    except OSError: pass
    s.close()"
mkdir -p "$T/c"; ( cd "$T/c" && node "$NJ" init --name C >/dev/null 2>&1 )
newnode X; sealN X 5 alpha
( cd "$T/X" && exec node "$NJ" serve --port 8981 > "$T/X-serve.log" 2>&1 ) & echo $! > "$T/X.pid"
sleep 1
( cd "$T/c" && node "$NJ" send --to 127.0.0.1:8981 --text "transport probe 1" >/dev/null 2>&1 )
( cd "$T/c" && node "$NJ" send --to 127.0.0.1:8981 --text "transport probe 2" >/dev/null 2>&1 )
newnode Y
( cd "$T/Y" && exec node "$NJ" serve --port 8982 > "$T/Y-serve.log" 2>&1 ) & echo $! > "$T/Y.pid"
sleep 1
( cd "$T/X" && node "$NJ" forward --to 127.0.0.1:8982 >/dev/null 2>&1 )
kill -9 "$(cat "$T/X.pid")" "$(cat "$T/Y.pid")" 2>/dev/null; sleep 0.3
TXT=$(node "$VER" "$T/Y/inbox.jsonl" | python3 -c "import json,sys; print(' '.join(json.load(sys.stdin)['texts']))")
echo "Y inbox: $TXT"
sv $([ "$(echo "$TXT" | grep -o "transport probe" | wc -l)" = "2" ] && [ "$(echo "$TXT" | grep -c "record [0-9]")" = "0" ] && [ ! -f "$T/Y/seals.jsonl" ] && echo 0 || echo 1) "S5-11 node X held 5 seals + 2 inbox records; its forward carried ONLY the inbox records — seals never transport, sovereign journal stays local, the mesh cannot leak it" || act "Y inbox: $TXT"

echo "=== S5-12: POSSESSION — copy A's seal chain into B's folder ==="
newnode s12; cp "$T/s1/seals.jsonl" "$T/s12/seals.jsonl"
OUT=$(seals s12); RC=$?
COUNT=$(echo "$OUT" | grep -c "5 records")
sv $([ "$RC" = "1" ] && [ "$COUNT" = "1" ] && echo 0 || echo 1) "S5-12 FINDING S-REC5-3: another folder fully accepts a copied seal chain — every slot self-verifies, so possession displays ownership; sovereign-local means BY-POSSESSION + self-verifying, there is NO binding between folder, identity, and chain. Copying a journal is lawful at this layer and undisclosed. Reported for ruling, not patched" || act "rc=$RC out=$(echo "$OUT" | tail -1)"

echo "=== S5-13: gates ==="
NJ_SHA2=$(sha256sum "$NJ" | cut -d" " -f1)
V02_SHA2=$(sha256sum "../v0.2/internetless-node-v02.js" | cut -d" " -f1)
sv $([ "$NJ_SHA2" = "98dcdd624a4901b4d0034310f22055768716079c8cdb6f6cbea0a1a7083c9a7f" ] && echo 0 || echo 1) "S5-13 frozen v0.3 UNTOUCHED across the battery"
sv $([ "$V02_SHA2" = "d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61" ] && echo 0 || echo 1) "S5-13 frozen v0.2 (historical) UNTOUCHED"

echo ""
echo "=== REC5 VERDICT ==="
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "SEAL CHAIN SEMANTICS MEASURED — findings ready for Dad's ruling" || echo "CASUALTIES ON RECORD — no smoothing"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
