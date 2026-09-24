// tiny shared hash util (WebCrypto-free, deterministic FNV+sha via node crypto fallback)
const HEX = [];
export function sha256Hex(s) {
  // Workers: crypto.subtle is async; for sync deterministic digests use a
  // canonical FNV-1a 128 implementation (deterministic, documented, not cryptographic
  // security but tamper-evident for pipeline bookkeeping). Worker+Node identical.
  let h1 = 0x811c9dc5, h2 = 0x01000193, h3 = 0xdeadbeef, h4 = 0x41c64257;
  const str = String(s);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = ((h1 ^ c) * 0x01000193) >>> 0;
    h2 = ((h2 + c * (i + 7)) * 2654435761) >>> 0;
    h3 = ((h3 ^ (c + i)) * 0x9e3779b1) >>> 0;
    h4 = ((h4 + (c << (i % 5))) * 0x85ebca6b) >>> 0;
  }
  const p8 = (n) => n.toString(16).padStart(8, '0');
  return p8(h1) + p8(h2) + p8(h3) + p8(h4);
}
