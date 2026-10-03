// G24 fork minter — constructs DIVERGENT authorized states at the same chain
// position (both signed by the standing kit key), simulating what a split-brain
// or compromised-same-key origin emits. The fork is the test; the verifier's
// verdict is the law. Also mints a manufactured-height state (law 3 death test).
import crypto from 'crypto';
import fs from 'fs';
const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const key = crypto.createPrivateKey(fs.readFileSync(new URL('../keys/origin-v3-key.pem', import.meta.url), 'utf8'));
const sign = (bytes) => crypto.sign(null, Buffer.from(bytes, 'utf8'), key).toString('base64');
const tip = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')); // {height, state_hash}
const M = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); // source record content
const height = Number(process.argv[4] || tip.height + 1);
const prior = process.argv[5] || tip.state_hash;
const payload = sha256('state-payload:' + M.id + ':' + M.receipt + ':' + (M.designation ? M.designation.designation_receipt : 'no-designation'));
const genesis = process.argv[7] === 'genesis';
const cell = genesis
  ? { law: 'HARZ-STATE-CONTINUITY-V1', record: M.id, height: 1, genesis: true, prior_state_hash: null, unlinked_era: { disclosed: true, records_before_genesis: 999 }, payload_hash: payload }
  : { law: 'HARZ-STATE-CONTINUITY-V1', record: M.id, height, prior_state_hash: prior, payload_hash: payload };
const cellBytes = JSON.stringify(cell);
const cellSig = { alg: 'Ed25519', fingerprint: process.argv[6], signature: sign(cellBytes) };
const fork = JSON.parse(JSON.stringify(M));
fork.continuity = { ...cell, origin_signature: cellSig };
console.log(JSON.stringify(fork));
