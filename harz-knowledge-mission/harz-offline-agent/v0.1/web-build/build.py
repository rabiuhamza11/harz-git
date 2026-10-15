#!/usr/bin/env python3
# KATTAU web build v2 — door 1 (CF-hosted, wasm fetched) + door 2 (single local file)
import json, base64, os, shutil

KIT = json.load(open('kb5k.json'))

ECO = json.load(open('eco-facts.json'))
for _i, _d in enumerate(ECO):
    KIT.append({'i': 200000 + _i, 't': f"HARZ: {_d['name']}" + (f" ({_d.get('cat','')})" if _d.get('cat') else ''), 's': f"{_d['desc']} [Source: HARZ Super App (owned), {_d.get('url','')}]"})
print('web kit docs:', len(KIT))

FROZEN = json.load(open('/tmp/harz-e1-core/kb5k/frozen-queryset.json'))['cases']
glue = open('package/dist/index.mjs').read()
EXPORT = 'export { sqlite3InitModule as default, sqlite3Worker1Promiser$1 as sqlite3Worker1Promiser };'
assert EXPORT in glue
GLUE_CLASSIC = glue.replace(EXPORT, 'globalThis.__sqlite3Init = sqlite3InitModule;')
WASM_B64 = base64.b64encode(open('package/dist/sqlite3.wasm','rb').read()).decode()
KIT_JSON = json.dumps(KIT, separators=(',',':'))
FROZEN_JSON = json.dumps(FROZEN, separators=(',',':'))

