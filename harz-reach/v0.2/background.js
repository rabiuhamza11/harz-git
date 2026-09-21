// HARZ REACH background — keeps the verified book warm. Never answers anything itself.
import * as core from "./reach-core.js";

async function refreshZone() {
  for (const root of core.ROOTS) {
    try {
      const res = await fetch(root + "/zone", { cache: "no-store" });
      if (!res.ok) continue;
      const zone = await res.json();
      const loaded = await core.loadZone(zone);
      if (!loaded.ok) return { ok: false, reason: loaded.reason };
      await chrome.storage.local.set({
        harz_zone: loaded.zone,
        harz_zone_meta: { fetched_at: Date.now(), transport: "root-live", root }
      });
      return { ok: true, zone: loaded.zone };
    } catch (e) { /* try next root */ }
  }
  return { ok: false, reason: "all roots unreachable" };
}

chrome.runtime.onInstalled.addListener(async () => { await refreshZone(); });
chrome.alarms.create("harz-reach-refresh", { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(async a => { if (a.name === "harz-reach-refresh") await refreshZone(); });

// message API for the popup
chrome.runtime.onMessage.addListener((msg, _s, reply) => {
  if (msg === "zone-status") {
    chrome.storage.local.get(["harz_zone", "harz_zone_meta"]).then(async got => {
      if (!got.harz_zone) { reply({ ok: false, reason: "no cached zone yet" }); return; }
      const loaded = await core.loadZone(got.harz_zone); // re-verify ALWAYS, even from cache
      reply({
        ok: loaded.ok, reason: loaded.reason || null,
        height: got.harz_zone.height, records: got.harz_zone.records.length,
        sig: got.harz_zone.sig.slice(0, 24) + "…",
        meta: got.harz_zone_meta
      });
    });
    return true; // async reply
  }
  if (msg === "refresh") { refreshZone().then(r => reply(r.ok)); return true; }
});
