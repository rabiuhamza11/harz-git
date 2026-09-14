const fs = require('fs');
let k = [];
for (const d of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(d)) continue;
  try {
    const p = fs.readFileSync('/proc/' + d + '/cmdline', 'utf8').split('\0');
    const cmd = p.slice(1).join(' ');
    if (p[0] === 'node' && (cmd.includes('resolver.js') || cmd.includes('resolver-instrumented') || cmd.includes('dial-gateway'))) { process.kill(+d, 'SIGKILL'); k.push(d); }
  } catch (e) {}
}
console.log('strays killed: ' + (k.join(',') || 'none'));
