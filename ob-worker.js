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
    if (p === "/fx" || p === "/fx/") return fxPage();
    if (p === "/fx-api") return fxApi(req, new URL(req.url));
    if (p === "/fx-doc") return fxDoc(new URL(req.url));
    if (p === "/icon.svg") return iconSvg();
    if (p === "/volumes") return volumesPage();
    if (p === "/vol/manifest.json") return volManifest();
    if (p === "/vol/engine.js") return volAsset("engine");
    if (p === "/vol/core.js") return volAsset("core");
    if (p === "/vol/app.js") return volAsset("app");
    if (p.startsWith("/vol/vol-")) return volServe(p);
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
    const body = "const CACHE='harz-browser-v2',VOLCACHE='harz-volumes-v3';\n" +
      "async function sealSync(c){\n" +
      "try{\n" +
      "const h=await fetch('/',{method:'HEAD'});\n" +
      "const fresh=h.headers.get('x-harz-seal');\n" +
      "if(!fresh)return;\n" +
      "const m=await c.match('/__seal');\n" +
      "const stored=m?await m.text():'';\n" +
      "if(fresh===stored)return;\n" +
      "const r=await fetch('/');\n" +
      "if(r&&r.status===200){\n" +
      "await c.put('/',r.clone());\n" +
      "await c.put('/__seal',new Response(fresh));\n" +
      "}\n" +
      "}catch(e){}\n" +
      "}\n" +
      "async function volRefresh(c,req){\n" +
      "try{const r=await fetch(req);if(r&&r.status===200)await c.put(req,r.clone());}catch(e){}\n" +
      "}\n" +
      "self.addEventListener('install',e=>{e.waitUntil((async()=>{\n" +
      "const c=await caches.open(CACHE);\n" +
      "const r=await fetch('/');\n" +
      "if(r&&r.status===200){\n" +
      "await c.put('/',r.clone());\n" +
      "const f=r.headers.get('x-harz-seal');\n" +
      "if(f)await c.put('/__seal',new Response(f));\n" +
      "}\n" +
      "try{const c2=await caches.open(VOLCACHE);const v=await fetch('/volumes');if(v&&v.status===200)await c2.put('/volumes',v.clone());}catch(e){}\n" +
      "})().then(()=>self.skipWaiting()))});\n" +
      "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==VOLCACHE).map(k=>k.delete(k)))).then(()=>self.clients.claim()))});\n" +
      "self.addEventListener('fetch',e=>{const u=new URL(e.request.url);\n" +
      "if(u.origin!==location.origin||e.request.method!=='GET')return;\n" +
      "if(u.pathname==='/'){e.respondWith(caches.open(CACHE).then(async c=>{const m=await c.match('/');sealSync(c);return m||fetch(e.request);}));}\n" +
      "else if(u.pathname==='/volumes'||u.pathname.indexOf('/vol/')===0){e.respondWith((async()=>{\n" +
      "const c=await caches.open(VOLCACHE);\n" +
      "const m=await c.match(e.request);\n" +
      "if(m){volRefresh(c,e.request);return m;}\n" +
      "const r=await fetch(e.request);\n" +
      "if(r&&r.status===200)await c.put(e.request,r.clone());\n" +
      "return r;\n" +
      "})());}\n" +
      "});";
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


  var VOL_ASSETS = { engine: "Ly8gSEFSWiBTRUFSQ0ggdjAuMSDigJQgUG9ydGFibGUgRW5naW5lIChwdXJlIEpTLCB6ZXJvIGRlcGVuZGVuY2llcykKLy8gV29ya3MgaW4gTm9kZSwgRGVubywgQ2xvdWRmbGFyZSBXb3JrZXJzLiBPbmUgc3RhdGUsIG1hbnkgdHJhbnNwb3J0cy4KLy8gU3RlcHMgMyAoc3RvcmUpLCA0IChpbnZlcnRlZCBpbmRleCksIDUgKEJNMjUpLCA4IChkaWdlc3QvZXhwb3J0L2ltcG9ydCkuCiJ1c2Ugc3RyaWN0IjsKCnZhciBTVE9QID0gbmV3IFNldCgoImEgYW4gdGhlIG9mIGluIG9uIGZvciB0byBhbmQgb3IgaXMgYXJlIHdhcyB3ZXJlIGJlIGJlZW4gd2l0aCBhcyBhdCBieSBmcm9tIHRoaXMgdGhhdCBpdCBpdHMgd2lsbCBjYW4gaGFzIGhhdmUgbm90IGJ1dCBpZiB5b3UgeW91ciB3ZSB0aGV5IGhlIHNoZSBpIHVzIHRoZW0gdGhlcmUgaGVyZSBkbyBkb2VzIGRpZCIuc3BsaXQoIiAiKSkpOwoKZnVuY3Rpb24gdG9rZW5pemUodGV4dCkgewogIGlmICghdGV4dCkgcmV0dXJuIFtdOwogIHZhciBvdXQgPSBbXSwgbSA9IFN0cmluZyh0ZXh0KS50b0xvd2VyQ2FzZSgpLm1hdGNoKC9bYS16MC05XVthLXowLTknLV17MSwzMH0vZykgfHwgW107CiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtLmxlbmd0aDsgaSsrKSB7CiAgICB2YXIgdCA9IG1baV0ucmVwbGFjZSgvWyctXS9nLCAiIik7CiAgICBpZiAodC5sZW5ndGggPj0gMiAmJiAhU1RPUC5oYXModCkpIG91dC5wdXNoKHQpOwogIH0KICByZXR1cm4gb3V0Owp9CgovLyAtLS0tIEludmVydGVkIGluZGV4IC0tLS0KZnVuY3Rpb24gYnVpbGRJbmRleChkb2NzKSB7CiAgdmFyIHRlcm1zID0gT2JqZWN0LmNyZWF0ZShudWxsKSwgZG9jTGVucyA9IHt9LCBOID0gZG9jcy5sZW5ndGgsIHRvdGFsTGVuID0gMDsKICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykgewogICAgdmFyIGQgPSBkb2NzW2ldOwogICAgdmFyIHRva3MgPSB0b2tlbml6ZShkLnRpdGxlKS5jb25jYXQodG9rZW5pemUoZC50ZXh0KSk7CiAgICB2YXIgdGYgPSBPYmplY3QuY3JlYXRlKG51bGwpOwogICAgZm9yICh2YXIgaiA9IDA7IGogPCB0b2tzLmxlbmd0aDsgaisrKSB0Zlt0b2tzW2pdXSA9ICh0Zlt0b2tzW2pdXSB8fCAwKSArIDE7CiAgICBkb2NMZW5zW2QuaWRdID0gdG9rcy5sZW5ndGg7CiAgICB0b3RhbExlbiArPSB0b2tzLmxlbmd0aDsKICAgIGZvciAodmFyIHRlcm0gaW4gdGYpIHsKICAgICAgaWYgKCF0ZXJtc1t0ZXJtXSkgdGVybXNbdGVybV0gPSB7IGRmOiAwLCBwb3N0aW5nczogW10gfTsKICAgICAgdGVybXNbdGVybV0uZGYrKzsKICAgICAgdGVybXNbdGVybV0ucG9zdGluZ3MucHVzaChbZC5pZCwgdGZbdGVybV1dKTsKICAgIH0KICB9CiAgcmV0dXJuIHsgdGVybXM6IHRlcm1zLCBkb2NMZW5zOiBkb2NMZW5zLCBOOiBOLCBhdmdkbDogTiA/IHRvdGFsTGVuIC8gTiA6IDAgfTsKfQoKLy8gLS0tLSBCTTI1IHJhbmtpbmcgKyB0aXRsZSBib251cyAtLS0tCmZ1bmN0aW9uIHNlYXJjaChpbmRleCwgZG9jcywgcXVlcnksIGxpbWl0KSB7CiAgbGltaXQgPSBsaW1pdCB8fCAxMDsKICB2YXIgazEgPSAxLjIsIGIgPSAwLjc1LCBOID0gaW5kZXguTiwgYXZnZGwgPSBpbmRleC5hdmdkbCB8fCAxOwogIHZhciBxdG9rcyA9IHRva2VuaXplKHF1ZXJ5KTsKICBpZiAoIXF0b2tzLmxlbmd0aCkgcmV0dXJuIHsgcmVzdWx0czogW10sIHRvdGFsOiAwIH07CiAgdmFyIHFzZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpOwogIGZvciAodmFyIHEgPSAwOyBxIDwgcXRva3MubGVuZ3RoOyBxKyspIHFzZXRbcXRva3NbcV1dID0gdHJ1ZTsKICB2YXIgc2NvcmVzID0gT2JqZWN0LmNyZWF0ZShudWxsKSwgbWF0Y2hlZCA9IE9iamVjdC5jcmVhdGUobnVsbCk7CiAgZm9yICh2YXIgcWkgPSAwOyBxaSA8IHF0b2tzLmxlbmd0aDsgcWkrKykgewogICAgdmFyIHRlcm0gPSBxdG9rc1txaV07CiAgICB2YXIgZSA9IGluZGV4LnRlcm1zW3Rlcm1dOwogICAgaWYgKCFlKSBjb250aW51ZTsKICAgIHZhciBpZGYgPSBNYXRoLmxvZygxICsgKE4gLSBlLmRmICsgMC41KSAvIChlLmRmICsgMC41KSk7CiAgICBmb3IgKHZhciBwID0gMDsgcCA8IGUucG9zdGluZ3MubGVuZ3RoOyBwKyspIHsKICAgICAgdmFyIGlkID0gZS5wb3N0aW5nc1twXVswXSwgdGYgPSBlLnBvc3RpbmdzW3BdWzFdOwogICAgICB2YXIgZGwgPSBpbmRleC5kb2NMZW5zW2lkXSB8fCBhdmdkbDsKICAgICAgdmFyIHMgPSBpZGYgKiB0ZiAqIChrMSArIDEpIC8gKHRmICsgazEgKiAoMSAtIGIgKyBiICogZGwgLyBhdmdkbCkpOwogICAgICBzY29yZXNbaWRdID0gKHNjb3Jlc1tpZF0gfHwgMCkgKyBzOwogICAgICBtYXRjaGVkW2lkXSA9IChtYXRjaGVkW2lkXSB8fCAwKSArIDE7CiAgICB9CiAgfQogIC8vIHRpdGxlLW1hdGNoIGJvbnVzOiB0ZXJtIHByZXNlbnQgaW4gZG9jdW1lbnQgdGl0bGUKICBmb3IgKHZhciBkaSA9IDA7IGRpIDwgZG9jcy5sZW5ndGg7IGRpKyspIHsKICAgIHZhciBkID0gZG9jc1tkaV07CiAgICBpZiAoc2NvcmVzW2QuaWRdID09PSB1bmRlZmluZWQpIGNvbnRpbnVlOwogICAgdmFyIHR0ID0gdG9rZW5pemUoZC50aXRsZSksIGhpdCA9IDA7CiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHR0Lmxlbmd0aDsgdCsrKSBpZiAocXNldFt0dFt0XV0pIGhpdCsrOwogICAgaWYgKGhpdCkgc2NvcmVzW2QuaWRdICs9IDEuMCAqIChoaXQgLyBNYXRoLm1heCgxLCBxdG9rcy5sZW5ndGgpKSAqIChNYXRoLmxvZyhOICsgMSkpOwogIH0KICB2YXIgcmFua2VkID0gW107CiAgZm9yICh2YXIgc2lkIGluIHNjb3JlcykgcmFua2VkLnB1c2goW051bWJlcihzaWQpLCBzY29yZXNbc2lkXSwgbWF0Y2hlZFtzaWRdXSk7CiAgcmFua2VkLnNvcnQoZnVuY3Rpb24gKGEsIGMpIHsgcmV0dXJuIGNbMV0gLSBhWzFdIHx8IChjWzJdIC0gYVsyXSk7IH0pOwogIHZhciBieUlkID0gT2JqZWN0LmNyZWF0ZShudWxsKTsKICBmb3IgKHZhciB4ID0gMDsgeCA8IGRvY3MubGVuZ3RoOyB4KyspIGJ5SWRbZG9jc1t4XS5pZF0gPSBkb2NzW3hdOwogIHZhciByZXN1bHRzID0gW107CiAgZm9yICh2YXIgciA9IDA7IHIgPCBNYXRoLm1pbihyYW5rZWQubGVuZ3RoLCBsaW1pdCk7IHIrKykgewogICAgdmFyIGRvYyA9IGJ5SWRbcmFua2VkW3JdWzBdXTsKICAgIGlmICghZG9jKSBjb250aW51ZTsKICAgIHJlc3VsdHMucHVzaCh7CiAgICAgIGlkOiBkb2MuaWQsIHRpdGxlOiBkb2MudGl0bGUsIHVybDogZG9jLnVybCwgZG9tYWluOiBkb2MuZG9tYWluLAogICAgICBzbmlwcGV0OiBzbmlwcGV0KGRvYy50ZXh0LCBxdG9rcyksIHNjb3JlOiBNYXRoLnJvdW5kKHJhbmtlZFtyXVsxXSAqIDEwMCkgLyAxMDAsCiAgICAgIHNvdXJjZTogZG9jLnNvdXJjZSwgbGFuZ3VhZ2U6IGRvYy5sYW5ndWFnZQogICAgfSk7CiAgfQogIHJldHVybiB7IHJlc3VsdHM6IHJlc3VsdHMsIHRvdGFsOiByYW5rZWQubGVuZ3RoIH07Cn0KCmZ1bmN0aW9uIHNuaXBwZXQodGV4dCwgdGVybXMsIGxlbikgewogIGxlbiA9IGxlbiB8fCAxNzA7CiAgaWYgKCF0ZXh0KSByZXR1cm4gIiI7CiAgdmFyIGxvdyA9IHRleHQudG9Mb3dlckNhc2UoKSwgcG9zID0gLTEsIHQgPSAiIjsKICBmb3IgKHZhciBpID0gMDsgaSA8IHRlcm1zLmxlbmd0aDsgaSsrKSB7CiAgICBwb3MgPSBsb3cuaW5kZXhPZih0ZXJtc1tpXSk7CiAgICBpZiAocG9zID4gLTEpIHsgdCA9IHRlcm1zW2ldOyBicmVhazsgfQogIH0KICBpZiAocG9zIDwgMCkgcmV0dXJuIHRleHQuc2xpY2UoMCwgbGVuKSArICh0ZXh0Lmxlbmd0aCA+IGxlbiA/ICLigKYiIDogIiIpOwogIHZhciBzdGFydCA9IE1hdGgubWF4KDAsIHBvcyAtIDYwKTsKICByZXR1cm4gKHN0YXJ0ID4gMCA/ICLigKYiIDogIiIpICsgdGV4dC5zbGljZShzdGFydCwgc3RhcnQgKyBsZW4pICsgKHN0YXJ0ICsgbGVuIDwgdGV4dC5sZW5ndGggPyAi4oCmIiA6ICIiKTsKfQoKLy8gLS0tLSBEZXRlcm1pbmlzdGljIGRpZ2VzdCAoY2Fub25pY2FsIHNlcmlhbGl6YXRpb24g4oaSIHNoYTI1NiBoZXgpIC0tLS0KLy8gU2FtZSBjb3JwdXMgb24gYW55IG5vZGUgbXVzdCBwcm9kdWNlIHRoZSBpZGVudGljYWwgZGlnZXN0LgpmdW5jdGlvbiBjYW5vbmljYWxJbmRleFN0cmluZyhpbmRleCwgZG9jcykgewogIHZhciBkb2NIYXNoZXMgPSBkb2NzLnNsaWNlKCkuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS5pZCAtIGIuaWQ7IH0pCiAgICAubWFwKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLmlkICsgIjoiICsgZC5jb250ZW50X2hhc2g7IH0pLmpvaW4oInwiKTsKICB2YXIgdGVybXMgPSBPYmplY3Qua2V5cyhpbmRleC50ZXJtcykuc29ydCgpOwogIHZhciBwYXJ0cyA9IFtdOwogIGZvciAodmFyIGkgPSAwOyBpIDwgdGVybXMubGVuZ3RoOyBpKyspIHsKICAgIHZhciBlID0gaW5kZXgudGVybXNbdGVybXNbaV1dOwogICAgdmFyIHBvc3RpbmdzID0gZS5wb3N0aW5ncy5zbGljZSgpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGFbMF0gLSBiWzBdOyB9KQogICAgICAubWFwKGZ1bmN0aW9uIChwKSB7IHJldHVybiBwWzBdICsgIjoiICsgcFsxXTsgfSkuam9pbigiLCIpOwogICAgcGFydHMucHVzaCh0ZXJtc1tpXSArICI6IiArIGUuZGYgKyAiOiIgKyBwb3N0aW5ncyk7CiAgfQogIHJldHVybiAiSEFSWlNFQVJDSHYwLjF8Tj0iICsgaW5kZXguTiArICJ8RE9DUz0iICsgZG9jSGFzaGVzICsgInxURVJNUz0iICsgcGFydHMuam9pbigifCIpOwp9CgpmdW5jdGlvbiBzaGEyNTZIZXgoc3RyKSB7CiAgLy8gTm9kZSBwYXRoCiAgaWYgKHR5cGVvZiByZXF1aXJlID09PSAiZnVuY3Rpb24iICYmIHR5cGVvZiBtb2R1bGUgIT09ICJ1bmRlZmluZWQiKSB7CiAgICB0cnkgeyByZXR1cm4gcmVxdWlyZSgiY3J5cHRvIikuY3JlYXRlSGFzaCgic2hhMjU2IikudXBkYXRlKHN0cikuZGlnZXN0KCJoZXgiKTsgfSBjYXRjaCAoZSkge30KICB9CiAgLy8gV29ya2Vycy9EZW5vIHBhdGggKFdlYkNyeXB0bykKICB0aHJvdyBuZXcgRXJyb3IoImFzeW5jLWRpZ2VzdCIpOyAvLyBjYWxsZXJzIHVzZSBkaWdlc3RBc3luYyBpbiBub24tTm9kZSBydW50aW1lcwp9CgpmdW5jdGlvbiBkaWdlc3RBc3luYyhpbmRleCwgZG9jcykgewogIHZhciBjYW5vbmljYWwgPSBjYW5vbmljYWxJbmRleFN0cmluZyhpbmRleCwgZG9jcyk7CiAgdmFyIHRlID0gbmV3IFRleHRFbmNvZGVyKCk7CiAgaWYgKHR5cGVvZiBjcnlwdG8gIT09ICJ1bmRlZmluZWQiICYmIGNyeXB0by5zdWJ0bGUpIHsKICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRpZ2VzdCgiU0hBLTI1NiIsIHRlLmVuY29kZShjYW5vbmljYWwpKS50aGVuKGZ1bmN0aW9uIChidWYpIHsKICAgICAgdmFyIGggPSAiIiwgdiA9IG5ldyBVaW50OEFycmF5KGJ1Zik7CiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdi5sZW5ndGg7IGkrKykgaCArPSB2W2ldLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAiMCIpOwogICAgICByZXR1cm4geyBkaWdlc3Q6IGgsIGNhbm9uaWNhbF9ieXRlczogY2Fub25pY2FsLmxlbmd0aCB9OwogICAgfSk7CiAgfQogIHZhciBjID0gcmVxdWlyZSgiY3J5cHRvIik7CiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IGRpZ2VzdDogYy5jcmVhdGVIYXNoKCJzaGEyNTYiKS51cGRhdGUoY2Fub25pY2FsKS5kaWdlc3QoImhleCIpLCBjYW5vbmljYWxfYnl0ZXM6IGNhbm9uaWNhbC5sZW5ndGggfSk7Cn0KCi8vIC0tLS0gU3RhdHMgLS0tLQpmdW5jdGlvbiBzdGF0cyhpbmRleCwgZG9jcywgY3Jhd2xNZXRhKSB7CiAgdmFyIGRvbWFpbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOwogIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jcy5sZW5ndGg7IGkrKykgZG9tYWluc1tkb2NzW2ldLmRvbWFpbl0gPSAoZG9tYWluc1tkb2NzW2ldLmRvbWFpbl0gfHwgMCkgKyAxOwogIHJldHVybiB7CiAgICBkb2N1bWVudHM6IGluZGV4Lk4sCiAgICBkb21haW5zOiBPYmplY3Qua2V5cyhkb21haW5zKS5sZW5ndGgsCiAgICB1bmlxdWVfdGVybXM6IE9iamVjdC5rZXlzKGluZGV4LnRlcm1zKS5sZW5ndGgsCiAgICBwZXJfZG9tYWluOiBkb21haW5zLAogICAgbGFzdF9jcmF3bDogY3Jhd2xNZXRhID8gY3Jhd2xNZXRhLmxhc3RfY3Jhd2wgOiBudWxsLAogICAgZW5naW5lOiAiQk0yNSB2MC4xIChrMT0xLjIsIGI9MC43NSkgKyB0aXRsZSBib251cyIKICB9Owp9CgovLyAtLS0tIEV4cG9ydCAvIEltcG9ydCAocG9ydGFibGUgYXJ0aWZhY3QpIC0tLS0KZnVuY3Rpb24gZXhwb3J0SW5kZXgoaW5kZXgsIGRvY3MsIGNyYXdsTWV0YSkgewogIHZhciBwYXlsb2FkID0gewogICAgZm9ybWF0OiAiSEFSWlNFQVJDSC1JTkRFWCIsCiAgICB2ZXJzaW9uOiAiMC4xIiwKICAgIGV4cG9ydGVkX2F0OiBjcmF3bE1ldGEgPyBjcmF3bE1ldGEuZXhwb3J0ZWRfYXQgOiBudWxsLAogICAgY3Jhd2w6IHsgbGFzdF9jcmF3bDogY3Jhd2xNZXRhID8gY3Jhd2xNZXRhLmxhc3RfY3Jhd2wgOiBudWxsIH0sCiAgICBkb2N1bWVudHM6IGRvY3MsCiAgICBpbmRleDogewogICAgICBOOiBpbmRleC5OLCBhdmdkbDogaW5kZXguYXZnZGwsIGRvY0xlbnM6IGluZGV4LmRvY0xlbnMsCiAgICAgIHRlcm1zOiBpbmRleC50ZXJtcwogICAgfQogIH07CiAgcmV0dXJuIHBheWxvYWQ7Cn0KCmZ1bmN0aW9uIGltcG9ydEluZGV4KHBheWxvYWQpIHsKICBpZiAoIXBheWxvYWQgfHwgcGF5bG9hZC5mb3JtYXQgIT09ICJIQVJaU0VBUkNILUlOREVYIikgdGhyb3cgbmV3IEVycm9yKCJCQUQgRk9STUFUIik7CiAgdmFyIGRvY3MgPSBwYXlsb2FkLmRvY3VtZW50czsKICAvLyBSZWJ1aWxkIHRoZSBpbmRleCBGUk9NIFRIRSBET0NVTUVOVFMg4oCUIHByb3ZpbmcgZGV0ZXJtaW5pc20gb24gdGhlIGltcG9ydGluZyBub2RlCiAgdmFyIHJlYnVpbHQgPSBidWlsZEluZGV4KGRvY3MpOwogIHJldHVybiB7IGluZGV4OiByZWJ1aWx0LCBkb2NzOiBkb2NzLCBtZXRhOiBwYXlsb2FkLmNyYXdsIH07Cn0KCmlmICh0eXBlb2YgbW9kdWxlICE9PSAidW5kZWZpbmVkIiAmJiBtb2R1bGUuZXhwb3J0cykgewogIG1vZHVsZS5leHBvcnRzID0geyB0b2tlbml6ZTogdG9rZW5pemUsIGJ1aWxkSW5kZXg6IGJ1aWxkSW5kZXgsIHNlYXJjaDogc2VhcmNoLCBzbmlwcGV0OiBzbmlwcGV0LAogICAgZGlnZXN0QXN5bmM6IGRpZ2VzdEFzeW5jLCBjYW5vbmljYWxJbmRleFN0cmluZzogY2Fub25pY2FsSW5kZXhTdHJpbmcsIHN0YXRzOiBzdGF0cywKICAgIGV4cG9ydEluZGV4OiBleHBvcnRJbmRleCwgaW1wb3J0SW5kZXg6IGltcG9ydEluZGV4IH07Cn0K", core: "Ly8gSEFSWiBTRUFSQ0ggdjAuMS4xIOKAlCBGUk9aRU4gU0VBUkNIIENPTlRSQUNUIChzZWFyY2gtY29yZS5qcykKLy8gT05FIGVuZ2luZSwgbWFueSBub2Rlcy4gQm90aCBOb2RlIEEgKHNhbmRib3gpIGFuZCBOb2RlIEIgKENsb3VkZmxhcmUgV29ya2VyKQovLyBidW5kbGUgdGhpcyBleGFjdCBmaWxlLiBTYW1lIGNvcnB1cyArIHNhbWUgcXVlcnkgPSBieXRlLWlkZW50aWNhbCByZXN1bHRzLgovLwovLyBGUk9aRU4gTEFXUyAodjAuMS4xIOKAlCBjaGFuZ2luZyBhbnkgb2YgdGhlc2UgY2hhbmdlcyB0aGUgY29udHJhY3QgdmVyc2lvbik6Ci8vICBMMSBUb2tlbml6ZXI6IGxvd2VyY2FzZTsgdG9rZW5zIG1hdGNoIC9bYS16MC05XVthLXowLTknLV17MSwzMH0vZzsKLy8gICAgIHN0cmlwICctJyBhbmQgJycnOyBtaW4gbGVuZ3RoIDI7IHN0b3B3b3JkIGxpc3QgYmVsb3cuIE5vIHN0ZW1taW5nLgovLyAgTDIgUXVlcnk6IHRva2VuaXplIG9uY2UsIGRlZHVwZSBwcmVzZXJ2aW5nIGZpcnN0LW9jY3VycmVuY2Ugb3JkZXIuCi8vICBMMyBNYXRjaGluZzogQU5EIOKAlCBldmVyeSBxdWVyeSB0b2tlbiBtdXN0IGFwcGVhciBpbiB0aGUgZG9jJ3MKLy8gICAgICh0aXRsZStib2R5KSBwb3N0aW5ncy4gQW55IHVua25vd24gdG9rZW4gPT4gemVybyByZXN1bHRzLgovLyAgTDQgQk0yNTogazE9MS4yLCBiPTAuNzUsIGlkZiA9IGxuKDEgKyAoTiAtIGRmICsgMC41KS8oZGYgKyAwLjUpKSwKLy8gICAgIGRsID0gZG9jIHRva2VuIGNvdW50ICh0aXRsZStib2R5KSwgYXZnZGwgPSBtZWFuIGRvYyBsZW5ndGguCi8vICAgICBBY2N1bXVsYXRpb24gb3JkZXI6IHRlcm1zIGluIHF1ZXJ5IG9yZGVyLCBwb3N0aW5ncyBhc2NlbmRpbmcgYnkgZG9jIGlkCi8vICAgICAoZmxvYXRpbmctcG9pbnQgZGV0ZXJtaW5pc20gcmVxdWlyZXMgaWRlbnRpY2FsIGFkZGl0aW9uIG9yZGVyKS4KLy8gIEw1IFRpdGxlIGJvbnVzOiBoaXQgPSBjb3VudCBvZiB0aXRsZS10b2tlbiBvY2N1cnJlbmNlcyBwcmVzZW50IGluIHRoZQovLyAgICAgcXVlcnkgc2V0OyBzY29yZSArPSAoaGl0IC8gblF1ZXJ5VG9rZW5zKSAqIGxuKE4gKyAxKS4KLy8gIEw2IE9yZGVyaW5nOiBzY29yZSBERVNDLCB0aGVuIG1hdGNoZWQtdGVybS1jb3VudCBERVNDLCB0aGVuIGRvYyBpZCBBU0MuCi8vICBMNyBTY29yZTogcm91bmRlZCB0byAyIGRlY2ltYWxzLgovLyAgTDggU25pcHBldDogY29tcHV0ZWQgb3ZlciB0aGUgRklSU1QgMjAwMCBjaGFycyBvZiBzdG9yZWQgdGV4dDsgd2luZG93IDE3MDsKLy8gICAgIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW55IHF1ZXJ5IHRva2VuIChxdWVyeSBvcmRlcik7ICfigKYnIG1hcmtlcnMuCi8vICBMOSBSZXN1bHQgc2hhcGUgKGtleSBvcmRlciBmcm96ZW4pOiB7aWQsdGl0bGUsdXJsLGRvbWFpbixzbmlwcGV0LHNjb3JlLAovLyAgICAgc291cmNlLGxhbmd1YWdlfS4gUmVzcG9uc2U6IHtxdWVyeSxyZXN1bHRzLHRvdGFsLHRvb2tfbXN9OwovLyAgICAgdG9va19tcyBpcyBwZXJmb3JtYW5jZSBtZXRhZGF0YSwgRVhDTFVERUQgZnJvbSB0aGUgZGV0ZXJtaW5pc20gY29udHJhY3QuCi8vICBMMTAgTGltaXQ6IDEyIHJlc3VsdHMuIHRvdGFsID0gbnVtYmVyIG9mIEFORC1tYXRjaGVkIGRvY3MuCi8vCi8vIFR3byBwaGFzZXMgc28gcmVtb3RlIGJhY2tlbmRzIGNhbiBiYXRjaC1mZXRjaCBiZXR3ZWVuIHRoZW06Ci8vICAgcGhhc2UgMSAgcmFua0RvY3ModmlldywgZ2V0VGl0bGUsIHF1ZXJ5KSAtPiB7cmFua2VkOltbaWQsc2NvcmUsbWF0Y2hlZF3igKZdLCB0b3RhbCwgcXRva3N9Ci8vICAgcGhhc2UgMiAgYnVpbGRSZXN1bHRzKGdldE1ldGEsIHF1ZXJ5LCByYW5rZWQpIC0+IHJlc3VsdHNbXQovLyBCb3RoIHBoYXNlcyBydW4gdGhlIGlkZW50aWNhbCBtYXRoIG9uIGV2ZXJ5IG5vZGUuCiJ1c2Ugc3RyaWN0IjsKCnZhciBTVE9QID0gbmV3IFNldCgoImEgYW4gdGhlIG9mIGluIG9uIGZvciB0byBhbmQgb3IgaXMgYXJlIHdhcyB3ZXJlIGJlIGJlZW4gd2l0aCBhcyBhdCBieSBmcm9tIHRoaXMgdGhhdCBpdCBpdHMgd2lsbCBjYW4gaGFzIGhhdmUgbm90IGJ1dCBpZiB5b3UgeW91ciB3ZSB0aGV5IGhlIHNoZSBpIHVzIHRoZW0gdGhlcmUgaGVyZSBkbyBkb2VzIGRpZCIpLnNwbGl0KCIgIikpOwoKZnVuY3Rpb24gdG9rZW5pemUodGV4dCkgewogIGlmICghdGV4dCkgcmV0dXJuIFtdOwogIHZhciBvdXQgPSBbXSwgbSA9IFN0cmluZyh0ZXh0KS50b0xvd2VyQ2FzZSgpLm1hdGNoKC9bYS16MC05XVthLXowLTknLV17MSwzMH0vZykgfHwgW107CiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtLmxlbmd0aDsgaSsrKSB7CiAgICB2YXIgdCA9IG1baV0ucmVwbGFjZSgvWyctXS9nLCAiIik7CiAgICBpZiAodC5sZW5ndGggPj0gMiAmJiAhU1RPUC5oYXModCkpIG91dC5wdXNoKHQpOwogIH0KICByZXR1cm4gb3V0Owp9CgpmdW5jdGlvbiBxdWVyeVRva2VucyhxdWVyeSkgewogIHZhciB0b2tzID0gdG9rZW5pemUocXVlcnkpLCBzZWVuID0gT2JqZWN0LmNyZWF0ZShudWxsKSwgb3V0ID0gW107CiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tzLmxlbmd0aDsgaSsrKSB7CiAgICBpZiAoIXNlZW5bdG9rc1tpXV0pIHsgc2Vlblt0b2tzW2ldXSA9IDE7IG91dC5wdXNoKHRva3NbaV0pOyB9CiAgfQogIHJldHVybiBvdXQ7Cn0KCi8vIHBoYXNlIDEg4oCUIHJhbmtpbmcgKG5lZWRzIG9ubHkgdGVybSBwb3N0aW5ncyArIGRvYyB0aXRsZXMpCi8vIHZpZXcgPSB7IE4sIGF2Z2RsLCBnZXRUZXJtKHRlcm0pIC0+IHtkZiwgcG9zdGluZ3M6W1tpZCx0ZixsZW5dLOKApl19IHwgbnVsbCB9Ci8vIGdldFRpdGxlKGlkKSAtPiBzdHJpbmcgKGJvdGggYmFja2VuZHMgaGF2ZSB0aXRsZXMgY2hlYXApCmZ1bmN0aW9uIHJhbmtEb2NzKHZpZXcsIGdldFRpdGxlLCBxdWVyeSkgewogIHZhciBrMSA9IDEuMiwgYiA9IDAuNzUsIE4gPSB2aWV3Lk4sIGF2Z2RsID0gdmlldy5hdmdkbCB8fCAxOwogIHZhciBxdG9rcyA9IHF1ZXJ5VG9rZW5zKHF1ZXJ5KTsKICBpZiAoIXF0b2tzLmxlbmd0aCkgcmV0dXJuIHsgcmFua2VkOiBbXSwgdG90YWw6IDAsIHF0b2tzOiBxdG9rcyB9OwoKICAvLyBMMyBBTkQgbGF3OiBldmVyeSB0ZXJtIG11c3QgZXhpc3QKICB2YXIgdGVybURhdGEgPSBbXTsKICBmb3IgKHZhciBpID0gMDsgaSA8IHF0b2tzLmxlbmd0aDsgaSsrKSB7CiAgICB2YXIgZSA9IHZpZXcuZ2V0VGVybShxdG9rc1tpXSk7CiAgICBpZiAoIWUgfHwgIWUucG9zdGluZ3MubGVuZ3RoKSByZXR1cm4geyByYW5rZWQ6IFtdLCB0b3RhbDogMCwgcXRva3M6IHF0b2tzIH07CiAgICB0ZXJtRGF0YS5wdXNoKGUpOwogIH0KCiAgdmFyIHNjb3JlcyA9IE9iamVjdC5jcmVhdGUobnVsbCksIG1hdGNoZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpOwogIGZvciAodmFyIHFpID0gMDsgcWkgPCB0ZXJtRGF0YS5sZW5ndGg7IHFpKyspIHsKICAgIHZhciBlbnRyeSA9IHRlcm1EYXRhW3FpXTsKICAgIHZhciBpZGYgPSBNYXRoLmxvZygxICsgKE4gLSBlbnRyeS5kZiArIDAuNSkgLyAoZW50cnkuZGYgKyAwLjUpKTsKICAgIGZvciAodmFyIHAgPSAwOyBwIDwgZW50cnkucG9zdGluZ3MubGVuZ3RoOyBwKyspIHsKICAgICAgdmFyIGlkID0gZW50cnkucG9zdGluZ3NbcF1bMF0sIHRmID0gZW50cnkucG9zdGluZ3NbcF1bMV07CiAgICAgIHZhciBkbCA9IGVudHJ5LnBvc3RpbmdzW3BdWzJdIHx8IGF2Z2RsOwogICAgICB2YXIgcyA9IGlkZiAqIHRmICogKGsxICsgMSkgLyAodGYgKyBrMSAqICgxIC0gYiArIGIgKiBkbCAvIGF2Z2RsKSk7CiAgICAgIHNjb3Jlc1tpZF0gPSAoc2NvcmVzW2lkXSB8fCAwKSArIHM7CiAgICAgIG1hdGNoZWRbaWRdID0gKG1hdGNoZWRbaWRdIHx8IDApICsgMTsKICAgIH0KICB9CgogIHZhciBuZWVkID0gdGVybURhdGEubGVuZ3RoLCBpZHMgPSBbXTsKICBmb3IgKHZhciBzaWQgaW4gc2NvcmVzKSBpZiAobWF0Y2hlZFtzaWRdID09PSBuZWVkKSBpZHMucHVzaChOdW1iZXIoc2lkKSk7CiAgaWYgKCFpZHMubGVuZ3RoKSByZXR1cm4geyByYW5rZWQ6IFtdLCB0b3RhbDogMCwgcXRva3M6IHF0b2tzIH07CiAgaWRzLnNvcnQoZnVuY3Rpb24gKGEsIGMpIHsgcmV0dXJuIGEgLSBjOyB9KTsKCiAgLy8gTDUgdGl0bGUgYm9udXMKICB2YXIgcXNldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7CiAgZm9yICh2YXIgcSA9IDA7IHEgPCBxdG9rcy5sZW5ndGg7IHErKykgcXNldFtxdG9rc1txXV0gPSAxOwogIGZvciAodmFyIGQgPSAwOyBkIDwgaWRzLmxlbmd0aDsgZCsrKSB7CiAgICB2YXIgdGl0bGUgPSBnZXRUaXRsZShpZHNbZF0pOwogICAgaWYgKCF0aXRsZSkgY29udGludWU7CiAgICB2YXIgdHQgPSB0b2tlbml6ZSh0aXRsZSksIGhpdCA9IDA7CiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHR0Lmxlbmd0aDsgdCsrKSBpZiAocXNldFt0dFt0XV0pIGhpdCsrOwogICAgaWYgKGhpdCkgc2NvcmVzW2lkc1tkXV0gKz0gMS4wICogKGhpdCAvIE1hdGgubWF4KDEsIHF0b2tzLmxlbmd0aCkpICogTWF0aC5sb2coTiArIDEpOwogIH0KCiAgLy8gTDYgb3JkZXJpbmcKICB2YXIgcmFua2VkID0gW107CiAgZm9yICh2YXIgciA9IDA7IHIgPCBpZHMubGVuZ3RoOyByKyspIHJhbmtlZC5wdXNoKFtpZHNbcl0sIHNjb3Jlc1tpZHNbcl1dLCBtYXRjaGVkW2lkc1tyXV1dKTsKICByYW5rZWQuc29ydChmdW5jdGlvbiAoYSwgYykgeyByZXR1cm4gY1sxXSAtIGFbMV0gfHwgKGNbMl0gLSBhWzJdKSB8fCAoYVswXSAtIGNbMF0pOyB9KTsKICByZXR1cm4geyByYW5rZWQ6IHJhbmtlZCwgdG90YWw6IGlkcy5sZW5ndGgsIHF0b2tzOiBxdG9rcyB9Owp9CgovLyBwaGFzZSAyIOKAlCBidWlsZCBmcm96ZW4tc2hhcGUgcmVzdWx0cyBmb3IgdGhlIHRvcCBgbGltaXRgCi8vIGdldE1ldGEoaWQpIC0+IHt0aXRsZSx0ZXh0MjAwMCx1cmwsZG9tYWluLHNvdXJjZSxsYW5ndWFnZX0KZnVuY3Rpb24gYnVpbGRSZXN1bHRzKGdldE1ldGEsIHJhbmtlZCwgcXRva3MsIGxpbWl0KSB7CiAgbGltaXQgPSBsaW1pdCB8fCAxMjsKICB2YXIgcmVzdWx0cyA9IFtdOwogIGZvciAodmFyIHggPSAwOyB4IDwgTWF0aC5taW4ocmFua2VkLmxlbmd0aCwgbGltaXQpOyB4KyspIHsKICAgIHZhciBtID0gZ2V0TWV0YShyYW5rZWRbeF1bMF0pOwogICAgaWYgKCFtKSBjb250aW51ZTsKICAgIHJlc3VsdHMucHVzaCh7CiAgICAgIGlkOiByYW5rZWRbeF1bMF0sCiAgICAgIHRpdGxlOiBtLnRpdGxlLAogICAgICB1cmw6IG0udXJsLAogICAgICBkb21haW46IG0uZG9tYWluLAogICAgICBzbmlwcGV0OiBtYWtlU25pcHBldChtLnRleHQyMDAwLCBxdG9rcyksCiAgICAgIHNjb3JlOiBNYXRoLnJvdW5kKHJhbmtlZFt4XVsxXSAqIDEwMCkgLyAxMDAsCiAgICAgIHNvdXJjZTogbS5zb3VyY2UsCiAgICAgIGxhbmd1YWdlOiBtLmxhbmd1YWdlIHx8ICIiCiAgICB9KTsKICB9CiAgcmV0dXJuIHJlc3VsdHM7Cn0KCi8vIEw4IHNuaXBwZXQKZnVuY3Rpb24gbWFrZVNuaXBwZXQodGV4dCwgdGVybXMsIGxlbikgewogIGxlbiA9IGxlbiB8fCAxNzA7CiAgaWYgKCF0ZXh0KSByZXR1cm4gIiI7CiAgdmFyIGxvdyA9IHRleHQudG9Mb3dlckNhc2UoKSwgcG9zID0gLTE7CiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtcy5sZW5ndGg7IGkrKykgewogICAgcG9zID0gbG93LmluZGV4T2YodGVybXNbaV0pOwogICAgaWYgKHBvcyA+IC0xKSBicmVhazsKICB9CiAgaWYgKHBvcyA8IDApIHJldHVybiB0ZXh0LnNsaWNlKDAsIGxlbikgKyAodGV4dC5sZW5ndGggPiBsZW4gPyAi4oCmIiA6ICIiKTsKICB2YXIgc3RhcnQgPSBNYXRoLm1heCgwLCBwb3MgLSA2MCk7CiAgcmV0dXJuIChzdGFydCA+IDAgPyAi4oCmIiA6ICIiKSArIHRleHQuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgbGVuKSArIChzdGFydCArIGxlbiA8IHRleHQubGVuZ3RoID8gIuKApiIgOiAiIik7Cn0KCmlmICh0eXBlb2YgbW9kdWxlICE9PSAidW5kZWZpbmVkIiAmJiBtb2R1bGUuZXhwb3J0cykgewogIG1vZHVsZS5leHBvcnRzID0geyB0b2tlbml6ZTogdG9rZW5pemUsIHF1ZXJ5VG9rZW5zOiBxdWVyeVRva2VucywgcmFua0RvY3M6IHJhbmtEb2NzLCBidWlsZFJlc3VsdHM6IGJ1aWxkUmVzdWx0cywgbWFrZVNuaXBwZXQ6IG1ha2VTbmlwcGV0LCBTVE9QOiBTVE9QIH07Cn0KaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAidW5kZWZpbmVkIikgewogIGdsb2JhbFRoaXMuSGFyelNlYXJjaENvcmUgPSB7IHRva2VuaXplOiB0b2tlbml6ZSwgcXVlcnlUb2tlbnM6IHF1ZXJ5VG9rZW5zLCByYW5rRG9jczogcmFua0RvY3MsIGJ1aWxkUmVzdWx0czogYnVpbGRSZXN1bHRzLCBtYWtlU25pcHBldDogbWFrZVNuaXBwZXQgfTsKfQo=", app: "J3VzZSBzdHJpY3QnOwovLyBIQVJaIFZPTFVNRSBSRUFERVIgdjAuMSDigJQgZmFpbC1jbG9zZWQsIG9mZmxpbmUtZmlyc3QuCi8vIFZlcmlmaWVzIGV2ZXJ5IHNlYWwgYmVmb3JlIGV4ZWN1dGluZyBhbnl0aGluZzsgcmUtdmVyaWZpZXMgZXZlcnkgaW5zdGFsbGVkCi8vIHZvbHVtZSBhdCBldmVyeSBib290LiBObyBuZXR3b3JrIG5lZWRlZCBhZnRlciBmaXJzdCB2aXNpdC4KdmFyIFBJTlMgPSB7CiAgZW5naW5lX3NoYTogJ2Y0NDJhNmE1MmZhODk4MzIxZmZmZWFlM2VjOGE0YzA5ZWVmMDcyNDI1NjAwOWE1MTM2ZThiZTZmMjFjNjM3MzcnLAogIGNvcmVfc2hhOiAnODUzZGMwZmY4YWYzZWI0NWNjNzQ4YmI2NjljNTc4ZTljYTkwNTQwNTgyMzc1YjE0NGRmZTNjZGVlYzk1NDVhMicKfTsKdmFyIE1BTklGRVNUID0gbnVsbCwgSU5TVEFMTEVEID0ge30sIERCID0gbnVsbCwgT0ZGTElORV9CT09UID0gZmFsc2U7CmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfQpmdW5jdGlvbiBlc2MocykgeyByZXR1cm4gU3RyaW5nKHMgPT0gbnVsbCA/ICcnIDogcykucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7Jyk7IH0KZnVuY3Rpb24gc2hhMjU2U3RyKHN0cikgewogIHZhciB0ZSA9IG5ldyBUZXh0RW5jb2RlcigpOwogIHJldHVybiBjcnlwdG8uc3VidGxlLmRpZ2VzdCgnU0hBLTI1NicsIHRlLmVuY29kZShzdHIpKS50aGVuKGZ1bmN0aW9uIChidWYpIHsKICAgIHZhciBoID0gJycsIHYgPSBuZXcgVWludDhBcnJheShidWYpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2Lmxlbmd0aDsgaSsrKSBoICs9IHZbaV0udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJyk7CiAgICByZXR1cm4gaDsKICB9KTsKfQpmdW5jdGlvbiBmYWlsKG1zZykgewogICQoJ2Jvb3RsaXN0JykuaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPSJiYWRnZSBiLWVyciI+RkFJTC1DTE9TRUQ8L3NwYW4+JzsKICB2YXIgZiA9ICQoJ2Jvb3RmYWlsJyk7IGYudGV4dENvbnRlbnQgPSBtc2c7IGYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7CiAgdGhyb3cgbmV3IEVycm9yKG1zZyk7Cn0KZnVuY3Rpb24gc3RlcChtc2csIG9rKSB7CiAgJCgnYm9vdGxpc3QnKS5pbm5lckhUTUwgKz0gJzxkaXYgY2xhc3M9InNlYWwiPicgKyAob2sgPT09IGZhbHNlID8gJ+KclyAnIDogJ+KckyAnKSArIGVzYyhtc2cpICsgJzwvZGl2Pic7Cn0KZnVuY3Rpb24gaWRiT3BlbigpIHsKICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlcywgcmVqKSB7CiAgICB2YXIgcnEgPSBpbmRleGVkREIub3BlbignaGFyei12b2x1bWVzJywgMSk7CiAgICBycS5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbiAoZSkgeyBlLnRhcmdldC5yZXN1bHQuY3JlYXRlT2JqZWN0U3RvcmUoJ3ZvbHMnLCB7IGtleVBhdGg6ICdpZCcgfSk7IH07CiAgICBycS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoZSkgeyBEQiA9IGUudGFyZ2V0LnJlc3VsdDsgcmVzKCk7IH07CiAgICBycS5vbmVycm9yID0gZnVuY3Rpb24gKCkgeyByZWoobmV3IEVycm9yKCdpbmRleGVkREIgdW5hdmFpbGFibGUnKSk7IH07CiAgfSk7Cn0KZnVuY3Rpb24gaWRiR2V0KGlkKSB7CiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXMpIHsKICAgIGlmICghREIpIHJldHVybiByZXMobnVsbCk7CiAgICB2YXIgcnEgPSBEQi50cmFuc2FjdGlvbigndm9scycpLm9iamVjdFN0b3JlKCd2b2xzJykuZ2V0KGlkKTsKICAgIHJxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHsgcmVzKHJxLnJlc3VsdCB8fCBudWxsKTsgfTsKICAgIHJxLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7IHJlcyhudWxsKTsgfTsKICB9KTsKfQpmdW5jdGlvbiBpZGJQdXQocmVjKSB7CiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXMsIHJlaikgewogICAgdmFyIHR4ID0gREIudHJhbnNhY3Rpb24oJ3ZvbHMnLCAncmVhZHdyaXRlJyk7CiAgICB0eC5vYmplY3RTdG9yZSgndm9scycpLnB1dChyZWMpOwogICAgdHgub25jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHsgcmVzKCk7IH07CiAgICB0eC5vbmVycm9yID0gZnVuY3Rpb24gKCkgeyByZWoobmV3IEVycm9yKCdpZGIgd3JpdGUgZmFpbGVkJykpOyB9OwogIH0pOwp9CmZ1bmN0aW9uIGlkYkRlbChpZCkgewogIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzKSB7CiAgICB2YXIgdHggPSBEQi50cmFuc2FjdGlvbigndm9scycsICdyZWFkd3JpdGUnKTsKICAgIHR4Lm9iamVjdFN0b3JlKCd2b2xzJylbJ2RlbGV0ZSddKGlkKTsKICAgIHR4Lm9uY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7IHJlcygpOyB9OwogICAgdHgub25lcnJvciA9IGZ1bmN0aW9uICgpIHsgcmVzKCk7IH07CiAgfSk7Cn0KZnVuY3Rpb24gZXhlY1NjcmlwdCh0ZXh0KSB7CiAgdmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTsKICBzLnRleHRDb250ZW50ID0gdGV4dDsKICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHMpOwp9CmZ1bmN0aW9uIGdldFRleHQodXJsKSB7CiAgcmV0dXJuIGZldGNoKHVybCkudGhlbihmdW5jdGlvbiAocikgewogICAgaWYgKCFyLm9rKSB0aHJvdyBuZXcgRXJyb3IodXJsICsgJyAtPiAnICsgci5zdGF0dXMpOwogICAgcmV0dXJuIHIudGV4dCgpOwogIH0pOwp9CmFzeW5jIGZ1bmN0aW9uIGJvb3QoKSB7CiAgdHJ5IHsKICAgIHZhciBlbmcgPSBhd2FpdCBnZXRUZXh0KCcvdm9sL2VuZ2luZS5qcycpOwogICAgdmFyIGNvcmUgPSBhd2FpdCBnZXRUZXh0KCcvdm9sL2NvcmUuanMnKTsKICAgIHZhciBoMSA9IGF3YWl0IHNoYTI1NlN0cihlbmcpOwogICAgaWYgKGgxICE9PSBQSU5TLmVuZ2luZV9zaGEpIHJldHVybiBmYWlsKCdGQUlMLUNMT1NFRDogZW5naW5lLmpzIHNlYWwgbWlzbWF0Y2guXG5leHBlY3RlZCAnICsgUElOUy5lbmdpbmVfc2hhICsgJ1xuY29tcHV0ZWQgJyArIGgxKTsKICAgIHZhciBoMiA9IGF3YWl0IHNoYTI1NlN0cihjb3JlKTsKICAgIGlmIChoMiAhPT0gUElOUy5jb3JlX3NoYSkgcmV0dXJuIGZhaWwoJ0ZBSUwtQ0xPU0VEOiBzZWFyY2gtY29yZS5qcyBzZWFsIG1pc21hdGNoLlxuZXhwZWN0ZWQgJyArIFBJTlMuY29yZV9zaGEgKyAnXG5jb21wdXRlZCAnICsgaDIpOwogICAgc3RlcCgnZW5naW5lLmpzIHNlYWxlZDogJyArIGgxLnNsaWNlKDAsIDE2KSk7CiAgICBzdGVwKCdzZWFyY2gtY29yZS5qcyBzZWFsZWQ6ICcgKyBoMi5zbGljZSgwLCAxNikpOwogICAgZXhlY1NjcmlwdChlbmcpOyBleGVjU2NyaXB0KGNvcmUpOyAvLyBvbmx5IGFmdGVyIHNlYWwgdmVyaWZpY2F0aW9uIOKAlCBzY3JpcHQgZWxlbWVudHMgcnVuIGluIGdsb2JhbCBzY29wZSBsaWtlIHRoZSBvbmUtZmlsZSBkb2VzCiAgICBhd2FpdCBpZGJPcGVuKCk7CiAgICB2YXIgbWZUZXh0ID0gbnVsbDsKICAgIHRyeSB7IG1mVGV4dCA9IGF3YWl0IGdldFRleHQoJy92b2wvbWFuaWZlc3QuanNvbicpOyBhd2FpdCBpZGJQdXQoeyBpZDogJ21hbmlmZXN0JywgdGV4dDogbWZUZXh0IH0pOyB9CiAgICBjYXRjaCAoZSkgeyBtZlRleHQgPSAoYXdhaXQgaWRiR2V0KCdtYW5pZmVzdCcpIHx8IHt9KS50ZXh0IHx8IG51bGw7IE9GRkxJTkVfQk9PVCA9IHRydWU7IH0KICAgIGlmICghbWZUZXh0KSB7ICQoJ2Jvb3QnKS5pbm5lckhUTUwgKz0gJzxkaXYgY2xhc3M9InNlYWwiPuKckyBubyBtYW5pZmVzdCB5ZXQg4oCUIHZpc2l0IG9ubGluZSBvbmNlPC9kaXY+JzsgcmVuZGVyVm9scygpOyByZXR1cm47IH0KICAgIE1BTklGRVNUID0gSlNPTi5wYXJzZShtZlRleHQpOwogICAgc3RlcCgnbWFuaWZlc3Q6ICcgKyBNQU5JRkVTVC52b2x1bWVzLmxlbmd0aCArICcgdm9sdW1lcycgKyAoT0ZGTElORV9CT09UID8gJyAob2ZmbGluZSBjb3B5KScgOiAnJykpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBNQU5JRkVTVC52b2x1bWVzLmxlbmd0aDsgaSsrKSB7CiAgICAgIHZhciB2ID0gTUFOSUZFU1Qudm9sdW1lc1tpXTsKICAgICAgdmFyIHJlYyA9IGF3YWl0IGlkYkdldCh2LmlkKTsKICAgICAgaWYgKCFyZWMpIGNvbnRpbnVlOwogICAgICB2YXIgaCA9IGF3YWl0IHNoYTI1NlN0cihyZWMudGV4dCk7CiAgICAgIGlmIChoICE9PSB2LnNoYTI1NikgeyBzdGVwKCd2b2wgJyArIHYuaWQgKyAnIHJlLXZlcmlmeSBGQUlMIOKAlCBxdWFyYW50aW5lZCcsIGZhbHNlKTsgYXdhaXQgaWRiRGVsKHYuaWQpOyBjb250aW51ZTsgfQogICAgICB2YXIgaW1wID0gaW1wb3J0SW5kZXgoSlNPTi5wYXJzZShyZWMudGV4dCkpOwogICAgICBJTlNUQUxMRURbdi5pZF0gPSB7IGluZGV4OiBpbXAuaW5kZXgsIGRvY3M6IGltcC5kb2NzLCBzaGE6IHYuc2hhMjU2IH07CiAgICAgIHN0ZXAoJ3ZvbCAnICsgdi5pZCArICcgdmVyaWZpZWQ6ICcgKyB2LmRvY3MgKyAnIGRvY3MsIHNoYSAnICsgdi5zaGEyNTYuc2xpY2UoMCwgMTYpKTsKICAgIH0KICAgIHZhciBuRG9jcyA9IDA7IGZvciAodmFyIGsgaW4gSU5TVEFMTEVEKSBuRG9jcyArPSBJTlNUQUxMRURba10uZG9jcy5sZW5ndGg7CiAgICAkKCdzdGF0cycpLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz0iYmFkZ2UgYi1vayI+U0VBTEVEIOKAlCBBTEwgQ0hFQ0tTIFBBU1NFRDwvc3Bhbj4nICsKICAgICAgJzxzcGFuIGNsYXNzPSJiYWRnZSBiLWluZm8iPicgKyBPYmplY3Qua2V5cyhJTlNUQUxMRUQpLmxlbmd0aCArICcgdm9sdW1lcyBpbnN0YWxsZWQ8L3NwYW4+JyArCiAgICAgICc8c3BhbiBjbGFzcz0iYmFkZ2UgYi1pbmZvIj4nICsgbkRvY3MgKyAnIHBhZ2VzIHNlYXJjaGFibGU8L3NwYW4+JyArCiAgICAgICc8c3BhbiBjbGFzcz0iYmFkZ2UgYi13YXJuIj4nICsgKE9GRkxJTkVfQk9PVCA/ICdPRkZMSU5FIEJPT1Qg4oCUIGluc3RhbGxlZCB2b2x1bWVzIG9ubHknIDogJ09GRkxJTkUtUkVBRFkg4oCUIHZvbHVtZXMgbGl2ZSBpbiB5b3VyIGJyb3dzZXInKSArICc8L3NwYW4+JzsKICAgICQoJ2Jvb3QnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOwogICAgJCgndm9sdmlldycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOwogICAgJCgnc2VhcmNodmlldycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOwogICAgcmVuZGVyVm9scygpOwogIH0gY2F0Y2ggKGUpIHsKICAgIGlmIChTdHJpbmcoZSAmJiBlLm1lc3NhZ2UgfHwgZSkuaW5kZXhPZignRkFJTC1DTE9TRUQnKSA9PT0gLTEpIGZhaWwoJ0ZBSUwtQ0xPU0VEOiBib290IGVycm9yIOKAlCAnICsgU3RyaW5nKGUgJiYgZS5zdGFjayB8fCBlKSk7CiAgfQp9CmZ1bmN0aW9uIHJlbmRlclZvbHMoKSB7CiAgdmFyIGhvc3QgPSAkKCd2b2xzJyk7IGhvc3QuaW5uZXJIVE1MID0gJyc7CiAgdmFyIG5Eb2NzID0gMDsgZm9yICh2YXIgc2sgaW4gSU5TVEFMTEVEKSBuRG9jcyArPSBJTlNUQUxMRURbc2tdLmRvY3MubGVuZ3RoOwogICQoJ3N0YXRzJykuaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPSJiYWRnZSBiLW9rIj5TRUFMRUQg4oCUIEFMTCBDSEVDS1MgUEFTU0VEPC9zcGFuPicgKwogICAgJzxzcGFuIGNsYXNzPSJiYWRnZSBiLWluZm8iPicgKyBPYmplY3Qua2V5cyhJTlNUQUxMRUQpLmxlbmd0aCArICcgdm9sdW1lcyBpbnN0YWxsZWQ8L3NwYW4+JyArCiAgICAnPHNwYW4gY2xhc3M9ImJhZGdlIGItaW5mbyI+JyArIG5Eb2NzICsgJyBwYWdlcyBzZWFyY2hhYmxlPC9zcGFuPicgKwogICAgJzxzcGFuIGNsYXNzPSJiYWRnZSBiLXdhcm4iPicgKyAoT0ZGTElORV9CT09UID8gJ09GRkxJTkUgQk9PVCDigJQgaW5zdGFsbGVkIHZvbHVtZXMgb25seScgOiAnT0ZGTElORS1SRUFEWSDigJQgdm9sdW1lcyBsaXZlIGluIHlvdXIgYnJvd3NlcicpICsgJzwvc3Bhbj4nOwogIHZhciBsaXN0ID0gKE1BTklGRVNUICYmIE1BTklGRVNULnZvbHVtZXMpIHx8IFtdOwogIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykgewogICAgKGZ1bmN0aW9uICh2KSB7CiAgICAgIHZhciBjYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7IGNhcmQuY2xhc3NOYW1lID0gJ3ZjYXJkJzsKICAgICAgdmFyIHN0ID0gSU5TVEFMTEVEW3YuaWRdID8gJzxzcGFuIGNsYXNzPSJiYWRnZSBiLW9rIj5JTlNUQUxMRUQ8L3NwYW4+JyA6ICc8c3BhbiBjbGFzcz0iYmFkZ2UgYi1pbmZvIj5hdmFpbGFibGU8L3NwYW4+JzsKICAgICAgY2FyZC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz0idnRpdGxlIj4nICsgZXNjKHYuaWQpICsgJyAnICsgc3QgKyAnPC9kaXY+JyArCiAgICAgICAgJzxkaXYgY2xhc3M9InZtZXRhIj4nICsgdi5kb2NzICsgJyBwYWdlcyDCtyAnICsgKHYuYnl0ZXMgLyAxZTYpLnRvRml4ZWQoMSkgKyAnIE1CIMK3IHNoYSAnICsgZXNjKHYuc2hhMjU2LnNsaWNlKDAsIDE2KSkgKyAn4oCmPC9kaXY+JzsKICAgICAgdmFyIGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpOwogICAgICBpZiAoSU5TVEFMTEVEW3YuaWRdKSB7CiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ1JlbW92ZSc7IGJ0bi5jbGFzc05hbWUgPSAnc2VjJzsKICAgICAgICBidG4ub25jbGljayA9IGFzeW5jIGZ1bmN0aW9uICgpIHsgYXdhaXQgaWRiRGVsKHYuaWQpOyBkZWxldGUgSU5TVEFMTEVEW3YuaWRdOyByZW5kZXJWb2xzKCk7IH07CiAgICAgIH0gZWxzZSB7CiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0luc3RhbGwnOwogICAgICAgIGJ0bi5vbmNsaWNrID0gZnVuY3Rpb24gKCkgeyBpbnN0YWxsKHYpOyB9OwogICAgICB9CiAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoYnRuKTsgaG9zdC5hcHBlbmRDaGlsZChjYXJkKTsKICAgIH0pKGxpc3RbaV0pOwogIH0KICBpZiAoIWxpc3QubGVuZ3RoKSBob3N0LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPSJ2bWV0YSI+Tm8gdm9sdW1lcyBwdWJsaXNoZWQgeWV0LjwvZGl2Pic7Cn0KYXN5bmMgZnVuY3Rpb24gaW5zdGFsbCh2KSB7CiAgdmFyIG91dCA9ICQoJ3ZvbG1zZycpOyBvdXQudGV4dENvbnRlbnQgPSAnRmV0Y2hpbmcgJyArIHYuaWQgKyAnICgnICsgKHYuYnl0ZXMgLyAxZTYpLnRvRml4ZWQoMSkgKyAnIE1CKeKApic7CiAgdHJ5IHsKICAgIHZhciB0ZXh0ID0gYXdhaXQgZ2V0VGV4dCgnL3ZvbC8nICsgdi5pZCk7CiAgICB2YXIgaCA9IGF3YWl0IHNoYTI1NlN0cih0ZXh0KTsKICAgIGlmIChoICE9PSB2LnNoYTI1NikgcmV0dXJuIGZhaWwoJ0ZBSUwtQ0xPU0VEOiB2b2x1bWUgJyArIHYuaWQgKyAnIHNoYSBtaXNtYXRjaC5cbmV4cGVjdGVkICcgKyB2LnNoYTI1NiArICdcbmNvbXB1dGVkICcgKyBoICsgJyDigJQgcmVmdXNpbmcgdG8gaW5zdGFsbCcpOwogICAgYXdhaXQgaWRiUHV0KHsgaWQ6IHYuaWQsIHRleHQ6IHRleHQgfSk7CiAgICB2YXIgaW1wID0gaW1wb3J0SW5kZXgoSlNPTi5wYXJzZSh0ZXh0KSk7CiAgICBJTlNUQUxMRURbdi5pZF0gPSB7IGluZGV4OiBpbXAuaW5kZXgsIGRvY3M6IGltcC5kb2NzLCBzaGE6IHYuc2hhMjU2IH07CiAgICBvdXQudGV4dENvbnRlbnQgPSB2LmlkICsgJyBpbnN0YWxsZWQgYW5kIHNlYWxlZCDinJMnOwogICAgcmVuZGVyVm9scygpOwogIH0gY2F0Y2ggKGUpIHsgb3V0LnRleHRDb250ZW50ID0gJ0luc3RhbGwgZmFpbGVkOiAnICsgZTsgfQp9CmZ1bmN0aW9uIGRvU2VhcmNoKGUpIHsKICBlLnByZXZlbnREZWZhdWx0KCk7CiAgdmFyIHEgPSAkKCdxJykudmFsdWUudHJpbSgpOwogIHZhciBvdXQgPSAkKCdyZXN1bHRzJyk7IG91dC5pbm5lckhUTUwgPSAnJzsKICBpZiAoIXEpIHJldHVybjsKICB2YXIgbWVyZ2VkID0gW107CiAgZm9yICh2YXIgayBpbiBJTlNUQUxMRUQpIHsKICAgIHZhciByID0gc2VhcmNoKElOU1RBTExFRFtrXS5pbmRleCwgSU5TVEFMTEVEW2tdLmRvY3MsIHEsIDMwKTsKICAgIGZvciAodmFyIGkgPSAwOyBpIDwgci5yZXN1bHRzLmxlbmd0aDsgaSsrKSBtZXJnZWQucHVzaCh7IHJlczogci5yZXN1bHRzW2ldLCB2b2w6IGsgfSk7CiAgfQogIG1lcmdlZC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBiLnJlcy5zY29yZSAtIGEucmVzLnNjb3JlIHx8IGEucmVzLmlkIC0gYi5yZXMuaWQ7IH0pOwogIHZhciB0b3RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOyB0b3RhbC5jbGFzc05hbWUgPSAnY291bnQnOwogIHRvdGFsLnRleHRDb250ZW50ID0gbWVyZ2VkLmxlbmd0aCArICcgcmVzdWx0cyBhY3Jvc3MgJyArIE9iamVjdC5rZXlzKElOU1RBTExFRCkubGVuZ3RoICsgJyB2b2x1bWVzJzsKICBvdXQuYXBwZW5kQ2hpbGQodG90YWwpOwogIGlmICghbWVyZ2VkLmxlbmd0aCkgeyBvdXQuaW5uZXJIVE1MICs9ICc8ZGl2IGNsYXNzPSJ2bWV0YSI+Tm8gcmVzdWx0cy4gSW5zdGFsbCBtb3JlIHZvbHVtZXMuPC9kaXY+JzsgcmV0dXJuOyB9CiAgbWVyZ2VkLnNsaWNlKDAsIDMwKS5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7CiAgICB2YXIgZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOyBkLmNsYXNzTmFtZSA9ICdyZXMnOwogICAgdmFyIHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpOyB0LnRleHRDb250ZW50ID0gbS5yZXMudGl0bGUgfHwgbS5yZXMudXJsOyB0Lm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7IG9wZW5Eb2MobS52b2wsIG0ucmVzLmlkKTsgfTsKICAgIHZhciBtZXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7IG1ldGEuY2xhc3NOYW1lID0gJ2RvbSc7CiAgICBtZXRhLnRleHRDb250ZW50ID0gbS5yZXMuZG9tYWluICsgJyDCtyAnICsgbS52b2wgKyAnIMK3ICcgKyAobS5yZXMuc25pcHBldCB8fCAnJykubGVuZ3RoICsgJysgY2hhcnMnOwogICAgdmFyIHNuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7IHNuLmNsYXNzTmFtZSA9ICdzbmlwJzsgc24udGV4dENvbnRlbnQgPSBtLnJlcy5zbmlwcGV0IHx8ICcnOwogICAgZC5hcHBlbmRDaGlsZCh0KTsgZC5hcHBlbmRDaGlsZChtZXRhKTsgZC5hcHBlbmRDaGlsZChzbik7IG91dC5hcHBlbmRDaGlsZChkKTsKICB9KTsKfQpmdW5jdGlvbiBvcGVuRG9jKHZvbCwgaWQpIHsKICB2YXIgZCA9IEJZSUQodm9sLCBpZCk7IGlmICghZCkgcmV0dXJuOwogICQoJ3NlYXJjaHZpZXcnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOwogICQoJ2FydGljbGUnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzsKICAkKCdhcnQtdGl0bGUnKS50ZXh0Q29udGVudCA9IGQudGl0bGUgfHwgZC51cmw7CiAgJCgnYXJ0LWJhZGdlcycpLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz0iYmFkZ2UgYi1vayI+U0hBLVZFUklGSUVEIFZPTFVNRTwvc3Bhbj4nICsKICAgICc8c3BhbiBjbGFzcz0iYmFkZ2UgYi1pbmZvIj4nICsgdm9sICsgJzwvc3Bhbj4nICsKICAgICc8c3BhbiBjbGFzcz0iYmFkZ2UgYi1pbmZvIj4nICsgKGQudGV4dCB8fCAnJykubGVuZ3RoICsgJyBjaGFycywgbm8gdHJ1bmNhdGlvbjwvc3Bhbj4nICsKICAgICc8c3BhbiBjbGFzcz0iYmFkZ2UgYi13YXJuIj5PRkZMSU5FIOKAlCBsb2NhbCBjb3B5PC9zcGFuPic7CiAgJCgnYXJ0LW1ldGEnKS50ZXh0Q29udGVudCA9ICdjb250ZW50X2hhc2ggJyArIGQuY29udGVudF9oYXNoICsgJyDCtyAnICsgZC51cmw7CiAgJCgnYXJ0LWJvZHknKS50ZXh0Q29udGVudCA9IGQudGV4dCB8fCAnJzsKfQpmdW5jdGlvbiBCWUlEKHZvbCwgaWQpIHsKICB2YXIgZG9jcyA9IElOU1RBTExFRFt2b2xdICYmIElOU1RBTExFRFt2b2xdLmRvY3MgfHwgW107CiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb2NzLmxlbmd0aDsgaSsrKSBpZiAoZG9jc1tpXS5pZCA9PT0gaWQpIHJldHVybiBkb2NzW2ldOwogIHJldHVybiBudWxsOwp9CmZ1bmN0aW9uIGdvSG9tZSgpIHsgJCgnYXJ0aWNsZScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7ICQoJ3NlYXJjaHZpZXcnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzsgfQp3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZXYpIHsKICB2YXIgZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib290ZmFpbCcpOwogIGlmIChmKSB7IGYudGV4dENvbnRlbnQgPSAnd2luZG93IGVycm9yOiAnICsgZXYubWVzc2FnZSArICcgQCAnICsgKGV2LmZpbGVuYW1lIHx8ICcnKSArICc6JyArIGV2LmxpbmVubzsgZi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzsgfQp9KTsKZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGJvb3QpOwo=" };
  function b64ToUtf8(b64) {
    const binStr = atob(b64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }
  async function volManifest() {
    const v = await HARZ_BROWSER.get("vol.manifest");
    if (!v) return new Response('{"ok":false,"error":"no manifest published yet"}', { status: 503, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    return new Response(v, { headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "cache-control": "no-store" } });
  }
  function volAsset(name) {
    const js = VOL_ASSETS[name];
    if (!js) return new Response("not found", { status: 404 });
    return new Response(b64ToUtf8(js), { headers: { "Content-Type": "application/javascript; charset=utf-8", "Access-Control-Allow-Origin": "*", "cache-control": "public, max-age=3600" } });
  }
  async function volServe(p) {
    const id = p.slice("/vol/".length);
    if (!/^vol-[a-z0-9-]+$/.test(id)) return new Response('{"ok":false,"error":"bad volume id"}', { status: 400, headers: { "Content-Type": "application/json" } });
    const v = await HARZ_BROWSER.get("vol." + id);
    if (!v) return new Response('{"ok":false,"error":"volume not found"}', { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(v, { headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "cache-control": "public, max-age=31536000, immutable" } });
  }
  function volumesPage() {
    const html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
      + '<meta name="viewport" content="width=device-width, initial-scale=1">'
      + '<link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#f0f2f5">'
      + '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="HARZ Volumes">'
      + '<title>HARZ Volumes — Offline Knowledge Volumes</title>'
      + '<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js");<\/script>'
      + '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,-apple-system,sans-serif;background:#f0f2f5;color:#1a2233;line-height:1.5}'
      + '.wrap{max-width:720px;margin:0 auto;padding:10px}'
      + 'h1{font-size:18px;margin:6px 0}.tag{font-size:11px;color:#68738a;margin-bottom:8px}'
      + '.badge{display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;margin:2px 3px 2px 0}'
      + '.b-ok{background:#d4f5d4;color:#145a14}.b-info{background:#dce8f7;color:#1a3c6e}.b-warn{background:#fdeecd;color:#6b4d00}.b-err{background:#fbd5d5;color:#7a1414}'
      + '.card{background:#fff;border:1px solid #dde3ec;border-radius:8px;padding:10px;margin:8px 0}'
      + 'input[type=text]{width:100%;padding:12px;font-size:16px;border:1px solid #c4ccd8;border-radius:8px;margin:8px 0}'
      + 'button{padding:10px 14px;font-size:14px;border:none;border-radius:8px;background:#1a3c6e;color:#fff;font-weight:600}'
      + 'button.sec{background:#e8edf5;color:#1a3c6e}'
      + '.vcard{background:#fff;border:1px solid #dde3ec;border-radius:8px;padding:10px;margin:8px 0}'
      + '.vtitle{font-weight:700;font-size:14px}.vmeta{font-size:12px;color:#68738a;margin:4px 0}'
      + '.res{border-bottom:1px solid #edf0f4;padding:10px 0}.res h3{font-size:15px;color:#1a3c6e;cursor:pointer}'
      + '.dom{font-size:11px;color:#68738a}.snip{font-size:13px;color:#333;margin-top:4px}.count{font-size:12px;color:#68738a;margin:6px 0}'
      + '.art-title{font-size:19px;font-weight:700;margin:4px 0}.art-body{white-space:pre-wrap;font-size:15px;margin:10px 0;line-height:1.65}'
      + '.seal{font-family:monospace;font-size:12px;color:#145a14}.fail{font-family:monospace;font-size:13px;color:#7a1414;white-space:pre-wrap}'
      + '.art-body{white-space:pre-wrap}#boot,#volview,#searchview,#article{display:none}#boot{display:block}'
      + '</style></head><body><div class="wrap">'
      + '<h1>HARZ Volumes</h1><div class="tag">Offline knowledge volumes — install once, read forever with no internet</div>'
      + '<div id="stats"></div>'
      + '<div id="boot"><div id="bootlist"></div><div id="bootfail" class="fail" style="display:none"></div></div>'
      + '<div id="volview">'
      + '<div id="vols"></div>'
      + '<div id="searchview"><form onsubmit="doSearch(event)"><input type="text" id="q" placeholder="Search installed volumes offline..."></form>'
      + '<div id="results"></div></div>'
      + '</div>'
      + '<div id="article"><button class="sec" onclick="goHome()">&#8962; HOME</button>'
      + '<div class="art-title" id="art-title"></div><div id="art-badges"></div>'
      + '<div class="dom" id="art-meta"></div><div class="art-body" id="art-body"></div>'
      + '<button class="sec" onclick="goHome()">&#8962; HOME</button></div>'
      + '<div id="volmsg" class="vmeta"></div>'
      + '<script src="/vol/app.js?v=5"><\/script></body></html>';
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }

function fxPage() {
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>HARZ FX Search \u2014 Full-Text Tier</title>'
    + '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#111;padding:16px;max-width:640px;margin:0 auto}'
    + 'h1{font-size:18px;margin-bottom:4px}p.tag{font-size:11px;color:#556;margin-bottom:12px}'
    + 'form{display:flex;gap:8px;margin-bottom:12px}input{flex:1;padding:10px;border:1px solid #ccc;border-radius:8px;font-size:15px}'
    + 'button{padding:10px 16px;border:0;border-radius:8px;background:#1877f2;color:#fff;font-size:15px}'
    + '.res{background:#fff;border:1px solid #e2e4e9;border-radius:10px;padding:12px;margin-bottom:10px}'
    + '.res .t{font-weight:600;font-size:14px}.res .u{font-size:11px;color:#889;margin:4px 0}'
    + '.res .s{font-size:13px;color:#334;line-height:1.45}.res .s b{background:#fff3c4}'
    + '.label{font-size:10px;background:#eef4ff;border:1px solid #cfe0ff;border-radius:6px;padding:4px 8px;color:#235;display:inline-block;margin-bottom:12px}'
    + '.empty{color:#667;font-size:14px}</style></head><body>'
    + '<h1>HARZ FX \u00b7 Full-Text Tier</h1>'
    + '<p class="tag">Complete-document search \u00b7 separate from the sealed 5K engine</p>'
    + '<form onsubmit="go(event)"><input id="q" placeholder="Search full-text documents..." autofocus><button>Search</button></form>'
    + '<div class="label">LIVE \u00b7 TRUSTED ECOSYSTEM SOURCE \u2014 RETRIEVED FULL TEXT, NOT VERIFIED FOR RELEVANCE</div>'
    + '<div id="out"><div class="empty">Type a query and press Search.</div></div>'
    + '<script>async function go(e){e.preventDefault();const q=document.getElementById("q").value.trim();'
    + 'if(!q)return;const out=document.getElementById("out");out.innerHTML="<div class=empty>Searching...</div>";'
    + 'try{const r=await fetch("/fx-api?q="+encodeURIComponent(q));const j=await r.json();'
    + 'if(!j.ok){out.innerHTML="<div class=empty>"+(j.error||"Search failed.")+"</div>";return;}'
    + 'if(!j.count){out.innerHTML="<div class=empty>No results.</div>";return;}'
    + 'out.innerHTML=j.results.map(function(x){return "<div class=res><div class=t>"+esc(x.title||x.url)+"</div>'
    + '<div class=u>"+esc(x.url)+" \u00b7 "+x.char_len+" chars</div>'
    + '<div class=s>"+(x.snippets||[]).map(function(s){return esc(s)}).join(" \u2026 ")+"</div></div>"}).join("");'
    + '}catch(err){out.innerHTML="<div class=empty>FX tier unreachable: "+err+"</div>"}}'
    + 'function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}'
    + '</scr'+'ipt></body></html>';
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
async function fxApi(req, u) {
  const q = u.searchParams.get("q") || "";
  if (!q) return new Response('{"ok":false,"error":"missing q"}', { status: 400, headers: { "Content-Type": "application/json" } });
  try {
    const r = await globalThis.HARZ_ENV.HARZ_FX.fetch("https://fx/fx1/search?q=" + encodeURIComponent(q), { headers: { "User-Agent": "harz-reader-fx/1.0" } });
    const t = await r.text();
    return new Response(t, { status: r.status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    return new Response('{"ok":false,"error":"fx unreachable"}', { status: 502, headers: { "Content-Type": "application/json" } });
  }
}
async function fxDoc(u) {
  const id = Number(u.searchParams.get("id") || 0);
  if (!id) return new Response('{"ok":false,"error":"missing id"}', { status: 400, headers: { "Content-Type": "application/json" } });
  try {
    const r = await globalThis.HARZ_ENV.HARZ_FX.fetch("https://fx/fx1/doc/" + id, { headers: { "User-Agent": "harz-reader-fx/1.0" } });
    const t = await r.text();
    return new Response(t, { status: r.status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    return new Response('{"ok":false,"error":"fx unreachable"}', { status: 502, headers: { "Content-Type": "application/json" } });
  }
}

export default { fetch: (request, env) => { globalThis.HARZ_BROWSER = env.HARZ_BROWSER; globalThis.HARZ_ENV = env; return globalThis.__HB_HANDLE(request); } };
