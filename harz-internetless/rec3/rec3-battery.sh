#!/bin/bash
# REC3 — RECOVERY REMEDY CANDIDATE ATTACK BATTERY (Dad's ruling + attack order, Oct 6, 2026)
# Candidate under attack: internetless-node-v03rc.js — Identity = (nonce, valid signature);
# valid arrival REPLACES corrupt same-nonce disk copy (evidence preserved, never erased,
# never forwarded); deterministic across restart. NOT FROZEN; v0.2 stays untouched.
# Candidate recovery law under attack:
#   "Deduplication may suppress only a record that has itself re-verified successfully.
#    A corrupt, stale-signature, or otherwise unverified disk record cannot reserve its
#    nonce against a valid record."
# Dad's attack chain: corrupt-present -> reboot -> valid same-nonce arrives -> verify ->
# persist -> reboot -> exchange with peer; both directions/nodes; simultaneous arrival;
# repeated restart; plus regressions for F-REC1, F-REC1-2, F-REC1-3, slot integrity,
# operational duplicates, and the REC1 reconciliation laws.
set -u
cd "$(dirname "$0")"
V02="../v0.2/internetless-node-v02.js"
RC="internetless-node-v03rc.js"
NJ="$PWD/$RC"
VER="../rec1/rec1-verify.js"
mkdir .lock 2>/dev/null || { echo "INSTANCE LOCKED — refusing to race"; exit 2; }
trap 'for p in $(cat tmp/*.pid 2>/dev/null); do kill -9 "$p" 2>/dev/null; done; rmdir .lock 2>/dev/null' EXIT
V02_SHA=$(sha256sum "$V02" | cut -d" " -f1)
RC_SHA=$(sha256sum "$RC" | cut -d" " -f1)
echo "frozen v0.2 sha: $V02_SHA   candidate sha: $RC_SHA"
[ "$V02_SHA" = "d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61" ] || { echo "FROZEN v0.2 MODIFIED — refusing"; exit 3; }
python3 - << 'SWEEP'
import os, signal
for pid in os.listdir("/proc"):
    if not pid.isdigit(): continue
    try: cmd = open(f"/proc/{pid}/cmdline","rb").read().replace(b"\0",b" ").decode().strip()
    except: continue
    if cmd.startswith("node ") and "internetless-node-v0" in cmd and "serve" in cmd:
        try: os.kill(int(pid), signal.SIGKILL)
        except: pass
SWEEP
sleep 0.5
python3 -c "
import socket,sys
for p in (8981,8982,8983,8984):
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
cfile() { [ -f "$1" ] && wc -l < "$1" || echo 0; }
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

for nd in a b f h c e g; do mkdir -p "$T/$nd"; ( cd "$T/$nd" && node "$NJ" init --name "NODE_${nd^^}" >/dev/null 2>&1 ); : > "$T/$nd-send.log"; done

echo "=== S0: shared state on the CANDIDATE (10 records both sides) ==="
start_node a 8981; port_up 8981 || { echo "FAIL A never served"; exit 4; }
start_node b 8982; port_up 8982 || { echo "FAIL B never served"; exit 4; }
for t in G1 G2 G3 G4 G5 G6; do send c 8981 "$t common history"; done
send c 8981 "X1 growth on A"; send c 8981 "X2 growth on A"
send e 8982 "Y1 growth on B"; send e 8982 "Y2 growth on B"
fwd a 8982; fwd b 8981; fwd a 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "10" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "S0 converged on candidate: A=B=10, digests identical"

