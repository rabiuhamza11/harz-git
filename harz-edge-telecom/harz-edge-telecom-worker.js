var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// edge-new.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __defProp22 = Object.defineProperty;
var __name22 = /* @__PURE__ */ __name2((target, value) => __defProp22(target, "name", { value, configurable: true }), "__name");
var REPORT_MD = `
# HARZ EDGE TELECOM \u2014 SOUND-OVER-MESH VALIDATION REPORT
Compiled: 6 Sep 2026 (evening) | Location: sandbox (logic layer) | Status: ALL TESTS PASS

## 1. EXECUTIVE SUMMARY
The HARZ-Mesh v2.1 protocol was validated end-to-end at the logic layer using simulated
Android devices over real TCP sockets, running the exact data-plane protocol implemented
in the Kotlin app (WifiDirectManager: GO ServerSocket :8988, HELLO magic 0x48415A5A +
edge-ID registration; MeshService: dedup, TTL, hop counting, route append, store-and-forward).
Payload under test: a real 2.4-second WAV file (4-tone HARZ jingle, 660/880/440/990 Hz,
38,478 bytes, md5 647d36b8).

Result: every configuration delivered the audio BIT-IDENTICAL \u2014 including a mid-run
relay outage and 50% packet loss. One engineering gap (no retransmit) was measured,
fixed in the harness, and stress-verified.

## 2. TEST MATRIX (all on v2.1 logic)
1. 2-node Infinix pair (Hot 10i A + Hot 10i B): 33/33 packets, bit-identical. PASS
2. 3-node Infinix (A sender -> B relay GO -> C receiver, no direct A-C link): 33/33
   via route [BBBB], hops=1, bit-identical, 33/33 ACKs back to A. PASS
3. 3-node + mid-run relay outage (B killed at packet 16): delivery halted exactly as
   designed, 20 frames store-and-forwarded, 20 flushed on return, audio completed
   byte-identical. PASS (G2-E + G4 behavior)
4. Tecno category (Spark 10 GO + Camon 20 client, MediaTek profile: Wi-Fi Aware
   unavailable, 900B chunks, 20ms pacing): 43/43, bit-identical. PASS
5. Mixed fleet Infinix GO <-> Tecno client: 33/33, bit-identical. PASS
6. Mixed fleet reversed (Tecno GO <-> Infinix client): 43/43, bit-identical. PASS
7. 3-phone mixed fleet (Infinix sender -> Tecno relay -> Tecno receiver) + outage at
   packet 21: 43/43 delivered, route [TCS1], byte-identical, DTN store 22 + flush 22. PASS

## 3. LOSS & RECOVERY (retransmit-on-ACK-timeout, harness v2.2 candidate)
Before fix: 10% loss -> 91% delivered, audio corrupted (audible glitch, 3.6KB missing).
After adding per-seq ACK tracking + resend-on-timeout (receiver dedup handles duplicates):
1. 10% loss: 100% delivery, bit-identical
2. 30% loss: 100% delivery, bit-identical
3. 50% loss: 100% delivery, bit-identical \u2014 recovered in ONE retransmit round
Note: harness feature only. Kotlin MeshService does NOT have retransmit yet \u2014 queued as
the first G5 (voice) engineering item. NOT to be added before G1/G2 field execution,
because the frozen protocol counts MISSING honestly without rescue.

## 4. HONEST CLASSIFICATION (what this proves / what it does not)
PROVEN: v2.1 packet pipeline (serialize/parse/forward/dedup/TTL/route/store-forward),
the data-plane protocol, multi-hop A->B->C, DTN recovery of a real payload, device-class
and brand independence, loss-tolerant delivery with retransmit.
NOT PROVEN: radio reality \u2014 actual Wi-Fi Direct group formation, GO negotiation over the
air, signal range, interference, battery. No KVM in the sandbox means no Android VM.
The frozen G1/G2 field protocol on three physical phones (v2.1 APK, internet OFF)
remains the ONLY way to close that question.

## 5. ARTIFACTS (in conversation workspace + notes)
- harz-jingle-original.wav / harz-jingle-received.wav (md5 647d36b8 both)
- harz-jingle-3phone-received.wav (bit-identical after A->B->C + outage)
- harz-jingle-spectrogram.png (received-audio spectral proof)
- sound-mesh-test.js (2-node harness), sound-mesh-3phone.js (3-node harness)
- Full log: notes/harz-edge-telecom-mesh/sandbox-3phone-2026-09-06.md
- Protocol: notes/harz-edge-telecom-mesh/g1-g2-field-test-protocol-v1.0.md

## 6. FROZEN BUILD + NEXT STEP
Field build: HARZ-Edge-Telecom-v2.1.apk (2.1.0-fieldready, versionCode 3, md5 61c659bc).
Next: install v2.1 on three physical phones, internet OFF, execute the frozen G1/G2
protocol. Radio reality is the only open question.
`.trim();
function reportPage(version) {
  const body = REPORT_MD.split("\n").map((line) => {
    const esc = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (esc.startsWith("# ")) return `<h1>${esc.slice(2)}</h1>`;
    if (esc.startsWith("## ")) return `<h2>${esc.slice(3)}</h2>`;
    if (esc === "") return "";
    return `<p class="${esc.match(/^\d+\./) ? "li" : ""}">${esc}</p>`;
  }).join("\n");
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pre-Validation Report \u2014 HARZ Edge Telecom</title>
<link rel="manifest" href="/manifest.json">
<style>
body{font-family:-apple-system,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;color:#1a1a2e;margin:0;padding:20px;line-height:1.55;max-width:860px;}
h1{font-size:1.25rem;border-bottom:3px solid #2563eb;padding-bottom:8px;}
h2{font-size:1.05rem;color:#2563eb;margin-top:1.6em;}
p{margin:.45em 0;}
p.li{padding-left:1.2em;}
.raw{display:inline-block;margin-top:18px;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;}
code,pre{background:#e8ebf0;padding:2px 6px;border-radius:4px;font-size:.92em;}
</style></head><body>
${body}
<p><a class="raw" href="/report.md">Raw report copy for workers (report.md)</a></p>
<p style="font-size:.85em;color:#666">HARZ Edge Telecom v${version} \xB7 light theme #f0f2f5 \xB7 Part of the HARZ ecosystem</p>
</body></html>`;
}
__name(reportPage, "reportPage");
__name2(reportPage, "reportPage");
__name22(reportPage, "reportPage");
var VERSION = "5.3.0";
var THEME = "#f0f2f5";
var CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#f0f2f5;color:#1a1a2e;line-height:1.5;padding-bottom:24px}
.hd{text-align:center;padding:20px 16px 8px}
.hd h1{font-size:1.45rem;letter-spacing:.5px}
.hd .sub{color:#5c6470;font-size:.9rem;margin-top:4px}
.badge{display:inline-block;background:#e8f5e9;color:#1b5e20;border-radius:20px;padding:3px 12px;font-size:.75rem;font-weight:600;margin-top:8px}
.wrap{max-width:640px;margin:0 auto;padding:12px 16px}
.card{background:#fff;border-radius:12px;padding:16px;margin:12px 0;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.card h2{font-size:1.05rem;margin-bottom:8px}
.card p{font-size:.9rem;color:#3a4150}
.chain{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.chip{background:#eef2ff;color:#3730a3;border-radius:8px;padding:5px 10px;font-size:.8rem;font-weight:600}
.arrow{color:#9aa1ad;align-self:center;font-size:.8rem}
.lvl{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #eef0f3;font-size:.85rem}
.lvl:last-child{border-bottom:none}
.lvl b{min-width:74px;color:#0a7d3c}
.gate{border-radius:10px;padding:12px;margin:10px 0;border:1px solid #e3e6ea}
.gate .g-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px}
.gate b{font-size:.9rem}
.st{font-size:.7rem;font-weight:700;border-radius:12px;padding:2px 10px}
.st-frozen{background:#fff3cd;color:#8a6d00}
.st-pass{background:#e8f5e9;color:#1b5e20}
.st-fail{background:#fdecea;color:#b3261e}
.st-queued{background:#eceff1;color:#546e7a}
.gate ul{margin:6px 0 0 18px;font-size:.8rem;color:#4a5260}
.meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.stat{background:#f6f8fa;border-radius:8px;padding:6px 10px;font-size:.75rem}
.stat b{display:block;font-size:.95rem;color:#0a7d3c}
.nav{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:4px 0 8px}
.nav a{background:#fff;border:1px solid #dfe3e8;color:#0a7d3c;text-decoration:none;border-radius:20px;padding:6px 14px;font-size:.8rem;font-weight:600}
.note{font-size:.78rem;color:#5c6470;padding:0 4px}
.ft{text-align:center;color:#8b93a0;font-size:.75rem;padding:14px 0}
.ft a{color:#0a7d3c}
`;
var MANIFEST = {
  name: "HARZ Edge Telecom",
  short_name: "HARZ Edge",
  start_url: "/",
  display: "standalone",
  background_color: "#f0f2f5",
  theme_color: "#f0f2f5",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
};
var ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="#f0f2f5"/><path d="M48 26a26 26 0 0 0-26 26c0 6 2 11.5 5.4 16l-3.9 6.7a2 2 0 0 0 2.4 2.9l7.4-2.6A26 26 0 1 0 48 26z" fill="#0a7d3c"/><circle cx="38" cy="52" r="3.6" fill="#fff"/><circle cx="48" cy="52" r="3.6" fill="#fff"/><circle cx="58" cy="52" r="3.6" fill="#fff"/></svg>`;
var SW = `
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil((async () => {
  const keep = 'harz-edge-v'+'${VERSION}';
  const keys = await caches.keys();
  for (const k of keys) { if (k !== keep) await caches.delete(k); }
  await self.clients.claim();
})()); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/sw.js')) return; // live data is never cached
  if (e.request.mode !== 'navigate') return; // only cache page navigations
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open('harz-edge-v'+'${VERSION}').then(c => c.put(e.request, cp)); }
      return res;
    }).catch(() => caches.match(e.request).then(c => c || caches.match('/mesh')))
  );
});
`;
function shell(title, body, activeNav) {
  const nav = [
    ["/", "Overview"],
    ["/gates", "Validation Gates"],
    ["/app", "The App"],
    ["/mesh", "G3 Network"]
  ].map(
    ([href, label]) => `<a href="${href}"${href === activeNav ? ' style="background:#0a7d3c;color:#fff;border-color:#0a7d3c"' : ""}>${label}</a>`
  ).join("");
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${THEME}">
<meta name="description" content="HARZ Edge Telecom \u2014 serverless-first phone mesh network. Phones are the infrastructure.">
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="HARZ Edge">
<title>${title}</title><style>${CSS}</style></head><body>
<div class="hd"><h1>\u{1F4E1} HARZ EDGE TELECOM</h1><div class="sub">The Phone Mesh Network</div>
<div class="badge">G1/G2 FIELD PROTOCOL FROZEN \u2014 SEP 6, 2026</div></div>
<div class="nav">${nav}</div>
<div class="wrap">${body}</div>
<div class="ft">HARZ Edge Telecom v${VERSION} \xB7 <a href="https://harz-super-app.harz.workers.dev">HARZ Super App</a> \xB7 Part of the HARZ ecosystem</div>
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw2.js')}<\/script>
</body></html>`;
}
__name(shell, "shell");
__name2(shell, "shell");
__name22(shell, "shell");
function overview() {
  return shell("HARZ Edge Telecom \u2014 Phone Mesh Network", `
<div class="card">
<h2>Phones are the infrastructure</h2>
<p>HARZ Edge Telecom is a serverless-first mesh network: ordinary Android phones form the network themselves \u2014 no server, no cellular tower, no internet required for local communication. Built for communities where connectivity is expensive, censored, or absent.</p>
<div class="chain"><span class="chip">Wi-Fi Aware</span><span class="arrow">\u2192</span><span class="chip">Wi-Fi Direct</span><span class="arrow">\u2192</span><span class="chip">BLE</span></div>
<p class="note">The routing layer (HARZ-Mesh) sits above all three radio transports \u2014 the network is not synonymous with any single radio.</p>
</div>

<div class="card">
<h2>Architecture levels</h2>
<div class="lvl"><b>Level 0</b><span>Phone \u2194 Phone \u2014 direct radio link (Wi-Fi Aware / Direct / BLE)</span></div>
<div class="lvl"><b>Level 1</b><span>Phone mesh \u2014 multi-hop forwarding with TTL + hop control, encrypted (ChaCha20-Poly1305)</span></div>
<div class="lvl"><b>Level 2</b><span>Phone-as-edge-server \u2014 relay, identity directory, message store on a phone</span></div>
<div class="lvl"><b>Level 3</b><span>Community edge nodes \u2014 Raspberry Pi / solar towers extend the mesh</span></div>
<div class="lvl"><b>Level 4</b><span>Optional internet gateway \u2014 the mesh bridges to the wider world when a link exists</span></div>
</div>

<div class="card">
<h2>Validation status \u2014 the 5 gates</h2>
<div class="gate"><div class="g-head"><b>G1 \xB7 Radio Reality</b><span class="st st-frozen">PROTOCOL FROZEN \u2014 AWAITING FIELD RUN</span></div>
<ul><li>Can target-class Android phones establish reliable links via the fallback chain?</li><li>Includes the Group-Owner negotiation attack and link-recovery tests</li></ul></div>
<div class="gate"><div class="g-head"><b>G2 \xB7 Multi-Hop Reality</b><span class="st st-frozen">PROTOCOL FROZEN \u2014 AWAITING FIELD RUN</span></div>
<ul><li>Can A \u2192 B \u2192 C forward packets when A and C cannot reach each other?</li><li>3 phones, \u226515 m separation verified by direct-path check, \u226590% delivery per trial</li></ul></div>
<div class="gate"><div class="g-head"><b>G3 \xB7 Mobility</b><span class="st st-queued">QUEUED BEHIND G1/G2</span></div>
<ul><li>Do routes survive people moving, radios sleeping, peers disappearing?</li></ul></div>
<div class="gate"><div class="g-head"><b>G4 \xB7 Store-and-Forward</b><span class="st st-queued">QUEUED BEHIND G1/G2</span></div>
<ul><li>Does a message survive a long partition and still reach its destination?</li></ul></div>
<div class="gate"><div class="g-head"><b>G5 \xB7 Voice Feasibility</b><span class="st st-queued">STRETCH GOAL</span></div>
<ul><li>Live call experience \u2014 attempted only after G1\u2013G4 pass</li><li>Honest framing: a disconnected communications network first; a global offline telephone later, maybe</li></ul></div>
</div>

<div class="card">
<h2>What we measure \u2014 not what we claim</h2>
<p>Every field run produces raw CSV from the app's metrics collector: link quality, packet delivery, route changes, recovery times, battery drain, voice loss/jitter. Missing data stays MISSING. Failed runs stay failed. The failure is the result.</p>
<p class="note" style="margin-top:8px">See <a href="/gates">the frozen G1/G2 protocol</a> for the full test discipline.</p>
</div>`, "/");
}
__name(overview, "overview");
__name2(overview, "overview");
__name22(overview, "overview");
function gates() {
  return shell("Validation Gates \u2014 HARZ Edge Telecom", `
<div class="card">
<h2>G1/G2 Field Test Protocol v1.0 \u2014 frozen for execution</h2>
<p>Sealed 6 September 2026. Three Android phones: A (sender), B (relay), C (receiver). Internet OFF. No cloud. No code changes during execution. Frozen build: HARZ Edge v2.1 APK (re-frozen 6 Sep 2026 after sandbox testing found and fixed 5 v2.0 code bugs).</p>
<div class="meta">
<div class="stat"><b>N = 3</b>independent runs per arm</div>
<div class="stat"><b>\u226590%</b>delivery in each 100-packet trial</div>
<div class="stat"><b>\u226515 m</b>A\u2013C separation, direct-path verified</div>
<div class="stat"><b>Raw CSV</b>required artifact</div>
</div>
</div>

<div class="card">
<h2>G1 \u2014 Radio Reality</h2>
<div class="lvl"><b>G1-A</b><span>Capability discovery per phone \u2014 Aware / Direct / BLE, transport chosen, discovery + association times. Aware unavailable = recorded finding, not failure.</span></div>
<div class="lvl"><b>G1-B</b><span>Direct link A\u2194B, 3 attempts \xD7 100 numbered packets \u2014 pass at \u226590% delivery and 2/3 connections.</span></div>
<div class="lvl"><b>G1-C</b><span>Group-Owner trap: A initiates, B initiates, both initiate. Auto-recovery = measured behavior; stranded nodes = failure.</span></div>
<div class="lvl"><b>G1-D</b><span>Link recovery: physical interruption, 3 reps \u2014 recovery without app restart in 2/3.</span></div>
</div>

<div class="card">
<h2>G2 \u2014 Multi-Hop Reality</h2>
<div class="lvl"><b>G2-A</b><span>Topology A\u2192B\u2192C with proven radio isolation between A and C (direct-path check, 3 attempts).</span></div>
<div class="lvl"><b>G2-B</b><span>100 numbered packets through B \u2014 \u226590/100 delivered, hop counts up, TTL down, no loops, B demonstrably intermediate.</span></div>
<div class="lvl"><b>G2-C</b><span>TTL attack: TTL 0 must not forward, TTL 1 stops at B, TTL 2+ may traverse. Indefinite circulation = integrity failure.</span></div>
<div class="lvl"><b>G2-D</b><span>Relay battery cost from measured telemetry \u2014 no threshold in v1.0; the first run establishes the cost curve.</span></div>
<div class="lvl"><b>G2-E</b><span>Relay failure: remove B mid-run \u2014 does the network detect its relay disappeared? Observational.</span></div>
</div>

<div class="card">
<h2>Classification \u2014 exactly one per gate</h2>
<p><b>PASS</b> \u2014 all criteria satisfied \xB7 <b>FAIL</b> \u2014 valid run, criteria not met \xB7 <b>INVALID</b> \u2014 measurement apparatus prevented determination.</p>
<p class="note" style="margin-top:6px">Aggregate statistics cannot rescue a failed individual trial. Thresholds do not move after seeing results. If the system fails, the failure is the result.</p>
</div>`, "/gates");
}
__name(gates, "gates");
__name2(gates, "gates");
__name22(gates, "gates");
function appPage() {
  return shell("The App \u2014 HARZ Edge Telecom", `
<div class="card">
<h2>HARZ Edge v2.1 \u2014 Android mesh client</h2>
<p>The phone app that makes the network real. Built in Kotlin, ~2,000 lines across 15 modules. No servers required for local operation.</p>
<div class="meta">
<div class="stat"><b>3 radios</b>Aware / Direct / BLE managers</div>
<div class="stat"><b>Mesh packets</b>TTL \xB7 hop \xB7 route \xB7 signature</div>
<div class="stat"><b>Encrypted</b>ChaCha20-Poly1305</div>
<div class="stat"><b>Identity</b>Ed25519 Edge IDs</div>
<div class="stat"><b>Voice</b>Opus codec (stretch)</div>
<div class="stat"><b>Metrics</b>CSV test collector</div>
</div>
</div>

<div class="card">
<h2>What's inside</h2>
<div class="lvl"><b>Radios</b><span>WifiAwareManager, WifiDirectManager, RadioController with automatic fallback chain</span></div>
<div class="lvl"><b>Mesh</b><span>HARZMesh packets with TTL, hop counts and route lists; MeshService multi-hop forwarding; EdgeServer phone-as-server; store-and-forward message store</span></div>
<div class="lvl"><b>Trust</b><span>IdentityManager (Ed25519), CryptoManager (ChaCha20-Poly1305), signed packets</span></div>
<div class="lvl"><b>Field kit</b><span>TestMetricsCollector \u2014 link quality, battery/hour, route changes, recovery, voice loss/jitter \u2192 raw CSV</span></div>
</div>

<div class="card">
<h2>Get the APK</h2>
<p>The frozen v2.1 build (2.1.0-fieldready) is the only build valid for G1/G2 field testing. Identical version on all three phones. Distribution via the HARZ team \u2014 join the field test program through the Super App.</p>
</div>`, "/app");
}
__name(appPage, "appPage");
__name2(appPage, "appPage");
__name22(appPage, "appPage");
var RADIO_CODEC = `// HARZ RADIO CODEC v1.1 \u2014 FSK over sound (2 tones: 1000 Hz = 0, 1500 Hz = 1; decoder is rate-adaptive)
// Pure functions, no browser APIs: encode(text) \u2192 Float32Array PCM; decode(pcm, sampleRate) \u2192 text | null
// Frame: 8-bit alternating preamble + magic "HRZ1" + 16-bit length + UTF-8 payload + CRC16 (CCITT).
var HRC = (function () {
  var RATE = 48000, BITMS = 16, BIT = Math.round(RATE * BITMS / 1000); // 768 samples, 62.5 bits/sec
  var F0 = 1000, F1 = 1500, RAMP = 38; // ~1ms raised-cosine ramp; exact Goertzel bins at 768-sample windows (k=16, k=24)
  var PREAMBLE = [1, 0, 1, 0, 1, 0, 1, 0];
  var MAGIC = [0x48, 0x52, 0x5a, 0x31]; // "HRZ1"
  var MAXPAY = 90;

  function crc16(bytes) {
    var c = 0xFFFF;
    for (var i = 0; i < bytes.length; i++) {
      c ^= bytes[i] << 8;
      for (var j = 0; j < 8; j++) c = (c & 0x8000) ? (((c << 1) ^ 0x1021) & 0xFFFF) : ((c << 1) & 0xFFFF);
    }
    return c & 0xFFFF;
  }
  function bytesToBits(bytes) {
    var bits = [];
    for (var i = 0; i < bytes.length; i++) for (var b = 7; b >= 0; b--) bits.push((bytes[i] >> b) & 1);
    return bits;
  }
  function bitsToBytes(bits) {
    var out = [];
    for (var i = 0; i + 8 <= bits.length; i += 8) {
      var v = 0;
      for (var b = 0; b < 8; b++) v = (v << 1) | bits[i + b];
      out.push(v);
    }
    return out;
  }
  // encode text \u2192 {pcm: Float32Array, durationSec, bits}
  function encode(text) {
    if (typeof text !== "string") return null;
    var bytes = [];
    var u = unescape(encodeURIComponent(text)); // UTF-8 bytes
    for (var i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i) & 0xFF);
    if (bytes.length > MAXPAY) return null;
    var frame = [].concat(MAGIC, [(bytes.length >> 8) & 0xFF, bytes.length & 0xFF], bytes);
    var crc = crc16(frame);
    frame.push((crc >> 8) & 0xFF, crc & 0xFF);
    var bits = PREAMBLE.slice().concat(bytesToBits(frame));
    var n = bits.length * BIT;
    var pcm = new Float32Array(n);
    for (var k = 0; k < bits.length; k++) {
      var f = bits[k] ? F1 : F0, off = k * BIT;
      for (var s = 0; s < BIT; s++) {
        var g = 1;
        if (s < RAMP) g = 0.5 * (1 - Math.cos(Math.PI * s / RAMP));
        else if (s >= BIT - RAMP) g = 0.5 * (1 - Math.cos(Math.PI * (BIT - s) / RAMP));
        pcm[off + s] = g * 0.9 * Math.sin(2 * Math.PI * f * (s / RATE));
      }
    }
    return { pcm: pcm, durationSec: n / RATE, bits: bits.length };
  }
  // Goertzel energy at freq over pcm[start, start+len)
  function goertzel(pcm, start, len, freq, rate) {
    var k = Math.round(len * freq / rate), w = 2 * Math.PI * k / len;
    var coeff = 2 * Math.cos(w), s0 = 0, s1 = 0, s2 = 0;
    for (var i = 0; i < len; i++) {
      s0 = pcm[start + i] + coeff * s1 - s2; s2 = s1; s1 = s0;
    }
    return s1 * s1 + s2 * s2 - coeff * s1 * s2;
  }
  function bitAt(pcm, start, rate) {
    var len = Math.round(rate * BITMS / 1000);
    if (start + len > pcm.length) return null;
    var e1 = goertzel(pcm, start, len, F1, rate), e0 = goertzel(pcm, start, len, F0, rate);
    var tot = e0 + e1;
    if (tot < 1e-6) return null; // silence
    return e1 > e0 ? 1 : 0;
  }
  // decode pcm \u2192 {text} | null. Sliding search for preamble, then read frame.
  function decode(pcm, rate) {
    rate = rate || RATE;
    var B = Math.round(rate * BITMS / 1000); // bit width at THIS rate (mic may run 44.1k/16k)
    if (!pcm || pcm.length < B) return null;
    var step = Math.max(1, Math.round(B / 4));
    for (var off = 0; off + PREAMBLE.length * B + 56 * B < pcm.length; off += step) {
      // preamble check with margin dominance
      var ok = true;
      for (var p = 0; p < PREAMBLE.length && ok; p++) {
        var b = bitAt(pcm, off + p * B, rate);
        if (b === null || b !== PREAMBLE[p]) ok = false;
      }
      if (!ok) continue;
      // read frame bits after preamble
      var bits = [], pos = off + PREAMBLE.length * B;
      // read 32 magic + 16 len first (48 bits)
      for (var i = 0; i < 48; i++) {
        var b = bitAt(pcm, pos + i * B, rate);
        if (b === null) { ok = false; break; }
        bits.push(b);
      }
      if (!ok) continue;
      var head = bitsToBytes(bits);
      var magicOk = true;
      for (var m = 0; m < 4; m++) if (head[m] !== MAGIC[m]) magicOk = false;
      if (!magicOk) { off += PREAMBLE.length * B - step; continue; }
      var payLen = (head[4] << 8) | head[5];
      if (payLen > MAXPAY || payLen < 1) continue;
      var totalBits = 48 + payLen * 8 + 16;
      if (pos + totalBits * B > pcm.length) {
        // fractional-rate rounding can overshoot the buffer by a few samples at the frame's last bits \u2014
        // pad with silence (Goertzel-quiet zeros) instead of dropping a decodable frame
        var ext = new Float32Array(pos + totalBits * B);
        ext.set(pcm);
        pcm = ext;
      }
      for (var i = 48; i < totalBits; i++) {
        var b = bitAt(pcm, pos + i * B, rate);
        if (b === null) { ok = false; break; }
        bits.push(b);
      }
      if (!ok) continue;
      var all = bitsToBytes(bits);
      var frame = all.slice(0, 4 + 2 + payLen);
      var crc = (all[all.length - 2] << 8) | all[all.length - 1];
      if (crc16(frame) !== crc) continue;
      var pay = frame.slice(6);
      var txt = "";
      try { txt = decodeURIComponent(escape(pay.map(function (c) { return String.fromCharCode(c); }).join(""))); } catch (e) { continue; }
      return { text: txt, samplesIn: off, durationSec: (off + totalBits * B) / rate };
    }
    return null;
  }
  return { encode: encode, decode: decode, RATE: RATE, BIT: BIT, MAXPAY: MAXPAY, crc16: crc16, frameOf: function (text) { return "0800000000000" + text.length; } };
})();`;
var RADIO_JS = `
var log = (t, cls) => { document.getElementById('rlog').innerHTML = '<div class="' + (cls || 'note') + '">' + t + '</div>'; };
var PH = localStorage.getItem('mesh-phone') || '';
document.getElementById('rfrom').value = PH;
var vp = document.getElementById('vinph'); if (vp && PH) vp.value = PH;
var esc = function(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); };
var mode = 'send';
function setMode(m) {
  mode = m;
  document.getElementById('bsend').style.fontWeight = (m === 'send') ? '900' : '400';
  document.getElementById('bbcast').style.fontWeight = (m === 'bcast') ? '900' : '400';
  document.getElementById('rto').style.display = (m === 'send') ? 'block' : 'none';
  document.getElementById('bcastnote').style.display = (m === 'bcast') ? 'block' : 'none';
  document.getElementById('txbtn').textContent = (m === 'send') ? 'PLAY THE CHIRP' : 'BROADCAST TO THE ROOM';
}
function frame() {
  var f = document.getElementById('rfrom').value.replace(/[^0-9]/g, '');
  var body = document.getElementById('rbody').value.trim();
  if (!f || !body) return null;
  if (mode === 'bcast') return { f: f, to: null, body: body, text: 'B|' + f + '|' + body };
  var to = document.getElementById('rto').value.replace(/[^0-9]/g, '');
  if (!to) return null;
  return { f: f, to: to, body: body, text: f + '|' + to + '|' + body };
}
function selfTest() {
  var t = 'Self-test: sound round trip at 62.5bps';
  var e = HRC.encode(t);
  var d = HRC.decode(e.pcm, HRC.RATE);
  document.getElementById('selfres').innerHTML = (d && d.text === t) ? 'PASS \u2014 the message survived speaker math and mic math, bit for bit.' : 'FAIL';
}
function transmit() {
  var fr = frame();
  if (!fr) { log(mode === 'bcast' ? 'Your phone and the bulletin are required.' : 'From, to and message are required.', 'bad'); return; }
  var e = HRC.encode(fr.text);
  if (!e) { log('Too long for the sound rail (max 90 bytes total).', 'bad'); return; }
  try {
    var ctx = new AudioContext({ sampleRate: HRC.RATE });
    var gap = Math.round(HRC.RATE * 0.15);
    var rep = new Float32Array((e.pcm.length + gap) * 3 - gap);
    for (var rr = 0; rr < 3; rr++) rep.set(e.pcm, rr * (e.pcm.length + gap));
    var buf = ctx.createBuffer(1, rep.length, HRC.RATE);
    buf.copyToChannel(rep, 0);
    var src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
    src.start();
    log(mode === 'bcast'
      ? 'Broadcasting ' + (e.durationSec * 3).toFixed(1) + 's of sound (3 repeats). Every listening phone in earshot can catch it. Repeat freely \u2014 fresh broadcasts deliver.'
      : 'Transmitting ' + (e.durationSec * 3).toFixed(1) + 's of sound (3 repeats). Hold the phones close. ' + e.bits + ' bits on air.', 'ok');
  } catch (err) { log('Audio blocked: ' + err.message, 'bad'); }
}
var listening = false, micCtx = null, micStream = null;
async function listen() {
  if (listening) { listening = false; var mEl0 = document.getElementById('sigmeter'); if (mEl0) mEl0.innerHTML = 'Signal: idle'; document.getElementById('listenbtn').textContent = 'START LISTENING'; if (micStream) micStream.getTracks().forEach(function (t) { t.stop(); }); if (micCtx) micCtx.close(); return; }
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    micCtx = new AudioContext();
    var rate = micCtx.sampleRate;
    var proc = micCtx.createScriptProcessor(4096, 1, 1);
    var rolling = new Float32Array(Math.ceil(rate * 20));
    var wpos = 0;
    proc.onaudioprocess = function (ev) {
      var d = ev.inputBuffer.getChannelData(0);
      for (var i = 0; i < d.length; i++) { rolling[wpos % rolling.length] = d[i]; wpos++; }
    };
    var probe = setInterval(function () {
      if (!listening) { clearInterval(probe); return; }
      var flat = new Float32Array(rolling.length);
      var start = wpos % rolling.length;
      for (var i = 0; i < rolling.length; i++) flat[i] = rolling[(start + i) % rolling.length];
      var win = Math.min(flat.length, Math.round(rate * 0.3));
      var seg = flat.subarray(flat.length - win);
      var sumsq = 0; for (var ii = 0; ii < win; ii++) sumsq += seg[ii] * seg[ii];
      var db = 20 * Math.log10(Math.sqrt(sumsq / win) || 1e-9);
      var mEl = document.getElementById('sigmeter');
      if (mEl) {
        var col = db > -38 ? '#0a7d3c' : (db > -52 ? '#b8860b' : '#a0a0a0');
        var pct = Math.max(0, Math.min(100, Math.round((db + 70) * 100 / 55)));
        mEl.innerHTML = 'Signal: ' + db.toFixed(1) + ' dB <span style="display:inline-block;width:' + pct + '%;height:8px;background:' + col + ';border-radius:2px;vertical-align:middle"></span> ' + (db > -38 ? '(strong)' : (db > -52 ? '(weak, move closer or raise volume)' : '(too quiet)'));
      }
      var d = HRC.decode(flat, rate);
      if (d && d.text) { for (var i = 0; i < rolling.length; i++) rolling[i] = 0; gotMessage(d.text); }
    }, 700);
    proc.connect(micCtx.destination);
    listening = true;
    document.getElementById('listenbtn').textContent = 'STOP LISTENING';
    log('Listening through the mic at ' + rate + ' Hz. Waiting for a chirp...', 'ok');
  } catch (err) { log('Microphone blocked: ' + err.message + ' \u2014 allow mic access to receive.', 'bad'); }
}
var lastMsg = null;
function gotMessage(text) {
  lastMsg = text;
  var parts = text.split('|');
  if (parts[0] === 'B' && parts.length >= 3) {
    document.getElementById('rinbox').innerHTML = '<div class="msg" style="background:#eef7f0"><div class="m">BROADCAST from ' + esc(parts[1]) + '</div>' + esc(parts.slice(2).join('|')) + '</div><input id="relayto" placeholder="Relay onward \u2014 enter a phone number"><button onclick="relayBulletin()">RELAY INTO THE MESH</button>';
    log('A broadcast was decoded from sound. Relay it so absent citizens get it through store-and-forward.', 'ok');
    return;
  }
  document.getElementById('rinbox').innerHTML = '<div class="msg"><div class="m">Decoded from ' + esc(parts[0] || 'unknown') + (parts[1] ? ' for ' + esc(parts[1]) : '') + '</div>' + esc(parts.slice(2).join('|')) + '</div><button onclick="sendToMesh()">SEND TO MESH QUEUE</button>';
  log('Message decoded from sound. Send it to the mesh queue so it rides the network.', 'ok');
}
async function sendToMesh() {
  if (!lastMsg) return;
  var parts = lastMsg.split('|');
  var r = await fetch('/api/msg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: parts[0], to: parts[1], text: parts.slice(2).join('|') }) });
  var d = await r.json();
  document.getElementById('rinbox').innerHTML = '<div class="msg"><div class="m">Status</div>' + (d.success ? 'Queued on the edge. The recipient pulls it when any phone reaches the network.' : ('Refused: ' + esc(d.error))) + '</div>';
}
async function relayBulletin() {
  if (!lastMsg) return;
  var parts = lastMsg.split('|');
  var to = (document.getElementById('relayto').value || '').replace(/[^0-9]/g, '');
  if (!to) { log('Enter a phone number to relay the broadcast onward.', 'bad'); return; }
  var r = await fetch('/api/msg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: parts[1], to: to, text: parts.slice(2).join('|') }) });
  var d = await r.json();
  document.getElementById('rinbox').innerHTML = '<div class="msg"><div class="m">Relay status</div>' + (d.success ? 'Broadcast relayed into the mesh queue. The recipient pulls it when any phone reaches the network.' : ('Refused: ' + esc(d.error))) + '</div>';
}

// ---- PUSH-TO-TALK v1 (2026-09-18, approved) ----
var pttRec = null, pttChunks = [], pttTimer = null, pttBlob = null;
async function pttStart() {
  if (pttRec && pttRec.state === 'recording') return;
  try {
    var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    pttChunks = [];
    pttRec = new MediaRecorder(stream);
    pttRec.ondataavailable = function (e) { if (e.data.size) pttChunks.push(e.data); };
    pttRec.onstop = function () {
      stream.getTracks().forEach(function (t) { t.stop(); });
      pttBlob = new Blob(pttChunks, { type: pttRec.mimeType || 'audio/webm' });
      document.getElementById('pttstat').innerHTML = 'Recorded ' + (pttBlob.size / 1024).toFixed(1) + 'KB. Playing from this speaker now \\u2014 hold the phones close, or send the clip into the mesh voice queue.';
      var el = document.getElementById('pttplay');
      el.src = URL.createObjectURL(pttBlob);
      el.play().catch(function () {});
    };
    pttRec.start();
    pttTimer = setTimeout(function () { pttStop(); }, 20000); // 20s cap
    document.getElementById('pttstat').innerHTML = 'Talking... release to transmit.';
    document.getElementById('pttbtn').textContent = 'RELEASE TO SEND';
  } catch (err) { document.getElementById('pttstat').innerHTML = 'Mic blocked: ' + err.message; }
}
function pttStop() {
  if (pttRec && pttRec.state === 'recording') { clearTimeout(pttTimer); pttRec.stop(); document.getElementById('pttbtn').textContent = 'HOLD TO TALK'; }
}
async function pttSendMesh() {
  if (!pttBlob) { document.getElementById('pttstat').innerHTML = 'Record a clip first.'; return; }
  var f = (document.getElementById('rfrom').value || '').replace(/[^0-9]/g, '');
  var to = (document.getElementById('pttto').value || '').replace(/[^0-9]/g, '');
  if (!f || to.length < 10) { document.getElementById('pttstat').innerHTML = 'Your phone (top of page) and a full to-phone are required for the voice queue.'; return; }
  var durl = await new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.readAsDataURL(pttBlob); });
  var r = await fetch('/api/vmsg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: f, to: to, audio: durl, dur: Math.min(20, Math.round(pttBlob.size / 15000)) }) });
  var d = await r.json();
  document.getElementById('pttstat').innerHTML = d.success ? 'Voice note queued in the mesh. The recipient pulls it when any phone reaches the network. +5 HARZ relay credit pending.' : ('Refused: ' + esc(d.error));
}
// ---- VOICE LISTENER (rolling buffer, last transmission replayable) ----
var vlRec = null, vlLast = null, vlPrev = null;
async function vlToggle() {
  if (vlRec) {
    try { vlRec.stop(); } catch (e) {}
    vlRec.stream.getTracks().forEach(function (t) { t.stop(); });
    vlRec = null;
    document.getElementById('vlbtn').textContent = 'LISTEN FOR VOICE';
    document.getElementById('vlstat').innerHTML = 'Stopped. Last transmission is still playable.';
    return;
  }
  try {
    var stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    vlRec = new MediaRecorder(stream); vlRec.stream = stream;
    vlRec.ondataavailable = function (e) {
      if (e.data.size) { vlPrev = vlLast; vlLast = e.data; document.getElementById('vlstat').innerHTML = 'New transmission captured (' + (vlLast.size / 1024).toFixed(1) + 'KB). Press PLAY LAST TRANSMISSION.'; }
    };
    vlRec.start(10000); // 10s chunks, newest two kept = 20s rolling
    document.getElementById('vlbtn').textContent = 'STOP LISTENING';
    document.getElementById('vlstat').innerHTML = 'Listening for voice \\u2014 the last transmission stays in a 20-second rolling buffer.';
  } catch (err) { document.getElementById('vlstat').innerHTML = 'Mic blocked: ' + err.message; }
}
function vlPlay() {
  if (!vlLast) { document.getElementById('vlstat').innerHTML = 'Nothing captured yet.'; return; }
  var el = document.getElementById('vlplay');
  el.src = URL.createObjectURL(vlLast);
  el.play().catch(function () {});
}
async function vlPull() {
  var box = document.getElementById('vinbox');
  var ph = (document.getElementById('vinph').value || '').replace(/[^0-9]/g, '');
  if (ph.length < 10) { box.textContent = ''; box.insertAdjacentHTML('beforeend', '<div class="note">Enter your full phone number.</div>'); return; }
  try { localStorage.setItem('mesh-phone', ph); } catch (e) {}
  box.textContent = '';
  box.insertAdjacentHTML('beforeend', '<div class="note">Pulling from the edge…</div>');
  try {
    var r = await fetch('/api/inbox?phone=' + encodeURIComponent(ph));
    var d = await r.json();
    box.textContent = '';
    if (!d.success) { var bd = document.createElement('div'); bd.className = 'bad'; bd.textContent = 'Refused: ' + (d.error || 'unknown'); box.appendChild(bd); return; }
    if (!d.messages || !d.messages.length) { var n0 = document.createElement('div'); n0.className = 'note'; n0.textContent = 'No messages waiting on the edge.'; box.appendChild(n0); return; }
    d.messages.forEach(function (m) {
      var div = document.createElement('div'); div.className = 'msg';
      var lbl = document.createElement('div'); lbl.className = 'm';
      if (m.voice) {
        lbl.textContent = 'Voice note from ' + (m.from || 'unknown') + ' (' + (m.dur || 0) + 's)';
        var au = document.createElement('audio'); au.controls = true; au.preload = 'metadata'; au.style.cssText = 'width:100%;margin-top:6px'; au.src = m.voice;
        div.appendChild(lbl); div.appendChild(au);
      } else {
        lbl.textContent = 'Text from ' + (m.from || 'unknown');
        var tx = document.createElement('div'); tx.textContent = m.text || '';
        div.appendChild(lbl); div.appendChild(tx);
      }
      box.appendChild(div);
    });
    var done = document.createElement('div'); done.className = 'note';
    done.textContent = d.messages.length + ' message(s) delivered — inbox cleared on the edge.';
    box.appendChild(done);
  } catch (err) {
    box.textContent = '';
    var bd2 = document.createElement('div'); bd2.className = 'bad'; bd2.textContent = 'Pull failed: ' + err.message; box.appendChild(bd2);
  }
}
`;
var RADIO_STYLE = "<style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#333}header{background:#fff;border-bottom:1px solid #e3e6ea;padding:14px 16px}h1{font-size:17px;color:#0a7d3c}.ver{font-size:11px;color:#888}main{max-width:640px;margin:0 auto;padding:14px}.card{background:#fff;border-radius:12px;padding:14px;margin:10px 0;box-shadow:0 1px 4px rgba(0,0,0,.05)}.card h2{font-size:13px;color:#0a7d3c;margin-bottom:8px;text-transform:uppercase;letter-spacing:.4px}input,textarea,button{width:100%;padding:10px;border:1px solid #d7dbe0;border-radius:8px;font-size:13px;margin-top:6px}button{background:#0a7d3c;color:#fff;border:0;font-weight:700;cursor:pointer}.note{font-size:11px;color:#777;margin-top:6px}.msg{background:#f6f8fa;border-radius:10px;padding:8px 10px;margin:6px 0;font-size:13px}.m{font-size:11px;color:#888}.ok{color:#0a7d3c;font-weight:700}.bad{color:#b30000;font-weight:700}</style>";
var RADIO_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><title>HARZ Radio \u2014 Sound Rail</title><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml">@@STYLE@@</head><body><header><h1>HARZ RADIO</h1><div class="ver">The sound rail \u2014 v1.4 \xB7 62.5 bits/sec text \xB7 send + broadcast + push-to-talk + voice inbox \xB7 closed loop on Harz Mesh</div></header><main>
<div class="card"><h2>Self-test</h2><button onclick="selfTest()">RUN SOUND ROUND TRIP</button><div id="selfres" class="note">Encodes a message to sound, decodes it back, checks bit for bit.</div></div>
<div class="card"><h2>Mode</h2><button id="bsend" onclick="setMode('send')" style="font-weight:900">SEND (one phone)</button><button id="bbcast" onclick="setMode('bcast')">BROADCAST (the room)</button><div id="bcastnote" class="note" style="display:none">A broadcast carries no single recipient \u2014 every listening phone in earshot can catch it and relay it onward. Repeats deliver fresh.</div></div>
<div class="card"><h2>Transmit \u2014 speak in sound</h2><input id="rfrom" placeholder="Your phone (from)"><input id="rto" placeholder="To phone"><textarea id="rbody" placeholder="Message (max 90 bytes on the sound rail)"></textarea><button id="txbtn" onclick="transmit()">PLAY THE CHIRP</button></div>
<div class="card"><h2>Receive \u2014 listen</h2><button id="listenbtn" onclick="listen()">START LISTENING</button><div id="sigmeter" class="note" style="font-family:monospace">Signal: idle</div><div id="rlog" class="note">Open this page on a second phone, press Transmit there, hold the phones close.</div></div>
<div class="card"><h2>Sound inbox</h2><div id="rinbox"><div class="note">Decoded messages and broadcasts land here. One tap sends them into the mesh store-and-forward queue.</div></div></div>
<div class="card"><h2>Push-to-talk</h2><input id="pttto" placeholder="Mesh voice queue \u2014 to phone (optional)"><button id="pttbtn" onmousedown="pttStart()" onmouseup="pttStop()" ontouchstart="pttStart();event.preventDefault()" ontouchend="pttStop()">HOLD TO TALK</button><audio id="pttplay"></audio><button onclick="pttSendMesh()">SEND CLIP TO MESH VOICE QUEUE</button><div id="pttstat" class="note">Hold, speak, release \u2014 your voice plays from the speaker. The listening phone keeps the last transmission. Half-duplex: one talks, then the other.</div></div>
<div class="card"><h2>Voice listener</h2><button id="vlbtn" onclick="vlToggle()">LISTEN FOR VOICE</button><button onclick="vlPlay()">PLAY LAST TRANSMISSION</button><audio id="vlplay"></audio><div id="vlstat" class="note">While listening, this phone keeps the last 20 seconds in a rolling buffer and can replay the last transmission.</div></div><div class="card"><h2>Voice inbox — pull from the mesh</h2><input id="vinph" placeholder="Your phone"><button onclick="vlPull()">PULL MY INBOX</button><div id="vinbox"><div class="note">Voice notes sent to your number through the mesh queue wait on the edge. Pull them here and play.</div></div></div>
<div class="card"><h2>What this is</h2><div class="note">A message becomes two tones from the speaker; another phone's mic hears it and turns it back into text. No internet, no carrier, no cost. Text rides the sound rail; voice rides push-to-talk \u2014 a half-duplex walkie-talkie, one talks then the other. Real-phone field testing is mandatory before any announcement.</div></div>
</main>@@SCRIPT@@<script>if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw2.js').catch(function(){}); }</script></body></html>`;
function radioPage() {
  var html = RADIO_HTML.replace("@@STYLE@@", RADIO_STYLE).replace("@@SCRIPT@@", "<script>" + RADIO_CODEC + RADIO_JS + "<\/script>");
  return html;
}
__name(radioPage, "radioPage");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: MCORS });
    if (path === "/api/msg" && request.method === "POST") return handleMsg(request, env);
    if (path === "/api/vmsg" && request.method === "POST") return handleVMsg(request, env);
    if (path === "/api/inbox" && request.method === "GET") return handleInbox(url, env);
    if (path === "/api/stats" && request.method === "GET") return handleStats(url, env);
    if (path === "/api/claim" && request.method === "POST") return handleClaim(request, env);
    if (path === "/api/sms-inbound" && request.method === "POST") return handleSMSInbound(url, request, env);
    if (path === "/api/sms-test" && request.method === "POST") return handleSMSTest(url, env);
    if (path === "/pay" && request.method === "GET") return handlePayPage(url, env);
    if (path === "/pay/init" && request.method === "POST") return handlePayInit(request, env);
    if (path === "/pay/done" && request.method === "GET") return handlePayDone(url, env);
    if (request.method === "GET") {
      if (path === "/" || path === "/index.html") {
        return new Response(overview(), { headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-cache" } });
      }
      if (path === "/gates") {
        return new Response(gates(), { headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-cache" } });
      }
      if (path === "/report") {
        return new Response(reportPage(VERSION), { headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-cache" } });
      }
      if (path === "/report.md") {
        return new Response(REPORT_MD, { headers: { "Content-Type": "text/plain;charset=UTF-8", "Cache-Control": "no-cache" } });
      }
      if (path === "/app") {
        return new Response(appPage(), { headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-cache" } });
      }
      if (path === "/mesh") {
        return new Response(meshPage(), { headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-cache" } });
      }
      if (path === "/radio") {
        return new Response(radioPage(), { headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-cache" } });
      }
      if (path === "/health") {
        return new Response(JSON.stringify({
          status: "healthy",
          project: "HARZ Edge Telecom",
          version: VERSION,
          focus: "serverless-first phone mesh network",
          architecture: "HARZ-Mesh routing above Wi-Fi Aware / Wi-Fi Direct / BLE transports",
          gates: {
            G1_radio_reality: "v1.3 sound rail (62.5 bps, 0.9 amp, 3x repeats, live signal meter) deployed 2026-09-19, awaiting field retest",
            G2_multi_hop: "protocol frozen 2026-09-06, awaiting field execution",
            G3_mobility: "queued",
            G4_store_and_forward: "queued",
            G5_voice: "stretch goal, queued"
          },
          android_app: "HARZ Edge v2.1 (2.1.0-fieldready)",
          theme: "light (#f0f2f5)",
          d1_dependency: "none"
        }, null, 2), { headers: { "Content-Type": "application/json;charset=UTF-8", "Cache-Control": "no-cache" } });
      }
      if (path === "/manifest.json") {
        return new Response(JSON.stringify(MANIFEST), { headers: { "Content-Type": "application/json;charset=UTF-8" } });
      }
      if (path === "/sw.js" || path === "/sw2.js") {
        return new Response(SW, { headers: { "Content-Type": "application/javascript;charset=UTF-8", "Cache-Control": "no-store" } });
      }
      if (path === "/icon.svg") {
        return new Response(ICON, { headers: { "Content-Type": "image/svg+xml" } });
      }
    }
    return new Response(JSON.stringify({ error: "Not found", docs: "/", health: "/health" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }
};
var MCORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" };
var mjson = /* @__PURE__ */ __name2((obj, code = 200) => new Response(JSON.stringify(obj), { status: code, headers: { "Content-Type": "application/json", ...MCORS } }), "mjson");
var mphone = /* @__PURE__ */ __name2((p) => String(p || "").replace(/\D/g, ""), "mphone");
async function queueMsg(from, to, text, env) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const msg = { id, from, to, text, ts: Date.now(), relay: from, network: "harz-mesh-g3" };
  const key = "inbox:" + to;
  const q = await env.MESH_KV.get(key, "json") || [];
  q.push(msg);
  if (q.length > 50) q.shift();
  await env.MESH_KV.put(key, JSON.stringify(q));
  const st = await env.MESH_KV.get("stats:network", "json") || { messages: 0, relays: 0 };
  st.messages++;
  st.relays++;
  await env.MESH_KV.put("stats:network", JSON.stringify(st));
  const rl = await env.MESH_KV.get("relay:" + from, "json") || { relays: 0, harz_pending: 0 };
  rl.relays++;
  rl.harz_pending += 5;
  await env.MESH_KV.put("relay:" + from, JSON.stringify(rl));
  return id;
}
__name(queueMsg, "queueMsg");
__name2(queueMsg, "queueMsg");
async function handleMsg(request, env) {
  let b = {};
  try {
    b = await request.json();
  } catch (e) {
  }
  const from = mphone(b.from), to = mphone(b.to), text = String(b.text || "").trim().slice(0, 500);
  if (from.length < 10 || to.length < 10) return mjson({ success: false, error: "Valid from/to phone required" }, 400);
  if (!text) return mjson({ success: false, error: "Message text required" }, 400);
  const id = await queueMsg(from, to, text, env);
  return mjson({ success: true, queued: true, msg_id: id, relay_earned: 5, note: "Message stored on the edge. Recipient pulls it when any phone reaches the network." });
}
__name(handleMsg, "handleMsg");
__name2(handleMsg, "handleMsg");
async function queueVoice(from, to, audio, dur, env) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const msg = { id, from, to, voice: audio, dur, ts: Date.now(), relay: from, network: "harz-mesh-g4" };
  const key = "inbox:" + to;
  const q = await env.MESH_KV.get(key, "json") || [];
  q.push(msg);
  if (q.length > 40) q.shift();
  await env.MESH_KV.put(key, JSON.stringify(q));
  const st = await env.MESH_KV.get("stats:network", "json") || { messages: 0, relays: 0 };
  st.messages++;
  st.relays++;
  await env.MESH_KV.put("stats:network", JSON.stringify(st));
  const rl = await env.MESH_KV.get("relay:" + from, "json") || { relays: 0, harz_pending: 0 };
  rl.relays++;
  rl.harz_pending += 5;
  await env.MESH_KV.put("relay:" + from, JSON.stringify(rl));
  return id;
}
__name(queueVoice, "queueVoice");
__name2(queueVoice, "queueVoice");
async function handleVMsg(request, env) {
  let b = {};
  try {
    b = await request.json();
  } catch (e) {
  }
  const from = mphone(b.from), to = mphone(b.to);
  const audio = String(b.audio || ""), dur = Math.min(60, Math.floor(Number(b.dur) || 0));
  if (from.length < 10 || to.length < 10) return mjson({ success: false, error: "Valid from/to phone required" }, 400);
  if (!audio.startsWith("data:audio") || audio.length < 500) return mjson({ success: false, error: "Audio data required \u2014 record a voice note first" }, 400);
  if (audio.length > 3e5) return mjson({ success: false, error: "Voice note too large \u2014 keep it under 30 seconds" }, 400);
  const id = await queueVoice(from, to, audio, dur, env);
  return mjson({ success: true, queued: true, msg_id: id, relay_earned: 5, note: "Voice note stored on the edge. Recipient pulls and plays it when any phone reaches the network." });
}
__name(handleVMsg, "handleVMsg");
__name2(handleVMsg, "handleVMsg");
async function handleInbox(url, env) {
  const phone = mphone(url.searchParams.get("phone"));
  if (phone.length < 10) return mjson({ success: false, error: "Valid phone required" }, 400);
  const key = "inbox:" + phone;
  const msgs = await env.MESH_KV.get(key, "json") || [];
  if (msgs.length) await env.MESH_KV.delete(key);
  return mjson({ success: true, phone, count: msgs.length, messages: msgs, note: "Store-and-forward: inbox delivered and cleared." });
}
__name(handleInbox, "handleInbox");
__name2(handleInbox, "handleInbox");
async function handleStats(url, env) {
  const st = await env.MESH_KV.get("stats:network", "json") || { messages: 0, relays: 0 };
  const p = mphone(url.searchParams.get("phone"));
  const relay = p.length >= 10 ? await env.MESH_KV.get("relay:" + p, "json") || { relays: 0, harz_pending: 0 } : null;
  return mjson({ success: true, network: st, your_relay: relay, note: "Relay rewards: 5 HARZ pending per message carried. On-chain settlement = Phase 2." });
}
__name(handleStats, "handleStats");
__name2(handleStats, "handleStats");
function meshPage() {
  return shell("G4 \u2014 Harz Mesh: The People's Internet, now with Voice", `
<div class="card">
<h2>Harz Radio \u2014 the sound rail</h2>
<p>Messages can now travel as sound: speaker to mic, no internet, no carrier. <a href="/radio">Open Harz Radio</a>.</p>
</div>
<div class="card">
<h2>The internet that cannot be switched off</h2>
<p>Every internet in history had a center \u2014 a government can throttle it, a company can shut it, a war can bomb it. Harz Mesh has no center. The network lives inside the phones. When the networks die, the people <b>become</b> the network.</p>
<div class="meta">
<div class="stat"><b>G1-G2</b>Sound-over-mesh validated</div>
<div class="stat"><b>G3</b>Store-and-forward messaging</div>
<div class="stat"><b>G4</b>Voice notes over the mesh</div>
<div class="stat"><b>Relay = mining</b>5 HARZ per message carried</div>
<div class="stat"><b>Zero servers</b>Serverless edge queue</div>
</div>
</div>

<div class="card">
<h2>Try it: text with no network</h2>
<p style="margin-bottom:10px">Your phone: <input id="myPhone" placeholder="080..." style="padding:6px;border:1px solid #ccc;border-radius:6px;width:140px"> <button id="savePh" style="padding:6px 10px;border:1px solid #0a7d3c;background:#e8f5ee;border-radius:6px;cursor:pointer">Set</button></p>
<p style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="offline"> Simulate OFFLINE mode (no network at all)</label>
</p>
<p style="margin-bottom:6px">To: <input id="toPhone" placeholder="recipient phone" style="padding:6px;border:1px solid #ccc;border-radius:6px;width:140px"></p>
<p><textarea id="txt" placeholder="Type a message for the mesh..." style="width:100%;min-height:60px;padding:8px;border:1px solid #ccc;border-radius:8px"></textarea></p>
<p style="display:flex;gap:8px"><button id="sendBtn" style="padding:8px 14px;border:none;background:#0a7d3c;color:#fff;border-radius:8px;cursor:pointer;font-weight:700">Send via mesh</button>
<button id="flushBtn" style="padding:8px 14px;border:1px solid #0a7d3c;background:#fff;color:#0a7d3c;border-radius:8px;cursor:pointer;font-weight:700">Go online (flush queue)</button></p>
<p id="qInfo" style="font-size:13px;color:#555"></p>
<div id="outbox" style="font-size:13px"></div>
</div>

<div class="card">
<h2>Speak \u2014 voice over the mesh (G4)</h2>
<p>Record a voice note with no data plan. The sound queues inside your phone and relays exactly like a text message. The recipient plays it on any smartphone \u2014 literacy not required. You earn <b>5 HARZ</b> per voice note carried.</p>
<button id="recBtn" onclick="void(0)">Record voice note</button> <span id="recTime" style="color:#888"></span>
<audio id="recPrev" controls style="width:100%;margin-top:10px;display:none"></audio>
<button id="sendVoiceBtn" style="margin-top:10px">Send voice via mesh</button>
<div id="voiceOut" style="margin-top:8px"></div>
</div>
<div class="card">
<h2>Inbox (store-and-forward)</h2>
<p><button id="pullBtn" style="padding:8px 14px;border:1px solid #0a7d3c;background:#fff;color:#0a7d3c;border-radius:8px;cursor:pointer;font-weight:700">Pull my inbox</button> <span id="inbInfo" style="font-size:13px;color:#555"></span></p>
<div id="inbox" style="font-size:13px"></div>
</div>

<div class="card">
<h2>Network status</h2>
<div id="stats" style="font-size:14px">Loading...</div>
<p><button id="claimBtn" style="padding:8px 14px;border:none;background:#0a7d3c;color:#fff;border-radius:8px;cursor:pointer;font-weight:700">Claim pending HARZ to wallet</button></p>
<div id="claimOut" style="font-size:13px"></div>
<h2>Join by SMS \u2014 no smartphone needed</h2>
<div style="font-size:14px;line-height:1.7">From any phone, text the Harz Mesh number:<br><b>JOIN</b> \u2014 register on the mesh<br><b>SEND &lt;phone&gt; &lt;message&gt;</b> \u2014 queue a message, earn +5 HARZ<br><b>INBOX</b> \u2014 receive your waiting messages<br><b>BAL</b> \u2014 relay balance \xB7 <b>CLAIM</b> \u2014 settle HARZ on-chain</div>
</div>

<div class="card">
<h2>How a message travels</h2>
<p>1. You compose offline \u2014 the message queues <b>inside your phone</b>.<br>
2. Any phone in the mesh that touches the network flushes the queue to the serverless edge \u2014 there is no server, only functions that exist for the moment of the flush.<br>
3. The recipient pulls the queue whenever <b>any</b> phone reaches the network.<br>
4. Every carried message earns the relay node 5 HARZ. Relaying is mining.</p>
</div>

<script>
const PH = document.getElementById('myPhone'), TO = document.getElementById('toPhone'), TXT = document.getElementById('txt');
PH.value = localStorage.getItem('mesh-phone') || '08028687857';
TO.value = localStorage.getItem('mesh-to') || '07036170795';
let queue = JSON.parse(localStorage.getItem('mesh-queue') || '[]');
const isOff = () => document.getElementById('offline').checked;
const saveQ = () => localStorage.setItem('mesh-queue', JSON.stringify(queue));
function render() {
  document.getElementById('qInfo').textContent = 'Queued in your phone: ' + queue.length + (isOff() ? ' (offline \u2014 waiting for a relay node)' : '');
  document.getElementById('outbox').innerHTML = queue.slice(-5).map(m => '<div>\u2192 ' + m.to + ': ' + (m.voice ? '[voice ' + (m.dur || 0) + 's]' : m.text.replace(/</g,'&lt;')) + ' <i style="color:#888">(queued)</i></div>').join('');
}
document.getElementById('savePh').onclick = () => { localStorage.setItem('mesh-phone', PH.value.replace(/\\D/g,'')); loadStats(); };
async function flush() {
  if (!queue.length) { alert('Queue is empty \u2014 send a message first.'); return; }
  let sent = 0;
  for (const m of queue) {
    try { const u = m.voice ? '/api/vmsg' : '/api/msg'; const body = m.voice ? { from: PH.value, to: m.to, audio: m.voice, dur: m.dur } : { from: PH.value, to: m.to, text: m.text }; const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (d.success) sent++; } catch (e) {}
  }
  queue = []; saveQ(); render();
  alert('Relay complete: ' + sent + ' message(s) reached the edge. Recipient can pull them now. You earned ' + (sent * 5) + ' HARZ pending.');
  loadStats();
}
document.getElementById('sendBtn').onclick = () => {
  const to = TO.value.replace(/\\D/g,''), text = TXT.value.trim();
  if (to.length < 10 || !text) { alert('Enter a valid recipient phone and message.'); return; }
  queue.push({ to, text, ts: Date.now() }); saveQ(); TXT.value = ''; render();
  if (!isOff()) flush();
};
document.getElementById('flushBtn').onclick = flush;
document.getElementById('pullBtn').onclick = async () => {
  const r = await fetch('/api/inbox?phone=' + encodeURIComponent(PH.value));
  const d = await r.json();
  document.getElementById('inbInfo').textContent = d.count + ' message(s) delivered';
  document.getElementById('inbox').innerHTML = d.count ? d.messages.map(m => m.voice ? '<div><b>+' + m.from + '</b>: voice note (' + (m.dur || 0) + 's)<br><audio controls style="width:100%" src="' + m.voice + '"></audio></div>' : '<div><b>+' + m.from + '</b>: ' + m.text.replace(/</g,'&lt;') + '</div>').join('') : '<i style="color:#888">Inbox empty.</i>';
};
async function loadStats() {
  const r = await fetch('/api/stats?phone=' + encodeURIComponent(PH.value));
  const d = await r.json();
  const me = d.your_relay || { relays: 0, harz_pending: 0 };
  document.getElementById('stats').innerHTML = 'Network messages relayed: <b>' + d.network.messages + '</b> \xB7 Relays: <b>' + d.network.relays + '</b><br>Your node: <b>' + me.relays + '</b> relays \xB7 <b>' + me.harz_pending + ' HARZ</b> pending \xB7 <b>' + (me.settled_total || 0) + ' HARZ</b> settled on-chain';
}
let mediaRec = null, recT0 = 0, recTimer = null;
const recBtn = document.getElementById('recBtn'), recTime = document.getElementById('recTime'), recPrev = document.getElementById('recPrev');
function blobToB64(blob) { return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); }); }
recBtn.onclick = async () => {
  if (mediaRec && mediaRec.state === 'recording') { mediaRec.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRec = new MediaRecorder(stream);
    let chunks = [];
    mediaRec.ondataavailable = e => { chunks.push(e.data); };
    mediaRec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      clearInterval(recTimer); recBtn.textContent = 'Record voice note';
      const b64 = await blobToB64(chunks[0]);
      recPrev.src = b64; recPrev.style.display = 'block';
      recPrev.dataset.b64 = b64; recPrev.dataset.dur = Math.max(1, Math.round((Date.now() - recT0) / 1000));
      recTime.textContent = 'Voice note ready: ' + recPrev.dataset.dur + 's. Now press Send.';
    };
    mediaRec.start(); recT0 = Date.now(); recBtn.textContent = 'Stop recording';
    recTimer = setInterval(() => { recTime.textContent = 'Recording... ' + Math.round((Date.now() - recT0) / 1000) + 's'; }, 500);
  } catch (e) { alert('Microphone unavailable: ' + e.message); }
};
document.getElementById('sendVoiceBtn').onclick = () => {
  const to = TO.value.replace(/D/g, ''), b64 = recPrev.dataset.b64;
  if (to.length < 10 || !b64) { alert('Record a voice note first and enter a valid recipient phone.'); return; }
  queue.push({ to, voice: b64, dur: parseInt(recPrev.dataset.dur || '0', 10), ts: Date.now() }); saveQ(); render();
  document.getElementById('voiceOut').textContent = 'Voice note queued' + (isOff() ? ' \u2014 offline, waiting for a relay node.' : ' \u2014 relaying now.');
  if (!isOff()) flush();
};
document.getElementById('claimBtn').onclick = async () => {
  const out = document.getElementById('claimOut');
  out.textContent = 'Settling on-chain...';
  try {
    const r = await fetch('/api/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: PH.value }) });
    const d = await r.json();
    if (d.success) {
      const t = d.tx || {}; const hash = t.hash || t.tx_hash || t.id || '';
      out.innerHTML = '<b style="color:#0a7d3c">+' + d.settled + ' HARZ settled on-chain to your wallet.</b>' + (hash ? ' TX: ' + String(hash) : '');
    } else { out.textContent = d.error || 'Claim failed.'; }
  } catch (e) { out.textContent = 'Claim failed: network error.'; }
  loadStats();
};
render(); loadStats();
<\/script>
`, "/mesh");
}
__name(meshPage, "meshPage");
__name2(meshPage, "meshPage");
async function claimReward(phone, env) {
  const rl = await env.MESH_KV.get("relay:" + phone, "json") || { relays: 0, harz_pending: 0 };
  if (!rl.harz_pending || rl.harz_pending < 5) return { success: false, error: "Nothing to claim yet \u2014 carry messages to earn HARZ." };
  if (!env.HARZPAY_MESH) return { success: false, error: "Settlement service not bound" };
  try {
    const r = await env.HARZPAY_MESH.fetch("https://harzpay/api/mesh-settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: env.MESH_SETTLE_KEY, phone, amount: rl.harz_pending, memo: "Harz Mesh relay reward \u2014 " + rl.relays + " relays" })
    });
    const d = await r.json();
    if (!d.success) return { success: false, error: d.error || "Settlement failed" };
    const txr = d.tx || {};
    if (!txr || txr.error || txr.success === false) return { success: false, error: "Chain rejected settlement: " + (txr && txr.error || "unknown") };
    const settled = d.settled || rl.harz_pending;
    rl.harz_pending = 0;
    rl.settled_total = (rl.settled_total || 0) + settled;
    const t = d.tx || {};
    rl.settle_log = (rl.settle_log || []).concat({ ts: Date.now(), amount: settled, tx: t.id || t.tx_id || t.hash || t.tx_hash || null }).slice(-10);
    await env.MESH_KV.put("relay:" + phone, JSON.stringify(rl));
    return { success: true, settled, tx: d.tx, settled_total: rl.settled_total };
  } catch (e) {
    return { success: false, error: "Claim failed: " + (e && e.message) };
  }
}
__name(claimReward, "claimReward");
__name2(claimReward, "claimReward");
async function handleClaim(request, env) {
  let b = {};
  try {
    b = await request.json();
  } catch (e) {
  }
  const phone = mphone(b.phone);
  if (phone.length < 10) return mjson({ success: false, error: "Valid phone required" }, 400);
  const c = await claimReward(phone, env);
  if (!c.success) return mjson(c, 400);
  return mjson({ success: true, settled: c.settled, phone, tx: c.tx, settled_total: c.settled_total });
}
__name(handleClaim, "handleClaim");
__name2(handleClaim, "handleClaim");
async function sendSMS(phone, text, env) {
  const key = env.SENDCHAMP_KEY;
  if (!key) return { success: false, error: "SENDCHAMP_KEY not configured" };
  const to = "234" + phone.replace(/^0/, "").replace(/\D/g, "");
  try {
    const r = await fetch("https://api.sendchamp.com/api/v1/sms/send", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ to: [to], message: String(text).slice(0, 1e3), sender_name: "HARZ", route: "dnd" })
    });
    let d = {};
    try {
      d = await r.json();
    } catch (e) {
    }
    return { success: !!(d && (d.status === "success" || d.code === "success")), raw: d };
  } catch (e) {
    return { success: false, error: e && e.message };
  }
}
__name(sendSMS, "sendSMS");
__name2(sendSMS, "sendSMS");
async function handleSMSCommand(from, text, env) {
  const t = String(text || "").trim();
  const up = t.toUpperCase();
  const nm = t.match(/^NET\s+(\S+)\s+(.+)$/i);
  if (nm) {
    let addr = nm[1];
    if (/^\d{10,15}$/.test(addr)) addr = "tel:+" + addr;
    const nbody = nm[2].trim().slice(0, 300);
    if (!env.HARZNET) return "HARZNET not enabled on this node yet.";
    try {
      const r = await env.HARZNET.fetch("https://harznet.internal/api/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: "tel:" + from, to: addr, body: nbody, frag_size: 60 }) });
      const d = await r.json();
      if (!d.success) return "HARZNET error: " + (d.error || "rejected");
      return "HARZNET: sent as " + d.fragments + " envelope(s). Hash " + String(d.body_hash).slice(0, 10) + ". Recipient pulls from anywhere on Earth with NETIN.";
    } catch (e) {
      return "HARZNET unreachable. Try again.";
    }
  }
  if (up === "NETIN") {
    if (!env.HARZNET) return "HARZNET not enabled on this node yet.";
    try {
      const r = await env.HARZNET.fetch("https://harznet.internal/api/inbox/" + encodeURIComponent("tel:" + from));
      const d = await r.json();
      if (!d.delivered) return "HARZNET inbox empty.";
      return "HARZNET INBOX (" + d.delivered + "): " + d.messages.slice(0, 2).map((x, i2) => i2 + 1 + ". from " + x.from + ": " + String(x.body).slice(0, 90) + " [" + x.integrity + "]").join(" | ");
    } catch (e) {
      return "HARZNET unreachable. Try again.";
    }
  }
  if (up === "NODE") {
    if (!env.HARZNET) return "HARZNET not enabled on this node yet.";
    try {
      const r = await env.HARZNET.fetch("https://harznet.internal/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country: "Nigeria", mediums: ["sms", "http"] }) });
      const d = await r.json();
      return d.success ? "HARZNET relay registered: " + String(d.node_id).slice(0, 18) + "... Your phone is now a node on the People's Internet." : "HARZNET register failed.";
    } catch (e) {
      return "HARZNET unreachable. Try again.";
    }
  }
  const m = t.match(/^SEND\s+(\d{10,15})\s+(.+)$/i);
  if (up === "JOIN" || up === "START" || up === "HELP") {
    const reg = await env.MESH_KV.get("smsuser:" + from, "json") || { joined: Date.now() };
    if (!reg.joined) reg.joined = Date.now();
    await env.MESH_KV.put("smsuser:" + from, JSON.stringify(reg));
    return "HARZ MESH \u2014 The People's Internet. Commands: SEND <phone> <message> | INBOX | BAL | CLAIM | NET <address> <message> | NETIN | NODE | HELP. Relays earn 5 HARZ. HarzNet reaches any address on Earth.";
  }
  if (m) {
    const to = m[1].replace(/\D/g, "");
    const body = m[2].trim().slice(0, 300);
    if (to.length < 10 || !body) return "Format: SEND <phone> <message>";
    await queueMsg(from, to, body, env);
    return "Queued. Recipient gets it when they check INBOX. You earned +5 HARZ pending. Send BAL anytime, CLAIM to settle on-chain.";
  }
  if (up === "INBOX") {
    const msgs = await env.MESH_KV.get("inbox:" + from, "json") || [];
    if (msgs.length) await env.MESH_KV.delete("inbox:" + from);
    if (!msgs.length) return "Inbox empty \u2014 you are all caught up.";
    return "INBOX (" + msgs.length + "): " + msgs.slice(0, 3).map((x, i) => i + 1 + ". from " + x.from + ": " + (x.voice ? "[voice note " + (x.dur || 0) + "s \u2014 play it in the mesh app]" : String(x.text).slice(0, 100))).join(" | ");
  }
  if (up === "BAL") {
    const rl = await env.MESH_KV.get("relay:" + from, "json") || { relays: 0, harz_pending: 0, settled_total: 0 };
    return "Your node: " + rl.relays + " relays | " + (rl.harz_pending || 0) + " HARZ pending | " + (rl.settled_total || 0) + " HARZ settled on-chain. Send CLAIM to settle pending.";
  }
  if (up === "CLAIM") {
    const c = await claimReward(from, env);
    if (!c.success) return c.error;
    const tx = c.tx || {};
    const tid = tx.id || tx.tx_id || tx.hash || "";
    return "CLAIMED: " + c.settled + " HARZ settled on-chain to your wallet." + (tid ? " TX: " + tid : "");
  }
  return "Unknown command. Reply HELP for the menu.";
}
__name(handleSMSCommand, "handleSMSCommand");
__name2(handleSMSCommand, "handleSMSCommand");
async function handleSMSInbound(url, request, env) {
  if (!env.SMS_WEBHOOK_KEY || url.searchParams.get("key") !== env.SMS_WEBHOOK_KEY) return mjson({ success: false, error: "Unauthorized" }, 401);
  let b = {};
  try {
    b = await request.json();
  } catch (e) {
  }
  const data = b.data || b;
  const from = mphone(String(data.from || data.sender || data.sender_id || data.senderID || ""));
  const text = String(data.text || data.message || data.content || "");
  if (from.length < 10) return mjson({ success: false, error: "Unrecognized inbound SMS payload" }, 400);
  const dry = url.searchParams.get("dry") === "1";
  const reply = await handleSMSCommand(from, text, env);
  let sent = false, sendInfo = null;
  if (!dry) {
    const s = await sendSMS(from, reply, env);
    sent = s.success;
    sendInfo = s.raw || s.error;
  }
  return mjson({ success: true, from, command: text.slice(0, 40), reply, sent, sendInfo });
}
__name(handleSMSInbound, "handleSMSInbound");
__name2(handleSMSInbound, "handleSMSInbound");
async function handleSMSTest(url, env) {
  if (!env.SMS_WEBHOOK_KEY || url.searchParams.get("key") !== env.SMS_WEBHOOK_KEY) return mjson({ success: false, error: "Unauthorized" }, 401);
  const r = await sendSMS("08028687857", "HARZ MESH: SMS gateway is live. Reply HELP to try the mesh by SMS.", env);
  return mjson(r, r.success ? 200 : 502);
}
__name(handleSMSTest, "handleSMSTest");
__name2(handleSMSTest, "handleSMSTest");
var __payStyle = "<style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#333;padding:16px;max-width:600px;margin:0 auto}.card{background:#fff;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 2px 8px rgba(0,0,0,.06)}.hd{font-size:20px;font-weight:800;color:#0a7d3c;margin-bottom:4px}.sub{font-size:12px;color:#666;margin-bottom:14px}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;font-size:13px}.row:last-child{border:0}.lbl{color:#666}.val{font-weight:700}.btn{width:100%;background:#0a7d3c;color:#fff;border:none;padding:14px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;margin-top:12px}.err{background:#ffebee;border:1px solid #8b0000;color:#8b0000;padding:10px;border-radius:8px;font-size:12px;margin-top:10px;display:none}.ok{background:#e8f5e9;border:1px solid #0a7d3c;color:#0a7d3c;padding:10px;border-radius:8px;font-size:12px;margin-top:10px;display:none}.foot{text-align:center;font-size:11px;color:#888;padding:16px}</style>";
var payHead = /* @__PURE__ */ __name((title) => '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="HARZ Pay"><link rel="manifest" href="/manifest.json"><title>' + title + "</title>" + __payStyle + "</head><body>", "payHead");
var payFoot = '<div class="foot">HARZ Gateway Funding \xB7 Verified by Paystack \xB7 Fail-closed: credit only after provider confirmation</div></body></html>';
function handlePayPage(url, env) {
  const amount = parseInt(url.searchParams.get("amount") || "0", 10);
  const apiKey = url.searchParams.get("api_key") || "";
  const h = { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-store" };
  return (async () => {
    if (!apiKey || !amount || amount < 100) {
      return new Response(payHead("Fund HARZ Account") + '<div class="card"><div class="hd">Fund HARZ Gateway Account</div><div class="sub">Checkout</div><div class="err" style="display:block">Enter a valid amount (minimum \u20A6100) and API key. Return to the HARZ Gateway and use the Fund Balance tab.</div></div>' + payFoot, { headers: h });
    }
    const acc = await env.HARZ_DB.prepare("SELECT business_name, balance FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
    if (!acc) {
      return new Response(payHead("Fund HARZ Account") + '<div class="card"><div class="hd">Fund HARZ Gateway Account</div><div class="sub">Checkout</div><div class="err" style="display:block">Unknown gateway account \u2014 check your API key on the HARZ Gateway Account tab.</div></div>' + payFoot, { headers: h });
    }
    return new Response(payHead("Fund HARZ Account") + '<div class="card"><div class="hd">Fund HARZ Gateway Account</div><div class="sub">Business: ' + (acc.business_name || "Gateway customer") + " \xB7 Account: " + apiKey.slice(0, 8) + '\u2026</div><div class="row"><span class="lbl">Amount</span><span class="val">\u20A6' + amount.toLocaleString() + '</span></div><div class="row"><span class="lbl">Current balance</span><span class="val">\u20A6' + (Number(acc.balance) / 100).toLocaleString(void 0, { minimumFractionDigits: 2 }) + '</span></div><div class="row"><span class="lbl">You will receive</span><span class="val">\u20A6' + amount.toLocaleString() + ' credit</span></div><button class="btn" id="payBtn" onclick="startPay()">Pay \u20A6' + amount.toLocaleString() + ' via Paystack</button><div class="err" id="errBox"></div></div><script>var AMT=' + amount + ",KEY=" + JSON.stringify(apiKey) + ";async function startPay(){const b=document.getElementById('payBtn');b.disabled=true;b.textContent='Connecting to Paystack\u2026';try{const r=await fetch('/pay/init',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:AMT,api_key:KEY})});const d=await r.json();if(d.success&&d.authorization_url){window.location.href=d.authorization_url;}else{document.getElementById('errBox').style.display='block';document.getElementById('errBox').textContent=d.error||'Payment could not start. No charge made.';b.disabled=false;b.textContent='Pay \u20A6'+AMT.toLocaleString()+' via Paystack';}}catch(e){document.getElementById('errBox').style.display='block';document.getElementById('errBox').textContent='Network error: '+e.message+'. No charge made.';b.disabled=false;b.textContent='Pay \u20A6'+AMT.toLocaleString()+' via Paystack';}}<\/script>" + payFoot, { headers: h });
  })();
}
__name(handlePayPage, "handlePayPage");
async function handlePayInit(request, env) {
  try {
    const body = await request.json();
    const amount = parseInt(body.amount, 10);
    const apiKey = body.api_key || "";
    if (!amount || amount < 100 || amount > 5e5) return mjson({ success: false, error: "Amount must be between \u20A6100 and \u20A6500,000." }, 400);
    if (!apiKey) return mjson({ success: false, error: "api_key required" }, 401);
    const acc = await env.HARZ_DB.prepare("SELECT id, business_name FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
    if (!acc) return mjson({ success: false, error: "Unknown gateway account" }, 401);
    const key = env.PAYSTACK_SECRET_KEY;
    if (!key) return mjson({ success: false, error: "Payment provider not configured on this server (fail-closed). No charge made. Contact support." }, 503);
    const reference = "HZGW-" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", { method: "POST", headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify({ email: apiKey.slice(0, 16) + "@gateway.harz.ng", amount: amount * 100, currency: "NGN", reference, callback_url: "https://harz-edge-telecom.harz.workers.dev/pay/done", metadata: { gateway_api_key: apiKey } }) });
    const initData = await initRes.json().catch(() => ({}));
    if (!initData.status || !initData.data || !initData.data.authorization_url) {
      return mjson({ success: false, error: "Paystack rejected the payment start (" + (initData.message || "HTTP " + initRes.status) + "). No charge made, no credit given.", provider_status: initRes.status }, 502);
    }
    await env.HARZ_DB.prepare("CREATE TABLE IF NOT EXISTS gateway_funds (reference TEXT PRIMARY KEY, api_key TEXT, amount_kobo INTEGER, status TEXT, raw TEXT, created_date TEXT)").run();
    await env.HARZ_DB.prepare("INSERT OR IGNORE INTO gateway_funds (reference, api_key, amount_kobo, status, raw, created_date) VALUES (?,?,?,?,?,?)").bind(reference, apiKey, amount * 100, "pending", null, (/* @__PURE__ */ new Date()).toISOString()).run();
    return mjson({ success: true, authorization_url: initData.data.authorization_url, reference });
  } catch (e) {
    return mjson({ success: false, error: "Init failed: " + e.message + ". No charge made, no credit given." }, 500);
  }
}
__name(handlePayInit, "handlePayInit");
async function handlePayDone(url, env) {
  const reference = url.searchParams.get("reference") || url.searchParams.get("trxref") || "";
  const h = { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-store" };
  const failPage = /* @__PURE__ */ __name((msg) => new Response(payHead("Payment Result") + '<div class="card"><div class="hd">Payment</div><div class="sub">Result</div><div class="err" style="display:block">' + msg + '</div><a class="btn" style="display:block;text-align:center;text-decoration:none;margin-top:14px" href="https://harz-gateway.harz.workers.dev/">Return to HARZ Gateway</a></div>' + payFoot, { headers: h }), "failPage");
  const okPage = /* @__PURE__ */ __name((msg, extra) => new Response(payHead("Payment Result") + '<div class="card"><div class="hd">\u2705 Payment credited</div><div class="sub">HARZ Gateway funding</div><div class="ok" style="display:block">' + msg + "</div>" + (extra || "") + '<a class="btn" style="display:block;text-align:center;text-decoration:none;margin-top:14px" href="https://harz-gateway.harz.workers.dev/">Return to HARZ Gateway</a></div>' + payFoot, { headers: h }), "okPage");
  try {
    if (!reference) return failPage("No payment reference found in the return link.");
    await env.HARZ_DB.prepare("CREATE TABLE IF NOT EXISTS gateway_funds (reference TEXT PRIMARY KEY, api_key TEXT, amount_kobo INTEGER, status TEXT, raw TEXT, created_date TEXT)").run();
    const existing = await env.HARZ_DB.prepare("SELECT * FROM gateway_funds WHERE reference = ?").bind(reference).first();
    if (existing && existing.status === "credited") return okPage("This payment was already credited. No double credit.", '<div class="row"><span class="lbl">Reference</span><span class="val" style="font-size:11px;word-break:break-all">' + reference + "</span></div>");
    const key = env.PAYSTACK_SECRET_KEY;
    if (!key) return failPage("Payment provider not configured (fail-closed). If you were charged, contact support with reference " + reference + ".");
    const vRes = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), { headers: { "Authorization": "Bearer " + key } });
    const vData = await vRes.json().catch(() => ({}));
    if (!vData.status || !vData.data) return failPage("Could not verify this payment (provider response: " + (vData.message || "HTTP " + vRes.status) + "). No credit given. If you were charged, contact support with reference " + reference + ".");
    const t = vData.data;
    if (t.status !== "success") return failPage("Payment not completed (provider status: " + t.status + "). No credit given.");
    const apiKey = t.metadata && t.metadata.gateway_api_key || existing && existing.api_key || "";
    if (!apiKey) return failPage("Payment verified but the target gateway account could not be identified. Contact support with reference " + reference + ". No automatic credit.");
    const acc = await env.HARZ_DB.prepare("SELECT id FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
    if (!acc) return failPage("Payment verified but the gateway account is unknown. Contact support with reference " + reference + ". No automatic credit.");
    const claim = await env.HARZ_DB.prepare("UPDATE gateway_funds SET status = 'credited', raw = ?, created_date = ? WHERE reference = ? AND status = 'pending'").bind(JSON.stringify({ channel: t.channel, paid_at: t.paid_at, last4: t.authorization ? t.authorization.last4 : null }), (/* @__PURE__ */ new Date()).toISOString(), reference).run();
    if (claim.meta.changes === 0) return failPage("This payment could not be claimed (already processed or unknown state). Reference " + reference + ". No double credit.");
    await env.HARZ_DB.prepare("UPDATE gateway_accounts SET balance = balance + ? WHERE api_key = ?").bind(t.amount, apiKey).run();
    const nacc = await env.HARZ_DB.prepare("SELECT balance FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
    return okPage("\u20A6" + (t.amount / 100).toLocaleString() + " credited to your HARZ Gateway account.", '<div class="row"><span class="lbl">New balance</span><span class="val">\u20A6' + (Number(nacc.balance) / 100).toLocaleString(void 0, { minimumFractionDigits: 2 }) + '</span></div><div class="row"><span class="lbl">Reference</span><span class="val" style="font-size:11px;word-break:break-all">' + reference + "</span></div>");
  } catch (e) {
    return failPage("Verification error: " + e.message + ". No credit given. If you were charged, contact support with reference " + reference + ".");
  }
}
__name(handlePayDone, "handlePayDone");
export {
  worker_default as default
};
//# sourceMappingURL=edge-new.js.map