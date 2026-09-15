// RESOLVER UNIFICATION BATTERY — pre-registered 10 tests (Sep 15, 2026)
// One engine, four projections: CLI / HTTP+DoH / library-browser / offline-mesh cache.
// Run: node resolver-battery.js  (starts its own HTTP server on :8989, kills it after)
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const api = require("./harz-resolver.js");

const ZONE = path.join(__dirname, "../schema-v2/draft-zone-v2-77names.json");
const results = [];
const T = (id, name, ok) => { results.push(`${id} ${ok ? "PASS" : "FAIL"} — ${name}`); if (!ok) process.exitCode = 1; };

(async () => {
  const zoneObj = JSON.parse(fs.readFileSync(ZONE, "utf8"));

  // R1: resolve an existing name via library projection
  const engine = api.createEngine({ verify: api.nodeVerifier() });
  engine.loadZone(zoneObj);
  const r1 = engine.resolve("pay.harz");
  T("RU-R1", "library: pay.harz resolves to its live endpoint",
    r1 && r1.found && r1.endpoints.https === "https://harzpay.harz.workers.dev");

  // R2: NXDOMAIN is honest null
  const r2 = engine.resolve("doesnotexist.harz");
  T("RU-R2", "NXDOMAIN returns honest null (no guessing)", r2 === null);

  // R3: fail-closed — tampered zone REFUSED at load
  const bad = JSON.parse(JSON.stringify(zoneObj));
  bad.records[0].endpoints.https = "https://evil.example";
  let refused = false;
  try { const e2 = api.createEngine({ verify: api.nodeVerifier() }); e2.loadZone(bad); } catch (e) { refused = /SIGNATURE FAILED/.test(e.message); }
  T("RU-R3", "fail-closed: tampered zone REFUSED at load", refused);

  // R4: PENDING identity is visible, flagged identity_pending
  const r4 = engine.resolve("wallet.harz");
  T("RU-R4", "PENDING identity visible + flagged (no fabrication hidden)",
    r4 && r4.identity === "PENDING" && r4.identity_pending === true);

  // R5: transport preference — mesh-only query on https-only record = honest empty endpoints
  const r5 = engine.resolve("super.harz", { transports: ["mesh"] });
  T("RU-R5", "mesh-only query on https-only name = honest empty endpoints",
    r5 && Object.keys(r5.endpoints).length === 0 && r5.available_transports.includes("https"));

  // R6: DoH JSON projection shape (RFC 8484 JSON)
  const dohOk = api.toDohJSON(r1, "pay.harz");
  const dohNx = api.toDohJSON(null, "nope.harz");
  T("RU-R6", "DoH JSON: Status 0 + TXT type 16 answer; NXDOMAIN Status 3",
    dohOk.Status === 0 && dohOk.Answer[0].type === 16 && dohOk.Question[0].name === "pay.harz." &&
    dohNx.Status === 3);

  // R7: offline/mesh cache projection — store verified zone, reload, re-verify, resolve
  const cachePath = "/tmp/harz-zone-cache.json";
  api.cacheStore(null, zoneObj, fs, cachePath);
  const cached = api.cacheLoad(fs, cachePath, api.nodeVerifier());
  const engine3 = api.createEngine({ verify: api.nodeVerifier() });
  engine3.loadZone(cached);
  const r7 = engine3.resolve("store.harz");
  T("RU-R7", "offline cache: store→reload→re-verify→resolve (zero network)",
    r7 && r7.endpoints.https === "https://harz-store.harz.workers.dev");
  // and a tampered cache is refused
  const badCache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  badCache.records[5].routing.nodes = ["evil-node"];
  fs.writeFileSync(cachePath, JSON.stringify(badCache));
  let cacheRefused = false;
  try { api.cacheLoad(fs, cachePath, api.nodeVerifier()); } catch (e) { cacheRefused = true; }
  T("RU-R7b", "tampered cache REFUSED on reload", cacheRefused);

  // R8: CLI + HTTP + library projections give IDENTICAL answers
  const cli = execSync(`node ${path.join(__dirname,"harz-resolver.js")} resolve pay.harz --zone ${ZONE}`).toString();
  const cliObj = JSON.parse(cli);
  const srv = spawn("node", [path.join(__dirname, "harz-resolver.js"), "serve", "--zone", ZONE, "--port", "8989"], { stdio: "pipe" });
  await new Promise(res => srv.stderr.on("data", d => { if (String(d).includes("serving")) res(); }));
  const httpObj = await (await fetch("http://localhost:8989/resolve?name=pay.harz")).json();
  const dohHttp = await (await fetch("http://localhost:8989/doh?name=pay.harz")).json();
  const httpNx = await (await fetch("http://localhost:8989/resolve?name=zzz.harz"));
  const dohHttpNx = await (await fetch("http://localhost:8989/doh?name=zzz.harz")).json();
  srv.kill("SIGKILL");
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  T("RU-R8", "CLI == HTTP == library: identical answer for all projections",
    same(cliObj, httpObj) && same(httpObj, r1));

  // R8b: HTTP statuses honest — NXDOMAIN 404; DoH NXDOMAIN Status 3
  T("RU-R8b", "HTTP: NXDOMAIN 404 + DoH Status 3 over the wire",
    httpNx.status === 404 && dohHttpNx.Status === 3 && dohHttp.Status === 0);

  // R10: 77/77 cross-check — v2 draft zone resolution matches LIVE v1 /resolve API
  try {
    const live = await (await fetch("https://harz-root.harz.workers.dev/zone")).text();
    const liveMap = {};
    for (const line of live.split("\n")) {
      const m = line.match(/^([a-z0-9-]+\.harz)\.\s+\d+\s+IN\s+TXT\s+"(.*)"$/);
      if (!m) continue;
      try { liveMap[m[1]] = JSON.parse(m[2].replace(/\\"/g, '"')).url; } catch (e) {}
    }
    let match = 0, total = 0, mismatch = [];
    for (const [name, url] of Object.entries(liveMap)) {
      total++;
      const r = engine.resolve(name);
      // reserved names: live url is null AND v2 record has no https endpoint → MATCH (both honest)
      if (url === null || url === undefined) {
        if (r && !("https" in r.endpoints)) match++; else mismatch.push(name + "(live-reserved)");
      } else if (r && r.endpoints.https === url) match++; else mismatch.push(name);
    }
    T("RU-R10", `77/77 cross-check vs LIVE v1 zone (${match}/${total} match${mismatch.length ? ", mismatches: " + mismatch.join(",") : ""})`,
      total === 77 && match === 77);
  } catch (e) {
    T("RU-R10", "cross-check vs live (network): " + e.message, false);
  }

  console.log(results.join("\n"));
  const pass = results.filter(r => r.includes("PASS")).length;
  console.log(`\nBATTERY: ${pass}/${results.length} PASS`);
})();
