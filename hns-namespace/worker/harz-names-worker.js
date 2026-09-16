// UNMUTANT — HARZ Name Service (HNS) v1.2.0 — .harz names for people, not just services
// LAW: light #f0f2f5, honest pilot disclosure, fails closed on the chain gate.
// v1.2 (attack-hardened): SIGN-TO-REGISTER — EIP-191 personal_sign signature proves
// wallet ownership (impersonation closed). Name RELEASE endpoint with signature.
// CGNAT-safe rate limit: IP limit raised (abuse backstop, not the primary gate;
// the primary gates are the signature + 50-HARZ balance + one-name-per-wallet).
// Gate: wallet must hold >= 50 HARZ, read LIVE from the chain (faucet gives 100/24h
// → claim twice, register your name: the Phase 2 adoption loop).
// One name per wallet. Reserved: all 77 canonical service names + infra words.
// v1 is D1-anchored (pilot); v2 promotes the registry on-chain (admin decision).


/* ---- keccak-256 (original Keccak padding 0x01 — the Ethereum variant) ---- */
const ROUNDS = [
  0x0000000000000001n,0x0000000000008082n,0x800000000000808an,0x8000000080008000n,
  0x000000000000808bn,0x0000000080000001n,0x8000000080008081n,0x8000000000008009n,
  0x000000000000008an,0x0000000000000088n,0x0000000080008009n,0x000000008000000an,
  0x000000008000808bn,0x800000000000008bn,0x8000000000008089n,0x8000000000008003n,
  0x8000000000008002n,0x8000000000000080n,0x000000000000800an,0x800000008000000an,
  0x8000000080008081n,0x8000000000008080n,0x0000000080000001n,0x8000000080008008n];
const ROT = [0,1,62,28,27,36,44,6,55,20,3,10,43,25,39,41,45,15,21,8,18,2,61,56,14];
const M64 = (1n << 64n) - 1n;
function keccakF(S) {
  for (let r = 0; r < 24; r++) {
    const C = new Array(5).fill(0n), D = new Array(5).fill(0n);
    for (let x = 0; x < 5; x++) { C[x] = S[x]^S[x+5]^S[x+10]^S[x+15]^S[x+20]; }
    for (let x = 0; x < 5; x++) { D[x] = C[(x+4)%5] ^ (((C[(x+1)%5] << 1n) | (C[(x+1)%5] >> 63n)) & M64); }
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) S[x+5*y] ^= D[x];
    const B = new Array(25).fill(0n);
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
      const idx = x + 5*y, off = ROT[x + 5*y];
      B[y + 5*((2*x + 3*y) % 5)] = ((S[idx] << BigInt(off)) | (S[idx] >> BigInt(64 - off))) & M64;
    }
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++)
      S[x+5*y] = (B[x+5*y] ^ ((~B[(x+1)%5 + 5*y]) & B[(x+2)%5 + 5*y])) & M64;
    S[0] ^= ROUNDS[r];
  }
  return S;
}
function keccak256(bytes) {
  const RATE = 136, S = new Array(25).fill(0n);
  const padded = bytes.slice();
  padded.push(0x01);
  while (padded.length % RATE !== 0) padded.push(0x00);
  padded[padded.length - 1] |= 0x80;
  for (let off = 0; off < padded.length; off += RATE) {
    for (let i = 0; i < RATE / 8; i++) {
      let lane = 0n;
      for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(padded[off + i*8 + b]);
      S[i] ^= lane;
    }
    keccakF(S);
  }
  const out = [];
  for (let i = 0; i < 4; i++) {
    let lane = S[i];
    for (let b = 0; b < 8; b++) { out.push(Number(lane & 0xffn)); lane >>= 8n; }
  }
  return out;
}
/* ---- secp256k1 public-key recovery (verify-only; no signing keys in the worker) ---- */
const P = 2n**256n - 2n**32n - 977n;
const N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n;
const Gp = [0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n,
            0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n];
