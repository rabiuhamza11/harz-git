// HARZ ROOT OF ROOTS v0.1 — plain sovereign root (no kings, no ceremony)
// Law: authority = signature. Key born IN this worker, private JWK only in its own D1,
// never travels. Zone follows frozen schema v2 (strict records, canonical, Ed25519).
// TEST BUILD — protocol proof, honestly labeled. Not production.
const NS = "gembu";
const TITLE = "HARZ ROOT TWO — GEMBU (TEST)";
const RECORDS = [{"name": "coop.gembu", "service": "cooperative-ledger", "identity": "PENDING", "routing": {"nodes": []}, "state": {"height": 0, "digest": ""}, "txt": ["v0.2 field-run candidate ledger", "TEST record \u2014 protocol proof only"]}, {"name": "market.gembu", "service": "market", "identity": "PENDING", "routing": {"nodes": []}, "state": {"height": 0, "digest": ""}, "txt": ["TEST record \u2014 protocol proof only"]}];

const RELAY = "https://superagent-2286fb2f.base44.app/functions/ror_relay?url="; // transport only — CF free plan blocks worker->workers.dev subrequests (1042). Authority never rides it: signatures verify locally.
async function rfetch(url) { return fetch(RELAY + encodeURIComponent(url), { signal: AbortSignal.timeout(12000) }); }
const SPKI = new Uint8Array([0x30,0x2a,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x03,0x21,0x00]);
function canon(o) {
  if (o === null || typeof o !== "object") return JSON.stringify(o);
  if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
  return "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
}
function hex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join(""); }
function b64u(bytes) { let s = btoa(String.fromCharCode(...bytes)); return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }

async function getKey(env) {
  const rec = await env.DB.prepare("SELECT v FROM root_state WHERE k='key'").first();
  if (rec) return JSON.parse(rec.v);
  const kp = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
  const privJwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  const rawPub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const spki = new Uint8Array(SPKI.length + rawPub.length); spki.set(SPKI); spki.set(rawPub, SPKI.length);
  const fp = hex(await crypto.subtle.digest("SHA-256", spki)).slice(0, 16);
  const obj = { jwk: privJwk, fp, pub: hex(rawPub) };
  await env.DB.prepare("INSERT INTO root_state (k, v) VALUES ('key', ?)").bind(JSON.stringify(obj)).run();
  return obj;
}
async function signObj(env, obj) {
  const { jwk } = await getKey(env);
  const priv = await crypto.subtle.importKey("jwk", jwk, "Ed25519", true, ["sign"]);
  const sig = await crypto.subtle.sign("Ed25519", priv, new TextEncoder().encode(canon(obj)));
  return "ed25519:" + hex(sig);
}
async function verifyHex(pubHex, obj, sigHex) {
  const pub = await crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x: b64u(Uint8Array.from(pubHex.match(/../g).map(h => parseInt(h, 16)))) }, "Ed25519", true, ["verify"]);
  return crypto.subtle.verify("Ed25519", pub, Uint8Array.from(sigHex.match(/../g).map(h => parseInt(h, 16))), new TextEncoder().encode(canon(obj)));
}

async function getZone(env) {
  const rec = await env.DB.prepare("SELECT v FROM root_state WHERE k='zone'").first();
  if (rec) return JSON.parse(rec.v);
  const zone = { v: 2, zone: NS, height: 1, prev: "", records: RECORDS, signed_at: new Date().toISOString(), signed_by: "" };
  const k = await getKey(env);
  zone.signed_by = "ed25519:" + k.pub;
  zone.sig = await signObj(env, (() => { const u = { ...zone }; delete u.sig; return u; })());
  await env.DB.prepare("INSERT INTO root_state (k, v) VALUES ('zone', ?)").bind(JSON.stringify(zone)).run();
  return zone;
}
async function getLink(env) {
  const rec = await env.DB.prepare("SELECT v FROM root_state WHERE k='link'").first();
  return rec ? JSON.parse(rec.v) : null;
}

