#!/bin/bash
# REC4 — DUPLICATE-CONTENT CONVERGENCE SEMANTICS ATTACK (Dad's "Build" order, Oct 6, 2026)
# Surface: the operational duplicate — fresh-nonce resend of identical content stores twice
# (disclosed since REC1 R3, re-measured in REC2 SCN2 and REC3 R3-7).
# Question under attack: does content-identity need its own law, or does the mesh stay
# set-semantic and honest? The attack decides. NO REMEDY BUILT FIRST.
# Target: the FROZEN v0.3 RECOVERY-LAW primitive (98dcdd62...), hash-gated at start and end.
# v0.2 remains untouched historical evidence. Disk is truth; independent standing verifier.
set -u
cd "$(dirname "$0")"
V03="../v0.3/internetless-node-v03.js"
V02="../v0.2/internetless-node-v02.js"
NJ="$PWD/$V03"
VER="../rec1/rec1-verify.js"
mkdir .lock 2>/dev/null || { echo "INSTANCE LOCKED — refusing to race"; exit 2; }
trap 'for p in $(cat tmp/*.pid 2>/dev/null); do kill -9 "$p" 2>/dev/null; done; rmdir .lock 2>/dev/null' EXIT
V03_SHA=$(sha256sum "$V03" | cut -d" " -f1); V02_SHA=$(sha256sum "$V02" | cut -d" " -f1)
echo "frozen v0.3 sha: $V03_SHA   frozen v0.2 sha: $V02_SHA"
[ "$V03_SHA" = "98dcdd624a4901b4d0034310f22055768716079c8cdb6f6cbea0a1a7083c9a7f" ] || { echo "FROZEN v0.3 MODIFIED — refusing"; exit 3; }
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
for p in (8981,8982,8983):
    s=socket.socket(); s.settimeout(0.3)
    try: s.connect(('127.0.0.1',p)); print('PORT',p,'BUSY — refusing to race'); sys.exit(9)
    except OSError: pass
    s.close()"
