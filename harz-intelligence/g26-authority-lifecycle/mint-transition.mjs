// G26 HARZ-KEY-TRANSITION-V2 minter: the canonical answer to "what exactly
// constitutes a valid authority transition" — old key -> new key -> effective
// time -> authorization signature by the EXISTING authority over all of it.
// Canonical bytes = the record WITHOUT the signature field.
import crypto from 'crypto';
import fs from 'fs';
const [fromKeyPath, fromFp, toAnchorPath, transitionId, effectiveAt, outPath] = process.argv.slice(2);
const to = JSON.parse(fs.readFileSync(toAnchorPath, 'utf8'));
const fromKey = crypto.createPrivateKey(fs.readFileSync(fromKeyPath, 'utf8'));
const rec = { law: 'HARZ-KEY-TRANSITION-V2', transition_id: transitionId, from_fingerprint: fromFp, to_fingerprint: to.fingerprint, to_public_key_spki_pem: to.public_key_spki_pem, effective_at: effectiveAt };
const bytes = JSON.stringify(rec);
const sig = crypto.sign(null, Buffer.from(bytes, 'utf8'), fromKey).toString('base64');
rec.signature_b64 = sig;
fs.writeFileSync(outPath, JSON.stringify(rec, null, 2));
console.log(transitionId, fromFp.slice(0, 8), '->', to.fingerprint.slice(0, 8), '@', effectiveAt);
