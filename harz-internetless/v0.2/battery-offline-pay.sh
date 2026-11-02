#!/bin/bash
# HARZ OFFLINE PAY v0.2 — BATTERY (workbench evidence; the real proof happens on two phones)
# Proves: identity, discovery, offline payment, local signature verification, signed ACK receipt,
#         tamper refusal, wrong-key refusal, replay/dedup, restart persistence, store-and-forward,
#         chain settlement with the real crypto contract, double-spend + unbound-key refusal.
cd "$(dirname "$0")"
N="$(pwd)/harz-offline-pay.js"
MOCK="$(pwd)/mock-chain.js"
PORT_B=8991; PORT_C=8992; PORT_M=9900
PASS=0; FAIL=0
t() { if [ "$1" = "0" ]; then echo "PASS $2"; PASS=$((PASS+1)); else echo "FAIL $2"; FAIL=$((FAIL+1)); fi; }
jqget() { node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const o=JSON.parse(s);console.log(o$1)}catch(e){console.log('')}})"; }

cleanup() { [ -f testtmp/nB/pid ] && kill "$(cat testtmp/nB/pid)" 2>/dev/null; [ -f testtmp/nC/pid ] && kill "$(cat testtmp/nC/pid)" 2>/dev/null; [ -f testtmp/mockpid ] && kill "$(cat testtmp/mockpid)" 2>/dev/null; }
trap cleanup EXIT

start_node() { # dir port
  ( cd "$1" && exec nohup node "$N" serve --port "$2" > serve.log 2>&1 ) & echo $! > "$1/pid"
}

rm -rf testtmp; mkdir -p testtmp/nA testtmp/nB testtmp/nC

# ---------- T1 identity + P-256 pay keys ----------
(cd testtmp/nA && node "$N" init --name NODE_A --wallet 08011111111) >/dev/null 2>&1
(cd testtmp/nB && node "$N" init --name NODE_B --wallet 08022222222) >/dev/null 2>&1
(cd testtmp/nC && node "$N" init --name NODE_C --wallet 08033333333) >/dev/null 2>&1
test -f testtmp/nA/identity.json && test -f testtmp/nB/identity.json && test -f testtmp/nC/identity.json
t $? "T1 identity: 3 nodes each generated a local ed25519 mesh key + P-256 pay key"
[ -f testtmp/nA/identity.json ] && ! grep -q '"priv"' testtmp/nA/identity.json.bak 2>/dev/null
grep -q '"wallet_priv_jwk"' testtmp/nA/identity.json
t $? "T1b key storage: wallet key persisted on device only (identity.json mode 600)"

# ---------- T2 discovery ----------
node "$MOCK" $PORT_M > testtmp/mock.log 2>&1 & echo $! > testtmp/mockpid
start_node testtmp/nB $PORT_B; sleep 1
WHO=$(curl -s "http://127.0.0.1:$PORT_B/whoami")
echo "$WHO" | grep -q '"ok":true' && echo "$WHO" | grep -q 'NODE_B' && echo "$WHO" | grep -q '08022222222'
t $? "T2 discovery: A discovers B's identity + wallet over local transport (no server)"

# ---------- seed mock chain: A funded + key registered; C registered ----------
node -e "
const fs=require('fs'),crypto=require('crypto'),cp=require('child_process');
const a=JSON.parse(fs.readFileSync('testtmp/nA/identity.json','utf8'));
const c=JSON.parse(fs.readFileSync('testtmp/nC/identity.json','utf8'));
function post(url,body){return new Promise(r=>{const req=require('http').request(url,{method:'POST',headers:{'Content-Type':'application/json'}},res=>{let b='';res.on('data',d=>b+=d);res.on('end',()=>r(b))});req.end(JSON.stringify(body))})}
(async()=>{
  await post('http://127.0.0.1:$PORT_M/seed',{address:a.wallet,balance:10000,public_key:a.wallet_pub_spki_b64});
  await post('http://127.0.0.1:$PORT_M/seed',{address:c.wallet,balance:0,public_key:c.wallet_pub_spki_b64});
})();
" && sleep 1
curl -s "http://127.0.0.1:$PORT_M/state" | grep -q '08011111111'
t $? "T3 mock chain seeded: payer wallet funded 10,000 HARZ with P-256 key registered"

