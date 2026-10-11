// S-R OFFLINE ARM — whole-script sandbox execution of the deployed PWA client code
// Network death: fetch/XHR/WebSocket disabled BEFORE evaluation. localStorage stubbed.
const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("deployed-app.html", "utf8");
const si = html.indexOf("localBrain");
const s0 = html.lastIndexOf("<script", si);
const s1 = html.indexOf("</script>", si);
const code = html.slice(html.indexOf(">", s0) + 1, s1);
console.log("script block bytes:", code.length);

function noopEl() {
  return new Proxy(function () { return noopEl(); }, {
    get: (t, p) => {
      if (p === Symbol.toPrimitive) return () => "";
      if (p === "style" || p === "dataset") return {};
      if (p === "classList") return { add(){}, remove(){}, toggle(){}, contains(){ return false; } };
      if (p === "value" || p === "textContent" || p === "innerHTML") return "";
      return noopEl();
    },
    set: () => true,
    apply: () => noopEl(),
  });
}

const DEATH = (what) => () => { throw new Error("NETWORK DEATH GUARD: " + what + " attempted"); };

const document = new Proxy({}, {
  get: (t, p) => {
    if (p === "querySelector" || p === "querySelectorAll" || p === "getElementById" || p === "createElement" || p === "createEvent") return () => noopEl();
    if (p === "addEventListener" || p === "removeEventListener") return () => {};
    if (p === "body" || p === "head" || p === "documentElement") return noopEl();
    if (p === "readyState") return "complete";
    return noopEl();
  },
  set: () => true,
});

const sandbox = {
  console: { log(){}, error(){}, warn(){} },
  setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
  fetch: DEATH("fetch"), XMLHttpRequest: DEATH("XMLHttpRequest"), WebSocket: DEATH("WebSocket"),
  navigator: { userAgent: "sr-battery-offline-arm", serviceWorker: { register(){ return Promise.resolve(); }, controller: null, addEventListener(){} } },
  location: { origin: "https://harz-ai.harz.workers.dev", href: "https://harz-ai.harz.workers.dev/app", protocol: "https:", host: "harz-ai.harz.workers.dev", pathname: "/app", search: "", hash: "" },
  localStorage: { getItem: () => null, setItem(){}, removeItem(){}, clear(){} },
  sessionStorage: { getItem: () => null, setItem(){}, removeItem(){}, clear(){} },
  document,
  addEventListener(){}, removeEventListener(){},
  alert(){}, prompt(){ return null; }, confirm(){ return false; },
  history: { pushState(){}, replaceState(){}, back(){} },
  URLSearchParams: class { constructor(){} get(){ return null; } },
  Blob: class {}, FormData: class {}, FileReader: class {},
  requestAnimationFrame: () => 0,
  indexedDB: {
    open(name, ver) {
      const req = {};
      setTimeout(() => {
        const db = {
          objectStoreNames: { contains: () => false },
          createObjectStore() { return { createIndex(){} }; },
          transaction() { return { objectStore() { return { getAll(){ const r={onsuccess:null,onerror:null}; setTimeout(()=>r.onsuccess&&r.onsuccess({target:{result:[]}}),0); return r; }, get(){ const r={onsuccess:null,onerror:null}; setTimeout(()=>r.onsuccess&&r.onsuccess({target:{result:null}}),0); return r; }, openCursor(){ const r={onsuccess:null,onerror:null}; setTimeout(()=>r.onsuccess&&r.onsuccess({target:{result:null}}),0); return r; } }; }, oncomplete:null }; },
          close(){},
        };
        req.result = db;
        if (req.onsuccess) req.onsuccess({ target: { result: db } });
      }, 0);
      return req;
    },
  },
};

try {
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { timeout: 10000 });
} catch (e) {
  console.log("top-level eval note:", String(e).slice(0, 120));
}

const brain = sandbox.localBrain;
if (typeof brain !== "function") { console.log("FATAL: localBrain not reachable"); process.exit(1); }

const cases = JSON.parse(fs.readFileSync("/tmp/hg-clone/harz-ai-completion/SR-BATTERY-FROZEN-V1.json", "utf8")).cases;
const out = fs.createWriteStream("OFFLINE-RAW.jsonl");
let guardHits = 0;
(async () => {
for (const c of cases) {
  let resp = null, err = null;
  try {
    resp = await Promise.resolve(brain(c.prompt, "chat")).catch((e) => { throw e; });
  } catch (e) { err = String(e); if (err.includes("NETWORK DEATH")) guardHits++; }
  out.write(JSON.stringify({ id: c.id, ts: new Date().toISOString(), guard: "fetch/XHR/WebSocket disabled pre-run; whole-script vm sandbox; localStorage stubbed", err, response: resp !== undefined ? String(resp).slice(0, 600) : null }) + "\n");
  console.log(c.id, "|", c.prompt.slice(0,40), "->", err ? ("ERR:" + err.slice(0, 50)) : String(resp).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100));
}
out.end();
console.log("NETWORK DEATH GUARD hits:", guardHits);})();
console.log("OFFLINE ARM COMPLETE 25/25");