AGENT_CORE = r'''
// ===== KATTAU agent core (ported from the accepted kattau.mjs) =====
const IS_LOCAL_FILE = __IS_LOCAL__;
const KIT_DOCS = __KIT__;
const FROZEN_CASES = __FROZEN__;

// ===== v0.2 skills: word-form arithmetic, percent-of, comparison, fact keys =====
const WORDNUM = {zero:0n,one:1n,two:2n,three:3n,four:4n,five:5n,six:6n,seven:7n,eight:8n,nine:9n,ten:10n,eleven:11n,twelve:12n,thirteen:13n,fourteen:14n,fifteen:15n,sixteen:16n,seventeen:17n,eighteen:18n,nineteen:19n,twenty:20n,thirty:30n,forty:40n,fifty:50n,sixty:60n,seventy:70n,eighty:80n,ninety:90n,hundred:100n,thousand:1000n,million:1000000n};
function wordNum(str){ const t=str.toLowerCase().replace(/-/g,' ').trim().split(/\s+/); let total=0n,current=0n;
  for(const w of t){ if(!(w in WORDNUM)) return null; const v=WORDNUM[w];
    if(v===100n||v===1000n||v===1000000n){ current=(current||1n)*v; if(v===1000n||v===1000000n){ total+=current; current=0n; } } else current+=v; }
  return total+current; }
function parseNum(str){ const t=str.trim().replace(/,/g,''); if(/^\d+$/.test(t)) return BigInt(t); if(/^\d+\.\d+$/.test(t)) return null; return wordNum(t); }
function wordArithmetic(q){
  const s2 = q.toLowerCase().replace(/^(what is|what's|calculate|compute|nawa ne|lissa|lissafi)\s+/,'').replace(/\?+$/,'').trim();
  let m = s2.match(/^(.+?)\s+percent\s+of\s+(.+)$/);
  if(m){ const a=parseNum(m[1]),b=parseNum(m[2]); if(a!==null&&b!==null&&b!==0n) return {text:(a*b/100n).toString(), note:'percent-of, exact integer math'}; }
  m = s2.match(/^(.+?)\s+(times|multiplied by|plus|minus|divided by|x)\s+(.+)$/);
  if(m){ const a=parseNum(m[1]),b=parseNum(m[3]); if(a!==null&&b!==null){
    if(m[2]==='times'||m[2]==='x'||m[2]==='multiplied by') return {text:(a*b).toString(), note:'word-form arithmetic, exact BigInt math'};
    if(m[2]==='plus') return {text:(a+b).toString(), note:'word-form arithmetic, exact BigInt math'};
    if(m[2]==='minus') return {text:(a-b).toString(), note:'word-form arithmetic, exact BigInt math'};
    if(m[2]==='divided by'&&b!==0n) return {text:(a/b).toString(), note:'word-form arithmetic, integer division (remainder dropped), stated honestly'}; } }
  return null;
}
function comparison(q){
  const s2 = q.toLowerCase().replace(/^(what is|which is|is)\s+/,'').replace(/\?+$/,'').trim();
  let m = s2.match(/^(?:which is )?(?:bigger|greater|larger)(?:,)?\s+(.+?)\s+or\s+(.+)$/);
  if(!m) return null;
  const a=parseNum(m[1]), b=parseNum(m[2]); if(a===null||b===null) return null;
  if(a===b) return {text:'both are equal ('+a+')', note:'local comparison'};
  return {text:((a>b?a:b)+' is greater'), note:'local comparison'};
}
const FACT_KEYS = {
  water:'Water is the transparent, tasteless liquid (H2O) essential for all known life. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  photosynthesis:'Photosynthesis is the process by which plants convert sunlight, water and carbon dioxide into oxygen and energy. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  gravity:'Gravity is the force by which masses attract each other; Earth\'s gravity accelerates falling objects at about 9.8 m/s2. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  'the sun':'The Sun is the star at the centre of our solar system, about 150 million km from Earth. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  'the moon':'The Moon is Earth\'s only natural satellite, about 384,400 km away. (LOCAL FACT — stored knowledge, not retrieved evidence.)',
  earth:'Earth is our planet, third from the Sun, the only known home of life. (LOCAL FACT — stored knowledge, not retrieved evidence.)'
};

const HA_TOKENS = /\b(sannu|lafiya|inakwana|kana|kake|me ya|abin da|yadda|lokaci|gaskiya|bayan|daga)\b/i;
const isHausa = q => /sannu/i.test(q) || HA_TOKENS.test(q);
function skillGreeting(ha){ return ha
  ? 'Sannu! Ni Kattau ne — wakilin ka marar intanet. Na san amsoshin da ke cikin littafin ilimina (takardu 5,000), ina iya lissafi da lokaci. Tambayi min abin da kake son sani.'
  : 'Sannu — hello! I am Kattau, your small offline agent. I answer from my own 5,000-document knowledge kit, do arithmetic and tell the time — all locally. Ask me anything.'; }
function skillTime(){ const now = new Date();
  return 'It is ' + now.toLocaleTimeString('en-GB') + ' on ' + now.toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) + ' by your device clock. (Honesty label: device clock, unverified offline.)'; }
function skillIdentity(ha){ return ha
  ? 'Ni Kattau ne, wakilin offline na HARZ. Karami ne: littafin ilimi na takardu 5,000 ne kawai, baya da harshe-model. Idan ba na iya amsawa ba, zan fa\u0257a maka gaskiya.'
  : 'I am Kattau, the small offline HARZ agent. Honest scope: a 5,000-document knowledge kit, exact arithmetic, and the clock. I run no language model in this browser — when I do not know, I say so instead of pretending. This is a KNOWN LIMITATION, stated plainly.'; }
function skillArithmetic(expr){
  const norm = expr.replace(/[\u00d7x]/gi,'*').replace(/\u00f7/g,'/').replace(/\s+/g,'');
  if(!/^[\d+\-*/%^().]+$/.test(norm)) return null;
  let i = 0;
  const peek = () => norm[i];
  const eat = c => { if(norm[i]===c){ i++; return true; } return false; };
  function number(){ let j=i; while(j<norm.length && /[\d.]/.test(norm[j])) j++;
    const raw = norm.slice(i,j); if(!raw || /^\./.test(raw)) throw new Error('bad number'); i=j;
    return raw.includes('.') ? {dec:true,v:raw} : {dec:false,v:BigInt(raw)}; }
  function primary(){ if(eat('(')){ const v=add(); if(!eat(')')) throw new Error('missing )'); return v; }
    if(eat('-')){ const v=primary(); return v.dec?{dec:true,v:'-'+v.v}:{dec:false,v:-v.v}; }
    if(eat('+')) return primary(); return number(); }
  function pow(){ let b=primary(); if(eat('^')){ const e=pow(); if(b.dec||e.dec||e.v<0n) throw new Error('^ needs non-negative ints'); return {dec:false,v:b.v**e.v}; } return b; }
  function mul(){ let a=pow(); while(peek()==='*'||peek()==='/'||peek()==='%'){
    const op=norm[i++]; const b=pow(); if(a.dec||b.dec) throw new Error('decimals in */% — integers only for exact math');
    if(op==='*') a={dec:false,v:a.v*b.v};
    else if(op==='%') a={dec:false,v:a.v%b.v};
    else { if(b.v===0n) throw new Error('divide by zero'); a={dec:false,v:a.v/b.v,exactDiv:a.v%b.v===0n}; } } return a; }
  function add(){ let a=mul(); while(peek()==='+'||peek()==='-'){
    const op=norm[i++]; const b=mul(); if(a.dec||b.dec) throw new Error('decimals in +- — integers only for exact math');
    a={dec:false,v:op==='+'?a.v+b.v:a.v-b.v}; } return a; }
  try { const r=add(); if(i!==norm.length) return null;
    if(r.dec) return {text:r.v, note:'decimal input'};
    return {text:r.v.toString(), note:r.exactDiv===false?'integer division (remainder dropped), stated honestly':'exact BigInt math'}; }
  catch(e){ return {error:e.message}; }
}
let DB = null, KIT_SHA = null, KIT_MS = null;
async function sha256hex(buf){ const h = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join(''); }
function initKit(sqlite3, kitBytes){
  const t0 = performance.now();
  const db = new sqlite3.oo1.DB(':memory:','c');
  db.exec('CREATE VIRTUAL TABLE fts USING fts5(title, snippet)');
  const ins = db.prepare('INSERT INTO fts(rowid,title,snippet) VALUES(?,?,?)');
  db.exec('BEGIN');
  for(const d of KIT_DOCS){ ins.bind([d.i,d.t,d.s]).stepReset(); }
  db.exec('COMMIT'); ins.finalize();
  KIT_MS = Math.round(performance.now()-t0); DB = db;
  return sha256hex(kitBytes).then(h => { KIT_SHA = h; return db; });
}
function searchKit(q){
  const sql = 'SELECT rowid,title,snippet FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3';
  const safe = '"'+q.replace(/"/g,'""')+'"';
  try { return DB.selectArrays(sql,[safe]); }
  catch(e){ try { return DB.selectArrays(sql,[q.replace(/["*()]/g,' ')]); } catch(e2){ return []; } }
}
async function netLabel(){
  if(IS_LOCAL_FILE) return 'LOCAL FILE (Kattau runs from your disk; no network is used, ever)';
  try { const c = new AbortController(); const t = setTimeout(()=>c.abort(), 1500);
    await fetch('/health', {signal: c.signal, cache:'no-store'}); clearTimeout(t);
    return 'ONLINE (network present — answered locally anyway; no calls made)'; }
  catch(e){ return 'OFFLINE-VERIFIED (network unreachable — answered locally from the kit)'; }
}
async function ask(q){
  const t0 = performance.now();
  const ha = isHausa(q);
  const lower = q.toLowerCase();
  let answer='', verdict='', details={};
  const isArith = /^(lissa|lissafi|calculate|compute|what is|what's|nawa ne|yaya|how much is)?[\s\d+\-*/^%().x\u00d7\u00f7]+$/.test(lower) && /\d/.test(q) && /[+\-*/^%x\u00d7\u00f7]/.test(q);
  if(/^(hello|hi|hey|good (morning|afternoon|evening)|sannu|yo|salam)/i.test(lower)){ answer = skillGreeting(ha); verdict='PASS'; }
  else if(/^(bye|goodbye|good night|sai anjima|sannu da zuwa|later|see you)/i.test(lower)){ answer = (ha?'Sannu da zuwa! Ina nan kafin ka dawo. (Kattau yana aiki offline.)':'Goodbye! Kattau stays here, working offline. Sannu da zuwa.'); verdict='PASS'; }
  else if(/\b(time|date|today|what day|clock|lokaci|yau)\b/i.test(lower) && !/\d/.test(q)){ answer = skillTime(); verdict='PASS'; }
  else if(isArith){
    const expr = q.replace(/^(lissa|lissafi|calculate|compute|what is|what's|nawa ne|yaya|how much is)\s*/i,'').replace(/\?+$/,'');
    const r = skillArithmetic(expr);
    if(r===null){ verdict='REFUSED HONESTLY'; answer='That is not an expression my exact-arithmetic skill can parse. I only do + - * / % ^ and parentheses on integers, exactly.'; }
    else if(r.error){ verdict='REFUSED HONESTLY'; answer='Arithmetic refused honestly: '+r.error+'. My skill does exact integer math; it will not guess.'; }
    else { verdict='PASS'; answer = expr+' = '+r.text+' ('+r.note+').'; }
  }
  else if(/who are you|what are you|ka wane|wane ne kai|your name/i.test(lower)){ answer=skillIdentity(ha); verdict='KNOWN LIMITATION'; }
  else {
    const wa = wordArithmetic(q);
    const cmp = wa ? null : comparison(q);
    if(wa){ verdict='PASS'; answer = q.replace(/^(what is|what's|calculate|compute)\s*/i,'').replace(/\?+$/,'')+' = '+wa.text+' ('+wa.note+').'; details={skill:'word-form-arithmetic'}; }
    else if(cmp){ verdict='PASS'; answer = cmp.text+' ('+cmp.note+').'; details={skill:'comparison'}; }
    else {
      const fk = /^what is\s+(.+?)\??$/.exec(lower);
      if(fk && FACT_KEYS[fk[1].trim()]){ verdict='PASS'; answer = FACT_KEYS[fk[1].trim()]; details={skill:'local-fact'}; }
      else if(DB){
    let nq = q.replace(/^(what is|what are|what's|who is|who are|tell me about|define|explain|ka me|me ya kasance|wane ne|abin da)\s+/i,'').replace(/^(the|a|an)\s+/i,'').replace(/\?+$/,'').trim() || q;
    const t1 = performance.now();
    const hits = searchKit(nq);
    const ms = Math.round(performance.now()-t1);
    if(hits.length===0){ verdict='REFUSED HONESTLY';
      answer = 'Not in my knowledge (sealed 5,000-doc kit + HARZ ecosystem pack). I have no way to look beyond it offline, so I refuse rather than guess.'; }
    else { verdict='PASS';
      answer = 'From my knowledge ('+(hits[0][0]>=200000?'HARZ ecosystem fact pack':'kit doc '+hits[0][0])+'):\n'+hits[0][1]+(hits[0][2] ? '\n'+String(hits[0][2]).slice(0,300) : '')+
        '\n(Honesty: retrieved by local search, NOT verified for relevance beyond the kit.)';
      details = {kit:{sha256:KIT_SHA ? KIT_SHA.slice(0,16)+'\u2026' : null, docs:KIT_DOCS.length, results:hits.length, ms, top_ids:hits.map(h=>h[0]), normalized_query:nq}}; }
    }
    else { verdict='KNOWN LIMITATION'; answer='Kit not loaded yet — Kattau is still building his knowledge base. Ask again in a second.'; }
    }
  }
  const label = await netLabel();
  return { agent:'kattau v0.2 (web)', query:q, answer, verdict, label, details, total_ms: Math.round(performance.now()-t0), providers_called: [], ts: new Date().toISOString() };
}
function runFrozenBattery(){
  let top1=0, top3=0;
  for(const c of FROZEN_CASES){
    const r = DB.selectArrays('SELECT rowid FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3',[c.query]);
    if(r[0] && r[0][0]===c.doc_id) top1++;
    if(r.map(x=>x[0]).includes(c.doc_id)) top3++;
  }
  return {top1, top3, threshold:19};
}
// ===== UI wiring (shared) =====
let LAST = null;
window.askGo = async () => {
  const q = document.getElementById('q').value.trim();
  if(!q) return;
  const a = document.getElementById('answer'); const v = document.getElementById('verdict');
  a.textContent = '…'; v.textContent = '';
  const r = await ask(q); LAST = r;
  a.textContent = r.answer;
  const cls = r.verdict === 'PASS' ? 'pass' : (r.verdict === 'REFUSED HONESTLY' ? 'ref' : 'known');
  v.innerHTML = '<span class="badge '+cls+'">'+r.verdict+'</span>' + r.label + ' · ' + r.total_ms + 'ms · providers_called: []';
  document.getElementById('receipt').style.display = 'none';
};
window.runBattery = async () => {
  if(!DB){ alert('kit not ready yet'); return; }
  const b = runFrozenBattery();
  const agentCases = [];
  const checks = [ ['hello','PASS'], ['what is 17x23','PASS'], ['calculate 987654321 * 987654321','PASS'],
                   ['who are you','KNOWN LIMITATION'], ['quantum chromodynamics lattice review','REFUSED HONESTLY'],
                   ['what is HARZ','PASS'], ['what is seventeen times twenty three','PASS'],
                   ['what is 20 percent of 240','PASS'], ['which is bigger, 17 or 23','PASS'] ];
  for(const [q, want] of checks){ const r = await ask(q); agentCases.push({q, got:r.verdict, want, pass:r.verdict===want}); }
  const allPass = b.top1>=19 && b.top3>=19 && agentCases.every(c=>c.pass);
  const receipt = { tool:'kattau-web-battery v0.1', ts:new Date().toISOString(),
    frozen:{top1:b.top1, top3:b.top3, threshold:19}, agentCases,
    kit:{sha256:KIT_SHA, docs:KIT_DOCS.length, build_ms:KIT_MS}, verdict: allPass?'PASS':'FAIL' };
  LAST = receipt;
  const a = document.getElementById('answer'); const v = document.getElementById('verdict');
  a.textContent = 'BATTERY ' + receipt.verdict + '\nFrozen parity: top1 ' + b.top1 + '/20, top3 ' + b.top3 + '/20 (threshold 19)\nAgent cases: ' + agentCases.map(c=>(c.pass?'ok':'FAIL')+': '+c.q).join('\n');
  v.innerHTML = '<span class="badge '+(allPass?'pass':'ref')+'">'+receipt.verdict+'</span>browser battery — receipt below, downloadable';
  const rc = document.getElementById('receipt'); rc.style.display='block';
  rc.textContent = JSON.stringify(receipt, null, 2);
};
window.saveReceipt = () => {
  if(!LAST) return;
  const blob = new Blob([JSON.stringify(LAST, null, 2)], {type:'application/json'});
  const aEl = document.createElement('a'); aEl.href = URL.createObjectURL(blob);
  aEl.download = 'kattau-receipt-' + Date.now() + '.json'; aEl.click();
};
'''

