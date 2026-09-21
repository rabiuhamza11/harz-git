// HARZ TerraKit-style Farmer Advisory Demonstrator — B2B Demo #3
// Built in response to OpenInfra Africa / TerraKit founding-CTO brief (Nairaland, May 12):
// maize/rice systems, climate data, farmer data, APIs, AI-assisted advisory, low-bandwidth mobile.
// Zero-dependency Cloudflare Worker. Bindings: TK_DB (D1). Light theme, PWA, offline shell.
// Honest labeling throughout: the climate/advisory knowledge base is a DEMO KB derived from published
// Nigerian agro-climatology (NAERLS-style planting calendars). Production = live CHIRPS/TAMSAT rainfall,
// station data, and model outputs — the interfaces here are shaped for exactly that integration.

const THEME = "#f0f2f5";
const ACCENT = "#2e7d32";

// ---------------- DEMO KNOWLEDGE BASE ----------------
// Per-state agro-climatology + crop windows (maize/rice). Simplified, honest, deterministic.
// rainfall_mm = typical annual range; onset = typical rainy-season onset window; season_days = growing season length.
// windows: planting windows. risk: dry-spell/other notable risk. Extra "irrigated_dry" for rice states with dry-season schemes.
const KB = {
  "Borno":       { zone:"Sahel",        rainfall_mm:[350,700],   onset:"mid Jun",     season_days:[90,120],  maize:{varieties:"Early/extra-early (90d)", windows:["15 Jun – 10 Jul"], spacing:"75x25cm, 1 seed/hill", tips:["Plant with first sustained rains","Early-maturing varieties only"]}, rice:{varieties:"Upland early", windows:["15 Jun – 15 Jul"], tips:["Only flooded/fadama plots","Dry-season rice at irrigation schemes"]}, risk:"Short season; dry spells late Jul–Aug end season early. Dry-spell watch is the core climate service here.", irrigation:"Dry-season schemes: Bomo pockets, fadama irrigation" },
  "Yobe":       { zone:"Sahel",        rainfall_mm:[400,700],   onset:"mid Jun",     season_days:[90,120],  maize:{varieties:"Extra-early (90d)", windows:["15 Jun – 10 Jul"], spacing:"75x25cm", tips:["Plant only on moisture-retaining soils","Thin to 1 plant/hill at 2wks"]}, rice:{varieties:"Lowland early", windows:["20 Jun – 15 Jul"], tips:["Fadama lowlands only"]}, risk:"June dry spells can strand early plantings. Onset timing service matters most." },
  "Jigawa":     { zone:"Sudan",        rainfall_mm:[600,900],   onset:"early Jun",   season_days:[100,130], maize:{varieties:"Early (95d)", windows:["5 Jun – 5 Jul"], spacing:"75x25cm", tips:["Row planting, 8kg/ha seed rate"]}, rice:{varieties:"Lowland (FARO)", windows:["10 Jun – 10 Jul"], tips:["Hadejia valley lowlands"]}, risk:"Mid-season dry spells (late Jul) cut yields; stagger planting across the window." },
  "Kano":       { zone:"Sudan",        rainfall_mm:[700,1000],  onset:"late May",    season_days:[110,140], maize:{varieties:"Early/intermediate", windows:["1 Jun – 25 Jun"], spacing:"75x25cm", tips:["Solo/hybrid maize gaining ground","Top-dress N at 4wks"]}, rice:{varieties:"Lowland (FARO 44/52)", windows:["5 Jun – 5 Jul"], tips:["Kano River irrigation (KRIP) = dry-season rice Jan–Feb"]}, risk:"Onset variability; false starts common in May. Onset forecast = #1 advisory value." },
  "Katsina":    { zone:"Sudan",        rainfall_mm:[600,900],   onset:"early Jun",   season_days:[100,130], maize:{varieties:"Early", windows:["1 Jun – 25 Jun"], spacing:"75x25cm", tips:["Sandier soils: split fertilizer doses"]}, rice:{varieties:"Upland early", windows:["10 Jun – 5 Jul"], tips:["Only waterlogged lowlands"]}, risk:"June–July dry spells; north-of-Katsina Sahel edge is harshest." },
  "Sokoto":     { zone:"Sahel/Sudan",  rainfall_mm:[500,800],   onset:"mid Jun",     season_days:[95,125],  maize:{varieties:"Extra-early", windows:["10 Jun – 5 Jul"], spacing:"75x25cm", tips:["Maize marginal here; millet/sorghum dominate","Plant after 2–3 good rains"]}, rice:{varieties:"Lowland", windows:["15 Jun – 10 Jul"], tips:["Sokoto Rima valley lowlands"]}, risk:"Erratic onset, June heat. Planting-date service is decisive." },
  "Zamfara":    { zone:"Sudan",        rainfall_mm:[650,950],   onset:"early Jun",   season_days:[100,135], maize:{varieties:"Early", windows:["1 Jun – 28 Jun"], spacing:"75x25cm", tips:["Counter dry spells with tied ridges where possible"]}, rice:{varieties:"Lowland", windows:["5 Jun – 5 Jul"], tips:["Gusau lowland pockets"]}, risk:"Dry-spell frequency high; consider moisture-conservation practices." },
  "Kebbi":      { zone:"Sudan",        rainfall_mm:[650,950],   onset:"early Jun",   season_days:[100,135], maize:{varieties:"Early", windows:["1 Jun – 28 Jun"], spacing:"75x25cm", tips:["Sokoto basin alluvium helps moisture"]}, rice:{varieties:"Lowland (FARO 44)", windows:["5 Jun – 10 Jul"], tips:["Kebbi = Nigeria's rice heartland (Argungu/Bunza)","Dry-season rice Nov–Feb on floodplains (famous OLAM outgrower belt)"]}, risk:"Flood risk on floodplains; drainage advisories matter as much as drought." },
  "Kaduna":     { zone:"Guinea",      rainfall_mm:[900,1200],  onset:"late Apr",    season_days:[140,180], maize:{varieties:"Intermediate (105d)", windows:["20 Apr – 25 May"], spacing:"75x25cm", tips:["Two-dose N top-dressing","Striga watch on old fields"]}, rice:{varieties:"Lowland/upland", windows:["1 May – 5 Jun"], tips:["Fadama lowlands; dry-season double crop where water allows"]}, risk:"False-onset April plantedings can fail; advise replant threshold rules." },
  "Bauchi":     { zone:"Sudan/Guinea", rainfall_mm:[800,1100],  onset:"mid May",     season_days:[120,160], maize:{varieties:"Early/intermediate", windows:["15 May – 15 Jun"], spacing:"75x25cm", tips:["Northern Bauchi plants later (Jun), southern earlier (May)"]}, rice:{varieties:"Upland/lowland", windows:["20 May – 15 Jun"], tips:["Jamaare river lowlands"]}, risk:"Steep north-south gradient — advisory must be LGA-level, not state-level (production lesson)." },
  "Gombe":      { zone:"Guinea",      rainfall_mm:[850,1100],  onset:"mid May",     season_days:[120,160], maize:{varieties:"Intermediate", windows:["10 May – 10 Jun"], spacing:"75x25cm", tips:["Top-dress before flowering"]}, rice:{varieties:"Lowland", windows:["15 May – 10 Jun"], tips:["Dadin Kowa dam lowlands"]}, risk:"Late-season drought; medium-maturing only if planted by end of May." },
  "Adamawa":    { zone:"Guinea",      rainfall_mm:[900,1200],  onset:"early May",    season_days:[130,170], maize:{varieties:"Intermediate", windows:["5 May – 5 Jun"], spacing:"75x25cm", tips:["Fall armyworm scout at 3–4 wks"]}, rice:{varieties:"Lowland (NERICA upland too)", windows:["10 May – 10 Jun"], tips:["Upper Benue trough lowlands"]}, risk:"Onset + fall armyworm; integrated pest advisories valuable." },
  "Taraba":     { zone:"Guinea/Forest",rainfall_mm:[1000,1500], onset:"late Apr",    season_days:[150,200], maize:{varieties:"Intermediate/late", windows:["25 Apr – 30 May"], spacing:"75x25cm", tips:["Two seasons possible south of Wukari","Watch Striga on degraded fields"]}, rice:{varieties:"Lowland (NERICA upland)", windows:["1 May – 31 May"], tips:["Donga/Benue floodplains — best rice state you've never visited"]}, risk:"Flooding on Benue floodplains; drainage + early drainage warnings." },
  "Plateau":    { zone:"Mid-altitude", rainfall_mm:[1000,1400], onset:"late Apr",    season_days:[150,190], maize:{varieties:"Intermediate/late, highland adapted", windows:["20 Apr – 25 May"], spacing:"75x25cm", tips:["Plateau = maize belt; rust-resistant varieties","Cool temps lengthen season"]}, rice:{varieties:"Upland (NERICA)", windows:["1 May – 31 May"], tips:["Hoss (terraced) upland rice tradition"]}, risk:"Late-season cold slows dry-down; harvest-timing advisories." },
  "Niger":      { zone:"Guinea",      rainfall_mm:[900,1200],  onset:"late Apr",    season_days:[140,175], maize:{varieties:"Intermediate", windows:["20 Apr – 25 May"], spacing:"75x25cm", tips:["Shiroro/Borgu: watch floods in Aug"]}, rice:{varieties:"Lowland", windows:["1 May – 5 Jun"], tips:["Niger = #2 rice state; floodplain rice Jun–Nov","Dry-season irrigation at Wushishi/Kwakuti"]}, risk:"Flood (Aug) + dry spells (Jun); farmers need BOTH advisories." },
  "FCT":        { zone:"Guinea",      rainfall_mm:[1000,1300], onset:"late Apr",    season_days:[140,180], maize:{varieties:"Intermediate", windows:["20 Apr – 25 May"], spacing:"75x25cm", tips:["Urban market proximity = fresh-maize premium; stagger plantings"]}, rice:{varieties:"Lowland", windows:["1 May – 5 Jun"], tips:["Gurara/Jabi lowlands"]}, risk:"Land-use change; advisory should map farm plots (GIS layer demo)." },
  "Nasarawa":   { zone:"Guinea",      rainfall_mm:[1100,1400], onset:"mid Apr",      season_days:[150,190], maize:{varieties:"Intermediate", windows:["15 Apr – 20 May"], spacing:"75x25cm", tips:["Two staggered plantings = two harvests"]}, rice:{varieties:"Lowland/upland", windows:["20 Apr – 20 May"], tips:["Doma/Rukubi lowlands"]}, risk:"Flood + drought mix; SMS-based water alerts." },
  "Benue":      { zone:"Guinea/Forest",rainfall_mm:[1200,1500], onset:"early Apr",   season_days:[160,200], maize:{varieties:"Intermediate/late", windows:["10 Apr – 15 May"], spacing:"75x25cm", tips:["Benue = 'food basket'; 2 maize seasons south","Armyworm + Stem-borer watch"]}, rice:{varieties:"Lowland", windows:["15 Apr – 20 May"], tips:["Major lowland rice belt (Guma/Agatu)","Dry-season rice on fadama Nov–Mar"]}, risk:"Benue flooding is the big one; flood-forecast = top advisory product." },
  "Kwara":      { zone:"Guinea",      rainfall_mm:[1000,1300], onset:"mid Apr",      season_days:[150,190], maize:{varieties:"Intermediate", windows:["15 Apr – 20 May"], spacing:"75x25cm", tips:["Early + late split plantings"]}, rice:{varieties:"Lowland", windows:["20 Apr – 20 May"], tips:["Jebba/Oro lowlands; also dry-season irrigated"]}, risk:"Niger flood pulses; both drought & flood windows." },
  "Oyo":        { zone:"Forest",      rainfall_mm:[1200,1500], onset:"late Mar",     season_days:[180,220], maize:{varieties:"Intermediate/late; bimodal", windows:["25 Mar – 25 Apr (first season)","5 Aug – 5 Sep (second season)"], spacing:"75x25cm", tips:["Two full maize seasons — plant both","Downy mildew watch in wet Aug"]}, rice:{varieties:"Upland/lowland", windows:["1 Apr – 30 Apr","1 Aug – 30 Aug"], tips:["Eruwa lowland schemes"]}, risk:"Rainfall is BIMODAL — advisory engine must model two seasons (this demo does)." },
  "Osun":       { zone:"Forest",      rainfall_mm:[1200,1600], onset:"late Mar",     season_days:[180,220], maize:{varieties:"Intermediate; bimodal", windows:["25 Mar – 25 Apr","5 Aug – 5 Sep"], spacing:"75x25cm", tips:["Two seasons"]}, rice:{varieties:"Upland/lowland", windows:["1 Apr – 30 Apr","1 Aug – 30 Aug"], tips:["Ogwashi-type lowlands"]}, risk:"Second-season drought risk — Sep dry spells." },
  "Ogun":       { zone:"Forest",      rainfall_mm:[1200,1600], onset:"late Mar",     season_days:[180,220], maize:{varieties:"Intermediate; bimodal", windows:["25 Mar – 25 Apr","5 Aug – 5 Sep"], spacing:"75x25cm", tips:["Two seasons; Ofada belt prefers rice"]}, rice:{varieties:"Lowland (Ofada!)", windows:["1 Apr – 30 Apr","1 Aug – 30 Aug"], tips:["Ofada rice = premium local variety; Agric value-chain angle"]}, risk:"Late first-season rains can compress planting." },
  "Ondo":       { zone:"Forest",      rainfall_mm:[1400,1800], onset:"mid Mar",      season_days:[200,240], maize:{varieties:"Late; bimodal", windows:["15 Mar – 20 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["Abundant moisture; weed pressure high"]}, rice:{varieties:"Lowland", windows:["20 Mar – 20 Apr","1 Aug – 30 Aug"], tips:["Okitipupa lowlands"]}, risk:"Weeds + floods; timing advisories on weeding rounds." },
  "Edo":        { zone:"Forest",      rainfall_mm:[1400,1800], onset:"mid Mar",      season_days:[200,240], maize:{varieties:"Late; bimodal", windows:["15 Mar – 20 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["Two seasons"]}, rice:{varieties:"Lowland/upland", windows:["20 Mar – 20 Apr","1 Aug – 30 Aug"], tips:["Illushi/Ekpoma lowlands"]}, risk:"Flood on Niger-adjacent lowlands." },
  "Delta":      { zone:"Forest/Swamp", rainfall_mm:[1500,2000], onset:"mid Mar",     season_days:[200,250], maize:{varieties:"Late; bimodal", windows:["15 Mar – 20 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["Upland benches only"]}, rice:{varieties:"Deepwater/lowland", windows:["20 Mar – 20 Apr","1 Aug – 30 Aug"], tips:["Patani/Bomadi deepwater rice — special water regime, special advisories"]}, risk:"Flood is the defining risk; deepwater varieties for swamps." },
  "Anambra":    { zone:"Forest",      rainfall_mm:[1400,1800], onset:"mid Mar",     season_days:[200,240], maize:{varieties:"Late; bimodal", windows:["15 Mar – 20 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["Two seasons; intercrop with yam/cassava common"]}, rice:{varieties:"Lowland", windows:["20 Mar – 20 Apr","1 Aug – 30 Aug"], tips:["Omambala floodplain rice — high productivity"]}, risk:"Omambala flooding; flood-forecast product." },
  "Enugu":      { zone:"Derived",     rainfall_mm:[1300,1700], onset:"late Mar",     season_days:[190,230], maize:{varieties:"Intermediate/late; bimodal", windows:["20 Mar – 25 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["Two seasons; gully-erosion soils need organic matter"]}, rice:{varieties:"Upland/lowland", windows:["25 Mar – 25 Apr","1 Aug – 30 Aug"], tips:["Adani rice belt (Uzo-Uwani)"]}, risk:"Erosion + dry spells in the Aug gap (August break intensity varies)." },
  "Ebonyi":     { zone:"Derived",     rainfall_mm:[1400,1800], onset:"late Mar",     season_days:[190,230], maize:{varieties:"Intermediate; bimodal", windows:["20 Mar – 25 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["Abakaliki rice belt prefers rice"]}, rice:{varieties:"Lowland (Ebonyi white/gold)", windows:["25 Mar – 25 Apr","1 Aug – 30 Aug"], tips:["Abakaliki = iconic rice cluster; Ikwo/Izzi lowlands"]}, risk:"Lowland flooding; drainage advisories." },
  "Cross River":{ zone:"Forest",      rainfall_mm:[1500,2500], onset:"early Mar",    season_days:[220,280], maize:{varieties:"Late; bimodal", windows:["10 Mar – 20 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["Wettest belt; mold/rot watch"]}, rice:{varieties:"Lowland", windows:["15 Mar – 20 Apr","1 Aug – 30 Aug"], tips:["Calabar floodplains"]}, risk:"Excess rain; planting on raised beds in wettest LGAs." },
  "Rivers":     { zone:"Swamp",       rainfall_mm:[1800,2600], onset:"early Mar",    season_days:[230,280], maize:{varieties:"Late; bimodal", windows:["10 Mar – 20 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["Upland only; swamp rice elsewhere"]}, rice:{varieties:"Deepwater/lowland", windows:["15 Mar – 20 Apr","1 Aug – 30 Aug"], tips:["Ogba/Egbema deepwater rice"]}, risk:"Tidal + flood; water-regime advisories dominant." },
  "Akwa Ibom":  { zone:"Forest/Swamp", rainfall_mm:[1800,2400], onset:"early Mar",  season_days:[220,270], maize:{varieties:"Late; bimodal", windows:["10 Mar – 20 Apr","1 Aug – 5 Sep"], spacing:"75x25cm", tips:["High humidity = disease pressure"]}, rice:{varieties:"Lowland", windows:["15 Mar – 20 Apr","1 Aug – 30 Aug"], tips:["Ibiono lowlands"]}, risk:"Rain excess; drainage + variety choice." }
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function advisoryFor(state, crop, todayStr) {
  const s = KB[state];
  if (!s) return null;
  const c = s[crop];
  if (!c) return null;
  const today = new Date(todayStr || new Date().toISOString());
  const windows = c.windows.map(w => {
    // parse "15 Jun – 10 Jul" (en dash or hyphen) possibly with year-free month days
    const m = w.match(/^(\d{1,2})\s*([A-Za-z]{3})\s*[–-]\s*(\d{1,2})\s*([A-Za-z]{3})/);
    let start = null, end = null, status = "check";
    if (m) {
      const sm = MONTHS.findIndex(x => x.toLowerCase() === m[2].toLowerCase());
      const em = MONTHS.findIndex(x => x.toLowerCase() === m[4].toLowerCase());
      const dayOfYear = d => { const t = new Date(Date.UTC(2026, 0, 1)); const x = new Date(Date.UTC(2026, d.m, d.d)); return Math.round((x - t) / 86400000); };
      const s0 = dayOfYear({ m: sm, d: parseInt(m[1]) });
      const e0 = dayOfYear({ m: em, d: parseInt(m[3]) });
      const now = dayOfYear({ m: today.getUTCMonth(), d: today.getUTCDate() });
      let now2 = now; if (sm > em) { /* window wraps year */ }
      if (now < s0) status = "before_window";
      else if (now > e0) status = "after_window";
      else status = "in_window";
      start = `${m[1]} ${m[2]}`, end = `${m[3]} ${m[4]}`;
    }
    return { window: w, start, end, status };
  });
  const anyIn = windows.some(w => w.status === "in_window");
  return {
    state, zone: s.zone, crop,
    annual_rainfall_mm: s.rainfall_mm,
    typical_onset: s.onset,
    growing_season_days: s.season_days,
    planting_windows: windows,
    recommended_varieties: c.varieties,
    spacing: c.spacing || null,
    practice_tips: c.tips || [],
    climate_risk: s.risk,
    irrigation_notes: s.irrigation || null,
    status_summary: anyIn ? "A planting window is OPEN now — act this week." : (windows[0] && windows[0].status === "before_window" ? "Planting window not yet open — prepare land and seed." : "Main planting window(s) passed — see irrigation/dry-season notes or plan next season."),
    knowledge: "demo-kb-v1 (published Nigerian agro-climatology, simplified; production swaps in live CHIRPS/TAMSAT rainfall + station data)"
  };
}

// ---------------- MENU FLOW (WhatsApp/SMS-shaped state machine) ----------------
// POST /menu {session, input} -> {text}. A WhatsApp bot can bridge 1:1 to this.
async function menuStep(env, sessionId, input) {
  const db = env.TK_DB;
  let row = null;
  const get = await db.prepare("SELECT state FROM menu_sessions WHERE session_id = ?").bind(sessionId).first();
  let st = get && get.state ? JSON.parse(get.state) : { step: "main" };
  input = (input || "").trim();
  const say = text => ({ text });
  const save = async s => { st = s; const j = JSON.stringify(s);
    if (get) await db.prepare("UPDATE menu_sessions SET state = ?, updated = ? WHERE session_id = ?").bind(j, new Date().toISOString(), sessionId).run();
    else await db.prepare("INSERT INTO menu_sessions (session_id, state, updated) VALUES (?, ?, ?)").bind(sessionId, j, new Date().toISOString()).run();
  };

  if (input === "0") { await save({ step: "main" }); return say(mainMenu()); }
  switch (st.step) {
    case "main":
      if (input === "1") { await save({ step: "adv_state" }); return say("Enter your STATE (e.g. Kaduna, Benue, Kebbi):\n0 = back"); }
      if (input === "2") { await save({ step: "reg_name" }); return say("Register as a farmer.\nWhat is your NAME?\n0 = back"); }
      if (input === "3") { await save({ step: "cli_state" }); return say("Climate summary.\nEnter your STATE:\n0 = back"); }
      return say(mainMenu());
    case "adv_state": {
      const key = titleCase(input);
      if (!KB[key]) return say(`"${input}" is not in my state list yet. Try e.g. Kaduna, Benue, Kebbi, Oyo, Anambra.\n0 = back`);
      await save({ step: "adv_crop", state: key });
      return say(`${key} noted. Which CROP?\n1 = Maize\n2 = Rice\n0 = back`);
    }
    case "adv_crop": {
      const state = st.state; const crop = input === "1" ? "maize" : input === "2" ? "rice" : null;
      if (!crop) return say("Reply 1 for Maize, 2 for Rice.\n0 = back");
      const a = advisoryFor(state, crop, null);
      await db.prepare("INSERT INTO queries (kind, state, crop, source, created) VALUES (?, ?, ?, 'menu', ?)").bind("advisory", state, crop, new Date().toISOString()).run();
      await save({ step: "main" });
      return say(smsAdvisory(a));
    }
    case "reg_name": {
      await save({ step: "reg_state", name: input });
      return say(`Thanks ${input}. Your STATE? (e.g. Taraba)\n0 = back`);
    }
    case "reg_state": {
      const key = titleCase(input);
      if (!KB[key]) return say(`State not recognised. Try e.g. Kaduna, Taraba, Oyo.\n0 = back`);
      await save({ ...st, step: "reg_crop", state: key });
      return say(`${key}. Main CROP?\n1 = Maize\n2 = Rice\n0 = back`);
    }
    case "reg_crop": {
      const crop = input === "1" ? "maize" : input === "2" ? "rice" : null;
      if (!crop) return say("Reply 1 for Maize, 2 for Rice.\n0 = back");
      await save({ ...st, step: "reg_size", crop });
      return say("Farm SIZE in hectares? (number only, e.g. 2)\n0 = back");
    }
    case "reg_size": {
      const size = parseFloat(input);
      if (!(size > 0 && size < 10000)) return say("Enter a number in hectares, e.g. 2\n0 = back");
      const id = "FRM-" + Date.now().toString(36).toUpperCase();
      await db.prepare("INSERT INTO farmers (farmer_id, name, state, crop, farm_ha, source, created) VALUES (?, ?, ?, ?, ?, 'menu', ?)")
        .bind(id, st.name || "Unknown", st.state, st.crop, size, new Date().toISOString()).run();
      const msg = `Registered! Your farmer ID: ${id}\nYou will get ${st.crop} advisories for ${st.state}. Keep this ID.`;
      await save({ step: "main" });
      return say(msg);
    }
    case "cli_state": {
      const key = titleCase(input);
      const s = KB[key];
      if (!s) return say("State not recognised. Try e.g. Kano, Delta.\n0 = back");
      await db.prepare("INSERT INTO queries (kind, state, crop, source, created) VALUES (?, ?, NULL, 'menu', ?)").bind("climate", key, new Date().toISOString()).run();
      await save({ step: "main" });
      return say(`*${key}* (${s.zone} zone)\nRainfall: ${s.rainfall_mm[0]}-${s.rainfall_mm[1]} mm/yr\nOnset: ${s.onset}\nSeason: ${s.season_days[0]}-${s.season_days[1]} days\nRisk: ${s.risk}`);
    }
    default: return say(mainMenu());
  }
}
function mainMenu() {
  return "HARZ FARM ADVISORY (demo)\n1 = Crop advisory (maize/rice)\n2 = Register as farmer\n3 = Climate summary\n0 = restart";
}
function smsAdvisory(a) {
  const win = a.planting_windows.map(w => w.window).join(" | ");
  return `${a.state} ${a.crop.toUpperCase()} (${a.zone})\nPlanting: ${win}\nVarieties: ${a.recommended_varieties}\n${a.status_summary}\nTip: ${a.practice_tips[0] || "Prepare land early."}\nRisk: ${a.climate_risk}`;
}
function titleCase(x) { return x ? x[0].toUpperCase() + x.slice(1).toLowerCase() : ""; }

// ---------------- HTML (low-bandwidth, light theme, tiny) ----------------
function page(title, body, extraHead) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="${THEME}">
<link rel="manifest" href="/manifest.json">
<title>${title}</title>
<style>
body{font-family:system-ui,Arial;margin:0;background:${THEME};color:#1c2b21;}
.wrap{max-width:680px;margin:0 auto;padding:14px;}
h1{font-size:1.25rem;color:${ACCENT};margin:8px 0;}h2{font-size:1.05rem;border-bottom:2px solid ${ACCENT};padding-bottom:4px;}
.card{background:#fff;border:1px solid #d8e0d8;border-radius:10px;padding:12px;margin:10px 0;}
.mono,code{font-family:monospace;font-size:0.85rem;background:#eef4ee;padding:2px 5px;border-radius:4px;}
button{background:${ACCENT};color:#fff;border:0;border-radius:8px;padding:10px 16px;font-size:1rem;cursor:pointer;}
input,select{padding:9px;border:1px solid #b8c4b8;border-radius:8px;font-size:1rem;width:70%;margin:4px 0;}
table{width:100%;border-collapse:collapse;font-size:0.9rem;}td,th{padding:6px;border-bottom:1px solid #e0e8e0;text-align:left;}
.note{font-size:0.8rem;color:#5a6b5f;} .big{font-size:1.4rem;font-weight:bold;color:${ACCENT};}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
</style></head><body><div class="wrap">${body}</div>${extraHead || ""}</body></html>`;
}

function consoleUI() {
  const states = Object.keys(KB).map(s => `<option>${s}</option>`).join("");
  return page("HARZ Farmer Advisory — TerraKit-style demo", `
  <h1>🌽 HARZ Farmer Advisory API</h1>
  <div class="note">A TerraKit-style infrastructure slice built in response to the OpenInfra Africa founding-CTO brief: maize/rice systems, climate data, farmer data, APIs, AI-assisted advisory, low-bandwidth mobile systems.</div>

  <div class="card"><h2>1. Crop advisory</h2>
  <div class="row"><select id="st">${states}</select>
  <select id="cr"><option>maize</option><option>rice</option></select>
  <button onclick="adv()">Advise</button></div>
  <div id="advOut" style="margin-top:8px"></div></div>

  <div class="card"><h2>2. Register a farmer</h2>
  <div class="row"><input id="fn" placeholder="Name"></div>
  <div class="row"><input id="fp" placeholder="Phone (optional)"></div>
  <div class="row"><input id="fs" placeholder="Farm size (ha)"><button onclick="reg()">Register</button></div>
  <div id="regOut" style="margin-top:8px"></div></div>

  <div class="card"><h2>3. Climate summary</h2>
  <div class="row"><select id="stc">${states}</select><button onclick="cli()">Summary</button></div>
  <div id="cliOut" style="margin-top:8px"></div></div>

  <div class="card"><h2>4. WhatsApp/SMS menu flow</h2>
  <div class="note">This state machine is the exact engine a WhatsApp bot bridges to (POST /menu). Try it:</div>
  <div class="row"><input id="mi" placeholder="e.g. 1"><button onclick="menu()">Send</button></div>
  <div class="row"><button onclick="menuReset()">Reset session</button></div>
  <pre id="menuOut" style="white-space:pre-wrap;background:#eef4ee;border-radius:8px;padding:10px;min-height:40px;font-size:0.9rem"></pre></div>

  <div class="card"><h2>API</h2>
  <div class="note">Public JSON (what TerraKit-style infrastructure would expose):</div>
  <p><span class="mono">GET /api/advisory?state=Kebbi&amp;crop=rice</span></p>
  <p><span class="mono">GET /api/climate?state=Benue</span></p>
  <p><span class="mono">POST /api/farmers {name,phone,state,crop,farm_ha}</span></p>
  <p><span class="mono">GET /api/farmers</span></p>
  <p><span class="mono">POST /menu {session,input}</span></p>
  <p><span class="mono">GET /api/stats</span> — dashboard feed</p>
  <p><a href="/dashboard">Open dashboard →</a></p></div>

  <div class="note">Honest limits: demo knowledge base from published Nigerian agro-climatology (simplified); production swaps in live CHIRPS/TAMSAT rainfall, station data, model outputs. No real alerts are sent. Instance data: this demo's own registrations and query ledger.</div>
  <script>
  const $=i=>document.getElementById(i);
  async function j(u,o){const r=await fetch(u,o);return r.json();}
  async function adv(){const a=await j('/api/advisory?state='+encodeURIComponent($('st').value)+'&crop='+$('cr').value);
    $('advOut').innerHTML=a.error?a.error:'<b>'+a.state+' '+a.crop+'</b> ('+a.zone+')<br>Planting: '+a.planting_windows.map(w=>w.window+' <i>['+w.status+']</i>').join(' | ')+'<br>Varieties: '+a.recommended_varieties+'<br><b>'+a.status_summary+'</b><br>Tip: '+(a.practice_tips[0]||'')+'<br><span class=note>'+a.knowledge+'</span>';}
  async function reg(){const b={name:$('fn').value,phone:$('fp').value,state:$('st').value,crop:$('cr').value,farm_ha:parseFloat($('fs').value)};
    if(!b.name||!(b.farm_ha>0)){$('regOut').textContent='Enter name and farm size.';return;}
    const a=await j('/api/farmers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
    $('regOut').textContent=a.error?a.error:'Registered: '+(a.farmer.farmer_id)+' — '+(a.count)+' farmers in this demo instance.';}
  async function cli(){const a=await j('/api/climate?state='+encodeURIComponent($('stc').value));
    $('cliOut').innerHTML=a.error?a.error:'<b>'+a.state+'</b> ('+a.zone+') — rainfall '+a.annual_rainfall_mm.join('–')+' mm/yr, onset '+a.typical_onset+', season '+a.growing_season_days.join('–')+' days.<br>Risk: '+a.climate_risk;}
  const SID='web-demo';
  async function menu(){$('menuOut').textContent='...';
    const a=await j('/menu',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:SID,input:$('mi').value})});
    $('menuOut').textContent=a.text||JSON.stringify(a);}
  async function menuReset(){await j('/menu',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:SID,input:'0'})});$('menuOut').textContent='Session reset. Send 1 to start.';}
  menuReset();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');
  </script>`);
}

function dashboardUI() {
  return page("HARZ Farmer Advisory — dashboard", `
  <h1>📊 Farmer Data Dashboard</h1>
  <div class="note">Live from this demo instance's D1 database (registrations + advisory query ledger). Auto-refreshes.</div>
  <div class="card"><div class="row">
    <div>Registered farmers<div class="big" id="nf">–</div></div>
    <div>Advisory queries<div class="big" id="nq">–</div></div>
    <div>States touched<div class="big" id="ns">–</div></div>
  </div></div>
  <div class="card"><h2>Maize vs Rice (advisory queries)</h2><div id="crops">–</div></div>
  <div class="card"><h2>Top states (farmers)</h2><div id="byst">–</div></div>
  <div class="card"><h2>Recent farmers</h2><table id="rf"><tr><td>loading…</td></tr></table></div>
  <div class="card"><h2>Recent advisory queries</h2><table id="rq"><tr><td>loading…</td></tr></table></div>
  <p><a href="/">← console</a></p>
  <script>
  const $=i=>document.getElementById(i);
  async function load(){const s=await fetch('/api/stats').then(r=>r.json());
    $('nf').textContent=s.farmers.total; $('nq').textContent=s.queries.total; $('ns').textContent=s.farmers.by_state.length;
    $('crops').innerHTML='<table><tr><th>Crop</th><th>Queries</th></tr>'+s.queries.by_crop.map(x=>'<tr><td>'+(x.crop||'?')+'</td><td>'+x.n+'</td></tr>').join('')+'</table>';
    $('byst').innerHTML='<table><tr><th>State</th><th>Farmers</th><th>Hectares</th></tr>'+s.farmers.by_state.map(x=>'<tr><td>'+x.state+'</td><td>'+x.n+'</td><td>'+x.ha+'</td></tr>').join('')+'</table>';
    $('rf').innerHTML='<tr><th>ID</th><th>Name</th><th>State</th><th>Crop</th><th>Ha</th></tr>'+s.farmers.recent.map(f=>'<tr><td>'+f.farmer_id+'</td><td>'+f.name+'</td><td>'+f.state+'</td><td>'+f.crop+'</td><td>'+f.farm_ha+'</td></tr>').join('');
    $('rq').innerHTML='<tr><th>Kind</th><th>State</th><th>Crop</th><th>When</th></tr>'+s.queries.recent.map(q=>'<tr><td>'+q.kind+'</td><td>'+(q.state||'')+'</td><td>'+(q.crop||'')+'</td><td>'+q.created.slice(0,16).replace('T',' ')+'</td></tr>').join('');}
  load(); setInterval(load, 15000);
  </script>`);
}

// ---------------- WORKER ----------------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const json = (obj, code) => new Response(JSON.stringify(obj, null, 1), { status: code || 200, headers: { "Content-Type": "application/json", ...cors } });
    const p = url.pathname;

    if (p === "/health") return json({ status: "healthy", service: "harz-terrakit-demo", version: "1.0.0", kb_states: Object.keys(KB).length, time: new Date().toISOString() });
    if (p === "/manifest.json") return json({ name: "HARZ Farmer Advisory (TerraKit demo)", short_name: "FarmAdvise", start_url: "/", display: "standalone", background_color: THEME, theme_color: THEME, description: "Maize/rice farmer advisory API + low-bandwidth console — TerraKit-style demo", icons: [] });
    if (p === "/sw.js") return new Response(
      "self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open('tk-v1').then(c=>c.addAll(['/','/manifest.json'])))});self.addEventListener('activate',e=>e.waitUntil(clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cl=res.clone();caches.open('tk-v1').then(c=>c.put(e.request,cl));return res}).catch(()=>caches.match('/'))))});",
      { headers: { "Content-Type": "application/javascript", "Cache-Control": "no-cache", ...cors } });

    if (p === "/" && request.method === "GET") return new Response(consoleUI(), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    if (p === "/dashboard" && request.method === "GET") return new Response(dashboardUI(), { headers: { "Content-Type": "text/html; charset=utf-8" } });

    try {
      // public advisory API
      if (p === "/api/advisory") {
        const state = titleCase(url.searchParams.get("state") || "");
        const crop = (url.searchParams.get("crop") || "maize").toLowerCase();
        if (!KB[state]) return json({ error: "Unknown state. Try one of: " + Object.keys(KB).slice(0, 8).join(", ") + "…", states: Object.keys(KB) }, 400);
        if (crop !== "maize" && crop !== "rice") return json({ error: "crop must be maize or rice" }, 400);
        const a = advisoryFor(state, crop, url.searchParams.get("today"));
        await env.TK_DB.prepare("INSERT INTO queries (kind, state, crop, source, created) VALUES ('advisory', ?, ?, 'api', ?)").bind(state, crop, new Date().toISOString()).run();
        return json(a);
      }
      if (p === "/api/climate") {
        const state = titleCase(url.searchParams.get("state") || "");
        const s = KB[state];
        if (!s) return json({ error: "Unknown state" }, 400);
        await env.TK_DB.prepare("INSERT INTO queries (kind, state, crop, source, created) VALUES ('climate', ?, NULL, 'api', ?)").bind(state, new Date().toISOString()).run();
        return json({ state, zone: s.zone, annual_rainfall_mm: s.rainfall_mm, typical_onset: s.onset, growing_season_days: s.season_days, climate_risk: s.risk, irrigation: s.irrigation || null, knowledge: "demo-kb-v1" });
      }
      if (p === "/api/farmers" && request.method === "POST") {
        const b = await request.json();
        const name = (b.name || "").trim(), state = titleCase(b.state || ""), crop = (b.crop || "maize").toLowerCase();
        const ha = parseFloat(b.farm_ha);
        if (!name) return json({ error: "name required" }, 400);
        if (!KB[state]) return json({ error: "unknown state" }, 400);
        if (!(ha > 0)) return json({ error: "farm_ha must be > 0" }, 400);
        const id = "FRM-" + Date.now().toString(36).toUpperCase();
        await env.TK_DB.prepare("INSERT INTO farmers (farmer_id, name, phone, state, crop, farm_ha, source, created) VALUES (?, ?, ?, ?, ?, ?, 'api', ?)")
          .bind(id, name, b.phone || null, state, crop, ha, new Date().toISOString()).run();
        const n = await env.TK_DB.prepare("SELECT COUNT(*) AS n FROM farmers").first();
        return json({ ok: true, farmer: { farmer_id: id, name, state, crop, farm_ha: ha }, count: n.n });
      }
      if (p === "/api/farmers" && request.method === "GET") {
        const st = url.searchParams.get("state");
        const rows = st
          ? await env.TK_DB.prepare("SELECT farmer_id, name, state, crop, farm_ha, source, created FROM farmers WHERE state = ? ORDER BY created DESC LIMIT 50").bind(titleCase(st)).all()
          : await env.TK_DB.prepare("SELECT farmer_id, name, state, crop, farm_ha, source, created FROM farmers ORDER BY created DESC LIMIT 50").all();
        return json({ farmers: rows.results, note: "demo instance data (real registrations made through this demo's own API/menu)" });
      }
      if (p === "/api/stats") {
        const fT = await env.TK_DB.prepare("SELECT COUNT(*) AS n FROM farmers").first();
        const qT = await env.TK_DB.prepare("SELECT COUNT(*) AS n FROM queries").first();
        const byState = await env.TK_DB.prepare("SELECT state, COUNT(*) AS n, SUM(farm_ha) AS ha FROM farmers GROUP BY state ORDER BY n DESC LIMIT 12").all();
        const byCrop = await env.TK_DB.prepare("SELECT crop, COUNT(*) AS n FROM queries WHERE crop IS NOT NULL GROUP BY crop ORDER BY n DESC").all();
        const rf = await env.TK_DB.prepare("SELECT farmer_id, name, state, crop, farm_ha FROM farmers ORDER BY created DESC LIMIT 10").all();
        const rq = await env.TK_DB.prepare("SELECT kind, state, crop, created FROM queries ORDER BY created DESC LIMIT 10").all();
        return json({ farmers: { total: fT.n, by_state: byState.results, recent: rf.results }, queries: { total: qT.n, by_crop: byCrop.results, recent: rq.results } });
      }
      if (p === "/menu" && request.method === "POST") {
        const b = await request.json();
        if (!b.session || typeof b.input === "undefined") return json({ error: "session and input required" }, 400);
        const out = await menuStep(env, String(b.session).slice(0, 64), String(b.input).slice(0, 200));
        return json(out);
      }
      return new Response("Not found", { status: 404, headers: cors });
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
};

export async function init(env) { // called manually once to create tables on a fresh D1
  await env.TK_DB.batch([
    env.TK_DB.prepare("CREATE TABLE IF NOT EXISTS farmers (id INTEGER PRIMARY KEY AUTOINCREMENT, farmer_id TEXT UNIQUE, name TEXT, phone TEXT, state TEXT, crop TEXT, farm_ha REAL, source TEXT, created TEXT)"),
    env.TK_DB.prepare("CREATE TABLE IF NOT EXISTS queries (id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT, state TEXT, crop TEXT, source TEXT, created TEXT)"),
    env.TK_DB.prepare("CREATE TABLE IF NOT EXISTS menu_sessions (session_id TEXT PRIMARY KEY, state TEXT, updated TEXT)")
  ]);
  return "tables ready";
}
