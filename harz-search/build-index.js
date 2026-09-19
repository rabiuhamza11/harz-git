// HARZ SEARCH v0.1 — Indexer CLI (STEP 4→8)
// Loads corpus/docs.jsonl → builds inverted index → computes deterministic digest
// → writes corpus/index-export.json (portable artifact) + corpus/stats.json
"use strict";
var fs = require("fs");
var path = require("path");
var E = require("./engine.js");

function main() {
  var lines = fs.readFileSync("corpus/docs.jsonl", "utf8").split("\n").filter(Boolean);
  var docs = lines.map(function (l) { return JSON.parse(l); });
  console.log("loaded documents:", docs.length);
  var index = E.buildIndex(docs);
  E.digestAsync(index, docs).then(function (r) {
    var crawlMeta = {
      last_crawl: docs.length ? docs[docs.length - 1].fetched_at : null,
      exported_at: new Date().toISOString()
    };
    var st = E.stats(index, docs, crawlMeta);
    st.index_digest = r.digest;
    st.canonical_bytes = r.canonical_bytes;
    fs.writeFileSync("corpus/stats.json", JSON.stringify(st, null, 1));
    var payload = E.exportIndex(index, docs, crawlMeta);
    fs.writeFileSync("corpus/index-export.json", JSON.stringify(payload));
    console.log("unique_terms:", st.unique_terms);
    console.log("domains:", st.domains);
    console.log("INDEX DIGEST:", r.digest);
    console.log("export bytes:", fs.statSync("corpus/index-export.json").size);
  }).catch(function (e) { console.error("FATAL", e); process.exit(1); });
}
main();
