// HARZ FX-2 corpus-wired search worker — fx2-js-1.1.0 (Oct 12, 2026, Rabiu: "Wire the 1000000+", "Beware of duplicate")
// INDEX-ONLY architecture: harz-fx-idx holds a CONTENTLESS FTS5 index (no text stored);
// every byte of content stays in the ONE master corpus (harz-million-corpus). Zero duplication.
// rowid = corpus_id*64 + part (part 0..63, parts <=85KB); doc id = rowid >> 6.
// Routes (FX-1 contract compatible): /fx1/search?q= | /fx1/doc/:id | /fx1/stats | /
export const FX2_VERSION = "fx2-js-1.1.0";
// v1.1.0 (Oct 13): corpus now two-tier (docs metadata + BODIES_DB text by content_hash).
// Snippets and doc retrieval read text from BODIES_DB; docs table provides metadata only.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json",
};

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: CORS });

function ftsQuery(q) {
  // quote every token -> implicit AND, neutralizes FTS5 syntax
  const toks = (q.toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,30}/g) || [])
    .map(t => t.replace(/'/g, ""))
    .filter(t => t.length >= 2)
    .slice(0, 12);
  return { match: toks.map(t => `"${t}"`).join(" "), toks };
}

function snippetFrom(head, toks) {
  if (!head) return "";
  const low = head.toLowerCase();
  let at = -1;
  for (const t of toks) { const i = low.indexOf(t); if (i >= 0 && (at < 0 || i < at)) at = i; }
  if (at < 0) return "… " + head.slice(0, 170).trim() + " …";
  const s = Math.max(0, at - 60);
  return "… " + head.slice(s, s + 200).replace(/\s+/g, " ").trim() + " …";
}

export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    const p = u.pathname;
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (p === "/" || p === "/fx1/version") return json({ ok: true, engine: "d1+fts5 contentless (corpus-wired)", version: FX2_VERSION, note: "index-only; text lives solely in the master corpus" });

    if (p === "/fx1/search" || p === "/fx1/search/") {
      const q = (u.searchParams.get("q") || "").slice(0, 200).trim();
      if (!q) return json({ ok: false, error: "missing q" }, 400);
      const { match, toks } = ftsQuery(q);
      if (!match) return json({ ok: true, engine: "d1+fts5 contentless", version: FX2_VERSION, count: 0, results: [] });
      let rows;
      try {
        const r = await env.DB_IDX.prepare("SELECT rowid FROM fx_fts WHERE fx_fts MATCH ?1 ORDER BY rank LIMIT 40").bind(match).all();
        rows = r.results || [];
      } catch (e) { return json({ ok: false, tier: "full-text", error: "fts error: " + String(e).slice(0, 120) }, 500); }
      // map to corpus docs (dedupe part hits)
      const hits = new Map(); // docid -> chunk_hits
      for (const row of rows) {
        const docId = Number(row.rowid) >> 6;
        hits.set(docId, (hits.get(docId) || 0) + 1);
      }
      const ids = [...hits.keys()].slice(0, 12);
      if (!ids.length) return json({ ok: true, engine: "d1+fts5 contentless", version: FX2_VERSION, count: 0, results: [], match: match });
      const ph = ids.map(() => "?").join(",");
      const meta = await env.DB_CORPUS.prepare(
        `SELECT id, title, url, domain, source, fetched_at, size, content_hash FROM docs WHERE id IN (${ph})`
      ).bind(...ids).all();
      const byId = new Map((meta.results || []).map(r => [r.id, r]));
      if (env.BODIES_DB) {
        const hashes = [...byId.values()].map(r => r.content_hash);
        const bh = hashes.map(() => "?").join(",");
        const bodies = await env.BODIES_DB.prepare(`SELECT content_hash, substr(text,1,4000) AS head FROM bodies WHERE content_hash IN (${bh})`).bind(...hashes).all();
        const bodyByHash = new Map((bodies.results || []).map(b => [b.content_hash, b.head]));
        for (const [id, m] of byId) m.head = bodyByHash.get(m.content_hash) || "";
      }
      const results = ids
        .filter(id => byId.has(id))
        .map(id => {
          const m = byId.get(id);
          return {
            id,
            url: m.url,
            title: m.title,
            domain: m.domain,
            source: m.source,
            status: "complete",
            char_len: m.size,
            fetched_at: m.fetched_at,
            extractor_version: FX2_VERSION,
            snippets: [snippetFrom(m.head, toks)],
            chunk_hits: hits.get(id),
          };
        });
      return json({ ok: true, engine: "d1+fts5 contentless (corpus-wired)", version: FX2_VERSION, count: results.length, match, results });
    }

    if (p.startsWith("/fx1/doc/")) {
      const id = parseInt(p.slice(9), 10);
      if (!Number.isInteger(id) || id < 1) return json({ ok: false, error: "bad id" }, 400);
      const r = await env.DB_CORPUS.prepare(
        "SELECT id, title, url, domain, source, language, fetched_at, size, content_hash FROM docs WHERE id = ?1"
      ).bind(id).first();
      if (!r) return json({ ok: false, error: "not found" }, 404);
      if (env.BODIES_DB) {
        const b = await env.BODIES_DB.prepare("SELECT text FROM bodies WHERE content_hash = ?1").bind(r.content_hash).first();
        if (b) r.text = b.text;
      }
      return json({ ok: true, engine: "d1+fts5 contentless (corpus-wired)", version: FX2_VERSION, doc: r });
    }

    if (p === "/fx1/stats") {
      let corpusCount = null, idxMeta = {};
      try {
        const c = await env.DB_CORPUS.prepare("SELECT COUNT(*) AS c FROM docs").first();
        corpusCount = c ? c.c : null;
      } catch (e) { corpusCount = "error: " + String(e).slice(0, 60); }
      try {
        const m = await env.DB_IDX.prepare("SELECT key, value FROM meta").all();
        idxMeta = Object.fromEntries((m.results || []).map(r => [r.key, r.value]));
      } catch (e) { idxMeta = { error: String(e).slice(0, 60) }; }
      return json({ ok: true, engine: "d1+fts5 contentless", version: FX2_VERSION, corpus_docs: corpusCount, index_meta: idxMeta });
    }

    return json({ ok: false, error: "not found" }, 404);
  },
};
