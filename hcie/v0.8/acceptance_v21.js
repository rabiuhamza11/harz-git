// Acceptance harness: runs the SHIPPING page code against a local HTTP server that
// can misbehave on demand. Real fetch, real sockets, real status codes.
const fs = require('fs');
const http = require('http');
const path = require('path');
const { JSDOM } = (() => { try { return require('jsdom'); } catch (e) { return {}; } })();

const pageHtml = fs.readFileSync(path.join(__dirname, 'review_page_source.html'), 'utf8');
const script = pageHtml.split('<script>')[1].split('</script>')[0];

let MODE = 'ok';
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/hcie/review-auth')) {
    if (MODE === 'unreachable') { req.socket.destroy(); return; }
    if (MODE === 'http500') { res.writeHead(500, { 'content-type': 'text/html' }); res.end('<html>boom</html>'); return; }
    if (MODE === 'malformed') { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"ok":tru'); return; }
    if (MODE === 'refuse') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: 'wrong review key' })); return; }
    if (MODE === 'claim') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true, claimed: true })); return; }
    res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true, claimed: false })); return;
  }
  if (req.url.startsWith('/api/hcie/review')) {
    if (MODE === 'unreachable') { req.socket.destroy(); return; }
    if (MODE === 'http500') { res.writeHead(500, { 'content-type': 'text/plain' }); res.end('nope'); return; }
    if (MODE === 'malformed') { res.writeHead(200, { 'content-type': 'application/json' }); res.end('not json at all'); return; }
    if (MODE === 'refuse') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: 'wrong review key' })); return; }
    res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true, id: 'C-x', state: 'PUBLISHED', object_id: 99 })); return;
  }
  if (req.url.startsWith('/api/hcie/queue')) {
    if (MODE === 'unreachable') { req.socket.destroy(); return; }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ count: 0, items: [] })); return;
  }
  res.writeHead(404); res.end('no');
});

function makeDom() {
  const els = {};
  const mk = (id) => ({
    id, value: '', textContent: '', innerHTML: '',
    _listeners: {},
    addEventListener(t, f) { this._listeners[t] = f; },
    getAttribute(n) { return this[n] === undefined ? null : this[n]; },
    setAttribute(n, v) { this[n] = v; }
  });
  const document = {
    getElementById(id) { if (!els[id]) els[id] = mk(id); return els[id]; }
  };
  const store = {};
  const localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); }
  };
  return { els, document, localStorage, store };
}

async function boot(base, initial) {
  const dom = makeDom();
  if (initial) { Object.keys(initial).forEach(k => { dom.store[k] = initial[k]; }); }
  const realFetch = global.fetch;
  const wrapped = (url, opts) => realFetch(String(url).startsWith('/') ? base + url : url, opts);
  const fn = new Function('document', 'localStorage', 'fetch', 'window', 'setTimeout', 'clearTimeout', 'AbortController', script);
  fn(dom.document, dom.localStorage, wrapped, {}, setTimeout, clearTimeout, AbortController);
  await new Promise(r => setTimeout(r, 120));
  return dom;
}

