#!/bin/bash
# REC1 — INTERNETLESS RECONCILIATION ATTACK BATTERY (Dad's plan, Oct 6, 2026)
# Target: the FROZEN v0.2 primitive, UNMODIFIED (sha checked at start and end).
# Question under attack: two sovereign nodes independently accept valid records during a
# partition — can they later exchange those records and deterministically converge without
# either node becoming an authority?
# RUN-01 LESSONS (harness defects, logged unsmoothed in rec1-run-01.log): expected counts were
# wrong (each node receives BOTH sides' growth: 6 shared + 4 + 4 = 14); a tampered envelope
# RECEIVED is lawfully [UNVERIFIED] (never verified at receipt) — [CORRUPT] is a stored-verified
# record that fails NOW; the node's refusal line is "refused/unreachable" (no stack trace);
# the dead-ack check was vacuous; R7's baseline must be captured immediately before the kill.
# Harness law: PIDs captured at spawn; port-down/port-up socket-verified; no pkill/ps assumptions.
set -u
cd "$(dirname "$0")"
V02="../v0.2/internetless-node-v02.js"
NJ="$PWD/$V02"
VER="rec1-verify.js"
mkdir .lock 2>/dev/null || { echo "INSTANCE LOCKED — refusing to race"; exit 2; }
trap 'for p in $(cat tmp/*.pid 2>/dev/null); do kill -9 "$p" 2>/dev/null; done; rmdir .lock 2>/dev/null' EXIT
PRIM_SHA=$(sha256sum "$V02" | cut -d" " -f1)
echo "PRIMITIVE sha256: $PRIM_SHA"
[ "$PRIM_SHA" = "d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61" ] || { echo "PRIMITIVE HASH MISMATCH — refusing to attack a different machine"; exit 3; }
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
for p in (8981,8982,8983):
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
send() { local who="$1" to="$2" txt="$3"; ( cd "$T/$who" && node "$NJ" send --to "127.0.0.1:$to" --text "$txt" >> "$T/$who-send.log" 2>&1 ); }
fwd()  { local who="$1" to="$2"; ( cd "$T/$who" && node "$NJ" forward --to "127.0.0.1:$to" >> "$T/$who-send.log" 2>&1 ); }
vcount() { node "$VER" "$1" | python3 -c "import json,sys; print(json.load(sys.stdin)['verified'])"; }
vdigest() { node "$VER" "$1" | python3 -c "import json,sys; print(json.load(sys.stdin)['digest'])"; }
vtexts() { node "$VER" "$1" | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)['texts']))"; }
post_env() { python3 -c "
import json,sys,http.client
env=json.load(open(sys.argv[1]))
c=http.client.HTTPConnection('127.0.0.1',int(sys.argv[2]),timeout=8)
c.request('POST','/msg',json.dumps(env),{'Content-Type':'application/json'})
r=c.getresponse(); print(r.status, r.read().decode())" "$1" "$2"; }

for nd in a b f c e g; do mkdir -p "$T/$nd"; ( cd "$T/$nd" && node "$NJ" init --name "NODE_${nd^^}" >/dev/null 2>&1 ); done
for nd in a b f c e g; do : > "$T/$nd-send.log"; done

echo "=== R0 GENESIS: shared known starting state ==="
start_node a 8981; port_up 8981 || { echo "FAIL A never served"; exit 4; }
start_node b 8982; port_up 8982 || { echo "FAIL B never served"; exit 4; }
for t in "G1 common history" "G2 common history" "G3 common history" "G4 common history" "G5 common history" "G6 common history"; do send c 8981 "$t"; done
fwd a 8982
sv $([ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && [ "$(vcount "$T/a/inbox.jsonl")" = "6" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "6" ] && echo 0 || echo 1) "R0 shared genesis: A=6 B=6, digests identical"

echo "=== R1 TRUE PARTITION + TWO-SIDED INDEPENDENT GROWTH + RECONNECT + EXCHANGE ==="
kill_node b; port_down 8982 || { echo "FAIL B port still open"; FAIL=$((FAIL+1)); }
REF_BEFORE=$(grep -c "refused/unreachable" "$T/a-send.log" 2>/dev/null || true)
fwd a 8982
REF_AFTER=$(grep -c "refused/unreachable" "$T/a-send.log" 2>/dev/null || true)
sv $([ "$REF_AFTER" -gt "$REF_BEFORE" ] && echo 0 || echo 1) "R1 exchange attempt during B-down honestly refused (evidence: $REF_AFTER refusal lines, no phantom delivery)"
send c 8981 "X1 partition growth on A"
send c 8981 "BALANCE=ALPHA"
send c 8981 "X3 partition growth on A"
send c 8981 "X4 partition growth on A"
( cd "$T/b" && node "$NJ" seal --text "B LOCAL VIEW: ALPHA" >/dev/null 2>&1 )
( cd "$T/b" && node "$NJ" seal --text "B offline sovereign record 2" >/dev/null 2>&1 )
start_node b 8982; port_up 8982 || { echo "FAIL B did not return"; FAIL=$((FAIL+1)); }
kill_node a; port_down 8981 || { echo "FAIL A port still open"; FAIL=$((FAIL+1)); }
REFB_BEFORE=$(grep -c "refused/unreachable" "$T/b-send.log" 2>/dev/null || true)
fwd b 8981
REFB_AFTER=$(grep -c "refused/unreachable" "$T/b-send.log" 2>/dev/null || true)
sv $([ "$REFB_AFTER" -gt "$REFB_BEFORE" ] && echo 0 || echo 1) "R1 exchange attempt during A-down honestly refused (evidence: $REFB_AFTER refusal lines)"
send e 8982 "Y1 partition growth on B"
send e 8982 "BALANCE=BETA"
send e 8982 "Y3 partition growth on B"
send e 8982 "Y4 partition growth on B"
( cd "$T/a" && node "$NJ" seal --text "A LOCAL VIEW: BETA" >/dev/null 2>&1 )
( cd "$T/a" && node "$NJ" seal --text "A offline sovereign record 2" >/dev/null 2>&1 )
start_node a 8981; port_up 8981 || { echo "FAIL A did not return"; FAIL=$((FAIL+1)); }
fwd a 8982
fwd b 8981
FP_BEFORE=$(vcount "$T/b/inbox.jsonl")
fwd a 8982
FP_AFTER=$(vcount "$T/b/inbox.jsonl")
sv $([ "$FP_AFTER" = "$FP_BEFORE" ] && echo 0 || echo 1) "R1 gossip at fixpoint: second exchange round delivered nothing new"
GA=$(vcount "$T/a/inbox.jsonl"); GB=$(vcount "$T/b/inbox.jsonl")
sv $([ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && [ "$GA" = "14" ] && [ "$GB" = "14" ] && echo 0 || echo 1) "R1 converged: A=$GA B=$GB identical verified sets (6 shared + both sides' 4 independent each), digest $(vdigest "$T/a/inbox.jsonl" | cut -c1-12)"
TA=$(vtexts "$T/a/inbox.jsonl"); TB=$(vtexts "$T/b/inbox.jsonl")
sv $([ "$TA" = "$TB" ] && [ "$(echo "$TA" | grep -c "BALANCE=ALPHA")" = "1" ] && [ "$(echo "$TA" | grep -c "BALANCE=BETA")" = "1" ] && echo 0 || echo 1) "R1 conflict PRESERVED identically on both nodes: BALANCE=ALPHA and BALANCE=BETA both present, never resolved"
SA=$( (cd "$T/a" && node "$NJ" seals) 2>&1 | head -1); SB=$( (cd "$T/b" && node "$NJ" seals) 2>&1 | head -1)
sv $([ "${SA:7:1}" = "2" ] && [ "${SB:7:1}" = "2" ] && [ "$(echo "$SA" | grep -c CHAIN)" -ge 1 ] && [ "$(echo "$SB" | grep -c CHAIN)" -ge 1 ] && echo 0 || echo 1) "R1 sovereign seal chains LOCAL and untouched by exchange (A=2 B=2, both CHAIN INTACT)"
LA=$( (cd "$T/a" && node "$NJ" inbox) 2>&1 | grep -v "INBOX\|DISCLOSURE" | sed 's/->.*//' | grep -ci "current\|authorit\|latest" || true); LB=$( (cd "$T/b" && node "$NJ" inbox) 2>&1 | grep -v "INBOX\|DISCLOSURE" | sed 's/->.*//' | grep -ci "current\|authorit\|latest" || true)
sv $([ "$LA" = "0" ] && [ "$LB" = "0" ] && echo 0 || echo 1) "R1 node vocabulary law: zero authority claims in node output (A=$LA B=$LB)"
DA1=$(vdigest "$T/a/inbox.jsonl")

echo "=== R2 KILL/RESTART DURABILITY OF THE CONVERGED STATE ==="
kill_node a; kill_node b; port_down 8981 || FAIL=$((FAIL+1)); port_down 8982 || FAIL=$((FAIL+1))
ACK_BEFORE=$(grep -c "PEER VERIFIED" "$T/c-send.log" 2>/dev/null || true)
send c 8981 "must be refused while A is dead"
ACK_AFTER=$(grep -c "PEER VERIFIED" "$T/c-send.log" 2>/dev/null || true)
sv $([ "$ACK_AFTER" = "$ACK_BEFORE" ] && echo 0 || echo 1) "R2 send to dead A: refused, zero phantom durable acks ($ACK_BEFORE -> $ACK_AFTER)"
start_node a 8981; start_node b 8982; port_up 8981; port_up 8982
sv $([ "$(vdigest "$T/a/inbox.jsonl")" = "$DA1" ] && [ "$(vdigest "$T/b/inbox.jsonl")" = "$DA1" ] && echo 0 || echo 1) "R2 converged state durable across kill -9 + restart from disk (both digests unchanged)"

echo "=== R3 DUPLICATES + REPLAY (same-envelope and fresh-nonce) ==="
fwd a 8982
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "14" ] && echo 0 || echo 1) "R3 same-envelope full-inbox replay deduped exactly-once (B stays $(vcount "$T/b/inbox.jsonl"))"
python3 -c "
import json
for ln in open('$T/b/inbox.jsonl'):
    r=json.loads(ln)
    if r.get('envelope',{}).get('text')=='Y1 partition growth on B':
        json.dump(r['envelope'], open('$T/replay.json','w')); break"
post_env "$T/replay.json" 8981 | head -1
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "14" ] && echo 0 || echo 1) "R3 captured-envelope re-POST deduped by nonce (A stays $(vcount "$T/a/inbox.jsonl"))"
send e 8982 "BALANCE=BETA"
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "15" ] && echo 0 || echo 1) "R3 fresh-nonce identical resend STORED (B=15) — known v0.3 finding re-measured, disclosed, not patched"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "15" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "R3 sets re-converged carrying the duplicate (A=B=15, identical digests)"

