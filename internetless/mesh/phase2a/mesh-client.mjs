#!/usr/bin/env node
// HARZ MESH CLIENT — Phase 2A retrieval harness (runs on phone via Termux).
// Requests ONE object from a local mesh node, verifies it against the EMBEDDED trusted
// manifest (authenticity), keeps it in MEMORY ONLY (no permanent copy), writes an evidence receipt.
// Usage: node mesh-client.mjs --node http://192.168.43.1:8787 --id 815
//        node mesh-client.mjs --node ... --id 815 --reject-test   (deliberately wrong expected hash)
import fs from 'node:fs';
import crypto from 'node:crypto';
function arg(k, d) { const i = process.argv.indexOf(k); return i > 0 && process.argv[i+1] ? process.argv[i+1] : d; }
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
    evidence.verdict = 'FAILED'; evidence.error = String(e).slice(0, 200);
    console.log('VERDICT: FAILED — ' + evidence.error);
    process.exit(1);
  }
})();
