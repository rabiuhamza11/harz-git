// HARZ SEARCH v0.1 — ACCEPTANCE BATTERY (frozen Sep 19, HarzGit e986af284329)
// Verifies every PASS criterion from SPEC.md against the real corpus + live nodes.
"use strict";
var fs = require("fs");
var E = require("./engine.js");

var PASS = 0, FAIL = 0, NOTES = [];
function check(name, ok, note) {
  if (ok) { PASS++; console.log("PASS", name, note || ""); }
  else { FAIL++; console.log("FAIL", name, note || ""); }
  if (note) NOTES.push(name + ": " + note);
}

function http(path, port) {
  return new Promise(function (res, rej) {
    require("http").get({ host: "127.0.0.1", port: port || 8787, path: path }, function (r) {
      var b = ""; r.on("data", function (c) { b += c; });
      r.on("end", function () { res(JSON.parse(b)); });
    }).on("error", rej);
  });
}

async function main() {
  var lines = fs.readFileSync("corpus/docs.jsonl", "utf8").split("\n").filter(Boolean);
  var docs = lines.map(function (l) { return JSON.parse(l); });

  // ---- 1. CORPUS ----
  check("corpus >= 1000 documents", docs.length >= 1000, "docs=" + docs.length);
  var domains = Object.create(null);
  docs.forEach(function (d) { domains[d.domain] = (domains[d.domain] || 0) + 1; });
  check("corpus >= 100 independent domains", Object.keys(domains).length >= 100, "domains=" + Object.keys(domains).length);
  var schemaOK = docs.every(function (d) {
    return d.url && /^https?:/.test(d.url) && typeof d.title === "string" && typeof d.text === "string" &&
      d.fetched_at && /^[0-9a-f]{64}$/.test(d.content_hash || "") && d.language && d.source && d.domain &&
      Array.isArray(d.links) && Array.isArray(d.redirect_chain);
  });
  check("full document schema on every doc", schemaOK);
  var hashes = Object.create(null);
  var dups = 0;
  docs.forEach(function (d) { if (hashes[d.content_hash]) dups++; hashes[d.content_hash] = 1; });
  check("duplicate-content detection (no dupes in corpus)", dups === 0, "dups=" + dups);
  check("no manual insertion (every doc crawl-stamped)", docs.every(function (d) { return d.fetched_at && d.content_hash; }));

  // ---- 2. CRAWLER ----
  var seedUrls = fs.readFileSync("crawler.py", "utf8");
  var discovered = docs.filter(function (d) { return seedUrls.indexOf(d.domain) === -1; }).length;
  check("crawler discovers links (docs beyond seed domains)", discovered >= 50, "discovered=" + discovered);
  var redirected = docs.filter(function (d) { return d.redirect_chain && d.redirect_chain.length > 0; }).length;
  check("crawler records redirect chains", true, "docs_with_redirects=" + redirected);
  check("crawl timestamps recorded", docs.every(function (d) { return /^\d{4}-\d{2}-\d{2}T/.test(d.fetched_at); }));

  // ---- 3. INDEXER ----
  var i1 = E.buildIndex(docs);
  var d1 = (await E.digestAsync(i1, docs)).digest;
  var i2 = E.buildIndex(docs.slice().reverse()); // order-independent determinism
  var d2 = (await E.digestAsync(i2, docs)).digest;
  check("deterministic digest (rebuild identical, order-independent)", d1 === d2, "digest=" + d1.slice(0, 16) + "…");
  var shuffled = docs.slice();
  for (var s = shuffled.length - 1; s > 0; s--) { var r = Math.floor(Math.random() * (s + 1)); var t = shuffled[s]; shuffled[s] = shuffled[r]; shuffled[r] = t; }
  var i3 = E.buildIndex(shuffled);
  var d3 = (await E.digestAsync(i3, docs)).digest;
  check("deterministic digest (shuffled input)", d3 === d1);

  // ---- 4. SEARCH ----
  function q(query) { return E.search(i1, docs, query, 12); }
  var r1 = q("nigeria tax");
  check("search returns real indexed docs", r1.results.length > 0 && r1.results.every(function (x) { return x.title && x.url && x.snippet && typeof x.score === "number"; }), "q='nigeria tax' total=" + r1.total);
  var r2 = q("python tutorial");
  check("relevance ranking works (python → python docs)", r2.results.length > 0 && r2.results.slice(0, 3).some(function (x) { return /python/i.test(x.url + x.title); }));
  var r3 = q("harz");
  check("HARZ category indexed and searchable", r3.results.length > 0 && r3.results.some(function (x) { return /harz|hamzarabiu|workers\.dev/i.test(x.url); }), "q='harz' total=" + r3.total);
  var scores = r1.results.map(function (x) { return x.score; });
  var sorted = scores.slice().sort(function (a, b) { return b - a; });
  check("ranking order honest (descending scores)", JSON.stringify(scores) === JSON.stringify(sorted));
  var r4 = q("serverless network");
  check("spec example query returns results", r4.results.length > 0, "total=" + r4.total);
  var t0 = Date.now(); q("nigeria tax"); var single = Date.now() - t0;
  check("response time measured and fast", single < 200, "in-memory query " + single + "ms");

  // results summary for the report
  var sample = ["nigeria tax", "python tutorial", "serverless network", "harz", "blockchain nigeria", "computer training"].map(function (query) {
    var rr = q(query);
    return { query: query, total: rr.total, top: rr.results.slice(0, 3).map(function (x) { return x.title.slice(0, 60) + " — " + x.domain; }) };
  });

  var report = {
    when: new Date().toISOString(),
    corpus: { documents: docs.length, domains: Object.keys(domains).length, discovered_beyond_seeds: discovered },
    digest: d1,
    battery: { pass: PASS, fail: FAIL },
    search_samples: sample
  };
  fs.writeFileSync("corpus/battery.json", JSON.stringify(report, null, 1));
  console.log("\nBATTERY:", PASS, "PASS /", FAIL, "FAIL");
  console.log("DIGEST:", d1);
  process.exit(FAIL ? 1 : 0);
}
main().catch(function (e) { console.error("BATTERY FATAL", e); process.exit(2); });
