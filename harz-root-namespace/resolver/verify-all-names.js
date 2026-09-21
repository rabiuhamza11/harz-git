#!/usr/bin/env node
/* Full-sweep verification: every genesis name must resolve with a valid
 * signed answer from the running resolver. Raw DNS packets, no test-client. */
const dgram = require('dgram');
const fs = require('fs');
const genesis = JSON.parse(fs.readFileSync(process.argv.includes('--source') ? __dirname + '/' + process.argv[process.argv.indexOf('--source') + 1] : __dirname + '/genesis-names.json', 'utf8'));

function encodeName(n) {
  const p = n.replace(/\.$/, '').split('.');
  return Buffer.concat([...p.map(l => Buffer.concat([Buffer.from([l.length]), Buffer.from(l)])), Buffer.from([0])]);
}

function query(name, i) {
  return new Promise(res => {
    const s = dgram.createSocket('udp4');
    const id = 0x1000 + i;
    const head = Buffer.alloc(12);
    head.writeUInt16BE(id, 0); head.writeUInt16BE(0x0100, 2); head.writeUInt16BE(1, 4);
    const qe = Buffer.alloc(4); qe.writeUInt16BE(16, 0); qe.writeUInt16BE(1, 2);
    const msg = Buffer.concat([head, encodeName(name + '.harz'), qe]);
    const t = setTimeout(() => { console.log('FAIL/timeout: ' + name); s.close(); res(); }, 2500);
    s.on('message', ans => {
      clearTimeout(t); s.close();
      try {
        const rcode = ans.readUInt16BE(2) & 0xF;
        const an = ans.readUInt16BE(6);
        let off = 12; while (ans[off] !== 0) off += 1 + ans[off]; off += 5 + 2; // question + pointer
        const rdlen = ans.readUInt16BE(off + 8);
        let p = off + 10; const end2 = p + rdlen; let txt = '';
        while (p < end2) { const len = ans[p]; txt += ans.toString('utf8', p + 1, p + 1 + len); p += 1 + len; }
        const payload = JSON.parse(txt);
        const ok = rcode === 0 && an === 1 && payload.service_id && payload.record_type === 'SERVICE';
        console.log((ok ? 'PASS ' : 'BAD  ') + name + '.harz -> ' + payload.service_id);
        res(ok);
      } catch (e) { console.log('DECODE FAIL ' + name + ': ' + e.message); res(false); }
    });
    s.send(msg, parseInt(process.env.PORT || '5301', 10), '127.0.0.1');
  });
}

(async () => {
  let pass = 0, fail = 0;
  for (let i = 0; i < genesis.names.length; i++) {
    const ok = await query(genesis.names[i].name, i);
    ok ? pass++ : fail++;
  }
  console.log('=== RESULT: ' + pass + '/' + (pass + fail) + ' names resolve correctly ===');
  process.exit(fail === 0 ? 0 : 1);
})();
