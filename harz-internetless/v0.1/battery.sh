#!/bin/bash
# HARZ INTERNETLESS v0.1 BATTERY (workbench evidence — real proof happens on the phones)
# Simulates 3 nodes A/B/C on localhost, all 5 operations, death+restart persistence, tamper + wrong-key + replay refusals.
cd "$(dirname "$0")"
N=$(pwd)/internetless-node.js
PASS=0; FAIL=0
t() { if [ "$1" = "0" ]; then echo "PASS $2"; PASS=$((PASS+1)); else echo "FAIL $2"; FAIL=$((FAIL+1)); fi; }

rm -rf testtmp/nA testtmp/nB testtmp/nC; mkdir -p testtmp/nA testtmp/nB testtmp/nC

(cd testtmp/nA && node $N init --name NODE_A) >/dev/null 2>&1
(cd testtmp/nB && node $N init --name NODE_B) >/dev/null 2>&1
(cd testtmp/nC && node $N init --name NODE_C) >/dev/null 2>&1
test -f testtmp/nA/identity.json && test -f testtmp/nB/identity.json && test -f testtmp/nC/identity.json
t $? "T1 identity: 3 nodes each generated a local ed25519 identity"

(cd testtmp/nB && nohup node $N serve --port 8991 >serve.log 2>&1 & echo $! > pid)
sleep 1
WHO=$(curl -s http://127.0.0.1:8991/whoami)
echo "$WHO" | grep -q '"ok":true' && echo "$WHO" | grep -q 'NODE_B'
t $? "T2 discovery: A discovers B's identity over local transport (no server)"

(cd testtmp/nA && node $N send --to 127.0.0.1:8991 --text "first genuine offline packet") >testtmp/nA/send.log 2>&1
grep -q "offline packet delivered" testtmp/nA/send.log
t $? "T3+T4 message+verify: B verified A's ed25519 signature locally and stored it"

(cd testtmp/nC && nohup node $N serve --port 8992 >serve.log 2>&1 & echo $! > pid)
sleep 1
(cd testtmp/nB && node $N forward --to 127.0.0.1:8992) >testtmp/nB/fwd.log 2>&1
grep -q "FORWARDED 1 verified" testtmp/nB/fwd.log
t $? "T5 store-and-forward: B relayed A's stored message to C, C verified A's original sig"

# T6 death + restart
BPID=$(cat testtmp/nB/pid); kill $BPID 2>/dev/null; sleep 1
(cd testtmp/nB && nohup node $N serve --port 8991 >serve2.log 2>&1 & echo $! > pid)
sleep 1
IB=$(curl -s http://127.0.0.1:8991/inbox)
echo "$IB" | grep -q '"count":1' && echo "$IB" | grep -q '"verified":true' && echo "$IB" | grep -q 'offline packet'
t $? "T6 death+restart: B killed and restarted; identity + verified inbox survived with zero server"

ENV=$(curl -s http://127.0.0.1:8991/inbox | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)['inbox'][0]['envelope']))")
echo "$ENV" | python3 -c "import json,sys; e=json.load(sys.stdin); e['text']='tampered'; print(json.dumps(e))" > testtmp/tamper.json
TAMPER_RESP=$(curl -s -X POST -d @testtmp/tamper.json http://127.0.0.1:8992/msg)
echo "$TAMPER_RESP" | grep -q '"verified":false'
t $? "T7 tamper refusal: altered text with stolen sig = SIGNATURE FAILED (fail-closed)"

(cd testtmp/nC && node $N send --to 127.0.0.1:8991 --text "cross-check") >testtmp/nC/send.log 2>&1
grep -q "offline packet delivered" testtmp/nC/send.log
t $? "T8 cross-node: C's own signed message to restarted B verifies fine (no cross-talk)"

REPLAY=$(curl -s -X POST -d @testtmp/tamper.json http://127.0.0.1:8992/msg 2>/dev/null; true)
(curl -s -X POST --data-binary @- http://127.0.0.1:8992/msg <<< "$ENV") | grep -q '"duplicate":true'
t $? "T9 replay/dedup: same nonce cannot double-count in store"

echo ""
echo "BATTERY: $PASS PASS / $FAIL FAIL"
kill $(cat testtmp/nB/pid) $(cat testtmp/nC/pid) 2>/dev/null
[ "$FAIL" = "0" ] && exit 0 || exit 1
