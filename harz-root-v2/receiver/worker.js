// HARZ ROOT RECEIVER v1.0 — the holder's door of the QR rail (Sep 15, 2026)
// The receiving end of the out-of-band namespace transfer: scan (or paste) the signed zone
// chunks with a camera, verify against the out-of-band trust bundle (anchor + height floor +
// record floor), and load the zone into the offline resolver. Fail-closed everywhere.
// Light theme #f0f2f5 · PWA installable · zero network needed after install (scan → resolve offline).
// Honest labels: Ed25519 verify requires modern WebCrypto (Chrome ~137+); if unavailable, the zone
// is REFUSED, never loaded. No floors pinned = guards off (holder's choice, labeled on screen).

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f0f2f5">
<meta name="description" content="HARZ Root Receiver — scan the signed zone from paper, verify, resolve offline.">
<link rel="manifest" href="/manifest.json">
<title>HARZ Root Receiver</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
  body { margin: 0; background: #f0f2f5; color: #1a1a2e; }
  .wrap { max-width: 640px; margin: 0 auto; padding: 14px; }
  h1 { font-size: 1.25rem; margin: 8px 0 2px; }
  .sub { color: #555; font-size: 0.85rem; margin-bottom: 10px; }
  .card { background: #fff; border: 1px solid #e2e2e9; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
  label { font-size: 0.75rem; font-weight: 600; color: #444; display: block; margin: 8px 0 3px; }
  input, textarea, select { width: 100%; padding: 9px; border: 1px solid #ccc; border-radius: 8px; font-size: 0.9rem; background: #fff; color: #111; }
  textarea { height: 90px; font-family: monospace; font-size: 0.75rem; }
  button { background: #1a5fb4; color: #fff; border: 0; border-radius: 8px; padding: 10px 16px; font-size: 0.95rem; font-weight: 600; margin-top: 10px; cursor: pointer; }
  button.sec { background: #eee; color: #333; }
  .ok { color: #1a7f37; font-weight: 600; }
  .bad { color: #c01c28; font-weight: 600; }
  .note { color: #666; font-size: 0.78rem; }
  #chunks { font-family: monospace; font-size: 0.8rem; }
  #video { width: 100%; border-radius: 10px; background: #000; }
  pre { background: #f6f6fa; border: 1px solid #e2e2e9; border-radius: 8px; padding: 10px; font-size: 0.75rem; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
  .bar { height: 8px; background: #e8e8ee; border-radius: 4px; overflow: hidden; margin: 6px 0; }
  .bar > div { height: 100%; background: #1a5fb4; width: 0%; }
</style>
</head>
<body>
<div class="wrap">
  <h1>HARZ Root Receiver</h1>
  <div class="sub">The holder's door — scan the signed zone from paper, verify, resolve offline.</div>

  <div class="card">
    <label>TRUST BUNDLE (out-of-band, travels with the paper)</label>
    <label>Anchor public key (64 hex chars)</label>
    <input id="anchor" placeholder="paste the anchor pub hex that came with the paper">
    <label>Expected height floor (optional — guards off if empty)</label>
    <input id="minh" type="number" placeholder="e.g. 10">
    <label>Minimum records floor (optional — guards off if empty)</label>
    <input id="minr" type="number" placeholder="e.g. 75">
    <div class="note" id="guardNote">No floors pinned = replay/shrink guards OFF (holder's choice, labeled honestly).</div>
  </div>

  <div class="card">
    <label>RECEIVE — camera scan (or paste below)</label>
    <video id="video" playsinline muted style="display:none"></video>
    <button id="scanBtn" class="sec" onclick="startScan()">Start camera</button>
    <div class="bar"><div id="prog"></div></div>
    <div id="chunks">chunks received: 0</div>
    <label>Paste chunks (one payload per line — for desktop/no-camera)</label>
    <textarea id="paste" placeholder='{"v":1,"b":"hrz-zone","s":1,"t":46,"d":"..."}'></textarea>
    <button onclick="ingestPaste()">Add pasted chunks</button>
    <button class="sec" onclick="resetChunks()">Reset</button>
  </div>

  <div class="card">
    <label>VERIFY + LOAD</label>
    <button onclick="assembleAndLoad()">Verify signature + load zone</button>
    <div id="loadOut" class="note">No zone loaded.</div>
  </div>

  <div class="card" id="resolveCard" style="display:none">
    <label>RESOLVE (offline — the zone is in memory)</label>
    <input id="qname" placeholder="e.g. pay or pay.harz">
    <button onclick="resolveNow()">Resolve</button>
    <div id="resolveOut" class="note">—</div>
    <pre id="detail"></pre>
  </div>

  <div class="note">HARZ Root Receiver v1.0 · fail-closed: unverifiable zones are refused, never loaded.<br>
  Single-zone receiver: chain/succession verification is operator-side (ceremony kit).<br>
  Camera requires BarcodeDetector (Android Chrome). Paste mode works everywhere.</div>
</div>
<script>
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
const BATCH = "harz-root-zone", V = 1; // MUST match the QR rail batch name (root-qr.js)
let seen = new Map(), total = null, zone = null, engine = null;

function setChunks() {
  const t = total || "?";
  document.getElementById("chunks").textContent = "chunks received: " + seen.size + " / " + t + " (duplicates safe)";
  document.getElementById("prog").style.width = total ? (100 * seen.size / total) + "%" : "0%";
}
function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const b = atob(s), out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
function ingestLine(line) {
  let obj; try { obj = JSON.parse(line); } catch (e) { return "unparseable line ignored"; }
  if (obj.v !== V || obj.b !== BATCH) return "not a zone chunk — ignored";
  if (!Number.isInteger(obj.s) || !Number.isInteger(obj.t) || obj.s < 1 || obj.s > obj.t) return "bad seq — ignored";
  total = obj.t;
  seen.set(obj.s, obj.d); // duplicate seq: same-or-different, dedup keeps first-seen
  return null;
}
function ingestPaste() {
  const lines = document.getElementById("paste").value.split(/[\\n\\r]+/).map(s => s.trim()).filter(Boolean);
  let ignored = 0;
  for (const l of lines) { const err = ingestLine(l); if (err) ignored++; }
  setChunks();
  if (ignored) note("loadOut", ignored + " line(s) ignored (not zone chunks).", "bad");
}
function resetChunks() { seen = new Map(); total = null; zone = null; engine = null;
  setChunks(); note("loadOut", "No zone loaded.", "note");
  document.getElementById("resolveCard").style.display = "none"; }

// ---- scan loop (BarcodeDetector) ----
async function startScan() {
  if (!("BarcodeDetector" in window)) { alert("This browser has no BarcodeDetector — use paste mode (honest label, not a bug)."); return; }
  const video = document.getElementById("video");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream; video.style.display = "block"; await video.play();
    const det = new window.BarcodeDetector();
    const loop = async () => {
      if (!video.srcObject) return;
      try { const codes = await det.detect(video);
        for (const c of codes) { if (!ingestLine(c.rawValue)) setChunks(); }
      } catch (e) {}
      requestAnimationFrame(loop);
    };
    loop();
  } catch (e) { alert("Camera unavailable: " + e.message + " — use paste mode."); }
}

function note(id, msg, cls) { const el = document.getElementById(id); el.textContent = msg; el.className = cls || "note"; }

// ---- canonical bytes + verification (async WebCrypto Ed25519) ----
function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
  return "{" + Object.keys(obj).sort().map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
}
const enc = new TextEncoder();
function hexToBytes(h) { const a = new Uint8Array(h.length / 2); for (let i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }

async function verifyZone(zoneObj, pubHex, sigHex) {
  const { sig, ...unsigned } = zoneObj;
  const data = enc.encode(canonicalize(unsigned));
  const spkiPrefix = new Uint8Array([0x30,0x2a,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x03,0x21,0x00]);
  const raw = hexToBytes(pubHex);
  const spki = new Uint8Array(spkiPrefix.length + raw.length);
  spki.set(spkiPrefix); spki.set(raw, spkiPrefix.length);
  const key = await crypto.subtle.importKey("spki", spki, { name: "Ed25519" }, false, ["verify"]);
  return crypto.subtle.verify("Ed25519", key, hexToBytes(sigHex), data);
}

async function assembleAndLoad() {
  if (!total || seen.size !== total) { note("loadOut", "INCOMPLETE — have " + seen.size + "/" + (total||"?") + " chunks. Refused (fail-closed).", "bad"); return; }
  let b64 = "";
  for (let i = 1; i <= total; i++) { const d = seen.get(i); if (d === undefined) { note("loadOut", "INCOMPLETE — missing chunk " + i + ".", "bad"); return; } b64 += d; }
  let zoneObj; try { zoneObj = JSON.parse(new TextDecoder().decode(b64urlToBytes(b64))); } catch (e) { note("loadOut", "REFUSED — assembly is not a valid zone.", "bad"); return; }
  if (zoneObj.v !== 2 || zoneObj.zone !== "harz" || !Array.isArray(zoneObj.records)) { note("loadOut", "REFUSED — not a HARZ v2 zone.", "bad"); return; }
  const pubHex = String(zoneObj.signed_by || "").replace("ed25519:", "");
  const sigHex = String(zoneObj.sig || "").replace("ed25519:", "");
  const anchor = document.getElementById("anchor").value.trim().toLowerCase();
  if (!anchor) { note("loadOut", "REFUSED — no anchor pinned. The trust bundle is out-of-band by design; paste the anchor pub hex.", "bad"); return; }
  if (pubHex !== anchor) { note("loadOut", "REFUSED — WRONG ANCHOR: zone signed by a different key than the pinned anchor.", "bad"); return; }
  let ok = false;
  try { ok = await verifyZone(zoneObj, pubHex, sigHex); } catch (e) { ok = false; }
  if (!ok) { note("loadOut", "REFUSED — SIGNATURE FAILED (tampered or forged zone, or this browser cannot verify Ed25519 — fail-closed either way).", "bad"); return; }
  const minR = parseInt(document.getElementById("minr").value, 10);
  const minH = parseInt(document.getElementById("minh").value, 10);
  if (Number.isInteger(minR) && zoneObj.records.length < minR) { note("loadOut", "REFUSED — NAMESPACE SHRINK: " + zoneObj.records.length + " records < floor " + minR + " (valid sig, malicious or stolen authority suspected).", "bad"); return; }
  const zh = Number.isInteger(zoneObj.height) ? zoneObj.height : 0;
  if (Number.isInteger(minH) && zh < minH) { note("loadOut", "REFUSED — ROLLBACK: zone height " + zh + " < expected " + minH + " (replayed old zone).", "bad"); return; }
  // load into engine
  const idx = new Map();
  for (const r of zoneObj.records) { if (idx.has(r.name)) { note("loadOut", "REFUSED — duplicate name " + r.name + ".", "bad"); return; } idx.set(r.name, r); }
  zone = zoneObj; engine = idx;
  note("loadOut", "LOADED ✓ " + zoneObj.records.length + " names · height " + zh + " · signature VALID against pinned anchor" + (Number.isInteger(minR) ? " · shrink floor " + minR : "") + (Number.isInteger(minH) ? " · height floor " + minH : ""), "ok");
  document.getElementById("resolveCard").style.display = "block";
}
function resolveNow() {
  if (!engine) return;
  let n = document.getElementById("qname").value.trim().toLowerCase();
  if (!n) return;
  if (n.endsWith(".")) n = n.slice(0, -1);
  if (!n.endsWith(".harz")) n += ".harz";
  const rec = engine.get(n);
  const out = document.getElementById("resolveOut"), det = document.getElementById("detail");
  if (!rec) { out.textContent = "NXDOMAIN — " + n + " is not in this zone (honest absence, no guessing)."; out.className = "bad"; det.textContent = ""; return; }
  out.textContent = "FOUND ✓ " + n; out.className = "ok";
  det.textContent = JSON.stringify({ service: rec.service, identity: rec.identity, identity_pending: rec.identity === "PENDING", state: rec.state, endpoints: rec.endpoints, transports_present: Object.keys(rec.endpoints || {}) }, null, 1);
}
</script>
</body>
</html>`;

const MANIFEST = JSON.stringify({
  name: "HARZ Root Receiver", short_name: "HR Receiver",
  description: "Scan the signed HARZ zone from paper, verify against the anchor, resolve offline.",
  start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
});

const SW = `// HARZ Root Receiver SW — offline shell (network-first with cache fallback)
self.addEventListener("install", (e) => { e.waitUntil(caches.open("hrx-v1").then(c => c.addAll(["/"]))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(clients.claim()); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then((r) => {
    const copy = r.clone(); caches.open("hrx-v1").then((c) => c.put(e.request, copy)).catch(() => {});
    return r;
  }).catch(() => caches.match(e.request).then((m) => m || new Response("offline", { status: 503, headers: { "content-type": "text/plain" } }))));
});`;

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#1a5fb4"/><rect x="20" y="30" width="12" height="12" fill="#fff"/><rect x="38" y="30" width="12" height="12" fill="#fff" opacity="0.8"/><rect x="20" y="48" width="12" height="12" fill="#fff" opacity="0.6"/><rect x="20" y="66" width="30" height="8" rx="4" fill="#fff"/><path d="M62 40 L82 40 M70 32 L78 40 L70 48" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const H = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" };
    if (url.pathname === "/manifest.json") return new Response(MANIFEST, { headers: { "content-type": "application/manifest+json", "cache-control": "no-store" } });
    if (url.pathname === "/sw.js") return new Response(SW, { headers: { "content-type": "application/javascript", "cache-control": "no-store" } });
    if (url.pathname === "/icon.svg") return new Response(ICON, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });
    if (url.pathname === "/health") return Response.json({ status: "ok", service: "harz-root-receiver", version: "1.0.0", theme: "#f0f2f5", pwa: true });
    return new Response(HTML, { headers: H });
  }
};
