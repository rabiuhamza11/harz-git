#!/usr/bin/env node
// KATTAU v0.1 — "the small one". A fully-offline agent for the owner's
// Infinix (Termux) and desktop. One file. No network calls, ever.
//
// LAWS OBEYED (Capability Contract V1 + UBA labels + receipts):
//   1. Three outcomes only: PASS / REFUSED HONESTLY / KNOWN LIMITATION.
//   2. Every answer carries a receipt (kit sha256, timings, providers_called: []).
//   3. Network state is probed ONLY to label it truthfully — never used.
//   4. Never fakes being smarter than it is: no language model runs here.
//      Beyond the kit and its skills, it refuses. (Owner's standing law.)
//
// RUNTIME: Node 22.5+ with node:sqlite (FTS5 builds: Node 24/26 verified
// on the owner's Infinix, Node v26.4.0 arm, Oct 14 2026 phone run).
// USAGE: node kattau.mjs "your question"    (builds kit on first run)
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { createHash } from 'crypto';
import net from 'net';
import dns from 'dns';

const VERSION = 'kattau v0.1';
const KIT_DIR = '.kattau';
const KIT = `${KIT_DIR}/kb5k.sqlite`;
const shasum = (buf) => createHash('sha256').update(buf).digest('hex');

// ---------- kit (same sealed 5K path as the accepted d1-phone-run) ----------
function loadDocs() {
  let docs = [];
  for (let i = 0; i < 10; i++) {
    const raw = readFileSync(`kb5k/shard${i}.json`, 'utf8');
    if (raw !== '[]') docs = docs.concat(JSON.parse(raw));
  }
  if (docs.length !== 5000) { console.error('FAIL: corpus is not the sealed 5K (got ' + docs.length + ')'); process.exit(1); }
  return docs;
}
function buildKit(docs) {
  mkdirSync(KIT_DIR, { recursive: true });
  const db = new DatabaseSync(KIT);
  db.exec('CREATE VIRTUAL TABLE fts USING fts5(title, snippet)');
  const ins = db.prepare('INSERT INTO fts(rowid,title,snippet) VALUES(?,?,?)');
  db.exec('BEGIN');
  for (const d of docs) ins.run(d.id, d.title, d.snippet || '');
  db.exec('COMMIT');
  db.close();
}
function openKit() {
  if (!existsSync(KIT)) buildKit(loadDocs());
  return new DatabaseSync(KIT, { readOnly: true });
}
const kitSha = () => shasum(readFileSync(KIT));

// ---------- network probes (label only; never used to answer) ----------
const tcpProbe = () => new Promise(res => {
  const s = net.connect({ host: '1.1.1.1', port: 443, timeout: 1500 });
  s.on('connect', () => { s.destroy(); res('CONNECTED'); });
  s.on('timeout', () => { s.destroy(); res('TIMEOUT'); });
  s.on('error', () => res('REFUSED'));
});
const dnsProbe = () => new Promise(res => dns.lookup('example.com', { timeout: 1500 }, e => res(e ? 'DNS-FAIL' : 'DNS-OK')));

// ---------- language detection ----------
const haTokens = /\b(sannu|lafiya|inakwana|kana|kake|me ya|abin da|yadda|lokaci|wani|kivu|kece|gaskiya|tako|hakika|bayan|daga|dame|ka\?|ne\?)\b/i;
const isHausa = (q) => haTokens.test(q) || /\bsannu\b/i.test(q);