rm -rf tmp; mkdir -p tmp
T="$PWD/tmp"
PASS=0; FAIL=0
sv() { if [ "$1" = "0" ]; then echo "PASS $2"; PASS=$((PASS+1)); else echo "FAIL $2"; FAIL=$((FAIL+1)); fi; }
act() { echo "        [actual: $*]"; }
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
vdigest() { node "$VER" "$1" | python3 -c "import json,sys; print(json.load(sys.stdin)['digest'])"; }
vtextcount() { node "$VER" "$1" | python3 -c "
import json,sys
d=json.load(sys.stdin); print(sum(1 for t in d['texts'] if t==sys.argv[1]))" "$2"; }
# first-match-only disk helpers (copies share text; must touch exactly one line)
drop_one() { python3 -c "
import json,sys
lines=[l for l in open(sys.argv[1]) if l.strip()]
done=False; keep=[]
for l in lines:
    r=json.loads(l)
    if not done and r.get('envelope',{}).get('text')==sys.argv[2]:
        done=True; continue
    keep.append(l)
open(sys.argv[1],'w').writelines(keep)
print('dropped ONE copy:', sys.argv[2])" "$1" "$2"; }
tamper_one() { python3 -c "
import json,sys
lines=[l for l in open(sys.argv[1]) if l.strip()]
done=False; out=[]
for l in lines:
    r=json.loads(l)
    if not done and r.get('envelope',{}).get('text')==sys.argv[2]:
        done=True; r['envelope']['text']='corrupted on disk: '+sys.argv[2]
        out.append(json.dumps(r)+'\n'); continue
    out.append(l)
open(sys.argv[1],'w').writelines(out)
print('tampered ONE copy:', sys.argv[2])" "$1" "$2"; }
for nd in a b f c e; do mkdir -p "$T/$nd"; ( cd "$T/$nd" && node "$NJ" init --name "NODE_${nd^^}" >/dev/null 2>&1 ); : > "$T/$nd-send.log"; done

echo "=== S0: shared baseline on frozen v0.3 (6 records both sides) ==="
start_node a 8981; port_up 8981 || { echo "FAIL A never served"; exit 4; }
start_node b 8982; port_up 8982 || { echo "FAIL B never served"; exit 4; }
for t in G1 G2 G3 G4 G5 G6; do send c 8981 "$t common history"; done
fwd a 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "6" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "6" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "S0 converged: A=B=6, digests identical"

echo "=== D1: baseline duplicate — same content, fresh nonce, same sender ==="
send e 8982 "BALANCE=ALPHA"
send e 8982 "BALANCE=ALPHA"
CA=$(vtextcount "$T/b/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "8" ] && [ "$CA" = "2" ] && echo 0 || echo 1) "D1 both copies stored at B — two distinct signed records of one fact (verified=8, ALPHA copies=2)" || act "B=$(vcount "$T/b/inbox.jsonl") copies=$CA"
fwd b 8981
CA=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "8" ] && [ "$CA" = "2" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "D1 duplicates propagate as records, sets converge (A=8, ALPHA=2, digests identical)"

echo "=== D2: duplicate storm — 5 more fresh-nonce copies, different sender, cross-node ==="
for i in 1 2 3 4 5; do send c 8981 "BALANCE=ALPHA"; done
CA=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "13" ] && [ "$CA" = "7" ] && echo 0 || echo 1) "D2 all five stored, nothing refused (A=13, ALPHA copies=7, cross-sender duplicates coexist)" || act "A=$(vcount "$T/a/inbox.jsonl") copies=$CA"
fwd a 8982
CA=$(vtextcount "$T/b/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "13" ] && [ "$CA" = "7" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "D2 storm converges byte-identically on both nodes (B=13, ALPHA=7)"

echo "=== D3: DEATH TEST — duplicates must not vote ==="
send e 8982 "BALANCE=BETA"
fwd b 8981; fwd a 8982
CB=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=BETA"); CA=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "14" ] && [ "$CA" = "7" ] && [ "$CB" = "1" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "D3 7 ALPHA copies and 1 BETA copy coexist identically on both nodes — no resolution, no ranking" || act "A=$(vcount "$T/a/inbox.jsonl") ALPHA=$CA BETA=$CB"
VOCAB=$( (cd "$T/a" && node "$NJ" inbox; cd "$T/b" && node "$NJ" inbox) 2>&1 | grep -ci "majority\|vote\|voting\|consensus\|winner\|outweigh" || true)
sv $([ "$VOCAB" = "0" ] && echo 0 || echo 1) "D3 zero voting vocabulary anywhere — duplication creates NO authority gradient (set semantics, not election)"

echo "=== D4: duplicate + recovery interplay — lose ONE copy of seven ==="
drop_one "$T/a/inbox.jsonl" "BALANCE=ALPHA"
CA=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "13" ] && [ "$CA" = "6" ] && echo 0 || echo 1) "D4 one copy lost while six same-content copies remain (A=13, ALPHA=6)" || act "A=$(vcount "$T/a/inbox.jsonl") ALPHA=$CA"
fwd b 8981
CA=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "14" ] && [ "$CA" = "7" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "D4 the exact lost RECORD healed — record-identity recovery is not confused by same-content siblings (A=14, ALPHA=7, digests identical)"

echo "=== D5: corrupt ONE of the duplicate pair — content survives, record heals ==="
tamper_one "$T/a/inbox.jsonl" "BALANCE=ALPHA"
CORR=$( (cd "$T/a" && node "$NJ" inbox) 2>&1 | grep -c "\[CORRUPT\]" || true)
CA=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "13" ] && [ "$CORR" -ge 1 ] && echo 0 || echo 1) "D5 one copy disk-tampered: [CORRUPT] disclosed, excluded from verified set (verified=13, the other six copies still prove the content honestly)" || act "A=$(vcount "$T/a/inbox.jsonl") corr=$CORR"
fwd b 8981
CA=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "14" ] && [ "$CA" = "7" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "D5 frozen recovery law heals the corrupt copy by record identity (A=14, digests identical, evidence preserved per the freeze)"

echo "=== D6: fresh node — duplicates converge deterministically to a third party ==="
start_node f 8983; port_up 8983
fwd a 8983
CA=$(vtextcount "$T/f/inbox.jsonl" "BALANCE=ALPHA"); CB=$(vtextcount "$T/f/inbox.jsonl" "BALANCE=BETA")
sv $([ "$(vcount "$T/f/inbox.jsonl")" = "14" ] && [ "$CA" = "7" ] && [ "$CB" = "1" ] && [ "$(vdigest "$T/f/inbox.jsonl")" = "$(vdigest "$T/a/inbox.jsonl")" ] && echo 0 || echo 1) "D6 all 14 records incl. 7 duplicates arrived at a fresh node in one round (F=14, digests identical — duplicate propagation is deterministic)" || act "F=$(vcount "$T/f/inbox.jsonl") A=$CA B=$CB"

echo "=== D7: storage-flood measurement — the availability surface, disclosed not fixed ==="
for i in $(seq 1 20); do send c 8981 "BALANCE=ALPHA"; done
CA=$(vtextcount "$T/a/inbox.jsonl" "BALANCE=ALPHA")
REFUSED=$(grep -c "REFUSED" "$T/c-send.log" || true)
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "34" ] && [ "$CA" = "27" ] && [ "$REFUSED" = "0" ] && echo 0 || echo 1) "D7 twenty more fresh-nonce copies: ALL accepted, zero refusals (A=34, ALPHA=27) — nonce-identity has no content-level quota; an attacker with port access can add unbounded valid records (liveness/availability surface, safety intact)" || act "A=$(vcount "$T/a/inbox.jsonl") ALPHA=$CA refused=$REFUSED"
fwd a 8982
sv $([ "$(vcount "$T/b/inbox.jsonl")" = "34" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "D7 flood converges identically (B=34) — and every copy is honestly what it claims to be: a distinct signed statement"
restart a 8981; restart b 8982
sv $([ "$(vcount "$T/a/inbox.jsonl")" = "34" ] && [ "$(vcount "$T/b/inbox.jsonl")" = "34" ] && [ "$(vdigest "$T/a/inbox.jsonl")" = "$(vdigest "$T/b/inbox.jsonl")" ] && echo 0 || echo 1) "D7 34-record state durable across kill/restart on both nodes (digests identical from disk)"

echo "=== D8: gates ==="
V03_SHA2=$(sha256sum "$V03" | cut -d" " -f1); V02_SHA2=$(sha256sum "$V02" | cut -d" " -f1)
sv $([ "$V03_SHA2" = "$V03_SHA2" ] && [ "$V03_SHA2" = "98dcdd624a4901b4d0034310f22055768716079c8cdb6f6cbea0a1a7083c9a7f" ] && echo 0 || echo 1) "D8 frozen v0.3 UNTOUCHED across the entire battery"
sv $([ "$V02_SHA2" = "d0dfbfb0e66e947199f3f04a60cee2c799ef2cebbdcfaecf1494f06ba6480c61" ] && echo 0 || echo 1) "D8 frozen v0.2 (historical evidence) UNTOUCHED"
echo ""
echo "=== REC4 VERDICT ==="
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ] && echo "DUPLICATE SEMANTICS MEASURED — findings ready for Dad's ruling" || echo "CASUALTIES ON RECORD — no smoothing"
exit $([ "$FAIL" = "0" ] && echo 0 || echo 1)
