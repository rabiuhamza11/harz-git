// HARZ FX-2 index builder (cloud) — fxbuild-1.0.0 (Oct 12, 2026)
// Replaces the sandbox builder (killed by every sandbox recycle). Runs as a
// Cloudflare Worker: /step does bounded work per invocation; cron "* * * * *"
// drives it to completion. Same checkpoints (meta bandX_last_id) as the
// sandbox builder -> fully interoperable and resumable. Same guarantees:
// contentless FTS5 (no text stored), per-window rowid-existence guard
// (idempotent restarts, zero duplicate postings), forward-only checkpoints.
// rowid = corpus_id*64 + part; doc id = rowid >> 6.
const BANDS = [[1, 450001], [450001, 900001], [900001, 99999999]];
const PART_CAP = 85000;      // bytes per FTS part
const STMT_PARTS = 40;       // parts per D1 batch
const WIN_DOCS = 200;        // docs per read window
const WIN_BYTES = 2_000_000; // bytes per read window
const WALL_BUDGET_MS = 18000;

const enc = new TextEncoder();
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });

function partsOf(text) {
  const b = enc.encode(text);
  if (b.length <= PART_CAP) return [text];
  const words = text.split(" ");
  const out = []; let cur = [], curb = 0;
  for (const w of words) {
    const wb = enc.encode(w).length + (cur.length ? 1 : 0);
    if (cur.length && curb + wb > PART_CAP) { out.push(cur.join(" ")); cur = [w]; curb = enc.encode(w).length; }
    else { cur.push(w); curb += wb; }
  }
  if (cur.length) out.push(cur.join(" "));
  const ps = out.slice(0, 64);
  if (out.length > 64) ps[63] = ps[63].slice(0, 400000);
  return ps.length ? ps : [text];
}

async function metaSet(db, entries) {
  const stmts = Object.entries(entries).map(([k, v]) =>
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)").bind(k, String(v)));
  await db.batch(stmts);
}
async function metaGet(db, keys) {
  const r = await db.prepare(`SELECT key, value FROM meta WHERE key IN (${keys.map(() => "?").join(",")})`).bind(...keys).all();
  const m = {}; for (const row of r.results || []) m[row.key] = row.value;
  return m;
}