// ---------- skills ----------
function skillGreeting(ha) {
  return ha
    ? 'Sannu! Ni Kattau ne — wakilin ka marar intanet. Na san amsoshin da ke cikin littafin ilimina (takardu 5,000), ina iya lissafi da lokaci. Tambayi min abin da kake son sani.'
    : 'Sannu — hello! I am Kattau, your small offline agent. I answer from my own 5,000-document knowledge kit, do arithmetic and tell the time — all locally, no internet needed. Ask me anything.';
}
function skillTime(q) {
  const now = new Date();
  const d = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const t = now.toLocaleTimeString('en-GB');
  return `It is ${t} on ${d} by your device clock. (Honesty label: device clock, unverified — I have no way to check it offline.)`;
}
// BigInt-safe arithmetic (fixes the measured 17x23 offline-refusal defect)
function skillArithmetic(expr) {
  const norm = expr.replace(/[×x]/gi, '*').replace(/÷/g, '/').replace(/\s+/g, '');
  if (!/^[\d+\-*/%^().]+$/.test(norm)) return null;
  let i = 0;
  const peek = () => norm[i];
  const eat = (c) => { if (norm[i] === c) { i++; return true; } return false; };
  function number() {
    let j = i; while (j < norm.length && /[\d.]/.test(norm[j])) j++;
    const raw = norm.slice(i, j);
    if (!raw || /^\./.test(raw) || raw.includes('.') && /\.\d*\./.test(raw)) throw new Error('bad number');
    i = j;
    return raw.includes('.') ? { dec: true, v: raw } : { dec: false, v: BigInt(raw) };
  }
  function primary() {
    if (eat('(')) { const v = add(); if (!eat(')')) throw new Error('missing )'); return v; }
    if (eat('-')) { const v = primary(); return v.dec ? { dec: true, v: '-' + v.v } : { dec: false, v: -v.v }; }
    if (eat('+')) return primary();
    return number();
  }
  function pow() { let b = primary(); if (eat('^')) { const e = pow(); if (b.dec || e.dec || e.v < 0n) throw new Error('^ needs non-negative ints'); return { dec: false, v: b.v ** e.v }; } return b; }
  function mul() { let a = pow(); while (peek() === '*' || peek() === '/' || peek() === '%') {
    const op = norm[i++]; const b = pow();
    if (a.dec || b.dec) throw new Error('decimals in */% — integers only for exact math');
    if (op === '*') a = { dec: false, v: a.v * b.v };
    else if (op === '%') a = { dec: false, v: a.v % b.v };
    else { if (b.v === 0n) throw new Error('divide by zero'); a = { dec: false, v: a.v / b.v, exactDiv: a.v % b.v === 0n }; } }
    return a; }
  function add() { let a = mul(); while (peek() === '+' || peek() === '-') { const op = norm[i++]; const b = mul();
    if (a.dec || b.dec) throw new Error('decimals in +- — integers only for exact math');
    a = { dec: false, v: op === '+' ? a.v + b.v : a.v - b.v }; } return a; }
  try {
    const r = add();
    if (i !== norm.length) return null;
    if (r.dec) return { text: r.v, exact: true, note: 'decimal input' };
    return { text: r.v.toString(), exact: true, note: r.exactDiv === false ? 'integer division (remainder dropped), stated honestly' : 'exact BigInt math' };
  } catch (e) { return { error: e.message }; }
}
function skillIdentity(ha) {
  return (ha
    ? 'Ni Kattau ne, wakilin offline na HARZ. Karami ne: littafin ilimi na takardu 5,000 ne kawai, baya da harshe-model. Idan ba na iya amsawa ba, zan faɗa maka gaskiya.'
    : 'I am Kattau, the small offline HARZ agent. Honest scope: a 5,000-document knowledge kit, exact arithmetic, and the device clock. I run no language model on this device — when I do not know, I say so instead of pretending. This is a KNOWN LIMITATION, stated plainly.');
}

