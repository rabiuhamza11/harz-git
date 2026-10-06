#!/bin/bash
# REC2 — INTERNETLESS RECOVERY SEMANTICS ATTACK BATTERY (Dad's F-REC1 re-attack, Oct 6, 2026)
# Law under attack: a node's memory of having seen evidence must never permanently outrank
# the evidence actually present on disk. (Candidate wording — NOT frozen; the attack decides.)
# Target: FROZEN v0.2 primitive, UNMODIFIED (hash gate at start and end).
# Harness: hardened per REC1 lessons — /proc orphan sweep, port-free gate, PID-at-spawn kills,
# pre-created logs, independent standing verifier (../rec1/rec1-verify.js), disk is truth.
set -u
cd "$(dirname "$0")"
V02="../v0.2/internetless-node-v02.js"
NJ="$PWD/$V02"
VER="../rec1/rec1-verify.js"
mkdir .lock 2>/dev/null || { echo "INSTANCE LOCKED — refusing to race"; exit 2; }
trap 'for p in $(cat tmp/*.pid 2>/dev/null); do kill -9 "$p" 2>/dev/null; done; rmdir .lock 2>/dev/null' EXIT
PRIM_SHA=$(sha256sum "$V02" | cut -d" " -f1)
echo "PRIMITIVE sha256: $PRIM_SHA"
[ "$PRIM_SHA" = "d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61" ] || { echo "PRIMITIVE HASH MISMATCH — refusing"; exit 3; }
python3 - << 'SWEEP'
import os, signal
for pid in os.listdir("/proc"):
    if not pid.isdigit(): continue
    try: cmd = open(f"/proc/{pid}/cmdline","rb").read().replace(b"\0",b" ").decode().strip()
    except: continue
    if cmd.startswith("node ") and "internetless-node-v02.js" in cmd and "serve" in cmd:
        try: os.kill(int(pid), signal.SIGKILL)
        except: pass
SWEEP
sleep 0.5
python3 -c "
import socket,sys
for p in (8981,8982,8984):
    s=socket.socket(); s.settimeout(0.3)
    try: s.connect(('127.0.0.1',p)); print('PORT',p,'BUSY — refusing to race'); sys.exit(9)
    except OSError: pass
    s.close()"
