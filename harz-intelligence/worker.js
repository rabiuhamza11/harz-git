// HARZ INTELLIGENCE CORE v0.1
// Ask -> reason -> search -> use tool -> execute -> verify -> answer with evidence
// Components: AI Gateway | Reasoning Orchestrator | HARZ Search connector | Memory (KV, provenance-labeled)
//             Agent runtime | Verification (evidence + receipts) | HARZ Root identities | PWA interface
// Standing order honored: NVIDIA Nemotron via OpenRouter (default model, gateway-abstracted).

const VERSION = '0.1.0';
let ENV = {}; // module workers receive bindings via env — stored here at request start
const SEARCH_URL = 'https://harz-search.harz.workers.dev/search?q=';
const DEFAULT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b'; // fast MoE — ~1s responses
const FALLBACK_MODEL = 'nvidia/nemotron-3.5-lightning:free'; // slower free tier fallback
const CHAIN_STATUS_URL = 'https://harz-chain-v2.harz.workers.dev/api/status';

// ---------- HARZ ROOT identity registry (naming/trust layer) ----------
const ROOT_IDENTITIES = {
  'supreme-engine': { root_id: 'root:harz/intelligence/supreme-engine#1', role: 'reasoning + planning', created: '2026-09-24', can_use: ['search', 'fetch_url', 'chain_status', 'model'] },
  researcher: { root_id: 'root:harz/intelligence/agents/researcher#1', role: 'research agent — retrieval + synthesis', created: '2026-09-24', can_use: ['search', 'model'] },
  coder: { root_id: 'root:harz/intelligence/agents/coder#1', role: 'coding agent — writes and reviews code', created: '2026-09-24', can_use: ['search', 'model'] },
  analyst: { root_id: 'root:harz/intelligence/agents/analyst#1', role: 'analyst agent — data framing + reporting', created: '2026-09-24', can_use: ['search', 'chain_status', 'model'] },
  builder: { root_id: 'root:harz/intelligence/agents/builder#1', role: 'builder agent — ecosystem operations framing', created: '2026-09-24', can_use: ['search', 'chain_status', 'model'] },
};

const AGENT_PROMPTS = {
  'supreme-engine': 'You are HARZ Intelligence Core, the Supreme Engine of a sovereign AI system. You reason carefully and plan before answering. You ground every claim in the provided evidence and clearly separate verified facts from inference.',
  researcher: 'You are the HARZ Research agent. You synthesize retrieved evidence precisely, cite sources by title, and never invent facts that are not in the evidence.',
  coder: 'You are the HARZ Coder agent. You write production-grade code, explain design decisions briefly, and note testing steps.',
  analyst: 'You are the HARZ Analyst agent. You structure answers as clear analysis: findings, numbers where available, and honest caveats.',
  builder: 'You are the HARZ Builder agent. You frame answers as concrete build/deployment steps an operator can follow.',
};

// ---------- utils ----------
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...cors, ...headers } });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function id(prefix) {
  return prefix + '-' + crypto.randomUUID().slice(0, 12);
}

// ---------- 1. AI GATEWAY (model abstraction) ----------
async function callModel({ messages, model, temperature = 0.3 }) {
  const t0 = Date.now();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + (ENV.OPENROUTER_API_KEY || ''),
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://harz-intelligence.harz.workers.dev',
      'X-Title': 'HARZ Intelligence Core',
    },
    body: JSON.stringify({ model: model || DEFAULT_MODEL, messages, temperature }),
  });
  const latency = Date.now() - t0;
  if (!res.ok && model !== FALLBACK_MODEL) {
    return callModel({ messages, model: FALLBACK_MODEL, temperature });
  }
  if (!res.ok) {
    const errText = (await res.text()).slice(0, 300);
    return { ok: false, error: 'gateway_' + res.status, detail: errText, latency };
  }
  const data = await res.json();
  const usage = data.usage || {};
  return {
    ok: true,
    content: data.choices?.[0]?.message?.content || '',
    model: data.model || model || DEFAULT_MODEL,
    latency,
    tokens_in: usage.prompt_tokens || 0,
    tokens_out: usage.completion_tokens || 0,
  };
}


// streaming gateway call (OpenRouter stream:true) — keeps bytes flowing so no proxy drops the connection
async function callModelStream({ messages, model, temperature = 0.3, onDelta }) {
  const t0 = Date.now();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + (ENV.OPENROUTER_API_KEY || ''),
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://harz-intelligence.harz.workers.dev',
      'X-Title': 'HARZ Intelligence Core',
    },
    body: JSON.stringify({ model: model || DEFAULT_MODEL, messages, temperature, stream: true }),
  });
  if (!res.ok) {
    const errText = (await res.text()).slice(0, 200);
    return { ok: false, error: 'gateway_' + res.status, detail: errText, latency: Date.now() - t0, content: '' };
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', content = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const payload = t.slice(5).trim();
      if (payload === '[DONE]') continue;
      try {
        const j = JSON.parse(payload);
        const delta = j.choices?.[0]?.delta?.content || '';
        if (delta) { content += delta; if (onDelta) onDelta(delta); }
      } catch {}
    }
  }
  return { ok: true, content, model: model || DEFAULT_MODEL, latency: Date.now() - t0, tokens_in: null, tokens_out: null };
}

