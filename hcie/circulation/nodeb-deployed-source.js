--5dcefe35d06949d8d1107b17a288f9e4322f8e4816c4a97fb8efabbe4bd3
Content-Disposition: form-data; name="nodeb.js"; filename="nodeb.js"
Content-Type: application/javascript+module

// HARZ HCIE NODE B — second HARZ node (mirror), independent D1, verifies before storing.
// Part 2 of the circulation mission: HARZ -> HARZ NODE -> device.
const NODE_A = "https://harz-hcie.harz.workers.dev";
const J = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { "content-type": "application/json", "cache-control": "no-store" } });
async function sha256hex(s) {
  const b = new TextEncoder().encode(s);
  const d = await crypto.subtle.digest("SHA-256", b);
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, "0")).join("");
}
export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    try {
      if (u.pathname === "/") return J({ ok: true, node: "HARZ HCIE NODE B", role: "mirror", upstream: NODE_A, law: "no object stored unless its SHA-256 matches the canonical hash" });
      if (u.pathname === "/api/status") {
        const c = await env.DB.prepare("SELECT COUNT(*) n, COALESCE(SUM(bytes),0) b FROM objects").first();
        return J({ node: "B", objects: c.n, bytes: c.b, upstream: NODE_A, ts: new Date().toISOString() });
      }
      // pull one object from node A, verify locally, store only if integrity holds
      if (u.pathname === "/api/sync" && req.method === "POST") {
        const body = await req.json().catch(() => ({}));
        const id = String(body.id || "");
        if (!id) return J({ ok: false, error: "id required" }, 400);
        const url = NODE_A + "/api/hcie/object/" + encodeURIComponent(id);
        // same-zone workers cannot fetch each other by public URL (Cloudflare 1042);
        // a service binding is the supported node->node channel.
        const r = env.UPSTREAM ? await env.UPSTREAM.fetch(new Request(url, { headers: { "x-hcie-node": "B" } })) : await fetch(url, { cf: { cacheTtl: 0 } });
        if (!r.ok) return J({ ok: false, error: "upstream refused: HTTP " + r.status }, 502);
        const o = await r.json();
        const content = o.content != null ? String(o.content) : null;
        if (content == null) return J({ ok: false, error: "upstream returned no content" }, 502);
        const local = await sha256hex(content);
        const canonical = String(o.canonical_sha256 || "").toLowerCase();
        if (!canonical || local !== canonical) {
          return J({ ok: false, verdict: "REJECTED", reason: "hash mismatch — refused to store", local_sha256: local, canonical_sha256: canonical }, 409);
        }
        await env.DB.prepare(
          "INSERT INTO objects (upstream_id, source_key, url, title, canonical_sha256, bytes, content, version, upstream_ts, synced_ts) " +
          "VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(upstream_id) DO UPDATE SET content=excluded.content, canonical_sha256=excluded.canonical_sha256, bytes=excluded.bytes, version=excluded.version, synced_ts=excluded.synced_ts"
        ).bind(id, o.source_key || "", o.url || "", o.title || "", local, content.length, content, o.version || 1, o.captured_ts || "", new Date().toISOString()).run();
        return J({ ok: true, verdict: "STORED_AND_VERIFIED", upstream_id: id, sha256: local, bytes: content.length, version: o.version || 1 });
      }
      // serve from THIS node only
      const m = u.pathname.match(/^\/api\/object\/(.+)$/);
      if (m) {
        const row = await env.DB.prepare("SELECT * FROM objects WHERE upstream_id = ?1").bind(decodeURIComponent(m[1])).first();
        if (!row) return J({ ok: false, error: "not held by this node", node: "B", id: m[1], hint: "POST /api/sync {id} first" }, 404);
        const recheck = await sha256hex(row.content);
        if (recheck !== row.canonical_sha256) return J({ ok: false, error: "INTEGRITY_FAILURE at rest", node: "B" }, 502);
        return J({ node: "B", id: row.upstream_id, source_key: row.source_key, url: row.url, title: row.title, canonical_sha256: row.canonical_sha256, bytes: row.bytes, version: row.version, content: row.content, verified_at_rest: true, synced_ts: row.synced_ts });
      }
      if (u.pathname === "/api/objects") {
        const rows = await env.DB.prepare("SELECT upstream_id, source_key, title, canonical_sha256, bytes, version, synced_ts FROM objects ORDER BY synced_ts DESC LIMIT 50").all();
        return J({ node: "B", objects: rows.results });
      }
      return J({ ok: false, error: "not found" }, 404);
    } catch (e) {
      return J({ ok: false, error: String(e && e.message || e) }, 500);
    }
  }
};

--5dcefe35d06949d8d1107b17a288f9e4322f8e4816c4a97fb8efabbe4bd3--
