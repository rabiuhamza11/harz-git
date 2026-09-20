// THE DOOR — a .harz navigation lands here. Cache-first, verified always.
import * as core from "./reach-core.js";

const $ = id => document.getElementById(id);

function zoneFingerprint(z) {
  return { height: z.height, records: z.records.length, sig: z.sig.slice(0, 24) + "…" };
}

async function getStoredZone() {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    const got = await chrome.storage.local.get(["harz_zone"]);
    if (got.harz_zone) return { zone: got.harz_zone, source: "cache" };
    return { zone: null, source: "none" };
  }
  return { zone: window.__reachTestZone || null, source: window.__reachTestZone ? "cache" : "none" };
}

async function storeZone(z, info) {
  if (typeof chrome !== "undefined" && chrome.storage?.local)
    await chrome.storage.local.set({ harz_zone: z, harz_zone_meta: { fetched_at: info.fetchedAt, transport: info.transport } });
  else window.__reachTestZone = z;
}

async function pushReceipt(r) {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return;
  const got = await chrome.storage.local.get(["harz_receipts"]);
  const list = (got.harz_receipts || []).slice(0, 49);
  list.unshift(r);
  await chrome.storage.local.set({ harz_receipts: list });
}

// fetch fresh from the root (best effort; cache survives root death)
async function fetchZone() {
  let lastErr = null;
  for (const root of core.ROOTS) {
    try {
      const res = await fetch(root + "/zone", { cache: "no-store" });
      if (!res.ok) { lastErr = "HTTP " + res.status; continue; }
      const zone = await res.json();
      const loaded = await core.loadZone(zone); // trust check + sig verify
      if (!loaded.ok) return { ok: false, reason: loaded.reason, zone: null };
      return { ok: true, zone: loaded.zone, transport: "root-live" };
    } catch (e) { lastErr = e.message; }
  }
  return { ok: false, reason: "ROOT UNREACHABLE (" + (lastErr || "network") + ")", zone: null };
}

async function resolveNow(name) {
  // 1) cache-first
  const stored = await getStoredZone();
  let zone = null, transport = "cache-stale";
  if (stored.zone) {
    const loaded = await core.loadZone(stored.zone);
    if (loaded.ok) { zone = loaded.zone; transport = "cache-live"; }
  }
  // 2) refresh in every case (stale-while-revalidate)
  const fresh = await fetchZone();
  if (fresh.ok) {
    if (!zone || fresh.zone.height >= zone.height) { zone = fresh.zone; transport = "root-live"; }
    await storeZone(fresh.zone, { fetchedAt: Date.now(), transport: "root-live" });
  }
  if (!zone) {
    const r = core.makeReceipt({ name, result: "REFUSED", transport: "none", height: null, digest8: null, sigOk: false, records: null });
    pushReceipt(r);
    return { rec: null, refused: fresh.reason || "no verified zone available (cache empty, root unreachable)" };
  }
  const idx = core.buildIndex(zone);
  const rec = core.resolveName(idx, name); // honest NXDOMAIN = null
  const receipt = core.makeReceipt({
    name, result: rec ? "RESOLVED" : "NXDOMAIN", transport,
    endpoint: rec?.endpoints?.https || null,
    height: zone.height, digest8: zone.sig.slice(10, 18), sigOk: true, records: zone.records.length
  });
  pushReceipt(receipt);
  return { rec, receipt, zone, transport };
}

function page(name, html) { $("status").innerHTML = html; }

async function main() {
  // the .harz URL arrives in the hash: reach.html#u=<original>
  let target = decodeURIComponent((location.hash.match(/^#u=(.*)$/) || [])[1] || "");
  let name = (target.match(/https?:\/\/([a-z0-9][a-z0-9.-]*\.harz)/i) || [])[1] || "";
  const bare = !name;
  if (!name) name = (location.hash.match(/^#u=([a-z0-9.-]+\.harz)/i) || [])[1] || "";

  if (!name) {
    page(name, '<span class="big">HARZ Reach</span><br><span class="small">no .harz name in this request<br><br>type <span class="code" style="display:inline">pay.harz</span> in the address bar to try the door</span>');
    $("foot").textContent = "the doorway answers only .harz — everything else passes through untouched";
    return;
  }
  const out = await resolveNow(name);
  if (out.refused) {
    page(name, '<span class="big err">REFUSED</span><br>' + out.refused + '<br><span class="small">fail-closed: no verified book, no answers. Cache is empty and the root is unreachable.</span>');
    $("foot").textContent = "fail-closed law: never guess, never fall back to another authority";
    return;
  }
  const { rec, receipt, zone, transport } = out;
  if (!rec) {
    page(name, '<span class="big err">' + name + '</span><br><span class="err">unknown name — honest absence</span><br><span class="small">NXDOMAIN. No fake resolution, no search hijack.</span>');
    $("foot").innerHTML = 'receipt: ' + JSON.stringify(receipt);
    return;
  }
  const target_ = rec.endpoints?.https;
  let html = '<span class="big">' + rec.name + '</span><br><span class="ok">signature verified · ' + rec.service + '</span>';
  if (target_) {
    html += '<div class="code">' + target_ + '</div><span class="small">following the service record…</span><div class="btn-row" id="rr"></div>';
  } else {
    html += '<br><span class="err">reserved — no live endpoint in the signed book</span>';
  }
  page(name, html);
  $("foot").innerHTML = 'receipt: ' + JSON.stringify(receipt);
  if (target_) {
    const btn = document.createElement("a");
    btn.className = "btn"; btn.href = target_; btn.textContent = "Follow now";
    $("status").appendChild(btn);
    setTimeout(() => { location.replace(target_); }, 1500); // auto-follow the service record
  }
}
main();
