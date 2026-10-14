#!/usr/bin/env python3
"""TEAM C CROSS-SEAT INDEPENDENT VERIFICATION (Hauwa seat) — read-only.
Second-seat reproduction of Team A's claims and the desk's 403ece9 findings.
No shared code with prior scanners: independent implementation.
"""
import hashlib, json, re, sys

P = "harz-knowledge-mission/visual-fidelity/packs/"

def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()

def decode_entities(s):
    return (s.replace("&amp;", "&").replace("&#38;", "&").replace("&#x26;", "&"))

report = {}

# ---------- GATE 1: hashes ----------
print("== GATE 1: artifact hashes ==")
files = ["immigration-v3-final.html", "cbn-live.html", "nimc-v3.html", "cac-v2.html", "health-v2.html"]
hashes = {}
for f in files:
    h = sha256(P + f)
    hashes[f] = h
    print(f"  {f}: {h[:16]}... ({len(open(P+f,'rb').read()):,} bytes)")
report["hashes"] = hashes

# ---------- GATE 2: immigration 5-class scan ----------
print("\n== GATE 2: immigration v0.3 five-class scan (independent implementation) ==")
src = open(P + "immigration-v3-final.html", encoding="utf-8", errors="replace").read()
low = src.lower()
n = len(src)

img_src = re.findall(r'<img[^>]+src\s*=\s*["\']([^"\']+)["\']', low)
ext_img = [u for u in img_src if u.startswith("http") or u.startswith("//")]
unresolved_img = [u for u in ext_img if not decode_entities(u).startswith("#")]
print(f"  image src total: {len(img_src)} | external/unresolved: {len(unresolved_img)}")
for u in unresolved_img[:5]: print(f"    eg: {u[:90]}")

script_src = re.findall(r'<script[^>]+src\s*=\s*["\']([^"\']+)["\']', low)
ext_script = [u for u in script_src if u.startswith("http") or u.startswith("//")]
print(f"  external script src: {len(ext_script)}")
for u in ext_script[:5]: print(f"    eg: {u[:90]}")

iframes = re.findall(r'<iframe[^>]+src\s*=\s*["\']([^"\']+)["\']', low)
map_iframes = [u for u in iframes if "map" in u or "maps" in u]
print(f"  iframes total: {len(iframes)} | map iframes: {len(map_iframes)}")

# fonts: any protocol-relative or external font URL, incl. inside inline CSS
font_links = re.findall(r'(?:src:|url\()\s*["\']?((?:https?:)?//[^)"\']+\.woff2?[^)"\']*)["\']?', low)
proto_rel_fonts = [u for u in font_links if u.startswith("//")]
print(f"  font URL refs: {len(font_links)} | protocol-relative: {len(proto_rel_fonts)}")

notices = re.findall(r'requires?\s*-?\s*internet', low)
print(f"  requires-internet notices: {len(notices)}")

report["immigration_5class"] = {
    "external_image_src": len(unresolved_img), "external_script_src": len(ext_script),
    "map_iframes": len(map_iframes), "protocol_relative_fonts": len(proto_rel_fonts),
    "notices": len(notices)}

# ---------- GATE 3: desk's NEW claim — external stylesheet links ----------
print("\n== GATE 3: external stylesheet links (desk claimed 230: 220 site / 6 themigrate / 4 googleapis) ==")
links = re.findall(r'<link[^>]+rel\s*=\s*["\']?stylesheet["\']?[^>]*>', low) + \
         re.findall(r'<link[^>]+href\s*=\s*["\']([^"\']+\.css[^"\']*)["\'][^>]*rel\s*=\s*["\']?stylesheet', low)
hrefs = []
for tag in re.findall(r'<link[^>]*>', low):
    if re.search(r'rel\s*=\s*["\']?stylesheet', tag):
        m = re.search(r'href\s*=\s*["\']([^"\']+)["\']', tag)
        if m: hrefs.append(m.group(1))