// ---------- 3. HARZ SEARCH connector ----------
async function harzSearch(query, limit = 5) {
  const t0 = Date.now();
  try {
    const svc = ENV.SEARCH_SVC;
    const res = svc
      ? await svc.fetch('https://search.internal/search?q=' + encodeURIComponent(query), { headers: { accept: 'application/json' } })
      : await fetch(SEARCH_URL + encodeURIComponent(query), { headers: { accept: 'application/json' } });
    if (!res.ok) return { ok: false, error: 'search_' + res.status, latency_ms: Date.now() - t0, results: [] };
    const data = await res.json();
    const results = (data.results || []).slice(0, limit).map(r => ({
      title: r.title, url: r.url, domain: r.domain, snippet: (r.snippet || '').slice(0, 400), score: r.score, source: r.source,
    }));
    return { ok: true, query, latency_ms: Date.now() - t0, results };
  } catch (e) {
    return { ok: false, error: 'search_unreachable', latency_ms: Date.now() - t0, results: [] };
  }
}


// Smart query construction: strip stopwords, progressive relaxation on empty results.
const STOPWORDS = new Set(['what','which','who','is','are','was','were','the','a','an','and','or','of','to','in','for','on','at','about','tell','me','please','exist','exists','around','give','show','do','does','how','why','can','you','your','it','its','that','this','with','have','has','i','we','my','our','there','their','from','by','as','be']);
function keywords(message, n) {
  return message.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w)).slice(0, n).join(' ');
}
function relevantResults(res, q) {
  const terms = q.split(' ').filter(w => w.length > 2);
  if (!terms.length) return res.results.length > 0;
  return res.results.some(r => {
    const hay = ((r.title || '') + ' ' + (r.snippet || '') + ' ' + (r.domain || '')).toLowerCase();
    return terms.every(w => hay.includes(w));
  });
}
function properNouns(message) {
  return message.split(/\s+/).filter(w => /^[A-Z][A-Za-z0-9-]{2,}/.test(w) && !STOPWORDS.has(w.toLowerCase())).map(w => w.toLowerCase().replace(/[^a-z0-9-]/g, '')).filter(Boolean).slice(0, 5).join(' ');
}
async function smartSearch(message) {
  const attempts = [properNouns(message), keywords(message, 8), keywords(message, 4), keywords(message, 2), message.slice(0, 60)].filter(Boolean);
  let fallback = null;
  for (const q of attempts) {
    const res = await harzSearch(q);
    if (res.ok && res.results.length) {
      if (relevantResults(res, q)) return { ...res, query_used: q };
      if (!fallback) fallback = res;
    }
  }
  if (fallback) return { ...fallback, query_used: attempts[0] || message.slice(0, 60), relevance: 'low' };
  return { ok: false, results: [], query_used: attempts[0] || message.slice(0, 60) };
}

// ---------- 6. TOOLS (deterministic interface) ----------
const TOOLS = {
  search: { description: 'Retrieve from the HARZ Search knowledge index' },
  fetch_url: { description: 'Fetch a public HTTPS page for evidence (1 per turn)' },
  chain_status: { description: 'Fetch live HARZ Chain status' },
  memory_write: { description: 'Persist an authorized memory with provenance (explicit "remember" requests only)' },
};

async function toolChainStatus(log) {
  const t0 = Date.now();
  try {
    const svc = ENV.CHAIN_SVC;
    const res = svc ? await svc.fetch('https://chain.internal/api/status') : await fetch(CHAIN_STATUS_URL);
    const data = res.ok ? await res.json() : null;
    log.push({ tool: 'chain_status', ok: res.ok, latency_ms: Date.now() - t0, summary: data ? { height: data.height, wallets: data.wallets, version: data.version } : 'http_' + res.status });
    return data ? `HARZ Chain live: height ${data.height}, wallets ${data.wallets}, consensus ${data.consensus}, v${data.version}.` : `Chain status fetch failed (http ${res.status}).`;
  } catch (e) {
    log.push({ tool: 'chain_status', ok: false, latency_ms: Date.now() - t0, error: 'unreachable' });
    return 'Chain status unreachable.';
  }
}

async function toolFetchUrl(url, log) {
  const t0 = Date.now();
  if (!/^https:\/\//.test(url)) { log.push({ tool: 'fetch_url', ok: false, error: 'https_only' }); return null; }
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'HARZ-Intelligence/0.1' } });
    const text = (await res.text()).slice(0, 4000);
    log.push({ tool: 'fetch_url', url, ok: res.ok, status: res.status, latency_ms: Date.now() - t0 });
    return { url, status: res.status, excerpt: text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 1200) };
  } catch (e) {
    log.push({ tool: 'fetch_url', url, ok: false, latency_ms: Date.now() - t0, error: 'unreachable' });
    return null;
  }
}

// ---------- 4. MEMORY (KV, provenance-labeled) ----------
const MEM = {
  async getConversation(cid) {
    const v = await ENV.MEMORY.get('conv:' + cid, 'json');
    return v || { id: cid, created: new Date().toISOString(), messages: [], authorized_memories: [] };
  },
  async saveConversation(conv) {
    conv.updated = new Date().toISOString();
    await ENV.MEMORY.put('conv:' + conv.id, JSON.stringify(conv));
  },
  async addAuthorizedMemory(conv, { key, value, scope, source }) {
    const rec = {
      key, value, scope: scope || 'user-authorized',
      provenance: { issued_by: 'root:harz/intelligence/supreme-engine#1', source: source || 'explicit-user-request', recorded_at: new Date().toISOString() },
    };
    conv.authored = conv.authorized_memories || [];
    conv.authorized_memories = conv.authorized_memories || [];
    conv.authorized_memories.push(rec);
    await ENV.MEMORY.put('mem:' + key, JSON.stringify(rec));
    return rec;
  },
  async createJob(job) {
    await ENV.MEMORY.put('job:' + job.id, JSON.stringify(job));
  },
  async updateJob(id, patch) {
    const j = (await ENV.MEMORY.get('job:' + id, 'json')) || null;
    if (!j) return null;
    Object.assign(j, patch);
    await ENV.MEMORY.put('job:' + id, JSON.stringify(j));
    return j;
  },
  async getJob(id) {
    return (await ENV.MEMORY.get('job:' + id, 'json')) || null;
  },
  async benchAppend(entry) {
    const log = (await ENV.MEMORY.get('bench:log', 'json')) || { runs: [] };
    log.runs.push(entry);
    if (log.runs.length > 100) log.runs = log.runs.slice(-100);
    await ENV.MEMORY.put('bench:log', JSON.stringify(log));
  },
};

