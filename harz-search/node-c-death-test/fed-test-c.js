// HARZ SEARCH v0.1.1 — FEDERATION SUITE, NODE C EDITION (PORTABILITY LAW v1)
// Same canonical contract as fed-test.js (took_ms excluded — law L9).
// Usage: node fed-test-c.js <nodeC-base> [nodeA-base]
// Default node A = sandbox instance on 127.0.0.1:8791 (same artifact).
"use strict";
var http = require("http");
var https = require("https");

var A = process.argv[3] || "http://127.0.0.1:8791";
var C = process.argv[2] || "http://127.0.0.1:8795";

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
    var ra, rc;
    try { ra = await get(A, path); } catch (e) { ra = "ERR_A:" + e.message; }
    try { rc = await get(C, path); } catch (e) { rc = "ERR_C:" + e.message; }
    var ca, cc;
    try { ca = canonical(ra); } catch (e) { ca = "PARSE_A_FAIL"; }
    try { cc = canonical(rc); } catch (e) { cc = "PARSE_C_FAIL"; }
    var ok = ca === cc && ca !== "PARSE_A_FAIL" && cc !== "PARSE_C_FAIL";
    if (ok) pass++; else fail++;
    var totalA = "?"; try { totalA = JSON.parse(ra).total; } catch (e) {}
    evidence.push({ q: q, identical: ok, total: totalA });
    console.log((ok ? "PASS" : "FAIL") + " [" + totalA + "] " + q);
  }
  var verdict = fail === 0 ? "BYTE-IDENTICAL" : "DIVERGENCE";
  console.log("----\nFEDERATION A-vs-C " + pass + "/" + (pass + fail) + " — " + verdict);
  require("fs").writeFileSync("node-c-federation.json", JSON.stringify({
    date: new Date().toISOString(), node_a: A, node_c: C, substrate_c: "phone-stand-in-or-phone",
    queries: QUERIES.length, pass: pass, fail: fail, verdict: verdict,
    contract: "v0.1.1", law: "PORTABILITY LAW v1 death test rung", evidence: evidence }, null, 2));
  process.exit(fail === 0 ? 0 : 1);
})();
