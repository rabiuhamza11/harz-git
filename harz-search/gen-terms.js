// HARZ SEARCH v0.1.1 — terms projection generator (sandbox build step)
// Uses the FROZEN shared tokenizer (search-core.js) so the D1 terms table
// is byte-compatible with the in-memory index. Output: corpus/terms.jsonl
// {term, df, docs: "id:tf:len,id:tf:len,..."} sorted by id ascending.
"use strict";
var fs = require("fs");
var C = require("./search-core.js");

var docs = fs.readFileSync("corpus/docs.jsonl", "utf8").trim().split("\n")
  .map(function (l) { return JSON.parse(l); })
  .sort(function (a, b) { return a.id - b.id; });

var terms = Object.create(null); // term -> {df, postings:[[id,tf,len]]}
for (var i = 0; i < docs.length; i++) {
  var d = docs[i];
  var toks = C.tokenize(d.title).concat(C.tokenize(d.text));
  var tf = Object.create(null);
  for (var j = 0; j < toks.length; j++) tf[toks[j]] = (tf[toks[j]] || 0) + 1;
  for (var t in tf) {
    if (!terms[t]) terms[t] = [];
    terms[t].push([d.id, tf[t], toks.length]); // len = title+body token count (L4)
  }
}

var names = Object.keys(terms).sort();
var totalLen = 0;
for (var m0 = 0; m0 < docs.length; m0++) totalLen += C.tokenize(docs[m0].title).length + C.tokenize(docs[m0].text).length;
var stats = JSON.parse(fs.readFileSync("corpus/stats.json", "utf8"));
fs.writeFileSync("corpus/meta-v011.json", JSON.stringify({
  documents: docs.length,
  avgdl: docs.length ? totalLen / docs.length : 0,
  unique_terms: names.length,
  index_digest: stats.index_digest,
  last_crawl: stats.last_crawl || "",
  contract: "v0.1.1"
}));
var out = fs.createWriteStream("corpus/terms.jsonl");
var W = 0;
for (var n = 0; n < names.length; n++) {
  var ps = terms[names[n]].sort(function (a, b) { return a[0] - b[0]; });
  out.write(JSON.stringify({ term: names[n], df: ps.length,
    docs: ps.map(function (p) { return p[0] + ":" + p[1] + ":" + p[2]; }).join(",") }) + "\n");
  W++;
}
out.end(function () {
  var stats = JSON.parse(fs.readFileSync("corpus/stats.json", "utf8"));
  console.log("terms rows:", W, "| stats.json unique_terms:", stats.unique_terms,
    "| match:", W === stats.unique_terms ? "OK" : "MISMATCH");
});