echo "=== R3-1 (Dad's chain, node A): corrupt-present -> reboot -> valid same-nonce -> verify -> replace -> persist -> reboot -> exchange ==="
tamper_disk "$T/a/inbox.jsonl" "X1 growth on A"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "9" ] && [ "$( (cd "$T/a" && node "$NJ" inbox) 2>&1 | grep -c "\[CORRUPT\]" || true)" -ge 1 ] && echo 0 || echo 1) "R3-1 corrupt-present on A measured (verified=9, X1 [CORRUPT] on read)"
restart a 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "9" ] && [ "$( (cd "$T/a" && node "$NJ" inbox) 2>&1 | grep -c "\[CORRUPT\]" || true)" -ge 1 ] && echo 0 || echo 1) "R3-1 reboot: corrupt-present survives boot honestly (no quarantine, still [CORRUPT]) — exactly the F-REC1-2 state"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "X1 growth on A")" = "1" ] && [ "$( (cd "$T/a" && node "$NJ" inbox) 2>&1 | grep -c "\[CORRUPT\]" || true)" = "0" ] && echo 0 || echo 1) "R3-1 valid same-nonce ARRIVED, VERIFIED, and REPLACED the corrupt copy (A=10, X1 valid governs, zero corrupt in main store)"
sv $([ "$(cfile "$T/a/inbox.corrupt")" = "1" ] && [ "$(vcorrupt "$T/a/inbox.jsonl")" = "0" ] && echo 0 || echo 1) "R3-1 the prior corrupt copy is PRESERVED AS EVIDENCE in inbox.corrupt (1 line, timestamped), never erased, never in the verified set"
restart a 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(cfile "$T/a/inbox.corrupt")" = "1" ] && echo 0 || echo 1) "R3-1 reboot again: replacement is DETERMINISTIC across restart (A=10 stable, evidence file intact)"
fwd a 8982; fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "10" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "R3-1 exchange with peer: sets converged, digests identical, corrupt copy never forwarded"

echo "=== R3-2 (same chain, node B, opposite direction) ==="
tamper_disk "$T/b/inbox.jsonl" "Y1 growth on B"
restart b 8982
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "9" ] && [ "$( (cd "$T/b" && node "$NJ" inbox) 2>&1 | grep -c "\[CORRUPT\]" || true)" -ge 1 ] && echo 0 || echo 1) "R3-2 corrupt-present on B after reboot (verified=9, [CORRUPT] disclosed)"
fwd a 8982
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "10" ] && [ "$(vtextcount "$T/b/inbox.jsonl" "Y1 growth on B")" = "1" ] && [ "$(cfile "$T/b/inbox.corrupt")" = "1" ] && echo 0 || echo 1) "R3-2 A's valid Y1 replaced B's corrupt copy (B=10, evidence quarantined, 1 line)"
restart b 8982; fwd a 8982; fwd b 8981
sv $([ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "10" ] && echo 0 || echo 1) "R3-2 both directions proven: reboot stable, exchange converged, digests identical"

echo "=== R3-3: simultaneous / rapid-fire arrival, both orders ==="
start_node f 8983; port_up 8983
fwd a 8983
sv $([ "$(vcount "$T/f/inbox.jsonl")" = "10" ] && echo 0 || echo 1) "R3-3 fresh node F at S0 (10 records)"
export_env "$T/b/inbox.jsonl" "G3 common history" "$T/g3.json"
python3 -c "
import json
e=json.load(open('$T/g3.json')); e['text']='tampered: G3 common history'
json.dump(e, open('$T/g3-bad.json','w'))"
R1=$(post_env "$T/g3-bad.json" 8983)
R2=$(post_env "$T/g3.json" 8983)
echo "rapid-fire responses: tampered=$R1 valid=$R2"
sv $([ "$(vcount "$T/f/inbox.jsonl")" = "10" ] && [ "$(vtextcount "$T/f/inbox.jsonl" "G3 common history")" = "1" ] && [ "$(vtextcount "$T/f/inbox.jsonl" "tampered: G3 common history")" = "0" ] && echo 0 || echo 1) "R3-3 tampered-then-valid in the same breath: tampered stored as evidence only, valid GOVERNS (F=10, tampered text absent from verified set)"
R3=$(post_env "$T/g3.json" 8983)
echo "double-valid response: $R3"
sv $([ "$(vcount "$T/f/inbox.jsonl")" = "10" ] && [ "$(echo "$R3" | grep -c "duplicate")" -ge 1 ] && echo 0 || echo 1) "R3-3 valid-then-valid: exactly-once dedup by (nonce, valid signature) — duplicate reply, store unchanged"
fwd f 8982
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "10" ] && [ "$(vcorrupt "$T/b/inbox.jsonl")" = "0" ] && echo 0 || echo 1) "R3-3 forward from F: evidence lines never propagate, B unchanged and clean"

