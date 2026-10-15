#!/usr/bin/env node
// KATTAU v0.2 CANDIDATE — knowledge + intelligence upgrade. v0.1 (kattau.mjs)
// is the ACCEPTED baseline and is untouched; this is the candidate build.
// UPGRAGES (all local, honest, no model, no network):
//   KNOWLEDGE: + HARZ ecosystem fact pack (own super-app page, trusted source,
//     provenance recorded) appended to the sealed 5K kit at rowids 200000+.
//   INTELLIGENCE: word-form arithmetic (seventeen times twenty-three),
//     numeric comparisons, percent-of, farewells, direct-form fact keys
//     (S-C2 proven pattern, exact interrogative only).
// Laws unchanged: three-outcome (PASS/REFUSED HONESTLY/KNOWN LIMITATION),
// receipts on every answer, network probed only to label, providers_called [].
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { createHash } from 'crypto';
import net from 'net';
import dns from 'dns';

const VERSION = 'kattau v0.2-candidate';
const KIT_DIR = '.kattau';
const KIT = `${KIT_DIR}/kb5k-v02.sqlite`;
const shasum = (buf) => createHash('sha256').update(buf).digest('hex');

// ---------- knowledge: sealed 5K + ecosystem fact pack ----------
function ecoDocs() {
  // embedded at build time from eco-facts.json (own infra source)
  return [{"name": "MindCare AI", "cat": "AI", "url": "https://mindcare-ai.vercel.app", "desc": "Mental health companion with CBT, DBT, mindfulness support"}, {"name": "Cyber Shield X", "cat": "Security", "url": "https://cyber-shield-x.vercel.app", "desc": "Cyber defense agent with 37 specialist sub-agents"}, {"name": "Omega Health AI", "cat": "Health", "url": "https://omega-health-ai.vercel.app", "desc": "Health platform with 18 medical specialists"}, {"name": "HarzDM", "cat": "Marketplace", "url": "https://harzdm-marketplace.vercel.app", "desc": "Global Digital Marketplace with multi-seller support"}, {"name": "BuildBot AI", "cat": "Construction", "url": "https://buildbot-ai-harz.vercel.app", "desc": "AI construction platform"}, {"name": "Omega Infinity", "cat": "AI", "url": "https://omega-infinity-dashboard.vercel.app", "desc": "Enterprise AI Orchestration Platform with Agent SDK"}, {"name": "TradeOS", "cat": "Trading", "url": "https://tradeos.vercel.app", "desc": "Enterprise AI Trading Platform — Multi-exchange, real-time WebSocket"}, {"name": "Omega Content AI", "cat": "Media", "url": "https://omega-content-ai.vercel.app", "desc": "Fully autonomous AI content studio"}, {"name": "Estate City AI", "cat": "Real Estate", "url": "https://abuja-estate-city-ai.vercel.app", "desc": "AI-Powered Smart Real Estate for Abuja, Nigeria"}, {"name": "ContentPilot", "cat": "Media", "url": "https://contentpilot-ai.vercel.app", "desc": "AI Content Agent dashboard for multi-platform social content"}, {"name": "Nexal Media", "cat": "Media", "url": "https://nexal-media.vercel.app", "desc": "Social Media Ad Publishing Platform — Facebook, Instagram, TikTok, YouTube, X, LinkedIn"}, {"name": "Apex Bank", "cat": "Finance", "url": "https://apex-ai-psi.vercel.app", "desc": "Apex Bank AI — Financial services platform"}, {"name": "HostMaster", "cat": "Hosting", "url": "https://harzdomain.vercel.app", "desc": "Enterprise Domain Registration, Cloud Hosting & AI Website Builder"}, {"name": "Omega Commander", "cat": "AI", "url": "https://omega-commander-ai.vercel.app", "desc": "Autonomous enterprise OS with 9 AI agents, approval workflows"}, {"name": "HarzAjo", "cat": "Finance", "url": "https://harzajo.vercel.app", "desc": "Savings and contribution platform"}, {"name": "HarzPay", "cat": "Finance", "url": "https://harzpay.vercel.app", "desc": "Payment processing platform"}, {"name": "HarzFX", "cat": "Finance", "url": "https://harzfx.vercel.app", "desc": "Foreign exchange platform"}, {"name": "HarzLend", "cat": "Finance", "url": "https://harzlend.vercel.app", "desc": "Lending and credit platform"}, {"name": "Maganu AI", "cat": "AI", "url": "https://omega-commander-ai.vercel.app", "desc": "Maganu AI — HARZ ecosystem assistant"}, {"name": "Omega Master", "cat": "AI", "url": "https://omega-master.vercel.app", "desc": "OMEGA MASTER — Supreme AI Command Hub for the Harz Ecosystem"}, {"name": "HarzMusic", "cat": "Marketplace", "url": "https://harz-music.vercel.app", "desc": "African Music Marketplace. Buy & sell Afrobeats, Amapiano, Gospel beats"}, {"name": "HarzFilm", "cat": "Marketplace", "url": "https://harz-film.vercel.app", "desc": "Global Film Marketplace. Buy, rent & stream films worldwide"}, {"name": "Harz Store", "cat": "Marketplace", "url": "https://harz-store.vercel.app", "desc": "Unified digital product marketplace with 468+ products"}, {"name": "Harz Digital", "cat": "Education", "url": "https://harz-digital.vercel.app", "desc": "Learn Trading & Digital Marketing — 18 AI tutors"}, {"name": "HarzDomain", "cat": "Hosting", "url": "https://harzdomain.vercel.app", "desc": "Retail & Wholesale Domain Platform with Real-time Domain Search"}, {"name": "DeployForge", "cat": "DevOps", "url": "https://harz-cloud.pages.dev/deployforge.html", "desc": "Multi-platform deployment engine (GitHub, Vercel, Render, Netlify, Railway)"}, {"name": "GDEG Energy", "cat": "Energy", "url": "https://gdeg.vercel.app", "desc": "Global Decentralized Energy Grid — Blockchain P2P renewable energy trading"}, {"name": "HARZ Cloud", "cat": "Infrastructure", "url": "https://harz-cloud-backend.onrender.com", "desc": "HARZ Cloud Backend v2.0 — 20 endpoints, 59 platforms. Express.js on Render"}, {"name": "HARZ Edge", "cat": "Infrastructure", "url": "https://harz-edge.vercel.app", "desc": "DNS, CDN, WAF & Edge Computing Platform"}, {"name": "HARZ AI OS", "cat": "AI", "url": "https://harz-ai-os.vercel.app", "desc": "Next-gen unified ecosystem interface"}, {"name": "NEXUS Pro", "cat": "Construction", "url": "https://harz-construction-pro.vercel.app", "desc": "HARZ Construction Management System"}, {"name": "HARZ Construction", "cat": "Construction", "url": "https://harz-construction-nd.vercel.app", "desc": "Construction company website"}, {"name": "HARZ Ecosystem Dashboard", "cat": "Infrastructure", "url": "https://harz-ecosystem-dashboard.vercel.app", "desc": "Unified Command Center for all Harz Ecosystem platforms"}, {"name": "HARZ Platform", "cat": "Infrastructure", "url": "https://harz-platform.vercel.app", "desc": "Enterprise showcase deployed across 5 platforms"}, {"name": "Omega AI Packager", "cat": "DevOps", "url": "https://github.com/rabiuhamza11/omega-ai-packager", "desc": "Ship AI agent projects: package, deploy anywhere, built-in RAG"}, {"name": "HARZ Portfolio", "cat": "Infrastructure", "url": "https://harz-cloud.pages.dev", "desc": "Official Portfolio & Ecosystem Showcase"}, {"name": "HARZ Super App", "cat": "Infrastructure", "url": "https://harz-cloud.pages.dev/harz-super-app-v5.html", "desc": "Unified ecosystem app with 56 platforms, wallet, agents, analytics"}, {"name": "HARZ AI Chat", "cat": "AI", "url": "https://harz-ai-chat.vercel.app", "desc": "Qwen-powered web chat"}, {"name": "HARZ Ecosystem App", "cat": "Infrastructure", "url": "https://github.com/rabiuhamza11/harz-ecosystem-app", "desc": "Flutter mobile app for Harz Ecosystem"}, {"name": "Omega Commander Bot", "cat": "AI", "url": "https://github.com/rabiuhamza11/omega-commander-bot", "desc": "Standalone Telegram Bot for OMEGA Business Commander"}, {"name": "FluxDeploy", "cat": "DevOps", "url": "https://github.com/rabiuhamza11/fluxdeploy", "desc": "Multi-platform deployment system — predecessor to DeployForge"}, {"name": "HarzStore", "cat": "Marketplace", "url": "https://harzdm-marketplace.vercel.app", "desc": "Multi-vendor marketplace platform"}, {"name": "HarzAjo Pro", "cat": "Finance", "url": "https://harzajo-pro.vercel.app", "desc": "Advanced savings & contribution tracking"}, {"name": "HarzID", "cat": "Security", "url": "https://harzid.vercel.app", "desc": "Identity verification & KYC"}, {"name": "HarzVPN", "cat": "Security", "url": "https://harzvpn.vercel.app", "desc": "Secure VPN service"}, {"name": "HarzCRM", "cat": "Business", "url": "https://harzcrm.vercel.app", "desc": "Customer relationship management"}, {"name": "HarzLogistics", "cat": "Logistics", "url": "https://harzlogistics.vercel.app", "desc": "Delivery & supply chain management"}, {"name": "HarzEvents", "cat": "Events", "url": "https://harzevents.vercel.app", "desc": "Event management & ticketing"}, {"name": "HarzGaming", "cat": "Gaming", "url": "https://harzgaming.vercel.app", "desc": "Gaming platform & tournaments"}, {"name": "HarzSocial", "cat": "Social", "url": "https://harzsocial.vercel.app", "desc": "Social networking for HARZ users"}, {"name": "HarzAI Writer", "cat": "AI", "url": "https://harzai-writer.vercel.app", "desc": "AI content writing assistant"}, {"name": "HarzVoice", "cat": "AI", "url": "https://harzvoice.vercel.app", "desc": "Voice-to-text & AI voice assistant"}, {"name": "HarzImage AI", "cat": "AI", "url": "https://harzimage-ai.vercel.app", "desc": "AI image generation & editing"}, {"name": "HarzCode AI", "cat": "AI", "url": "https://harzcode-ai.vercel.app", "desc": "AI code generation & review"}, {"name": "HarzTranslate", "cat": "AI", "url": "https://harztranslate.vercel.app", "desc": "AI translation service"}, {"name": "HarzLegal AI", "cat": "AI", "url": "https://harzlegal-ai.vercel.app", "desc": "AI legal advice & document review"}, {"name": "HARZ Mail", "cat": "Communication", "url": "https://harz-mail.hamzarabiu390.workers.dev", "desc": "Your @mail.harz address — ecosystem mail"}, {"name": "HARZ Super Cloud", "cat": "Infrastructure", "url": "https://super-cloud.harz.workers.dev", "desc": "HARZ Network Fabric — 84-service registry, routing and connectivity intelligence"}, {"name": "HARZ OMNINET", "cat": "Network", "url": "https://harz-omninet.hamzarabiu390.workers.dev", "desc": "Unified inter-platform network layer"}, {"name": "HARZ SPELL", "cat": "Blockchain", "url": "https://harz-spell.hamzarabiu390.workers.dev", "desc": "Smart contract language engine"}, {"name": "HARZ Genesis", "cat": "Blockchain", "url": "https://harz-genesis.hamzarabiu390.workers.dev", "desc": "Genesis block manager"}, {"name": "HARZ Neural", "cat": "Blockchain", "url": "https://harz-neural.hamzarabiu390.workers.dev", "desc": "Neural network layer"}, {"name": "HARZ Evolve", "cat": "Blockchain", "url": "https://harz-evolve.hamzarabiu390.workers.dev", "desc": "Evolution engine"}, {"name": "HARZ Quantum", "cat": "Blockchain", "url": "https://harz-quantum.harz.workers.dev", "desc": "Quantum chain services"}, {"name": "HARZ Sentinel", "cat": "Security", "url": "https://harz-sentinel.hamzarabiu390.workers.dev", "desc": "Security monitor and guard rails"}, {"name": "Merchant Portal", "cat": "Business", "url": "https://harz-merchant-portal.hamzarabiu390.workers.dev", "desc": "Merchant services portal"}, {"name": "HARZ Gateway", "cat": "Telecom", "url": "https://harz-gateway.harz.workers.dev", "desc": "SMS, voice and airtime API gateway"}, {"name": "HARZ Real Estate", "cat": "Real Estate", "url": "https://harz-realestate.harz.workers.dev", "desc": "Property marketplace"}, {"name": "Abuja Estate City", "cat": "Real Estate", "url": "https://abuja-estate-city.hamzarabiu390.workers.dev", "desc": "Abuja property listings and network"}, {"name": "SMS Exchange", "cat": "Telecom", "url": "https://harz-sms-exchange.hamzarabiu390.workers.dev", "desc": "SMS exchange platform"}, {"name": "HARZ Federation", "cat": "Network", "url": "https://harz-federation.hamzarabiu390.workers.dev", "desc": "Node federation services"}, {"name": "HARZ Edge Net", "cat": "Connectivity", "url": "https://harz-edge-net.hamzarabiu390.workers.dev", "desc": "Edge network layer"}, {"name": "HARZ Network B", "cat": "Network", "url": "https://harz-network-b.hamzarabiu390.workers.dev", "desc": "Alternate network node B"}, {"name": "Island", "cat": "Connectivity", "url": "https://island.hamzarabiu390.workers.dev", "desc": "Offline island connectivity node"}, {"name": "HARZ Mesh Sovereignty", "cat": "Connectivity", "url": "https://harz-mesh-sov.hamzarabiu390.workers.dev", "desc": "Mesh sovereignty transport"}, {"name": "HARZ Sovereignty", "cat": "Infrastructure", "url": "https://harz-sovereignty.hamzarabiu390.workers.dev", "desc": "Sovereignty services"}, {"name": "HARZ Network Core", "cat": "Network", "url": "https://harz-network-core.hamzarabiu390.workers.dev", "desc": "Core network services"}, {"name": "HARZ Commerce Network", "cat": "Business", "url": "https://harz-commerce-network.hamzarabiu390.workers.dev", "desc": "Commerce network layer"}, {"name": "HARZ Root", "cat": "Infrastructure", "url": "https://harz-root.harz.workers.dev", "desc": "Signed zone root — the ink keystore anchor"}, {"name": "HARZ Root B", "cat": "Infrastructure", "url": "https://harz-root-b.harz.workers.dev", "desc": "Root alternate node B"}, {"name": "HARZ Root Mirror A", "cat": "Infrastructure", "url": "https://harz-root-mirror-a.harz.workers.dev", "desc": "Root mirror A"}, {"name": "HARZ Root Mirror B", "cat": "Infrastructure", "url": "https://harz-root-mirror-b.harz.workers.dev", "desc": "Root mirror B"}, {"name": "Kattau", "cat": "AI", "url": "https://harz-kattau.harz.workers.dev", "desc": "HARZ offline agent (kattai = the small one in Hausa). Named by owner Rabiu Hamza, Oct 15 2026. Answers from a sealed 5,000-doc knowledge kit plus the HARZ ecosystem fact pack, does exact arithmetic and tells the time, fully offline with honest refusals. Phone (Termux) and desktop (PWA + local file) doors."}, {"name": "HARZ Ecosystem", "cat": "Overview", "url": "https://rabiuhamza11.github.io/harz-portfolio/harz-super-app.html", "desc": "HARZ is the digital ecosystem of architect, engineer and educationist Rabiu Hamza (owner). Includes HARZ AI OS, HarzDM marketplace, HARZ Search, HARZ Browser, HARZ Wallet and GDEG token, Danfodio Memorial Academy school platform, HARZ farm platforms, Kattau offline agent, and the HARZ million-doc knowledge corpus. Sovereignty law: everything fully owned on own infrastructure."}];
}
function loadKitDocs() {
  let docs = [];
  for (let i = 0; i < 10; i++) {
    const raw = readFileSync(`kb5k/shard${i}.json`, 'utf8');
    if (raw !== '[]') docs = docs.concat(JSON.parse(raw));
  }
  if (docs.length !== 5000) { console.error('FAIL: corpus is not the sealed 5K'); process.exit(1); }
  const eco = ecoDocs().map((d, i) => ({
    id: 200000 + i,
    title: `HARZ: ${d.name}${d.cat ? ' (' + d.cat + ')' : ''}`,
    snippet: `${d.desc} [Source: HARZ Super App (owned), ${d.url}]`
  }));
  return { docs, eco, total: docs.length + eco.length };
}
function buildKit() {
  mkdirSync(KIT_DIR, { recursive: true });
  const { docs, eco, total } = loadKitDocs();
  const db = new DatabaseSync(KIT);
  db.exec('CREATE VIRTUAL TABLE fts USING fts5(title, snippet)');
  const ins = db.prepare('INSERT INTO fts(rowid,title,snippet) VALUES(?,?,?)');
  db.exec('BEGIN');
  for (const d of docs) ins.run(d.id, d.title, d.snippet || '');
  for (const d of eco) ins.run(d.id, d.title, d.snippet);
  db.exec('COMMIT');
  db.close();
  return total;
}
function openKit() {
  if (!existsSync(KIT)) { const total = buildKit(); process.stderr.write(`kit v0.2 built: ${total} docs\n`); }
  return new DatabaseSync(KIT, { readOnly: true });
}
const kitSha = () => shasum(readFileSync(KIT));
const kitCount = () => { const db = openKit(); const n = db.prepare('SELECT COUNT(*) c FROM fts').get().c; db.close(); return n; };