async function buildStep(env) {
  const t0 = Date.now();
  const state = await metaGet(env.DB_IDX, BANDS.flatMap((_, i) => [`band${i}_last_id`, `band${i}_docs`, `band${i}_bytes`]));
  const band = { last: [], docs: [], bytes: [], done: [] };
  for (let i = 0; i < 3; i++) {
    band.last[i] = state[`band${i}_last_id`] ? Number(state[`band${i}_last_id`]) : BANDS[i][0] - 1;
    band.docs[i] = Number(state[`band${i}_docs`] || 0);
    band.bytes[i] = Number(state[`band${i}_bytes`] || 0);
    band.done[i] = state[`band${i}_status`] === "done";
  }
  let cur = 0, batches = 0, indexed_parts = 0, dup_skipped = 0, docs_done = 0, errors = 0, bytes_done = 0;
  while (Date.now() - t0 < WALL_BUDGET_MS) {
    // pick the least-progressed live band (relative to its range)
    const live = [0, 1, 2].filter(i => !band.done[i]);
    if (!live.length) break;
    cur = live.reduce((a, i) =>
      (band.last[i] - BANDS[i][0]) / (BANDS[i][1] - BANDS[i][0]) <
      (band.last[a] - BANDS[a][0]) / (BANDS[a][1] - BANDS[a][0]) ? i : a, live[0]);
    const [LO, HI] = BANDS[cur];
    let proj;
    try {
      proj = await env.DB_CORPUS.prepare(`SELECT id, size FROM docs WHERE id > ? AND id < ? ORDER BY id LIMIT ${WIN_DOCS}`).bind(band.last[cur], HI).all();
    } catch (e) { errors++; if (errors > 5) break; continue; }
    if (!proj.results || !proj.results.length) { band.done[cur] = true; await metaSet(env.DB_IDX, { [`band${cur}_status`]: "done" }); continue; }
    const win = []; let acc = 0;
    for (const r of proj.results) { win.push(r.id); acc += r.size || 1; if (acc >= WIN_BYTES) break; }
    const endId = win[win.length - 1];
    const byId = new Map();
    try {
      const RC = 90; // D1 max 100 bound params per query
      for (let i = 0; i < win.length; i += RC) {
        const sl = win.slice(i, i + RC);
        const rows = await env.DB_CORPUS.prepare(`SELECT id, text FROM docs WHERE id IN (${sl.map(() => "?").join(",")})`).bind(...sl).all();
        for (const r of rows.results || []) byId.set(r.id, r.text);
      }
    } catch (e) { errors++; console.log("read err: " + String(e).slice(0, 150)); if (errors > 5) break; continue; }
    // build parts, guard, insert
    const items = [];
    for (const id of win) {
      const text = byId.get(id);
      if (text == null) continue;
      const t = String(text).replace(/\x00/g, " ");
      const ps = partsOf(t);
      for (let p = 0; p < ps.length; p++) items.push([id * 64 + p, ps[p]]);
    }
    if (items.length) {
      let have = new Set();
      try {
        const CH = 90; // D1 max 100 bound params per query
        for (let i = 0; i < items.length; i += CH) {
          const sl = items.slice(i, i + CH).map(x => x[0]);
          const g = await env.DB_IDX.prepare(`SELECT rowid FROM fx_fts WHERE rowid IN (${sl.map(() => "?").join(",")})`).bind(...sl).all();
          for (const r of g.results || []) have.add(r.rowid);
        }
      } catch (e) { errors++; if (errors > 5) break; continue; }
      const todo = items.filter(x => !have.has(x[0]));
      dup_skipped += items.length - todo.length;
      for (let i = 0; i < todo.length; i += STMT_PARTS) {
        const chunk = todo.slice(i, i + STMT_PARTS);
        try {
          await env.DB_IDX.batch(chunk.map(([rid, text]) => env.DB_IDX.prepare("INSERT INTO fx_fts (rowid, text) VALUES (?, ?)").bind(rid, text)));
          indexed_parts += chunk.length;
        } catch (e) { errors++; console.log("insert err: " + String(e).slice(0, 150)); if (errors > 5) break; }
      }
    }
    band.last[cur] = endId; band.docs[cur] += win.length; band.bytes[cur] += acc;
    docs_done += win.length; bytes_done += acc; batches++;
    await metaSet(env.DB_IDX, {
      [`band${cur}_last_id`]: band.last[cur], [`band${cur}_docs`]: band.docs[cur], [`band${cur}_bytes`]: band.bytes[cur],
    });
    if (errors > 5) break;
  }
  return {
    ok: true, engine: "fxbuild-1.0.0", wall_ms: Date.now() - t0, batches, docs_done, parts_indexed: indexed_parts,
    dup_skipped, errors, bands: [0, 1, 2].map(i => ({ last: band.last[i], docs: band.docs[i], mb: (band.bytes[i] / 1e6).toFixed(0), done: band.done[i] })),
  };
}

export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    const p = u.pathname;
    if (p === "/" ) return json({ ok: true, engine: "fxbuild-1.0.0", note: "FX-2 index builder; /step runs one bounded step; /status reads checkpoints" });
    if (p === "/step") return json(await buildStep(env));
    if (p === "/status") {
      const m = await metaGet(env.DB_IDX, BANDS.flatMap((_, i) => [`band${i}_last_id`, `band${i}_docs`, `band${i}_bytes`, `band${i}_status`]));
      return json({ ok: true, checkpoints: m });
    }
    return json({ ok: false, error: "not found" }, 404);
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(buildStep(env).then(r => console.log(JSON.stringify(r))).catch(e => console.log("step error: " + e))); },
};
