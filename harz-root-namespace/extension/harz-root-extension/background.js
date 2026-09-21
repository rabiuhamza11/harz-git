/* HARZ ROOT — .harz namespace resolver extension v1.0
 * ZERO-TRUST LAW (same law as resolver.js and dial-gateway.js):
 * redirect rules exist ONLY if the live zone's sha256 matches the pinned
 * canonical hash. Any drift, any fetch failure, any parse failure => all
 * rules removed => the extension serves nothing. Fails closed, always.
 */
const PINNED_ZONE_HASH = "e94b9693e94a229065f79c14577a3db767063744df4f7aefc7dfe9a2fd227f05";
const PINNED_ZSK_FP = "86a507a42df64df2"; // production ZSK fingerprint — owner ceremony 2026-09-14
const ZONE_URL = "https://harz-root.harz.workers.dev/zone";
const REFRESH_MINUTES = 30;

function hex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function fetchZone() {
  const r = await fetch(ZONE_URL, { cache: "no-store" });
  if (!r.ok) throw new Error("zone fetch failed: HTTP " + r.status);
  return await r.text();
}

function parseZone(text) {
  const names = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([a-z0-9-]+)\.harz\.\s+3600\s+IN\s+TXT\s+"(.*)"\s*$/);
    if (!m) continue;
    const raw = m[2].replace(/\\(.)/g, "$1");
    let val;
    try { val = JSON.parse(raw); } catch (e) { continue; }
    names[m[1]] = { type: val.record_type || "SERVICE", url: val.url || null, note: val.note || "" };
  }
  return names;
}

async function failClosed(msg) {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: rules.map(r => r.id) });
  chrome.action.setBadgeText({ text: "ERR" });
  chrome.action.setBadgeBackgroundColor({ color: "#c0392b" });
  await chrome.storage.local.set({ zoneInfo: { ok: false, error: msg, updated: Date.now() } });
}

async function applyZone() {
  try {
    const text = await fetchZone();
    const digest = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
    if (digest !== PINNED_ZONE_HASH) {
      return failClosed("ZONE DRIFT — live hash " + digest.slice(0, 12) + "… does not match pinned canonical hash. Rules withdrawn.");
    }
    const names = parseZone(text);
    const list = Object.keys(names);
    if (list.length === 0) return failClosed("zone parsed to 0 names — parse failure. Rules withdrawn.");
    const live = list.filter(n => names[n].url && names[n].url.startsWith("https://"));
    const reserved = list.filter(n => !names[n].url);

    const rules = [];
    let id = 1;
    for (const n of live) {
      rules.push({
        id: id++, priority: 2,
        condition: { requestDomains: [n], resourceTypes: ["main_frame"] },
        action: { type: "redirect", redirect: { url: names[n].url } }
      });
    }
    for (const n of reserved) {
      rules.push({
        id: id++, priority: 2,
        condition: { requestDomains: [n], resourceTypes: ["main_frame"] },
        action: { type: "redirect", redirect: { url: chrome.runtime.getURL("reserved.html") + "?name=" + n } }
      });
    }
    // NXDOMAIN catch-all: any *.harz name not in the canonical zone
    rules.push({
      id: id++, priority: 1,
      condition: {
        regexFilter: "^https?://([a-z0-9-]+)\\.harz(:\\d+)?(/|\\?|$)",
        resourceTypes: ["main_frame"]
      },
      action: {
        type: "redirect",
        redirect: { regexSubstitution: chrome.runtime.getURL("nxdomain.html") + "?name=\\1" }
      }
    });

    const old = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: old.map(r => r.id),
      addRules: rules
    });

    chrome.action.setBadgeText({ text: String(list.length) });
    chrome.action.setBadgeBackgroundColor({ color: "#1a7f37" });
    await chrome.storage.local.set({
      zoneInfo: {
        ok: true, height: 1, hash: digest, names: list.length,
        live: live.length, reserved: reserved.length,
        zsk: PINNED_ZSK_FP, updated: Date.now(), map: names
      }
    });
  } catch (e) {
    return failClosed(String((e && e.message) || e));
  }
}

chrome.runtime.onInstalled.addListener(() => {
  applyZone();
  chrome.alarms.create("zone-refresh", { periodInMinutes: REFRESH_MINUTES });
});
chrome.runtime.onStartup.addListener(applyZone);
chrome.alarms.onAlarm.addListener(applyZone);
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.cmd === "refresh") { applyZone().then(() => sendResponse({ done: true })); return true; }
});
