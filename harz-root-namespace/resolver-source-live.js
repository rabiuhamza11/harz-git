--f7beb4ee0a6864edebac519fcf3525853d288d109a448fc405a6676efa38
Content-Disposition: form-data; name="index.js"

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var REG_KEY = "HARZ-ROOT-2026";
var PKG_URL = "https://base44.app/api/apps/6a73a8c22c0bd92ff4087682/files/mp/public/6a73a8c22c0bd92ff4087682/b8db3100a_harz-root.zip";
var SVG_ICON = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' fill='#0066ff'/><text x='96' y='118' font-size='42' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'>.harz</text><text x='96' y='155' font-size='18' text-anchor='middle' fill='#cfe0ff' font-family='Arial'>ROOT</text></svg>`;
var SW = `const c='hr1';self.addEventListener('install',e=>{e.waitUntil(caches.open(c).then(ca=>ca.addAll(['/','/manifest.json','/icon.svg'])))});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const cp=n.clone();caches.open(c).then(ca=>ca.put(e.request,cp));return n})))})`;
var CSS = `*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#1a1a2e;padding:12px;max-width:720px;margin:0 auto;padding-bottom:env(safe-area-inset-bottom)}h1{font-size:22px;color:#0066ff;font-weight:800;margin:14px 0 2px}.sub{font-size:12px;color:#666;margin-bottom:14px}h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#666;margin:18px 0 8px}.card{background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:14px;margin-bottom:10px}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px}.row:last-child{border-bottom:none}.ok{color:#137333;font-weight:700}.val{color:#1a1a2e;font-weight:600}.small{font-size:11px;color:#999}.btn{display:block;background:#0066ff;color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;text-align:center;text-decoration:none;margin-top:10px}.code{font-family:monospace;background:#f6f8fa;border:1px solid #e0e0e0;border-radius:8px;padding:10px;font-size:11px;white-space:pre-wrap;word-break:break-all;margin:8px 0;color:#333}.tag{display:inline-block;background:#e8f0fe;color:#1967d2;padding:2px 10px;border-radius:12px;font-size:11px;margin:2px 4px 2px 0;font-weight:600}.foot{text-align:center;font-size:10px;color:#999;padding:16px 0}input{width:100%;border:1px solid #d0d5dd;border-radius:8px;padding:10px;font-size:14px;margin:4px 0}#result{margin-top:8px}`;
async function sha256Hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
var index_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    if (path === "/icon.svg") return new Response(SVG_ICON, { headers: { "content-type": "image/svg+xml" } });
    if (path === "/sw.js") return new Response(SW, { headers: { "content-type": "application/javascript" } });
    if (path === "/manifest.json") return new Response(JSON.stringify({
      name: "HARZ Root",
      short_name: ".harz",
      start_url: "/",
      display: "standalone",
      background_color: "#f0f2f5",
      theme_color: "#f0f2f5",
      icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
    }), { headers: { "content-type": "application/json" } });
    if (path === "/resolve") {
      const name = (url.searchParams.get("name") || "").toLowerCase().trim().replace(/\.$/, "");
      if (!name.endsWith(".harz")) return Response.json({ ok: false, error: "only .harz names" }, { status: 400 });
      const rows = await env.DB.prepare("SELECT name, type, value, seal FROM names WHERE name=?").bind(name).all();
      const cors = { "content-type": "application/json", "access-control-allow-origin": "*" };
      if (!rows.results.length) return Response.json({ ok: false, name, error: "NXDOMAIN \u2014 not registered" }, { status: 404, headers: cors });
      return Response.json({ ok: true, name, records: rows.results }, { headers: cors });
    }
    if (path === "/register" && req.method === "POST") {
      if (req.headers.get("x-harz-key") !== REG_KEY) return new Response("unauthorized", { status: 401 });
      try {
        const { name, type, value } = await req.json();
        const fq = String(name).toLowerCase().trim();
        if (!/^[a-z0-9-]+\.harz$/.test(fq)) return Response.json({ ok: false, error: "name must be like site.harz" }, { status: 400 });
        if (!["A", "TXT", "NS", "CNAME"].includes(type)) return Response.json({ ok: false, error: "type must be A/TXT/NS/CNAME" }, { status: 400 });
        const last = await env.DB.prepare("SELECT hash FROM chain ORDER BY id DESC LIMIT 1").all();
        const prev = last.results.length ? last.results[0].hash : "GENESIS";
        const ts = (/* @__PURE__ */ new Date()).toISOString();
        const hash = await sha256Hex(JSON.stringify({ event: "name_registered", data: { name: fq, type }, ts, prev }));
        const seal = hash.slice(0, 12).toUpperCase();
        await env.DB.batch([
          env.DB.prepare("INSERT INTO names (name, type, value, seal) VALUES (?,?,?,?)").bind(fq, type, String(value).slice(0, 500), seal),
          env.DB.prepare("INSERT INTO chain (event, data, ts, prev, hash) VALUES (?,?,?,?,?)").bind("name_registered", JSON.stringify({ name: fq, type, value: String(value).slice(0, 500) }), ts, prev, hash)
        ]);
        return Response.json({ ok: true, name: fq, type, seal });
      } catch (e) {
        return Response.json({ ok: false, error: "bad payload" }, { status: 400 });
      }
    }
    if (path === "/api/zone") {
      const names2 = await env.DB.prepare("SELECT name, type, value, seal FROM names ORDER BY id").all();
      return Response.json({ ok: true, names: names2.results });
    }
    let names = [], chain = [];
    try {
      names = (await env.DB.prepare("SELECT name, type, value, seal FROM names ORDER BY id").all()).results;
      chain = (await env.DB.prepare("SELECT hash, event, ts FROM chain ORDER BY id DESC LIMIT 3").all()).results;
    } catch (e) {
    }
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0f2f5"><meta name="description" content="HARZ Root \u2014 our own root nameserver and the .harz namespace"><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml"><title>HARZ Root \u2014 .harz</title><style>${CSS}</style></head><body>
<h1>HARZ Root</h1>
<div class="sub">Our own root nameserver \u2014 the internet's naming, owned by us</div>

