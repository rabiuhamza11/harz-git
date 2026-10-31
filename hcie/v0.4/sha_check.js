function hcieSha256(str) {
  var msg = new TextEncoder().encode(str);
  var K = new Uint32Array(64), n = 0, comp = {};
  for (var c = 2; n < 64; c++) {
    if (!comp[c]) {
      for (var m = c * c; m < 100000; m += c) comp[m] = 1;
      K[n++] = (Math.pow(c, 1 / 3) % 1 * 4294967296) >>> 0;
    }
  }
  var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var l = msg.length, bitLen = l * 8;
  var padded = new Uint8Array((((l + 9) + 63) >> 6) << 6);
  padded.set(msg); padded[l] = 0x80;
  var dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 4294967296));
  dv.setUint32(padded.length - 4, bitLen >>> 0);
  var w = new Uint32Array(64);
  for (var off = 0; off < padded.length; off += 64) {
    for (var i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (i = 16; i < 64; i++) {
      var s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      var s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    var a = h[0], b = h[1], cc = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
    for (i = 0; i < 64; i++) {
      var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      var ch = (e & f) ^ (~e & g);
      var t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      var maj = (a & b) ^ (a & cc) ^ (b & cc);
      var t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = cc; cc = b; b = a; a = (t1 + t2) >>> 0;
    }
    h = [(h[0] + a) >>> 0, (h[1] + b) >>> 0, (h[2] + cc) >>> 0, (h[3] + d) >>> 0,
         (h[4] + e) >>> 0, (h[5] + f) >>> 0, (h[6] + g) >>> 0, (h[7] + hh) >>> 0];
  }
  var out = '';
  for (i = 0; i < 8; i++) out += ('00000000' + h[i].toString(16)).slice(-8);
  return out;
}

var data=JSON.parse(require('fs').readFileSync('payload.json','utf8'));
var ok=0,bad=[];
data.docs.forEach(function(d,i){ var got=hcieSha256(d.text); if(got===d.sha256) ok++; else bad.push({i:i,src:d.source,got:got}); });
console.log('IN-BUNDLE JS SHA256: '+ok+'/'+data.docs.length+' verified');
if(bad.length) console.log('MISMATCH:', JSON.stringify(bad.slice(0,3)));
