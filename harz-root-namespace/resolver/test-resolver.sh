#!/bin/bash
# HARZ resolver test suite — every step hard-capped, resolver fully detached, cleanup guaranteed
cd /app/conversations/6a842d536f56287248c688de/harz-root
export PORT=5300

cleanup() { pkill -f 'node resolver.js' 2>/dev/null; }
trap cleanup EXIT

start_resolver() {
  setsid nohup env PORT=5300 node resolver.js </dev/null >resolver.log 2>&1 &
  disown
  sleep 1.2
}

echo '=== START RESOLVER ==='
start_resolver
cat resolver.log

echo '=== Q1: super.harz TXT (expect JSON payload) ==='
timeout 5 node dns-test-client.js super.harz 16

echo '=== Q2: wallet.harz TXT ==='
timeout 5 node dns-test-client.js wallet.harz 16

echo '=== Q3: ghost.harz TXT (expect NXDOMAIN) ==='
timeout 5 node dns-test-client.js ghost.harz 16

echo '=== Q4: example.com A (old-internet upstream forward) ==='
timeout 8 node dns-test-client.js example.com 1

echo '=== TAMPER TEST: corrupt zone, resolver must refuse to serve ==='
pkill -f 'node resolver.js'
sleep 0.5
sed -i 's/harz-super-pwa/harz-evil-pwa/' harz.zone
timeout 5 node resolver.js > resolver-tamper.log 2>&1
echo "tampered resolver exit code: $?"
cat resolver-tamper.log

echo '=== RESTORE + RESTART + RE-VERIFY ==='
node zone-generator.js | tail -1
start_resolver
cat resolver.log
timeout 5 node dns-test-client.js super.harz 16
echo DONE
