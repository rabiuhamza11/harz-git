// HARZ CEREMONY v1.0: type-card.js — the gentle card typer.
// Replaces shell tricks (echo quotes, cat + Ctrl-D) with simple questions.
// The card NEVER leaves the phone. The file is written ONLY when the whole
// card validates (96 hex + / + 96 hex). Deletes nothing, sends nothing.
//
// usage: node type-card.js A|B|C [CHECK-8-hex-on-the-card]

const crypto = require("crypto");
const fs = require("fs");
const readline = require("readline");

const args = process.argv.slice(2);
const which = (args[0] || "").trim().toUpperCase();
if (!["A", "B", "C"].includes(which)) {
  console.error("usage: node type-card.js A|B|C [CHECK-8-hex-on-the-card]");
  console.error("example: node type-card.js C");
  process.exit(1);
}
const expectedCheck = (args[1] || "").trim().toLowerCase();
const file = "p" + which + ".txt";

function sha8(s) { return crypto.createHash("sha256").update(s, "utf8").digest("hex").slice(0, 8); }

console.log("");
console.log("=== TYPING CARD " + which + " ===");
console.log("I will ask for one row at a time. Just type the row and press Enter.");
console.log("Commands: 'ok' when the card is finished, 'undo' removes your last row.");
console.log("Nothing is saved until the whole card is valid. Nothing is sent anywhere.");
console.log("");

const rows = [];
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function progress() {
  const joined = rows.join("").replace(/\s+/g, "");
  const slash = joined.includes("/") ? " (slash seen)" : "";
  console.log("  saved " + rows.length + " row(s), " + joined.length + " characters so far" + slash);
}

function ask() {
  rl.question("row " + (rows.length + 1) + " (or ok / undo): ", (line) => {
    const t = line.trim().toLowerCase();
    if (t === "ok") return finish();
    if (t === "undo") {
      if (rows.length) { rows.pop(); console.log("  removed last row."); } else { console.log("  nothing to undo."); }
      return ask();
    }
    rows.push(line.trim());
    progress();
    ask();
  });
}

function finish() {
  const raw = rows.join("").replace(/\s+/g, "").toLowerCase();
  const problems = [];
  const parts = raw.split("/");
  if (parts.length !== 2) problems.push("expected exactly 1 slash, found " + (parts.length - 1));
  else {
    const [a, b] = parts;
    if (a.length !== 96 || b.length !== 96) problems.push("expected 96 chars each side, found " + a.length + " and " + b.length);
    for (const [name, s] of [["first half", parts[0]], ["second half", parts[1]]]) {
      for (let i = 0; i < s.length; i++) {
        if (!/[0-9a-f]/.test(s[i])) { problems.push(name + " char " + (i + 1) + " is '" + s[i] + "' — not hex (0-9 a-f)"); break; }
      }
    }
  }
  if (problems.length) {
    console.log("");
    console.log("NOT SAVED — problems found:");
    problems.forEach(p => console.log("  - " + p));
    console.log("Type 'undo' to remove rows and fix, or just keep typing rows. Then 'ok' again.");
    return ask();
  }
  const check = sha8(raw);
  console.log("");
  if (expectedCheck) {
    if (check !== expectedCheck) {
      console.log("CHECK MISMATCH — sha8 " + check + " vs card CHECK " + expectedCheck);
      console.log("NOT SAVED. Type 'undo' and re-check the rows against the paper, then 'ok' again.");
      return ask();
    }
    console.log("CHECK MATCH — the card is byte-exact.");
  } else {
    console.log("sha8 of this card: " + check + " — compare with the CHECK written on the card.");
    console.log("If it matches, the card is byte-exact.");
  }
  fs.writeFileSync(file, raw);
  console.log("");
  console.log("SAVED to " + file + " (typed content only, on this phone).");
  console.log("Next: node finish-ceremony.js — it signs and then deletes the typed files.");
  rl.close();
}

ask();
