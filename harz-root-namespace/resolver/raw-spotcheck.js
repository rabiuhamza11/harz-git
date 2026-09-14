const dgram = require('dgram');
function q(name, port) {
  return new Promise(res => {
    const s = dgram.createSocket('udp4');
    const labels = name.replace(/\.$/,'').split('.');
    const qname = Buffer.concat([...labels.map(l => Buffer.concat([Buffer.from([l.length]), Buffer.from(l)])), Buffer.from([0])]);
    const head = Buffer.alloc(12); head.writeUInt16BE(0x0A0A, 0); head.writeUInt16BE(0x0100, 2); head.writeUInt16BE(1, 4);
    const qe = Buffer.alloc(4); qe.writeUInt16BE(16, 0); qe.writeUInt16BE(1, 2);
    s.on('message', ans => { s.close();
      const rcode = ans.readUInt16BE(2) & 0xF, an = ans.readUInt16BE(6);
      let txt = '';
      if (an > 0) {
        let off = 12; while (ans[off] !== 0) off += 1 + ans[off]; off += 5 + 2;
        const rdlen = ans.readUInt16BE(off + 8); let p = off + 10; const end2 = p + rdlen;
        while (p < end2) { const len = ans[p]; txt += ans.toString('utf8', p + 1, p + 1 + len); p += 1 + len; }
      }
      console.log((rcode === 0 ? 'RESOLVED ' : 'rcode=' + rcode + ' ') + name + (txt ? ' -> ' + txt.slice(0, 90) : ''));
      res(true);
    });
    setTimeout(() => { console.log('TIMEOUT ' + name); s.close(); res(false); }, 2500);
    s.send(Buffer.concat([head, qname, qe]), port, '127.0.0.1');
  });
}
(async () => {
  for (const n of ['gov.harz', 'kasuwa.harz', 'super.harz', 'wallet.harz', 'yelwa.harz']) await q(n, 5302);
  await q('ghost.harz', 5302);
})();
