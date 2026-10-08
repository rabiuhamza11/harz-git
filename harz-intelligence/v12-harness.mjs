import { analyzeQuery, extractValueCandidates } from './search1.js';
const stemS9 = (t) => (t.length > 3 && /s$/.test(t) && !/(ss|us|is)$/.test(t)) ? t.slice(0, -1) : t;
const GEO_CTX = new Set(['nigerian','nigeria','african','africa','national','federal','international','global','local']);
// v0.4 compound-split precedent: HarzPay -> {harzpay, harz, pay}
const splitStems = (title) => {
  const out = new Set();
  for (const w of String(title).split(/[^a-zA-Z0-9]+/)) {
    if (!w) continue;
    const lw = w.toLowerCase();
    out.add(lw); out.add(stemS9(lw));
    const parts = w.match(/[A-Z]+(?![a-z])|[A-Z][a-z0-9]*|[a-z0-9]+/g) || [];
    if (parts.length > 1) for (const p of parts) { const lp = p.toLowerCase(); out.add(lp); out.add(stemS9(lp)); }
  }
  return out;
};
const get = async (id) => {
  const r = await fetch("https://harz-search.harz.workers.dev/document/" + id, { headers: { accept: "application/json" } });
  const j = await r.json(); return j.text || "";
};
// V1.2 GATE: current frozen gates + title-or-window binding for every discriminating entity stem
const extractV12 = (qa, units) => {
  const out = [];
  for (const e of units) {
    const text = String(e.fullText || e.text || '');
    const titleSt = splitStems(e.title);
    for (const m of text.matchAll(/(?<![\d/])\b\d{10}\b(?![\d/])/g)) {
      let line = text.slice(Math.max(0, m.index - 100), m.index + m[0].length + 100).replace(/\s+/g, ' ').trim();
      const sp = line.indexOf(' '); if (m.index - 100 > 0 && sp > 0 && sp < 40) line = line.slice(sp + 1);
      const win = text.slice(Math.max(0, m.index - 250), m.index + m[0].length + 250);
      const winSt = new Set(win.toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
      const lineSt = new Set(line.toLowerCase().split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
      const unitSt = new Set((String(e.title) + ' ' + text).toLowerCase().slice(0, 3000).split(/[^a-z0-9]+/).map(stemS9).filter(Boolean));
      const entStems = [...new Set((qa.entities || []).map(x => stemS9(x.toLowerCase())).filter(t => t.length > 2 && !GEO_CTX.has(t)))];
      if (entStems.some(t => !unitSt.has(t))) continue;              // unit-level entity-must (frozen)
      const unbound = entStems.filter(t => !lineSt.has(t) && !winSt.has(t) && !titleSt.has(t)); // v1.2: title-or-window binding
      if (unbound.length) continue;
      const qStems = new Set([...(qa.content || qa.tokens), ...qa.entities].map(t => stemS9(t.toLowerCase())).filter(t => t.length > 2));
      const shared = [...qStems].filter(t => unitSt.has(t));
      const lineShared = [...qStems].filter(t => lineSt.has(t));
      if (shared.length >= 2 && lineShared.length >= 1) out.push({ value: m[0], doc: e.document_id, unbound: [] });
    }
  }
  return out;
};
const docs = {};
for (const id of [10470, 10034, 10332, 10066, 10427, 7, 114, 10035, 10335, 10047, 10038, 10021]) docs[id] = await get(id);
const units = Object.entries(docs).map(([id, t]) => ({ title: { 10470: "HarzPay Onboarding — Get Started", 10034: "HARZ Ecosystem — Everything in One Place", 10332: "HARZ Pay — Payment Gateway", 10066: "HARZ Pay — Payment Methods", 114: "HARZ Super App v5.0", 10035: "GDEG Token", 10335: "HARZ Root", 10047: "HARZ Mail", 10038: "HARZ RPC Proxy", 10021: "HARZ SMS Gateway", 10427: "HARZ Pay — Payments", 7: "HARZ Wallet" }[id] || "doc " + id, document_id: Number(id), fullText: t }));
const TESTS = [
  ["POS", "Which Nigerian bank does HARZ use for NGN transfers?"],
  ["POS", "Which UBA bank account does HARZ Pay use for transfers?"],
  ["POS", "What is the UBA account number, bank code and account name for HARZ Pay bank transfers?"],
  ["POS", "Give the UBA account number used for HARZ Pay bank transfers"],
  ["POS", "Which UBA bank account did HARZ Pay use before 2034326424?"],
  ["NEG", "Which UBA account number does HARZ Verify use for settlements?"],
  ["NEG", "Which UBA account number does HARZ SMS Marketing use for settlements?"],
];
let fails = 0;
for (const [want, q] of TESTS) {
  const qa = analyzeQuery(q);
  const v11 = extractValueCandidates(qa, units);
  const v12 = extractV12(qa, units);
  const ok = want === "POS" ? v12.length > 0 && v12.every(v => v.value === "2034326424") : v12.length === 0;
  if (!ok) fails++;
  console.log(want, ok ? "PASS" : "FAIL", "|", q.slice(0, 50), "| v1.1:", v11.map(v => v.value + "@" + v.document_id).join(",") || "none", "| v1.2:", v12.map(v => v.value + "@" + v.document_id).join(",") || "none");
}
console.log(fails === 0 ? "ALL PASS" : fails + " FAILURES");