// ---------- 2. REASONING ORCHESTRATOR ----------
function planTask(message, agent) {
  const lower = message.toLowerCase();
  const plan = [];
  const wantsRemember = /remember (this|that)|don'?t forget|keep in memory/.test(lower);
  const urls = message.match(/https:\/\/[^\s)]+/g) || [];
  const wantsChain = /chain|block|wallet|miner|harz pay|balance/.test(lower);
  const wantsSearch = true; // knowledge grounding is always on in v0.1
  if (wantsSearch) plan.push({ step: 'search', why: 'ground answer in HARZ knowledge index' });
  if (urls.length) plan.push({ step: 'fetch_url', why: 'retrieve user-provided evidence', urls: urls.slice(0, 1) });
  if (wantsChain) plan.push({ step: 'chain_status', why: 'live chain data requested or relevant' });
  plan.push({ step: 'reason', why: 'synthesize evidence + memory into answer' });
  plan.push({ step: 'verify', why: 'receipt + evidence record' });
  if (wantsRemember) plan.push({ step: 'memory_write', why: 'explicit user authorization to persist' });
  return { plan, agent: agent || 'supreme-engine' };
}

async function orchestrate({ message, conversation_id, agent }) {
  const t_start = Date.now();
  const cid = conversation_id || id('c');
  const { plan } = planTask(message, agent);
  const identity = ROOT_IDENTITIES[agent] || ROOT_IDENTITIES['supreme-engine'];
  const execution_log = [];
  const evidence = [];

  // memory load
  const conv = await MEM.getConversation(cid);
  const priorTurns = (conv.messages || []).slice(-6);
  execution_log.push({ step: 'memory', ok: true, detail: priorTurns.length ? priorTurns.length + ' prior turns loaded' : 'new conversation' });

  // search
  const searchRes = await smartSearch(message);
  execution_log.push({ step: 'search', ok: searchRes.ok, results: searchRes.results.length, latency_ms: searchRes.latency_ms });
  if (searchRes.ok && searchRes.results.length) {
    evidence.push({ type: 'search', results: searchRes.results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet.slice(0, 160) })) });
  }

  // tools
  let chainFact = '';
  if (plan.some(p => p.step === 'chain_status')) {
    chainFact = await toolChainStatus(execution_log);
    evidence.push({ type: 'tool', tool: 'chain_status', result: chainFact });
  }
  let fetchedDoc = null;
  const fetchStep = plan.find(p => p.step === 'fetch_url');
  if (fetchStep) {
    fetchedDoc = await toolFetchUrl(fetchStep.urls[0], execution_log);
    if (fetchedDoc) evidence.push({ type: 'tool', tool: 'fetch_url', url: fetchedDoc.url, excerpt: fetchedDoc.excerpt.slice(0, 400) });
  }

  // reason (model call through the gateway)
  const sysPrompt = (AGENT_PROMPTS[agent] || AGENT_PROMPTS['supreme-engine']) +
    ' Answer with clear structure. Cite evidence by title when you use it. If the evidence does not contain the answer, say so plainly. End with a line "CONFIDENCE: high|medium|low" based on evidence quality.';
  const contextBlock = [
    searchRes.ok && searchRes.results.length ? 'SEARCH RESULTS:\n' + searchRes.results.map((r, i) => `[S${i + 1}] ${r.title} (${r.url})\n${r.snippet}`).join('\n\n') : 'SEARCH RESULTS: none found',
    chainFact ? 'CHAIN STATUS: ' + chainFact : '',
    fetchedDoc ? 'FETCHED DOCUMENT (' + fetchedDoc.url + '): ' + fetchedDoc.excerpt.slice(0, 1000) : '',
    priorTurns.length ? 'CONVERSATION MEMORY (recent):\n' + priorTurns.map(m => m.role + ': ' + m.content.slice(0, 300)).join('\n') : '',
    (conv.authorized_memories || []).length ? 'AUTHORIZED MEMORIES:\n' + conv.authorized_memories.map(m => m.key + ' = ' + m.value).join('\n') : '',
  ].filter(Boolean).join('\n\n');

  const modelRes = await callModel({
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: contextBlock + '\n\nUSER REQUEST:\n' + message },
    ],
  });
  execution_log.push({ step: 'reason', ok: modelRes.ok, model: modelRes.model || DEFAULT_MODEL, latency_ms: modelRes.latency, tokens_in: modelRes.tokens_in, tokens_out: modelRes.tokens_out });

  let answer, meta;
  if (modelRes.ok) {
    answer = modelRes.content;
    meta = { model: modelRes.model, gateway_latency_ms: modelRes.latency, tokens_in: modelRes.tokens_in, tokens_out: modelRes.tokens_out };
  } else {
    // Degraded mode: the orchestrator still returns structured evidence even if the model layer fails.
    answer = 'The reasoning layer is temporarily unavailable (' + modelRes.error + '). Evidence collected for your request:\n' +
      evidence.map(e => e.type === 'search' ? e.results.map(r => '- ' + r.title + ' (' + r.url + ')').join('\n') : JSON.stringify(e.result || e.excerpt || '')).join('\n');
    meta = { model: null, gateway_latency_ms: modelRes.latency, degraded: true, error: modelRes.detail || modelRes.error };
  }

  // memory write (explicit authorization only)
  let memoryWritten = null;
  if (plan.some(p => p.step === 'memory_write')) {
    const m = message.match(/remember (?:this|that)[:\s]+(.+)|don'?t forget[:\s]+(.+)|keep in memory[:\s]+(.+)/i);
    const value = (m && (m[1] || m[2] || m[3])) || message;
    memoryWritten = await MEM.addAuthorizedMemory(conv, { key: 'mem-' + (conv.authorized_memories?.length || 0) + 1, value: value.trim(), scope: 'user-authorized', source: 'explicit phrase in user message' });
    execution_log.push({ step: 'memory_write', ok: true, key: memoryWritten.key });
  }

  // verification (receipt + evidence)
  const total_latency = Date.now() - t_start;
  const receipt = await sha256((answer || '') + JSON.stringify(evidence));
  const verification = {
    status: evidence.length ? 'grounded-in-evidence' : 'no-external-evidence',
    receipt_sha256: receipt,
    evidence_count: evidence.length,
    note: 'v0.1 verification = evidence collection + execution logs + receipts. Cryptographic anchoring ships at v0.4.',
  };

  conv.messages.push({ role: 'user', content: message, at: new Date().toISOString() });
  conv.messages.push({ role: 'assistant', content: answer, at: new Date().toISOString(), verification });
  await MEM.saveConversation(conv);
  await MEM.benchAppend({ at: new Date().toISOString(), latency_ms: total_latency, tokens: (meta.tokens_in || 0) + (meta.tokens_out || 0), agent: agent || 'supreme-engine', degraded: !!meta.degraded });

  return {
    conversation_id: cid,
    answer,
    agent: { name: agent || 'supreme-engine', root_id: identity.root_id, role: identity.role },
    plan,
    evidence,
    execution_log,
    verification,
    meta: { ...meta, total_latency_ms: total_latency },
  };
}


