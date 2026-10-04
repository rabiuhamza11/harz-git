import crypto from 'crypto';
import fs from 'fs';
const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const M = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const cell = M.continuity; const sig = cell.origin_signature;
const body = { law: cell.law, record: cell.record, height: cell.height };
if (cell.genesis) { body.genesis = true; body.prior_state_hash = null; body.unlinked_era = cell.unlinked_era; }
else { body.prior_state_hash = cell.prior_state_hash; }
if (cell.restarts_after_act) body.restarts_after_act = cell.restarts_after_act;
body.payload_hash = cell.payload_hash;
console.log(sha256(JSON.stringify(body) + ':' + sig.signature));