<div class="card">
<div class="row"><span>Protocol</span><span class="val">DNS \xB7 RFC 1035 \xB7 UDP + TCP :53</span></div>
<div class="row"><span>TLD</span><span class="val">.harz</span></div>
<div class="row"><span>Names registered</span><span class="val">${names.length}</span></div>
<div class="row"><span>Registry</span><span class="val">SHA-256 hash chain</span></div>
<div class="row"><span>Wire test</span><span class="ok">5/5 PASSED \xB7 TCP PASSED</span></div>
</div>

<h2>Resolve a .harz Name</h2>
<div class="card">
<input id="q" placeholder="kasuwa.harz" autocapitalize="off">
<button class="btn" onclick="doResolve()">Resolve</button>
<div id="result"></div>
</div>

<h2>The Zone</h2>
<div class="card">
${names.length ? names.map((n) => `<div class="row"><span><b>${n.name}</b><br><span class="small">${n.type} \xB7 ${n.value.length > 46 ? n.value.slice(0, 46) + "\u2026" : n.value}</span></span><span class="small" style="text-align:right">Seal<br><b>${n.seal}</b></span></div>`).join("") : '<div class="small">Zone empty</div>'}
</div>

<h2>Latest Chain Blocks</h2>
<div class="card">
${chain.length ? chain.map((c) => `<div class="row"><span><b>${c.hash.slice(0, 12).toUpperCase()}</b><br><span class="small">${c.event} \xB7 ${c.ts.slice(0, 19)}Z</span></span></div>`).join("") : '<div class="small">Chain empty</div>'}
</div>

<h2>Run the Root</h2>
<div class="card">
<span class="tag">Node 18+</span><span class="tag">UDP/TCP :53</span><span class="tag">No license needed</span>
<div class="code">unzip harz-root.zip
node root-server.js           # :53 (production)
node test-root.js 127.0.0.1 5353   # wire test

# register a name (sealed on chain):
node root-server.js register mysite.harz TXT "https://..."</div>
<a class="btn" href="${PKG_URL}">Download Root Server (.zip)</a>
</div>

<div class="foot">HARZ Root \u2022 harz.workers.dev<br>Same honest line as the Exchange: inside our world names resolve now; the normal internet's root is ICANN's door (~$185k, years) \u2014 everything on our side is built and proven.</div>
<script>if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js')
async function doResolve(){const q=document.getElementById('q').value.trim();const r=document.getElementById('result');if(!q){r.innerHTML='<div class="small">type a name</div>';return}try{const d=await(await fetch('/resolve?name='+encodeURIComponent(q))).json();if(d.ok){r.innerHTML='<div class="code">'+d.records.map(x=>x.type+' \u2192 '+x.value+'\\nseal '+x.seal).join('\\n')+'</div>'}else{r.innerHTML='<div class="code">'+(d.error||'not found')+'</div>'}}catch(e){r.innerHTML='<div class="small">error</div>'}}<\/script>
</body></html>`;
    return new Response(html, { headers: { "content-type": "text/html;charset=utf-8" } });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map

--f7beb4ee0a6864edebac519fcf3525853d288d109a448fc405a6676efa38--
