// HARZ Gist — personal voice gist agent. Brain: harz-ai lineage on Workers AI (@cf/llama-3.3-70b).
// Memory: D1 (single instance). Voice: Workers AI Whisper (STT) + device speechSynthesis (TTS).
// Light theme #f0f2f5, full PWA. No external AI providers.

const ICON_192_B64 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAAB5ElEQVR42u3aMQ0AMAgAQRx0rIf699d6IAykHHkBhNxIrH2kdOEEAkgACSABJAEkgASQAJIAEkACSABJAAkgASSAJIAEkAASQAJIAkgACSABJAEkgASQAJIAEkACSABJAAkgASSABJAEkAASQAJIAkgACaDybsWMXQ8ggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAJoLKDmAxBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAB5KAMIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAD6E5AAEkASQAJIAAkgASQBJIAEkACSABJAAkgASQAJIAEkgCSABJAAEkACyAkEkAASQAJIAkgACSABJAEkgASQAJIAEkACSABJAAkgASSABJCU6AExjR63wdZzQAAAAABJRU5ErkJggg==";
const ICON_512_B64 = "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";

const MANIFEST = {
  name: "HARZ Gist", short_name: "Gist",
  description: "Personal HARZ voice companion",
  start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
  ]
};

const SW_JS = `const C='harz-gist-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['/','/manifest.json']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).then(r=>{const c2=r.clone();caches.open(C).then(c=>c.put(e.request,c2)).catch(()=>{});return r;})
    .catch(()=>caches.match(e.request).then(m=>m||caches.match('/'))));
});`;

const CHARACTER = [
  "You are HARZ Gist, the personal AI companion of Rabiu Hamza Mohammed.",
  "Character: warm, plain-spoken, sharp, never corporate. You gist like a trusted friend who happens to know his whole world.",
  "You speak English, and Hausa whenever he speaks Hausa (reply in the same language he used). Keep answers short and human, usually 2-5 sentences unless he asks for depth.",
  "Hausa style: write spoken Nigerian Hausa the way friends gist in Gembu, never textbook Hausa and never radio-news Hausa. Short sentences. Everyday words: sannu, toh, madalla, kai, wallahi, shikenan, ban sani ba, me ya faru, yaya kake, kana, kake. English tech words stay English naturally (phone, data, network, business, worker). Never translate an English saying word for word. Never sound like a machine reading aloud.",
  "Hausa examples of the exact register to copy: HE: 'Yaya kake? Ina son labari.' YOU: 'Sannu da zuwa. Ina lafiya, kai kuma? Ina jin labarin HYPE ya tashi, ka ga abin?' HE: 'Wallahi na gaji yau.' YOU: 'Toh, huta kadan. Aikin ba zai gudu ba. Me ya fi damun ka?' HE: 'Me ka sani kan kasuwancina?' YOU: 'Na san kana sayar da digital setup ga shaguna a Gembu, kusan dubu hamsin, burinka kuma dubu dari.'",
  "What you know about him: from Mambilla plateau, Sardauna and Gembu, Taraba State, Nigeria. Builder who refuses to rent his future: his words are 'I don't need internet, I want to BE internet myself.'",
  "He runs Harz Digital Services (digital setups, ~50,000 naira a client, target 100,000). Six payment channels: UBA 2034326424, Paystack, GDEG, USDT TRC20, Gumroad, Paddle.",
  "His projects: HARZ Internetless (offline information network), GDEG energy token on Polygon, NRL token, Harz Exchange, the HARZ trading machine (DEMO-only until further notice, Experiment B verdict due Nov 6).",
  "His rules: evidence beats claims, no untested reporting, audit first, no ceremony, never handle private keys, never claim to have done something you did not do.",
  "Hard limits: never invent facts about him beyond the memory cards; never produce, request or discuss private keys or seed phrases; if you do not know something, say you do not know. You are an AI, and you say so plainly if asked.",
  "Honesty: if a memory card conflicts with what he tells you now, trust what he tells you now and say the memory needs correcting."
].join(" ");

async function sha256hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function authed(env, req) {
  const t = req.headers.get("x-gist-token") || "";
  if (!t) return false;
  const h = await sha256hex(t);
  const r = await env.HARZ_DB.prepare("SELECT 1 AS ok FROM gist_tokens WHERE token_sha256 = ?").bind(h).first();
  return !!r;
}

