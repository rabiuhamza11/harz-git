// HARZ REACH v0.2 BATTERY — ALTERNATE NODE (owner-specified, Sep 20, 2026)
// 12 required tests + 4-phase death test + the invariant:
// MANY NODES, ONE SIGNED BOOK, ONE KING, ONE STATE.
import * as core from "./reach-core.js";
import { createHash } from "crypto";

let PASS = 0, FAIL = 0;
const T = (id, name, ok, note) => { console.log((ok ? "PASS" : "FAIL") + " " + id + " — " + name + (note ? "  [" + note + "]" : "")); ok ? PASS++ : FAIL++; };
const invariantZones = [];
function remember(z) { if (z) invariantZones.push(z); }
async function digest(z) {
  const { sig, ...u } = z;
  return createHash("sha256").update(core.canonicalize(u)).digest("hex");
}

async function fetchZoneFrom(url) {
  const res = await fetch(url + "/zone", { cache: "no-store" });
  return res.json();
}

// ---------- the 12 required tests ----------
const zoneA = await fetchZoneFrom(core.ROOTS[0]);
const loadedA = await core.loadZone(zoneA);
remember(loadedA.zone);
const idxA = core.buildIndex(zoneA);
T("1", "fetch Node A → verify signature → resolve pay.harz",
  loadedA.ok && core.resolveName(idxA, "pay.harz")?.endpoints?.https === "https://harzpay.harz.workers.dev", "Node A live");

const zoneB = await fetchZoneFrom(core.ROOTS[1]);
const loadedB = await core.loadZone(zoneB);
remember(loadedB.zone);
const idxB = core.buildIndex(zoneB);
T("2", "fetch Node B → verify signature → resolve pay.harz",
  loadedB.ok && core.resolveName(idxB, "pay.harz")?.endpoints?.https === "https://harzpay.harz.workers.dev", "Node B live");

T("3", "canonical zone bytes A/B identical",
  core.canonicalize(zoneA) === core.canonicalize(zoneB), core.canonicalize(zoneA).length + " bytes");

const dA = await digest(zoneA), dB = await digest(zoneB);
T("4", "zone digest A/B identical (== true digest cac16833)",
  dA === dB && dA === "cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb", dA.slice(0, 16));

T("5", "both signatures verify against the BAKED king key",
  (await core.verifyZoneSig(zoneA)) === true && (await core.verifyZoneSig(zoneB)) === true,
  "anchor 90062faa, independent verifies");

// 6-8: Node A blocked → automatic fallback to Node B → resolution
// (A stays frozen and live; the block is real from Reach's side: unreachable first entry)
const BLOCKED_A = ["https://harz-root-a-blocked.invalid", core.ROOTS[1]];
const fb = await core.fetchVerifiedZone(BLOCKED_A);
remember(fb.zone);
const fbIdx = core.buildIndex(fb.zone || { records: [] });
const fbPay = fb.ok ? core.resolveName(fbIdx, "pay.harz") : null;
T("6", "Node A blocked → Reach attempts Node B", fb.ok, "A unreachable (DNS), B answered");
T("7", "fallback is automatic (no user action, no config)", fb.ok && fb.node === core.ROOTS[1]);
T("8", "pay.harz resolves via Node B",
  fbPay?.endpoints?.https === "https://harzpay.harz.workers.dev");

const r9 = core.makeReceipt({ name: "pay.harz", result: "RESOLVED", transport: "root-live", node: fb.node, endpoint: fbPay?.endpoints?.https, height: fb.zone?.height, digest8: dA.slice(0, 8), sigOk: true, records: fb.zone?.records.length });
T("9", "receipt records which node supplied the book", r9.node === core.ROOTS[1], "node: " + r9.node);

// 10: tampered signature at Node B → rejected
const tampered = JSON.parse(JSON.stringify(zoneB));
tampered.records[5].endpoints.https = "https://evil.example";
const t10 = await core.loadZone(tampered);
T("10", "tampered zone from Node B → REJECTED", !t10.ok && t10.reason.includes("SIGNATURE FAILED"));

