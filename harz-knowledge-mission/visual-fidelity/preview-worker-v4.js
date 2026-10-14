// HARZ Visual Fidelity preview — harz-vf-preview (a1) — v4
// Serves self-contained offline captures from VF_KV (raw values <=25MB).
// v4 change: brotli-serving path REMOVED (2026-10-14) — the CF edge
// re-encodes Content-Encoding: br responses, double-compressing them for
// br-capable clients: broken path, honestly removed. Oversized packs
// (immigration-v3 38.8MB raw, health-v2 36.6MB raw) are committed to the
// repo as review artifacts and await the owner's serving ruling:
// R2 enablement (one-time dashboard action, aligns with standing
// "R2 for all HARZ hosting" instruction) or Stage 2 dedup-format design
// (measured: 31MB of the 38.8MB is duplicate data URIs).
// Stage 2 sharding is NOT authorized (owner hold) — no split-storage workaround used.
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    let p = u.pathname.replace(/^\/+|\/+$/g, "");
    if (!p) return json({ ok: true, engine: "vf-preview-0.4", packs: ["nimc", "nimc-v3", "cac"], oversized_artifacts: ["immigration-v3 (38.8MB, committed, serving pending owner ruling)", "health-v2 (36.6MB, committed, serving pending owner ruling)"] });
    if (p.endsWith(".html")) p = p.slice(0, -5);
    try {
      const v = await env.VF_KV.get(p);
      if (!v) {
        if (p === "immigration-v3" || p === "health")
          return json({ ok: false, pack: p, reason: "raw pack exceeds the 25MB KV value ceiling", status: "committed to harz-git as review artifact; serving awaits owner ruling: R2 enablement or Stage 2 dedup format", hashes: p === "immigration-v3" ? { sha256: "981c826038d63505739b4e9f3c7b4408474a252c10cc71bd7a72d588778b6402" } : { sha256: "63750cdfdbe8305f92c2272fb2a84c137a7f5816134b607f09447a99ba8ffd25" } }, 404);
        return json({ ok: false, error: "pack not found" }, 404);
      }
      return new Response(v, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "x-harz-pack": p } });
    } catch (e) {
      return json({ ok: false, error: String(e) }, 500);
    }
  }
};