function j(o, status = 200) { return Response.json(o, { status, headers: { "cache-control": "no-store" } }); }

async function memoryBlock(env, limit = 40) {
  const rows = (await env.HARZ_DB.prepare("SELECT id, fact, source FROM gist_memory ORDER BY id DESC LIMIT ?").bind(limit).all()).results || [];
  if (!rows.length) return "(memory is empty)";
  return rows.map(r => `- [${r.id}] ${r.fact}${r.source ? " (source: " + r.source + ")" : ""}`).join("\n");
}

async function historyBlock(env) {
  const rows = (await env.HARZ_DB.prepare("SELECT role, content FROM gist_log ORDER BY id DESC LIMIT 10").all()).results || [];
  return rows.reverse().map(r => ({ role: r.role, content: r.content }));
}

async function think(env, message) {
  const mem = await memoryBlock(env);
  const hist = await historyBlock(env);
  const sys = CHARACTER + "\n\nMEMORY CARDS (verified facts you may rely on):\n" + mem;
  const messages = [{ role: "system", content: sys }, ...hist, { role: "user", content: message }];
  // Model routing: Hausa -> llama-4-scout (best natural Hausa on Workers AI, verified by side-by-side test),
  // English -> llama-3.3-70b. Detection via common Hausa function words.
  const HAUSA_MARKERS = /\b(yaya|kake|kina|kana|naka|naki|ina|sannu|wallahi|toh|madalla|shikenan|nawa|yaushe|mene|wanne|wace|wani|gaya|game\s+da|mini|yake|take|suke|kada|yanzu|gaskiya|don\s+Allah|na\s+gode|ban\s+sani|kasuwanci|gida|aboki|lafiya|ranka|kwana|malam|hira|labari|sosai|kadan|yaro|budurwa|naku)\b/gi;
  const EN_MARKERS = /\b(the|is|are|was|my|your|how|what|when|where|give|and|for|about|of|in|to|one|short|please|tell|today|does|do|can|you|with|update|sentence|project|projects|machine|would|could|should|say|make|need|want)\b/gi;
  const lastMsg = (messages[messages.length-1] || {}).content || "";
  const haN = (lastMsg.match(HAUSA_MARKERS) || []).length;
  const enN = (lastMsg.match(EN_MARKERS) || []).length;
  const isHausa = haN > 0 && haN >= enN;
  const model = isHausa ? "@cf/meta/llama-4-scout-17b-16e-instruct" : "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  // LANGUAGE LOCK (owner rule Oct 30): mirror the language of the owner's message exactly.
  // English in -> English out. Hausa in -> Hausa out. No mixing, except technical terms that stay English.
  const lock = isHausa
    ? "LANGUAGE LOCK: The owner wrote in Hausa. Reply ONLY in Hausa, spoken register. Do not use English sentences. Technical words (phone, data, network, business) may stay English."
    : "LANGUAGE LOCK: The owner wrote in English. Reply ONLY in English. Do not reply in Hausa, not even a sentence.";
  messages[0].content = messages[0].content + "\n\n" + lock;
  const out = await env.AI.run(model, { messages, max_tokens: 500 });
  const reply = (out && out.response) ? String(out.response).trim() : "";
  if (!reply) throw new Error("brain returned empty response");
  return reply;
}

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (req.method === "GET" && (u.pathname === "/" || u.pathname === "/index.html"))
      return new Response(HTML, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    if (u.pathname === "/manifest.json") return Response.json(MANIFEST, { headers: { "cache-control": "max-age=3600" } });
    if (u.pathname === "/avatar.svg") return new Response(AVATAR_SVG, { headers: { "content-type": "image/svg+xml", "cache-control": "max-age=86400" } });
    if (u.pathname === "/sw.js") return new Response(SW_JS, { headers: { "content-type": "application/javascript", "cache-control": "max-age=3600" } });
    for (const [p, b64] of [["/icon-192.png", ICON_192_B64], ["/icon-512.png", ICON_512_B64]]) {
      if (u.pathname === p) {
        const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        return new Response(bin, { headers: { "content-type": "image/png", "cache-control": "max-age=86400" } });
      }
    }

    // enroll: issue a device token (once per device)
    if (u.pathname === "/api/enroll" && req.method === "POST") {
      const token = [...crypto.getRandomValues(new Uint8Array(24))].map(b => b.toString(16).padStart(2, "0")).join("");
      await env.HARZ_DB.prepare("INSERT INTO gist_tokens (token_sha256, created_ts) VALUES (?,?)")
        .bind(await sha256hex(token), new Date().toISOString()).run();
      return j({ token });
    }

    if (u.pathname.startsWith("/api/") && !(await authed(env, req))) return j({ error: "unauthorized: enroll this device first" }, 401);

    if (u.pathname === "/api/chat" && req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const message = (b.message || "").toString().trim();
      if (!message) return j({ error: "empty message" }, 400);
      let reply;
      try { reply = await think(env, message); }
      catch (e) { return j({ error: "brain unavailable: " + e.message }, 502); }
      await env.HARZ_DB.prepare("INSERT INTO gist_log (role, content, ts) VALUES (?,?,?)").bind("user", message, new Date().toISOString()).run();
      await env.HARZ_DB.prepare("INSERT INTO gist_log (role, content, ts) VALUES (?,?,?)").bind("assistant", reply, new Date().toISOString()).run();
      return j({ reply });
    }

    if (u.pathname === "/api/stt" && req.method === "POST") {
      const buf = await req.arrayBuffer();
      if (!buf || buf.byteLength < 500) return j({ error: "audio too small" }, 400);
      try {
        const out = await env.AI.run("@cf/openai/whisper", { audio: [...new Uint8Array(buf)] });
        return j({ text: (out && out.text ? out.text : "").trim() });
      } catch (e) { return j({ error: "stt failed: " + e.message }, 502); }
    }

    if (u.pathname === "/api/modeltest" && req.method === "POST") {
      if (!(await authed(env, req))) return j({ error: "auth required" }, 401);
      const b = await req.json().catch(() => ({}));
      try {
        const r = await env.AI.run(b.model, { messages: [{ role: "system", content: b.system || "" }, { role: "user", content: b.prompt }], max_tokens: 350, temperature: 0.6 });
        return j({ model: b.model, out: (r && r.response) || JSON.stringify(r).slice(0, 200) });
      } catch (e) { return j({ model: b.model, error: String(e).slice(0, 160) }, 200); }
    }
    if (u.pathname === "/api/memory" && req.method === "GET") {
      const rows = (await env.HARZ_DB.prepare("SELECT id, fact, source, created_ts, updated_ts FROM gist_memory ORDER BY id DESC").all()).results || [];
      return j({ memories: rows });
    }
    if (u.pathname === "/api/memory" && req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const fact = (b.fact || "").toString().trim();
      if (!fact) return j({ error: "empty fact" }, 400);
      const ts = new Date().toISOString();
      const r = await env.HARZ_DB.prepare("INSERT INTO gist_memory (fact, source, created_ts, updated_ts) VALUES (?,?,?,?)")
        .bind(fact, (b.source || "").toString(), ts, ts).run();
      return j({ ok: true, id: r.meta && r.meta.last_row_id });
    }
    const m = u.pathname.match(/^\/api\/memory\/(\d+)$/);
    if (m && req.method === "PUT") {
      const b = await req.json().catch(() => ({}));
      const fact = (b.fact || "").toString().trim();
      if (!fact) return j({ error: "empty fact" }, 400);
      await env.HARZ_DB.prepare("UPDATE gist_memory SET fact = ?, updated_ts = ? WHERE id = ?").bind(fact, new Date().toISOString(), m[1]).run();
      return j({ ok: true });
    }
    if (m && req.method === "DELETE") {
      await env.HARZ_DB.prepare("DELETE FROM gist_memory WHERE id = ?").bind(m[1]).run();
      return j({ ok: true });
    }

    return j({ error: "not found" }, 404);
  }
};

const AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
 <defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset="1" stop-color="#e6eef0"/></linearGradient>
  <linearGradient id="skin" x1="0.25" y1="0" x2="0.75" y2="1"><stop offset="0" stop-color="#8d5c40"/><stop offset="1" stop-color="#6a4330"/></linearGradient>
  <linearGradient id="tee" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efeae0"/><stop offset="1" stop-color="#dfd8ca"/></linearGradient>
  <clipPath id="c"><circle cx="100" cy="100" r="94"/></clipPath>
 </defs>
 <circle cx="100" cy="100" r="96" fill="url(#bg)"/>
 <g clip-path="url(#c)">
  <path d="M26 200 Q30 150 100 146 Q170 150 174 200 Z" fill="url(#tee)"/>
  <path d="M100 146 Q113 150 114 166 L86 166 Q87 150 100 146 Z" fill="#f6f2ea"/>
  <path d="M84 118 h32 v24 q-16 9 -32 0 Z" fill="#5c3927"/>
  <ellipse cx="57" cy="95" rx="8" ry="11" fill="#7d4f37"/>
  <ellipse cx="143" cy="95" rx="8" ry="11" fill="#7d4f37"/>
  <path d="M59 84 Q59 44 100 42 Q141 44 141 84 Q141 122 100 137 Q59 122 59 84 Z" fill="url(#skin)"/>
  <path d="M64 92 Q66 126 100 133 Q134 126 136 92 Q131 120 100 125 Q69 120 64 92 Z" fill="#241a14"/>
  <path d="M59 80 Q56 40 100 38 Q144 40 141 80 Q137 58 118 52 Q100 47 82 52 Q63 58 59 80 Z" fill="#1a1410"/>
  <path d="M73 80 q11 -7 21 -3" stroke="#1f1712" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M127 80 q-11 -7 -21 -3" stroke="#1f1712" stroke-width="6" fill="none" stroke-linecap="round"/>
  <ellipse cx="84" cy="93" rx="9.5" ry="8.5" fill="#ffffff"/>
  <ellipse cx="116" cy="93" rx="9.5" ry="8.5" fill="#ffffff"/>
  <circle cx="85" cy="94" r="4.8" fill="#231710"/><circle cx="117" cy="94" r="4.8" fill="#231710"/>
  <circle cx="87" cy="92" r="1.7" fill="#ffffff"/><circle cx="119" cy="92" r="1.7" fill="#ffffff"/>
  <path d="M100 95 q-7 13 -3 17 q4 3 8 1" stroke="#57372a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M85 115 q15 -7 30 0 q-5 -7 -15 -7 q-10 0 -15 7 Z" fill="#221913"/>
  <path d="M88 122 q12 9 24 0" stroke="#3a2216" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M100 128 q6 0 8 3 q-8 4 -16 0 q2 -3 8 -3 Z" fill="#241a14" opacity="0.9"/>
  <ellipse cx="70" cy="104" rx="6" ry="3.4" fill="#a9694b" opacity="0.28"/>
  <ellipse cx="130" cy="104" rx="6" ry="3.4" fill="#a9694b" opacity="0.28"/>
 </g>
 <circle cx="100" cy="100" r="94" fill="none" stroke="#0f766e" stroke-width="4"/>
