#!/data/data/com.termux/files/usr/bin/bash
# HARZ Network App v0.2 — phone start (Termux).
# Brings up the local door on 127.0.0.1:8080 and opens the .harz address bar.
# Prereqs (proven bringup): pkg install git nodejs -y ; harz-git cloned in Termux.
set -e
ROOT=""
for d in ~/harz-git ~/downloads/harz-git ~/storage/downloads/harz-git; do
  if [ -f "$d/harz-root-v2/zone-king/SIGNED-ZONE-V2.json" ]; then ROOT="$d"; break; fi
done
if [ -z "$ROOT" ]; then
  echo "harz-git checkout not found."
  echo "Clone it first:  git clone https://github.com/rabiuhamza11/harz-git.git ~/harz-git"
  exit 1
fi
echo "sealed zone found: $ROOT"
cd "$ROOT/harz-network-app/v0.1"
HARZ_ZONE="$ROOT/harz-root-v2/zone-king/SIGNED-ZONE-V2.json" HARZ_DOOR_PORT=8080 node harz-door.js &
DOOR_PID=$!
sleep 2
echo "door is up. address bar: http://127.0.0.1:8080"
termux-open-url "http://127.0.0.1:8080" 2>/dev/null || true
wait $DOOR_PID
