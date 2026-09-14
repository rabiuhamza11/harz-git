#!/usr/bin/env node
/* Definitive sweep via the Dial gateway (HTTP loopback — reliable transport).
 * Every canonical name must resolve with a valid JSON payload. */
const http = require('http');
const fs = require('fs');
const src = process.argv.includes('--source') ? process.argv[process.argv.indexOf('--source') + 1] : 'canonical-names.json';
const data = JSON.parse(fs.readFileSync(__dirname + '/' + src, 'utf8'));
const PORT = parseInt(process.env.GPORT || '8791', 10);

function sms(text) {
  return new Promise(res => {
    const body = JSON.stringify({ text });
    const req = http.request({ host: '127.0.0.1', port: PORT, path: '/sms', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': body.length } }, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => { try { res(JSON.parse(b).reply); } catch (e) { res(null); } });
    });
    req.on('error', () => res(null));
    req.end(body);
  });
}

(async () => {
  let pass = 0, bad = 0;
  for (const n of data.names) {
    const reply = await sms(n.name);
    const expect = n.name + '.harz -> ';
    const ok = reply && reply.startsWith(expect) && (n.record_value.url ? reply.includes(n.record_value.url) : true) && reply.includes(n.record_value.service_id);
    if (ok) pass++; else { bad++; console.log('BAD ' + n.name + ': ' + reply); }
  }
  console.log('=== SWEEP RESULT: ' + pass + '/' + (pass + bad) + ' canonical names resolve correctly via gateway ===');
  process.exit(bad === 0 ? 0 : 1);
})();
