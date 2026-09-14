const fs = require('fs');
const html = fs.readFileSync(__dirname + '/live-registry-page.html', 'utf8');
// entries look like: <b>name.harz</b><br><span class="small">TXT · URL</span> ... Seal<br><b>HEX</b>
const re = /<b>([a-z0-9-]+)\.harz<\/b><br><span class="small">TXT · ([^<]+)<\/span>/g;
const names = []; let m;
while ((m = re.exec(html)) !== null) names.push({ name: m[1], url: m[2].trim(), record_type: 'SERVICE', record_value: { service_id: m[2].trim().replace(/^https?:\/\//, '').split('/')[0], note: 'live registry entry' } });
fs.writeFileSync(__dirname + '/live-registry.json', JSON.stringify({ origin: 'harz.', source: 'https://harz-root.harz.workers.dev (live registry dump 2026-09-14)', names }, null, 2));
console.log('parsed ' + names.length + ' names');
console.log(names.slice(0, 5).map(n => n.name + '.harz').join(', '));