// Streaming orchestration: evidence first, streamed answer, receipt footer.
async function orchestrateStream({ message, conversation_id, agent }, stream) {
  const writer = stream.writable.getWriter();
  const enc = new TextEncoder();
  const t_start = Date.now();
  const cid = conversation_id || id('c');
  const { plan } = planTask(message, agent);
  const identity = ROOT_IDENTITIES[agent] || ROOT_IDENTITIES['supreme-engine'];
  const execution_log = [];
  const evidence = [];
  const conv = await MEM.getConversation(cid);
  const priorTurns = (conv.messages || []).slice(-6);
  execution_log.push({ step: 'memory', ok: true, detail: priorTurns.length ? priorTurns.length + ' prior turns' : 'new conversation' });
  const searchRes = await smartSearch(message);
  execution_log.push({ step: 'search', ok: searchRes.ok, results: searchRes.results.length, latency_ms: searchRes.latency_ms });
  if (searchRes.ok && searchRes.results.length) evidence.push({ type: 'search', results: searchRes.results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet.slice(0, 160) })) });
  let chainFact = '';
  if (plan.some(p => p.step === 'chain_status')) { chainFact = await toolChainStatus(execution_log); evidence.push({ type: 'tool', tool: 'chain_status', result: chainFact }); }
  let fetchedDoc = null;
  const fetchStep = plan.find(p => p.step === 'fetch_url');
  if (fetchStep) { fetchedDoc = await toolFetchUrl(fetchStep.urls[0], execution_log); if (fetchedDoc) evidence.push({ type: 'tool', tool: 'fetch_url', url: fetchedDoc.url, excerpt: fetchedDoc.excerpt.slice(0, 400) }); }
  const sysPrompt = (AGENT_PROMPTS[agent] || AGENT_PROMPTS['supreme-engine']) +
    ' Cite evidence by title when you use it. If the evidence does not contain the answer, say so plainly. End with a line "CONFIDENCE: high|medium|low".';
  const contextBlock = [
    searchRes.ok && searchRes.results.length ? 'SEARCH RESULTS:\n' + searchRes.results.map((r, i) => '[S' + (i + 1) + '] ' + r.title + ' (' + r.url + ')\n' + r.snippet).join('\n\n') : 'SEARCH RESULTS: none found',
    chainFact ? 'CHAIN STATUS: ' + chainFact : '',
    fetchedDoc ? 'FETCHED DOCUMENT (' + fetchedDoc.url + '): ' + fetchedDoc.excerpt.slice(0, 1000) : '',
    priorTurns.length ? 'CONVERSATION MEMORY (recent):\n' + priorTurns.map(m => m.role + ': ' + m.content.slice(0, 300)).join('\n') : '',
    (conv.authorized_memories || []).length ? 'AUTHORIZED MEMORIES:\n' + conv.authorized_memories.map(m => m.key + ' = ' + m.value).join('\n') : '',
  ].filter(Boolean).join('\n\n');
  const modelRes = await callModelStream({
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: contextBlock + '\n\nUSER REQUEST:\n' + message },
    ],
    onDelta: (d) => writer.write(enc.encode(d)),
  });
  execution_log.push({ step: 'reason', ok: modelRes.ok, model: modelRes.model, latency_ms: modelRes.latency });
  let answer;
  if (modelRes.ok) { answer = modelRes.content; }
  else {
    answer = 'The reasoning layer is temporarily unavailable (' + modelRes.error + '). Evidence collected:\n' +
      evidence.map(e => e.type === 'search' ? e.results.map(r => '- ' + r.title + ' (' + r.url + ')').join('\n') : JSON.stringify(e.result || e.excerpt || '')).join('\n');
    writer.write(enc.encode(answer));
  }
  let memoryWritten = null;
  if (plan.some(p => p.step === 'memory_write')) {
    const m = message.match(/remember (?:this|that)[:\s]+(.+)|don'?t forget[:\s]+(.+)|keep in memory[:\s]+(.+)/i);
    const value = (m && (m[1] || m[2] || m[3])) || message;
    memoryWritten = await MEM.addAuthorizedMemory(conv, { key: 'mem-' + ((conv.authorized_memories?.length || 0) + 1), value: value.trim(), scope: 'user-authorized', source: 'explicit phrase in user message' });
    execution_log.push({ step: 'memory_write', ok: true, key: memoryWritten.key });
  }
  const total_latency = Date.now() - t_start;
  const receipt = await sha256((answer || '') + JSON.stringify(evidence));
  const verification = {
    status: evidence.length ? 'grounded-in-evidence' : 'no-external-evidence',
    receipt_sha256: receipt, evidence_count: evidence.length,
    note: 'v0.1 verification = evidence collection + execution logs + receipts.',
  };
  conv.messages.push({ role: 'user', content: message, at: new Date().toISOString() });
  conv.messages.push({ role: 'assistant', content: answer, at: new Date().toISOString(), verification });
  await MEM.saveConversation(conv);
  await MEM.benchAppend({ at: new Date().toISOString(), latency_ms: total_latency, tokens: 0, agent: agent || 'supreme-engine', degraded: !modelRes.ok, streamed: true });
  const footer = '\n\n[[HARZ_META]]' + JSON.stringify({ conversation_id: cid, agent: { name: agent || 'supreme-engine', root_id: identity.root_id, role: identity.role }, plan, evidence, execution_log, verification, meta: { model: modelRes.ok ? modelRes.model : null, gateway_latency_ms: modelRes.latency, total_latency_ms: total_latency, streamed: true } });
  writer.write(enc.encode(footer));
  writer.close();
}


