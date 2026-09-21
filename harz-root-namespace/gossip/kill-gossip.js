#!/usr/bin/env node
const fs = require('fs');
let k = [];
for (const d of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(d)) continue;
  try {
    const p = fs.readFileSync('/proc/' + d + '/cmdline', 'utf8').split('\0');
    if (p[0] === 'node' && p.slice(1).join(' ').includes('gossip.js')) { process.kill(+d, 'SIGKILL'); k.push(d); }
  } catch (e) {}
}
console.log('gossip killed: ' + (k.join(',') || 'none'));
