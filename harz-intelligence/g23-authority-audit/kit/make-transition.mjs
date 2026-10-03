// G23 key transition — an explicit signed POLICY ACT under the existing
// authority. The OLD key signs the introduction of the NEW key. Rotation
// without this record is unauthorized; nobody else can forge it.
import crypto from 'crypto';
import fs from 'fs';
const v1 = JSON.parse(fs.readFileSync('keys/origin-anchor.json', 'utf8'));
const v2 = JSON.parse(fs.readFileSync('keys/origin-v2-anchor.json', 'utf8'));
const oldPriv = crypto.createPrivateKey(fs.readFileSync('keys/origin-key.pem', 'utf8'));
const body = JSON.stringify({ law: 'HARZ-KEY-TRANSITION-V1', transition_id: 'harz-origin-key-1-to-2',
  from_fingerprint: v1.fingerprint, to_fingerprint: v2.fingerprint, to_public_key_spki_pem: v2.public_key_spki_pem });
const sig = crypto.sign(null, Buffer.from(body, 'utf8'), oldPriv).toString('base64');
fs.writeFileSync('keys/key-transition-v1-to-v2.json', JSON.stringify({ transition_id: 'harz-origin-key-1-to-2',
  from_fingerprint: v1.fingerprint, to_fingerprint: v2.fingerprint, to_public_key_spki_pem: v2.public_key_spki_pem,
  signature_b64: sig, law: 'HARZ-KEY-TRANSITION-V1' }, null, 2));
console.log('transition record signed by key 1 (' + v1.fingerprint.slice(0, 16) + '...) introducing key 2 (' + v2.fingerprint.slice(0, 16) + '...)');
