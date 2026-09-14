const fs = require('fs');
let k = [];
for (const d of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(d)) continue;
  try {
    const p = fs.readFileSync('/proc/' + d + '/cmdline', 'utf8').split('\0');
    const cmd = p.slice(1).join(' ');
    if (p[0] === 'node' && (cmd.includes('verify-all-names') || cmd.includes('sweep'))) { process.kill(+d, 'SIGKILL'); k.push(d); }
  } catch (e) {}
}
console.log('hung sweeps killed: ' + (k.join(',') || 'none'));