// Job-based orchestration: short HTTP requests + polling — robust on slow/proxied networks.
async function orchestrateJob({ message, conversation_id, agent }, jobId) {
  const t_start = Date.now();
  const cid = conversation_id || id('c');
  const { plan } = planTask(message, agent);
  const identity = ROOT_IDENTITIES[agent] || ROOT_IDENTITIES['supreme-engine'];
  const execution_log = [];
  const evidence = [];
  const conv = await MEM.getConversation(cid);
  const priorTurns = (conv.messages || []).slice(-6);
  execution_log.push({ step: 'memory', ok: true, detail: priorTurns.length ? priorTurns.length + ' prior turns' : 'new conversation' });
  const searchRes = await smartSearch(message);
  execution_log.push({ step: 'search', ok: searchRes.ok, results: searchRes.results.length, latency_ms: searchRes.latency_ms });
  if (searchRes.ok && searchRes.results.length) evidence.push({ type: 'search', results: searchRes.results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet.slice(0, 160) })) });
  await MEM.updateJob(jobId, { status: 'searching', conversation_id: cid, plan });
  let chainFact = '';
  if (plan.some(p => p.step === 'chain_status')) { chainFact = await toolChainStatus(execution_log); evidence.push({ type: 'tool', tool: 'chain_status', result: chainFact }); }
  let fetchedDoc = null;
  const fetchStep = plan.find(p => p.step === 'fetch_url');
  if (fetchStep) { fetchedDoc = await toolFetchUrl(fetchStep.urls[0], execution_log); if (fetchedDoc) evidence.push({ type: 'tool', tool: 'fetch_url', url: fetchedDoc.url, excerpt: fetchedDoc.excerpt.slice(0, 400) }); }
  await MEM.updateJob(jobId, { status: 'reasoning' });
  const sysPrompt = (AGENT_PROMPTS[agent] || AGENT_PROMPTS['supreme-engine']) +
    ' Cite evidence by title when you use it. If the evidence does not contain the answer, say so plainly. End with a line "CONFIDENCE: high|medium|low".';
  const contextBlock = [
    searchRes.ok && searchRes.results.length ? 'SEARCH RESULTS:\n' + searchRes.results.map((r, i) => '[S' + (i + 1) + '] ' + r.title + ' (' + r.url + ')\n' + r.snippet).join('\n\n') : 'SEARCH RESULTS: none found',
    chainFact ? 'CHAIN STATUS: ' + chainFact : '',
    fetchedDoc ? 'FETCHED DOCUMENT (' + fetchedDoc.url + '): ' + fetchedDoc.excerpt.slice(0, 1000) : '',
    priorTurns.length ? 'CONVERSATION MEMORY (recent):\n' + priorTurns.map(m => m.role + ': ' + m.content.slice(0, 300)).join('\n') : '',
    (conv.authorized_memories || []).length ? 'AUTHORIZED MEMORIES:\n' + conv.authorized_memories.map(m => m.key + ' = ' + m.value).join('\n') : '',
  ].filter(Boolean).join('\n\n');
  const modelRes = await callModel({
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: contextBlock + '\n\nUSER REQUEST:\n' + message },
    ],
  });
  execution_log.push({ step: 'reason', ok: modelRes.ok, model: modelRes.model || DEFAULT_MODEL, latency_ms: modelRes.latency, tokens_in: modelRes.tokens_in, tokens_out: modelRes.tokens_out });
  let answer;
  let meta;
  if (modelRes.ok) { answer = modelRes.content; meta = { model: modelRes.model, gateway_latency_ms: modelRes.latency, tokens_in: modelRes.tokens_in, tokens_out: modelRes.tokens_out }; }
  else {
    answer = 'The reasoning layer is temporarily unavailable (' + modelRes.error + '). Evidence collected for your request:\n' +
      evidence.map(e => e.type === 'search' ? e.results.map(r => '- ' + r.title + ' (' + r.url + ')').join('\n') : JSON.stringify(e.result || e.excerpt || '')).join('\n');
    meta = { model: null, degraded: true, error: modelRes.detail || modelRes.error, gateway_latency_ms: modelRes.latency };
  }
  let memoryWritten = null;
  if (plan.some(p => p.step === 'memory_write')) {
    const m = message.match(/remember (?:this|that)[:\s]+(.+)|don'?t forget[:\s]+(.+)|keep in memory[:\s]+(.+)/i);
    const value = (m && (m[1] || m[2] || m[3])) || message;
    memoryWritten = await MEM.addAuthorizedMemory(conv, { key: 'mem-' + ((conv.authorized_memories?.length || 0) + 1), value: value.trim(), scope: 'user-authorized', source: 'explicit phrase in user message' });
    execution_log.push({ step: 'memory_write', ok: true, key: memoryWritten.key });
  }
  const total_latency = Date.now() - t_start;
  const receipt = await sha256((answer || '') + JSON.stringify(evidence));
  const verification = {
    status: evidence.length ? 'grounded-in-evidence' : 'no-external-evidence',
    receipt_sha256: receipt, evidence_count: evidence.length,
    note: 'v0.1 verification = evidence collection + execution logs + receipts.',
  };
  conv.messages.push({ role: 'user', content: message, at: new Date().toISOString() });
  conv.messages.push({ role: 'assistant', content: answer, at: new Date().toISOString(), verification });
  await MEM.saveConversation(conv);
  await MEM.benchAppend({ at: new Date().toISOString(), latency_ms: total_latency, tokens: (meta.tokens_in || 0) + (meta.tokens_out || 0), agent: agent || 'supreme-engine', degraded: !!meta.degraded });
  const result = {
    conversation_id: cid,
    answer,
    agent: { name: agent || 'supreme-engine', root_id: identity.root_id, role: identity.role },
    plan, evidence, execution_log, verification,
    meta: { ...meta, total_latency_ms: total_latency },
  };
  await MEM.updateJob(jobId, { status: 'done', result });
  return result;
}