async function resolveX(env, name) {
  const link = await getLink(env);
  if (!link || link.status !== "active") return { ok: false, reason: link && link.status === "revoked" ? "link REVOKED at " + link.revoked_at + " — cross-root resolution refused (fail-closed)" : "no active link — cross-root resolution refused (fail-closed)" };
  if (!name.endsWith("." + link.to_ns)) return { ok: false, reason: "name not in linked namespace '" + link.to_ns + "' — refused" };
  let zone;
  try { zone = await (await rfetch(link.peer_endpoint + "/zone")).json(); }
  catch (e) { return { ok: false, reason: "peer root unreachable — honest refusal, nothing fabricated" }; }
  const { sig, ...unsigned } = zone;
  const ok = await verifyHex(link.peer_anchor, unsigned, sig.split(":")[1]);
  if (!ok) return { ok: false, reason: "peer zone signature FAILED vs pinned anchor — refusing to serve (fail-closed)" };
  const rec = (zone.records || []).find(r => r.name === name);
  if (!rec) return { ok: false, reason: "NXDOMAIN — name not in peer zone (honest absence)" };
  return { ok: true, record: rec, chain: { peer_ns: link.to_ns, peer_anchor: link.peer_anchor, peer_zone_height: zone.height, link_signature_valid: true } };
}

function json(d, code) { return new Response(JSON.stringify(d, null, 2), { status: code || 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } }); }

