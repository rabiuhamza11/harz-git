// G26 checkpoint minter: same HARZ-CHECKPOINT-V1 law as G25, generalized to
// sign with ANY kit key (the lifecycle tests rotate signers) and with an exact
// notarized_at. Canonical bytes = checkpoint WITHOUT origin_signature/anchor.
import crypto from 'crypto';
import fs from 'fs';
const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const [keyPath, fp, height, stateHashFile, notarizedAt, outPath] = process.argv.slice(2);
const stateHash = fs.readFileSync(stateHashFile, 'utf8').trim();
const checkpoint = { law: 'HARZ-CHECKPOINT-V1', origin_id: fp, chain_height: Number(height), state_hash: stateHash, notarized_at: notarizedAt };
const bytes = JSON.stringify(checkpoint);
const key = crypto.createPrivateKey(fs.readFileSync(keyPath, 'utf8'));
const sig = crypto.sign(null, Buffer.from(bytes, 'utf8'), key).toString('base64');
checkpoint.origin_signature = { alg: 'Ed25519', fingerprint: fp, signature: sig };
const blkId = 3000000 + Number(height);
const blk = { id: blkId, prev_hash: sha256('prev' + blkId).toUpperCase(), timestamp: notarizedAt, miner: '08028687857', nonce: Math.floor(Math.random() * 1e6), difficulty: 1 };
blk.hash = sha256(`${blk.id}|${blk.prev_hash}|${blk.timestamp}|${blk.miner}|${blk.nonce}|${blk.difficulty}`).toUpperCase();
checkpoint.anchor = { tx_id: 'ckpt-' + sha256(bytes).slice(0, 40), block_index: blkId, block: blk };
fs.writeFileSync(outPath, JSON.stringify(checkpoint, null, 2));
console.log(outPath.split('/').pop(), '<-', fp.slice(0, 8), '@', notarizedAt);
