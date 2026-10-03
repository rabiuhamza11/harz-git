// G23 key generation — sovereign HARZ-owned keys, Node Kit (no external CA)
import crypto from 'crypto';
import fs from 'fs';
const name = process.argv[2];
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const pubPem = publicKey.export({ type: 'spki', format: 'pem' });
const spki = publicKey.export({ type: 'spki', format: 'der' });
const fingerprint = crypto.createHash('sha256').update(spki).digest('hex');
fs.writeFileSync(`keys/${name}-key.pem`, privPem);       // NEVER committed — private
fs.writeFileSync(`keys/${name}-public.pem`, pubPem);      // trust anchor material
fs.writeFileSync(`keys/${name}-anchor.json`, JSON.stringify({ name, alg: 'Ed25519', fingerprint, public_key_spki_pem: pubPem }, null, 2));
console.log(`${name}: fingerprint ${fingerprint.slice(0, 24)}... — private key at keys/${name}-key.pem (confined)`);
