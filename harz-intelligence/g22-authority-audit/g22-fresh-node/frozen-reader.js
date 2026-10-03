// G18 INDEPENDENT NODE — frozen reader extracted VERBATIM from the committed
// frozen source (harz-git anchor 8ea1384). Same judge, different court.
const V2B_INJECT_RE = /ignore\s+(?:all\s+)?(?:your\s+)?previous\s+instructions|delete\s+all\s+records|override\s+system\s+policy|publish\s+the\s+admin\s+password/i;
const VIS_ENGINE = { id: 'harz-vis-refsyn', model_version: '0.1', sovereign: true,
  adapter: 'harz-model-interface',
  notes: 'in-worker deterministic reference visual-facts engine (PNG chunk law + JPEG segment law); extracts ONLY byte-derivable facts with provenance; a real HARZ-owned vision model replaces this behind the SAME interface without touching the evidence layer' };
const M4_CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
function m4Crc32(latin1) { let c = 0xFFFFFFFF; for (let i = 0; i < latin1.length; i++) c = (M4_CRC_TABLE[(c ^ latin1.charCodeAt(i)) & 255] ^ (c >>> 8)); return (c ^ 0xFFFFFFFF) >>> 0; }
function visBE32(str, o) { return ((str.charCodeAt(o) << 24) | (str.charCodeAt(o+1) << 16) | (str.charCodeAt(o+2) << 8) | str.charCodeAt(o+3)) >>> 0; }
async function m3Inflate(latin1) {
  const u8 = new Uint8Array(latin1.length);
  for (let i = 0; i < latin1.length; i++) u8[i] = latin1.charCodeAt(i) & 255;
  const ds = new DecompressionStream('deflate');
  const ab = await new Response(new Blob([u8]).stream().pipeThrough(ds)).arrayBuffer();
  const out = new Uint8Array(ab);
  let s = '';
  for (let i = 0; i < out.length; i += 0x8000) s += String.fromCharCode.apply(null, out.subarray(i, i + 0x8000));
  return s;
}
async function visDecodePng(raw) {
  if (raw.slice(0, 8) !== '\x89PNG\r\n\x1a\n') return { error: 'no PNG signature', honest_note: 'not a recognizable PNG; raw artifact preserved, zero fabricated pixels' };
  let honest = null; const texts = []; let ihdr = null, ihdrRange = null; const idats = []; let iend = false;
  let p = 8;
  while (p + 8 <= raw.length) {
    const len = visBE32(raw, p); const type = raw.slice(p + 4, p + 8);
    if (p + 8 + len + 4 > raw.length) { honest = 'truncated PNG: chunk ' + JSON.stringify(type) + ' exceeds available bytes; honest failure, zero fabricated pixels'; break; }
    const data = raw.slice(p + 8, p + 8 + len);
    const crcStored = visBE32(raw, p + 8 + len);
    const crcCalc = m4Crc32(type + data);
    const range = [p, p + 8 + len + 4];
    if (crcStored !== crcCalc) { honest = honest || 'chunk ' + type + ' bytes [' + range[0] + ',' + range[1] + ']: CRC32 mismatch; chunk NOT accepted (zero fabricated content from it)'; p = p + 8 + len + 4; continue; }
    if (type === 'IHDR') { ihdr = { width: visBE32(data, 0), height: visBE32(data, 4), bit_depth: data.charCodeAt(8), color_type: data.charCodeAt(9), compression: data.charCodeAt(10), filter_method: data.charCodeAt(11), interlace: data.charCodeAt(12) }; ihdrRange = range; }
    else if (type === 'IDAT') idats.push(data);
    else if (type === 'tEXt') { const z = data.indexOf('\x00'); if (z > 0) { const tx = data.slice(z + 1); texts.push({ keyword: data.slice(0, z), text: tx, byte_range: range, injection_flag: V2B_INJECT_RE.test(tx) }); } }
    else if (type === 'IEND') { iend = true; }
    p = p + 8 + len + 4;
    if (iend) break;
  }
  if (!ihdr) return { error: 'no IHDR', honest_note: honest || 'PNG lacks an IHDR chunk; honest failure, zero fabricated pixels' };
  if (!iend && !idats.length) return { error: 'no image data', honest_note: honest || 'PNG lacks IDAT data; honest failure, zero fabricated pixels' };
  if (ihdr.bit_depth !== 8 || ![2, 6, 0, 4].includes(ihdr.color_type))
    return { error: 'unsupported PNG variant', honest_note: 'reference decoder supports 8-bit gray/RGB/RGBA only (bit_depth=' + ihdr.bit_depth + ', color_type=' + ihdr.color_type + '); honest-unsupported, raw preserved, zero fabricated pixels' };
  const bpp = ihdr.color_type === 2 ? 3 : ihdr.color_type === 6 ? 4 : ihdr.color_type === 4 ? 2 : 1;
  let inflated = '';
  try { inflated = await m3Inflate(idats.join('')); } catch (e) { return { error: 'IDAT inflate failed', honest_note: 'IDAT decompression failed; honest failure, zero fabricated pixels' }; }
  const stride = ihdr.width * bpp; const expected = ihdr.height * (stride + 1);
  if (inflated.length < expected) return { error: 'short scanline buffer', honest_note: 'decompressed IDAT (' + inflated.length + ' bytes) smaller than the scanline buffer the IHDR implies (' + expected + '); honest failure, zero fabricated pixels' };
  // unfilter (filters 0-4, 8-bit)
  const out = new Uint8Array(expected);
  for (let y = 0; y < ihdr.height; y++) {
    const ro = y * (stride + 1);
    const ft = inflated.charCodeAt(ro) & 255;
    if (ft > 4) return { error: 'unknown filter', honest_note: 'unknown PNG filter type ' + ft + ' on scanline ' + y + '; honest failure, zero fabricated pixels' };
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[ro + 1 + x - bpp] : 0;
      const b = y > 0 ? out[ro - (stride + 1) + 1 + x] : 0;
      const c = (x >= bpp && y > 0) ? out[ro - (stride + 1) + 1 + x - bpp] : 0;
      let v = inflated.charCodeAt(ro + 1 + x) & 255;
      if (ft === 1) v = (v + a) & 255;
      else if (ft === 2) v = (v + b) & 255;
      else if (ft === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (ft === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v = (v + (pa <= pb && pa <= pc ? a : (pb <= pc ? b : c))) & 255; }
      out[ro + 1 + x] = v;
    }
  }
  const sample = (x, y) => { const off = y * (stride + 1) + 1 + x * bpp;
    return bpp >= 3 ? { x, y, r: out[off], g: out[off + 1], b: out[off + 2] } : { x, y, gray: out[off] }; };
  return { format: 'png', ihdr, ihdr_range: ihdrRange, texts, honest_note: honest, engine: VIS_ENGINE,
    pixel_sample: [sample(0, 0), sample(Math.min(2, ihdr.width - 1), Math.min(3, ihdr.height - 1)), sample(ihdr.width - 1, ihdr.height - 1)],
    sample_fn: sample };
}

function imgReadMetadata(pngBytes) {
  let p = 8; const out = [];
  while (p + 8 <= pngBytes.length) {
    const len = visBE32(pngBytes, p); const type = pngBytes.slice(p + 4, p + 8);
    if (p + 8 + len + 4 > pngBytes.length) break;
    if (type === 'iTXt') {
      const data = pngBytes.slice(p + 8, p + 8 + len);
      const z1 = data.indexOf('\x00'), z2 = data.indexOf('\x00', z1 + 3);
      try { out.push(new TextDecoder('utf-8').decode(new Uint8Array(Array.from(data.slice(z2 + 1)).map(c => c.charCodeAt(0) & 255)))); } catch (e) {}
    }
    p += 8 + len + 4;
  }
  return out;
}

module.exports = { visDecodePng, imgReadMetadata };
