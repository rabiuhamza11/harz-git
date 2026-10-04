#!/bin/bash
# HARZ INTERNETLESS ATTACK BATTERY v0.2 (Oct 4, 2026, owner order: "attack it hard")
# Attacks the FROZEN v0.1 node (internetless-node.js untouched). Workbench evidence only.
# Verdict semantics: SURVIVAL = PASS (law held) / FAIL (law broke).
#                    ATTACK   = VULN (weakness demonstrated, finding recorded) / HELD (attack failed to break).
# All counts read from DISK inbox files (the /inbox endpoint truncates to last 20 - endpoint is display, disk is truth).
set -u
cd "$(dirname "$0")"
N="$(cd ../v0.1 && pwd)/internetless-node.js"
NODEJS=${NODEJS:-node}
mkdir .lock 2>/dev/null || { echo "INSTANCE LOCKED — another battery is running, refusing to race"; exit 2; }
trap 'rmdir .lock 2>/dev/null; pkill -f "internetless[-]node.js serve" 2>/dev/null' EXIT
pkill -f "internetless[-]node.js serve" 2>/dev/null; sleep 0.3
rm -rf tmp; mkdir -p tmp
T="$PWD/tmp"
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
PASS=0; FAIL=0; VULN=0; HELD=0; FINDINGS=0
sv() { if [ "$1" = "0" ]; then echo "PASS $2"; PASS=$((PASS+1)); else echo "FAIL $2"; FAIL=$((FAIL+1)); fi; }
atk() { if [ "$1" = "0" ]; then echo "VULN $2 -> FINDING recorded"; VULN=$((VULN+1)); FINDINGS=$((FINDINGS+1)); else echo "HELD $2"; HELD=$((HELD+1)); fi; }
send_from() { ( cd "$T/$1" && $NODEJS "$N" send --to "$2" --text "$3" > "$T/$1-send.log" 2>&1 ); }
forward_from() { ( cd "$T/$1" && $NODEJS "$N" forward --to "$2" > "$T/$3-fwd.log" 2>&1 ); }

for nd in nA nB nC nD nE nF; do mkdir -p "$T/$nd"; ( cd "$T/$nd" && $NODEJS "$N" init --name "NODE_${nd^^}" ) >/dev/null 2>&1; done

echo "=== A1 SURVIVAL: POWER LOSS MID-TRAFFIC (SIGKILL during live blast) ==="
start_node nB 8991
( cd "$T/nA"; for i in $(seq 1 20); do $NODEJS "$N" send --to 127.0.0.1:8991 --text "blast-$i" >> "$T/nA-send.log" 2>&1; sleep 0.06; done ) &
BLAST=$!
sleep 1.4; kill_node nB; wait $BLAST 2>/dev/null
ACKED=$(grep -c "offline packet delivered" "$T/nA-send.log" 2>/dev/null || echo 0)
start_node nB 8991
STORED=$(fcount nB)
[ "$STORED" -ge 1 ] && [ "$STORED" -le 20 ] && [ "$STORED" = "$ACKED" ]
sv $? "A1 acked==stored after kill -9 mid-blast (acked $ACKED, stored $STORED)"
DUPV=$(python3 - "$T/nB/inbox.jsonl" <<'PYEOF'
import json,sys
seen=set(); dup=0
for line in open(sys.argv[1]):
    try: r=json.loads(line)
    except: continue
    n=r['envelope']['nonce']
    if n in seen: dup+=1
    seen.add(n)
print("NODUPS" if dup==0 else "DUP")
PYEOF
)
[ "$DUPV" = "NODUPS" ]
sv $? "A1 zero duplicate nonces after crash+restart (dedup re-seeded from disk)"

echo "=== A2 ATTACK: TORN TAIL LINE (what kill -9 mid-append leaves) ==="
B1=$(fcount nB)
echo '{"envelope":{"from":"ab"' >> "$T/nB/inbox.jsonl"
sleep 0.1
B2=$(fcount nB)
DISCLOSED=$(grep -ci "torn\|corrupt\|dropped\|damaged\|warn" "$T/nB-serve.log" 2>/dev/null | head -1); DISCLOSED=${DISCLOSED:-0}
[ "$B2" = "$B1" ] && [ "$DISCLOSED" = "0" ]
atk $? "A2 torn line silently swallowed (verified count $B1 -> $B2, disclosure lines: $DISCLOSED) — an acked message can vanish unflagged"