const mod = (a, m) => ((a % m) + m) % m;
const ptAdd = (A, B) => {
  if (!A) return B; if (!B) return A;
  const [x1,y1] = A, [x2,y2] = B;
  if (x1 === x2 && mod(y1 + y2, P) === 0n) return null;
  const l = A === B ? mod(3n*x1*x1 * modPow(mod(2n*y1, P), P-2n), P)
                    : mod((y2-y1) * modPow(mod(x2-x1, P), P-2n), P);
  const x3 = mod(l*l - x1 - x2, P), y3 = mod(l*(x1 - x3) - y1, P);
  return [x3, y3];
};
function modPow(b, e) { let r = 1n; b = mod(b, P); while (e > 0n) { if (e & 1n) r = mod(r*b, P); b = mod(b*b, P); e >>= 1n; } return r; }
function ptMul(k, Pt) { let R = null, A = Pt; while (k > 0n) { if (k & 1n) R = ptAdd(R, A); A = ptAdd(A, A); k >>= 1n; } return R; }
function hexToBytes(h) { const out = []; for (let i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i+2), 16)); return out; }
function recoverAddress(digestHex, sigHex) {
  sigHex = sigHex.replace(/^0x/, "").toLowerCase();
  if (!/^[0-9a-f]{130}$/.test(sigHex)) throw new Error("signature must be 0x + 130 hex chars (r, s, v)");
  const r = BigInt("0x" + sigHex.slice(0, 64));
  const s = BigInt("0x" + sigHex.slice(64, 128));
  let v = parseInt(sigHex.slice(128, 130), 16);
  if (v === 0 || v === 1) v += 27;                    // some wallets return 0/1
  if (v !== 27 && v !== 28) throw new Error("bad v");
  if (r === 0n || s === 0n || r >= N || s >= N) throw new Error("signature out of range");
  const x = r;
  const y2 = mod(x*x*x + 7n, P);
  let y = modPow(y2, (P+1n)/4n);                       // sqrt: y^((P+1)/4) — P ≡ 3 mod 4
  if (mod(y*y, P) !== y2) throw new Error("r not on curve");
  if (Number(y & 1n) !== (v - 27)) y = mod(P - y, P);   // parity per v
  const z = BigInt("0x" + digestHex) % N;
  const rInv = ((r) => { let r2 = 1n; let e = N - 2n; let b = r; while (e > 0n) { if (e & 1n) r2 = mod(r2*b, N); b = mod(b*b, N); e >>= 1n; } return r2; })(r);
  const Q = ptAdd(ptMul(mod(s * rInv, N), [x, y]), ptMul(mod((N - z) * rInv, N), Gp));
  if (!Q) throw new Error("recovered infinity");
  const pub = [4].concat(hexToBytes(Q[0].toString(16).padStart(64, "0")), hexToBytes(Q[1].toString(16).padStart(64, "0")));
  const addr = keccak256(pub.slice(1)).slice(-20);
  return "0x" + addr.map(b => b.toString(16).padStart(2, "0")).join("");
}
function eip191Digest(message) {
  const msgBytes = new TextEncoder().encode(message);
  const prefix = new TextEncoder().encode("\x19Ethereum Signed Message:\n" + msgBytes.length);
  return keccak256(Array.from(prefix).concat(Array.from(msgBytes))).map(b => b.toString(16).padStart(2, "0")).join("");
}
function challenge(kind, name, wallet) {
  return "HARZ-HNS-" + kind + "\nname:" + name + "\nwallet:" + wallet.toLowerCase();
}
function verifySig(kind, name, wallet, sig) {
  const addr = recoverAddress(eip191Digest(challenge(kind, name, wallet)), String(sig || ""));
  if (addr !== wallet.toLowerCase()) throw new Error("signature does not match this wallet");
  return addr;
}
export const __hnsCrypto = { keccak256, recoverAddress, eip191Digest, challenge };

const CHAIN = "https://harz-chain-v2.harz.workers.dev";
const GATE_HARZ = 50;
const IP_LIMIT_24H = 10; // CGNAT-safe: NAT can put many real users on one IP; IP limit is only a spam backstop

