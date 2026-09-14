/* HARZ DoH harness v1.0 — 5 checks, exit 0 = GO. Query bytes built programmatically. */
function q(name, qtype=16, withOpt=true) {
  const labels = name.split(".");
  let qlen = 1; for (const l of labels) qlen += 1 + l.length;
  const qbuf = new Uint8Array(12 + qlen + 4 + (withOpt ? 11 : 0));
  const dv = new DataView(qbuf.buffer);
  dv.setUint16(0, 0xBEEF & 0xFFFF); dv.setUint16(2, 0x0100); dv.setUint16(4, 1);
  if (withOpt) dv.setUint16(10, 1);
  let k = 12;
  for (const l of labels) { qbuf[k++] = l.length; for (const ch of new TextEncoder().encode(l)) qbuf[k++] = ch; }
  // root label zero already 0
  k = 12 + qlen;
  dv.setUint16(k, qtype); dv.setUint16(k+2, 1);
  if (withOpt) { qbuf[12+qlen+4] = 0; const odv = new DataView(qbuf.buffer); odv.setUint16(12+qlen+5, 41); odv.setUint16(12+qlen+7, 1232); }
  return qbuf;
}
function parse(resp) {
  const dv = new DataView(resp.buffer, resp.byteOffset, resp.byteLength);
  const flags = dv.getUint16(2);
  return { rcode: flags & 0xF, aa: !!(flags & 0x0400), an: dv.getUint16(6), ar: dv.getUint16(10) };
}
function txtOf(resp) {
  // walk past header + question section first (programmatic, never fixed offsets)
  let k = 12;
  while (resp[k] !== 0) k += 1 + resp[k]; // qname labels
  k += 1 + 4; // root label + qtype + qclass -> answer RR starts here
  k += 2 + 10; // name pointer (0xC00C) + type/class/ttl/rdlen -> rdata
  let out = "";
  while (k < resp.length) { const l = resp[k++]; if (l === 0) break; out += new TextDecoder().decode(resp.subarray(k, k+l)); k += l; }
  return out;
}
let fails = 0;
function check(n, cond, detail) { console.log((cond ? "PASS" : "FAIL") + " " + n + (detail ? " — " + detail : "")); if (!cond) fails++; }
export async function run(fetchFn) {
  const post = async (b) => { const r = await fetchFn(new Request("https://harz-root.harz.workers.dev/dns-query", {method: "POST", headers: {"content-type": "application/dns-message"}, body: b})); return new Uint8Array(await r.arrayBuffer()); };
  const r1 = parse(await post(q("gov.harz")));
  check("1 TXT answer for gov.harz", r1.rcode === 0 && r1.aa && r1.an === 1, JSON.stringify(r1));
  const t1 = txtOf(await post(q("gov.harz")));
  check("2 TXT payload = canonical zone record", t1.includes('"record_type"') && t1.includes("governance") && t1.includes("https://harz-governance"));
  const r3 = parse(await post(q("ghost.harz")));
  check("3 authoritative NXDOMAIN rcode 3", r3.rcode === 3 && r3.aa && r3.an === 0);
  const r4 = parse(await post(q("example.com")));
  check("4 REFUSED rcode 5 for non-.harz (honest scope)", r4.rcode === 5);
  const r5 = parse(await post(q("wallet.harz", 16, true)));
  check("5 EDNS OPT echoed + TXT answer", r5.ar === 1 && r5.an === 1 && r5.rcode === 0);
  console.log(fails === 0 ? "DOH HARNESS: GO (5/5)" : "DOH HARNESS: NO-GO (" + fails + " failed)");
  process.exit(fails === 0 ? 0 : 1);
}