echo "=== A3 SURVIVAL: STALE NODE CATCH-UP ==="
B0=$(fcount nB)
kill_node nB
start_node nA 8990
start_node nC 8992
for i in 1 2 3 4 5; do send_from nA 127.0.0.1:8991 "stale-a-$i"; done
for i in 1 2 3 4 5; do send_from nC 127.0.0.1:8991 "stale-c-$i"; done
start_node nB 8991
for i in 1 2 3 4 5; do send_from nA 127.0.0.1:8991 "stale-a-$i"; done
for i in 1 2 3 4 5; do send_from nC 127.0.0.1:8991 "stale-c-$i"; done
B3=$(fcount nB)
[ "$B3" -eq $((B0+10)) ]
sv $? "A3 stale node caught up after downtime, exact arithmetic ($B0 +10 -> $B3)"

echo "=== A4 SURVIVAL: CONFLICTING DIVERGENT HISTORIES (replay+dedup reconciliation) ==="
for i in 1 2 3; do send_from nA 127.0.0.1:8992 "div-ab-$i"; done
for i in 1 2 3; do send_from nC 127.0.0.1:8990 "div-ca-$i"; done
kill_node nA; kill_node nC
start_node nD 8993
for i in 1 2 3; do send_from nB 127.0.0.1:8993 "div-bd-$i"; done
for i in 1 2 3; do send_from nD 127.0.0.1:8991 "div-db-$i"; done
start_node nA 8990; start_node nC 8992
forward_from nB 127.0.0.1:8990 b2a1; forward_from nB 127.0.0.1:8992 b2c1
forward_from nC 127.0.0.1:8990 c2a1; forward_from nA 127.0.0.1:8992 a2c1
forward_from nD 127.0.0.1:8991 d2b1
forward_from nA 127.0.0.1:8991 a2b1; forward_from nC 127.0.0.1:8991 c2b1
forward_from nB 127.0.0.1:8990 b2a2; forward_from nB 127.0.0.1:8992 b2c2  # gossip to fixpoint: B returns what it got from D
VERDICT=$(python3 - "$T" <<'PYEOF'
import json,sys
def nonces(d):
    s=set()
    for line in open(f"{d}/inbox.jsonl"):
        try: r=json.loads(line)
        except: continue
        if r.get('verified'): s.add(r['envelope']['nonce'])
    return s
A=nonces(sys.argv[1]+"/nA"); B=nonces(sys.argv[1]+"/nB"); C=nonces(sys.argv[1]+"/nC")
print("EQUAL" if A==B==C and len(B)>=15 else f"NOT-EQUAL A{len(A)}/B{len(B)}/C{len(C)}")
PYEOF
)
[ "$VERDICT" = "EQUAL" ]
sv $? "A4 divergent histories reconciled by replay+dedup: $VERDICT"

echo "=== A5 SURVIVAL: FRESH DEVICE (zero state, no fabrication) ==="
FRESH=$( cd "$T/nF" && $NODEJS "$N" inbox 2>&1 | head -1 )
echo "$FRESH" | grep -q "0 messages"
sv $? "A5 fresh node honestly empty before sync ($FRESH)"
start_node nF 8994
forward_from nB 127.0.0.1:8994 b2f1
FC=$(fcount nF); BC=$(fcount nB)
[ "$FC" = "$BC" ] && [ "$FC" -ge 15 ]
sv $? "A5 fresh node synced full verified history by replay ($FC == source $BC)"
kill_node nF

