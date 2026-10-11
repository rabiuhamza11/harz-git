// HARZ FX-1 ingest worker — fx1-js-1.0.0 (extractor battery-verified 12/12, harz-git 05f88f2)
// New isolated service: parallel FX store. Existing corpus/search untouched.
// Endpoints: /fx1/ingest?url= | /fx1/search?q= | /fx1/doc/:id | /fx1/stats
// D1 binding DB -> harz-fx-v1 (uuid f8ca1ce5-886a-437e-ac3f-112dabd43286), chunked 64KB.

export const FX1_VERSION = "fx1-js-1.0.0";
export const CAP_BYTES = 512 * 1024;   // D-1 proposal, ratified under "Go"
export const MAX_PAGES = 10;
export const MIN_CHARS = 500;
const CHUNK_BYTES = 64 * 1024;         // below D1's ~100KB statement ceiling
const UA = "Mozilla/5.0 (compatible; HARZ-FX1/1.0)";

async function sha256hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function robotsAllows(url) {
  let u; try { u = new URL(url); } catch { return { ok: false, why: "invalid URL" }; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, why: "unsupported protocol" };
  if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) return { ok: false, why: "private host" };
  try {
    const r = await fetch(`${u.protocol}//${u.hostname}/robots.txt`, {
      headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (r.status !== 200) return { ok: true, why: r.status === 404 ? "no robots.txt" : `robots ${r.status} (default allow)` };
    const body = await r.text();
    const groups = {}; let current = null;
    for (const line of body.split("\n")) {
      const ua = line.match(/^user-agent:\s*(.+)/i);
      const dis = line.match(/^Disallow:\s*(\S*)/i);
      if (ua) { current = ua[1].trim().toLowerCase(); (groups[current] ??= []); }
      else if (dis && current) groups[current].push(dis[1]);
    }
    for (const d of (groups["*"] || [])) {
      if (d === "") continue;
      if (d === "/" || u.pathname.startsWith(d)) return { ok: false, why: `robots disallow: ${d}` };
    }
    return { ok: true, why: "robots ok" };
  } catch { return { ok: true, why: "robots unreachable (default allow)" }; }
}

const STRIP = /<(script|style|noscript|template|aside|nav|footer|header)[^>]*>[\s\S]*?<\/\1>/gi;
const COMMENTS = /<!--[\s\S]*?-->/g;
const TAGS = /<[^>]+>/g;
const BLOCKISH = /<\/?(p|div|h[1-6]|li|tr|section|article|blockquote|pre|table)[^>]*>/gi;

function extractReadable(raw) {
  let v = raw.replace(STRIP, " ").replace(COMMENTS, " ");
  v = v.replace(/<br[^>]*>/gi, "\n");
  v = v.replace(BLOCKISH, "\n\n");
  v = v.replace(TAGS, " ")
       .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
       .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
       .replace(/&apos;/g, "'").replace(/&ndash;/g, "\u2013").replace(/&mdash;/g, "\u2014")
       .replace(/&hellip;/g, "\u2026").replace(/&rsquo;/g, "\u2019").replace(/&lsquo;/g, "\u2018")
       .replace(/&rdquo;/g, "\u201D").replace(/&ldquo;/g, "\u201C").replace(/&times;/g, "\u00D7")
       .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
       .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
       .replace(/\u00a0/g, " ");
  v = v.replace(/[ \t]+/g, " ");
  const keep = [];
  for (const ln of v.split("\n")) {
    const s = ln.trim();
    if (!s) { keep.push(""); continue; }
    const words = s.split(" ");
    if (words.length <= 2 && !/[.!?"']$/.test(s)) continue;
    keep.push(s);
  }
  return keep.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function findNext(raw, baseUrl) {
  const pats = [
    /<link[^>]+rel=["']?next["']?[^>]+href=["']?([^"'>\s]+)/i,
    /<a[^>]+rel=["']?next["']?[^>]+href=["']?([^"'>\s]+)/i,
  ];
  for (const p of pats) { const m = raw.match(p); if (m) return new URL(m[1], baseUrl).href; }
  return null;
}

const titleOf = (body) => (body.match(/<title[^>]*>([^<]{0,120})/i)?.[1] || "").trim();

async function pipeline(url, opts = {}) {
  const { priorSha = null, maxPages = MAX_PAGES } = opts;
  const rec = { version: FX1_VERSION, url, pages: [], status: null, reason: "" };
  const seen = new Set();
  let pageUrl = url, texts = [];
  let robotsStatus = "unchecked";
  while (pageUrl && seen.size < maxPages) {
    if (seen.has(pageUrl)) break;
    seen.add(pageUrl);
    let resp, body;
    try {
      resp = await fetch(pageUrl, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(25000) });
      body = await resp.text();
    } catch (e) {
      rec.status = "failed_fetch"; rec.reason = `fetch error: ${String(e).slice(0, 80)}`; rec.robotsStatus = robotsStatus;
      return rec;
    }
    rec.pages.push({ url: resp.url || pageUrl, status: resp.status, bytes: body.length });
    if (resp.status === 403) { rec.status = "unsupported"; rec.reason = "access denied (bot wall or forbidden)"; rec.robotsStatus = robotsStatus; return rec; }
    if (resp.status !== 200) { rec.status = "failed_fetch"; rec.reason = `HTTP ${resp.status}`; rec.robotsStatus = robotsStatus; return rec; }
    const title = titleOf(body); rec.title = title;
    if (/just a moment|attention required|security verification|access denied|captcha/i.test(title)) {
      rec.status = "unsupported"; rec.reason = "bot challenge"; rec.robotsStatus = robotsStatus; return rec;
    }
    const perm = await robotsAllows(resp.url);
    robotsStatus = perm.why;
    if (!perm.ok) { rec.status = "unsupported"; rec.reason = perm.why; rec.robotsStatus = robotsStatus; return rec; }
    const strippedLen = body.replace(STRIP, " ").replace(TAGS, " ").trim().length;
    if (strippedLen < 100 && /<div[^>]+id=["']?(root|app|__next)["']?/i.test(body) && /<script[^>]+src=/i.test(body)) {
      rec.status = "unsupported"; rec.reason = "js-only rendering (V1 limitation)"; rec.robotsStatus = robotsStatus; return rec;
    }
    texts.push(extractReadable(body));
    const nxt = findNext(body, resp.url || pageUrl);
    pageUrl = nxt && nxt !== pageUrl ? nxt : null;
  }
  const full = texts.filter(Boolean).join("\n\n");
  rec.charLen = full.length;
  rec.fullText = full;
  rec.robotsStatus = robotsStatus;
  if (new TextEncoder().encode(full).length > CAP_BYTES) {
    rec.status = "truncated"; rec.reason = `cap ${CAP_BYTES}B hit`;
    rec.fullText = full.slice(0, CAP_BYTES);
    return rec;
  }
  if (full.length < MIN_CHARS) { rec.status = "failed_extract"; rec.reason = `only ${full.length} readable chars`; return rec; }
  rec.fullTextSha256 = await sha256hex(full);
  if (priorSha && priorSha === rec.fullTextSha256) { rec.status = "unchanged"; rec.priorSha = priorSha; return rec; }
  rec.status = rec.pages.length >= maxPages ? "truncated" : "complete";
  if (rec.status === "truncated") rec.reason = `pagination cap ${maxPages} hit`;
  return rec;
}

function chunkText(text) {
  const chunks = []; let cur = "";
  for (const para of text.split("\n\n")) {
    if ((cur + "\n\n" + para).length > CHUNK_BYTES && cur) { chunks.push(cur); cur = para; }
    else cur = cur ? cur + "\n\n" + para : para;
    while (cur.length > CHUNK_BYTES) { chunks.push(cur.slice(0, CHUNK_BYTES)); cur = cur.slice(CHUNK_BYTES); }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

async function storeDoc(db, rec) {
  const now = new Date().toISOString();
  const prior = await db.prepare("SELECT id, full_text_sha256 FROM docs_fx WHERE url = ? ORDER BY id DESC LIMIT 1").bind(rec.url).first();
  if (prior && prior.full_text_sha256 === rec.fullTextSha256) {
    await db.prepare("UPDATE docs_fx SET fetched_at = ? WHERE id = ?").bind(now, prior.id).run();
    return { stored: "unchanged", doc_id: prior.id, status: "unchanged" };
  }
  const chunks = chunkText(rec.fullText);
  const ins = await db.prepare(
    "INSERT INTO docs_fx (url, title, domain, status, reason, full_text_sha256, char_len, pages, extractor_version, fetched_at, prior_version_sha, robots_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(rec.url, rec.title || "", new URL(rec.url).hostname, rec.status, rec.reason || "",
    rec.fullTextSha256, rec.charLen, rec.pages.length, FX1_VERSION, now, prior ? prior.full_text_sha256 : null,
    rec.robotsStatus || "n/a").run();
  const docId = ins.meta.last_row_id;
  for (let seq = 0; seq < chunks.length; seq++) {
    const c = await db.prepare("INSERT INTO chunks (doc_id, seq, text) VALUES (?,?,?)").bind(docId, seq, chunks[seq]).run();
    await db.prepare("INSERT INTO fx_fts (rowid, text) VALUES (?, ?)").bind(c.meta.last_row_id, chunks[seq]).run();
  }
  return { stored: "stored", doc_id: docId, status: rec.status, chunks: chunks.length, prior_doc_id: prior ? prior.id : null };
}

async function storeFailure(db, rec) {
  const now = new Date().toISOString();
  const ins = await db.prepare(
    "INSERT INTO docs_fx (url, title, domain, status, reason, char_len, pages, extractor_version, fetched_at, robots_status) VALUES (?,?,?,?,?,?,?,?,?,?)"
  ).bind(rec.url, rec.title || "", new URL(rec.url).hostname, rec.status, rec.reason || "",
    rec.charLen || 0, rec.pages.length, FX1_VERSION, now, rec.robotsStatus || "n/a").run();
  return { stored: "recorded_failure", doc_id: ins.meta.last_row_id, status: rec.status };
}

async function searchDb(db, q) {
  const rows = await db.prepare(
    "SELECT c.doc_id AS doc_id, c.seq AS seq, snippet(fx_fts, 0, '[', ']', ' … ', 12) AS snip FROM fx_fts JOIN chunks c ON c.id = fx_fts.rowid WHERE fx_fts MATCH ? ORDER BY rank LIMIT 20"
  ).bind(q).all();
  const byDoc = {};
  for (const r of rows.results) {
    (byDoc[r.doc_id] ??= { doc_id: r.doc_id, snippets: [] }).snippets.push(r.snip);
  }
  const out = [];
  for (const [docId, agg] of Object.entries(byDoc)) {
    const d = await db.prepare("SELECT url, title, status, char_len, fetched_at, extractor_version FROM docs_fx WHERE id = ?").bind(+docId).first();
    out.push({ ...d, snippets: agg.snippets, chunk_hits: agg.snippets.length });
  }
  return out;
}

const CORS = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    const path = u.pathname;
    try {
      if (path === "/fx1/ingest") {
        const target = u.searchParams.get("url");
        if (!target) return Response.json({ ok: false, error: "missing url" }, { status: 400, headers: CORS });
        if (request.method !== "POST") return Response.json({ ok: false, error: "POST required for ingest" }, { status: 405, headers: CORS });
        const rec = await pipeline(target);
        let store = null;
        if (rec.fullText) store = await storeDoc(env.DB, rec);
        else store = await storeFailure(env.DB, rec);
        const { fullText, ...light } = rec;
        return Response.json({ ok: true, ...light, store }, { headers: CORS });
      }
      if (path === "/fx1/search") {
        const q = u.searchParams.get("q");
        if (!q) return Response.json({ ok: false, error: "missing q" }, { status: 400, headers: CORS });
        const results = await searchDb(env.DB, q);
        return Response.json({ ok: true, engine: "d1+fts5", count: results.length, results }, { headers: CORS });
      }
      if (path.startsWith("/fx1/doc/")) {
        const id = +path.split("/")[3];
        if (!id) return Response.json({ ok: false, error: "bad id" }, { status: 400, headers: CORS });
        const d = await env.DB.prepare("SELECT * FROM docs_fx WHERE id = ?").bind(id).first();
        if (!d) return Response.json({ ok: false, error: "not found" }, { status: 404, headers: CORS });
        const cs = await env.DB.prepare("SELECT seq, text FROM chunks WHERE doc_id = ? ORDER BY seq").bind(id).all();
        return Response.json({ ok: true, doc: d, chunks: cs.results.length, text: cs.results.map(c => c.text).join("\n\n") }, { headers: CORS });
      }
      if (path === "/fx1/stats") {
        const s = await env.DB.prepare("SELECT status, COUNT(*) AS n FROM docs_fx GROUP BY status").all();
        const t = await env.DB.prepare("SELECT COUNT(*) AS n, SUM(LENGTH(text)) AS chars FROM chunks").first();
        const d = await env.DB.prepare("SELECT COUNT(*) AS n FROM docs_fx").first();
        return Response.json({ ok: true, version: FX1_VERSION, docs: d.n, by_status: s.results, chunks: t.n, chunk_chars: t.chars }, { headers: CORS });
      }
      return Response.json({ ok: true, service: "harz-fx-ingest", version: FX1_VERSION, endpoints: ["/fx1/ingest POST ?url=", "/fx1/search ?q=", "/fx1/doc/:id", "/fx1/stats"] }, { headers: CORS });
    } catch (e) {
      return Response.json({ ok: false, error: String(e).slice(0, 200) }, { status: 500, headers: CORS });
    }
  }
};
