# HARZ D1 20K-GATE PHONE TEST KIT v6 — ready for owner execution

* Kit: harz-20k-kit-v6.tgz (11,104,835 bytes,
  sha256 d53d2af972c13746fde54691be23129d0c15a953c65630079837fcdba571517f)
* Contents: kb20k.sqlite.gz (sealed 20K FTS5 sample from harz_search_v02, the
  same artifact as manifest-20k.json, sample_sha 29649c8a...), battery-20k.json
  (frozen 20-case battery, declared 2026-10-11 before execution), engine20k.mjs,
  engine20k.py, run20k.sh, battery fallbacks.
* Gates: G0 engine present; G1 sqlite binding; G2 integrity; G3 rows = 20000;
  G4 FTS5 works; G5 avg query <= 50ms; G6 top1 >= 19/20; G7 top3 >= 19/20.
* Sandbox verification (this machine, python branch): ALL GATES PASS —
  integrity ok, 20000 rows, avg 0.3ms, first 0.5ms, top1 19/20, top3 19/20,
  RSS 18MB. Node branch syntax-checked; auto-falls back to python3 if the
  phone's node has no sqlite binding (needs node >= 22.5 or better-sqlite3).
* MEASUREMENT-ONLY: the 20K sample is not deployed to the live core; 20K
  promotion remains owner-ruled. Nothing uploads from the phone.
* One command on the Infinix (Termux):
  curl -sL <RAW_URL> -o harz-20k-kit-v6.tgz && tar xzf harz-20k-kit-v6.tgz -C harz20k && cd harz20k && bash run20k.sh
  (mkdir harz20k first if needed)
* Paste the full output from "== HARZ" down; the row closes on his report.