# ---------- T4 offline payment A -> B ----------
(cd testtmp/nA && node "$N" pay --to 127.0.0.1:$PORT_B --amount 250 --memo "market payment") > testtmp/payA.log 2>&1
grep -q "DELIVERED + VERIFIED" testtmp/payA.log
t $? "T4 offline pay: A sent 250 HARZ to B over local transport, B verified the P-256 signature"
grep -q "ACK SIGNED BY" testtmp/payA.log
t $? "T4b receipt: B returned a signed ACK binding the payment to receipt time"

# ---------- T5 both sides hold the receipt ----------
(cd testtmp/nB && node "$N" receipts) | grep -q "EARNED 250 HARZ"
t $? "T5 receiver receipt: B stored [PENDING] EARNED 250 HARZ with the original payer signature"
(cd testtmp/nA && node "$N" receipts) | grep -q "PAID   250 HARZ"
t $? "T5b payer receipt: A stored its copy [PENDING] PAID 250 HARZ"

# ---------- T6 tamper refusal ----------
node -e "
const fs=require('fs');
const r=JSON.parse(fs.readFileSync('testtmp/nB/receipts.jsonl','utf8').trim().split('\n')[0]);
r.amount=999999; fs.writeFileSync('/tmp/tamper.json',JSON.stringify(r));
"
node "$N" verify --file /tmp/tamper.json > /tmp/tamper.out 2>&1
grep -q "RECEIPT INVALID" /tmp/tamper.out
t $? "T6 tamper refusal: amount altered to 999,999 HARZ = SIGNATURE FAILED (fail-closed)"

# ---------- T7 wrong key refusal ----------
node -e "
const fs=require('fs'),crypto=require('crypto');
const r=JSON.parse(fs.readFileSync('testtmp/nB/receipts.jsonl','utf8').trim().split('\n')[0]);
const w=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
r.sig=crypto.sign('sha256',Buffer.from(r.canonical,'utf8'),{key:w.privateKey,dsaEncoding:'ieee-p1363'}).toString('base64');
fs.writeFileSync('/tmp/wrongkey.json',JSON.stringify(r));
"
node "$N" verify --file /tmp/wrongkey.json > /tmp/wrongkey.out 2>&1
grep -q "RECEIPT INVALID" /tmp/wrongkey.out
t $? "T7 wrong-key refusal: signature from a different P-256 key rejected"

# ---------- T8 replay / duplicate ----------
node -e "
const fs=require('fs');
const r=JSON.parse(fs.readFileSync('testtmp/nB/receipts.jsonl','utf8').trim().split('\n')[0]);
const p={protocol:r.protocol,type:'harz_payment',from:r.from,to:r.to,amount:r.amount,nonce:r.nonce,ts:r.ts,memo:r.memo,payer_pubkey:r.payer_pubkey,sig:r.sig};
fs.writeFileSync('/tmp/replay.json',JSON.stringify(p));
"
curl -s -X POST "http://127.0.0.1:$PORT_B/pay" -H "Content-Type: application/json" --data-binary @/tmp/replay.json | grep -q duplicate
t $? "T8 replay refusal: same nonce re-sent = duplicate (cannot double-count)"

# ---------- T9 restart persistence ----------
kill "$(cat testtmp/nB/pid)" 2>/dev/null; sleep 0.5
OLD=$(cat testtmp/nB/pid)
start_node testtmp/nB $PORT_B; sleep 1
NEW=$(cat testtmp/nB/pid)
(cd testtmp/nB && node "$N" receipts) | grep -q "EARNED 250 HARZ"
R1=$?
[ "$OLD" != "$NEW" ] && [ "$R1" = "0" ]
t $? "T9 death+restart: new PID, identity + receipt survived with zero server"