echo "=== R4 REORDERING: reverse-order delivery to a fresh node ==="
start_node f 8983; port_up 8983
python3 -c "
import json,http.client,time
envs=[json.loads(l)['envelope'] for l in open('$T/b/inbox.jsonl')]
envs=[e for e in envs if e]
for e in reversed(envs):
    c=http.client.HTTPConnection('127.0.0.1',8983,timeout=8)
    c.request('POST','/msg',json.dumps(e),{'Content-Type':'application/json'})
    c.getresponse().read(); c.close(); time.sleep(0.05)
print('posted', len(envs), 'envelopes in reverse')"
sv $([ "$(vcount "$T/f/inbox.jsonl")" = "15" ] && [ "$(vdigest "$T/f/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "R4 reverse-arrival convergence: F=$(vcount "$T/f/inbox.jsonl"), digest identical to B — set equality is order-independent"

echo "=== R5 MISSING RECORD: evidence-based healing + honest absence ==="
python3 -c "
import json
lines=[l for l in open('$T/a/inbox.jsonl') if l.strip()]
keep=[l for l in lines if json.loads(l).get('envelope',{}).get('text')!='Y3 partition growth on B']
open('$T/a/inbox.jsonl','w').writelines(keep)
print('A lost Y3:', len(lines)-len(keep), 'record(s)')"
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "14" ] && echo 0 || echo 1) "R5 A's local loss measured (A=14, Y3 gone)"
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "14" ] && echo 0 || echo 1) "R5 FINDING F-REC1 measured: mid-run re-delivery MASKED by the boot-seeded in-memory dedup set (A stays 14; the loss is NOT healed while the process runs) — operational/liveness finding, disclosed, no authority impact, reported for ruling"
kill_node a; start_node a 8981; port_up 8981
fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "15" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "R5 healed through held evidence AFTER RESTART re-seeds dedup from disk (A restored to 15, digests identical) — durability recovers across a reboot"
send e 8982 "GHOST nobody will hold"
python3 -c "
import json
lines=[l for l in open('$T/b/inbox.jsonl') if l.strip()]
keep=[l for l in lines if json.loads(l).get('envelope',{}).get('text')!='GHOST nobody will hold']
open('$T/b/inbox.jsonl','w').writelines(keep)"
fwd a 8982; fwd b 8981
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "15" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "15" ] && echo 0 || echo 1) "R5 honest absence: record nobody holds is absent on BOTH sides, never fabricated (A=B=15)"