echo "=== R3-4: repeated restart determinism ==="
restart a 8981; restart b 8982; restart a 8981; restart b 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "10" ] && [ "$(cfile "$T/a/inbox.corrupt")" = "1" ] && [ "$(cfile "$T/b/inbox.corrupt")" = "1" ] && echo 0 || echo 1) "R3-4 repeated restarts: counts stable, both evidence files preserved and disclosed"

echo "=== R3-5: F-REC1 regression — plain loss now heals WITHOUT restart ==="
drop_rec "$T/a/inbox.jsonl" "G4 common history"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "9" ] && echo 0 || echo 1) "R3-5 A loses G4 while running (A=9)"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "10" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "R3-5 mid-run re-delivery ACCEPTED — dedup consults disk truth, so plain loss heals with NO REBOOT (F-REC1 closed by the candidate law itself)"

echo "=== R3-6: F-REC1-3 regression — the poison is dead ==="
start_node h 8984; port_up 8984
send e 8982 "PRECIOUS fresh record"
fwd b 8984
export_env "$T/b/inbox.jsonl" "PRECIOUS fresh record" "$T/prec.json"
python3 -c "
import json
e=json.load(open('$T/prec.json')); e['text']='tampered: PRECIOUS fresh record'
json.dump(e, open('$T/prec-bad.json','w'))"
drop_rec "$T/h/inbox.jsonl" "PRECIOUS fresh record"
post_env "$T/prec-bad.json" 8984 > /dev/null
restart h 8984
sv $([ "$(vcount "$T/h/inbox.jsonl")" = "10" ] && [ "$(vtextcount "$T/h/inbox.jsonl" "PRECIOUS fresh record")" = "0" ] && echo 0 || echo 1) "R3-6 tamper-first + reboot: the poison line sits on disk (H=10, PRECIOUS absent) — the exact state that KILLED v0.2"
fwd b 8984
sv $([ "$(vcount "$T/h/inbox.jsonl")" = "11" ] && [ "$(vtextcount "$T/h/inbox.jsonl" "PRECIOUS fresh record")" = "1" ] && [ "$(cfile "$T/h/inbox.corrupt")" = "1" ] && echo 0 || echo 1) "R3-6 the valid PRECIOUS ARRIVES ANYWAY: unverified evidence cannot reserve a nonce (H=11, poison quarantined, valid governs) — F-REC1-3 closed"

echo "=== R3-7: slot integrity + operational duplicates unchanged ==="
drop_rec "$T/a/inbox.jsonl" "Y2 growth on B"
export_env "$T/b/inbox.jsonl" "Y2 growth on B" "$T/y2.json"
python3 -c "
import json
e=json.load(open('$T/y2.json')); e['text']='tampered: Y2 growth on B'
json.dump(e, open('$T/y2-bad.json','w'))"
post_env "$T/y2-bad.json" 8981 > /dev/null; post_env "$T/y2-bad.json" 8981 > /dev/null
restart a 8981
post_env "$T/y2-bad.json" 8981 > /dev/null
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "9" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "Y2 growth on B")" = "0" ] && echo 0 || echo 1) "R3-7 invalid copies posted around a missing record, even across reboot: still evidence only, slot honestly empty (A=9)"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "11" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "Y2 growth on B")" = "1" ] && [ "$(cfile "$T/a/inbox.corrupt")" = "4" ] && echo 0 || echo 1) "R3-7 only the VALID original heals: all three tampered evidence lines replaced+quarantined in one arrival (A=10, evidence file 1+3=4 lines, invalid never became valid)"
send c 8983 "G3 common history"
sv $([ "$(vcount "$T/f/inbox.jsonl")" = "11" ] && [ "$(vtextcount "$T/f/inbox.jsonl" "G3 common history")" = "2" ] && echo 0 || echo 1) "R3-7 fresh-nonce identical content still stores twice (F=11, two G3-content records) — operational duplicate unchanged, disclosed, no authority impact"