const results = [];
function check(name, cond, detail) {
  results.push({ name, pass: !!cond, detail });
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name + '  |  ' + detail);
}

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;

  // 1. Unlock with server unreachable
  MODE = 'unreachable';
  let d = await boot(base);
  d.document.getElementById('key').value = 'somekey12345';
  d.document.getElementById('save').onclick();
  await new Promise(r => setTimeout(r, 400));
  check('1 Unlock, server unreachable', d.document.getElementById('authmsg').textContent.startsWith('No connection. Try again.'), d.document.getElementById('authmsg').textContent);

  // 2. Unlock with HTTP 500
  MODE = 'http500';
  d = await boot(base);
  d.document.getElementById('key').value = 'somekey12345';
  d.document.getElementById('save').onclick();
  await new Promise(r => setTimeout(r, 400));
  check('2 Unlock, HTTP 500', d.document.getElementById('authmsg').textContent.includes('Server error (HTTP 500)'), d.document.getElementById('authmsg').textContent);

  // 3. Unlock with invalid response
  MODE = 'malformed';
  d = await boot(base);
  d.document.getElementById('key').value = 'somekey12345';
  d.document.getElementById('save').onclick();
  await new Promise(r => setTimeout(r, 400));
  check('3 Unlock, malformed body', d.document.getElementById('authmsg').textContent.includes('Invalid server response.'), d.document.getElementById('authmsg').textContent);

  // 4. Approve with explicit refusal
  MODE = 'refuse';
  d = await boot(base, { harz_review_key: 'stored-key-here' });
  await new Promise(r => setTimeout(r, 200));
  d.document.getElementById('list')._listeners.click({ target: { getAttribute: (n) => ({ 'data-dec': 'approve', 'data-id': 'C-x' })[n] || null } });
  await new Promise(r => setTimeout(r, 400));
  const msg4 = d.document.getElementById('msg_C-x').textContent;
  check('4 Approve, refused', msg4.includes('Request refused: wrong review key') && msg4.includes('HARZ did not accept'), msg4);

  // 5. Approve with success
  MODE = 'ok';
  d = await boot(base, { harz_review_key: 'stored-key-here' });
  await new Promise(r => setTimeout(r, 200));
  d.document.getElementById('list')._listeners.click({ target: { getAttribute: (n) => ({ 'data-dec': 'approve', 'data-id': 'C-x' })[n] || null } });
  await new Promise(r => setTimeout(r, 400));
  const msg5 = d.document.getElementById('msg_C-x').textContent;
  check('5 Approve, success', msg5.startsWith('Success - published as object 99.'), msg5);

  // 6. Stored key remains usable (survives reload, no unlock pressed)
  MODE = 'ok';
  const d6b = await boot(base, { harz_review_key: 'stored-key-here' });
  check('6 Existing browser key still usable', d6b.document.getElementById('authmsg').textContent.includes('a key is stored on this device'), d6b.document.getElementById('authmsg').textContent);

  // 7. Approve does not require Unlock first
  MODE = 'ok';
  const d7 = await boot(base, { harz_review_key: 'stored-key-here' });
  await new Promise(r => setTimeout(r, 200));
  const unlockBefore = d7.document.getElementById('authmsg').textContent;
  d7.document.getElementById('list')._listeners.click({ target: { getAttribute: (n) => ({ 'data-dec': 'approve', 'data-id': 'C-x' })[n] || null } });
  await new Promise(r => setTimeout(r, 400));
  check('7 Approve without Unlock', d7.document.getElementById('msg_C-x').textContent.startsWith('Success - published') && unlockBefore.includes('does not need a fresh unlock'), d7.document.getElementById('msg_C-x').textContent);

  // 8. Queue card and status never contradict
  MODE = 'unreachable';
  const d8 = await boot(base);
  await new Promise(r => setTimeout(r, 300));
  const qmeta8 = d8.document.getElementById('qmeta').textContent;
  const list8 = d8.document.getElementById('list').innerHTML;
  const honest = qmeta8.includes('NOT read') && list8.includes('Queue unavailable') && !list8.includes('Nothing is queued.');
  check('8 Offline: queue card does not claim empty', honest, qmeta8 + ' || ' + list8.slice(0, 90));

  MODE = 'ok';
  const d9 = await boot(base);
  await new Promise(r => setTimeout(r, 300));
  check('8b Online: card states source and time', d9.document.getElementById('qmeta').textContent.includes('read from HARZ at') && d9.document.getElementById('list').innerHTML.includes('HARZ answered at'), d9.document.getElementById('qmeta').textContent);

  const failed = results.filter(r => !r.pass).length;
  console.log('\nRESULT: ' + (results.length - failed) + '/' + results.length + ' passed');
  server.close();
  process.exit(failed ? 1 : 0);
})();
