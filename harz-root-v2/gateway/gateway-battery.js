// GATEWAY FABRIC BATTERY — pre-registered 10 tests (Sep 15, 2026)
// Software proof of the public doorway: pay.harz.ng ↔ pay.harz, deterministic 1:1,
// canonical identity preserved, honest reserved, fail-closed, mirror generation.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const Gateway = require("./harz-gateway.js");
const Resolver = require("../resolver/harz-resolver.js");

const ZONE = path.join(__dirname, "../schema-v2/draft-zone-v2-77names.json");
const results = [];
const T = (id, name, ok) => { results.push(`${id} ${ok ? "PASS" : "FAIL"} — ${name}`); if (!ok) process.exitCode = 1; };

(async () => {
  const zoneObj = JSON.parse(fs.readFileSync(ZONE, "utf8"));
  const engine = Resolver.createEngine({ verify: Resolver.nodeVerifier() });
  engine.loadZone(zoneObj);
  const gw = Gateway.createGateway(engine);

  // G1: deterministic 1:1 mapping for ALL 77 names — both directions
  let bijection = true, firstBad = "";
  for (const rec of zoneObj.records) {
    const pub = Gateway.toPublic(rec.name);
    const back = Gateway.toCanonical(pub);
    if (back !== rec.name || pub !== rec.name.replace(/\.harz$/, ".harz.ng")) { bijection = false; firstBad = rec.name; break; }
  }
  T("GF-G1", "77/77 names: .harz ↔ .harz.ng mapping is a deterministic bijection" + (firstBad ? ` (broke at ${firstBad})` : ""), bijection && zoneObj.records.length === 77);

  // G2: doorway resolves the PUBLIC form through the engine
  const r2 = gw.resolve("pay.harz.ng");
  T("GF-G2", "pay.harz.ng → resolves to the live pay endpoint",
    r2.found && r2.endpoints.https === "https://harzpay.harz.workers.dev");

  // G3: canonical identity survives — response carries canonical_name pay.harz
  T("GF-G3", "canonical identity preserved (canonical_name = pay.harz, public_form = pay.harz.ng)",
    r2.canonical_name === "pay.harz" && r2.public_form === "pay.harz.ng");

  // G4: both spellings give the IDENTICAL answer (one book, one engine)
  const viaCanonical = gw.resolve("pay.harz");
  const strip = (o) => { const c = { ...o }; delete c.queried_as; return c; };
  T("GF-G4", ".harz query and .harz.ng query → identical answer modulo queried_as",
    JSON.stringify(strip(viaCanonical)) === JSON.stringify(strip(r2)));

  // G5: NXDOMAIN honest on public form
  const r5 = gw.resolve("zzz-ghost.harz.ng");
  T("GF-G5", "NXDOMAIN on public form → honest not-found", !r5.found && r5.verdict === "NXDOMAIN");

  // G6: non-HARZ names rejected honestly (no guessing)
  const r6 = gw.resolve("google.com");
  T("GF-G6", "google.com → NOT_A_HARZ_NAME (no fallback, no guessing)", r6.error === "NOT_A_HARZ_NAME");

  // G7: reserved names stay honest through the doorway
  const r7 = gw.resolve("content.harz.ng");
  T("GF-G7", "reserved name through doorway → no endpoint, no fabrication",
    r7.found && !("https" in r7.endpoints) && Object.keys(r7.endpoints).length === 0);

  // G8: fail-closed — gateway built on tampered zone REFUSES
  let refused = false;
  try {
    const bad = JSON.parse(JSON.stringify(zoneObj));
    bad.records[0].endpoints.https = "https://evil.example";
    const e2 = Resolver.createEngine({ verify: Resolver.nodeVerifier() });
    e2.loadZone(bad); // must throw
  } catch (e) { refused = /SIGNATURE FAILED/.test(e.message); }
  T("GF-G8", "fail-closed: tampered zone can never reach the gateway", refused);

  // G9: public mirror zone generation — the harz.ng artifact, ready for purchase day
  const mirror = gw.generatePublicMirrorZone();
  const cnames = (mirror.text.match(/IN CNAME/g) || []).length;
  const reservedTxt = (mirror.text.match(/reserved — no live endpoint/g) || []).length;
  T("GF-G9", `mirror zone: 75 CNAME + 2 honest reserved TXT (${cnames}/${reservedTxt})`,
    cnames === 75 && reservedTxt === 2 && mirror.origin === "harz.ng." &&
    mirror.text.includes("$ORIGIN harz.ng."));

  // G10: HTTP doorway server — public form over the wire, DoH shape, NXDOMAIN 404
  const srv = spawn("node", [path.join(__dirname, "harz-gateway.js"), "serve", "--zone", ZONE, "--port", "8990"], { stdio: "pipe" });
  await new Promise(res => srv.stderr.on("data", d => { if (String(d).includes("serving")) res(); }));
  const httpPub = await (await fetch("http://localhost:8990/resolve?name=pay.harz.ng")).json();
  const dohPub = await (await fetch("http://localhost:8990/doh?name=pay.harz.ng")).json();
  const nxStatus = (await fetch("http://localhost:8990/resolve?name=zzz.harz.ng")).status;
  const mirrorHttp = await (await fetch("http://localhost:8990/mirror")).json();
  srv.kill("SIGKILL");
  T("GF-G10", "HTTP doorway: /resolve pay.harz.ng 200 + /doh Status 0 + NXDOMAIN 404 + /mirror live",
    httpPub.found === true && httpPub.canonical_name === "pay.harz" &&
    dohPub.Status === 0 && nxStatus === 404 && mirrorHttp.cname_count === 75);

  console.log(results.join("\n"));
  const pass = results.filter(r => r.includes("PASS")).length;
  console.log(`\nBATTERY: ${pass}/${results.length} PASS`);
  fs.writeFileSync(path.join(__dirname, "public-mirror-harz.ng.zone"), mirror.text);
  console.log("mirror zone file written: public-mirror-harz.ng.zone");
})();
