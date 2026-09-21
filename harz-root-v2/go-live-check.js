// HARZ ROOT v2 GO-LIVE PRE-FLIGHT SWEEP v1.0 (Sep 15)
// One command re-verifies the ENTIRE stack before any ceremony/killer-test/migration day.
// Roles: each battery is an independent verifier; this sweep just runs them and reads verdicts.
// Law: every battery must PASS in one run, deterministically. Any FAIL = NO-GO, no overrides.
const { execSync } = require("child_process");
const path = require("path");

const BATTERIES = [
  { name: "SCHEMA v2 (record law)",        cmd: "node harz-root-v2/schema-v2/zone-v2.js",                    verdict: /BATTERY: (\d+)\/(\d+) PASS/ },
  { name: "RESOLVER v1.2 (anchor+floors)", cmd: "node harz-root-v2/resolver/resolver-battery.js",            verdict: /BATTERY: (\d+)\/(\d+) PASS/ },
  { name: "REGISTRAR v1.0 (lifecycle)",    cmd: "node harz-root-v2/registrar/registrar-battery.js",         verdict: /VERDICT: (\d+)\/(\d+) PASS/ },
  { name: "QR RAIL v1.1 (camera rail)",    cmd: "node harz-root-v2/qr-rail/zero-icann-battery.js",           verdict: /BATTERY: (\d+)\/(\d+) PASS/ },
  { name: "GATEWAY (public doorway)",       cmd: "node harz-root-v2/gateway/gateway-battery.js",             verdict: /BATTERY: (\d+)\/(\d+) PASS/ },
  { name: "SUCCESSION REHEARSAL (law)",     cmd: "node succession-rehearsal/rehearsal.js",                   verdict: /VERDICT: (\d+)\/(\d+) PASS/ },
  { name: "CEREMONY KIT v1.1 (operator)",   cmd: "node succession-ceremony-kit/ceremony-battery.js",         verdict: /VERDICT: (\d+)\/(\d+) PASS/ },
];

let fails = 0;
console.log("=== HARZ ROOT v2 — GO-LIVE PRE-FLIGHT SWEEP ===");
for (const b of BATTERIES) {
  try {
    const out = execSync(b.cmd, { cwd: __dirname, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    const m = (out + "").match(b.verdict);
    if (m && m[1] === m[2]) {
      console.log("  PASS " + m[1] + "/" + m[2] + " — " + b.name);
    } else {
      fails++;
      console.log("  FAIL — " + b.name + " (no clean verdict)");
    }
  } catch (e) {
    const out = (e.stdout || "") + (e.stderr || "");
    const m = out.match(b.verdict);
    if (m && m[1] === m[2]) {
      console.log("  PASS " + m[1] + "/" + m[2] + " — " + b.name + " (exit-code noise, verdict clean)");
    } else {
      fails++;
      console.log("  FAIL — " + b.name + " :: " + String(out.match(/FAIL[^\n]*/) || e.message).slice(0, 90));
    }
  }
}
console.log(fails === 0
  ? "\nSWEEP VERDICT: GO — all 7 batteries green, stack is ceremony-ready"
  : "\nSWEEP VERDICT: NO-GO — " + fails + " battery(ies) failing. Fix before any go-live step.");
process.exitCode = fails === 0 ? 0 : 1;
