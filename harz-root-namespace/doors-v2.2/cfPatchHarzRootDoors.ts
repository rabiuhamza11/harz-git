// Server-side surgical patcher for the LIVE harz-root worker.
// Fetches live source, applies the BROWSER-DOORS patch, and (mode:"deploy") redeploys.
// mode:"dry" → returns patch report + sha, no deploy.
//
// PATCH CONTENT (all authored in-function, no secrets, assets untouched):
//  P1  A/AAAA wire-format answers in /dns-query (upstream resolve of the target
//      host via Cloudflare public DoH, isolate cache 5 min) — makes the browser
//      "Secure DNS" custom-provider setting actually resolve .harz to addresses.
//  P2  JSON DoH view: /dns-query?name=X&type=A|AAAA|TXT (RFC 8484 JSON shape) —
//      human + browser-testable evidence door.
//  P3  /go/<name> — ZERO-SETTING doorway: 302 to the live endpoint from the
//      signed zone. Works in any vanilla browser on Earth, no extension, no setting.
//  P4  Fail-closed law restored on data routes: 503 when zone sig invalid;
//      /resolve: 400 invalid name, 404 NXDOMAIN (v2.1.1 regression in live v2.3 fixed).
Deno.serve(async (req) => {
  const R = { error: null, mode: null, patches: [], old_sha: null, new_sha: null, old_len: 0, new_len: 0, deployed: false };
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
    const enc = new TextEncoder();
    const sha = (s) => { const b = enc.encode(s); return crypto.subtle.digest("SHA-256", b).then(d => [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, "0")).join("")); };
    R.old_sha = await sha(text); R.old_len = text.length;

    const lines = text.split("\n");
    const findLine = (sub) => lines.findIndex(l => l.includes(sub));

    // ---------- P4a: sig guard after `const p = url.pathname;` ----------
    let i = findLine("const p = url.pathname;");
    if (i < 0) { R.error = "P4a anchor missing"; return Response.json(R); }
    if (!lines.some(l => l.includes("HARZDOORS sig guard"))) {
      lines.splice(i + 1, 0,
        "    // HARZDOORS sig guard — fail-closed on data routes (law restored)",
        "    if ((await sigValid()) === false && [\"/zone\", \"/resolve\", \"/dns-query\", \"/go\"].some(x => p === x || p.startsWith(x))) {",
        "      return new Response(JSON.stringify({ok:false, error:\"zone signature INVALID — refusing to serve (fail-closed)\"}), {status:503, headers: {\"content-type\": CT.json, \"access-control-allow-origin\": \"*\"}});",
        "    }");
      R.patches.push("P4a sig-guard");
    }

    // ---------- P1: A/AAAA branch before `else if (isHarz) rcode = 3;` ----------
    i = findLine("else if (isHarz) rcode = 3;");
    if (i < 0) { R.error = "P1 anchor missing"; return Response.json(R); }
    if (!lines.some(l => l.includes("HARZDOORS addr branch"))) {
      lines.splice(i, 0,
        "        else if (isHarz && records.has(name) && (qtype === 1 || qtype === 28)) { // HARZDOORS addr branch",
        "          const aRes = await dohAddrAnswer(name, qtype);",
        "          if (aRes) { rcode = 0; answer = aRes.rr; } else rcode = 3;",
        "        }");
      R.patches.push("P1 A/AAAA branch");
    }

    // ---------- P1 helpers before `const DOH_OPTS` ----------
    i = findLine("const DOH_OPTS");
    if (i < 0) { R.error = "P1h anchor missing"; return Response.json(R); }
    if (!lines.some(l => l.includes("HARZDOORS helpers"))) {
      const helpers = `/* ---- HARZDOORS helpers — A/AAAA address door (P1) ---- */
const ADDR_CACHE = new Map(); // host:qtype -> {ips:[Uint8Array], exp} — isolate cache, 5 min
const HOST_ALLOWLIST = [".workers.dev", ".base44.app", ".github.io", ".pages.dev", ".getly.store", ".gumroad.com"];
function harzDoorsSkipName(b, p) { while (b[p] !== 0) { if ((b[p] & 0xC0) === 0xC0) return p + 2; p += 1 + b[p]; } return p + 1; }
function harzDoorsBuildRR(nameLower, qtype, ips) {
  const labels = nameLower.split(".");
  const nameBytes = [];
  for (const l of labels) { nameBytes.push(l.length); for (let j = 0; j < l.length; j++) nameBytes.push(l.charCodeAt(j)); }
  nameBytes.push(0);
  const rrs = [];
  for (const ip of ips) {
    const rr = new Uint8Array(nameBytes.length + 10 + ip.length);
    rr.set(nameBytes, 0);
    const dv = new DataView(rr.buffer, nameBytes.length);
    dv.setUint16(0, qtype); dv.setUint16(2, 1); dv.setUint32(4, 300); dv.setUint16(8, ip.length);
    rr.set(ip, nameBytes.length + 10);
    rrs.push(rr);
  }
  let total = 0; for (const r of rrs) total += r.length;
  const out = new Uint8Array(total); let k = 0;
  for (const r of rrs) { out.set(r, k); k += r.length; }
  return out;
}
async function dohAddrAnswer(nameLower, qtype) {
  const rec = records.get(nameLower);
  let target = null;
  try { target = JSON.parse(rec).url || null; } catch (e) { target = null; }
  if (!target) return null; // reserved name — honest NXDOMAIN, no fabricated address
  let host; try { host = new URL(target).hostname; } catch (e) { return null; }
  if (!HOST_ALLOWLIST.some(sfx => host.endsWith(sfx))) return null;
  const ck = host + ":" + qtype, now = Date.now();
  const hit = ADDR_CACHE.get(ck);
  if (hit && hit.exp > now) return { ips: hit.ips, rr: harzDoorsBuildRR(nameLower, qtype, hit.ips) };
  const labels = host.split(".");
  let qlen = 1; for (const l of labels) qlen += 1 + l.length;
  const q = new Uint8Array(12 + qlen + 4);
  q.set([0,1, 1,0, 0,1, 0,0, 0,0, 0,0], 0);
  let k = 12;
  for (const l of labels) { q[k++] = l.length; for (let j = 0; j < l.length; j++) q[k++] = l.charCodeAt(j); }
  q[k++] = 0; q[k++] = (qtype >> 8) & 0xff; q[k++] = qtype & 0xff; q[k++] = 0; q[k++] = 1;
  let bin = ""; for (let j = 0; j < q.length; j += 8192) bin += String.fromCharCode(...q.subarray(j, j + 8192));
  const dnsParam = btoa(bin).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
  let ub = null;
  try {
    const up = await fetch("https://cloudflare-dns.com/dns-query?dns=" + dnsParam, { headers: { accept: "application/dns-message" } });
    if (!up.ok) return null;
    ub = new Uint8Array(await up.arrayBuffer());
  } catch (e) { return null; }
  const ips = [];
  try {
    let pos = 12;
    pos = harzDoorsSkipName(ub, pos); pos += 4; // skip question
    const an = (ub[6] << 8) | ub[7];
    for (let n = 0; n < an; n++) {
      pos = harzDoorsSkipName(ub, pos);
      const t = (ub[pos] << 8) | ub[pos+1];
      pos += 8; // type(2)+class(2)+ttl(4)
      const rdlen = (ub[pos] << 8) | ub[pos+1]; pos += 2;
      if (t === qtype && (rdlen === 4 || rdlen === 16)) ips.push(ub.slice(pos, pos + rdlen));
      pos += rdlen;
    }
  } catch (e) { return null; }
  if (!ips.length) return null;
  ADDR_CACHE.set(ck, { ips, exp: now + 300000 });
  if (ADDR_CACHE.size > 500) ADDR_CACHE.clear();
  return { ips, rr: harzDoorsBuildRR(nameLower, qtype, ips) }
}
function harzDoorsIpText(ip) { return Array.from(ip).join("."); }`;
      lines.splice(i, 0, ...helpers.split("\n"));
      R.patches.push("P1h A/AAAA helpers");
    }

    // ---------- P2: JSON DoH view right after `if (p === "/dns-query") {` ----------
    i = findLine(`if (p === "/dns-query") {`);
    if (i < 0) { R.error = "P2 anchor missing"; return Response.json(R); }
    if (!lines.some(l => l.includes("HARZDOORS json view"))) {
      const jsonView = `      // HARZDOORS json view — human/browser evidence door (RFC 8484 JSON shape)
      if (url.searchParams.has("name")) {
        const jh = {"content-type": "application/dns-json", "access-control-allow-origin": "*", "cache-control": "max-age=60"};
        let jname = (url.searchParams.get("name") || "").trim().toLowerCase();
        if (jname && !jname.endsWith(".harz")) jname += ".harz";
        const jtype = (url.searchParams.get("type") || "TXT").toUpperCase();
        const typeNum = { "A": 1, "AAAA": 28, "TXT": 16 }[jtype] || 16;
        const jQuestion = [{ name: jname + ".", type: typeNum }];
        if (!/^[a-z0-9-]+(\\.[a-z0-9-]+)*\\.harz$/.test(jname)) {
          return new Response(JSON.stringify({ Status: 5, Comment: "REFUSED — HARZ root is authoritative for .harz only", Question: jQuestion }), { status: 400, headers: jh });
        }
        const jrec = records.get(jname);
        if (!jrec) {
          return new Response(JSON.stringify({ Status: 3, Comment: "NXDOMAIN — not in canonical zone", Question: jQuestion, Answer: [] }), { status: 404, headers: jh });
        }
        if (typeNum === 16) {
          return new Response(JSON.stringify({ Status: 0, TC: false, RD: true, RA: true, AD: false, CD: false, Question: jQuestion, Answer: [{ name: jname + ".", type: 16, TTL: 3600, data: jrec }] }), { headers: jh });
        }
        const aRes = await dohAddrAnswer(jname, typeNum);
        if (!aRes) {
          return new Response(JSON.stringify({ Status: 3, Comment: "NXDOMAIN — reserved name or no address for this type", Question: jQuestion, Answer: [] }), { status: 404, headers: jh });
        }
        return new Response(JSON.stringify({ Status: 0, TC: false, RD: true, RA: true, AD: false, CD: false, Question: jQuestion, Answer: aRes.ips.map(ip => ({ name: jname + ".", type: typeNum, TTL: 300, data: harzDoorsIpText(ip) })) }), { headers: jh });
      }`;
      lines.splice(i + 1, 0, ...jsonView.split("\n"));
      R.patches.push("P2 json view");
    }

    // ---------- P3: /go doorway before `if (p === "/resolve") {` ----------
    i = findLine(`if (p === "/resolve") {`);
    if (i < 0) { R.error = "P3 anchor missing"; return Response.json(R); }
    if (!lines.some(l => l.includes("HARZDOORS /go"))) {
      const goRoute = `    // HARZDOORS /go — the zero-setting doorway: any browser, no extension, no config
    if (p === "/go" || p.startsWith("/go/")) {
      const gh = {"content-type": CT.html, "access-control-allow-origin": "*"};
      const doorPage = (title, msg, code) => new Response(HEAD.replace("HARZ Root — .harz", "HARZ Doors") + '<div class="card"><h1 style="font-size:18px">' + title + '</h1><div class="code">' + msg + '</div><a class="btn" href="/">HARZ Root</a></div></body></html>', { status: code, headers: gh });
      let raw = decodeURIComponent(p.slice(4)).trim().toLowerCase().replace(/\\/+$/, "");
      if (!raw) return doorPage("HARZ Doors", "usage: /go/&lt;name&gt;[.harz] — zero-setting doorway into the .harz namespace", 400);
      const gname = raw.endsWith(".harz") ? raw : raw + ".harz";
      if (!/^[a-z0-9-]+(\\.[a-z0-9-]+)*\\.harz$/.test(gname)) return doorPage("HARZ Doors", "invalid name — letters, digits and hyphens only", 400);
      const grec = records.get(gname);
      if (!grec) return doorPage("HARZ Doors", gname + " — NXDOMAIN, not in the canonical zone", 404);
      let gurl = null; try { gurl = JSON.parse(grec).url; } catch (e) {}
      if (!gurl) return doorPage("HARZ Doors", gname + " — reserved, no live endpoint (honest absence, no fabrication)", 404);
      return new Response(null, { status: 302, headers: { "Location": gurl, "access-control-allow-origin": "*" } });
    }`;
      lines.splice(i, 0, ...goRoute.split("\n"));
      R.patches.push("P3 /go doorway");
    }

    // ---------- P4b: /resolve status codes (400 / 404) ----------
    i = findLine('error:"only .harz names"');
    if (i >= 0 && !lines[i].includes("status: 400")) {
      lines[i] = lines[i].replace("return new Response(JSON.stringify({ok:false, error:", "return new Response(JSON.stringify({ok:false, error:").replace(/\}\), \{headers:/, "}), {status: 400, headers:");
      if (!lines[i].includes("status: 400")) {
        // fallback: rebuild the line
        lines[i] = `      if (!q || !q.endsWith(".harz")) return new Response(JSON.stringify({ok:false, error:"only .harz names"}), {status: 400, headers: {"content-type": CT.json, "access-control-allow-origin": "*"}});`;
      }
      R.patches.push("P4b /resolve 400");
    }
    i = findLine("NXDOMAIN — not in canonical zone");
    if (i >= 0 && !lines[i].includes("status: 404")) {
      const em = lines[i].includes("NXDOMAIN \u2014") ? "NXDOMAIN \u2014" : "NXDOMAIN —";
      lines[i] = `      if (!rec) return new Response(JSON.stringify({ok:false, name:q, error:"${em} not in canonical zone"}), {status: 404, headers: {"content-type": CT.json, "access-control-allow-origin": "*"}});`;
      R.patches.push("P4c /resolve 404");
    }

    if (R.patches.length === 0) { R.error = "no patches applied (already patched?)"; R.new_sha = R.old_sha; return Response.json(R); }
    const outText = lines.join("\n");
    R.new_len = outText.length;
    R.new_sha = await sha(outText);

    // sanity: balanced braces delta + key routes present
    const openB = (outText.match(/{/g) || []).length, closeB = (outText.match(/}/g) || []).length;
    if (Math.abs(openB - closeB) > 2) { R.error = "brace sanity failed: " + openB + "/" + closeB; return Response.json(R); }
    for (const must of ["dohAddrAnswer", "HARZDOORS /go", "application/dns-json", "status: 404"]) {
      if (!outText.includes(must)) { R.error = "post-patch check missing: " + must; return Response.json(R); }
    }
    R.sanity_ok = true;

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
    R.deploy = upj.success;
    R.deployed = upj.success === true;
    if (!upj.success) R.error = "deploy failed: " + JSON.stringify(upj.errors || upj).slice(0, 400);
  } catch (e) {
    R.error = "exception: " + String(e).slice(0, 400);
  }
  return Response.json(R);
});