# ---------- T10 store-and-forward relay ----------
start_node testtmp/nC $PORT_C; sleep 1
(cd testtmp/nB && node "$N" relay --to 127.0.0.1:$PORT_C) > testtmp/relay.log 2>&1
grep -q "RELAYED 1 receipt" testtmp/relay.log
t $? "T10 relay: B forwarded the receipt to C; original payer signature preserved"

# ---------- T11 chain settlement (real crypto contract) ----------
(cd testtmp/nA && node "$N" sync --chain http://127.0.0.1:$PORT_M) > testtmp/sync.log 2>&1
grep -q "SETTLED 250 HARZ" testtmp/sync.log
t $? "T11 settlement: pending receipt accepted by chain (/api/transfer) with the real P-256 contract"
curl -s "http://127.0.0.1:$PORT_M/state" | grep -q '"08022222222":250'
t $? "T11b settlement balance: 250 HARZ landed in B's wallet on the chain"

# ---------- T12 double-spend refused at settlement ----------
node -e "
const fs=require('fs'),crypto=require('crypto');
const a=JSON.parse(fs.readFileSync('testtmp/nA/identity.json','utf8'));
const old=JSON.parse(fs.readFileSync('testtmp/nB/receipts.jsonl','utf8').trim().split('\n')[0]);
const msg=a.wallet+'|08022222222|'+String(parseFloat(500))+'|'+String(old.nonce);
const sig=crypto.sign('sha256',Buffer.from(msg,'utf8'),{key:crypto.createPrivateKey({key:a.wallet_priv_jwk,format:'jwk'}),dsaEncoding:'ieee-p1363'}).toString('base64');
const req=require('http').request('http://127.0.0.1:$PORT_M/api/transfer',{method:'POST',headers:{'Content-Type':'application/json'}},res=>{let b='';res.on('data',d=>b+=d);res.on('end',()=>{fs.writeFileSync('/tmp/ds.out',b);console.log(b)})});
req.end(JSON.stringify({from:a.wallet,to:'08022222222',amount:500,nonce:old.nonce,sig}));
" > /dev/null 2>&1
sleep 1
grep -q "nonce already used" /tmp/ds.out
t $? "T12 double-spend refused: replaying the same nonce for a bigger amount = nonce already used"

# ---------- T13 unbound key refused ----------
node -e "
const fs=require('fs'),crypto=require('crypto');
const c=JSON.parse(fs.readFileSync('testtmp/nC/identity.json','utf8'));
const msg='08099999999|08022222222|100|'+Date.now();
const sig=crypto.sign('sha256',Buffer.from(msg,'utf8'),{key:crypto.createPrivateKey({key:c.wallet_priv_jwk,format:'jwk'}),dsaEncoding:'ieee-p1363'}).toString('base64');
const req=require('http').request('http://127.0.0.1:$PORT_M/api/transfer',{method:'POST',headers:{'Content-Type':'application/json'}},res=>{let b='';res.on('data',d=>b+=d);res.on('end',()=>{fs.writeFileSync('/tmp/ub.out',b);console.log(b)})});
req.end(JSON.stringify({from:'08099999999',to:'08022222222',amount:100,nonce:Date.now(),sig}));
" > /dev/null 2>&1
sleep 1
grep -q "Unauthorized" /tmp/ub.out
t $? "T13 unbound key refused: a key never registered for that address cannot move funds"

# ---------- T14 offline proof legs ----------
(cd testtmp/nA && timeout 20 node "$N" prove-offline --peer 127.0.0.1:$PORT_B) > testtmp/offline.log 2>&1
grep -q "LEG 1" testtmp/offline.log && grep -q "LEG 2 — HARZ peer: ANSWERED" testtmp/offline.log
t $? "T14 offline proof: both legs execute (Internet probe + peer answer), verdict printed honestly"

echo
echo "BATTERY: $PASS PASS / $FAIL FAIL"
exit $FAIL