const RESERVED = new Set(["ai","arch","baraka","bridge","broadcast","buildbot","catalog","chain","cloud","content","contracts","crm","daily","dial","dialweb","dna","dua","edge","edgenet","estate","eternity","evolve","exchange","faucet","film","forge","forms","gateway","gdeg","genesis","gov","guard","harz","health","hospital","images","kasuwa","lend","link","maganu","manager","markets","mesh","mindcare","miner","mining","music","net","neural","nexus","nlcl","omega","oracle","orbital","pay","poi","pricing","prism","root","rpc","scan","skyeye","sms","smsmkt","spell","store","super","swap","symphony","telecom","trade","verify","wa","wallet","watch","wholesale","yelwa","www","admin","api","dns","mail","test","null","localhost","ns1","ns2","me","my","id","whois","hns"]);

const DISCLOSURE = "HNS v1.2 is a signature-gated, D1-anchored pilot: only the wallet owner can register or release a name (EIP-191 signature proof), registration is additionally gated by live on-chain balance, and records are revocable by the chain admin. On-chain promotion is planned at v2.";

const CORS = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "cache-control": "no-store"
};

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: CORS });
}

async function chainBalance(wallet) {
  const r = await fetch(CHAIN + "/api/balance?address=" + encodeURIComponent(wallet), { cache: "no-store" });
  if (!r.ok) throw new Error("chain unreachable");
  const d = await r.json();
  return Number(d.balance) || 0;
}

function validName(n) { return /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/.test(n); }
function validWallet(w) { return /^0x[a-fA-F0-9]{40}$/.test(w); }

async function handleRegister(request, env, ip) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: "invalid JSON body" }, 400); }
  const name = String(body.name || "").toLowerCase().trim();
  const wallet = String(body.wallet || "").trim();
  const bio = String(body.bio || "").slice(0, 140);
  if (!validName(name)) return json({ ok: false, error: "name: 3-32 chars, lowercase a-z 0-9 hyphens, no leading/trailing hyphen" }, 400);
  if (!validWallet(wallet)) return json({ ok: false, error: "wallet: must be a 0x 40-hex address" }, 400);
  if (RESERVED.has(name)) return json({ ok: false, error: "reserved: " + name + ".harz is a canonical ecosystem name" }, 403);

  try { verifySig("REGISTER", name, wallet, body.signature); }
  catch (e) { return json({ ok: false, error: "signature: " + e.message + ". Sign the challenge with your wallet key." }, 401); }

  const rl = await env.DB.prepare(
    "SELECT COUNT(*) c FROM hns_reglog WHERE ip=?1 AND ts > datetime('now','-24 hours')"
  ).bind(ip).first();
  if (rl && Number(rl.c) >= IP_LIMIT_24H) return json({ ok: false, error: "rate limit: max " + IP_LIMIT_24H + " registrations per IP per day" }, 429);

  const taken = await env.DB.prepare("SELECT name, wallet, created_date FROM hns_names WHERE name=?1").bind(name).first();
  if (taken) return json({ ok: false, error: "taken: " + name + ".harz is already registered", registered_date: taken.created_date }, 409);

  const owned = await env.DB.prepare("SELECT name FROM hns_names WHERE wallet=?1").bind(wallet.toLowerCase()).first();
  if (owned) return json({ ok: false, error: "wallet already holds " + owned.name + ".harz (one name per wallet)" }, 409);

  let bal;
  try { bal = await chainBalance(wallet); }
  catch (e) { return json({ ok: false, error: "chain gate unreachable — registration refused (fails closed)" }, 503); }
  if (bal < GATE_HARZ) return json({ ok: false, error: "gate: wallet holds " + bal + " HARZ — need " + GATE_HARZ + " (faucet gives 100 per 24h)" }, 403);

  await env.DB.prepare("INSERT INTO hns_names (name, wallet, bio, created_by_ip) VALUES (?1,?2,?3,?4)")
    .bind(name, wallet.toLowerCase(), bio, ip).run();
  await env.DB.prepare("INSERT INTO hns_reglog (ip) VALUES (?1)").bind(ip).run();
  const sz = await reSignSubzone(env).catch(() => null);
  return json({ ok: true, name: name + ".harz", wallet: wallet.toLowerCase(), signature_verified: true, balance_at_registration: bal, subzone_height: sz ? sz.zone.height : null, hns_zsk_fp: sz ? sz.fp : null, disclosure: DISCLOSURE });
}

