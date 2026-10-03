// HPR cloud node — Render free web service adapter (deploy glue by Magani, Oct 3).
// Long-running Node server — no routing magic, one port, process.env.PORT.
// HONEST LABELS: Render free SLEEPS when idle (first hit wakes it — a sleeping node reads
// as sleeping, never as lying); disk is EPHEMERAL; kv = null so this is a READ-ONLY
// verify-and-receive soil at the base book. Writes + mesh adoption refused honestly.
import { createRuntime } from "./hpr-runtime-core.js";
import { CAPSULE } from "./capsule-v15-merge.js";
import { BOUNDARY_TEXT, BOUNDARY_JSON } from "./boundary.js";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 3000);
const rt = createRuntime(CAPSULE, null, { walkedFrom: "HPR cloud node (Render free web service soil — SLEEPING class: sleeps when idle, first hit wakes it; ephemeral disk, disclosed; free-cloud expansion, owner Go, Oct 3 2026) — READ-ONLY at base book v15-merge-rung2 18/44 bf4681b5, engine pin 434c41d2" });
const CORS = { "access-control-allow-origin": "*", "cache-control": "no-store" };

const server = createServer(async (req, res) => {
  let p = "/";
  try { p = new URL(req.url, "http://hpr").pathname; } catch (_e) {}
  if (p === "/boundary") { res.writeHead(200, { ...CORS, "content-type": "text/plain; charset=utf-8" }); res.end(BOUNDARY_TEXT); return; }
  if (p === "/api/boundary") { res.writeHead(200, { ...CORS, "content-type": "application/json" }); res.end(BOUNDARY_JSON); return; }
  let body = "";
  if (req.method === "POST") { for await (const c of req) body += c; }
  const r = await rt.handle(req.method, p, body);
  res.writeHead(r.status, r.headers);
  res.end(r.body);
});
server.listen(PORT, () => console.log("HPR CLOUD NODE (Render) listening on :" + PORT + " — capsule " + CAPSULE.manifest.version + ", " + CAPSULE.state.records.length + " records, " + CAPSULE.state.chain.length + " seals"));
