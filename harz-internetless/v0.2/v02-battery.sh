#!/bin/bash
# HARZ INTERNETLESS v0.2 ACCEPTANCE BATTERY (G27 charter — workbench acceptance for all 3 repairs)
# R1: ACK => recoverable durable record. R2: READ => REVERIFY. R3: S6 write->seal->persist->kill->recover->verify.
set -u
cd "$(dirname "$0")"
N="$PWD/internetless-node-v02.js"
NODEJS=${NODEJS:-node}
mkdir .lock 2>/dev/null || { echo "INSTANCE LOCKED — refusing to race"; exit 2; }
trap 'rmdir .lock 2>/dev/null; pkill -f "internetless[-]node[-]v02.js serve" 2>/dev/null' EXIT
pkill -f "internetless[-]node[-]v02.js serve" 2>/dev/null; sleep 0.3
rm -rf tmp; mkdir -p tmp; T="$PWD/tmp"
start_node() { ( cd "$T/$1" && exec $NODEJS "$N" serve --port "$2" > "$T/$1-serve.log" 2>&1 ) & echo $! > "$T/$1.pid"; sleep 0.8; }
kill_node() { kill -9 "$(cat "$T/$1.pid" 2>/dev/null)" 2>/dev/null; sleep 0.3; }
fcount() { python3 -c "
import json
v=0
try:
    for line in open('$T/$1/inbox.jsonl'):
        try: r=json.loads(line)
        except: continue
        if r.get('verified'): v+=1
except FileNotFoundError: pass
print(v)"; }
PASS=0; FAIL=0
sv() { if [ "$1" = "0" ]; then echo "PASS $2"; PASS=$((PASS+1)); else echo "FAIL $2"; FAIL=$((FAIL+1)); fi; }
for nd in nA nB; do mkdir -p "$T/$nd"; ( cd "$T/$nd" && $NODEJS "$N" init --name "NODE_${nd^^}" ) >/dev/null 2>&1; done

echo "=== B1 (R1) ACK => DURABLE: kill -9 mid-blast, acked==stored, zero torn ==="
start_node nB 8991
( cd "$T/nA"; for i in $(seq 1 20); do $NODEJS "$N" send --to 127.0.0.1:8991 --text "blast-$i" >> "$T/nA-send.log" 2>&1; sleep 0.06; done ) &
BL=$!; sleep 1.4; kill_node nB; wait $BL 2>/dev/null
ACKED=$(grep -c "durably delivered" "$T/nA-send.log" 2>/dev/null || echo 0)
start_node nB 8991
STORED=$(fcount nB)
DISC=$(grep -c "DISCLOSURE" "$T/nB-serve.log" 2>/dev/null); DISC=${DISC:-0}
[ "$STORED" -ge 1 ] && [ "$STORED" -le 20 ] && [ "$STORED" = "$ACKED" ] && [ "$DISC" -eq 0 ]
sv $? "B1 acked==stored ($ACKED vs $STORED), boot disclosure lines: $DISC — fsync-before-ack left no torn tail"

echo "=== B2 (R1) TORN TAIL: detected, classified, exposed — evidence preserved ==="
B1C=$(fcount nB)
python3 - "$T/nB/inbox.jsonl" <<'PYEOF'
import sys
lines=open(sys.argv[1]).read().splitlines()
lines.append('{"envelope":{"from":"ab","ts":1,"nonce":"torn","sig":"ff","text":"torn tail from kill -9 mid-append","name":"X"}')  # torn: no closing }
open(sys.argv[1],'w').write('\n'.join(lines)+'\n')
PYEOF
READOUT=$( cd "$T/nB" && $NODEJS "$N" inbox 2>&1 )
echo "$READOUT" | grep -q "DISCLOSURE: 1 torn inbox line(s) quarantined to inbox.torn"
sv $? "B2 torn tail disclosed on read (machine-readable disclosure line)"
grep -q "^TORN .* bytes=" "$T/nB/inbox.torn" 2>/dev/null
sv $? "B2 evidence preserved: inbox.torn carries TORN receipt with byte count"
B2C=$( cd "$T/nB" && $NODEJS "$N" inbox 2>&1 | grep -oP "^INBOX: \K[0-9]+" | head -1 )
[ "$B2C" = "$B1C" ]
sv $? "B2 valid records untouched by quarantine ($B1C -> $B2C), main file clean"

echo "=== B3 (R2) READ => REVERIFY: tampered sig now exposed as CORRUPT ==="
python3 - "$T/nB/inbox.jsonl" <<'PYEOF'
import json,sys
lines=open(sys.argv[1]).read().splitlines()
done=False
for i in range(len(lines)-1,-1,-1):
    try: r=json.loads(lines[i])
    except: continue
    if r.get('verified'):
        r['envelope']['sig']=('0' if r['envelope']['sig'][0]!='0' else '1')+r['envelope']['sig'][1:]
        lines[i]=json.dumps(r); print(r['envelope']['text']); done=True; break
assert done
open(sys.argv[1],'w').write('\n'.join(lines)+'\n')
PYEOF
TTXT=$( cd "$T/nB" && $NODEJS "$N" inbox 2>&1 | grep -c "\[CORRUPT\]" )
[ "$TTXT" -ge 1 ]
sv $? "B3 tampered record shows [CORRUPT] on read ($TTXT corrupt line) — read no longer lies (the A6 attack now fails)"
GOOD=$( cd "$T/nB" && $NODEJS "$N" inbox 2>&1 | grep -c "\[VERIFIED\]" )
[ "$GOOD" -ge 1 ]
sv $? "B3 honest records still [VERIFIED] after re-verification ($GOOD verified)"

echo "=== B4 (R2) FORWARD FAIL-CLOSED: corrupted record does not propagate ==="
start_node nA 8990
( cd "$T/nB" && $NODEJS "$N" forward --to 127.0.0.1:8990 > "$T/b2a-fwd.log" 2>&1 )
GOT=$(fcount nA)
LEAKED=$(python3 - "$T/nA/inbox.jsonl" <<'PYEOF'
import json,sys
bad=0
try:
    for line in open(sys.argv[1]):
        try: r=json.loads(line)
        except: continue
        if r.get('verified') is False: bad+=1
except FileNotFoundError: pass
print(bad)
PYEOF
)
[ "$GOT" -ge 1 ] && [ "$LEAKED" = "0" ]
sv $? "B4 forward delivered only re-verified records ($GOT forwarded, 0 corrupted/unverified propagated)"

echo "=== B5 (R3) S6 CYCLE: write -> seal -> persist -> kill -> recover -> verify ==="
( cd "$T/nB"; for i in $(seq 1 6); do $NODEJS "$N" seal --text "seal-$i" >> "$T/seal-loop.log" 2>&1; done ) &
SL=$!; sleep 0.9; kill -9 $SL 2>/dev/null; wait $SL 2>/dev/null
ACKED_SEALS=$(grep -c "^SEALED #" "$T/seal-loop.log" 2>/dev/null || echo 0)
CYC=$( cd "$T/nB" && $NODEJS "$N" seals 2>&1 )
NREC=$(echo "$CYC" | grep -oP 'SEALS: \K[0-9]+')
INTACT=$(echo "$CYC" | grep -c "CHAIN INTACT")
TORNQ=$(echo "$CYC" | grep -c "torn seal line")
[ "$NREC" -ge "$ACKED_SEALS" ] && [ "$INTACT" -eq 1 ]
sv $? "B5 kill -9 mid-seal-loop: all acked seals recovered+verified ($NREC records, $ACKED_SEALS acked, torn disclosed: $TORNQ)"

echo "=== B6 (R3) S6 TAMPER: verdict at exact slot, fail-closed ==="
python3 - "$T/nB/seals.jsonl" <<'PYEOF'
import json,sys
lines=open(sys.argv[1]).read().splitlines()
for i,l in enumerate(lines):
    r=json.loads(l)
    if r['seq']==2:
        r['env']['text']='tampered by attacker'
        lines[i]=json.dumps(r); break
open(sys.argv[1],'w').write('\n'.join(lines)+'\n')
PYEOF
( cd "$T/nB" && $NODEJS "$N" seals > "$T/seals-tamper.log" 2>&1 ); RC=$?
grep -q "BROKEN at slot #2" "$T/seals-tamper.log" && grep -q "ENV DIGEST MISMATCH\|ENVELOPE SIG FAILED" "$T/seals-tamper.log" && [ "$RC" = "1" ]
sv $? "B6 tampered seal #2 verdicted BROKEN at exact slot (rc=$RC), explicit classification, exit 1"

echo "=== B7 MESH REGRESSION: v0.2 nodes still interoperate (send/dedup) ==="
B7=$(fcount nB)
for i in 1 2 3 4 5; do ( cd "$T/nA" && $NODEJS "$N" send --to 127.0.0.1:8991 --text "reg-$i" >> "$T/nA-send.log" 2>&1 ); done
B7b=$(fcount nB)
[ "$B7b" -eq $((B7+5)) ]
sv $? "B7 mesh delivery intact across v0.2 ($B7 +5 -> $B7b)"
ENV=$(python3 - "$T/nB/inbox.jsonl" <<'PYEOF'
import json,sys
for line in open(sys.argv[1]):
    try: r=json.loads(line)
    except: continue
    if r.get('verified'):
        print(json.dumps(r['envelope'])); break
PYEOF
)
for i in 1 2 3; do echo "$ENV" | curl -s -m 3 -X POST -d @- http://127.0.0.1:8991/msg >/dev/null; done
B7c=$(fcount nB)
[ "$B7c" = "$B7b" ]
sv $? "B7 replay exactly-once intact ($B7b -> $B7c)"

echo "=== B8 CORRUPT IDENTITY: fail-closed regression ==="
mkdir -p "$T/nC"
echo '{"name":"N","pub":"dead","priv":"-----BEGIN' > "$T/nC/identity.json"
( cd "$T/nC" && timeout 4 $NODEJS "$N" serve --port 8992 > "$T/nC-serve.log" 2>&1 ); RC8=$?
P8=$(curl -s -m 2 http://127.0.0.1:8992/whoami >/dev/null 2>&1 && echo OPEN || echo CLOSED)
[ "$RC8" != "0" ] && [ "$P8" = "CLOSED" ]
sv $? "B8 corrupt identity refuses to serve (rc=$RC8, port $P8)"

pkill -f "internetless[-]node[-]v02.js serve" 2>/dev/null
echo ""
echo "=== v0.2 ACCEPTANCE VERDICT ==="
echo "PASS=$PASS FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "ALL CHARTER ITEMS ACCEPTED AT WORKBENCH — field run is the crown" || echo "CASUALTIES ON RECORD — no smoothing"
