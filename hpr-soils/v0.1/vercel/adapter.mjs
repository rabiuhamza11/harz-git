// HPR cloud node — Vercel adapter core (deploy glue by Magani, Oct 3).
// VERCEL LAWS (learned live): (1) Node functions speak (req,res) — returned Response is ignored;
// (2) multi-segment catch-alls unreliable → catch-all serves the single-segment /api/* set
// (FROZEN by the capsule), explicit wrappers serve root paths + /api/mesh/receive (2 segments).
// (3) Hobby plan: max 12 functions → 9 deployed. kv = null: READ-ONLY soil, refusals honest.
import { createRuntime } from "./hpr-runtime-core.js";
import { CAPSULE } from "./capsule-v15-merge.js";
import { BOUNDARY_TEXT, BOUNDARY_JSON } from "./node-cloud/boundary.js";
const rt = createRuntime(CAPSULE, null, { walkedFrom: "HPR cloud node (Vercel serverless soil — ephemeral class, disclosed; free-cloud expansion, owner Go, Oct 3 2026) — READ-ONLY at base book v15-merge-rung2 18/44 bf4681b5, engine pin 434c41d2" });
const CORS = { "access-control-allow-origin": "*", "cache-control": "no-store" };
async function run(req, res, path) {
  if (path === "/boundary") { res.writeHead(200, { ...CORS, "content-type": "text/plain; charset=utf-8" }); res.end(BOUNDARY_TEXT); return; }
  if (path === "/api/boundary") { res.writeHead(200, { ...CORS, "content-type": "application/json" }); res.end(BOUNDARY_JSON); return; }
  let body = "";
  if (req.method === "POST") { for await (const c of req) body += c; }
  const r = await rt.handle(req.method, path, body);
  res.writeHead(r.status, r.headers);
  res.end(r.body);
}
export function serveFixed(req, res, fixedPath) { return run(req, res, fixedPath); }
export async function serveDynamic(req, res) {
  let p = "/";
  try { p = new URL(req.url, "http://hpr").pathname; } catch (_e) {}
  return run(req, res, p);
}
