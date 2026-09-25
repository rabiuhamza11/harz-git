#!/data/data/com.termux/files/usr/bin/bash
# HARZ SEARCH — NODE C PHONE BRING-UP (PORTABILITY LAW v1 death test rung)
# Run on the owner's phone (Termux). Zero new server code: this is the SAME
# server.js as Node A/B substrates, byte-identical (sha 010b8a13c7e2622c049f).
# Cloudflare is NOT required for this node to serve.
set -e
cd "$(dirname "$0")"

echo "== HARZ Search Node C bring-up (PORTABILITY LAW v1) =="
echo "1/4 holding wakelock..."
command -v termux-wake-lock >/dev/null 2>&1 && termux-wake-lock && echo "   wakelock HELD" || echo "   (no termux-wake-lock — battery may sleep)"

echo "2/4 verifying frozen core integrity (fail-closed)..."
CORE_SHA=$(sha256sum search-core.js | cut -c1-16)
ENG_SHA=$(sha256sum engine.js | cut -c1-16)
SRV_SHA=$(sha256sum server.js | cut -c1-16)
echo "   search-core.js $CORE_SHA | engine.js $ENG_SHA | server.js $SRV_SHA"
[ -f index-export.json ] || { echo "   FATAL: index-export.json missing — copy the state artifact into this folder first"; exit 1; }

echo "3/4 starting node on LAN (port ${PORT:-8795})..."
PORT="${PORT:-8795}" nohup node server.js index-export.json > node-c.log 2>&1 &
echo "   pid $!"

echo "4/4 announcing LAN address..."
IP=$(ifconfig 2>/dev/null | grep -o "inet [0-9.]*" | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
[ -z "$IP" ] && IP=$(ip addr 2>/dev/null | grep -o "inet [0-9.]*" | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
sleep 2
echo "=============================================="
echo "  HARZ SEARCH NODE C (PHONE) IS LISTENING"
echo "  http://$IP:${PORT:-8795}/health"
echo "  Federation probe from the other phone/laptop:"
echo "  node fed-test-c.js http://$IP:${PORT:-8795}"
echo "=============================================="
cat node-c.log
