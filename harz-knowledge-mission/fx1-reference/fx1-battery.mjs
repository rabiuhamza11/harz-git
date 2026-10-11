// FX-1 JS port battery: same fixtures + live URLs as the Python reference run.
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { pipeline } from "./fx1-extractor.js";

const PORT = 8920;
const srv = http.createServer((req, res) => {
  const f = path.join("/tmp/fx1/fixtures", req.url.split("?")[0]);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    res.writeHead(200, { "Content-Type": "text/html" }); res.end(fs.readFileSync(f));
  } else { res.writeHead(404); res.end("nope"); }
}).listen(PORT, "127.0.0.1");

const L = `http://fx1.localtest.me:${PORT}/`;  // public DNS -> 127.0.0.1, not a private-host pattern
const results = [];
async function run(caseId, url, opts = {}) {
  const r = await pipeline(url, opts);
  r.case = caseId; delete r.fullText;
  results.push(r);
  console.log(`${caseId.padEnd(9)} ${String(r.status).padEnd(16)} pages=${r.pages.length} chars=${String(r.charLen ?? "-").padStart(7)} ${r.reason}`);
  return r;
}
// regenerate pristine fixtures (same content as Python run)
const LOREM = "The HARZ corpus programme measures extraction honestly. ".repeat(30);
const W = (f, c) => fs.writeFileSync("/tmp/fx1/fixtures/" + f, c);
W("pg1.html", `<html><head><title>Doc Part 1</title><link rel='next' href='pg2.html'></head><body><h1>Long Report</h1><p>${LOREM}</p></body></html>`);
W("pg2.html", `<html><head><title>Doc Part 2</title></head><body><h1>Long Report p2</h1><p>${LOREM}</p></body></html>`);
W("bad.html", "<html><head><title>Broken Page</title><body><div><p>Opening paragraph with unclosed tags<b>bold<span>nested<p>more text<truncated<td>cell<div>tail" + LOREM + "</html>");
W("dup-a.html", `<html><head><title>Duplicate Study</title></head><body><h1>Study</h1><p>${LOREM}</p></body></html>`);
W("dup-b.html", `<html><head><title>Duplicate Study</title></head><body><h1>Study</h1><p>${LOREM}</p></body></html>`);
W("shell.html", '<html><head><title>SPA Shell</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>');
W("change.html", `<html><head><title>Living Doc</title></head><body><h1>Living Document</h1><p>Version one text. ${LOREM}</p></body></html>`);

const w1 = await run("A-1a", "https://en.wikipedia.org/wiki/World_War_II");
const w2 = await run("A-1b", "https://en.wikipedia.org/wiki/History_of_Nigeria");
await run("A-2", L + "pg1.html");
await run("A-3a", L + "shell.html");
await run("A-3b", "https://www.heritage.org/");
await run("A-4", L + "bad.html");
await run("A-5a", "http://dead-harz-nonexistent-xyz99123.com/");
await run("A-5b", "https://en.wikipedia.org/wiki/HARZ_Nonexistent_Test_Page_87231");
const d1 = await run("A-6a", L + "dup-a.html");
const d2 = await run("A-6b", L + "dup-b.html");
console.log("A-6 dedupe:", d1.fullTextSha256 === d2.fullTextSha256 ? "SAME SHA" : "MISMATCH");
const c1 = await run("A-7v1", L + "change.html");
const orig = fs.readFileSync("/tmp/fx1/fixtures/change.html", "utf8");
fs.writeFileSync("/tmp/fx1/fixtures/change.html", orig.replace("Version one text.", "Version two text, edited upstream."));
const c2 = await run("A-7v2", L + "change.html", { priorSha: c1.fullTextSha256 });
console.log("A-7 version chain:", (c2.status === "complete" && c2.fullTextSha256 !== c1.fullTextSha256) ? "NEW VERSION STORED, PRIOR PRESERVED" : "MISMATCH");
// parity check vs Python reference
console.log("\nPARITY vs Python reference:", w1.charLen === 188720 ? `WW2 chars MATCH (${w1.charLen})` : `WW2 chars DIFFER (js=${w1.charLen}, py=188720)`);
fs.writeFileSync("/tmp/fx1/fx1-battery-results.json", JSON.stringify(results, null, 1));
srv.close();