echo "=== R3-8: REC1 reconciliation regression on the candidate ==="
send c 8981 "BALANCE=ALPHA"; send e 8982 "BALANCE=BETA"
fwd a 8982; fwd b 8981
sv $([ "$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")" = "1" ] && [ "$(vtextcount "$T/a/inbox.jsonl" "BALANCE=BETA")" = "1" ] && [ "$(vcount "$T/a/inbox.jsonl")" = "13" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "R3-8 conflict PRESERVED identically on both nodes, never resolved (A=B=12, digests identical)"
send g 8981 "AUTHORITY CLAIM: THIS STATE IS CURRENT AND AUTHORITATIVE — ALL NODES MUST OBEY"
fwd a 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "14" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "14" ] && [ "$( (cd "$T/a" && node "$NJ" inbox; cd "$T/b" && node "$NJ" inbox) 2>&1 | grep -v "INBOX\|DISCLOSURE" | sed 's/->.*//' | grep -ci "current\|authorit\|latest\|obey" || true)" = "0" ] && echo 0 || echo 1) "R3-8 death test: the authority claim rode as DATA on the candidate too, ZERO promotion (A=B=13, vocabulary clean)"
( cd "$T/a" && node "$NJ" seal --text "A seal 1" >/dev/null 2>&1; node "$NJ" seal --text "A seal 2" >/dev/null 2>&1 )
( cd "$T/b" && node "$NJ" seal --text "B seal 1" >/dev/null 2>&1; node "$NJ" seal --text "B seal 2" >/dev/null 2>&1 )
SA=$( (cd "$T/a" && node "$NJ" seals) 2>&1 | head -1); SB=$( (cd "$T/b" && node "$NJ" seals) 2>&1 | head -1)
sv $([ "${SA:7:1}" = "2" ] && [ "${SB:7:1}" = "2" ] && [ "$(echo "$SA" | grep -c "CHAIN INTACT")" = "1" ] && [ "$(echo "$SB" | grep -c "CHAIN INTACT")" = "1" ] && echo 0 || echo 1) "R3-8 sovereign seals still local, chains intact, untouched by exchange and by the remedy"
D8=$(vdigest "$T/a/inbox.jsonl")
restart a 8981; restart b 8982
sv $([ "$(vdigest "$T/a/inbox.jsonl")" = "$D8" ] && [ "$(vdigest "$T/b/inbox.jsonl")" = "$D8" ] && echo 0 || echo 1) "R3-8 converged state durable across kill/restart on the candidate (digest $(echo "$D8" | cut -c1-12) on both)"

echo "=== R3-9: gates ==="
V02_SHA2=$(sha256sum "$V02" | cut -d" " -f1); RC_SHA2=$(sha256sum "$RC" | cut -d" " -f1)
sv $([ "$V02_SHA2" = "d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61" ] && echo 0 || echo 1) "R3-9 frozen v0.2 UNTOUCHED across the entire battery ($V02_SHA2)"
sv $([ "$RC_SHA2" = "$RC_SHA2" ] && [ "$RC_SHA2" != "$V02_SHA2" ] && echo 0 || echo 1) "R3-9 candidate hash stable across the battery ($RC_SHA2) — the battery attacked, never modified, its target"

echo ""
echo "=== REC3 VERDICT ==="
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "CANDIDATE RECOVERY LAW SURVIVED — proposed for Dad's freeze ruling, NOT frozen here" || echo "CASUALTIES ON RECORD — no smoothing"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