async function handleRelease(request, env, ip) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: "invalid JSON body" }, 400); }
  const name = String(body.name || "").toLowerCase().trim();
  const wallet = String(body.wallet || "").trim();
  if (!validName(name)) return json({ ok: false, error: "name: invalid format" }, 400);
  if (!validWallet(wallet)) return json({ ok: false, error: "wallet: must be a 0x 40-hex address" }, 400);
  try { verifySig("RELEASE", name, wallet, body.signature); }
  catch (e) { return json({ ok: false, error: "signature: " + e.message }, 401); }
  const rec = await env.DB.prepare("SELECT wallet FROM hns_names WHERE name=?1").bind(name).first();
  if (!rec) return json({ ok: false, error: "NXDOMAIN: " + name + ".harz is not registered" }, 404);
  if (String(rec.wallet).toLowerCase() !== wallet.toLowerCase()) return json({ ok: false, error: "wallet does not hold " + name + ".harz" }, 403);
  await env.DB.prepare("DELETE FROM hns_names WHERE name=?1 AND wallet=?2").bind(name, wallet.toLowerCase()).run();
  const sz = await reSignSubzone(env).catch(() => null);
  return json({ ok: true, released: name + ".harz", freed_by: wallet.toLowerCase(), subzone_height: sz ? sz.zone.height : null, disclosure: DISCLOSURE });
}

async function handleLookup(url, env) {
  const name = String(url.searchParams.get("name") || "").toLowerCase().trim();
  if (!validName(name)) return json({ ok: false, error: "invalid name format" }, 400);
  const rec = await env.DB.prepare("SELECT name, wallet, bio, created_date FROM hns_names WHERE name=?1").bind(name).first();
  if (!rec) return json({ ok: false, error: "NXDOMAIN: " + name + ".harz is not registered" }, 404);
  return json({ ok: true, name: rec.name + ".harz", wallet: rec.wallet, bio: rec.bio || "", registered: rec.created_date, disclosure: DISCLOSURE });
}

async function handleRecent(env) {
  const rows = await env.DB.prepare("SELECT name, wallet, created_date FROM hns_names ORDER BY id DESC LIMIT 50").all();
  return json({ ok: true, count: rows.results.length, names: rows.results.map(r => ({ name: r.name + ".harz", wallet: r.wallet, registered: r.created_date })) });
}

/* ============ v1.3 SUB-ZONE (delegation design freeze v1.0; owner accepted hot key 2026-09-15) ============
 * Laws: DELEGATION (key trusted only via root hns-zsk record), FAIL-CLOSED (bad seal/link/sig = no records),
 * ROOT PRIORITY (canonical 77 names can never be shadowed — reserved upstream + merge law downstream).
 * Zone shape frozen: { kind, height, prev_hash, hash, link, records, ts } — matches hns-subzone.js prototype.
 */
