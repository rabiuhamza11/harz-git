#!/bin/bash
# HARZ gossip test suite — THE LAW: no valid signature, no ingest.
cd /app/conversations/6a842d536f56287248c688de/harz-root

node kill-strays2.js >/dev/null 2>&1; node kill-verify.js >/dev/null 2>&1
cleanup() { node kill-strays2.js >/dev/null 2>&1; node kill-verify.js >/dev/null 2>&1; node kill-gossip.js >/dev/null 2>&1; }
trap cleanup EXIT

echo '=== SETUP: Node B + Node C hold the old 17-name draft zone (height 0) ==='
for n in b c; do
  mkdir -p test-$n/keys
  cp harz.zone.draft17 test-$n/harz.zone
  cp zone.sig.draft17 test-$n/zone.sig
  cp zone.hash.draft17 test-$n/zone.hash
  cp keys/zsk-ed25519.pub.pem test-$n/keys/
done
echo "test-b names: $(grep -c 'IN TXT' test-b/harz.zone)"

echo '=== T1: SOLO MODE (Node A = canonical zone, no peers) ==='
GOSSIP_PORT=8091 setsid nohup node gossip.js </dev/null >gossip-a.log 2>&1 &
disown
sleep 1.2
cat gossip-a.log

echo '=== T2: ADOPTION (Node B polls Node A, must adopt signed canonical zone) ==='
ZONE_DIR=test-b GOSSIP_PORT=8092 GOSSIP_PEERS=http://127.0.0.1:8091 GOSSIP_INTERVAL=2 setsid nohup node gossip.js </dev/null >gossip-b.log 2>&1 &
disown
sleep 4
cat gossip-b.log
echo "test-b zone names after gossip: $(grep -c 'IN TXT' test-b/harz.zone) (expect 77)"
echo "B info: $(curl -s --max-time 5 http://127.0.0.1:8092/p2p/info)"
echo "A info: $(curl -s --max-time 5 http://127.0.0.1:8091/p2p/info)"

echo '=== T3: THE LAW — tampered update must be REFUSED, zone untouched ==='
ZONE_DIR=test-c GOSSIP_PORT=8093 GOSSIP_ALLOW_PUSH=true setsid nohup node gossip.js </dev/null >gossip-c.log 2>&1 &
disown
sleep 1.2
node push-tamper.js
echo "test-c zone names after tamper attempts: $(grep -c 'IN TXT' test-c/harz.zone) (expect 17 — untouched)"
tail -4 gossip-c.log
echo DONE