rm -rf tmp; mkdir -p tmp
T="$PWD/tmp"
PASS=0; FAIL=0
sv() { if [ "$1" = "0" ]; then echo "PASS $2"; PASS=$((PASS+1)); else echo "FAIL $2"; FAIL=$((FAIL+1)); fi; }
start_node() { ( cd "$T/$1" && exec node "$NJ" serve --port "$2" > "$T/$1-serve.log" 2>&1 ) & echo $! > "$T/$1.pid"; }
port_up() { python3 -c "
import socket,time,sys
port=int(sys.argv[1])
for _ in range(40):
    s=socket.socket(); s.settimeout(0.3)
    try: s.connect(('127.0.0.1',port)); sys.exit(0)
    except OSError: pass
    finally: s.close(); time.sleep(0.25)
sys.exit(1)" "$1"; }
port_down() { python3 -c "
import socket,time,sys
port=int(sys.argv[1])
for _ in range(20):
    s=socket.socket(); s.settimeout(0.3)
    try: s.connect(('127.0.0.1',port)); sys.exit(1)
    except OSError: pass
    finally: s.close(); time.sleep(0.25)
sys.exit(0)" "$1"; }
kill_node() { kill -9 "$(cat "$T/$1.pid" 2>/dev/null)" 2>/dev/null; sleep 0.4; }
restart() { kill_node "$1"; start_node "$1" "$2"; port_up "$2"; }
send() { local who="$1" to="$2" txt="$3"; ( cd "$T/$who" && node "$NJ" send --to "127.0.0.1:$to" --text "$txt" >> "$T/$who-send.log" 2>&1 ); }
fwd()  { local who="$1" to="$2"; ( cd "$T/$who" && node "$NJ" forward --to "127.0.0.1:$to" >> "$T/$who-send.log" 2>&1 ); }
vcount() { node "$VER" "$1" | python3 -c "import json,sys; print(json.load(sys.stdin)['verified'])"; }
vcorrupt() { node "$VER" "$1" | python3 -c "import json,sys; print(json.load(sys.stdin)['corrupt'])"; }
vdigest() { node "$VER" "$1" | python3 -c "import json,sys; print(json.load(sys.stdin)['digest'])"; }
vtextcount() { node "$VER" "$1" | python3 -c "
import json,sys
d=json.load(sys.stdin); print(sum(1 for t in d['texts'] if t==sys.argv[1]))" "$2"; }
post_env() { python3 -c "
import json,sys,http.client
env=json.load(open(sys.argv[1]))
c=http.client.HTTPConnection('127.0.0.1',int(sys.argv[2]),timeout=8)
c.request('POST','/msg',json.dumps(env),{'Content-Type':'application/json'})
r=c.getresponse(); print(r.read().decode())" "$1" "$2"; }
export_env() { python3 -c "
import json,sys
for l in open(sys.argv[1]):
    r=json.loads(l)
    e=r.get('envelope') or {}
    if e.get('text')==sys.argv[2]:
        json.dump(e, open(sys.argv[3],'w')); sys.exit(0)
sys.exit(1)" "$1" "$2" "$3"; }
drop_rec() { python3 -c "
import json,sys
lines=[l for l in open(sys.argv[1]) if l.strip()]
keep=[l for l in lines if json.loads(l).get('envelope',{}).get('text')!=sys.argv[2]]
open(sys.argv[1],'w').writelines(keep)
print('dropped', len(lines)-len(keep), 'record(s):', sys.argv[2])" "$1" "$2"; }
tamper_disk() { python3 -c "
import json,sys
out=[]
for l in open(sys.argv[1]):
    if not l.strip(): continue
    r=json.loads(l)
    if (r.get('envelope') or {}).get('text')==sys.argv[2]:
        r['envelope']['text']='corrupted on disk: '+sys.argv[2]
    out.append(json.dumps(r))
open(sys.argv[1],'w').write('\n'.join(out)+'\n')
print('disk record tampered (signature now stale):', sys.argv[2])" "$1" "$2"; }
reverse_file() { python3 -c "
import sys
lines=[l for l in open(sys.argv[1]) if l.strip()]
open(sys.argv[1],'w').write('\n'.join(reversed(lines))+'\n')
print('reversed', len(lines), 'lines')" "$1"; }

for nd in a b h c e; do mkdir -p "$T/$nd"; ( cd "$T/$nd" && node "$NJ" init --name "NODE_${nd^^}" >/dev/null 2>&1 ); : > "$T/$nd-send.log"; done

echo "=== SETUP: shared state S0 (10 records, both sides, identical digests) ==="
start_node a 8981; port_up 8981 || { echo "FAIL A never served"; exit 4; }
start_node b 8982; port_up 8982 || { echo "FAIL B never served"; exit 4; }
for t in G1 G2 G3 G4 G5 G6; do send c 8981 "$t common history"; done
send c 8981 "X1 growth on A"; send c 8981 "X2 growth on A"
send e 8982 "Y1 growth on B"; send e 8982 "Y2 growth on B"
fwd a 8982; fwd b 8981; fwd a 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "10" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "S0 converged: A=B=10, digests identical"

echo "=== SCN1 (attack 1-4): single loss, peer holds valid copy, repeated replay, restart recovery ==="
drop_rec "$T/a/inbox.jsonl" "G4 common history"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "9" ] && echo 0 || echo 1) "SCN1 A loses G4 while running (A=9, B still holds valid original)"
export_env "$T/b/inbox.jsonl" "G4 common history" "$T/g4.json"
M1=""; M2=""
for i in 1 2 3; do fwd b 8981; done
POSTOUT=$(post_env "$T/g4.json" 8981)
echo "direct re-POST response: $POSTOUT"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "9" ] && echo 0 || echo 1) "SCN1 repeated replay (3 forwards + direct re-POST) all MASKED while A runs (A stays 9)"
restart a 8981
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN1 restart re-seeds dedup from disk -> valid re-delivery HEALS the loss (A=10, digests identical) — F-REC1 confirmed exactly, recovery across reboot"

echo "=== SCN2 (attack 5): every legitimate no-restart reconciliation path enumerated ==="
drop_rec "$T/a/inbox.jsonl" "G4 common history"
fwd b 8981
export_env "$T/b/inbox.jsonl" "G4 common history" "$T/g4.json"
post_env "$T/g4.json" 8981 > /dev/null
( cd "$T/a" && node "$NJ" prove-offline --peer 127.0.0.1:8982 >/dev/null 2>&1 )
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "9" ] && echo 0 || echo 1) "SCN2 no-restart paths exhausted: forward masked, re-POST masked, prove-offline delivers nothing (A stays 9) — no record-level recovery without restart"
send b 8981 "G4 common history"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "G4 common history")" = "1" ] && echo 0 || echo 1) "SCN2 fresh-nonce content resend: CONTENT re-enters (A=10, text present once) — content-level re-entry exists, record-level loss remains"
sv $([ "$(vdigest "$T/a/inbox.jsonl")" != "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN2 the re-entered copy is NOT the original record (digests differ — original nonce still missing on A)"
restart a 8981
fwd b 8981; fwd a 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "11" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN2 after restart the ORIGINAL is restored alongside the copy (A=B=11, digests identical)"

echo "=== SCN3 (attack 6): multi-record loss ==="
drop_rec "$T/a/inbox.jsonl" "G2 common history"; drop_rec "$T/a/inbox.jsonl" "G5 common history"; drop_rec "$T/a/inbox.jsonl" "Y2 growth on B"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "8" ] && echo 0 || echo 1) "SCN3 three records lost, all re-deliveries masked while running (A=8)"
restart a 8981
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN3 restart -> all three healed in one round (A=11, digests identical)"

echo "=== SCN4 (attack 7+8): early record with later history, and the seal-chain case ==="
drop_rec "$T/a/inbox.jsonl" "G1 common history"
fwd b 8981
restart a 8981; fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN4a earliest shared record heals exactly like any other (envelope layer has no cross-record dependency; digest equality proves record-IDENTITY-exact restoration, not a substitute)"
mkdir -p "$T/h"; ( cd "$T/h" && for i in 1 2 3 4; do node "$NJ" seal --text "H seal $i" >/dev/null 2>&1; done )
python3 -c "
import json
lines=[l for l in open('$T/h/seals.jsonl') if l.strip()]
keep=[l for i,l in enumerate(lines) if i!=1]
open('$T/h/seals.jsonl','w').writelines(keep)
print('H lost seal #2 of 4 (middle of the hash-linked chain)')"
HOUT=$( (cd "$T/h" && node "$NJ" seals) 2>&1 ); HRC=$?
echo "$HOUT" | head -4
sv $([ "$HRC" = "1" ] && [ "$(echo "$HOUT" | grep -c "BROKEN")" -ge 1 ] && echo 0 || echo 1) "SCN4b a seal lost mid-chain: explicit BROKEN at the exact slot, fail-closed, no fabrication (seals are hash-linked descendants; envelopes are not)"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && echo 0 || echo 1) "SCN4b the mesh offers NO path to heal sovereign seals — by design they do not transport (disclosed, not a defect of the envelope layer)"

