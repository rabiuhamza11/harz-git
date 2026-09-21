// HARZ ROOT v3.0 — THE MIGRATED ROOT (chain harz-root-v2, king 90062faa)
// Sep 20, 2026 — the owner's migration word. The live root now serves the SIGNED ZONE v2
// (first zone of harz-root-v2, height 1, 77 records, true digest cac16833...).
// Fail-closed law: the embedded zone is VERIFIED (Ed25519, WebCrypto) against the pinned
// anchor BEFORE any answer is served; anchor + floors (77 records, height 1) enforced v1.3.
// v1 book: FROZEN, read-only pointer at /zone-v1 (digest e94b9693... — history, not authority).
// Rollback pin: v2.1 script byte-committed in HarzGit (migration/backup) before this deploy.

const ANCHOR = "ed25519:90062faa4947be141d5e18987aea5d14dd1c570329b57b0c50a3f6cddfc54c0f";
const MIN_RECORDS = 77, MIN_HEIGHT = 1;
const ZONE_V2 = {"v":2,"zone":"harz","height":1,"prev":null,"records":[{"v":2,"name":"ai.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-ai-gateway.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"arch.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-arch-suite.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"baraka.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-baraka.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"bridge.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-bridge.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"broadcast.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-broadcast.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"buildbot.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-buildbot.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"catalog.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-catalog.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"chain.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-chain-v2.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"cloud.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-cloud-landing.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"content.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"contracts.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-contract-gen.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"crm.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-crm.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"daily.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-daily.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"dial.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"dialweb.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-dialweb.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"dna.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-dna.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"dua.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-dua.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"edge.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-edge-telecom.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"edgenet.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-edge-net.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"estate.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://abuja-estate-city.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"eternity.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-eternity.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"evolve.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-evolve.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"exchange.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-telecom-exchange.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"faucet.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-faucet.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"film.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-film.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"forge.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-forge.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"forms.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-forms.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"gateway.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-gateway.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"gdeg.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://gdeg-web.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"genesis.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-genesis.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"gov.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-governance.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"guard.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-sentinel.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"harz.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-super-app.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"health.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-health.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"hospital.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-genesis-hospital.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"images.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://gdeg-images.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"kasuwa.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-dialweb.harz.workers.dev/site/39"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"lend.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harzlend.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"link.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-shortlink.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"maganu.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://maganu-agent.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"manager.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-manager-bot.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"markets.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-markets.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"mesh.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-mesh-lab.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"mindcare.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://mindcare-ai.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"miner.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-miner-cron.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"mining.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-mining.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"music.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harzmusic.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"net.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-connect-hub.base44.app"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"neural.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-neural.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"nexus.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-nexus.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"nlcl.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-nlcl.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"omega.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://omega-health.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"oracle.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-oracle.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"orbital.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-orbital.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"pay.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harzpay.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"poi.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-poi.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"pricing.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-pricing.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"prism.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-prism.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"root.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-root.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"rpc.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-rpc-proxy.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"scan.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-explorer.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"skyeye.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-skyeye.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"sms.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-smpp-edge.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"smsmkt.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-sms-mkt.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"spell.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-spell.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"store.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-store.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"super.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-super-app.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"swap.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-swap.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"symphony.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-symphony.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"telecom.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-telecom.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"trade.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-exchange.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"verify.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-verify.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"wa.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-whatsapp-handler.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"wallet.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-super-app.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"watch.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-monitor.harz.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"wholesale.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://harz-wholesale.hamzarabiu390.workers.dev"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}},{"v":2,"name":"yelwa.harz","service":"platform","identity":"PENDING","state":{"height":0,"digest":""},"endpoints":{"https":"https://yelwa-cloud-core.base44.app"},"routing":{"nodes":[]},"policy":{"trust":"canonical"}}],"signed_at":"2026-09-20T21:37:59Z","signed_by":"ed25519:90062faa4947be141d5e18987aea5d14dd1c570329b57b0c50a3f6cddfc54c0f","sig":"ed25519:230e5208795966b6f7ba2a5fd7a7b57b319c0d343f97d3ad8c363d290145fd46fab7905631774a4f24dad9697ff0729032e787529d9d2ddb07569fcb49aebc03"};
const V1_DIGEST = "e94b9693e94a229065f7aefc8b09e35a40c3ba3aa737faa07ffbdb81001e14b0";
const V1_FROZEN_URL = "https://raw.githubusercontent.com/rabiuhamza11/harz-git/main/harz-root-v2/migration/FROZEN-ZONE-V1.txt";

// ---------- canonical serialization (frozen law, identical to zone-v2.js) ----------
function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalize).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
}

// ---------- trust checks (v1.3: anchor ENFORCED, floors enforced) ----------
function trustCheck(z) {
  if (!z || z.v !== 2 || z.zone !== "harz") return "REFUSED: not a HARZ v2 zone";
  if (String(z.signed_by) !== ANCHOR) return "REFUSED: WRONG ANCHOR — signer is not the pinned trust anchor";
  if (!Array.isArray(z.records) || z.records.length < MIN_RECORDS) return "REFUSED: NAMESPACE SHRINK below floor";
  if (z.height < MIN_HEIGHT) return "REFUSED: ROLLBACK below floor";
  return null;
}
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
// async Ed25519 verify (WebCrypto — works in Workers + modern browsers + Node 20)
async function verifyZoneSig(z) {
  const { sig, ...unsigned } = z;
  const spkiPrefix = hexToBytes("302a300506032b6570032100");
  const pubRaw = hexToBytes(ANCHOR.replace("ed25519:", ""));
  const spki = new Uint8Array(spkiPrefix.length + pubRaw.length);
  spki.set(spkiPrefix); spki.set(pubRaw, spkiPrefix.length);
  const key = await crypto.subtle.importKey("spki", spki, { name: "Ed25519" }, false, ["verify"]);
  const data = new TextEncoder().encode(canonicalize(unsigned));
  const sigBytes = hexToBytes(sig.replace("ed25519:", ""));
  return crypto.subtle.verify("Ed25519", key, sigBytes, data);
}

// boot verification — ONCE, cached; failure = every data endpoint REFUSED (fail-closed)
let bootPromise = null;
function bootVerify() {
  if (!bootPromise) {
    bootPromise = (async () => {
      const err = trustCheck(ZONE_V2);
      if (err) throw new Error(err);
      const ok = await verifyZoneSig(ZONE_V2);
      if (!ok) throw new Error("REFUSED: SIGNATURE FAILED — zone not loaded (fail-closed)");
      return true;
    })();
    bootPromise.catch(() => {}); // never unhandled
  }
  return bootPromise;
}
// eager boot at deploy: the first cold start verifies before the first customer request lands
// worker-runtime guards (node battery safe)
if (typeof addEventListener === "function") {
  addEventListener("fetch", e => { e.respondWith(handle(e.request)); });
  bootVerify(); // eager cold-start verification
}

// ---------- the book (in-memory index over the verified zone) ----------
let INDEX = null;
function buildIndex() {
  if (INDEX) return INDEX;
  INDEX = new Map();
  for (const r of ZONE_V2.records) INDEX.set(r.name, r);
  return INDEX;
}
function resolveName(name) {
  let n = String(name || "").trim().toLowerCase();
  if (n.endsWith(".")) n = n.slice(0, -1);
  if (!n.endsWith(".harz")) n = n + ".harz";
  return buildIndex().get(n) || null; // honest NXDOMAIN
}

// ---------- RFC-8484 JSON DoH projection (desk-verified behaviors kept) ----------
function dohAnswer(name) {
  const rec = resolveName(name);
  if (!rec) return { Status: 3 };
  const eps = Object.keys(rec.endpoints || {}).map(t => rec.endpoints[t]);
  if (!eps.length) return { Status: 0, Answer: [{ name: resolveName(name).name, type: 16, TTL: 3600, data: "reserved — no live endpoint in canonical zone" }] };
  return { Status: 0, Answer: eps.map(u => ({ name: rec.name, type: 16, TTL: 3600, data: u })) };
}

// ---------- pages (light theme, PWA law) ----------
function page(title, body, code) {
  return new Response("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><meta name=\"theme-color\" content=\"#f0f2f5\"><link rel=\"manifest\" href=\"/manifest.json\"><link rel=\"icon\" href=\"/icon.svg\" type=\"image/svg+xml\"><title>" + title + "</title><style>body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#1a1a2e;margin:0;padding:24px;max-width:640px}.card{background:#fff;border-radius:14px;padding:20px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.08)}.code{font-family:monospace;background:#f0f2f5;padding:10px;border-radius:8px;word-break:break-all;font-size:13px}a{color:#0b5fff}h1{font-size:20px;margin:0 0 8px}.small{color:#666;font-size:13px}.ok{color:#0a7d33;font-weight:600}</style></head><body>" + body + "</body></html>", { status: code || 200, headers: { "content-type": "text/html; charset=utf-8", "access-control-allow-origin": "*" } });
}
function doorPage(name, rec) {
  if (!rec) return page("HARZ Doors", "<div class=\"card\"><h1>HARZ Doors</h1><div class=\"small\">The zero-setting doorway into the .harz namespace</div><div class=\"code\">" + name + " → not found (NXDOMAIN — honest absence)</div></div>", 404);
  const eps = Object.keys(rec.endpoints || {}).map(t => ({ t, u: rec.endpoints[t] }));
  let links = eps.length ? eps.map(e => "<a href=\"" + e.u + "\">" + e.u + "</a>").join("<br>") : "reserved — no live endpoint in the canonical zone";
  return page("HARZ Doors", "<div class=\"card\"><h1>HARZ Doors</h1><div class=\"small\">zero-setting doorway · chain harz-root-v2 · height " + ZONE_V2.height + "</div><div class=\"code\">" + rec.name + "</div><p>" + links + "</p><div class=\"small\">service: " + rec.service + " · identity: " + rec.identity + "</div></div>");
}
const LANDING = "<div class=\"card\"><h1>HARZ ROOT v3</h1><div class=\"small\">chain harz-root-v2 · the king 90062faa · height 1 · 77 names · true digest " + "cac16833" + "…</div><div class=\"ok\">ZONE v2 SERVING (migrated Sep 20, 2026)</div><p class=\"small\">The Second ICANN is live infrastructure.</p></div><div class=\"card\"><div class=\"code\">/zone — the signed book (JSON)<br>/resolve?name=pay.harz<br>/doh?name=pay.harz&type=TXT (RFC-8484 JSON)<br>/go/pay — HARZ Doors (zero-setting)<br>/zone-v1 — frozen v1 book (history)</div></div>";
const SW = "const C='harz-root-v3';self.addEventListener('install',e=>{self.skipWaiting()});self.addEventListener('activate',e=>e.waitUntil(clients.claim()));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname==='/zone'||u.pathname.startsWith('/resolve')||u.pathname.startsWith('/doh')){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))}});";
const MANIFEST = JSON.stringify({ name: "HARZ Root v3", short_name: "HARZ Root", start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] });
const ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><rect width=\"64\" height=\"64\" rx=\"14\" fill=\"#0b5fff\"/><text x=\"32\" y=\"42\" font-size=\"28\" font-family=\"monospace\" fill=\"#fff\" text-anchor=\"middle\">H</text></svg>";
const JSON_CT = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "public, max-age=300" };