ext_css = [u for u in hrefs if u.startswith("http") or u.startswith("//")]
site_cnt = len([u for u in ext_css if "immigration" in u or "nimc" in u])
migrate_cnt = len([u for u in ext_css if "themigrate" in u])
google_cnt = len([u for u in ext_css if "googleapis" in u])
print(f"  total link tags w/ stylesheet: {len(hrefs)} | external: {len(ext_css)}")
print(f"  breakdown: site-ish {site_cnt}, themigrate.xyz {migrate_cnt}, googleapis {google_cnt}, other {len(ext_css)-site_cnt-migrate_cnt-google_cnt}")

# measure: is linked CSS content present inside the pack (inline <style> or data-uri)?
inline_style_bytes = sum(len(m) for m in re.findall(r'<style[^>]*>(.*?)</style>', low, re.S))
print(f"  inline <style> total bytes: {inline_style_bytes:,}")
# do any of the external css URLs have corresponding content embedded as data: URIs?
data_uris = len(re.findall(r'data:(?:text/css|application/font)', low))
print(f"  data:text/css or font URIs: {data_uris}")
report["external_css"] = {"total_ext": len(ext_css), "site": site_cnt,
    "themigrate": migrate_cnt, "googleapis": google_cnt,
    "inline_style_bytes": inline_style_bytes, "data_uri_css_fonts": data_uris}

# ---------- GATE 4: CBN live capture ----------
print("\n== GATE 4: CBN fresh capture scan ==")
c = open(P + "cbn-live.html", encoding="utf-8", errors="replace").read().lower()
yt = len(re.findall(r'youtube\.com/embed|youtube-nocookie', c))
ext_img_c = [u for u in re.findall(r'<img[^>]+src\s*=\s*["\']([^"\']+)["\']', c) if u.startswith("http") or u.startswith("//")]
ext_css_c = [u for u in re.findall(r'<link[^>]*>', c) if re.search(r'rel\s*=\s*["\']?stylesheet', u) and re.search(r'href\s*=\s*["\'](?:https?:)?//', u)]
print(f"  YouTube embeds: {yt} | external imgs: {len(ext_img_c)} | external css: {len(ext_css_c)}")
report["cbn_scan"] = {"youtube_embeds": yt, "external_imgs": len(ext_img_c), "external_css": len(ext_css_c)}

# ---------- GATE 5: provenance stamps (all four packs) ----------
print("\n== GATE 5: harz-provenance stamps ==", flush=True)
stamps = {}
for f in ["nimc-v3.html", "cac-v2.html", "health-v2.html", "immigration-v3-final.html"]:
    raw = open(P + f, encoding="utf-8", errors="replace").read()
    m = raw.find("harz-provenance")
    if m < 0:
        stamps[f] = {"found": False, "verdict": "NO STAMP MARKER FOUND"}
        print(f"  {f}: NO MARKER"); continue
    # C5 REVISION (ruling 9a36de0): extract the exact comment span, parse payload,
    # and report the precise truncation boundary instead of a naive balanced-window scan.
    cstart = raw.find("{", m)
    cend = raw.find("-->", cstart)
    payload = raw[cstart:cend].strip() if cend > cstart else raw[cstart:]
    try:
        obj = json.loads(payload)
        stamps[f] = {"found": True, "parsed": True, "comment_span_chars": len(payload),
            "fields": {k: str(v)[:60] for k, v in list(obj.items())[:8]}}
        verdict = f"PARSE OK ({len(payload):,} chars)"
    except json.JSONDecodeError as e:
        stamps[f] = {"found": True, "parsed": False, "comment_span_chars": len(payload),
            "truncation_boundary_char": e.pos,
            "verdict": f"TRUNCATED at char {e.pos:,} of span {len(payload):,}"}
        verdict = stamps[f]["verdict"]
    print(f"  {f}: {verdict}")
report["provenance"] = stamps

json.dump(report, open("harz-knowledge-mission/visual-fidelity/TEAM-C-CROSSSEAT-RAW.json", "w"), indent=1)
print("\nRAW RESULTS SAVED (C5-revised scanner)")