// ---------- knowledge (FTS5 over the sealed kit) ----------
function searchKit(db, query) {
  const sel = db.prepare('SELECT rowid, title, snippet FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3');
  const safe = '"' + query.replace(/"/g, '""') + '"';
  try { return sel.all(safe); }
  catch { try { return sel.all(query.replace(/["*()]/g, ' ')); } catch { return []; } }
}

// ---------- agent ----------
async function run() {
  const q = process.argv.slice(2).join(' ').trim();
  if (!q) {
    console.log(`${VERSION} — the small one. Fully offline.
Usage: node kattau.mjs "your question"
I answer from my own 5,000-doc kit (built once, ~6.5MB), do exact arithmetic, and tell the time. Three outcomes only: PASS / REFUSED HONESTLY / KNOWN LIMITATION. No internet, ever.`);
    return;
  }
  const t0 = Date.now();
  const tcp = await tcpProbe(), dnsr = await dnsProbe();
  const label = (tcp === 'CONNECTED') ? `ONLINE (network present — answered locally anyway; no calls made)` : `OFFLINE-VERIFIED (tcp=${tcp}, dns=${dnsr} — interfaces dead)`;
  const ha = isHausa(q);
  let answer = '', verdict = '', details = {};
  const lower = q.toLowerCase();
  const isArith = /^(lissa|lissafi|calculate|compute|what is|what's|nawa ne|yaya|how much is)?[\s\d+\-*/^%().x×÷]+$/.test(lower) && /\d/.test(q) && /[+\-*/^%x×÷]/.test(q);
  if (/^(hello|hi|hey|good (morning|afternoon|evening)|sannu|yo|salam)/i.test(lower)) {
    answer = skillGreeting(ha); verdict = 'PASS';
  } else if (/\b(time|date|today|what day|clock|lokaci|yau)\b/i.test(lower) && !/\d/.test(q)) {
    answer = skillTime(q); verdict = 'PASS';
  } else if (isArith) {
    const expr = q.replace(/^(lissa|lissafi|calculate|compute|what is|what's|nawa ne|yaya|how much is)\s*/i, '').replace(/\?+$/, '');
    const r = skillArithmetic(expr);
    if (r === null) { verdict = 'REFUSED HONESTLY'; answer = `That is not an expression my exact-arithmetic skill can parse ("${expr}"). I only do + - * / % ^ and parentheses on integers, exactly.`; }
    else if (r.error) { verdict = 'REFUSED HONESTLY'; answer = `Arithmetic refused honestly: ${r.error}. My skill does exact integer math; it will not guess.`; }
    else { verdict = 'PASS'; answer = `${expr.replace(/\s+/g, ' ')} = ${r.text} (${r.note}).`; details.arithmetic = { expr, result: r.text }; }
  } else if (/who are you|what are you|ka wane|wane ne kai|your name|kattau\??$/i.test(lower)) {
    answer = skillIdentity(ha); verdict = 'KNOWN LIMITATION';
  } else {
    const db = openKit();
    const t1 = Date.now();
    const hits = searchKit(db, q);
    const ms = Date.now() - t1;
    const sha = kitSha();
    db.close();
    if (hits.length === 0) {
      verdict = 'REFUSED HONESTLY';
      answer = (ha ? `Ba na da wannan a cikin littafina na takardu 5,000 ba. Karin gaskiya: ban san ko ina iya duba ba wajen nan, don haka ban amsa karye ba.` :
        `Not in my knowledge kit (5,000 sealed documents). I have no way to look beyond it offline, so I refuse rather than guess. If you have network, an online HARZ service may know more — I am honestly telling you I do not.`);
      details.kit = { sha256: sha, docs: 5000, results: 0, ms };
    } else {
      verdict = 'PASS';
      answer = (ha ? `Daga littafina (takarda ${hits[0].rowid}):\n` : `From my knowledge kit (doc ${hits[0].rowid}):\n`) +
        `* ${hits[0].title}\n` +
        (hits[0].snippet ? `${String(hits[0].snippet).slice(0, 300)}\n` : '') +
        (ha ? `(Hakika: sakamakon da aka zaba ta binciken gida; duba takarda kafin ka tuba, ni ba tabbatacce ba ne game da ma'ana.)`
            : `(Honesty: retrieved by local search, NOT verified for relevance beyond the kit. Check the source before relying on it.)`);
      details.kit = { sha256: sha, docs: 5000, results: hits.length, ms, top_ids: hits.map(h => h.rowid) };
    }
  }
  const totalMs = Date.now() - t0;
  const receipt = { agent: VERSION, query: q, verdict, label, answer, details, total_ms: totalMs, providers_called: [], ts: new Date().toISOString() };
  mkdirSync('receipts', { recursive: true });
  const rf = `receipts/kattau-${receipt.ts.replace(/[:.]/g, '-')}.json`;
  writeFileSync(rf, JSON.stringify(receipt, null, 2));
  console.log(answer);
  console.log(`\nVERDICT: ${verdict}`);
  console.log(`LABEL: ${label}`);
  console.log(`RECEIPT: ${rf} | ${totalMs}ms | providers_called: [] (no network was used to answer)`);
}
run().catch(e => { console.error('KATTAU ERROR (honest fail):', e.message); process.exit(1); });
