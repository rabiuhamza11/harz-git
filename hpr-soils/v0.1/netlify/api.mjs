// HPR cloud node — Netlify Functions v2 adapter (deploy glue by Magani, Oct 3).
// NETLIFY LAW: v2 functions speak web-standard Request/Response, and a single function can
// claim the whole URL space via export const config = { path: "/*" } — original path arrives
// in req.url. One function = one bundle = frozen pair traced by the bundler.
// kv = null: READ-ONLY soil — writes + mesh adoption refused honestly (see /boundary).
import { createRuntime } from "./hpr-runtime-core.js";
import { CAPSULE } from "./capsule-v15-merge.js";
import { BOUNDARY_TEXT, BOUNDARY_JSON } from "./boundary.js";

const rt = createRuntime(CAPSULE, null, { walkedFrom: "HPR cloud node (Netlify functions soil — ephemeral class, disclosed; free-cloud expansion, owner Go, Oct 3 2026) — READ-ONLY at base book v15-merge-rung2 18/44 bf4681b5, engine pin 434c41d2" });
const CORS = { "access-control-allow-origin": "*", "cache-control": "no-store" };

export const config = { path: "/*" };

export default async (req) => {
  let p = "/";
  try { p = new URL(req.url, "http://hpr").pathname; } catch (_e) {}
  if (p === "/boundary") return new Response(BOUNDARY_TEXT, { headers: { ...CORS, "content-type": "text/plain; charset=utf-8" } });
  if (p === "/api/boundary") return new Response(BOUNDARY_JSON, { headers: { ...CORS, "content-type": "application/json" } });
  let body = "";
  if (req.method === "POST") body = await req.text();
  const r = await rt.handle(req.method, p, body);
  return new Response(r.body, { status: r.status, headers: r.headers });
};