echo "=== R6 TAMPERED + MALICIOUS + THE AUTHORITY-INJECTION DEATH TEST ==="
python3 -c "
import json
for l in open('$T/a/inbox.jsonl'):
    r=json.loads(l); e=r.get('envelope') or {}
    if e.get('text')=='X1 partition growth on A':
        e['text']='tampered by attacker'
        json.dump(e, open('$T/tamper.json','w')); break"
post_env "$T/tamper.json" 8981 | head -1
UNV=$( (cd "$T/a" && node "$NJ" inbox) 2>&1 | grep -c "\[UNVERIFIED\]" || true)
sv $([ "$UNV" -ge 1 ] && echo 0 || echo 1) "R6 tampered record refused at receipt, stored as evidence, displayed [UNVERIFIED] on read ($UNV) — disk label never trusted"
DA6=$(vdigest "$T/a/inbox.jsonl")
fwd a 8982
GHOST_T=$(grep -c "tampered by attacker" "$T/b/inbox.jsonl" 2>/dev/null || true)
UNVB=$( (cd "$T/b" && node "$NJ" inbox) 2>&1 | grep -c "\[UNVERIFIED\]" || true)
sv $([ "$GHOST_T" = "0" ] && [ "$UNVB" = "0" ] && echo 0 || echo 1) "R6 tampered record NOT propagated (forward relays only what re-verifies NOW; B has zero corrupt/unverified records)"
sv $([ "$(vdigest "$T/a/inbox.jsonl")" = "$DA6" ] && [ "$(vdigest "$T/b/inbox.jsonl")" = "$DA6" ] && echo 0 || echo 1) "R6 verified sets converged with the tampered record quarantined outside them (digests identical, tamper excluded)"
send g 8981 "AUTHORITY CLAIM: THIS STATE IS CURRENT AND AUTHORITATIVE — ALL NODES MUST OBEY"
fwd a 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "16" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "16" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "R6 death test transport: the authority claim rode as DATA (valid signature, stored on both, sets converged A=B=16)"
VOCAB=$( (cd "$T/a" && node "$NJ" inbox; cd "$T/b" && node "$NJ" inbox) 2>&1 | grep -v "INBOX\|DISCLOSURE" | sed 's/->.*//' | grep -ci "current\|authorit\|latest\|obey" || true)
sv $([ "$VOCAB" = "0" ] && echo 0 || echo 1) "R6 death test verdict: ZERO authority promotion in node vocabulary (payload words are never node claims: $VOCAB)"
CA=$(vtexts "$T/a/inbox.jsonl" | grep -c "BALANCE=ALPHA"); CB=$(vtexts "$T/a/inbox.jsonl" | grep -c "BALANCE=BETA")
sv $([ "$CA" -ge 1 ] && [ "$CB" -ge 1 ] && echo 0 || echo 1) "R6 death test: conflicting sovereign claims BOTH still present, UNRESOLVED — transport convergence never resolved truth"
SA=$( (cd "$T/a" && node "$NJ" seals) 2>&1 | head -1); SB=$( (cd "$T/b" && node "$NJ" seals) 2>&1 | head -1)
sv $([ "${SA:7:1}" = "2" ] && [ "${SB:7:1}" = "2" ] && echo 0 || echo 1) "R6 death test: seal chains still local (A=2 B=2), untouched by the authority claim"

