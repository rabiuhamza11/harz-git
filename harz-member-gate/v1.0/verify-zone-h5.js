// Independent verification of the live root zone height 5 (Magani, Oct 4).
// Zero deps, Node 20. Fetches /zone from the live root, re-verifies the Ed25519
// signature against signed_by, checks members.harz TXT binds the gate key fp.
const crypto = require("crypto");
async function main() {
  const z = await (await fetch("https://harz-root.harz.workers.dev/zone")).json();
  function canon(o) {
    if (o === null || typeof o !== "object") return JSON.stringify(o);
    if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
    return "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
  }
  const unsigned = { ...z }; delete unsigned.sig;
  const pub = crypto.createPublicKey({ key: Buffer.from("302a300506032b6570032100" + z.signed_by.split(":")[1], "hex"), format: "der", type: "spki" });
  const ok = crypto.verify(null, Buffer.from(canon(unsigned), "utf8"), pub, Buffer.from(z.sig.split(":")[1], "hex"));
  const mem = z.records.find(r => r.name === "members.harz");
  console.log("height:", z.height, "| records:", z.records.length, "| sig:", ok ? "VALID" : "FAILED");
  console.log("members.harz TXT:", mem.txt.join(" "));
  console.log("gate fp bound:", mem.txt.some(t => t.includes("2b88b79df131b344")) ? "YES" : "NO");
}
main();