// ---------- network probes (label only) ----------
const tcpProbe = () => new Promise(res => { const s = net.connect({host:'1.1.1.1',port:443,timeout:1500}); s.on('connect',()=>{s.destroy();res('CONNECTED');}); s.on('timeout',()=>{s.destroy();res('TIMEOUT');}); s.on('error',()=>res('REFUSED')); });
const dnsProbe = () => new Promise(res => dns.lookup('example.com',{timeout:1500},e=>res(e?'DNS-FAIL':'DNS-OK')));

// ---------- language ----------
const haTokens = /\b(sannu|lafiya|inakwana|kana|kake|me ya|abin da|yadda|lokaci|wani|gaskiya|bayan|daga)\b/i;
const isHausa = (q) => haTokens.test(q) || /\bsannu\b/i.test(q);

// ---------- v0.2 skills: word-form arithmetic (S-C2/S-C3 proven pattern) ----------
const WORDNUM = { zero:0n, one:1n, two:2n, three:3n, four:4n, five:5n, six:6n, seven:7n, eight:8n, nine:9n, ten:10n, eleven:11n, twelve:12n, thirteen:13n, fourteen:14n, fifteen:15n, sixteen:16n, seventeen:17n, eighteen:18n, nineteen:19n, twenty:20n, thirty:30n, forty:40n, fifty:50n, sixty:60n, seventy:70n, eighty:80n, ninety:90n, hundred:100n, thousand:1000n, million:1000000n };
function wordNum(str) {
  const t = str.toLowerCase().replace(/-/g, ' ').trim().split(/\s+/);
  let total = 0n, current = 0n;
  for (const w of t) {
    if (!(w in WORDNUM)) return null;
    const v = WORDNUM[w];
    if (v === 100n || v === 1000n || v === 1000000n) { current = (current || 1n) * v; if (v === 1000n || v === 1000000n) { total += current; current = 0n; } }
    else current += v;
  }
  return total + current;
}
const WORDOPS = { times:'*', 'multiplied by':'*', plus:'+', minus:'-', 'divided by':'/', x:'*', percent:'%' };
function wordArithmetic(q) {
  const s = q.toLowerCase().replace(/^(what is|what's|calculate|compute|nawa ne|lissa|lissafi)\s+/, '').replace(/\?+$/,'').trim();
  // N percent of M
  let m = s.match(/^(.+?)\s+percent\s+of\s+(.+)$/);
  if (m) { const a = parseNum(m[1]), b = parseNum(m[2]); if (a !== null && b !== null && b !== 0n) return { text: (a*b/100n).toString(), note: 'percent-of, exact integer math (remainder dropped where any, stated honestly)' }; }
  // A OP B with word/digit numbers
  m = s.match(/^(.+?)\s+(times|multiplied by|plus|minus|divided by|x)\s+(.+)$/);
  if (m) {
    const a = parseNum(m[1]), b = parseNum(m[3]);
    if (a !== null && b !== null) {
      const op = m[2] === 'x' ? '*' : WORDOPS[m[2]];
      if (op === '*' ) return { text: (a*b).toString(), note: 'word-form arithmetic, exact BigInt math' };
      if (op === '+' ) return { text: (a+b).toString(), note: 'word-form arithmetic, exact BigInt math' };
      if (op === '-' ) return { text: (a-b).toString(), note: 'word-form arithmetic, exact BigInt math' };
      if (op === '/' && b !== 0n) return { text: (a/b).toString(), note: 'word-form arithmetic, integer division (remainder dropped), stated honestly' };
    }
  }
  return null;
}
function parseNum(str) {
  const t = str.trim().replace(/,/g, '');
  if (/^\d+$/.test(t)) return BigInt(t);
  if (/^\d+\.\d+$/.test(t)) return null; // decimals: refuse (integers only, honest)
  return wordNum(t);
}
// v0.2 skill: numeric comparisons
function comparison(q) {
  const s = q.toLowerCase().replace(/^(what is|which is|is)\s+/,'').replace(/\?+$/,'').trim();
  let m = s.match(/^(?:which is )?(?:bigger|greater|larger)(?:,)?\s+(.+?)\s+or\s+(.+)$/);
  if (!m) m = s.match(/^(.+?)\s+(?:or\s+)?greater than\s+(.+)$/);
  if (!m) m = s.match(/^(.+?)\s+(?:or\s+)?less than\s+(.+)$/);
  if (!m) return null;
  const a = parseNum(m[1]), b = parseNum(m[2]);
  if (a === null || b === null) return null;
  if (a === b) return { text: `both are equal (${a})`, note: 'local comparison' };
  const gt = a > b;
  return { text: `${gt ? a : b} is greater`, note: 'local comparison' };
}
// v0.2 skill: direct-form fact keys (S-C2 pattern, exact interrogative only)
const FACT_KEYS = {
  'water': 'Water is the transparent, tasteless liquid (H2O) essential for all known life. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  'photosynthesis': 'Photosynthesis is the process by which plants convert sunlight, water and carbon dioxide into oxygen and energy. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  'gravity': 'Gravity is the force by which masses attract each other; Earth\'s gravity accelerates falling objects at about 9.8 m/s2. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  'the sun': 'The Sun is the star at the centre of our solar system, about 150 million km from Earth. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  'the moon': 'The Moon is Earth\'s only natural satellite, about 384,400 km away. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  'earth': 'Earth is our planet, third from the Sun, the only known home of life. (LOCAL FACT — stored knowledge, not retrieved evidence.)'
};

// v0.1 skills carried forward
function skillGreeting(ha) {
  return ha
    ? 'Sannu! Ni Kattau ne (v0.2) — wakilin ka marar intanet. Yanzu na san HARZ ecosystem, lissafin magana, da kwatance. Tambayi min!'
    : 'Sannu — hello! I am Kattau v0.2: I now know the HARZ ecosystem (82+ platforms, my own fact pack), word-form arithmetic ("seventeen times twenty-three"), comparisons and percent-of — all offline. Ask me anything.';
}
function skillTime() {
  const now = new Date();
  return `It is ${now.toLocaleTimeString('en-GB')} on ${now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} by your device clock. (Honesty label: device clock, unverified offline.)`;
}
function skillFarewell(ha) {
  return ha ? 'Sannu da zuwa! Ina nan kafin ka dawo. (Kattau yana aiki offline.)' : 'Goodbye! Kattau stays here, working offline. Sannu da zuwa.';
}
function skillIdentity(ha) {
  return ha ? 'Ni Kattau ne (v0.2), wakilin offline na HARZ. Na san littafin ilimi na takardu 5,000 da HARZ ecosystem, lissafi da lokaci. Ba zan yi karya ba idan ban sani ba.'
    : 'I am Kattau v0.2, the small offline HARZ agent. Honest scope: the sealed 5,000-doc kit + the HARZ ecosystem fact pack, exact arithmetic (digits, word-form, comparisons, percent-of), and the clock. No language model runs here — when I do not know, I say so. This is a KNOWN LIMITATION, stated plainly.';
}
function skillArithmetic(expr) {
  const norm = expr.replace(/[×x]/gi, '*').replace(/÷/g, '/').replace(/\s+/g, '');
  if (!/^[\d+\-*/%^().]+$/.test(norm)) return null;
  let i = 0;
  const peek = () => norm[i];
  const eat = (c) => { if (norm[i] === c) { i++; return true; } return false; };
  function number() { let j = i; while (j < norm.length && /[\d.]/.test(norm[j])) j++; const raw = norm.slice(i, j); if (!raw || /^\./.test(raw)) throw new Error('bad number'); i = j; return raw.includes('.') ? { dec: true, v: raw } : { dec: false, v: BigInt(raw) }; }
  function primary() { if (eat('(')) { const v = add(); if (!eat(')')) throw new Error('missing )'); return v; } if (eat('-')) { const v = primary(); return v.dec ? { dec: true, v: '-' + v.v } : { dec: false, v: -v.v }; } if (eat('+')) return primary(); return number(); }
  function pow() { let b = primary(); if (eat('^')) { const e = pow(); if (b.dec || e.dec || e.v < 0n) throw new Error('^ needs non-negative ints'); return { dec: false, v: b.v ** e.v }; } return b; }
  function mul() { let a = pow(); while (peek() === '*' || peek() === '/' || peek() === '%') { const op = norm[i++]; const b = pow(); if (a.dec || b.dec) throw new Error('decimals in */% — integers only for exact math'); if (op === '*') a = { dec: false, v: a.v * b.v }; else if (op === '%') a = { dec: false, v: a.v % b.v }; else { if (b.v === 0n) throw new Error('divide by zero'); a = { dec: false, v: a.v / b.v, exactDiv: a.v % b.v === 0n }; } } return a; }
  function add() { let a = mul(); while (peek() === '+' || peek() === '-') { const op = norm[i++]; const b = mul(); if (a.dec || b.dec) throw new Error('decimals in +- — integers only for exact math'); a = { dec: false, v: op === '+' ? a.v + b.v : a.v - b.v }; } return a; }
  try { const r = add(); if (i !== norm.length) return null; if (r.dec) return { text: r.v, note: 'decimal input' }; return { text: r.v.toString(), note: r.exactDiv === false ? 'integer division (remainder dropped), stated honestly' : 'exact BigInt math' }; } catch (e) { return { error: e.message }; }
}
function searchKit(db, query) {
  const sel = db.prepare('SELECT rowid, title, snippet FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3');
  const safe = '"' + query.replace(/"/g, '""') + '"';
  try { return sel.all(safe); } catch { try { return sel.all(query.replace(/["*()]/g, ' ')); } catch { return []; } }
}

async function run() {
  const q = process.argv.slice(2).join(' ').trim();
  if (!q) { console.log(`${VERSION} — knowledge + intelligence upgrade candidate.
Usage: node kattau-v02.mjs "your question"
New in v0.2: HARZ ecosystem fact pack (ask "what is HARZ"), word-form arithmetic, comparisons, percent-of, farewells.
v0.1 (kattau.mjs) is the accepted baseline and stays untouched until you rule.`); return; }
  const t0 = Date.now();
  const tcp = await tcpProbe(), dnsr = await dnsProbe();
  const label = (tcp === 'CONNECTED') ? 'ONLINE (network present — answered locally anyway; no calls made)' : `OFFLINE-VERIFIED (tcp=${tcp}, dns=${dnsr} — interfaces dead)`;
  const ha = isHausa(q);
  let answer = '', verdict = '', details = {};
  const lower = q.toLowerCase();
  const isArith = /^(lissa|lissafi|calculate|compute|what is|what's|nawa ne|yaya|how much is)?[\s\d+\-*/^%().x×÷]+$/.test(lower) && /\d/.test(q) && /[+\-*/^%x×÷]/.test(q);
  if (/^(hello|hi|hey|good (morning|afternoon|evening)|sannu|yo|salam)/i.test(lower)) { answer = skillGreeting(ha); verdict = 'PASS'; }
  else if (/^(bye|goodbye|good night|sai anjima|sannu da zuwa|later|see you)/i.test(lower)) { answer = skillFarewell(ha); verdict = 'PASS'; }
  else if (/\b(time|date|today|what day|clock|lokaci|yau)\b/i.test(lower) && !/\d/.test(q)) { answer = skillTime(); verdict = 'PASS'; }
  else if (isArith) {
    const expr = q.replace(/^(lissa|lissafi|calculate|compute|what is|what's|nawa ne|yaya|how much is)\s*/i, '').replace(/\?+$/, '');
    const r = skillArithmetic(expr);
    if (r === null) { verdict = 'REFUSED HONESTLY'; answer = `That is not an expression my exact-arithmetic skill can parse. I only do + - * / % ^ and parentheses on integers, exactly.`; }
    else if (r.error) { verdict = 'REFUSED HONESTLY'; answer = `Arithmetic refused honestly: ${r.error}. My skill does exact integer math; it will not guess.`; }
    else { verdict = 'PASS'; answer = `${expr.replace(/\s+/g, ' ')} = ${r.text} (${r.note}).`; }
  }
  else if (/who are you|what are you|ka wane|wane ne kai|your name/i.test(lower)) { answer = skillIdentity(ha); verdict = 'KNOWN LIMITATION'; }
  else {
    // v0.2: word-form arithmetic first, then comparisons, then fact keys, then kit
    const wa = wordArithmetic(q);
    const cmp = wa ? null : comparison(q);
    if (wa) { verdict = 'PASS'; answer = `${q.replace(/^(what is|what's|calculate|compute)\s*/i, '').replace(/\?+$/,'')} = ${wa.text} (${wa.note}).`; details.skill = 'word-form-arithmetic'; }
    else if (cmp) { verdict = 'PASS'; answer = `${cmp.text} (${cmp.note}).`; details.skill = 'comparison'; }
    else {
      const fk = /^what is\s+(.+?)\??$/.exec(lower);
      const fkKey = fk ? fk[1].trim() : null;
      if (fkKey && FACT_KEYS[fkKey]) { verdict = 'PASS'; answer = FACT_KEYS[fkKey]; details.skill = 'local-fact'; }
      else {
        // v0.2 intelligence: question-wrapper normalization before retrieval
        let nq = q.replace(/^(what is|what are|what's|who is|who are|tell me about|define|explain|ka me|me ya kasance|wane ne|abin da)\s+/i, '').replace(/^(the|a|an)\s+/i, '').replace(/\?+$/, '').trim() || q;
        const db = openKit();
        const t1 = Date.now();
        const hits = searchKit(db, nq);
        const ms = Date.now() - t1;
        const sha = kitSha();
        const n = kitCount();
        db.close();
        if (hits.length === 0) {
          verdict = 'REFUSED HONESTLY';
          answer = `Not in my knowledge (5,000 sealed documents + the HARZ ecosystem pack). I have no way to look beyond it offline, so I refuse rather than guess.`;
          details.kit = { sha256: sha, docs: n, results: 0, ms, normalized_query: nq };
        } else {
          verdict = 'PASS';
          answer = `From my knowledge (${hits[0].rowid >= 200000 ? 'HARZ ecosystem fact pack' : 'kit doc ' + hits[0].rowid}):\n* ${hits[0].title}\n${hits[0].snippet ? String(hits[0].snippet).slice(0, 320) + '\n' : ''}(Honesty: retrieved by local search, NOT verified for relevance beyond the kit.)`;
          details.kit = { sha256: sha, docs: n, results: hits.length, ms, top_ids: hits.map(h => h.rowid), normalized_query: nq };
        }
      }
    }
  }
  const totalMs = Date.now() - t0;
  const receipt = { agent: VERSION, query: q, verdict, label, answer, details, total_ms: totalMs, providers_called: [], ts: new Date().toISOString() };
  mkdirSync('receipts', { recursive: true });
  const rf = `receipts/kattau-v02-${receipt.ts.replace(/[:.]/g, '-')}.json`;
  writeFileSync(rf, JSON.stringify(receipt, null, 2));
  console.log(answer);
  console.log(`\nVERDICT: ${verdict}\nLABEL: ${label}\nRECEIPT: ${rf} | ${totalMs}ms | providers_called: []`);
}
run().catch(e => { console.error('KATTAU ERROR (honest fail):', e.message); process.exit(1); });