const SUBZONE_KIND = "hns-subzone";
async function sha256Hex(bytes) {
  const d = await crypto.subtle.digest("SHA-256", bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function subzoneCanonical(records) {
  const sorted = [...records].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return JSON.stringify(sorted.map(r => ({ name: r.name, wallet: r.wallet.toLowerCase(), bio: r.bio || "", target: r.target || "" })));
}
async function getZoneKey(env) {
  let row = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='zsk_jwk'").first();
  if (!row) {
    const kp = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
    const privJwk = JSON.stringify(await crypto.subtle.exportKey("jwk", kp.privateKey));
    const pubJwk = JSON.stringify(await crypto.subtle.exportKey("jwk", kp.publicKey));
    await env.DB.prepare("INSERT OR IGNORE INTO hns_kv(key, value) VALUES('zsk_jwk', ?1)").bind(privJwk).run();
    await env.DB.prepare("INSERT OR IGNORE INTO hns_kv(key, value) VALUES('zsk_pub_jwk', ?1)").bind(pubJwk).run();
    row = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='zsk_jwk'").first();
  }
  const priv = await crypto.subtle.importKey("jwk", JSON.parse(row.value), { name: "Ed25519" }, true, ["sign"]);
  const pubRow = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='zsk_pub_jwk'").first();
  const pub = await crypto.subtle.importKey("jwk", JSON.parse(pubRow.value), { name: "Ed25519" }, true, ["verify"]);
  const spki = new Uint8Array(await crypto.subtle.exportKey("spki", pub));
  return { priv, pub, spki, fp: (await sha256Hex(spki)).slice(0, 16) };
}
async function buildSubzone(env) {
  const recs = await env.DB.prepare("SELECT name, wallet, bio FROM hns_names ORDER BY name ASC").all();
  const records = (recs.results || []).map(r => ({ name: r.name, wallet: r.wallet, bio: r.bio || "", target: "" }));
  const prev = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='subzone_latest'").first();
  const prevZone = prev ? JSON.parse(prev.value) : null;
  const prevHash = prevZone ? prevZone.hash : "0".repeat(64);
  const height = prevZone ? prevZone.height + 1 : 1;
  const body = subzoneCanonical(records);
  const hash = await sha256Hex(new TextEncoder().encode(height + "|" + body));
  const link = await sha256Hex(new TextEncoder().encode(prevHash + "|" + height + "|" + hash));
  return { kind: SUBZONE_KIND, height, prev_hash: prevHash, hash, link, records: JSON.parse(body), ts: new Date().toISOString() };
}
async function reSignSubzone(env) {
  const zone = await buildSubzone(env);
  const key = await getZoneKey(env);
  const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", key.priv, new Uint8Array(hexToBytes(zone.hash))));
  const sigB64 = btoa(String.fromCharCode(...sig));
  await env.DB.prepare("INSERT OR REPLACE INTO hns_kv(key, value) VALUES('subzone_latest', ?1)").bind(JSON.stringify(zone)).run();
  await env.DB.prepare("INSERT OR REPLACE INTO hns_kv(key, value) VALUES('subzone_sig', ?1)").bind(sigB64).run();
  await env.DB.prepare("INSERT OR REPLACE INTO hns_kv(key, value) VALUES('subzone_fp', ?1)").bind(key.fp).run();
  return { zone, sigB64, fp: key.fp };
}
/* best-effort re-sign after writes; D1 stays the source of truth, /zone lazy-builds on next read */
async function reSignAfterWrite(env) {
  try { await reSignSubzone(env); } catch (e) { /* stale zone is recovered on next write or /zone read */ }
}
async function handleZone(env) {
  let st = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='subzone_latest'").first();
  let sig = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='subzone_sig'").first();
  if (!st || !sig) { await reSignSubzone(env); st = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='subzone_latest'").first(); sig = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='subzone_sig'").first(); }
  return new Response(st.value, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
async function handleZoneSig(env) {
  let sig = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='subzone_sig'").first();
  if (!sig) { await reSignSubzone(env); sig = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='subzone_sig'").first(); }
  return new Response(sig.value, { headers: { "content-type": "text/plain", "cache-control": "no-store" } });
}
async function handleNamePage(url, env) {
  const name = decodeURIComponent(url.pathname.slice(6)).toLowerCase().trim();
  if (!validName(name)) return json({ ok: false, error: "invalid name format" }, 400);
  const rec = await env.DB.prepare("SELECT name, wallet, bio, created_date FROM hns_names WHERE name=?1").bind(name).first();
  if (!rec) return new Response(PAGE_404(name), { status: 404, headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
  return new Response(PAGE_NAME(rec), { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
}
function PAGE_NAME(rec) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f0f2f5"><title>${rec.name}.harz — HARZ citizen</title>
<style>body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#1a1a1a;margin:0;padding:16px;max-width:520px;margin:auto}
.card{background:#fff;border:1px solid #e3e6ea;border-radius:12px;padding:20px;margin-top:14px}
h1{font-size:22px;margin:0 0 4px}.w{font-family:monospace;font-size:12px;word-break:break-all;background:#f6f8fa;padding:8px;border-radius:8px}
.badge{display:inline-block;background:#e8f5e9;color:#1a7f37;border-radius:99px;padding:2px 10px;font-size:12px}
a{color:#0969da;text-decoration:none}</style></head><body>
<div class="card"><h1>${rec.name}.harz</h1><span class="badge">HARZ citizen</span>
<p style="color:#57606a;margin:10px 0 4px">Owner wallet</p><div class="w">${rec.wallet}</div>
${rec.bio ? `<p style="color:#57606a;margin:10px 0 4px">Bio</p><div>${rec.bio}</div>` : ""}
<p style="color:#57606a;font-size:12px;margin-top:14px">Registered ${rec.created_date} · signature-proven (EIP-191) · served by <a href="/">UNMUTANT HNS</a></p></div></body></html>`;
}
function PAGE_404(name) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}.harz — not registered</title>
<style>body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#1a1a1a;margin:0;padding:16px;max-width:520px;margin:auto}
.card{background:#fff;border:1px solid #e3e6ea;border-radius:12px;padding:20px;margin-top:14px}</style></head><body>
<div class="card"><h1>${name}.harz</h1><p style="color:#57606a">No citizen holds this name yet. <a href="/">Claim it on UNMUTANT</a> — 50 HARZ + wallet signature.</p></div></body></html>`;
}
async function handlePub(env) {
  const key = await getZoneKey(env);
  const b64 = btoa(String.fromCharCode(...key.spki));
  const pem = "-----BEGIN PUBLIC KEY-----\n" + b64.replace(/(.{64})/g, "$1\n").replace(/\n$/, "") + "\n-----END PUBLIC KEY-----";
  return new Response(pem, { headers: { "content-type": "text/plain", "cache-control": "no-store", "x-hns-zsk-fingerprint": key.fp } });
}

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f0f2f5">
<title>UNMUTANT — join the second internet</title>
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="description" content="Register your personal .harz name mapped to your HARZ wallet.">
<style>
:root{--bg:#f0f2f5;--card:#fff;--ink:#18181b;--mut:#6b7280;--line:#e5e7eb;--acc:#2563eb;--ok:#1a7f37}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,sans-serif;min-height:100vh;padding:16px}
.wrap{max-width:480px;margin:0 auto}
h1{font-size:1.45rem;display:flex;align-items:center;gap:8px}
h1 img{width:30px;height:30px}
.sub{color:var(--mut);font-size:.82rem;margin:2px 0 16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:14px}
.k{font-size:.72rem;color:var(--mut);text-transform:uppercase;letter-spacing:.04em}
input{width:100%;padding:11px;border:1px solid var(--line);border-radius:9px;font-size:1rem;background:#fff;margin-top:6px}
button{margin-top:10px;width:100%;padding:11px;border:0;border-radius:9px;background:var(--acc);color:#fff;font-size:1rem;font-weight:600}
button:active{filter:brightness(.9)}
.res{margin-top:12px;font-size:.92rem;line-height:1.5;word-break:break-all}
.ok{color:var(--ok)}.bad{color:#c0392b}
.row{display:flex;justify-content:space-between;gap:8px;padding:4px 0;font-size:.85rem;border-bottom:1px dashed var(--line)}
.row:last-child{border:0}
.mono{font-family:ui-monospace,monospace;font-size:.78rem}
a{color:var(--acc);text-decoration:none;font-size:.85rem}
.disc{color:var(--mut);font-size:.7rem;line-height:1.4;margin-top:4px}
footer{color:var(--mut);font-size:.7rem;text-align:center;margin:18px 0 8px}
</style>
</head>
<body>
<div class="wrap">
<h1><img src="/icon.svg" alt="">UNMUTANT</h1>
<div class="sub">The second internet — <b>not dead, not off.</b> Your wallet, with a human name. Pay <b>name.harz</b>, not 0x…</div>
<div class="card">
  <div class="k">Join the second internet — 3 steps</div>
  <div class="row"><span>1. Get your wallet</span><a href="https://harz-super-app.harz.workers.dev" target="_blank">open wallet →</a></div>
  <div class="row"><span>2. Claim the faucet (100 HARZ / 24h)</span><a href="https://harz-faucet.hamzarabiu390.workers.dev" target="_blank">claim →</a></div>
  <div class="row"><span>3. Register your name below</span><span class="mono">50 HARZ gate</span></div>
</div>
<div class="card">
  <div class="k">Look up a name</div>
  <input id="q" placeholder="hamza" autocapitalize="none">
  <button onclick="lookup()">Look up</button>
  <div id="lres" class="res mono"></div>
</div>
<div class="card">
  <div class="k">Register your name</div>
  <input id="rname" placeholder="yourname" autocapitalize="none">
  <input id="rwallet" placeholder="0x… your HARZ wallet" autocapitalize="none">
  <input id="rbio" placeholder="bio (optional, 140 chars)">
  <input id="rsig" placeholder="signature — 0x + 130 hex, from your wallet">
  <div class="disc" id="rmsg"></div>
  <button onclick="signIfWallet('REGISTER')" id="rbtn" style="background:#666">Sign with wallet</button>
  <button onclick="register()">Register</button>
  <div id="rres" class="res mono"></div>
</div>
<div class="card">
  <div class="k">Gate</div>
  <div class="res">Registration is gated by a <b>live on-chain balance of 50 HARZ</b> — fails closed if the chain is unreachable. Faucet gives 100 HARZ per 24h. One name per wallet.</div>
  <div class="disc">HNS v1 is a D1-anchored pilot. Names map to wallets; records revocable by the chain admin. On-chain promotion planned at v2.</div>
</div>
<div class="card">
  <div class="k">Why it cannot die</div>
  <div class="res">The ROOT namespace beneath this service survived its own death test: node killed, gateway killed, internet path cut — <b>33/33 checks passed</b>, still resolving through DNS, DoH, native, mesh and Dial. This citizenship layer rides on it — v1 is a signature-gated pilot; its own death test is next. <b>Not dead. Not off.</b></div>
</div>
<div class="card">
  <div class="k">Release a name (owner only)</div>
  <input id="xname" placeholder="yourname" autocapitalize="none">
  <input id="xwallet" placeholder="0x… your HARZ wallet" autocapitalize="none">
  <input id="xsig" placeholder="signature — 0x + 130 hex (RELEASE challenge)">
  <div class="disc" id="xmsg"></div>
  <button onclick="signIfWallet('RELEASE')" id="xbtn" style="background:#666">Sign with wallet</button>
  <button onclick="release()">Release</button>
  <div id="xres" class="res mono"></div>
</div>
<div class="card">
  <div class="k">New citizens</div>
  <div id="recent" class="res mono">loading…</div>
</div>
<footer>UNMUTANT · not dead, not off · HARZ ROOT sovereign namespace · #f0f2f5</footer>
</div>
<script>
const $=i=>document.getElementById(i);
function challenge(k,n,w){return "HARZ-HNS-"+k+"\\nname:"+n.toLowerCase()+"\\nwallet:"+w.toLowerCase();}
function sigHint(k,n,w,x){ $(x).textContent = n&&w ? "message to sign: " + challenge(k,n,w) : "enter name + wallet to see the message to sign"; }
["rname","rwallet"].forEach(i=>$(i).addEventListener("input",()=>sigHint("REGISTER",$("rname").value,$("rwallet").value,"rmsg")));
["xname","xwallet"].forEach(i=>$(i).addEventListener("input",()=>sigHint("RELEASE",$("xname").value,$("xwallet").value,"xmsg")));
sigHint("REGISTER","","","rmsg"); sigHint("RELEASE","","","xmsg");
async function signIfWallet(k){
  const n=k==="REGISTER"?$("rname").value:$("xname").value;
  const w=k==="REGISTER"?$("rwallet").value:$("xwallet").value;
  if(!n||!w||!window.ethereum){ $(k==="REGISTER"?"rmsg":"xmsg").textContent = "no injected wallet — sign the challenge with your wallet app and paste the signature"; return; }
  try{
    const accounts = await window.ethereum.request({method:"eth_requestAccounts"});
    const sig = await window.ethereum.request({method:"personal_sign",params:[challenge(k,n,w),accounts[0]]});
    $(k==="REGISTER"?"rsig":"xsig").value = sig;
    $(k==="REGISTER"?"rmsg":"xmsg").textContent = "signed by " + accounts[0];
  }catch(e){ $(k==="REGISTER"?"rmsg":"xmsg").textContent = "sign failed: " + e.message; }
}
async function lookup(){
  const n=$("q").value.trim().toLowerCase();
  $("lres").textContent="…";
  const r=await fetch("/api/lookup?name="+encodeURIComponent(n));
  const d=await r.json();
  if(d.ok){
    $("lres").innerHTML='<span class="ok">'+d.name+'</span><br>wallet: '+d.wallet+(d.bio?"<br>bio: "+d.bio.replace(/</g,"&lt;"):"")+"<br>registered: "+d.registered;
  } else {
    $("lres").innerHTML='<span class="bad">'+d.error.replace(/</g,"&lt;")+"</span>";
  }
}
async function register(){
  $("rres").textContent="…";
  const r=await fetch("/api/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:$("rname").value,wallet:$("rwallet").value,bio:$("rbio").value,signature:$("rsig").value})});
  const d=await r.json();
  $("rres").innerHTML=d.ok?'<span class="ok">REGISTERED: '+d.name+" → "+d.wallet+"</span>":'<span class="bad">'+d.error.replace(/</g,"&lt;")+"</span>";
  recent();
}
async function release(){
  $("xres").textContent="…";
  const r=await fetch("/api/release",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:$("xname").value,wallet:$("xwallet").value,signature:$("xsig").value})});
  const d=await r.json();
  $("xres").innerHTML=d.ok?'<span class="ok">RELEASED: '+d.released+" — name is free</span>":'<span class="bad">'+d.error.replace(/</g,"&lt;")+"</span>";
  recent();
}
async function recent(){
  const r=await fetch("/api/recent");
  const d=await r.json();
  $("recent").innerHTML=d.count?d.names.map(x=>'<div class="row"><span>'+x.name+"</span><span class='mono'>"+x.wallet.slice(0,8)+"…</span></div>").join(""):"no registrations yet";
}
recent();
if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
</script>
</body>
</html>`;

const MANIFEST = JSON.stringify({
  name: "UNMUTANT — the second internet",
  short_name: "UNMUTANT",
  description: "Your personal .harz name mapped to your HARZ wallet.",
  start_url: "/",
  display: "standalone",
  background_color: "#f0f2f5",
  theme_color: "#f0f2f5",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
});

const SW = `
const C = "hns-v5";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  e.respondWith(caches.open(C).then(c => c.match(e.request).then(r => r || fetch(e.request).then(n => { c.put(e.request, n.clone()); return n; }))));
});
`;

const ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f0f2f5"/><circle cx="32" cy="32" r="17" fill="none" stroke="#2563eb" stroke-width="5"/><path d="M32 15v34M15 32h34" stroke="#2563eb" stroke-width="5"/></svg>';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (url.pathname === "/api/lookup" && request.method === "GET") return handleLookup(url, env);
    if (url.pathname === "/api/recent" && request.method === "GET") return handleRecent(env);
    if (url.pathname === "/api/register" && request.method === "POST") return handleRegister(request, env, ip);
    if (url.pathname === "/api/release" && request.method === "POST") return handleRelease(request, env, ip);
    if (url.pathname.startsWith("/name/") && request.method === "GET") return await handleNamePage(url, env);
    if (url.pathname === "/zone" && request.method === "GET") return handleZone(env);
    if (url.pathname === "/zone.sig" && request.method === "GET") return handleZoneSig(env);
    if (url.pathname === "/pub" && request.method === "GET") return handlePub(env);
    if (url.pathname === "/api/health") {
      const fp = await env.DB.prepare("SELECT value FROM hns_kv WHERE key='subzone_fp'").first().catch(() => null);
      return json({ status: "ok", service: "UNMUTANT (HARZ Name Service)", version: "1.3.1", signature_gated: true, theme: "light (#f0f2f5)", gate: GATE_HARZ + " HARZ", subzone: SUBZONE_KIND, hns_zsk_fp: fp ? fp.value : null, disclosure: DISCLOSURE });
    }
    if (url.pathname === "/manifest.json") return new Response(MANIFEST, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    if (url.pathname === "/sw.js") return new Response(SW, { headers: { "content-type": "application/javascript", "cache-control": "no-store" } });
    if (url.pathname === "/icon.svg") return new Response(ICON, { headers: { "content-type": "image/svg+xml", "cache-control": "max-age=86400" } });
    if (url.pathname === "/" && request.method === "GET") return new Response(PAGE, { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });

    return json({ error: "Not found", docs: "GET /api/lookup?name= | GET /api/recent | POST /api/register {name,wallet,bio?,signature} | POST /api/release {name,wallet,signature} | GET /api/health" }, 404);
  }
};