export default {
  async fetch(request, env) {
    if (!env.DB) return json({ error: "DB binding missing" }, 500);
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS root_state (k TEXT PRIMARY KEY, v TEXT)").run();
    const url = new URL(request.url);
    const path = url.pathname, method = request.method;
    if (path === "/health") return json({ ok: true, ns: NS, kind: "plain-root", test: true });
    if (path === "/pub") { const k = await getKey(env); return json({ ns: NS, anchor_pub: k.pub, fp: k.fp, test: true }); }
    if (path === "/zone") {
      const z = await getZone(env);
      const { sig, ...u } = z;
      const selfOk = await verifyHex(z.signed_by.split(":")[1], u, sig.split(":")[1]);
      if (!selfOk) return json({ error: "own zone signature FAILED — refusing to serve (fail-closed)" }, 503);
      return json(z);
    }
    if (path === "/resolve" && method === "GET") {
      const name = url.searchParams.get("name") || "";
      const z = await getZone(env);
      const rec = (z.records || []).find(r => r.name === name);
      return rec ? json({ ok: true, name, record: rec, identity: "ROOT-CANONICAL", height: z.height }) : json({ ok: false, name, reason: "NXDOMAIN — not in zone " + NS + " (honest absence)" }, 404);
    }
    if (path === "/resolve-x" && method === "GET") {
      const name = url.searchParams.get("name") || "";
      const r = await resolveX(env, name);
      return json({ ...r, name, via: NS, test: true }, r.ok ? 200 : 404);
    }
    if (path === "/link" && method === "GET") { const l = await getLink(env); return json(l ? { ok: true, link: l } : { ok: false, reason: "no link set yet — this root stands alone (honest)" }); }
    if (path === "/link/set" && method === "POST") {
      const b = await request.json().catch(() => null);
      if (!b || !b.peer_endpoint || !b.peer_ns) return json({ error: "peer_endpoint and peer_ns required" }, 400);
      if (b.peer_ns === NS) return json({ error: "namespace collision refused — a root never links its own namespace (fork-refusal law)" }, 400);
      let peerPub;
      try { peerPub = await (await rfetch(b.peer_endpoint + "/pub")).json(); }
      catch (e) { return json({ error: "peer root unreachable at link time — link refused (fail-closed)" }, 503); }
      if (!peerPub || !peerPub.anchor_pub) return json({ error: "peer did not present an anchor — link refused" }, 503);
      const link = { v: 1, kind: "root-link", from_ns: NS, to_ns: b.peer_ns, peer_endpoint: b.peer_endpoint, peer_anchor: peerPub.anchor_pub, peer_fp: peerPub.fp, status: "active", created_at: new Date().toISOString(), revoked_at: null };
      link.sig = await signObj(env, (() => { const u = { ...link }; delete u.sig; return u; })());
      await env.DB.prepare("INSERT OR REPLACE INTO root_state (k, v) VALUES ('link', ?)").bind(JSON.stringify(link)).run();
      return json({ ok: true, link, note: "TEST build: link routes ungated by design (no admin key on test roots)" });
    }
    if (path === "/link/revoke" && method === "POST") {
      const l = await getLink(env);
      if (!l) return json({ error: "no link to revoke" }, 404);
      l.status = "revoked"; l.revoked_at = new Date().toISOString();
      l.sig = await signObj(env, (() => { const u = { ...l }; delete u.sig; return u; })());
      await env.DB.prepare("INSERT OR REPLACE INTO root_state (k, v) VALUES ('link', ?)").bind(JSON.stringify(l)).run();
      return json({ ok: true, link: l, note: "unilateral revocation — this side no longer vouches the peer" });
    }
    if (path === "/manifest.json") return new Response(JSON.stringify({ name: TITLE, short_name: NS.toUpperCase(), start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] }), { headers: { "content-type": "application/json" } });
    if (path === "/icon.svg") return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#0a7d3c"/><text x="32" y="40" font-size="28" fill="#fff" text-anchor="middle" font-family="sans-serif">' + NS[0].toUpperCase() + "</text></svg>", { headers: { "content-type": "image/svg+xml" } });
    if (path === "/sw.js") return new Response("const C='root-v1';self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['/','/manifest.json','/icon.svg'])));self.skipWaiting()});self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(['/zone','/link','/pub','/health'].includes(u.pathname)||u.pathname.startsWith('/resolve'))return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp));return resp})))});", { headers: { "content-type": "application/javascript" } });
    if (path === "/" && method === "GET") {
      const z = await getZone(env); const l = await getLink(env); const k = await getKey(env);
      const names = (z.records || []).map(r => "<li>" + r.name + " — " + r.service + (r.identity === "PENDING" ? " (identity PENDING, honest)" : "") + "</li>").join("");
      const linkHtml = l ? "<li>peer: " + l.to_ns + " (" + l.peer_endpoint + ")</li><li>anchor fp: " + l.peer_fp + "</li><li>status: " + (l.status === "active" ? "ACTIVE" : "REVOKED at " + l.revoked_at) + "</li>" : "<li>no link — this root stands alone</li>";
      return new Response("<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><meta name='theme-color' content='#f0f2f5'><link rel='manifest' href='/manifest.json'><title>" + TITLE + "</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif}body{background:#f0f2f5;color:#1a1a2e;padding:16px 12px}h1{font-size:19px;color:#0a7d3c;text-align:center}.sub{font-size:11px;color:#666;text-align:center;margin:4px 0 2px}.banner{background:#fff3cd;border:1px solid #e0c96e;color:#7a6417;font-size:10px;text-align:center;padding:5px;border-radius:6px;margin:8px 0}.card{background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:14px;margin-bottom:12px}.card h2{font-size:14px;color:#0a7d3c;margin-bottom:8px}ul{list-style:none;font-size:12px}li{padding:4px 0;border-bottom:1px solid #f0f0f0}input{width:100%;padding:10px;border:1px solid #e0e0e0;border-radius:8px;font-size:13px}button{width:100%;padding:10px;background:#0a7d3c;color:#fff;border:none;border-radius:8px;font-weight:700;margin-top:8px;cursor:pointer}#res{font-size:12px;margin-top:10px;white-space:pre-wrap}.ft{text-align:center;font-size:10px;color:#999;padding:8px}</style></head><body><h1>" + TITLE + "</h1><p class='sub'>plain sovereign root &bull; namespace " + NS + " &bull; zone height " + z.height + " &bull; " + (z.records || []).length + " names &bull; anchor fp " + k.fp + "</p><div class='banner'>TEST ROOT — protocol proof, not production. No ceremony, no kings: authority is a signature.</div><div class='card'><h2>Names in this zone</h2><ul>" + names + "</ul></div><div class='card'><h2>Link (treaty)</h2><ul>" + linkHtml + "</ul></div><div class='card'><h2>Cross-root resolve</h2><input id='n' placeholder='name in linked namespace (e.g. coop.gembu)'><button onclick='go()'>Resolve via link</button><div id='res'></div></div><script>async function go(){const r=document.getElementById('res');const n=document.getElementById('n').value.trim();if(!n)return;r.textContent='checking...';try{const d=await(await fetch('/resolve-x?name='+encodeURIComponent(n))).json();r.textContent=JSON.stringify(d,null,2)}catch(e){r.textContent='error: '+e}}</script><div class='ft'>HARZ Root of Roots v0.1 &bull; " + NS + " &bull; fail-closed everywhere &bull; PWA (manifest + service worker)</div></body></html>", { headers: { "content-type": "text/html" } });
    }
    return json({ error: "Not found", path }, 404);
  },
};
