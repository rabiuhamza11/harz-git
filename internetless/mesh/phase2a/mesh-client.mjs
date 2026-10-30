#!/usr/bin/env node
// HARZ MESH CLIENT — Phase 2A retrieval harness (runs on phone via Termux).
// Requests ONE object from a local mesh node, verifies it against the EMBEDDED trusted
// manifest (authenticity), keeps it in MEMORY ONLY (no permanent copy), writes an evidence receipt.
// Usage: node mesh-client.mjs --node http://192.168.43.1:8787 --id 815
//        node mesh-client.mjs --node ... --id 815 --reject-test   (deliberately wrong expected hash)
import fs from 'node:fs';
import crypto from 'node:crypto';
function arg(k, d) { const i = process.argv.indexOf(k); return i > 0 && process.argv[i+1] ? process.argv[i+1] : d; }
if (typeof fetch !== 'function') {
  console.log('FATAL: this Node build has no fetch (needs Node 18+). In Termux run: pkg install nodejs-lts -y && node --version');
  process.exit(2);
}
function diagnose(e) {
  const chain = [];
  let cur = e;
  for (let d = 0; cur && d < 4; d++) { chain.push(String(cur)); if (cur.code) chain.push(cur.code); if (cur.cause) cur = cur.cause; else break; }
  const all = chain.join(' ');
  const codes = ['ECONNREFUSED','ETIMEDOUT','ENETUNREACH','EAI_AGAIN','EHOSTUNREACH','ECONNRESET'];
  const code = codes.find(k => all.includes(k)) || '';
  const map = {
    ECONNREFUSED: 'the node is NOT RUNNING or the port is wrong. On the node device: is mesh-node.mjs still running? Did the screen sleep / Termux doze? Run termux-wake-lock FIRST, then start the node.',
    ETIMEDOUT: 'no answer within 8s. Likely different Wi-Fi networks, hotspot off, or the node device asleep.',
    ENETUNREACH: 'no route to that IP. Are BOTH devices on the SAME hotspot or Wi-Fi? Copy the exact IP from the node printed REACHABLE AT line.',
    EAI_AGAIN: 'name could not be resolved. Use the raw IP the node printed, not a hostname.',
    EHOSTUNREACH: 'that IP is not on this network. Copy the exact IP the node printed.',
    ECONNRESET: 'connection was cut mid-way. Did the node device lock its screen or lose hotspot?'
  };
  return '[' + (code || 'NO-ANSWER') + '] ' + (map[code] || 'the request never got an HTTP answer. Check: node running? same Wi-Fi? correct IP?');
}
const PING = process.argv.includes('--ping');
const NODE = arg('--node', 'http://192.168.43.1:8787');
const ID = arg('--id', '815');
const REJECT_TEST = process.argv.includes('--reject-test');
const MANIFEST = JSON.parse(fs.readFileSync(new URL('./mesh-manifest.json', import.meta.url), 'utf8'));
const trusted = (MANIFEST.objects[ID] || {}).text_sha256;
if (!trusted) { console.log('FATAL: no trusted hash for id ' + ID + ' in local manifest'); process.exit(2); }
const expected = REJECT_TEST ? '0000000000000000000000000000000000000000000000000000000000000000' : trusted;
function sha256hex(b) { return crypto.createHash('sha256').update(b).digest('hex'); }
const T = {t0: Date.now()};
function ms(label, from) { T[label] = Date.now() - from; }
async function fetchJSON(p) {
  const r = await fetch(p, {signal: AbortSignal.timeout(8000)});
  const b = Buffer.from(await r.arrayBuffer());
  return {status: r.status, bytes: b, headers: r.headers};
}
(async () => {
  if (PING) {
    try {
      const t = Date.now();
      const r = await fetchJSON(NODE + '/inventory');
      const adv = JSON.parse(r.bytes.toString('utf8'));
      console.log('NODE REACHABLE in ' + (Date.now() - t) + 'ms — ' + NODE);
      console.log('  advertises: ' + (adv.objects || []).map(o => o.id + (o.serves ? ' (VERIFIED)' : ' (MISMATCH)')).join(', '));
      process.exit(0);
    } catch (e) {
      console.log('NODE UNREACHABLE — ' + NODE);
      console.log('  DIAGNOSIS: ' + diagnose(e));
      process.exit(1);
    }
  }
  const evidence = {schema: 'harz-mesh-phase2a-receipt-v1', at: new Date().toISOString(),
    device: 'client ' + process.platform + ' node ' + process.version, node: NODE, id: ID,
    expected_hash: expected, reject_test: REJECT_TEST, external_requests: 0};
  try {
    // 1) discover node (inventory)
    const a = Date.now(); const inv = await fetchJSON(NODE + '/inventory'); evidence.inventory_ms = Date.now() - a;
    if (inv.status !== 200) throw new Error('inventory HTTP ' + inv.status);
    const adv = JSON.parse(inv.bytes.toString('utf8'));
    const held = (adv.objects || []).some(o => String(o.id) === ID && o.serves);
    evidence.node_advertises_object = held;
    evidence.advertised_count = (adv.objects || []).length;
    if (!held) throw new Error('node does not advertise verified object ' + ID);
    // 2) request ONLY this object
    const b = Date.now(); const obj = await fetchJSON(NODE + '/object/' + ID); evidence.retrieval_ms = Date.now() - b;
    evidence.object_http = obj.status; evidence.transferred_bytes = obj.bytes.length;
    if (obj.status !== 200) throw new Error('object HTTP ' + obj.status);
    // 3) verify in memory against the trusted hash (authenticity from local manifest)
    const c = Date.now();
    let text = ''; try { text = JSON.parse(obj.bytes.toString('utf8')).text || ''; } catch (e) { throw new Error('not valid doc JSON'); }
    const got = sha256hex(Buffer.from(text, 'utf8'));
    evidence.verify_ms = Date.now() - c;
    evidence.received_text_sha256 = got;
    evidence.verdict = got === expected ? 'ACCEPTED' : 'REJECTED';
    evidence.total_ms = Date.now() - T.t0;
    evidence.text_chars = text.length;
    // 4) evidence receipt (durable, tiny)
    const fn = 'evidence/phase2a-' + ID + '-' + (REJECT_TEST ? 'reject-test' : 'retrieval') + '-' + Date.now() + '.json';
    try { fs.mkdirSync('evidence', {recursive: true}); fs.writeFileSync(fn, JSON.stringify(evidence, null, 1)); } catch (e) {}
    console.log('VERDICT: ' + evidence.verdict);
    console.log('  expected: ' + expected);
    console.log('  received: ' + got);
    console.log('  node inventory: ' + evidence.advertised_count + ' advertised, object held: ' + held);
    console.log('  retrieved: ' + evidence.transferred_bytes + ' bytes in ' + evidence.retrieval_ms + 'ms, verified in ' + evidence.verify_ms + 'ms');
    console.log('  object kept in memory only (no permanent library copy)');
    console.log('  receipt: ' + fn);
    process.exit(evidence.verdict === 'ACCEPTED' ? 0 : 1);
  } catch (e) {
    evidence.verdict = 'FAILED';
    evidence.error = diagnose(e);
    evidence.raw_error = String(e).slice(0, 200);
    if (e && e.cause) evidence.cause = String(e.cause).slice(0, 200);
    console.log('VERDICT: FAILED');
    console.log('  DIAGNOSIS: ' + evidence.error);
    console.log('  raw: ' + evidence.raw_error + (evidence.cause ? ' | cause: ' + evidence.cause : ''));
    try { fs.mkdirSync('evidence', {recursive: true});
      fs.writeFileSync('evidence/phase2a-FAILED-' + Date.now() + '.json', JSON.stringify(evidence, null, 1)); } catch (x) {}
    process.exit(1);
  }
})();