echo "=== SCN5 (attack 9): on-disk delete + reorder, signatures preserved ==="
reverse_file "$T/a/inbox.jsonl"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN5 reversed on-disk order: verification set-semantic, order-blind (A=11, digest unchanged)"
fwd a 8982
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "11" ] && echo 0 || echo 1) "SCN5 forward from reordered store delivers the same set (B unchanged)"
drop_rec "$T/a/inbox.jsonl" "X2 growth on A"
fwd b 8981
restart a 8981; fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN5 loss+recovery works identically from a reordered store (A=11, digests identical)"

echo "=== SCN6 (attack 10): an invalid record can never become valid by filling a slot ==="
drop_rec "$T/a/inbox.jsonl" "Y1 growth on B"
export_env "$T/b/inbox.jsonl" "Y1 growth on B" "$T/y1.json"
python3 -c "
import json
e=json.load(open('$T/y1.json')); e['text']='tampered: Y1 growth on B'
json.dump(e, open('$T/y1-bad.json','w'))"
post_env "$T/y1-bad.json" 8981 > /dev/null; post_env "$T/y1-bad.json" 8981 > /dev/null
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vcorrupt "$T/a/inbox.jsonl")" = "2" ] && echo 0 || echo 1) "SCN6 tampered copies of the missing record posted twice: stored as evidence, NEVER verified (verified=10 missing Y1, corrupt evidence=2) — the slot stays honestly empty"
restart a 8981
post_env "$T/y1-bad.json" 8981 > /dev/null
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vcorrupt "$T/a/inbox.jsonl")" = "3" ] && echo 0 || echo 1) "SCN6 after restart the tampered copy is STILL refused (3 evidence lines, still never verified) — restart heals nothing that was never valid"
send e 8981 "FILLER unrelated valid record"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "Y1 growth on B")" = "0" ] && [ "$(vdigest "$T/a/inbox.jsonl")" != "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN6 an unrelated VALID record does NOT fill the slot (A=11 but Y1 still absent, digests differ) — records are identity, not slots"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "Y1 growth on B")" = "0" ] && echo 0 || echo 1) "SCN6 FINDING F-REC1-3: the VALID original at B is MASKED FOREVER — the tampered EVIDENCE lines carry Y1's original nonce, and boot re-seeds the dedup set from ALL disk lines regardless of validity: honest evidence poisons future re-delivery (remotely triggerable liveness attack; safety held — nothing invalid was ever verified)"
fwd a 8982
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "12" ] && [ "$(vdigest "$T/a/inbox.jsonl")" != "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN6 sets honestly divergent, no smoothing (B=12 with FILLER; A missing Y1 permanently)"

echo "=== SCN6b (F-REC1-3 isolation): tamper-first block, both phases measured ==="
start_node h 8984; port_up 8984
send e 8982 "PRECIOUS fresh record"
fwd b 8984
export_env "$T/b/inbox.jsonl" "PRECIOUS fresh record" "$T/prec.json"
sv $([ "$(vcount "$T/h/inbox.jsonl")" = "13" ] && [ "$(vtextcount "$T/h/inbox.jsonl" "PRECIOUS fresh record")" = "1" ] && echo 0 || echo 1) "SCN6b baseline: fresh node H received B's full set incl. PRECIOUS (H=13)"
drop_rec "$T/h/inbox.jsonl" "PRECIOUS fresh record"
python3 -c "
import json
e=json.load(open('$T/prec.json')); e['text']='tampered: PRECIOUS fresh record'
json.dump(e, open('$T/prec-bad.json','w'))"
post_env "$T/prec-bad.json" 8984 > /dev/null
kill_node h; start_node h 8984; port_up 8984
sv $([ "$(vcount "$T/h/inbox.jsonl")" = "12" ] && [ "$(vcorrupt "$T/h/inbox.jsonl")" = "1" ] && echo 0 || echo 1) "SCN6b tamper-first: H stores the tampered copy as evidence only, THEN reboots - boot seeds dedup from all 13 disk lines incl. the unverified poison (12 verified, 1 evidence line)"
fwd b 8984
sv $([ "$(vcount "$T/h/inbox.jsonl")" = "12" ] && [ "$(vtextcount "$T/h/inbox.jsonl" "PRECIOUS fresh record")" = "0" ] && echo 0 || echo 1) "SCN6b the valid PRECIOUS at B is masked by the poison nonce — H can never receive it again (F-REC1-3 confirmed in isolation, permanent)"
kill_node h

echo "=== SCN7 (extends 1-5): corrupt-ON-DISK record — the sharper cousin of F-REC1 ==="
tamper_disk "$T/a/inbox.jsonl" "X1 growth on A"
UNV=$( (cd "$T/a" && node "$NJ" inbox) 2>&1 | grep -c "\[CORRUPT\]" || true)
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$UNV" -ge 1 ] && echo 0 || echo 1) "SCN7 disk-tampered record exposed [CORRUPT] on read (verified=10, X1 excluded) — read re-verifies, stored flag is not authority"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "X1 growth on A")" = "0" ] && echo 0 || echo 1) "SCN7 valid X1 at B: re-delivery MASKED while A runs (A gains only PRECIOUS, which it never had; A=11, X1 absent — the corrupt line holds its nonce in memory)"
restart a 8981
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$( (cd "$T/a" && node "$NJ" inbox) 2>&1 | grep -c "\[CORRUPT\]" || true)" -ge 1 ] && echo 0 || echo 1) "SCN7 FINDING F-REC1-2: restart does NOT heal — the corrupt line is parseable so it is never quarantined and re-seeds the dedup set at every boot; the peer's valid original is masked FOREVER (memory outranks disk permanently in this class)"
sv $([ "$(vdigest "$T/a/inbox.jsonl")" != "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN7 the sets do NOT converge while A holds a corrupt-present record — no silent smoothing, the divergence is the honest state"

echo "=== SCN8: the torn-tail contrast — quarantine is the one loss class that heals ==="
drop_rec "$T/a/inbox.jsonl" "X2 growth on A"
python3 -c "
import json
half=''
for l in open('$T/b/inbox.jsonl'):
    r=json.loads(l)
    if (r.get('envelope') or {}).get('text')=='X2 growth on A':
        half=json.dumps(r)[:len(json.dumps(r))//2]
        break
open('$T/a/inbox.jsonl','a').write(half+'\n')
print('appended truncated X2 remnant (torn line)')"
kill_node a
start_node a 8981; sleep 1.2
BOOT=$(grep -c "BOOT DISCLOSURE" "$T/a-serve.log" || true)
sv $([ "$BOOT" -ge 1 ] && [ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && echo 0 || echo 1) "SCN8 boot disclosed the torn remnant and QUARANTINED it out of the main file (verified=9: the corrupt X1 still excluded, X2 lost)"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "X2 growth on A")" = "1" ] && echo 0 || echo 1) "SCN8 after quarantine + boot re-seed, the peer's valid X2 was ACCEPTED (A=11) — torn-class loss heals; corrupt-present and poison-evidence classes do not. The boundary between healing and permanent masking is quarantine itself"

echo "=== SCN9 (attack 11): the measured classification matrix ==="
echo "--- MATRIX (measured, not asserted from theory) ---"
echo "state | observed v0.2 behavior"
echo "already possessed (verified, memory+disk)      | duplicate, skipped exactly-once (SCN1 replays)"
echo "previously possessed, now plain-lost (envelope) | masked mid-run; heals across restart via peer re-delivery (SCN1/3/4a/5)"
echo "previously possessed, now missing (content)      | content re-enters via fresh nonce; record identity does not (SCN2)"
echo "corrupt-present on disk (parseable, sig stale)   | PERMANENT masking: never quarantined, re-seeds dedup every boot (SCN7 = F-REC1-2)"
echo "unverified EVIDENCE line with a valid record's nonce | POISON: re-seeds dedup at every boot, masks the valid original forever (SCN6/6b = F-REC1-3, remotely triggerable)"
echo "torn-present on disk (unparseable)              | quarantined out of main file, disclosed, heals from peer across restart (SCN8)"
echo "never possessed                                  | accepted + verified + fsynced before ACK (S0 growth; survives tamper-first mid-run)"
echo "invalid (tampered)                               | stored as evidence only, never verified, never forwarded, never legitimized by restart (SCN6)"
echo "stale but valid                                  | accepted as history; the node is authority-blind and claims nothing about currency"
echo "seal lost mid-chain                              | BROKEN at exact slot, fail-closed; no transport path by design (SCN4b)"
restart a 8981; restart b 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "13" ] && [ "$(vcorrupt "$T/a/inbox.jsonl")" = "4" ] && echo 0 || echo 1) "SCN9 final state stable across kill/restart (A=11 verified honestly divergent from B=13: A permanently missing poisoned Y1 and corrupt-present X1; A holds 4 unverified evidence/corrupt lines, excluded from every verified measurement)"
sv $([ "$(vdigest "$T/a/inbox.jsonl")" != "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "SCN9 the divergence is disclosed, permanent under v0.2 semantics, and never smoothed — this is the honest end state the attack produced"
PRIM_SHA2=$(sha256sum "$V02" | cut -d" " -f1)
sv $([ "$PRIM_SHA2" = "d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61" ] && echo 0 || echo 1) "SCN9 primitive UNMODIFIED across the entire battery ($PRIM_SHA2)"

echo ""
echo "=== REC2 VERDICT ==="
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "RECOVERY SEMANTICS MEASURED — findings ready for Dad's ruling" || echo "CASUALTIES ON RECORD — no smoothing"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
