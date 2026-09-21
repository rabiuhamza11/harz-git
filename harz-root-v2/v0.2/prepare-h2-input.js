// HARZ ROOT v0.2 — prepare-h2-input.js — Nuruddeen's prep tool (public data only)
// Fetches the LIVE height-1 zone, takes the fresh successor PUB (from gen-key, public),
// and writes h2-input.json for the Node 1 ceremony. No key material involved anywhere.
// usage: node prepare-h2-input.js <successor-pub-64hex>

const https = require("https");
const fs = require("fs");
const path = require("path");

const pub = process.argv[2];
if (!pub || !/^[0-9a-f]{64}$/.test(pub.toLowerCase())) { console.error("usage: node prepare-h2-input.js <successor-pub-64hex> (the fresh key's PUB line — public data)"); process.exit(2); }

https.get("https://harz-root.harz.workers.dev/zone", { headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; Infinix)" } }, r => {
  let b = ""; r.on("data", c => b += c);
  r.on("end", () => {
    const z = JSON.parse(b);
    if (!z.height || z.height !== 1 || !Array.isArray(z.records) || z.records.length !== 77) {
      console.error("ABORT: live zone is not height 1 / 77 records — baseline moved. Stop and re-audit."); process.exit(1);
    }
    const input = { successor_pub: pub.toLowerCase(), h1_records: z.records, prepared_at: new Date().toISOString(), note: "public data only — the 77 live records + the fresh successor PUB" };
    fs.writeFileSync(path.join(__dirname, "h2-input.json"), JSON.stringify(input));
    console.log("h2-input.json READY: 77 live records + successor pub " + pub.slice(0, 12) + "… — send to Node 1 (curl from the harz-git raw URL at ceremony time).");
  });
}).on("error", e => { console.error("FETCH FAILED:", e.message); process.exit(1); });