// ---------- 7. FROZEN BENCHMARK ----------
async function benchData() {
  const log = (await ENV.MEMORY.get('bench:log', 'json')) || { runs: [] };
  const runs = log.runs;
  const okRuns = runs.filter(r => !r.degraded);
  const avgLatency = okRuns.length ? Math.round(okRuns.reduce((a, r) => a + r.latency_ms, 0) / okRuns.length) : null;
  return {
    frozen_at: '2026-09-24',
    tests: [
      { test: 'reasoning', status: 'pending benchmark run', measure: 'task suite TBD at v0.2' },
      { test: 'coding', status: 'pending benchmark run', measure: 'task suite TBD at v0.3' },
      { test: 'research', status: 'pending benchmark run', measure: 'retrieval accuracy suite' },
      { test: 'factual accuracy', status: 'pending benchmark run', measure: 'evidence-grounding rate' },
      { test: 'tool execution', status: 'pending benchmark run', measure: 'tool success rate' },
      { test: 'long-context work', status: 'pending benchmark run', measure: 'context window suite' },
      { test: 'autonomous tasks', status: 'pending benchmark run', measure: 'multi-step completion' },
      { test: 'offline operation', status: 'pending benchmark run', measure: 'mesh/DTN suite at v0.6' },
      { test: 'verification', status: 'measured (receipts on every answer)', measure: 'receipts issued: ' + runs.length },
      { test: 'latency', status: okRuns.length ? 'measured' : 'pending first live run', measure: avgLatency !== null ? avgLatency + ' ms avg (last ' + okRuns.length + ' runs)' : 'no runs yet' },
      { test: 'cost/task', status: okRuns.length ? 'measured' : 'pending first live run', measure: okRuns.length ? Math.round(okRuns.reduce((a, r) => a + (r.tokens || 0), 0) / okRuns.length) + ' tokens avg' : 'no runs yet' },
    ],
    live_runs: runs.length,
    rule: 'No "better than ChatGPT" claims. HARZ numbers only, from reproducible tests.',
  };
}

// ---------- 8. PWA INTERFACE ----------
const MANIFEST = {
  name: 'HARZ Intelligence', short_name: 'HARZ AI', start_url: '/', display: 'standalone',
  background_color: '#f0f2f5', theme_color: '#f0f2f5',
  icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
};

const SW = `const C='hi-shell-v0.1.2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['/'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
if(u.pathname.startsWith('/api/')){e.respondWith(fetch(e.request));return;}
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl));return res;}).catch(()=>caches.match('/'))));});`;

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f0f2f5"/><circle cx="32" cy="32" r="20" fill="none" stroke="#2563eb" stroke-width="4"/><circle cx="32" cy="32" r="9" fill="#2563eb"/><path d="M32 12v8M32 44v8M12 32h8M44 32h8" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/></svg>`;