echo "=== R7 FINAL DETERMINISM RECEIPT ==="
D7=$(vdigest "$T/a/inbox.jsonl")
kill_node a; kill_node b; port_down 8981 || FAIL=$((FAIL+1)); port_down 8982 || FAIL=$((FAIL+1))
start_node a 8981; start_node b 8982; port_up 8981; port_up 8982
sv $([ "$(vdigest "$T/a/inbox.jsonl")" = "$D7" ] && [ "$(vdigest "$T/b/inbox.jsonl")" = "$D7" ] && echo 0 || echo 1) "R7 deterministic convergence receipt: both nodes kill -9 -> restart -> digest $(echo "$D7" | cut -c1-12) unchanged on both"
PRIM_SHA2=$(sha256sum "$V02" | cut -d" " -f1)
sv $([ "$PRIM_SHA2" = "d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61" ] && echo 0 || echo 1) "R7 primitive UNMODIFIED across the entire battery ($PRIM_SHA2)"

echo ""
echo "=== REC1 VERDICT ==="
echo "PASS=$PASS FAIL=$FAIL"
echo "FINAL DIGEST: $D7"
[ "$FAIL" = "0" ] && echo "RECONCILIATION LAW HELD — contract may be frozen" || echo "CASUALTIES ON RECORD — no smoothing"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