INIT_DOOR1 = r'''
// ===== door-1 init: wasm from same origin; kit is inline (single-file shell) =====
import('./dist/index.mjs').then(async (mod) => {
  const wasmBytes = await (await fetch('dist/sqlite3.wasm')).arrayBuffer();
  const sqlite3 = await mod.default({ wasmBinary: wasmBytes });
  const enc = new TextEncoder();
  const kitBytes = enc.encode(JSON.stringify(KIT_DOCS));
  await initKit(sqlite3, kitBytes);
  document.getElementById('kitstatus').textContent =
    'Kit ready: ' + KIT_DOCS.length.toLocaleString() + ' docs (5,000 sealed + HARZ ecosystem pack) · built in ' + KIT_MS + 'ms · sha256 ' + KIT_SHA.slice(0,16) + '…';
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
}).catch(e => { document.getElementById('kitstatus').textContent = 'KIT LOAD FAILED (honest error): ' + e; });
'''

INIT_DOOR2 = r'''
// ===== door-2 init: everything inline; no fetches at all =====
const WASM_B64 = "__WASM_B64__";
(async () => {
  const bin = Uint8Array.from(atob(WASM_B64), c => c.charCodeAt(0));
  const sqlite3 = await globalThis.__sqlite3Init({ wasmBinary: bin.buffer });
  const enc = new TextEncoder();
  const kitBytes = enc.encode(JSON.stringify(KIT_DOCS));
  await initKit(sqlite3, kitBytes);
  document.getElementById('kitstatus').textContent =
    'Kit ready (local file, zero network): ' + KIT_DOCS.length.toLocaleString() + ' docs (5,000 sealed + HARZ ecosystem pack) · built in ' + KIT_MS + 'ms · sha256 ' + KIT_SHA.slice(0,16) + '…';
})().catch(e => { document.getElementById('kitstatus').textContent = 'KIT LOAD FAILED (honest error): ' + e; });
'''

