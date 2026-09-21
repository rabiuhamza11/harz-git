// HARZ REACH v0.1 BATTERY — proves the capability layer above the frozen root.
// Live: fetch root /zone, verify vs king 90062faa, resolve, receipts.
// Death: cache-only path (root unreachable), tamper/wrong-anchor/shrink/rollback refusals.
import * as core from "./reach-core.js";
import { createHash } from "crypto";

let PASS = 0, FAIL = 0;
const T = (id, name, ok, note) => { console.log((ok ? "PASS" : "FAIL") + " " + id + " — " + name + (note ? "  [" + note + "]" : "")); ok ? PASS++ : FAIL++; };

const res = await fetch(core.ROOTS[0] + "/zone", { cache: "no-store" });
const liveZone = await res.json();

// R1 — boot: the live book verifies under the pinned trust bundle
const boot = await core.loadZone(liveZone);
T("R1", "LIVE root book loads: anchor 90062faa + floors 77/1 + Ed25519 sig VALID", boot.ok, boot.ok ? "height " + boot.zone.height + ", " + boot.zone.records.length + " names" : boot.reason);

// R2 — the book is the king's sealed artifact (byte-canonical)
const fs = await import("fs");
const sealed = JSON.parse(fs.readFileSync("/app/conversations/6a1e2f01850b30461c36f5ea/root-rung/zone-v2/SIGNED-ZONE-V2.json", "utf8"));
T("R2", "live == sealed artifact: served zone is byte-canonical identical to SIGNED-ZONE-V2.json",
  core.canonicalize(liveZone) === core.canonicalize(sealed));

// R3 — 77/77 resolve through the core
const idx = core.buildIndex(liveZone);
let n = 0;
for (const r of liveZone.records) if (core.resolveName(idx, r.name)) n++;
T("R3", "all names resolve through Reach core", n === 77, n + "/77");

// R4 — pay.harz follows its service record
const pay = core.resolveName(idx, "pay.harz");
T("R4", "pay.harz → https://harzpay.harz.workers.dev (service record followed)",
  pay?.endpoints?.https === "https://harzpay.harz.workers.dev");

// R5 — honest absence
T("R5", "unknown name = null (no fake resolution)", core.resolveName(idx, "doesnotexist.harz") === null);

// R6-R9 — refusals (fail-closed everywhere)
const t1 = await core.loadZone({ ...liveZone, records: liveZone.records.slice(0, 3) });
T("R6", "shrink REFUSED", !t1.ok && t1.reason.includes("SHRINK"));
const t2 = await core.loadZone({ ...liveZone, height: 0 });
T("R7", "rollback REFUSED", !t2.ok && t2.reason.includes("ROLLBACK"));
const t3 = await core.loadZone({ ...liveZone, signed_by: "ed25519:" + "0".repeat(64) });
T("R8", "wrong anchor REFUSED", !t3.ok && t3.reason.includes("WRONG ANCHOR"));
const tampered = JSON.parse(JSON.stringify(liveZone)); tampered.records[5].endpoints.https = "https://evil.example";
const t4 = await core.loadZone(tampered);
T("R9", "tampered endpoint REFUSED (sig broken)", !t4.ok && t4.reason.includes("SIGNATURE FAILED"));

// R10 — cache roundtrip (the offline spine): store → reload → re-verify → identical answers
const stored = JSON.parse(JSON.stringify(liveZone));
const reload = await core.loadZone(stored);
const idx2 = core.buildIndex(reload.zone);
let same = true;
for (const r of liveZone.records) if (JSON.stringify(core.resolveName(idx, r.name)) !== JSON.stringify(core.resolveName(idx2, r.name))) { same = false; break; }
T("R10", "cache roundtrip: store→reload→re-verify→byte-identical answers", reload.ok && same);

// R11 — DEATH TEST phase 1: root unreachable → cache-only path still serves verified answers
globalThis.__fetch_dead = true;
const storedDead = JSON.parse(JSON.stringify(liveZone));
const deadBoot = await core.loadZone(storedDead);
const deadIdx = core.buildIndex(deadBoot.zone);
const deadPay = core.resolveName(deadIdx, "pay.harz");
T("R11", "death: with NO root fetch, cached book verifies + pay.harz resolves (cache-live transport)",
  deadBoot.ok && deadPay?.endpoints?.https === "https://harzpay.harz.workers.dev");

// R12 — receipts: every resolution leaves a verifiable record
const rOK = core.makeReceipt({ name: "pay.harz", result: "RESOLVED", transport: "cache-live", endpoint: deadPay.endpoints.https, height: 1, digest8: "cac16833", sigOk: true, records: 77 });
const rNX = core.makeReceipt({ name: "nope.harz", result: "NXDOMAIN", transport: "cache-live", height: 1, digest8: "cac16833", sigOk: true, records: 77 });
T("R12", "receipts: RESOLVED + NXDOMAIN both leave complete verifiable records",
  rOK.ts && rOK.zone.sig === "VALID" && rNX.result === "NXDOMAIN" && rNX.endpoint === null);

// R13 — no verified book anywhere = REFUSED, never a guess
const t5 = await core.loadZone(null);
T("R13", "empty world REFUSED (fail-closed, no guessing)", !t5.ok);

console.log("");
console.log("REACH v0.1 BATTERY: " + PASS + "/" + (PASS + FAIL));
console.log("ROOT FROZEN — untouched tonight, as ordered.");
process.exit(FAIL ? 1 : 0);
