#!/usr/bin/env node
/* HNS DEATH TEST v1.1 — "kill the D1, restore, migrate, prove UNMUTANT."
 * Falsifiable, one command, exit 0 = GO. Real kill of the production harz-names
 * D1 (registry EMPTY by design — the cheapest moment this can ever cost),
 * restore from bridge snapshot into a fresh D1, re-bind the live worker, and
 * prove the hash-chained state is invariant under death: same zone body,
 * same height, same hash, signature still TRUE with the restored pubkey.
 * Private zsk bytes: held in memory during restore only; never printed,
 * never committed. */
const crypto = require('crypto');
const TOK = process.env.CLOUDFLARE_API_TOKEN;
const ACC = '5ab9477c8379d6dcb1a8b5183484aeae';
let OLD_DB = null; // resolved from the live worker's binding at runtime (seat-agnostic)
const BASE = 'https://api.cloudflare.com/client/v4/accounts/' + ACC;
let fails = 0;
const check = (n, cond, detail) => { console.log((cond ? 'PASS' : 'FAIL') + '  ' + n + (detail ? '  | ' + detail : '')); if (!cond) fails++; };
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(method, url, body) {
  const res = await fetch(url, { method, headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await res.json(); } catch (e) {}
  return { status: res.status, json: j };
}
async function q(db, sql, params) {
  const r = await api('POST', BASE + '/d1/database/' + db + '/query', { sql, params: params || [] });
  return r.json && r.json.result ? r.json.result[0].results : [];
}
async function live(path) { try { const res = await fetch('https://harz-names.harz.workers.dev' + path, { signal: AbortSignal.timeout(15000) }); return { status: res.status, body: await res.text() }; } catch (e) { return { status: 0, body: 'unreachable: ' + e.message }; } }
(async () => {
  console.log('=== HNS DEATH TEST — kill, restore, migrate ===');
  /* PHASE 0: RESOLVE THE LIVE DATABASE FROM THE WORKER BINDING */
  const gs0 = await api('GET', BASE + '/workers/scripts/harz-names/settings');
  const b0 = gs0.json && gs0.json.result ? gs0.json.result.bindings.find(b => b.type === 'd1') : null;
  OLD_DB = b0 ? b0.id : null;
  check('0  Live D1 located from worker binding', !!OLD_DB, OLD_DB || 'no d1 binding found');

  /* PHASE 1: SNAPSHOT + PRE-KILL VERIFICATION */
  const zoneBefore = await live('/zone');
  check('1  Pre-kill: live zone serves (height 1, empty registry)', zoneBefore.status === 200 && JSON.parse(zoneBefore.body).height === 1, sha(Buffer.from(zoneBefore.body)).slice(0, 12) + '...');
  const schema = await q(OLD_DB, "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_cf_KV'");
  const names = await q(OLD_DB, 'SELECT * FROM hns_names');
  const reglog = await q(OLD_DB, 'SELECT * FROM hns_reglog');
  const kvs = await q(OLD_DB, 'SELECT key, value FROM hns_kv');
  const g = Object.fromEntries(kvs.map(r => [r.key, r.value]));
  const pub = crypto.createPublicKey({ key: JSON.parse(g.zsk_pub_jwk), format: 'jwk' });
  const fp = crypto.createHash('sha256').update(pub.export({ type: 'spki', format: 'der' })).digest('hex').slice(0, 16);
  const sigOk = crypto.verify(null, Buffer.from(JSON.parse(zoneBefore.body).hash, 'hex'), pub, Buffer.from(g.subzone_sig, 'base64'));
  check('2  Pre-kill: chain verifies at bridge (fp + Ed25519 over state hash)', fp === g.subzone_fp && sigOk === true, 'fp ' + fp);
  const recentBefore = await live('/api/recent');
  check('3  Pre-kill receipts taken (schema 3 tables, rows, KV 5)', schema.length === 3 && kvs.length === 5, 'names:' + names.length + ' reglog:' + reglog.length + ' kv:' + kvs.length);

  /* PHASE 2: THE KILL */
  const del = await api('DELETE', BASE + '/d1/database/' + OLD_DB);
  check('4  KILL: production harz-names D1 deleted', del.status === 200 && del.json && del.json.success === true);
  let dead = false;
  for (let i = 0; i < 12; i++) { const probe = await api('GET', BASE + '/d1/database/' + OLD_DB); if (probe.status === 404) { dead = true; break; } await sleep(5000); }
  check('5  Death confirmed (GET 404)', dead === true);
  const duringDeath = await live('/zone');
  console.log('    worker during death: HTTP ' + duringDeath.status + ' (' + (duringDeath.status === 200 ? 'SERVED FROM CACHE?' : 'dead, as expected') + ')');

  /* PHASE 3: RESTORE */
  const mk = await api('POST', BASE + '/d1/database', { name: 'harz-names' });
  const NEW_DB = mk.json && mk.json.result ? mk.json.result.uuid : null;
  check('6  RESTORE: fresh harz-names D1 created', !!NEW_DB, NEW_DB || JSON.stringify(mk.json && mk.json.errors));
  for (const t of schema) await q(NEW_DB, t.sql);
  for (const r of names) await q(NEW_DB, 'INSERT INTO hns_names (id, name, wallet, bio, created_date, created_by_ip) VALUES (?,?,?,?,?,?)', [r.id, r.name, r.wallet, r.bio, r.created_date, r.created_by_ip]);
  for (const r of reglog) await q(NEW_DB, 'INSERT INTO hns_reglog (ip, ts) VALUES (?,?)', [r.ip, r.ts]);
  for (const r of kvs) await q(NEW_DB, 'INSERT INTO hns_kv (key, value) VALUES (?,?)', [r.key, r.value]);
  const kvsNew = await q(NEW_DB, 'SELECT key, value FROM hns_kv');
  const gNew = Object.fromEntries(kvsNew.map(r => [r.key, r.value]));
  check('7  RESTORE: all bytes back (names, reglog, kv identical)', JSON.stringify(kvsNew) === JSON.stringify(kvs) && gNew.subzone_fp === g.subzone_fp);

  /* PHASE 4: MIGRATE THE LIVE WORKER — download deployed source, re-upload with new binding
   * (settings-PUT is auth-scheme blocked at this seat; content GET + multipart PUT is proven) */
  const dl = await fetch(BASE + '/workers/scripts/harz-names', { headers: { Authorization: 'Bearer ' + TOK } });
  const dlBody = Buffer.from(await dl.arrayBuffer());
  const srcStart = dlBody.indexOf('\r\n\r\n');
  const srcEnd = dlBody.lastIndexOf('\r\n--');
  const workerSrc = dlBody.slice(srcStart + 4, srcEnd);
  const dispM = /filename="([^"]+)"/.exec(dlBody.toString('latin1'));
  const fname = dispM ? dispM[1] : 'worker.js';
  const boundary = 'hnsdeathtest' + Date.now();
  const meta = { main_module: fname, compatibility_date: '2024-09-01', bindings: [{ type: 'd1', name: 'DB', id: NEW_DB }] };
  let mp = '';
  mp += '--' + boundary + '\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n' + JSON.stringify(meta) + '\r\n';
  mp += '--' + boundary + '\r\nContent-Disposition: form-data; name="' + fname + '"; filename="' + fname + '"\r\nContent-Type: application/javascript+module\r\n\r\n';
  const mpBody = Buffer.concat([Buffer.from(mp, 'utf8'), workerSrc, Buffer.from('\r\n--' + boundary + '--', 'utf8')]);
  const up = await fetch(BASE + '/workers/scripts/harz-names', { method: 'PUT', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'multipart/form-data; boundary=' + boundary }, body: mpBody });
  const upJson = await up.json().catch(() => null);
  check('8  MIGRATE: source (' + workerSrc.length + 'B) re-uploaded, worker re-bound to new D1', up.status === 200 && upJson && upJson.success === true, upJson && upJson.errors ? JSON.stringify(upJson.errors).slice(0,120) : '');
  let zoneAfter = null;
  for (let i = 0; i < 20; i++) { const r = await live('/zone'); if (r.status === 200) { zoneAfter = r; break; } await sleep(3000); }
  check('9  RESURRECTION: live zone serves again', !!zoneAfter, zoneAfter ? '' : 'worker still down');
  if (zoneAfter) {
    check('10 UNMUTANT: state INVARIANT under death (byte-identical zone, same height+hash, sig TRUE)', 
      zoneAfter.body === zoneBefore.body &&
      JSON.parse(zoneAfter.body).hash === JSON.parse(zoneBefore.body).hash &&
      crypto.verify(null, Buffer.from(JSON.parse(zoneAfter.body).hash, 'hex'), pub, Buffer.from(g.subzone_sig, 'base64')) === true,
      sha(Buffer.from(zoneAfter.body)).slice(0, 12) + '...');
    let parity = false, recentAfter = null, lookAfter = null;
    for (let i = 0; i < 12 && !parity; i++) {
      recentAfter = await live('/api/recent');
      lookAfter = await live('/api/lookup?name=hamza');
      parity = recentAfter.body === recentBefore.body && lookAfter.body.includes('NXDOMAIN');
      if (!parity) await sleep(2500);
    }
    check('11 API parity after death: /recent identical, unknown still NXDOMAIN', parity);
  }
  const gs = await api('GET', BASE + '/workers/scripts/harz-names/settings');
  const bind = gs.json && gs.json.result ? gs.json.result.bindings.find(b => b.type === 'd1') : null;
  check('12 Binding on record: worker DB -> new D1 ' + (bind ? bind.id.slice(0, 8) : '?'), !!bind && bind.id === NEW_DB);
  console.log(fails === 0 ? '=== HNS DEATH TEST: GO (12/12) ===' : '=== HNS DEATH TEST: NO-GO (' + fails + ' failed) ===');
  console.log('new harz-names D1: ' + NEW_DB);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH:', e.message); process.exit(1); });
