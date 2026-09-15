// HARZDOORS round 3 (bundle-safe): P5 sw.js data-route exclusion (ECP-1 law) + P6 JSON MIME negotiation.
Deno.serve(async (req) => {
  const R = { error: null, fixes: [], deployed: false };
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "deploy" ? "deploy" : "dry";
    R.mode = mode;
    const candidates = ["CLOUDFLARE_API_TOKEN_3_4", "CLOUDFLARE_API_TOKEN_2_4", "CLOUDFLARE_API_TOKEN_1_3"];
    let tok = "";
    for (const c of candidates) {
      const t = (Deno.env.get(c) || "").trim();
      if (!t) continue;
      const r = await fetch("https://api.cloudflare.com/client/v4/accounts", { headers: { Authorization: `Bearer ${t}` } });
      const j = await r.json();
      if (j.success) { tok = t; break; }
    }
    if (!tok) { R.error = "no token"; return Response.json(R); }
    let target = null;
    const accs = (await (await fetch("https://api.cloudflare.com/client/v4/accounts", { headers: { Authorization: `Bearer ${tok}` } })).json()).result;
    for (const a of accs) {
      const wres = await fetch(`https://api.cloudflare.com/client/v4/accounts/${a.id}/workers/scripts`, { headers: { Authorization: `Bearer ${tok}` } });
      const wjson = await wres.json();
      if (wjson.success && wjson.result.some(s => s.id === "harz-root")) { target = a.id; break; }
    }
    if (!target) { R.error = "harz-root not found"; return Response.json(R); }
    const srcRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${target}/workers/scripts/harz-root`, { headers: { Authorization: `Bearer ${tok}` } });
    let text = await srcRes.text();
    if (text.startsWith("--")) { const i = text.indexOf("\r\n\r\n"); if (i > 0) text = text.slice(i + 4); }
    const tailRe = /(?:\r?\n)--[0-9a-f]{8,}--[ \t]*\r?\n?$/;
    if (tailRe.test(text)) text = text.replace(tailRe, "");
    if (!text.includes("HARZDOORS")) { R.error = "live source not the doors build"; return Response.json(R); }
    const enc = new TextEncoder();

    // ---- P5: rebuild the embedded SW asset ----
    const swMatch = text.match(/sw:\s*"([A-Za-z0-9+/=]+)"/);
    if (!swMatch) { R.error = "P5: sw asset not found"; return Response.json(R); }
    const swOld = atob(swMatch[1]);
    if (!swOld.includes("hr21")) { R.error = "P5: unexpected sw content (no hr21)"; return Response.json(R); }
    if (swOld.includes("hr22")) { R.error = "P5: already patched"; return Response.json(R); }
    const swNew = "const c='hr22'; // v2.2 doors: data routes network-only (ECP-1 law), cache bump purges stale page\nself.addEventListener('install',e=>{e.waitUntil(caches.open(c).then(ca=>ca.addAll(['/','/manifest.json','/icon.svg'])))});\nself.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==c).map(k=>caches.delete(k)))))});\nself.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.pathname.startsWith('/dns-query')||u.pathname.startsWith('/resolve')||u.pathname.startsWith('/zone')||u.pathname.startsWith('/pub')||u.pathname.startsWith('/go'))return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const cp=n.clone();caches.open(c).then(ca=>ca.put(e.request,cp));return n})))});";
    let b64 = "";
    const nb = enc.encode(swNew);
    for (let i = 0; i < nb.length; i += 8192) b64 += String.fromCharCode(...nb.subarray(i, i + 8192));
    const swNewB64 = btoa(b64);
    text = text.replace(swMatch[0], `sw: "${swNewB64}"`);
    R.fixes.push("P5 sw.js network-only data routes + hr22");

    // ---- P6: JSON MIME negotiation in jsonView ----
    const oldJh = 'const jh = {"content-type": "application/dns-json", "access-control-allow-origin": "*", "cache-control": "max-age=60"};';
    if (!text.includes(oldJh)) { R.error = "P6: jh line not found"; return Response.json(R); }
    const newJh = 'const jNav = (req.headers.get("sec-fetch-dest") === "document") || ((req.headers.get("accept") || "").includes("text/html"));\n        const jh = {"content-type": jNav ? "application/json" : "application/dns-json", "access-control-allow-origin": "*", "cache-control": "max-age=60"};';
    text = text.replace(oldJh, newJh);
    R.fixes.push("P6 JSON MIME negotiation");

    const outText = text.replace(/\s+$/, "");
    const openB = outText.split("{").length - 1, closeB = outText.split("}").length - 1;
    if (Math.abs(openB - closeB) > 2) { R.error = "brace sanity failed"; return Response.json(R); }
    if (!outText.includes(swNewB64) || !outText.includes("jNav")) { R.error = "post-check failed"; return Response.json(R); }
    const digest = await crypto.subtle.digest("SHA-256", enc.encode(outText));
    R.new_sha = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
    R.new_len = outText.length;
    if (mode === "dry") return Response.json(R);

    const boundary = "----magani-" + Math.random().toString(36).slice(2);
    const metadata = JSON.stringify({ main_module: "index.js", keep_bindings: ["d1"] });
    const headStr = `--${boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Disposition: form-data; name="index.js"; filename="index.js"\r\nContent-Type: application/javascript+module\r\n\r\n`;
    const srcBytes = enc.encode(outText);
    const head = enc.encode(headStr);
    const tail = enc.encode(`\r\n--${boundary}--\r\n`);
    const upBody = new Uint8Array(head.length + srcBytes.length + tail.length);
    upBody.set(head, 0); upBody.set(srcBytes, head.length); upBody.set(tail, head.length + srcBytes.length);
    const up = await fetch(`https://api.cloudflare.com/client/v4/accounts/${target}/workers/scripts/harz-root`, {
      method: "PUT", headers: { Authorization: `Bearer ${tok}`, "Content-Type": `multipart/form-data; boundary=${boundary}` }, body: upBody
    });
    const upj = await up.json();
    R.deployed = upj.success === true;
    if (!upj.success) R.error = "deploy failed: " + JSON.stringify(upj.errors || upj).slice(0, 400);
  } catch (e) { R.error = "exception: " + String(e).slice(0, 400); }
  return Response.json(R);
});