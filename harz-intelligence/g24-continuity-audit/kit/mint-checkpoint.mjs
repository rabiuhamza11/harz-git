// G25 checkpoint minter (harness-side): signs a checkpoint with the standing kit
// origin key and fabricates a simulated HARZ-chain anchor block whose hash
// recomputes under the chain's PUBLIC formula: SHA-256(id|prev_hash|timestamp|miner|nonce|difficulty).
import crypto from 'crypto';
import fs from 'fs';
const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const key = crypto.createPrivateKey(fs.readFileSync(new URL('../keys/origin-v3-key.pem', import.meta.url), 'utf8'));
const fp = process.argv[4];
const stateHash = fs.readFileSync(process.argv[3], 'utf8').trim(); // state_hash file
const height = Number(process.argv[2]);
const ageHours = process.argv[5] ? Number(process.argv[5]) : 0;
const checkpoint = { law: 'HARZ-CHECKPOINT-V1', origin_id: fp, chain_height: height, state_hash: stateHash, notarized_at: new Date(Date.now() - ageHours * 3600000).toISOString() };
const bytes = JSON.stringify(checkpoint);
const sig = crypto.sign(null, Buffer.from(bytes, 'utf8'), key).toString('base64');
checkpoint.origin_signature = { alg: 'Ed25519', fingerprint: fp, signature: sig };
// simulated chain anchor block
const blkId = 2000000 + height;
const blk = { id: blkId, prev_hash: sha256('prev' + blkId).toUpperCase(), timestamp: new Date(Date.now() - ageHours * 3600000).toISOString(), miner: '08028687857', nonce: Math.floor(Math.random() * 1e6), difficulty: 1 };
blk.hash = sha256(`${blk.id}|${blk.prev_hash}|${blk.timestamp}|${blk.miner}|${blk.nonce}|${blk.difficulty}`).toUpperCase();
checkpoint.anchor = { tx_id: 'ckpt-' + sha256(bytes).slice(0, 40), block_index: blkId, block: blk };
console.log(JSON.stringify(checkpoint));