// ---------- the router ----------
async function handle(req) {
  const url = new URL(req.url);
  const p = url.pathname;
  if (p === "/" ) return page("HARZ ROOT v3", LANDING);
  if (p === "/sw.js") return new Response(SW, { headers: { "content-type": "application/javascript; charset=utf-8" } });
  if (p === "/manifest.json") return new Response(MANIFEST, { headers: JSON_CT });
  if (p === "/icon.svg") return new Response(ICON, { headers: { "content-type": "image/svg+xml" } });

  // data endpoints: fail-closed behind boot verification
  if (p === "/zone" || p.startsWith("/resolve") || p.startsWith("/doh") || p === "/zone.sig" || p === "/zone-pub" || p === "/zone-digest" || p === "/go" || p.startsWith("/go/")) {
    try { await bootVerify(); }
    catch (e) { return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 503, headers: JSON_CT }); }

    if (p === "/zone") return new Response(canonicalize(ZONE_V2), { headers: JSON_CT });
    if (p === "/zone.sig") return new Response(ZONE_V2.sig, { headers: { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*" } });
    if (p === "/zone-pub") return new Response(ANCHOR, { headers: { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*" } });
    if (p === "/zone-digest") return new Response(JSON.stringify({ chain: "harz-root-v2", height: ZONE_V2.height, records: ZONE_V2.records.length, signed_at: ZONE_V2.signed_at, king: ANCHOR, sig: ZONE_V2.sig }), { headers: JSON_CT });

    if (p === "/resolve" || p === "/doh") {
      const isDoh = p === "/doh";
      if (!url.searchParams.has("name")) {
        if (isDoh) return new Response(JSON.stringify({ ok: false, error: "missing name param — usage: /doh?name=pay.harz&type=TXT" }), { status: 400, headers: JSON_CT });
        return new Response(JSON.stringify({ ok: false, error: "missing name param — usage: /resolve?name=pay.harz" }), { status: 400, headers: JSON_CT });
      }
      const name = url.searchParams.get("name");
      const rec = resolveName(name);
      if (isDoh) return new Response(JSON.stringify(dohAnswer(name)), { headers: JSON_CT });
      if (!rec) return new Response(JSON.stringify({ ok: false, name: name, error: "NXDOMAIN — honest absence" }), { status: 404, headers: JSON_CT });
      return new Response(JSON.stringify({ ok: true, name: rec.name, service: rec.service, identity: rec.identity, endpoints: rec.endpoints, routing: rec.routing, state: rec.state }), { headers: JSON_CT });
    }

    if (p === "/go" || p.startsWith("/go/")) {
      const raw = p.slice(4);
      if (!raw) return page("HARZ Doors", "<div class=\"card\"><h1>HARZ Doors</h1><div class=\"small\">usage: /go/&lt;name&gt;[.harz] — zero-setting doorway into the .harz namespace</div></div>", 400);
      return doorPage(raw, resolveName(raw));
    }
  }

  if (p === "/zone-v1") return new Response(JSON.stringify({ status: "FROZEN — read-only history, not authority", chain: "harz-root-v1", digest: V1_DIGEST, zone_url: V1_FROZEN_URL, note: "superseded Sep 20, 2026 by chain harz-root-v2 (king 90062faa, height 1)" }), { headers: JSON_CT });
  if (p === "/zone.sig.v1" || p === "/health") return new Response(JSON.stringify({ ok: true, chain: "harz-root-v2", root: "v3.0" }), { headers: JSON_CT });

  return page("HARZ ROOT v3", "<div class=\"card\"><h1>404</h1><div class=\"small\">not a HARZ route</div></div>", 404);
}

// ---------- node battery exports (test harness only; inert in the worker) ----------
if (typeof module !== "undefined" && module.exports) {
  module.exports = { canonicalize, trustCheck, resolveName, dohAnswer, bootVerify, ZONE_V2, ANCHOR };
}
