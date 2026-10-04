#!/bin/bash
# ONE-SHOT DEPLOY: Isiyaka's root into HIS account. Requires: ISIYAKA_TOKEN env var.
# Law: key born IN his worker, private JWK only in HIS D1. This script never sees the key.
set -e
API="https://api.cloudflare.com/client/v4"
T="$ISIYAKA_TOKEN"
[ -z "$T" ] && { echo "ISIYAKA_TOKEN missing"; exit 1; }
H1="Authorization: Bearer $T"; H2="Content-Type: application/json"

echo "== 1. verify token + get HIS account id =="
ACC=$(curl -s -m 30 "$API/accounts" -H "$H1" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result'][0]['id'] if d.get('success') and d.get('result') else 'FAIL')")
[ "$ACC" = "FAIL" -o -z "$ACC" ] && { echo "token verify FAILED"; exit 1; }
echo "account: $ACC (Isiyaka's own)"

echo "== 2. create HIS D1 database =="
D1=$(curl -s -m 30 -X POST "$API/accounts/$ACC/d1/database" -H "$H1" -H "$H2" \
  -d '{"name":"root-isiyaka-db"}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result']['uuid'] if d.get('success') else 'FAIL')")
echo "d1: $D1"; [ "$D1" = "FAIL" ] && exit 1

echo "== 3. upload worker with D1 binding (key born at first boot) =="
curl -s -m 60 -X PUT "$API/accounts/$ACC/workers/scripts/harz-root-isiyaka" \
  -H "$H1" -F 'metadata={"main_module":"root-isiyaka.js","bindings":[{"type":"d1","name":"DB","id":"'"$D1"'"}],"compatibility_date":"2026-01-01"};type=application/json' \
  -F 'root-isiyaka.js=@root-isiyaka.js;type=application/javascript+module' | python3 -c "import json,sys; d=json.load(sys.stdin); print('upload: OK' if d.get('success') else 'FAIL '+json.dumps(d.get('errors'))); exit(0 if d.get('success') else 1)"

echo "== 4. enable workers.dev route =="
SUB=$(curl -s -m 30 "$API/accounts/$ACC/workers/subdomain" -H "$H1" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result'].get('subdomain','FAIL') if d.get('success') else 'FAIL')")
echo "subdomain: $SUB"
curl -s -m 30 -X POST "$API/accounts/$ACC/workers/scripts/harz-root-isiyaka/subdomain" -H "$H1" -H "$H2" \
  -d '{"enabled":true,"previews_enabled":false}' | python3 -c "import json,sys; print('workers.dev: OK' if json.load(sys.stdin).get('success') else 'FAIL')"

echo "== 5. PROBE HIS LIVE ROOT (first boot = key birth) =="
sleep 5
URL="https://harz-root-isiyaka.$SUB.workers.dev"
curl -s -m 30 "$URL/health" && echo
curl -s -m 30 "$URL/pub" | python3 -c "import json,sys; p=json.load(sys.stdin); print('PUB: fp='+p['fp'], '| anchor:', p['anchor_pub'][:24]+'...')"
echo "LIVE: $URL"
echo "== Isiyaka's root is live. NEXT: owner relays -> Isiyaka deletes the token =="
