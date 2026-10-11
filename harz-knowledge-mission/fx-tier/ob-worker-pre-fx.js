(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // index.js
  
  var HEAD_INJECT = '<link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="HARZ Offline Reader"><script>if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js");<\/script>';
  async function loadOnefile() {
    const metaRaw = await HARZ_BROWSER.get("onefile.meta");
    if (metaRaw) {
      try {
        const meta = JSON.parse(metaRaw);
        if (meta && Array.isArray(meta.chunks) && meta.chunks.length) {
          const parts = [];
          let complete = true;
          for (const k of meta.chunks) {
            const part = await HARZ_BROWSER.get(k);
            if (!part) {
              complete = false;
              break;
            }
            parts.push(part);
          }
          if (complete) return { v: parts.join(""), seal: meta.seal || null, meta };
        }
      } catch (e) {
      }
    }
    const v = await HARZ_BROWSER.get("onefile");
    if (!v) return { v: null, seal: null };
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return { v, seal: v.length + "-" + hex.slice(0, 16) };
  }
  __name(loadOnefile, "loadOnefile");
  async function handle(req) {
    const p = new URL(req.url).pathname;
    if (p === "/gather") return gatherRequest(new URL(req.url));
    if (p === "/sw.js") return swJs();
    if (p === "/manifest.json") return manifestJson();
    if (p === "/icon.svg") return iconSvg();
    const { v, seal, err } = await loadOnefile();
    if (!v) return new Response("browser payload missing: " + (err || "nothing in KV"), { status: 500 });
    if (req.method === "HEAD") return new Response(null, { headers: { "x-harz-seal": seal || "", "Access-Control-Allow-Origin": "*" } });
    const i = v.indexOf("<head>");
    const html = i === -1 ? v : v.slice(0, i + 6) + HEAD_INJECT + v.slice(i + 6);
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-harz-seal": seal || "" } });
  }
  __name(handle, "handle");
  var GATE_AUTO_ALLOW = /\.(edu|gov|ac)(\.[a-z]{2})?$|^(europeana|gutenberg|archive|wikisource|builtin|heritage|muckrack|weatherspark|dowjones|pitchbook|globalsources|belta|sme|baike|okstate|savvasrealize|bellybelly|pearltrees)/;
  var GATE_RULES = [
    [/^example\.(com|org|net)$/, "test/example domain"],
    [/\.harz$/, "internal HARZ probe domain"],
    [/(^|[-.])test($|[-.])|probe/, "test/probe domain"],
    [/^google|^hao123\.|(^|\.)bing\.|^duckduckgo\./, "search-engine portal, no corpus value"],
    [/baidu-itm|gtimg|bdstatic|sinajs|yusercontent|yamallng|d-53\.info/, "CDN infra, no docs"],
    [/ads?$|-ads?|ads?[-.]|advert|appier|teads|snigel|decibel|mediav|rokt|doubleclick|track|pixel|-?dns|-cdn|cdn-|demandware|captiveportal|femto|optout|onezapp|anythinktech|ivaws|bid-algorix|ovhnextmillmedia/, "ad-tech/tracking/infra"],
    [/hentai|porn|xxx|nsfw|onlyfans|lovense|arabs/, "adult content"],
    [/movie|film|cinema|fmovi|vega|putlock|torrent|coppersurfer|soap2day|123mov|primewire|vidcloud|napthe|games?($|[-.])|gaming|anime|roms|emulator|crack|keygen|nulled|warez|unlock|mod-?apk|cheat|ffbeta|vudu|hulu|netflix|crunchyroll|vasd/, "piracy/streaming/gaming-spam"],
    [/casino|poker|slots|bookmaker|lottery|betting|1xbet|betway|bet365|(^|[-.])bet($|[-.])/, "gambling"],
    [/shop|cider|ray-ban|bestwestern|thomann|leroymerlin|aliexpress|amazon\.|travelocity|travel|flight|booking|etix|ticket|taplink|telesco\.pe|shorten|locanto|officestation|shcilestamp|mybsn|omio/, "retail/booking/transactional, no knowledge value"],
    [/chegg/, "paywalled copyright-sensitive"],
    [/hashvault|pool($|[-.])|mining/, "mining/crypto infra"],
    [/ggpolarbear|yuanshen|jappy|cocolog-nifty|fqnovel|whmpanels|pik-digital|megoplan|brainyquote/, "low-value content farm / social / blog host"],
    [/votesokeverytime|uptune|aliyunga|grammarlyaws|hubble\.in|mshome|xdrtc|fujitsu|ntvpforever|ca-servers|joins\.com|trueachievements|xhtv|drogari|droga|pharma|bc0a\.|mczbf\.|five64dmv|amurobl|nhnace|50union|youngle\.tech|geniex\.|mykeeta|iesnare|ort-one-pingone|se-platform|workdaysuvcareers|remote-service-pf|dizinc|apitd|trvdp|fomo\.family|vcloud|azureserv|modal\.host|allsaints|nothingtech|toss\.im|samsungsds|tatasteel/, "brand app / infra / low-value corporate"],
    [/\.(tk|pw|club|fit|futbol|xyz|top|click|gq|cf|ml|work|live|gg|tv|store|trade)$/, "high-abuse TLD"]
  ];
  function gateDomain(d) {
    if (GATE_AUTO_ALLOW.test(d)) return { ok: true, reason: "auto-allow" };
    const labels = d.split(".");
    for (var si = 0; si < labels.length - 1; si++) {
      var t = labels.slice(si).join(".");
      for (var i = 0; i < GATE_RULES.length; i++) if (GATE_RULES[i][0].test(t)) return { ok: false, reason: GATE_RULES[i][1] };
    }
    return { ok: true, reason: "default-allow" };
  }
  __name(gateDomain, "gateDomain");
  async function gatherRequest(u) {
    const d = (u.searchParams.get("d") || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const origin = u.searchParams.get("origin");
    const CORS = { "Access-Control-Allow-Origin": "*" };
    const cur = JSON.parse(await HARZ_BROWSER.get("gather-queue") || "[]");
    if (!d)
      return Response.json({ ok: true, queue: cur, count: cur.length }, { headers: CORS });
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(d) || d.length > 100)
      return Response.json({ ok: false, error: "invalid domain" }, { status: 400, headers: CORS });
    if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.)/.test(d))
      return Response.json({ ok: false, error: "private host" }, { status: 400, headers: CORS });
    var gate = gateDomain(d);
    if (!gate.ok) {
      try { var glog = JSON.parse(await HARZ_BROWSER.get("gather-gate-log") || "[]"); glog.push({ d: d, reason: gate.reason, ts: new Date().toISOString() }); if (glog.length > 200) glog = glog.slice(-200); await HARZ_BROWSER.put("gather-gate-log", JSON.stringify(glog)); } catch (e2) {}
      return Response.json({ ok: false, error: "queue gate: " + gate.reason, domain: d, gate: "corpus-eligibility-v1" }, { status: 403, headers: CORS });
    }
    const norm = /* @__PURE__ */ __name((s) => s.replace(/^www\./, ""), "norm");
    const sources = JSON.parse(await HARZ_BROWSER.get("gather-sources") || "[]").map(norm);
    if (sources.includes(norm(d)))
      return Response.json({ ok: true, already: true, queued: null, status: d + " is already a nightly library source \u2014 the waves gather it regularly, no request needed" }, { headers: CORS });
    if (cur.includes(d)) return Response.json({ ok: true, queued: d, status: "already queued", position: cur.indexOf(d) + 1, headers: CORS });
    if (cur.length >= 2e4) return Response.json({ ok: false, error: "queue full, try tomorrow" }, { status: 429, headers: CORS });
    let position = 0, total = 0;
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 150 + Math.floor(Math.random() * 450)));
      const q = JSON.parse(await HARZ_BROWSER.get("gather-queue") || "[]");
      const cleaned = Array.from(new Set(q));
      if (cleaned.includes(d)) {
        position = cleaned.indexOf(d) + 1;
        total = cleaned.length;
        break;
      }
      if (cleaned.length >= 2e4) return Response.json({ ok: false, error: "queue full, try tomorrow" }, { status: 429, headers: CORS });
      cleaned.push(d);
      await HARZ_BROWSER.put("gather-queue", JSON.stringify(cleaned));
      await new Promise((r) => setTimeout(r, 120));
      const verify = JSON.parse(await HARZ_BROWSER.get("gather-queue") || "[]");
      if (verify.includes(d)) {
        position = verify.indexOf(d) + 1;
        total = verify.length;
        break;
      }
      if (attempt === 4) {
        position = cleaned.length;
        total = cleaned.length;
      }
    }
    return Response.json({ ok: true, queued: d, status: "queued \u2014 the wave gathers it (waves run every 3h)", position, total }, { headers: CORS });
  }
  __name(gatherRequest, "gatherRequest");
  function swJs() {
    const body = "const CACHE='harz-browser-v2';\nasync function sealSync(c){\ntry{\nconst h=await fetch('/',{method:'HEAD'});\nconst fresh=h.headers.get('x-harz-seal');\nif(!fresh)return;\nconst m=await c.match('/__seal');\nconst stored=m?await m.text():'';\nif(fresh===stored)return;\nconst r=await fetch('/');\nif(r&&r.status===200){\nawait c.put('/',r.clone());\nawait c.put('/__seal',new Response(fresh));\n}\n}catch(e){}\n}\nself.addEventListener('install',e=>{e.waitUntil((async()=>{\nconst c=await caches.open(CACHE);\nconst r=await fetch('/');\nif(r&&r.status===200){\nawait c.put('/',r.clone());\nconst f=r.headers.get('x-harz-seal');\nif(f)await c.put('/__seal',new Response(f));\n}\n})().then(()=>self.skipWaiting()))});\nself.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>k.delete(k)))).then(()=>self.clients.claim()))});\nself.addEventListener('fetch',e=>{const u=new URL(e.request.url);\nif(u.origin===location.origin&&u.pathname==='/'&&e.request.method==='GET'){e.respondWith(caches.open(CACHE).then(async c=>{const m=await c.match('/');sealSync(c);return m||fetch(e.request);}))}});";
    return new Response(body, { headers: { "content-type": "application/javascript" } });
  }
  __name(swJs, "swJs");
  function manifestJson() {
    const m = { "name": "HARZ Offline Reader", "short_name": "HARZ Offline Reader", "description": "The HARZ offline library \u2014 thousands of gathered pages, opens with no internet after first visit", "start_url": "/", "display": "standalone", "background_color": "#f0f2f5", "theme_color": "#f0f2f5", "orientation": "portrait", "icons": [{ "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }] };
    return new Response(JSON.stringify(m), { headers: { "content-type": "application/json" } });
  }
  __name(manifestJson, "manifestJson");
  function iconSvg() {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#1877f2"/><text x="50" y="68" font-size="52" font-family="Arial" font-weight="bold" fill="#fff" text-anchor="middle">H</text></svg>';
    return new Response(svg, { headers: { "content-type": "image/svg+xml" } });
  }
  __name(iconSvg, "iconSvg");
  globalThis.__HB_HANDLE = handle;
})();
//# sourceMappingURL=index.js.map

export default { fetch: (request, env) => { globalThis.HARZ_BROWSER = env.HARZ_BROWSER; return globalThis.__HB_HANDLE(request); } };
