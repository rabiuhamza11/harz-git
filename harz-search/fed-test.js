// HARZ SEARCH v0.1.1 — FEDERATION SUITE (owner-ordered)
// Same query against Node A (sandbox) and Node B (Cloudflare).
// Canonical JSON (took_ms excluded) must be BYTE-IDENTICAL.
"use strict";
var http = require("http");
var https = require("https");

var A = "http://127.0.0.1:8791";
var B = "https://harz-search.hamzarabiu390.workers.dev";

var QUERIES = [
  "nigeria tax", "harz search", "gdeg token", "nrl staking", "cloudflare workers",
  "taraba state", "digital marketing", "small business nigeria", "blockchain wallet",
  "paystack payment", "education students", "open source software", "science research",
  "government policy", "abuja estate", "film distribution", "music production",
  "health insurance", "fintech", "nigeria", "search", "the of and",
  "nigeria zzzqqq", "PYTHON programming", "machine learning ai",
  "data protection privacy law", "ecommerce online store customers",
  "nigeria nigeria", "tax calculator 2026", "workers kv d1"
];

function get(base, path) {
  return new Promise(function (resolve, reject) {
    var t = setTimeout(function () { reject(new Error("timeout " + base + path)); }, 30000);
    var lib = base.indexOf("https:") === 0 ? https : http;
    var req = lib.get(base + path, function (res) {
      var body = "";
      res.on("data", function (c) { body += c; });
      res.on("end", function () { clearTimeout(t); resolve(body); });
    });
    req.on("error", function (e) { clearTimeout(t); reject(e); });
  });
}

function canonical(raw) {
  var d = JSON.parse(raw);
  delete d.took_ms; // performance metadata — excluded by contract L9
  return JSON.stringify(d);
}

(async function () {
  var pass = 0, fail = 0, evidence = [];
  for (var i = 0; i < QUERIES.length; i++) {
    var q = QUERIES[i];
    var path = "/search?q=" + encodeURIComponent(q);
    var ra, rb;
    try { ra = await get(A, path); } catch (e) { ra = "ERR_A:" + e.message; }
    try { rb = await get(B, path); } catch (e) { rb = "ERR_B:" + e.message; }
    var ca, cb;
    try { ca = canonical(ra); } catch (e) { ca = "PARSE_A_FAIL"; }
    try { cb = canonical(rb); } catch (e) { cb = "PARSE_B_FAIL"; }
    var ok = ca === cb && ca !== "PARSE_A_FAIL" && cb !== "PARSE_B_FAIL";
    if (ok) pass++; else fail++;
    var totalA = "?"; try { totalA = JSON.parse(ra).total; } catch (e) {}
    evidence.push({ q: q, identical: ok, total: totalA });
    console.log((ok ? "PASS" : "FAIL") + " [" + totalA + "] " + q);
  }
  console.log("----\nFEDERATION " + pass + "/" + (pass + fail) + (fail === 0 ? " — BYTE-IDENTICAL" : " — DIVERGENCE FOUND"));
  require("fs").writeFileSync("corpus/federation-test.json", JSON.stringify({
    date: new Date().toISOString(), node_a: A, node_b: B,
    queries: QUERIES.length, pass: pass, fail: fail, verdict: fail === 0 ? "BYTE-IDENTICAL" : "DIVERGENCE",
    contract: "v0.1.1", evidence: evidence }, null, 2));
  process.exit(fail === 0 ? 0 : 1);
})();
