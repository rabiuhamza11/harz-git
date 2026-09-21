#!/usr/bin/env node
/* HEIGHT-2 MERGE HELPER — run on Node 1 in harz-root-namespace/build
 * Reads height2-wallet-entries.json, validates, merges into canonical-names.json,
 * bumps mint_height to 2, backs up the height-1 source first.
 * REFUSES to mint if any address is still the 0x...dEaD placeholder.
 * Zero dependencies. Does not sign — zone-generator.js stays the signer. */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const CN = path.join(DIR, 'canonical-names.json');
const ENTRIES = path.join(DIR, 'height2-wallet-entries.json');
const PLACEHOLDER = '0x000000000000000000000000000000000000dead';
function fail(m) { console.error('FAIL: ' + m); process.exit(1); }
if (!fs.existsSync(CN)) fail('canonical-names.json not found in this folder');
if (!fs.existsSync(ENTRIES)) fail('height2-wallet-entries.json not found — run: git pull');
const cn = JSON.parse(fs.readFileSync(CN, 'utf8'));
const entries = JSON.parse(fs.readFileSync(ENTRIES, 'utf8'));
const existing = new Set(cn.names.map(n => n.name));
for (const e of entries) {
  if (e.record_type !== 'WALLET') fail(e.name + ': record_type must be WALLET');
  const a = (e.record_value && e.record_value.address) || '';
  if (!/^0x[0-9a-fA-F]{40}$/.test(a)) fail(e.name + ': address is not a valid EVM public address (0x + 40 hex)');
  if (a.toLowerCase() === PLACEHOLDER) fail(e.name + ': STILL THE PLACEHOLDER. Open height2-wallet-entries.json, put your REAL PUBLIC address in. Never mint placeholders.');
  if (existing.has(e.name)) fail('collision: ' + e.name + ' already exists in the zone');
  console.log('OK  ' + e.name + '.harz  ' + a);
}
fs.copyFileSync(CN, path.join(DIR, 'canonical-names.height1.backup.json'));
cn.names.push(...entries);
cn.mint_height = 2;
fs.writeFileSync(CN, JSON.stringify(cn, null, 2) + '\n');
console.log('OK  MERGED: ' + cn.names.length + ' names, mint_height set to 2');
console.log('OK  height-1 source backed up: canonical-names.height1.backup.json');
console.log('NEXT: node zone-generator.js --source canonical-names.json');