</svg>`;

const HTML = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>HARZ Gist</title>
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f0f2f5">
<link rel="apple-touch-icon" href="/icon-192.png">
<link rel="icon" href="/icon-192.png">
<style>
:root{--bg:#f0f2f5;--card:#ffffff;--ink:#1c2430;--sub:#6b7684;--line:#dfe4ea;--accent:#0f766e;--accent2:#0b5f59}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:720px;margin:0 auto;padding:16px 14px 120px}
header{display:flex;align-items:center;gap:10px;padding:6px 2px 14px}
.logo{width:38px;height:38px;border-radius:11px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px}
h1{font-size:19px;margin:0;font-weight:700}
.sub{color:var(--sub);font-size:12px;margin-top:2px}
.tabs{display:flex;gap:8px;margin:0 0 12px}
.tab{flex:1;text-align:center;padding:9px 0;border-radius:10px;background:var(--card);border:1px solid var(--line);font-size:13px;color:var(--sub);font-weight:600}
.tab.on{background:var(--accent);border-color:var(--accent);color:#fff}
.chat{display:flex;flex-direction:column;gap:10px;min-height:40vh}
.msg{padding:11px 13px;border-radius:14px;max-width:88%;white-space:pre-wrap;word-wrap:break-word;font-size:15px}
.me{align-self:flex-end;background:var(--accent);color:#fff;border-bottom-right-radius:4px}
.it{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:4px}
.err{align-self:flex-start;background:#fdecec;border:1px solid #f5c2c2;color:#8a1f1f}
.bar{position:fixed;left:0;right:0;bottom:0;background:rgba(240,242,245,.96);backdrop-filter:blur(8px);border-top:1px solid var(--line);padding:10px 12px 16px}
.barin{max-width:720px;margin:0 auto;display:flex;gap:8px;align-items:flex-end}
textarea{flex:1;resize:none;height:44px;border-radius:12px;border:1px solid var(--line);padding:11px 12px;font:15px/1.3 inherit;background:#fff;color:var(--ink);outline:none}
.mic,.send{border:0;border-radius:12px;height:44px;min-width:52px;font-weight:700;font-size:15px;color:#fff;background:var(--accent)}
.mic.rec{background:#b42318}
.mic:disabled,.send:disabled{opacity:.55}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px 14px;margin-bottom:10px}
.card .fact{font-size:15px}
.card .src{color:var(--sub);font-size:12px;margin-top:4px}
.row{display:flex;gap:8px;margin-top:9px}
.mini{border:1px solid var(--line);background:#fff;border-radius:9px;padding:6px 11px;font-size:13px;color:var(--ink)}
.mini.del{color:#b42318;border-color:#f0c9c9}
.empty{color:var(--sub);text-align:center;padding:22px 6px;font-size:14px}
.hint{color:var(--sub);font-size:12px;text-align:center;padding:8px 0 0}
.foot{color:var(--sub);font-size:11px;text-align:center;padding:16px 0 0;line-height:1.6}
.hidden{display:none}
</style></head><body>
<div class="wrap">
<header><img class="logo" src="/avatar.svg" alt="Rabiu cartoon avatar"><div><h1>HARZ Gist</h1><div class="sub">Cartoon Rabiu · your gist companion · English &amp; Hausa</div></div></header>
<div class="tabs"><div class="tab on" id="tabChat">Gist</div><div class="tab" id="tabMem">Memory</div></div>
<div id="viewChat"><div class="chat" id="chat"></div></div>
<div id="viewMem" class="hidden">
  <div class="card"><b>Teach it a fact</b>
    <div style="margin-top:8px"><textarea id="newFact" placeholder="e.g. My next target is 10 clients by December" style="height:60px;width:100%"></textarea></div>
    <div class="row"><button class="mini" id="addFact" style="background:var(--accent);color:#fff;border-color:var(--accent)">Remember this</button></div>
  </div>
  <div id="memList"></div>
  <div class="hint">Every memory is inspectable, correctable and deletable. Memory lives in HARZ D1.</div>
</div>
<div class="foot">Brain: Workers AI on your Cloudflare account · No external AI providers<br>Voice: your device speaks · Memory: HARZ D1</div>
</div>
<div class="bar"><div class="barin">
  <button class="mic" id="mic" title="Hold to talk">🎙</button>
  <textarea id="msg" placeholder="Gist with me…" rows="1"></textarea>
  <button class="send" id="send">Send</button>
</div></div>
<script>
let TOKEN = localStorage.getItem('gist_token') || '';
const chat = document.getElementById('chat');
const msg = document.getElementById('msg');
const sendBtn = document.getElementById('send');
const micBtn = document.getElementById('mic');
let speaking = true;

function bubble(text, cls){
  const row=document.createElement('div'); row.className='row '+cls;
  if(cls!=='me'){ const im=document.createElement('img'); im.className='ava'; im.src='/avatar.svg'; im.alt=''; row.appendChild(im); }
  const d=document.createElement('div'); d.className='msg '+cls; d.textContent=text; row.appendChild(d);
  chat.appendChild(row); window.scrollTo(0,document.body.scrollHeight);
  d.remove=()=>row.remove(); return d;
}
async function api(path, opts={}){
  opts.headers = Object.assign({'x-gist-token':TOKEN}, opts.body ? {'Content-Type':'application/json'} : {});
  const r = await fetch(path, opts);
  return r.json().catch(()=>({error:'bad response'}));
}
async function enroll(){
  if (TOKEN) return;
  const r = await fetch('/api/enroll', {method:'POST'});
  const d = await r.json();
  if (d.token){ TOKEN = d.token; localStorage.setItem('gist_token', TOKEN); }
}
function speak(text, lang){
  try{
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || 'en-NG';
    const vs = speechSynthesis.getVoices();
    const pick = vs.find(v=>v.lang===u.lang) || vs.find(v=>/^en/.test(v.lang)) || vs[0];
    if (pick) u.voice = pick;
    u.rate = 1.02; speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}
async function send(text){
  const t = (text||'').trim(); if(!t) return;
  bubble(t,'me'); msg.value=''; msg.style.height='44px';
  const wait = bubble('…','it');
  const d = await api('/api/chat', {method:'POST', body: JSON.stringify({message:t})});
  wait.remove();
  if (d.reply){ bubble(d.reply,'it'); if (speaking) speak(d.reply); }
  else bubble(d.error||'Something failed.','err');
}
sendBtn.onclick = ()=>send(msg.value);
msg.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(msg.value); } });
msg.addEventListener('input', ()=>{ msg.style.height='44px'; msg.style.height=Math.min(120, msg.scrollHeight)+'px'; });

/* voice input: record → whisper on Workers AI */
let rec=null, chunks=[], recording=false;
micBtn.onclick = async ()=>{
  if (recording){ rec.stop(); return; }
  try{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    rec = new MediaRecorder(stream); chunks=[];
    rec.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
    rec.onstop = async ()=>{
      recording=false; micBtn.classList.remove('rec'); micBtn.textContent='🎙';
      stream.getTracks().forEach(t=>t.stop());
      const blob = new Blob(chunks,{type:'audio/webm'});
      if (blob.size < 800) return;
      const w = bubble('transcribing…','it');
      const r = await fetch('/api/stt',{method:'POST',headers:{'x-gist-token':TOKEN},body:blob});
      const d = await r.json().catch(()=>({error:'stt failed'}));
      w.remove();
      if (d.text){ send(d.text); } else bubble(d.error||'Could not hear that.','err');
    };
    rec.start(); recording=true; micBtn.classList.add('rec'); micBtn.textContent='■';
  }catch(e){ bubble('Microphone not available: '+e.message,'err'); }
};

/* memory panel */
const viewChat=document.getElementById('viewChat'), viewMem=document.getElementById('viewMem');
const tabChat=document.getElementById('tabChat'), tabMem=document.getElementById('tabMem');
tabChat.onclick=()=>{ tabChat.classList.add('on'); tabMem.classList.remove('on'); viewChat.classList.remove('hidden'); viewMem.classList.add('hidden'); };
tabMem.onclick=async ()=>{ tabMem.classList.add('on'); tabChat.classList.remove('on'); viewMem.classList.remove('hidden'); viewChat.classList.add('hidden'); await loadMem(); };
async function loadMem(){
  const d = await api('/api/memory');
  const list = document.getElementById('memList'); list.innerHTML='';
  if (!d.memories || !d.memories.length){ list.innerHTML='<div class="empty">No memories yet. Teach it something above.</div>'; return; }
  for (const m of d.memories){
    const c = document.createElement('div'); c.className='card';
    c.innerHTML = '<div class="fact"></div><div class="src"></div><div class="row"><button class="mini edit">Correct</button><button class="mini del">Delete</button></div>';
    c.querySelector('.fact').textContent = '['+m.id+'] '+m.fact;
    c.querySelector('.src').textContent = m.source ? ('source: '+m.source) : '';
    c.querySelector('.edit').onclick = async ()=>{
      const v = prompt('Correct this memory:', m.fact); if(!v) return;
      await api('/api/memory/'+m.id, {method:'PUT', body: JSON.stringify({fact:v})}); await loadMem();
    };
    c.querySelector('.del').onclick = async ()=>{
      if(!confirm('Delete this memory?')) return;
      await api('/api/memory/'+m.id, {method:'DELETE'}); await loadMem();
    };
    list.appendChild(c);
  }
}
document.getElementById('addFact').onclick = async ()=>{
  const v = document.getElementById('newFact').value.trim(); if(!v) return;
  await api('/api/memory', {method:'POST', body: JSON.stringify({fact:v, source:'owner, told in gist'})});
  document.getElementById('newFact').value=''; await loadMem();
};

(async ()=>{ await enroll(); bubble('Sannu Rabiu. I am here. Talk to me by voice or type, in English or Hausa.','it'); })();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
</script></body></html>`;