def core(is_local):
    return (AGENT_CORE
            .replace('__IS_LOCAL__', 'true' if is_local else 'false')
            .replace('__KIT__', KIT_JSON)
            .replace('__FROZEN__', FROZEN_JSON))

HTML = open('shell-template.html').read()

if __name__ == '__main__':
    os.makedirs('web/dist', exist_ok=True)
    # door 1
    boot1 = core(False) + INIT_DOOR1
    open('web/index.html','w').write(HTML.replace('__BOOT__', boot1))
    # door 2
    boot2 = 'globalThis.__sqlite3InitInit = null;\n' + GLUE_CLASSIC + '\n' + core(True) + INIT_DOOR2.replace('__WASM_B64__', WASM_B64)
    html2 = HTML.replace('__BOOT__', boot2).replace('<link rel="manifest" href="manifest.json">','').replace('<link rel="icon" href="icon-192.png">','')
    # inline MODULE script (file://-safe: no static imports; import.meta is valid in modules)
    html2 = html2.replace('<script>', '<script type="module">', 1)
    open('kattau-local.html','w').write(html2)
    # assets
    shutil.copy('package/dist/index.mjs','web/dist/index.mjs')
    shutil.copy('package/dist/sqlite3.wasm','web/dist/sqlite3.wasm')
    print('door 1 index.html:', os.path.getsize('web/index.html')//1024, 'KB')
    print('door 2 kattau-local.html:', os.path.getsize('kattau-local.html')//1024, 'KB')