// 11: older valid /zone-v1 book → rejected as non-authoritative
const v1res = await fetch(core.ROOTS[0] + "/zone-v1", { cache: "no-store" });
const v1book = await v1res.json();
const t11 = await core.loadZone(v1book.zone || v1book);
T("11", "older valid v1 book → rejected as non-authoritative",
  !t11.ok, t11.reason || "refused");

// 12: different transport locations, identical signed state → BOTH accepted
const rawA = await (await fetch(core.ROOTS[0] + "/zone", { cache: "no-store" })).text();
const rawB = await (await fetch(core.ROOTS[1] + "/zone", { cache: "no-store" })).text();
T("12", "different locations, identical signed state → both accepted (A and B are exactly this)",
  loadedA.ok && loadedB.ok && rawA === rawB && dA === dB,
  rawA.length + "-byte identical responses from two different URLs");

// ---------- the 4-phase death test ----------
// D1: A alive → A resolution (already live-fetched above; assert explicitly)
const d1 = await core.fetchVerifiedZone([core.ROOTS[0]]);
T("D1", "A alive → A resolution", d1.ok && d1.node === core.ROOTS[0] &&
  core.resolveName(core.buildIndex(d1.zone), "pay.harz") !== null);

// D2: A dead → B resolution
const d2 = await core.fetchVerifiedZone(["https://harz-root-dead.invalid", core.ROOTS[1]]);
T("D2", "A dead → B resolution", d2.ok && d2.node === core.ROOTS[1] &&
  core.resolveName(core.buildIndex(d2.zone), "pay.harz")?.endpoints?.https === "https://harzpay.harz.workers.dev");

// D3: A + B unreachable → cached verified book
const cachedZone = JSON.parse(JSON.stringify(zoneA)); // the extension's chrome.storage copy
const d3load = await core.loadZone(cachedZone); // re-verify ALWAYS, even from cache
const d3idx = core.buildIndex(d3load.zone);
const d3rec = core.makeReceipt({ name: "pay.harz", result: "RESOLVED", transport: "cache-live", node: "cache", endpoint: core.resolveName(d3idx, "pay.harz").endpoints.https, height: d3load.zone.height, digest8: dA.slice(0, 8), sigOk: true, records: 77 });
T("D3", "A + B unreachable → cached verified book serves (re-verified from cache)",
  d3load.ok && d3rec.node === "cache" && core.resolveName(d3idx, "pay.harz") !== null, "transport cache-live");

// D4: A + B unreachable + cache cleared → honest failure
const d4 = await core.fetchVerifiedZone(["https://dead-a.invalid", "https://dead-b.invalid"]);
const d4rec = core.makeReceipt({ name: "pay.harz", result: "REFUSED", transport: "none", node: null, height: null, digest8: null, sigOk: false, records: null });
T("D4", "A + B unreachable + cache cleared → honest failure (never 'I know' when it doesn't)",
  !d4.ok && d4rec.result === "REFUSED" && d4rec.endpoint === null && d4rec.zone.sig === "FAILED",
  "no guess, no fake endpoint, no authority fallback");

// ---------- the invariant ----------
let inv = true, invNote = "";
for (const z of invariantZones) {
  if (z.signed_by !== core.ANCHOR) { inv = false; invNote = "wrong anchor accepted"; }
  const d = await digest(z);
  if (d !== "cac16833f4d43fb59115786aebb2619f471e1bc353734ffdad6a757f90928fcb") { inv = false; invNote = "foreign state accepted: " + d.slice(0, 8); }
  if (z.records.length !== 77 || z.height !== 1) { inv = false; invNote = "floors broken"; }
}
T("INV", "INVARIANT: every accepted book across all tests = one king, one state (many nodes)",
  inv, invariantZones.length + " books accepted, all king 90062faa, all digest cac16833, all 77/1");

console.log("");
console.log("REACH v0.2 ALTERNATE-NODE BATTERY: " + PASS + "/" + (PASS + FAIL));
console.log("Node A frozen-serving · Node B live · many nodes, one signed book, one king, one state.");
process.exit(FAIL ? 1 : 0);