function page() {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f0f2f5"><title>HARZ Intelligence</title>
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="HARZ AI">
<meta name="description" content="HARZ Intelligence Core v0.1 — sovereign AI system: ask, reason, search, execute, verify.">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,'Segoe UI',Roboto,sans-serif}
body{background:#f0f2f5;color:#1a1a2e;min-height:100vh}
header{background:#fff;border-bottom:1px solid #e2e5ea;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10}
header h1{font-size:1.05rem;font-weight:700}header .v{color:#2563eb;font-size:.8rem;font-weight:600}
nav{display:flex;gap:8px}nav button{border:1px solid #e2e5ea;background:#fff;border-radius:8px;padding:6px 12px;font-size:.8rem;cursor:pointer;color:#1a1a2e}
nav button.active{background:#2563eb;color:#fff;border-color:#2563eb}
main{max-width:780px;margin:0 auto;padding:16px}
#chat{display:flex;flex-direction:column;gap:12px}
.msg{background:#fff;border:1px solid #e2e5ea;border-radius:12px;padding:12px;font-size:.92rem;line-height:1.5;white-space:pre-wrap}
.msg.user{background:#eef4ff;border-color:#c7dbff}
.msg .meta{font-size:.72rem;color:#6b7280;margin-top:8px;border-top:1px solid #eef0f3;padding-top:6px}
.msg details{margin-top:8px}msg summary{font-size:.75rem;color:#2563eb;cursor:pointer}
details summary{font-size:.75rem;color:#2563eb;cursor:pointer}
.evidence{font-size:.75rem;color:#374151;background:#f8fafc;border:1px solid #e2e5ea;border-radius:8px;padding:8px;margin-top:6px;white-space:pre-wrap;word-break:break-all}
.bar{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e2e5ea;padding:12px 16px}
.bar form{max-width:780px;margin:0 auto;display:flex;gap:8px}
select{border:1px solid #e2e5ea;border-radius:10px;padding:10px;font-size:.85rem;background:#fff}
input[type=text]{flex:1;border:1px solid #e2e5ea;border-radius:10px;padding:12px;font-size:.95rem}
button.send{background:#2563eb;color:#fff;border:none;border-radius:10px;padding:12px 18px;font-weight:600;cursor:pointer}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:.82rem}
th{background:#eef4ff;text-align:left;padding:10px}td{border-top:1px solid #eef0f3;padding:10px;vertical-align:top}
.hide{display:none}
#status{font-size:.72rem;color:#6b7280;padding:4px 2px}
a{color:#2563eb}
</style></head><body>
<header><div><h1>HARZ Intelligence <span class="v">v0.1</span></h1><div id="status">ask → reason → search → execute → verify</div></div>
<nav><button id="tabChat" class="active">Chat</button><button id="tabBench">Benchmark</button></nav></header>
<main>
<div id="chat"></div>
<div id="bench" class="hide"></div>
</main>
<div class="bar"><form id="f">
<select id="agent"><option value="supreme-engine">Supreme Engine</option><option value="researcher">Researcher</option><option value="coder">Coder</option><option value="analyst">Analyst</option><option value="builder">Builder</option></select>
<input type="text" id="q" placeholder="Ask HARZ Intelligence…" autocomplete="off">
<button class="send" type="submit">Send</button></form></div>
<script>
let cid=null;
const chat=document.getElementById('chat');
function addMsg(role,text,extra){const d=document.createElement('div');d.className='msg '+(role==='user'?'user':'ai');
d.textContent=text;
if(extra){const det=document.createElement('details');const s=document.createElement('summary');
s.textContent='evidence · receipt '+ (extra.verification?extra.verification.receipt_sha256.slice(0,12)+'…':'');
det.appendChild(s);const ev=document.createElement('div');ev.className='evidence';
ev.textContent=JSON.stringify({plan:extra.plan,evidence:extra.evidence,log:extra.execution_log,verification:extra.verification,agent:extra.agent,meta:extra.meta},null,1);
det.appendChild(ev);d.appendChild(det);}
chat.appendChild(d);window.scrollTo(0,document.body.scrollHeight);return d;}
document.getElementById('f').addEventListener('submit',async(e)=>{e.preventDefault();
const q=document.getElementById('q').value.trim();if(!q)return;
document.getElementById('q').value='';addMsg('user',q);
const status=document.getElementById('status');status.textContent='reasoning… searching… verifying…';
try{
const sr=await fetch('/api/chat/start',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({message:q,conversation_id:cid,agent:document.getElementById('agent').value})});
const sj=await sr.json();
if(!sj.job_id){throw new Error('job not created');}
const ai=addMsg('ai','…');
const poll=async()=>{
try{
const r=await fetch('/api/chat/result/'+sj.job_id);
const d=await r.json();
if(d.status==='done'&&d.result){
const res=d.result;cid=res.conversation_id;
ai.textContent=res.answer;
const det=document.createElement('details');const su=document.createElement('summary');
su.textContent='evidence · receipt '+res.verification.receipt_sha256.slice(0,12)+'…';
det.appendChild(su);const ev=document.createElement('div');ev.className='evidence';
ev.textContent=JSON.stringify({plan:res.plan,evidence:res.evidence,log:res.execution_log,verification:res.verification,agent:res.agent,meta:res.meta},null,1);
det.appendChild(ev);ai.appendChild(det);
status.textContent='agent '+res.agent.name+' · '+res.meta.total_latency_ms+'ms · grounded: '+res.verification.evidence_count+' sources · receipt '+res.verification.receipt_sha256.slice(0,12);
}else if(d.status==='error'){
ai.textContent='Request failed: '+(d.error||'unknown');
status.textContent='error';
}else{
status.textContent=d.status||'running';
setTimeout(poll,3000);
}}catch(e){ai.textContent='Request failed: '+e.message;status.textContent='error';}};
poll();}
catch(err){addMsg('ai','Request failed: '+err.message);status.textContent='error';}});
document.getElementById('tabChat').onclick=()=>{chat.classList.remove('hide');document.getElementById('bench').classList.add('hide');document.getElementById('tabChat').classList.add('active');document.getElementById('tabBench').classList.remove('active');};
document.getElementById('tabBench').onclick=async()=>{chat.classList.add('hide');document.getElementById('bench').classList.remove('hide');document.getElementById('tabBench').classList.add('active');document.getElementById('tabChat').classList.remove('active');
const r=await fetch('/api/bench');const d=await r.json();
document.getElementById('bench').innerHTML='<p style="font-size:.8rem;color:#6b7280;margin-bottom:10px">Frozen benchmark. No claims — only measured numbers.</p><table><tr><th>Test</th><th>Status</th><th>Measure</th></tr>'+d.tests.map(t=>'<tr><td>'+t.test+'</td><td>'+t.status+'</td><td>'+t.measure+'</td></tr>').join('')+'</table>';};
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');
</script></body></html>`;
}

// ---------- ROUTER ----------
export default {
  async fetch(request, env, ctx) {
    ENV = env || {};
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (path === '/' ) return new Response(page(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    if (path === '/manifest.json') return new Response(JSON.stringify(MANIFEST), { headers: { 'Content-Type': 'application/json' } });
    if (path === '/sw.js') return new Response(SW, { headers: { 'Content-Type': 'application/javascript' } });
    if (path === '/icon.svg') return new Response(ICON, { headers: { 'Content-Type': 'image/svg+xml' } });

    if (path === '/api/health') {
      const search = await harzSearch('harz', 1);
      return json({
        status: 'healthy', service: 'HARZ INTELLIGENCE', version: VERSION, theme: 'light (#f0f2f5)', pwa: true,
        components: {
          gateway: 'live — model abstraction, default ' + DEFAULT_MODEL,
          orchestrator: 'live — plan → search → tools → reason → verify',
          search_connector: search.ok ? 'live — HARZ Search reachable' : 'degraded',
          memory: 'live — KV conversations + authorized memories with provenance',
          agents: Object.keys(ROOT_IDENTITIES).length + ' Root-identified agents',
          verification: 'live — evidence + receipts on every answer',
          root: 'registry live — ' + Object.values(ROOT_IDENTITIES).length + ' canonical identities',
        },
      });
    }

    if (path === '/api/chat' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid JSON body' }, 400); }
      if (!body.message) return json({ error: 'message required' }, 400);
      try {
        const result = await orchestrate({ message: body.message, conversation_id: body.conversation_id, agent: body.agent });
        return json(result);
      } catch (e) {
        return json({ error: 'orchestrator_exception', message: String(e && e.message || e), stack: String(e && e.stack || '').slice(0, 600) }, 500);
      }
    }

    if (path === '/api/chat/start' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid JSON body' }, 400); }
      if (!body.message) return json({ error: 'message required' }, 400);
      const jobId = id('job');
      const job = { id: jobId, status: 'starting', message: body.message.slice(0, 2000), agent: body.agent, conversation_id: body.conversation_id || null, at: new Date().toISOString() };
      await MEM.createJob(job);
      ctx.waitUntil(orchestrateJob({ message: body.message, conversation_id: body.conversation_id, agent: body.agent }, jobId)
        .catch(async (e) => {
          await MEM.updateJob(jobId, { status: 'error', error: String(e && e.message || e).slice(0, 300) });
        }));
      return json({ job_id: jobId, poll: '/api/chat/result/' + jobId, interval_ms: 3000 }, 202);
    }

    if (path.startsWith('/api/chat/result/') && request.method === 'GET') {
      const jobId = path.split('/')[4];
      const job = await MEM.getJob(jobId);
      if (!job) return json({ error: 'job not found' }, 404);
      if (job.status === 'done') return json({ status: 'done', result: job.result });
      if (job.status === 'error') return json({ status: 'error', error: job.error });
      return json({ status: job.status || 'running' }, 202);
    }

    if (path === '/api/chat/stream' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid JSON body' }, 400); }
      if (!body.message) return json({ error: 'message required' }, 400);
      const stream = new TransformStream();
      const streamingBody = new Response(stream.readable);
      orchestrateStream({ message: body.message, conversation_id: body.conversation_id, agent: body.agent }, stream)
        .catch(async (e) => {
          const w = stream.writable.getWriter();
          await w.write(new TextEncoder().encode('\n\n[[HARZ_META]]' + JSON.stringify({ error: 'orchestrator_exception', message: String(e && e.message || e) })));
          w.close();
        });
      return new Response(stream.readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*', 'X-Accel-Buffering': 'no' } });
    }

    if (path === '/api/agents') {
      return json({ agents: Object.entries(ROOT_IDENTITIES).map(([name, v]) => ({ name, ...v, tools: v.can_use })) , tools: TOOLS });
    }

    if (path === '/api/memory' && request.method === 'POST') {
      let body; try { body = await request.json(); } catch { return json({ error: 'invalid JSON' }, 400); }
      if (!body.conversation_id || !body.key || !body.value) return json({ error: 'conversation_id, key, value required' }, 400);
      const conv = await MEM.getConversation(body.conversation_id);
      const rec = await MEM.addAuthorizedMemory(conv, { key: body.key, value: body.value, scope: body.scope, source: 'api explicit write' });
      await MEM.saveConversation(conv);
      return json({ ok: true, memory: rec });
    }

    if (path.startsWith('/api/memory/') && request.method === 'GET') {
      const cid = path.split('/')[3];
      const conv = await MEM.getConversation(cid);
      return json({ conversation: conv });
    }

    if (path === '/api/bench') return json(await benchData());

    if (path === '/api/debug/egress') {
      const probes = {};
      const tests = [
        ['search', () => ENV.SEARCH_SVC.fetch('https://s/search?q=harz%20chain', { headers: { accept: 'application/json' } })],
        ['chain', () => ENV.CHAIN_SVC.fetch('https://c/api/status')],
      ];
      for (const [name, fn] of tests) {
        try {
          const r = await fn();
          probes[name] = { status: r.status, head: (await r.text()).slice(0, 120) };
        } catch (e) { probes[name] = { error: String(e).slice(0, 150) }; }
      }
      return json({ probes });
    }

    return json({ error: 'not found', path }, 404);
  },
};
