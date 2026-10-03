import crypto from 'crypto';
import fs from 'fs';
const v1 = JSON.parse(fs.readFileSync('keys/production-anchor.json', 'utf8'));
const v2 = JSON.parse(fs.readFileSync('keys/production-v2-anchor.json', 'utf8'));
const oldPriv = crypto.createPrivateKey(fs.readFileSync('keys/production-key.pem', 'utf8'));
const body = JSON.stringify({ law: 'HARZ-KEY-TRANSITION-V1', transition_id: 'harz-production-key-1-to-2',
  from_fingerprint: v1.fingerprint, to_fingerprint: v2.fingerprint, to_public_key_spki_pem: v2.public_key_spki_pem });
const sig = crypto.sign(null, Buffer.from(body, 'utf8'), oldPriv).toString('base64');
fs.writeFileSync('keys/production-key-transition.json', JSON.stringify({ transition_id: 'harz-production-key-1-to-2',
  from_fingerprint: v1.fingerprint, to_fingerprint: v2.fingerprint, to_public_key_spki_pem: v2.public_key_spki_pem,
  signature_b64: sig, law: 'HARZ-KEY-TRANSITION-V1' }, null, 2));
console.log('PRODUCTION TRANSITION: key 1 (' + v1.fingerprint.slice(0, 16) + '...) signs the introduction of key 2 (' + v2.fingerprint.slice(0, 16) + '...)');