echo "=== A6 ATTACK: DISK-TAMPERED STORED SIGNATURE (flag-trust on read) ==="
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
assert done, "no verified record to tamper"
open(sys.argv[1],'w').write('\n'.join(lines)+'\n')
PYEOF
TTXT=$(python3 - "$T/nB/inbox.jsonl" <<'PYEOF'
import json,sys
for i in range(len(lines:=open(sys.argv[1]).read().splitlines())-1,-1,-1):
    try: r=json.loads(lines[i])
    except: continue
    if r.get('verified'): print(r['envelope']['text']); break
PYEOF
)
TV=$( cd "$T/nB" && $NODEJS "$N" inbox 2>&1 | grep "\[VERIFIED\].*$TTXT" | wc -l )
[ "$TV" -ge 1 ]
atk $? "A6 disk-tampered sig on '$TTXT' STILL displays [VERIFIED] — v0.1 trusts the stored flag, never re-verifies on read"
echo "=== A6b SURVIVAL: PROPAGATION OF THE TAMPERED RECORD ==="
start_node nE 8994
forward_from nB 127.0.0.1:8994 b2e1
CAUGHT=$(python3 - "$T/nE/inbox.jsonl" <<'PYEOF'
import json,sys
bad=0
for line in open(sys.argv[1]):
    try: r=json.loads(line)
    except: continue
    if r.get('verified') is False: bad+=1
print("CAUGHT" if bad else "MISSED")
PYEOF
)
[ "$CAUGHT" = "CAUGHT" ]
sv $? "A6b propagation fail-closed: receiver re-verified the tampered record, marked UNVERIFIED"

echo "=== A7 SURVIVAL: CORRUPT IDENTITY ==="
kill_node nE
echo '{"name":"NODE_E","pub":"deadbeef","priv":"-----BEGIN PRIVATE KEY' > "$T/nE/identity.json"
( cd "$T/nE" && timeout 4 $NODEJS "$N" serve --port 8994 > "$T/nE-corrupt.log" 2>&1 ); RC7a=$?
PORT7=$(curl -s -m 2 http://127.0.0.1:8994/whoami >/dev/null 2>&1 && echo OPEN || echo CLOSED)
[ "$RC7a" != "0" ] && [ "$PORT7" = "CLOSED" ]
sv $? "A7a truncated identity refuses to serve (rc=$RC7a, port $PORT7)"
send_from nE 127.0.0.1:8991 "zombie"; RC7b=$?
[ "$RC7b" != "0" ]
sv $? "A7b corrupt identity cannot sign or send (rc=$RC7b)"

echo "=== A8 SURVIVAL: REPLAY (captured envelope x5) ==="
B8=$(fcount nB)
ENV=$(python3 - "$T/nB/inbox.jsonl" <<'PYEOF'
import json,sys
for line in open(sys.argv[1]):
    try: r=json.loads(line)
    except: continue
    if r.get('verified'):
        print(json.dumps(r['envelope'])); break
PYEOF
)
for i in 1 2 3 4 5; do echo "$ENV" | curl -s -m 3 -X POST -d @- http://127.0.0.1:8991/msg >/dev/null; done
B8b=$(fcount nB)
[ "$B8b" = "$B8" ]
sv $? "A8 exactly-once: 5 replays added 0 records ($B8 -> $B8b)"

echo "=== A9 SURVIVAL: LONG OFFLINE, THEN RECONCILIATION ==="
kill_node nF
for i in $(seq 1 30); do send_from nA 127.0.0.1:8991 "long-$i"; done
BN=$(fcount nB)
start_node nF 8994
forward_from nB 127.0.0.1:8994 b2f2
FN=$(fcount nF)
[ "$FN" = "$BN" ] && [ "$BN" -ge 40 ]
sv $? "A9 long-offline node caught up exactly ($FN of source $BN)"

echo "=== A10 SURVIVAL: MID-FORWARD POWER LOSS ==="
( forward_from nB 127.0.0.1:8994 b2f3 ) &
FW=$!
sleep 0.3; kill_node nF; wait $FW 2>/dev/null
start_node nF 8994
forward_from nB 127.0.0.1:8994 b2f4
F10=$(fcount nF)
[ "$F10" = "$BN" ]
sv $? "A10 kill -9 mid-forward, restart, re-forward: converged exactly, zero doubles ($F10 == $BN)"

echo ""
echo "=== ATTACK BATTERY v0.2 VERDICT (workbench evidence only) ==="
echo "SURVIVAL: PASS=$PASS FAIL=$FAIL"
echo "ATTACKS : VULN=$VULN HELD=$HELD FINDINGS=$FINDINGS"
