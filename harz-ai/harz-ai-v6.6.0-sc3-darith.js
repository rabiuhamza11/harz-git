var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ---- P4 (Dad's GO, Oct 11, 2026): C-1 trusted ecosystem-source gate ----
// Explicit allowlist: exact hosts + Cloudflare account suffix boundaries.
// workers.dev subdomains are globally unique per account, so a suffix IS an
// account identity. Deliberately NOT a "contains harz" substring match.
var TRUSTED_EXACT = [
  "rabiuhamza11.github.io",
  "harz-cloud-backend.onrender.com"
];
var TRUSTED_SUFFIXES = [
  ".harz.workers.dev",
  ".hamzarabiu390.workers.dev",
  ".harzco-business.workers.dev"
];
function isTrustedEvidence(url2) {
  try {
    var u = new URL(String(url2)), h = u.hostname.toLowerCase();
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (TRUSTED_EXACT.indexOf(h) !== -1) return true;
    for (var i = 0; i < TRUSTED_SUFFIXES.length; i++) {
      if (h.slice(-(TRUSTED_SUFFIXES[i].length)) === TRUSTED_SUFFIXES[i]) return true;
    }
    return false;
  } catch (e) { return false; }
}
// ---- end P4 trust gate ----

// harz-ai-v660.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });
}
__name(json, "json");
function html(content) {
  return new Response(content, { headers: { "Content-Type": "text/html", ...CORS } });
}
__name(html, "html");
var HAUSA_KB = {
  greetings: {
    "sannu": "Barka! Yaya lafiya? Ni Harz AI ne. Zan iya taimaka maka da komai.",
    "barka": "Barka dai! Me zan yi maka?",
    "good morning": "Barka da safiya! Ina fatan alheri ya taba ka.",
    "good afternoon": "Barka da rana!",
    "good evening": "Barka da yamma!",
    "good night": "Barka da dare! Ka yi mini lafiya."
  },
  translations: { "welcome": "Barka da zuwa", "hello": "Sannu", "thank you": "Na gode", "yes": "Eh", "no": "A'a", "please": "Don Allah", "money": "Kudi", "market": "Kasuwa", "price": "Farashi", "buy": "Sayi", "sell": "Sayar", "profit": "Riba", "customer": "Maya\u0199aci", "food": "Abinci", "water": "Ruwa", "house": "Gida", "car": "Mota", "phone": "Wayo", "friend": "aboki", "work": "Aiki", "health": "Lafiya", "school": "Makaranta", "book": "Littafi" },
  business: {
    "business plan": "Ga tsarin kasuwa:\n1. Bayanin kasuwa: Me kake sayarwa?\n2. Binciken masu fafatawa\n3. Tsadar kudi: Nawa za ka bukata?\n4. Hanyar talla\n5. Tsinkayar riba",
    "kasuwa": "Don fara kasuwa:\n1. Gano bukatar mutane\n2. Binciko farashi\n3. Fara da karami\n4. Talla da intanet\n5. Kyakkyawan mai yakiti",
    "riba": "Ribar kasuwa:\n1. Sayi arha, sayar da tsada\n2. Lissafin sufuri\n3. Kudin aiki\n4. Adana kudin kasuwa",
    "talla": "Talla kyauta:\n1. WhatsApp Status\n2. Facebook Page\n3. Instagram Reels\n4. TikTok\n5. Word of mouth"
  },
  writing: {
    "promo": "SPECIAL OFFER!\nKayan: [kayan]\nFarashi: [naira]\nInganci: 100%\nWhatsApp: [lambar]",
    "wasi\u0199a": "Girmamawar [Suna],\nIna rinjayar ku game da [abu].\nGirmamawa,\n[Suna]"
  },
  code: {
    "html": "HTML tushen website ne. Tags: <html>, <head>, <body> don gina shafi.",
    "css": "CSS don kayataccen shafi - launi, girma, tsari.",
    "javascript": "JavaScript don sa shafi ya yi aiki - button, form, animation."
  },
  general: {
    "help": "Ina iya taimaka da: kasuwa, rubutu, code, fassara, image, video, PDF, weather, deploy!",
    "thank": "Na gode! Ina nan kullum.",
    "who": "Ni Harz AI ne - AI na farko da ke magana da Hausa. An gina ni da Nemotron da horarwa akan Hausa."
  }
};
function getHausaResponse(input) {
  const text = (input || "").toLowerCase().trim();
  if (!text) return "Ina nan. Me kake so?";
  for (const [k, v] of Object.entries(HAUSA_KB.greetings)) if (text.includes(k)) return v;
  if (text.includes("fassara") || text.includes("translate")) {
    const words = text.split(/[:\s]+/).slice(1).filter((w) => w.length > 0);
    let r = "Ga fassara:\n", f = false;
    for (const w of words.map((w2) => w2.toLowerCase().replace(/[.,!?]/g, ""))) if (HAUSA_KB.translations[w]) {
      r += w + " = " + HAUSA_KB.translations[w] + "\n";
      f = true;
    }
    return f ? r : "Ka rubuta kalmar. Misali: Fassara: welcome";
  }
  for (const cat of ["business", "writing", "code", "general"]) for (const [k, v] of Object.entries(HAUSA_KB[cat])) if (text.includes(k)) return v;
  if (text.includes("?")) return "Ina iya taimaka da kasuwa, rubutu, code, fassara, image, weather, deploy. Ka sake tambaya.";
  return "Na ji ka. Ina iya taimaka da kasuwa, rubutu, code, fassara, image, weather, da deploy. Me kake so?";
}
__name(getHausaResponse, "getHausaResponse");
function detectReplyLanguage(msg) {  // P2 (Dad's Go, Oct 11 2026): deterministic reply-language detection. Overrides first, then dominant-language scoring. Unit-tested 13/13 locally.
  var m = (msg || "").toLowerCase();
  if (m.match(/\b(?:answer|reply|respond|write|talk|speak)\s+(?:da\s+|in\s+|with\s+)?hausa\b/) || m.match(/\bamsa\s+da\s+hausa\b/)) return "ha";
  if (m.match(/\b(?:answer|reply|respond|write|talk|speak)\s+(?:in\s+|with\s+|using\s+)?english\b/) || m.match(/\bamsa\s+da\s+turanci\b/) || m.match(/\bin\s+english\b/)) return "en";
  var words = m.replace(/[^a-z\s']/g, " ").split(/\s+/).filter(Boolean);
  var HA = {"sannu":1,"zuwa":1,"lafiya":1,"gode":1,"madalla":1,"yaya":1,"meyaya":1,"domin":1,"idan":1,"sai":1,"kuma":1,"yadda":1,"wanda":1,"wanene":1,"gare":1,"gida":1,"rana":1,"dare":1,"kudi":1,"aiki":1,"gona":1,"kana":1,"kake":1,"kuke":1,"kuna":1,"take":1,"tana":1,"suna":1,"zan":1,"zai":1,"za":1,"haka":1,"toh":1,"walahi":1,"wannan":1,"wancan":1,"duka":1,"komai":1,"amsa":1,"tambaya":1,"harshe":1,"turanci":1,"hausa":1,"kasa":1,"jihar":1,"dafa":1,"wake":1,"shinkafa":1,"gyada":1,"cikin":1,"daga":1,"wajen":1,"lokaci":1,"yau":1,"gobe":1,"jiya":1,"kaza":1,"shanu":1,"akuya":1,"kifi":1,"ruwa":1,"wuta":1,"iska":1,"da":1,"ne":1,"ka":1,"ki":1,"na":1,"ba":1,"ga":1,"ke":1,"ya":1,"ta":1,"mun":1,"sun":1,"ko":1,"muke":1,"muka":1,"ake":1,"ji":1,"jin":1,"yunwa":1,"dake":1,"maganar":1,"magana":1};
  var EN = {"the":1,"is":1,"are":1,"was":1,"were":1,"what":1,"when":1,"where":1,"why":1,"how":1,"who":1,"whom":1,"which":1,"you":1,"your":1,"my":1,"we":1,"they":1,"this":1,"that":1,"these":1,"those":1,"of":1,"to":1,"for":1,"and":1,"or":1,"but":1,"do":1,"does":1,"did":1,"can":1,"could":1,"will":1,"would":1,"please":1,"tell":1,"about":1,"want":1,"know":1,"need":1,"get":1,"have":1,"has":1,"it":1,"he":1,"she":1,"there":1,"here":1,"best":1,"good":1,"time":1,"account":1,"number":1,"bank":1,"transfer":1,"wallet":1,"price":1,"phone":1,"school":1,"farm":1,"money":1,"president":1,"capital":1,"lightning":1,"thunder":1,"hear":1,"see":1,"before":1,"after":1,"build":1,"make":1,"create":1,"i":1};
  var ha = 0, en = 0, i;
  for (i = 0; i < words.length; i++) {
    var w = words[i];
    if (HA[w]) ha++; else if (EN[w]) en++;
  }
  if (m.match(/\bme\s+(ya|ake|ke|yake)\b/)) ha += 3;
  return ha > en ? "ha" : "en";
}

async function chatAI(message, history = [], env2) {
  const harzLang = detectReplyLanguage(message);
  const systemPrompt = "Kai Harz AI ne, AI na farko da ke magana da Hausa. Ka yi amsa da Hausa idan aka tambaye da Hausa, kuma da Turanci idan aka tambaye da Turanci. Ka kasance mai gaskiya, ta\u0199aitaccen, kuma mai amfani." + (harzLang === "ha" ? " | HARSHE: Ka amsa da Hausa KAWAI a wannan sako." : " | LANGUAGE: Reply to this message in English ONLY.");;
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message }
  ];
  if (env2 && env2.AI) {
    try {
      const result2 = await env2.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages, max_tokens: 600 });
      if (result2 && result2.response) return result2.response;
    } catch (err) {
    }
  }
  try {
    const GROQ_KEY = env2 && env2.GROQ_KEY || "";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: "llama-3.1-8b-instant", messages, max_tokens: 500, temperature: 0.7 })
    });
    if (!res.ok) throw new Error("Groq API error: " + res.status);
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    return getHausaResponse(message);
  }
}
__name(chatAI, "chatAI");
async function codeAI(prompt, env2) {
  const messages = [
    { role: "system", content: "You are Harz AI Code Assistant. Write clean, working code with brief explanations. Support HTML, CSS, JavaScript, Python." },
    { role: "user", content: prompt }
  ];
  if (env2 && env2.AI) {
    try {
      const result2 = await env2.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages, max_tokens: 1e3 });
      if (result2 && result2.response) return result2.response;
    } catch (err) {
    }
  }
  try {
    const GROQ_KEY = env2 && env2.GROQ_KEY || "";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: "llama-3.1-8b-instant", messages, max_tokens: 1e3, temperature: 0.3 })
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    return "Ba zan iya rubuta code a yanzu ba. Ka gwada again.\n\n" + getHausaResponse(prompt);
  }
}
__name(codeAI, "codeAI");
async function generateImage(prompt) {
  const encoded = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&model=flux`;
  return { success: true, image_url: imageUrl };
}
__name(generateImage, "generateImage");
async function visionAI(image, question, env2) {
  const prompt = question || "Describe this image in detail. If text is visible, read it.";
  if (!image) return { success: false, error: "No image provided" };
  let dataUrl = image;
  let imageBase64 = image;
  if (image.startsWith("data:")) {
    imageBase64 = image.split(",")[1];
  } else {
    dataUrl = "data:image/jpeg;base64," + image;
  }
  if (env2 && env2.AI) {
    try {
      const result2 = await env2.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }
        ],
        max_tokens: 400
      });
      if (result2 && result2.response) return { success: true, response: result2.response };
    } catch (err) {
    }
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          { role: "user", content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } }
          ] }
        ],
        max_tokens: 400
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.choices && data.choices[0]) return { success: true, response: data.choices[0].message.content };
    }
  } catch (err) {
  }
  return { success: true, response: "Na karbi hotonka. Ba zan iya nazarin hoton a yanzu ba. Ka sake gwada." };
}
__name(visionAI, "visionAI");
async function mathAI(expression, env) {
  try {
    const cleaned = expression.replace(/[^0-9+\-*/().%\s]/g, "");
    if (!cleaned) return { success: false, error: "Ka rubuta lissaki mai kyau." };
    const result = eval(cleaned);
    return { success: true, response: `${expression} = ${result}` };
  } catch (err) {
    const mathMessages = [{ role: "user", content: `Solve this math problem and explain briefly: ${expression}` }];
    if (env && env.AI) {
      try {
        const result2 = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages: mathMessages, max_tokens: 300 });
        if (result2 && result2.response) return { success: true, response: result2.response };
      } catch (e) {
      }
    }
    try {
      const GROQ_KEY = env && env.GROQ_KEY || "";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: mathMessages, max_tokens: 300, temperature: 0.1 })
      });
      const data = await res.json();
      return { success: true, response: data.choices[0].message.content };
    } catch (e) {
      return { success: false, error: "Ba zan iya warware lissakin ba." };
    }
  }
}
__name(mathAI, "mathAI");
async function getWeather(city) {
  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { headers: { "User-Agent": "HarzAI/6.5" } });
    if (!res.ok) throw new Error("Weather API error");
    const data = await res.json();
    const c = data.current_condition[0];
    return {
      success: true,
      report: {
        city: data.nearest_area[0].areaName[0].value,
        country: data.nearest_area[0].country[0].value,
        temp_c: parseInt(c.temp_C),
        temp_f: parseInt(c.temp_F),
        condition: c.weatherDesc[0].value,
        humidity: c.humidity,
        wind_kph: c.windspeedKmph
      }
    };
  } catch (err) {
    return { success: false, error: "Ba zan iya samun bayanan yanayi ba: " + err.message };
  }
}
__name(getWeather, "getWeather");
async function fetchURL(targetUrl) {
  try {
    const res = await fetch(targetUrl, {
      headers: { "User-Agent": "HarzAI/6.5" },
      signal: AbortSignal.timeout(1e4)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const stripped = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    return {
      success: true,
      title: titleMatch ? titleMatch[1].trim() : "",
      content: stripped.substring(0, 5e3),
      url: targetUrl
    };
  } catch (err) {
    return { success: false, error: "Ba zan iya kaiwa URL ba: " + err.message };
  }
}
__name(fetchURL, "fetchURL");
async function handleShare(request, env2, method) {
  if (method === "POST") {
    try {
      const body = await request.json();
      if (!body.messages || !Array.isArray(body.messages)) {
        return json({ success: false, error: "messages array required" }, 400);
      }
      const shareId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      if (env2.HARZ_KV) {
        await env2.HARZ_KV.put(`share:${shareId}`, JSON.stringify({
          messages: body.messages,
          title: body.title || "Shared Chat",
          created: (/* @__PURE__ */ new Date()).toISOString()
        }), { expirationTtl: 2592e3 });
        return json({ success: true, shareId, url: `https://harz-ai.harz.workers.dev/share/${shareId}` });
      } else {
        const encoded = btoa(encodeURIComponent(JSON.stringify(body.messages)));
        return json({ success: true, shareId: encoded.substring(0, 20), url: `https://harz-ai.harz.workers.dev/share?d=${encoded}` });
      }
    } catch (err) {
      return json({ success: false, error: err.message }, 500);
    }
  }
  if (method === "GET") {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length > 1 && pathParts[1]) {
      const shareId = pathParts[1];
      if (env2.HARZ_KV) {
        const data = await env2.HARZ_KV.get(`share:${shareId}`);
        if (data) {
          const parsed = JSON.parse(data);
          return html(renderSharedChat(parsed));
        }
      }
      return json({ success: false, error: "Share not found or expired" }, 404);
    }
    if (url.searchParams.get("d")) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(url.searchParams.get("d"))));
        return html(renderSharedChat({ messages: decoded, title: "Shared Chat" }));
      } catch (e) {
        return json({ success: false, error: "Invalid share data" }, 400);
      }
    }
    return json({
      success: true,
      info: "Share endpoint - POST to save, GET /share/:id to retrieve",
      usage: {
        save: "POST /share with { messages: [...], title: '...' }",
        retrieve: "GET /share/:id"
      }
    });
  }
}
__name(handleShare, "handleShare");
function renderSharedChat(data) {
  const messages = data.messages || [];
  const title = data.title || "Shared Chat";
  let msgsHtml = "";
  for (const m of messages) {
    const isUser = m.role === "user";
    msgsHtml += `<div class="msg ${isUser ? "user" : "ai"}">${escapeHtml(m.content || "").replace(/\n/g, "<br>")}</div>`;
  }
  return `<!DOCTYPE html>
<html lang="en">
<head><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} - HARZ AI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#e0e0e0;font-family:system-ui,sans-serif;min-height:100dvh}
.header{background:#14141c;padding:12px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #333;position:sticky;top:0;z-index:10}
.logo{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#e94560,#c9263c);display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff}
.header h1{font-size:15px;color:#fff}
.header span{font-size:11px;color:#666;margin-left:auto}
.chat{max-width:700px;margin:0 auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:15px;line-height:1.5;word-wrap:break-word}
.msg.user{background:#1a4a6a;align-self:flex-end}
.msg.ai{background:#1e1e2d;align-self:flex-start;border:1px solid #333}
.footer{text-align:center;padding:20px;color:#444;font-size:12px}
a{color:#e94560}
</style>
</head>
<body>
<div class="header">
<div class="logo">H</div>
<h1>${escapeHtml(title)}</h1>
<span>Shared via HARZ AI</span>
</div>
<div class="chat">${msgsHtml}</div>
<div class="footer">Powered by HARZ AI v6.6 - <a href="https://harz-cloud.pages.dev/harz-ai-chat">Open HARZ AI</a></div>
<div id="hznet" style="position:fixed;bottom:0;left:0;right:0;text-align:center;font-size:11px;padding:4px;background:#eef2f0;color:#334;z-index:99">● ONLINE · LIVE</div><script>(function(){if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").then(function(r){r.update();}).catch(function(){});var e=document.getElementById("hznet");function u(){var o=navigator.onLine;e.textContent=o?"\u25cf ONLINE \u00b7 LIVE":"\u25cf OFFLINE \u00b7 LOCAL SHELL + BRAIN";e.style.background=o?"#eef2f0":"#fdeecd"}u();addEventListener("online",u);addEventListener("offline",u)})();</script></body>
</html>`;
}
__name(renderSharedChat, "renderSharedChat");
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
__name(escapeHtml, "escapeHtml");
function renderApp() {
  return `<!DOCTYPE html>
<html lang="en">
<head><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>HARZ AI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f0f2f5;color:#1a1a1a;font-family:system-ui,sans-serif;height:100dvh;overflow:hidden;display:flex;flex-direction:column}
.header{background:#ffffff;padding:8px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #d9dde3;flex-shrink:0}
.logo{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#e94560,#c9263c);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;color:#fff}
.header h1{font-size:14px;color:#1a1a1a}.header span{font-size:9px;color:#6b7280;margin-left:auto}
.tools{display:flex;gap:4px;padding:6px 8px;overflow-x:auto;background:#ffffff;border-bottom:1px solid #e3e6ea;flex-shrink:0}
.tools button{background:#eef0f4;border:1px solid #d0d5dd;color:#374151;border-radius:16px;padding:4px 10px;font-size:11px;white-space:nowrap;cursor:pointer}
.tools button.active{background:#e94560;color:#fff;border-color:#e94560}
#chat{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;padding-bottom:80px}
.msg{max-width:85%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.5;word-wrap:break-word}
.msg.user{background:#2563eb;color:#fff;align-self:flex-end}
.msg.ai{background:#ffffff;color:#1a1a1a;align-self:flex-start;border:1px solid #d9dde3}
.msg img{max-width:100%;border-radius:8px;margin-top:4px}
.typing{align-self:flex-start;color:#6b7280;font-size:13px;padding:8px 12px}
.preview{align-self:flex-end;padding:4px}.preview img{max-width:120px;border-radius:8px}
.input-area{position:fixed;bottom:0;left:0;right:0;background:#ffffff;border-top:1px solid #d9dde3;padding:6px 8px;z-index:9999}
.input-row{display:flex;gap:4px;align-items:flex-end}
.icon-btn{width:36px;height:36px;border-radius:50%;background:#eef0f4;border:1px solid #d0d5dd;color:#e94560;font-size:16px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.icon-btn:active{background:#e94560;color:#fff}
#input{flex:1;background:#ffffff;border:1px solid #c5cad3;border-radius:8px;padding:8px;color:#1a1a1a;font-size:14px;resize:none;max-height:100px;min-height:36px;font-family:inherit}
.send-btn{width:36px;height:36px;border-radius:50%;background:#e94560;border:none;color:#fff;font-size:16px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.send-btn:disabled{opacity:.4}
.info{font-size:8px;color:#6b7280;text-align:center;padding:1px}
#fileInput{display:none}#cameraInput{display:none}
.recording{background:#ff4444!important;color:#fff!important;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.share-btn{background:#eef0f4;border:1px solid #d0d5dd;color:#e94560;padding:4px 10px;border-radius:16px;font-size:11px;cursor:pointer;margin-left:4px}
</style>
</head>
<body>
<div class="header">
<div class="logo">H</div>
<h1>HARZ AI v6.6</h1>
<span>27 Lang + Share</span>
<button class="share-btn" onclick="shareChat()">Share</button>
</div>
<div class="tools">
<button class="active" onclick="setMode(this,'chat')">Chat</button>
<button onclick="setMode(this,'image')">Image</button>
<button onclick="setMode(this,'vision')">Vision</button>
<button onclick="setMode(this,'code')">Code</button>
<button onclick="setMode(this,'math')">Math</button>
<button onclick="setMode(this,'weather')">Weather</button>
<button onclick="kpBtn()" style="color:#7c3aed">Knowledge</button>
<button onclick="clearChat()" style="color:#b91c1c">Clear</button>
</div>
<div id="chat"><div class="msg ai">Sannu! Ni HARZ AI v6.6. Tambaya ni komai a Hausa, Turanci, ko Pidgin. Kayi amfani da Share button don raba hira!</div></div>
<div class="input-area">
<div class="info">HARZ AI v6.6 - FREE + Local Brain</div>
<div class="input-row">
<button class="icon-btn" id="micBtn" onclick="toggleMic()">&#127908;</button>
<button class="icon-btn" onclick="document.getElementById('fileInput').click()">&#128206;</button>
<button class="icon-btn" onclick="document.getElementById('cameraInput').click()">&#128247;</button>
<textarea id="input" rows="1" placeholder="Type your message..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();send()}"></textarea>
<button class="send-btn" id="sendBtn" onclick="send()">&#9658;</button>
</div>
</div>
<input type="file" id="fileInput" accept="image/*" onchange="handleFile(this)">
<input type="file" id="cameraInput" accept="image/*" capture="environment" onchange="handleFile(this)">
<script>
var A=location.origin;var mode='chat';var visionImage=null;var chatHistory=[];
try{var _sv=JSON.parse(localStorage.getItem('hzai_chat_v1')||'[]');if(Array.isArray(_sv)&&_sv.length){var _ch=document.getElementById('chat');while(_ch.firstChild)_ch.removeChild(_ch.firstChild);_sv.forEach(function(m){var d=document.createElement('div');d.className='msg '+m.c;d.innerHTML=m.t;_ch.appendChild(d);});var _ls=_ch.lastChild;if(_ls)_ls.scrollIntoView();}}catch(e){}
try{var _hc=JSON.parse(localStorage.getItem('hzai_ctx_v1')||'[]');if(Array.isArray(_hc))chatHistory=_hc.slice(-60);}catch(e){}
function saveMsg(t,c){if(c!=='user'&&c!=='ai')return;try{var a=JSON.parse(localStorage.getItem('hzai_chat_v1')||'[]');a.push({t:(t&&t.indexOf&&t.indexOf('data:')>-1)?'[image]':t,c:c});if(a.length>300)a=a.slice(-300);localStorage.setItem('hzai_chat_v1',JSON.stringify(a));}catch(e){}}
function saveHist(){try{localStorage.setItem('hzai_ctx_v1',JSON.stringify(chatHistory.slice(-60)));}catch(e){}}
function clearChat(){try{localStorage.removeItem('hzai_chat_v1');localStorage.removeItem('hzai_ctx_v1');}catch(e){}location.reload();};var mediaRecorder=null;var audioChunks=[];var isRecording=false;
function setMode(btn,m){mode=m;visionImage=null;document.querySelectorAll('.tools button').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');var inp=document.getElementById('input');var placeholders={chat:'Type your message...',image:'Describe image to generate...',vision:'Ask about your image...',weather:'Enter city name...',code:'Describe code to write...',math:'Enter math problem...'};inp.placeholder=placeholders[m]||'Type...';}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function addMsg(t,c){var d=document.createElement('div');d.className='msg '+c;d.innerHTML=t;document.getElementById('chat').appendChild(d);d.scrollIntoView();saveMsg(t,c);}
function handleFile(input){var file=input.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){visionImage=e.target.result;var prev=document.createElement('div');prev.className='preview';prev.innerHTML='<img src="'+visionImage+'">';document.getElementById('chat').appendChild(prev);document.getElementById('chat').scrollTop=99999;if(mode!=='vision'){document.querySelectorAll('.tools button').forEach(function(b){b.classList.remove('active')});document.querySelectorAll('.tools button')[2].classList.add('active');mode='vision';}document.getElementById('input').placeholder='Ask about this image...';document.getElementById('input').focus();};reader.readAsDataURL(file);input.value='';}
function toggleMic(){if(isRecording){mediaRecorder.stop();isRecording=false;document.getElementById('micBtn').classList.remove('recording');return;}if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==='undefined'){addMsg('This browser does not support voice recording. Try Chrome.','ai');return;}navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){audioChunks=[];var mt='';try{['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].some(function(t){if(MediaRecorder.isTypeSupported(t)){mt=t;return true;}return false;});}catch(x){}mediaRecorder=mt?new MediaRecorder(stream,{mimeType:mt}):new MediaRecorder(stream);mediaRecorder.ondataavailable=function(e){audioChunks.push(e.data);};mediaRecorder.onstop=function(){var blob=new Blob(audioChunks,{type:(mediaRecorder&&mediaRecorder.mimeType)||'audio/webm'});if(!blob.size){addMsg('No audio was captured. Please try again.','ai');return;}sendAudio(blob);stream.getTracks().forEach(function(t){t.stop();});};mediaRecorder.start();isRecording=true;document.getElementById('micBtn').classList.add('recording');addMsg('Recording... Tap mic to stop.','ai');}).catch(function(e){var n=(e&&e.name)||'';var why=n==='NotAllowedError'?'Microphone permission was blocked. Tap the lock icon in the address bar, allow Microphone for this site, then try again.':n==='NotFoundError'?'No microphone was found on this device.':n==='NotReadableError'?'The microphone is busy in another app. Close it and try again.':(window.isSecureContext===false?'Microphone needs a secure (https) page.':'Microphone could not start ('+(n||'unknown')+').');addMsg(why,'ai');});}
function sendAudio(blob){var tp=document.createElement('div');tp.className='typing';tp.textContent='Transcribing...';document.getElementById('chat').appendChild(tp);var form=new FormData();form.append('file',blob,'audio.webm');form.append('model','whisper-large-v3-turbo');form.append('language','en');fetch('/transcribe',{method:'POST',body:form}).then(function(r){return r.json();}).then(function(d){tp.remove();if(d.text){addMsg(esc(d.text),'user');sendText(d.text);}else{addMsg('Could not transcribe.','ai');}}).catch(function(e){tp.remove();addMsg(navigator.onLine?'Transcribe error.':'Voice-to-text needs the network - I could not transcribe offline. Typed messages still work.','ai');});}
function send(){var inp=document.getElementById('input');var txt=inp.value.trim();if(!txt&&mode!=='vision')return;inp.value='';inp.style.height='auto';sendText(txt);}


var KPACK=null;var KP_FAILED=[];
var KP_DF={};
function kpIsAl(c){var n=c.charCodeAt(0);return (n>=48&&n<=57)||(n>=97&&n<=122);}
function kpHasWord(hay,word){
var h=String(hay||'').toLowerCase();var i=h.indexOf(word);
while(i>-1){
var before=i>0&&kpIsAl(h.charAt(i-1));
var after=i+word.length<h.length&&kpIsAl(h.charAt(i+word.length));
if(!before&&!after)return true;
i=h.indexOf(word,i+1);
}
return false;
}
function idbOpen(){return new Promise(function(res,rej){var r=indexedDB.open('hzai_kpack',1);r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains('chunks'))d.createObjectStore('chunks');if(!d.objectStoreNames.contains('meta'))d.createObjectStore('meta');};r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});}
function idbPut(st,k,v){return idbOpen().then(function(db){return new Promise(function(res,rej){var tx=db.transaction(st,'readwrite');tx.objectStore(st).put(v,k);tx.oncomplete=function(){res(1);};tx.onerror=function(){rej(tx.error);};});});}
function idbDel(st,k){return idbOpen().then(function(db){return new Promise(function(res,rej){var tx=db.transaction(st,'readwrite');tx.objectStore(st)['delete'](k);tx.oncomplete=function(){res(1);};tx.onerror=function(){rej(tx.error);};});});}
function idbGet(st,k){return idbOpen().then(function(db){return new Promise(function(res,rej){var tx=db.transaction(st,'readonly');var rq=tx.objectStore(st).get(k);rq.onsuccess=function(){res(rq.result);};rq.onerror=function(){rej(rq.error);};});});}
function idbAll(st){return idbOpen().then(function(db){return new Promise(function(res,rej){var tx=db.transaction(st,'readonly');var out=[];var cur=tx.objectStore(st).openCursor();cur.onsuccess=function(e){var c=e.target.result;if(c){out.push({k:c.key,v:c.value});c.continue();}else res(out);};cur.onerror=function(){rej(cur.error);};});});}
function kpSha(s){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){var h='';var a=new Uint8Array(b);for(var i=0;i<a.length;i++)h+=('0'+a[i].toString(16)).slice(-2);return h;});}
function kpStatus(){return idbAll('chunks').then(function(arr){return {n:arr.length};});}
function kpDownload(){
if(!navigator.onLine){addMsg('Download needs the network. I am offline right now - connect once, tap Knowledge, and the pack is yours forever.','ai');return;}
idbAll('chunks').then(function(all){for(var q=0;q<all.length;q++){if(typeof all[q].k!=='number')idbDel('chunks',all[q].k);}});
var tp=document.createElement('div');tp.className='typing';tp.textContent='Downloading knowledge pack...';document.getElementById('chat').appendChild(tp);
fetch('/api/kpack/manifest').then(function(r){return r.json();}).then(function(m){
var hashes=m.hashes||[];var total=hashes.length;var done=0;
function next(){
if(done>=total){tp.remove();addMsg('Knowledge pack ready: '+m.docs+' documents stored and verified on your device. Offline answers now search this pack - labelled CACHED, never live.','ai');kpLoad(true);return;}
var i=done;
idbGet('chunks',i).then(function(prev){
if(prev){return kpSha(prev).then(function(h){if(h===hashes[i]){done++;tp.textContent='Checking knowledge pack... '+done+' / '+total;next();return;}});}
fetch('/api/kpack/chunk/'+i).then(function(r){return r.text();}).then(function(txt){
kpSha(txt).then(function(h){
if(h!==hashes[i]){tp.remove();addMsg('Integrity check FAILED for chunk '+i+' - download aborted, nothing broken stored. Tap Knowledge to retry.','ai');return;}
idbPut('chunks',i,txt).then(function(){done++;tp.textContent='Downloading knowledge pack... '+done+' / '+total;next();});
});}).catch(function(e){tp.remove();addMsg('Download failed at chunk '+i+' - tap Knowledge to resume where it stopped.','ai');});
});
}
next();
}).catch(function(e){tp.remove();addMsg('Could not reach the knowledge pack - try again when connected.','ai');});
}
function kpLoad(force){
if(KPACK&&!force)return Promise.resolve(KPACK);
return idbAll('chunks').then(function(arr){
if(!arr.length)return null;
KPACK=[];KP_FAILED=[];
for(var i=0;i<arr.length;i++){try{var docs=JSON.parse(arr[i].v);KPACK=KPACK.concat(docs);}catch(e){KP_FAILED.push(arr[i].k);}}
if(KP_FAILED.length&&KPACK.length)addMsg('Knowledge pack warning: '+KP_FAILED.length+' stored chunk(s) unreadable on this device - some answers may be missing. Tap Knowledge while online to repair.','ai');
return KPACK;
});
}
var KP_STOP={};
['what','which','who','whom','whose','when','where','why','how','does','did','do','is','are','was','were','tell','explain','about','define','meaning','the','a','an','of','in','on','and','or','for','with','that','this','these','those','you','your','me','my','please','can','could','would','should','give','some','thing','things','many','much','more','info','information','need','needs','want','wants','come','from','into','them','then','they','will','also','just','like','help'].forEach(function(w){KP_STOP[w]=1;});
function lbKSearch(txt){
var q=String(txt||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(' ').filter(function(w){return w.length>2&&!KP_STOP[w];});
if(!q.length)return Promise.resolve(null);
return kpLoad().then(function(docs){
if(!docs||!docs.length)return null;
var ranked=[];
for(var d=0;d<docs.length;d++){
var doc=docs[d];var score=0;
for(var w=0;w<q.length;w++){
if(kpHasWord(doc.t,q[w]))score+=6;
if(kpHasWord(doc.x,q[w]))score+=2;
}
if(score>0)ranked.push({s:score,doc:doc});
}
ranked.sort(function(a,b){return b.s-a.s;});
if(!ranked.length||ranked[0].s<6)return null;
var dfs=[];
for(var w=0;w<q.length;w++){
if(typeof KP_DF[q[w]]==='number'){dfs[w]=KP_DF[q[w]];continue;}
var cnt=0;
for(var d=0;d<docs.length;d++){if(kpHasWord(docs[d].t,q[w])||kpHasWord(docs[d].x,q[w]))cnt++;}
KP_DF[q[w]]=cnt;dfs[w]=cnt;
}
var hasZero=false;
for(var w=0;w<q.length;w++)if(dfs[w]===0)hasZero=true;
var specific=[];
for(var w=0;w<q.length;w++)if(dfs[w]>0&&dfs[w]<=20)specific.push(q[w]);
var tstar=q[0];var tdf=dfs[0];
for(var w=1;w<q.length;w++)if(dfs[w]<tdf){tdf=dfs[w];tstar=q[w];}
var best;var confident;
if(hasZero){best=ranked[0].doc;confident=false;}
else{
var bestS=ranked[0].s;var cands=[];
for(var i=0;i<ranked.length&&i<8;i++){if(ranked[i].s>=bestS-6)cands.push(ranked[i]);}
function kpSh(r){var n=0;for(var k=0;k<specific.length;k++){if(kpHasWord(r.doc.t,specific[k])||kpHasWord(r.doc.x,specific[k]))n++;}return n;}
function kpTSpec(r){for(var k=0;k<specific.length;k++){if(kpHasWord(r.doc.t,specific[k]))return true;}return false;}
function kpTS(r){return kpHasWord(r.doc.t,tstar)||kpHasWord(r.doc.x,tstar);}
var pick=cands[0];
for(var i=1;i<cands.length;i++){
if(kpSh(cands[i])>kpSh(pick))pick=cands[i];
else if(kpSh(cands[i])===kpSh(pick)){
if(kpTSpec(cands[i])&&!kpTSpec(pick))pick=cands[i];
else if(kpTSpec(cands[i])===kpTSpec(pick)){
if(kpTS(cands[i])&&!kpTS(pick))pick=cands[i];
else if(kpTS(cands[i])===kpTS(pick)&&cands[i].s>pick.s)pick=cands[i];}}}
best=pick.doc;
var titleSpec=false;
for(var k=0;k<specific.length;k++)if(kpHasWord(best.t,specific[k]))titleSpec=true;
var titleT=kpHasWord(best.t,tstar);
var complete=specific.length>=2;
for(var k=0;k<complete&&k<specific.length;k++){if(!kpHasWord(best.t,specific[k])&&!kpHasWord(best.x,specific[k]))complete=false;}
confident=titleSpec||titleT||complete;
}
var bestTerm=tstar;
var bestScore=ranked[0].s;
var ex='';var body=(best.x||'');body=body.split(String.fromCharCode(10)).filter(function(l){var c=l.charAt(0);return c!=='|'&&c!=='='&&c!=='{';}).join(' ');body=body.split('|').filter(function(s){return s.indexOf('=')===-1||s.length>90;}).join(' ');body=body.replace(/^[ ]+/,'');if(!body){body=String(best.x||'').split('|').filter(function(s){return s.indexOf('=')===-1||s.length>90;}).join(' ');}if(!body)body=(best.x||'');
body=body.split('}}').join(' ').split('{{').join(' ');
var sents=body.split('. ');
var picked=[];
for(var si=0;si<sents.length&&picked.length<2;si++){
var sN=sents[si].replace(/^[ ]+/,'');
if(sN.length<25||sN.indexOf('=')>-1||sN.indexOf('|')>-1)continue;
if(picked.length===0&&bestTerm&&sN.toLowerCase().indexOf(bestTerm)===-1)continue;
picked.push(sN);
}
if(!picked.length){for(var sj=0;sj<sents.length;sj++){var sF=sents[sj].replace(/^[ ]+/,'');if(sF.length>25&&sF.indexOf('=')===-1&&sF.indexOf('|')===-1){picked=[sF];break;}}}
if(!picked.length&&sents.length)picked=[(sents[0]||'').trim()];
ex=picked.join('. ');
if(ex.length>420)ex=ex.slice(0,420)+'...';
if(!ex)ex=String(best.t);
var LB_K;
if(confident){LB_K='<span style="font-size:10px;color:#7c3aed;font-weight:600">&#9679; OFFLINE &middot; KNOWLEDGE PACK (CACHED)</span><br>';}
else{LB_K='<span style="font-size:10px;color:#b45309;font-weight:600">&#9679; OFFLINE &middot; KNOWLEDGE PACK (CACHED &middot; UNCERTAIN MATCH)</span><br>';}
var note=confident?'Document passage from my offline pack - cached, not live.':'I am NOT certain this answers your question - it is the closest match in my offline pack. If this is not what you meant, my offline knowledge does not cover it.';
return LB_K+'<b>'+esc(best.t)+'</b> <span style="color:#6b7280">['+esc(best.c)+']</span><br>'+esc(ex)+'<br><span style="color:#6b7280;font-size:11px">'+note+'</span>';
});
}

function kpBtn(){kpLoad().then(function(docs){if(docs&&docs.length){if(KP_FAILED.length&&navigator.onLine){addMsg('Knowledge pack: '+docs.length+' documents, but '+KP_FAILED.length+' chunk(s) unreadable. Repairing now...','ai');kpDownload();}else{addMsg('Knowledge pack: '+docs.length+' documents ready on your device. Ask questions and I search them offline - answers are labelled KNOWLEDGE PACK (CACHED).'+(KP_FAILED.length?' WARNING: '+KP_FAILED.length+' chunk(s) unreadable - repairing needs the network.':''),'ai');}}else{kpStatus().then(function(s){if(s.n>0){addMsg('Knowledge pack partially downloaded ('+s.n+' chunks present). Tap Knowledge again while online to resume.','ai');kpDownload();}else{kpDownload();}});}});}
function localBrain(txt,mode){
var LB_L='<span style="font-size:10px;color:#b45309;font-weight:600">&#9679; OFFLINE &middot; LOCAL BRAIN</span><br>';
var t=String(txt||'').toLowerCase().trim();
if(mode==='image'||mode==='vision'){return LB_L+'Images and photo analysis need the network. Offline I can: greet, answer local facts (Nigeria, states, capitals, planets, HARZ), tell time and date, do arithmetic, and build a working clock.';}
if(mode==='weather'){return LB_L+'Weather needs the network - I have no local weather data. Offline I can: greet, answer local facts, tell time and date, do arithmetic, and build a working clock.';}
if(mode==='code'){return LB_L+'Writing code needs the network - I cannot generate programs offline. Offline I can: greet, answer local facts (Nigeria, states, capitals, planets, HARZ), tell time and date, do arithmetic, and build a working clock, calculator or notes.';}
if(!t)return LB_L+'Say something and I will answer from the local brain.';
var mA=lbArithPart(txt);
var bks=lbBuildKinds(txt);
if(bks.length===1&&bks[0]==='clock'){lbClock();return LB_L+mA+'Clock built on your device - preview open on top of your chat. It ticks from your device clock. No network was used.';}
if(bks.length===1&&bks[0]==='calculator'){lbCalc();return LB_L+mA+'Calculator built on your device - preview open. Works fully offline.';}
if(bks.length===1&&bks[0]==='notes'){lbNotes();return LB_L+mA+'Notes pad built on your device - preview open. Notes save locally and survive restarts.';}
if(bks.length>1){var bmsg=LB_L+mA;for(var bi=0;bi<bks.length;bi++){if(bks[bi]==='clock'){lbClock();bmsg+='Clock built and ticking. ';}if(bks[bi]==='calculator'){lbCalc();bmsg+='Calculator built and open. ';}if(bks[bi]==='notes'){lbNotes();bmsg+='Notes pad built and open. ';}}return bmsg+'All requested tools built on your device - no network was used.';}
var bk=lbBuildKind(txt);
if(bk==='REOPEN'||bk==='UNSUPPORTED'){var bm=lbBuildMsg(bk);return bm;}
if(/(what|wane|nawa|which).*?(time|o\'?clock|sa\'?a|saa)|^time\\b/.test(t)){var n=new Date();return LB_L+'Your device clock says: <b>'+n.toLocaleTimeString()+'</b><br>Date: '+n.toLocaleDateString(); }
if(/(what|which|wane).*?date|today\'?s date|date (na|is it)/.test(t)){var d2=new Date();return LB_L+'Today on your device: <b>'+d2.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})+'</b>';}
if(/^(hi|hello|hey|sannu|sanu|salaam|assalam|good\\s(morning|afternoon|evening)|barka)\\b/.test(t)){var h=new Date().getHours();var g=h<12?'Good morning':(h<17?'Good afternoon':'Good evening');return LB_L+g+'! Sannu da zuwa. Na nan gare ka - offline mode, local brain.';}
if(/how are you|yaya kake|yaya kike|yaya dai|yaya aka/.test(t)){return LB_L+'Na lafiya, gode! I am running locally on your device - no network needed. Ka yaya?';}
if(/who are you|me ka ne|wayne kake|your name/.test(t)){return LB_L+'I am the local brain of HARZ AI - a small rule engine running inside your device from the cached app. No internet, no Cloudflare AI, no Groq.';}
if(/^(help|help me|commands|capabilities|abin da kake yi)|what can you do/.test(t)){return LB_L+'Offline I can: 1) greetings and small talk (English, Hausa, Pidgin) 2) answers from my local fact pack (Nigeria states and capitals, planets, continents, HARZ) 3) time and date from your device 4) simple arithmetic 5) build a working clock.';}
if(/thank|nagode|godde|thanks/.test(t)){return LB_L+'Nagode! Anything else I can do offline?';}
if(/^(bye|goodbye|sai anjima|sai wata rana|good night)\\b/.test(t)){return LB_L+'Sai anjima! Chat is saved on your device - it will still be here next time.';}
var mtxt=lbArithNorm(t).replace(/divided by/g,'/').replace(/multiplied by/g,'*').replace(/ times /g,' * ').replace(/ plus /g,' + ').replace(/ minus /g,' - ').replace(/ percent of /g,' /100* ').replace(/ % of /g,' /100* ');
var cmp=mtxt.match(/(more|greater|bigger|larger|less|smaller|fewer) than ([\\d.]+)/);
if(cmp){
var lval=lbMathVal(mtxt.split(cmp[0])[0]);
if(lval!==null){var cn=parseFloat(cmp[2]);
var clt=/less|smaller|fewer/.test(cmp[1]);
var cres=clt?(lval<cn):(lval>cn);
return LB_L+'<b>'+lval+'</b> '+(clt?'&lt;':'&gt;')+' <b>'+cn+'</b> is <b>'+(cres?'TRUE':'FALSE')+'</b> (computed on-device)';}}
var mval=lbMathVal(mtxt);
if(mval!==null){
var vmsg=LB_L+'<b>'+esc(LB_LAST_EXPR)+'</b> = <b>'+mval+'</b> (calculated on-device)';
if(/verify|recheck/.test(t)){var rv=lbMathVal(mtxt);
vmsg+='<br>Verification: recomputed <b>'+esc(LB_LAST_EXPR)+'</b> = <b>'+rv+'</b> - '+(rv===mval?'<b>VERIFIED</b>':'<b>MISMATCH - I may be wrong</b>');}
return vmsg;}
var stParts=[];
if(/how many states/.test(t))stParts.push('Nigeria has <b>36 states</b> plus the Federal Capital Territory, Abuja');
for(var s in LB_STATES){if(kpHasWord(t,s)){stParts.push('The capital of '+LB_STATES[s][0]+' is <b>'+LB_STATES[s][1]+'</b>');}}
if(stParts.length)return LB_L+stParts.join('. ')+'. (Local fact pack - no network used)';
if(/capital of nigeria|babban birnin nigeria/.test(t)){return LB_L+'The capital of Nigeria is <b>Abuja</b>. (Local fact pack)';}
var wc=t.split(' ').filter(function(x){return x.length;}).length;if(wc<=6){for(var f in LB_FACTS){var ks=f.split('|');for(var i=0;i<ks.length;i++){if(t.indexOf(ks[i])>-1){return LB_L+LB_FACTS[f];}}}}
return lbKSearch(txt).then(function(k){if(k)return k;return LB_L+'I cannot answer that offline - my local brain is small. It handles greetings, Nigeria facts, time and date, arithmetic, clock/calculator/notes builds - and any question my offline knowledge pack can answer (tap Knowledge while online to download the pack).';});
}
var LB_STATES={'abia':['Abia','Umuahia'],'adamawa':['Adamawa','Yola'],'akwa ibom':['Akwa Ibom','Uyo'],'anambra':['Anambra','Awka'],'bauchi':['Bauchi','Bauchi'],'bayelsa':['Bayelsa','Yenagoa'],'benue':['Benue','Makurdi'],'borno':['Borno','Maiduguri'],'cross river':['Cross River','Calabar'],'delta':['Delta','Asaba'],'ebonyi':['Ebonyi','Abakaliki'],'edo':['Edo','Benin City'],'ekiti':['Ekiti','Ado Ekiti'],'enugu':['Enugu','Enugu'],'gombe':['Gombe','Gombe'],'imo':['Imo','Owerri'],'jigawa':['Jigawa','Dutse'],'kaduna':['Kaduna','Kaduna'],'kano':['Kano','Kano'],'katsina':['Katsina','Katsina'],'kebbi':['Kebbi','Birnin Kebbi'],'kogi':['Kogi','Lokoja'],'kwara':['Kwara','Ilorin'],'lagos':['Lagos','Ikeja'],'nasarawa':['Nasarawa','Lafia'],'niger':['Niger','Minna'],'ogun':['Ogun','Abeokuta'],'ondo':['Ondo','Akure'],'osun':['Osun','Osogbo'],'oyo':['Oyo','Ibadan'],'plateau':['Plateau','Jos'],'rivers':['Rivers','Port Harcourt'],'sokoto':['Sokoto','Sokoto'],'taraba':['Taraba','Jalingo'],'yobe':['Yobe','Damaturu'],'zamfara':['Zamfara','Gusau']};
var LB_FACTS={'how many states|states in nigeria':'Nigeria has <b>36 states</b> plus the Federal Capital Territory, Abuja. (Local fact pack)','largest state|biggest state':['Niger State is the largest by area; Lagos is the smallest. (Local fact pack)'],'continents|how many continents':['There are <b>7 continents</b>: Africa, Asia, Europe, North America, South America, Australia, Antarctica. (Local fact pack)'],'planets|how many planets':['There are <b>8 planets</b> in the solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. (Local fact pack)'],'largest planet':['Jupiter is the largest planet in the solar system. (Local fact pack)'],'earth|our planet':['Earth is the third planet from the Sun and the only known planet with life. (Local fact pack)'],'sun|closest star':['The Sun is the star at the centre of our solar system. (Local fact pack)'],'moon':['The Moon is Earth\\'s only natural satellite. (Local fact pack)'],'harz':['HARZ is a Taraba State, Nigeria technology ecosystem building sovereign, offline-first services: Super Cloud, Super App, MESSENGER, VoiceVault and more. (Local fact pack)'],'water|h2o':['Water is H2O - two hydrogen atoms bonded to one oxygen atom. (Local fact pack)'],'photosynthesis':['Photosynthesis is how plants make food from sunlight, water and carbon dioxide. (Local fact pack)'],'gravity':['Gravity is the force that pulls objects toward each other - it keeps us on the ground. (Local fact pack)']};

var LB_LAST=null;
try{LB_LAST=localStorage.getItem('hzai_lastbuild');}catch(e){}
function lbCalc(){
var o=document.createElement('div');o.id='lbArtifactOverlay';o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:#f0f2f5;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:12px;';
var keys=['7','8','9','/','4','5','6','*','1','2','3','-','0','.','','+'];
var btns='';
for(var i=0;i<keys.length;i++){var k=keys[i];btns+=k===''?'<div style="width:60px;height:44px"></div>':'<button data-k="'+k+'" style="width:60px;height:44px;margin:3px;font-size:18px;background:#fff;border:1px solid #d0d5dd;border-radius:8px;color:#1a1a1a">'+k+'</button>';}
o.innerHTML='<div style="font-size:10px;color:#059669;font-weight:600;margin-bottom:10px">&#9679; BUILT ON-DEVICE - no network used</div><div id="lbCalcDisp" style="width:248px;background:#fff;border:1px solid #d0d5dd;border-radius:8px;padding:10px 12px;font-size:26px;font-weight:700;color:#1a1a1a;text-align:right;min-height:28px;overflow:hidden">0</div><div style="margin-top:8px">'+btns+'</div><div style="margin-top:4px"><button data-k="=" style="width:128px;height:44px;margin:3px;font-size:18px;background:#2563eb;color:#fff;border:none;border-radius:8px">=</button><button data-k="C" style="width:60px;height:44px;margin:3px;font-size:18px;background:#fee2e2;color:#b91c1c;border:none;border-radius:8px">C</button><button data-k="X" style="width:52px;height:44px;margin:3px;font-size:14px;background:#eef0f4;color:#374151;border:none;border-radius:8px">Close</button></div>';
document.body.appendChild(o);
var expr='';
o.addEventListener('click',function(ev){var k=ev.target.getAttribute&&ev.target.getAttribute('data-k');if(!k)return;
if(k==='X'){o.remove();return;}
if(k==='C'){expr='';}
else if(k==='='){var m=expr.match(/^[0-9+*/().\\-\\s]+$/);if(m&&/[0-9]/.test(expr)){try{var v=Function('return('+expr+')')();expr=String(Math.round(v*1e8)/1e8);}catch(e){expr='Error';}}else{expr='Error';}}
else{if(expr==='0'||expr==='Error')expr=k;else expr+=k;}
document.getElementById('lbCalcDisp').textContent=expr||'0';});
}
function lbNotes(){
var o=document.createElement('div');o.id='lbArtifactOverlay';o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:#f0f2f5;z-index:99999;display:flex;flex-direction:column;font-family:system-ui,sans-serif;padding:12px;overflow-y:auto;';
o.innerHTML='<div style="font-size:10px;color:#059669;font-weight:600;margin-bottom:8px">&#9679; BUILT ON-DEVICE - notes are saved on your device and survive restarts</div><textarea id="lbNoteIn" style="width:100%;height:110px;background:#fff;border:1px solid #d0d5dd;border-radius:8px;padding:10px;font-size:14px;color:#1a1a1a" placeholder="Write a note..."></textarea><div style="margin-top:8px"><button id="lbNoteSave" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:14px">Save note</button> <button id="lbNoteClose" style="background:#eef0f4;color:#374151;border:none;border-radius:8px;padding:10px 14px;font-size:14px">Close</button></div><div id="lbNoteList" style="margin-top:14px"></div>';
document.body.appendChild(o);
function render(){var arr=[];try{arr=JSON.parse(localStorage.getItem('hzai_notes')||'[]');}catch(e){}
var el=document.getElementById('lbNoteList');var h='';
for(var i=arr.length-1;i>=0;i--){h+='<div style="background:#fff;border:1px solid #d0d5dd;border-radius:8px;padding:10px;margin-top:8px"><div style="font-size:10px;color:#6b7280">'+esc(arr[i].d)+'</div><div style="font-size:14px;color:#1a1a1a;margin-top:4px;white-space:pre-wrap">'+esc(arr[i].t)+'</div></div>';}
el.innerHTML=h||'<div style="color:#6b7280;font-size:13px;margin-top:8px">No notes yet.</div>';}
render();
document.getElementById('lbNoteSave').onclick=function(){var v=document.getElementById('lbNoteIn').value.trim();if(!v)return;var arr=[];try{arr=JSON.parse(localStorage.getItem('hzai_notes')||'[]');}catch(e){}arr.push({d:new Date().toLocaleString(),t:v});try{localStorage.setItem('hzai_notes',JSON.stringify(arr.slice(-100)));}catch(e){}document.getElementById('lbNoteIn').value='';render();};
document.getElementById('lbNoteClose').onclick=function(){o.remove();};
}
function lbArtifact(kind){if(kind==='clock')lbClock();else if(kind==='calculator')lbCalc();else if(kind==='notes')lbNotes();LB_LAST=kind;try{localStorage.setItem('hzai_lastbuild',kind);}catch(e){}}
function lbArithPart(txt){
var t=String(txt||'').toLowerCase();
var parts=t.split(' ');
var keep=[];
for(var i=0;i<parts.length;i++){
var w=parts[i].replace(/[.,!?;:]/g,'');
if(/^[\\d+\\-*/().%]+$/.test(w)&&(/\\d/.test(w)||/^[+\\-*/%]$/.test(w)))keep.push(w);
}
var me=keep.join(' ');
if(!me||!/[+\\-*/]/.test(me)||me.length>=40)return '';
try{var v=Function('"use strict";return('+me+')')();
if(typeof v==='number'&&isFinite(v)){var r2=Math.round(v*1e6)/1e6;
return '<b>'+esc(me)+'</b> = <b>'+r2+'</b> (calculated on-device)<br>';}}catch(e){}
return '';
}
function lbBuildKinds(txt){
var t=String(txt||'').toLowerCase();
var isBuild=/build|create|make|construct|gyara|gina/.test(t);
if(!isBuild)return [];
var out=[];
if(/clock|watch|timepiece|agogo/.test(t))out.push('clock');
if(/calculator|kalkul/.test(t))out.push('calculator');
if(/note|notepad|rubuce/.test(t))out.push('notes');
return out;
}
var LB_LAST_EXPR='';
function lbMathVal(txt){
var t=String(txt||'').toLowerCase();
var parts=t.split(' ');
var keep=[];
for(var i=0;i<parts.length;i++){
var w=parts[i].replace(/[.,!?;:]/g,'');
if(/^[\\d+\\-*/().%]+$/.test(w)&&(/\\d/.test(w)||/^[+\\-*/%]$/.test(w)))keep.push(w);
}
var me=keep.join(' ');
if(!me||!/[+\\-*/]/.test(me)||me.length>=60)return null;
try{var v=Function('"use strict";return('+me+')')();
if(typeof v==='number'&&isFinite(v)){LB_LAST_EXPR=me;return Math.round(v*1e6)/1e6;}}catch(e){}
return null;
}
function lbBuildKind(txt){
var t=String(txt||'').toLowerCase();
var isBuild=/build|create|make|construct|gyara|gina/.test(t);
var isPrev=/preview|nuna|show me it|open it/.test(t);
if(/clock|watch|timepiece|agogo/.test(t)&&(isBuild||isPrev))return 'clock';
if(/calculator|kalkul/.test(t)&&(isBuild||isPrev))return 'calculator';
if(/note|notepad|rubuce/.test(t)&&(isBuild||isPrev))return 'notes';
if(isPrev)return 'REOPEN';
if(isBuild)return 'UNSUPPORTED';
return null;
}
function lbBuildMsg(kind){
var LB_B='<span style="font-size:10px;color:#059669;font-weight:600">&#9679; BUILT ON-DEVICE &middot; PREVIEW OPEN</span><br>';
if(kind==='calculator')return LB_B+'Calculator built on your device - preview is open on top of the chat. Say "show preview" to reopen it after closing.';
if(kind==='notes')return LB_B+'Notes pad built on your device - preview open. Notes save on your device and survive restarts. Say "show preview" to reopen.';
if(kind==='REOPEN'){
if(LB_LAST){lbArtifact(LB_LAST);return LB_B+'Reopening your last build ('+LB_LAST+') - preview is open.';}
return LB_B+'Nothing has been built in this chat yet. Say: "Build me a clock", "Build me a calculator" or "Build me a notes pad" and the preview opens on top.';}
return LB_B+'I cannot build that yet - and I will not pretend. I can build and preview ON YOUR DEVICE: 1) a clock 2) a calculator 3) a notes pad. Say for example: "Build me a calculator". For other apps I can only discuss and write code - no preview yet.';
}

function lbClock(){
var o=document.createElement('div');o.id='lbClockOverlay';o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:#f0f2f5;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:16px;';
o.innerHTML='<div style="font-size:10px;color:#b45309;font-weight:600;margin-bottom:12px">&#9679; OFFLINE &middot; LOCAL BUILD - made on your device, no network</div><div id="lbClock" style="font-size:52px;font-weight:700;color:#1a1a1a;letter-spacing:2px"></div><div id="lbDate" style="font-size:14px;color:#6b7280;margin-top:8px"></div><button id="lbClose" style="margin-top:28px;background:#2563eb;color:#fff;border:none;border-radius:8px;padding:10px 22px;font-size:14px">Close</button>';
document.body.appendChild(o);
function tick(){var n=new Date();document.getElementById('lbClock').textContent=n.toLocaleTimeString();document.getElementById('lbDate').textContent=n.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
tick();o._iv=setInterval(tick,1000);
document.getElementById('lbClose').onclick=function(){clearInterval(o._iv);o.remove();};
}

var LF_L='<span style="font-size:10px;color:#059669;font-weight:600">&#9679; LOCAL &middot; ON-DEVICE BRAIN (no external inference)</span><br>';
var LF_PLACES=/\\b(in|at|of|for)\\s+[a-z]+|\\blondon\\b|\\btokyo\\b|\\bparis\\b|\\blagos\\b|\\babuja\\b|\\bkano\\b|\\bjalingo\\b|new\\s?york|\\bgmt\\b|\\butc\\b|timezone|\\bjapan\\b|\\bchina\\b|\\bdubai\\b|\\bamerica\\b|\\beurope\\b|\\bengland\\b|\\buk\\b|\\bus\\b/i;
function lbArithNorm(x){return String(x).replace(/(\\d)\\s*[x×]\\s*(?=\\d)/g,'$1*').replace(/([\\d.]+)\\s*%\\s*of\\s*/g,'$1/100* ');}
function lbLocalFirst(txt){
try{
var t=String(txt||'').toLowerCase().trim();
if(!t||mode!=='chat')return null;if(lbBuildKinds(txt).length)return null;
var tok=t.replace(/[?!.]+$/,'').split(/\\s+/).filter(function(w){return w.length;});
if(!LF_PLACES.test(t)&&(/^what'?s? (is )?(the )?time( now)?\\??$|^what time (is it( now)?)?\\??$|^time( now)?\\??$|tell me the time( now)?\\??$|^sa'?a (ce|nawa)\\??$|^wane sa'?a\\??$|^me sa'?a\\??$/.test(t))){
var n=new Date();return LF_L+'Your device clock says: <b>'+n.toLocaleTimeString()+'</b><br>Date: '+n.toLocaleDateString();}
if(!LF_PLACES.test(t)&&(/today'?s date|\\bdate today\\b|\\bdate (na|is it)\\b|^what'?s? (is )?(the )?date\\??$|^what date\\??$|^wane date\\??$/.test(t))){
var d2=new Date();return LF_L+'Today on your device: <b>'+d2.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})+'</b>';}
var LF_WRAP={'what':1,'whats':1,"what's":1,'is':1,'the':1,'answer':1,'to':1,'calculate':1,'calc':1,'work':1,'out':1,'compute':1,'solve':1,'can':1,'you':1,'please':1,'me':1,'for':1,'much':1,'does':1,'tell':1,'equals':1,'equal':1,'say':1,'us':1,'give':1};
var rem=lbArithNorm(t).replace(/[?!.]+$/,'').split(/\\s+/).filter(function(w){return w.length&&!LF_WRAP[w];});
var okArith=rem.length>0&&rem.every(function(w){return /^[\\d+\\-*/().%]+$/.test(w)&&(/\\d/.test(w)||/^[+\\-*/%]$/.test(w));});
if(okArith){var me=rem.join(' ');if(/[+\\-*/]/.test(me)&&me.length<40){var v=lbMathVal(me);if(v!=null){return LF_L+'<b>'+esc(me)+'</b> = <b>'+v+'</b> (calculated on-device)';}}return null;}
if(/^(hi|hello|hey|sannu|sanu|salaam|assalam|barka|good\\s(morning|afternoon|evening))\\b/.test(t)&&tok.length<=4){
var h=new Date().getHours();var g=h<12?'Good morning':(h<17?'Good afternoon':'Good evening');
return LF_L+g+'! Sannu - na nan gare ka. How can I help you today?';}
if(/capital of|how many states|states in nigeria|largest state|biggest state|how many (planets|continents)|largest planet/.test(t)&&tok.length<=8){
var tf=null;
if(/capital of nigeria|babban birnin nigeria/.test(t))tf='The capital of Nigeria is <b>Abuja</b>. (Local fact pack)';
if(!tf){var cm=t.match(/capital of ([a-z]+)/);if(cm&&LB_STATES[cm[1]])tf='The capital of '+LB_STATES[cm[1]][0]+' State is <b>'+LB_STATES[cm[1]][1]+'</b>. (Local fact pack)';}
if(!tf){var LFK=['how many states|states in nigeria','largest state|biggest state','continents|how many continents','planets|how many planets','largest planet'];for(var f2=0;f2<LFK.length&&!tf;f2++){var ks=LFK[f2].split('|');for(var k2=0;k2<ks.length&&!tf;k2++){if(t.indexOf(ks[k2])>-1)tf=LB_FACTS[LFK[f2]];}}}
if(tf)return LF_L+tf;}
// SC2-C1/C3: word-form arithmetic + verify (offline-proven logic)
var mt=lbArithNorm(t).replace(/divided by/g,'/').replace(/multiplied by/g,'*').replace(/ times /g,' * ').replace(/ plus /g,' + ').replace(/ minus /g,' - ').replace(/ percent of /g,' /100* ').replace(/ % of /g,' /100* ');
if(mt!==t||/\\b(verify|recheck)\\b/.test(t)){
var rem2=mt.replace(/[?!.]+$/,'').split(/\\s+/).filter(function(w){return w.length&&!LF_WRAP[w]&&w!=='verify'&&w!=='recheck';});
var ok2=rem2.length>0&&rem2.every(function(w){return /^[\\d+\\-*/().%]+$/.test(w)&&(/\\d/.test(w)||/^[+\\-*/%]$/.test(w));});
if(ok2){var me2=rem2.join(' ');if(/[+\\-*/]/.test(me2)&&me2.length<40){var v2=lbMathVal(me2);if(v2!=null){var vm=LF_L+'<b>'+esc(me2)+'</b> = <b>'+v2+'</b> (calculated on-device)';
if(/\\b(verify|recheck)\\b/.test(t)){var rv2=lbMathVal(me2);vm+='<br>Verification: recomputed <b>'+esc(me2)+'</b> = <b>'+rv2+'</b> - '+(rv2===v2?'<b>VERIFIED</b>':'<b>MISMATCH - I may be wrong</b>');}
return vm;}}return null;}
}
// SC2-C2: numeric comparisons (offline-proven logic)
var cmp=mt.match(/(more|greater|bigger|larger|less|smaller|fewer) than ([\\d.]+)/);
if(cmp){var lval=lbMathVal(mt.split(cmp[0])[0]);if(lval!==null){var cn=parseFloat(cmp[2]);var clt=/less|smaller|fewer/.test(cmp[1]);var cres=clt?(lval<cn):(lval>cn);return LF_L+'<b>'+lval+'</b> '+(clt?'&lt;':'&gt;')+' <b>'+cn+'</b> is <b>'+(cres?'TRUE':'FALSE')+'</b> (computed on-device)';}}
// SC2-C4a: bare farewells
if(/^(bye|goodbye|sai anjima|sai wata rana|good night)\\b/.test(t)&&tok.length<=4){return LF_L+'Sai anjima! Chat is saved on your device - it will still be here next time.';}
// SC2-C4b: direct-form fact keys (answerability guard: exact interrogative only)
var dm=t.match(/^what'?s (water|h2o|photosynthesis|gravity)\\??$|^what (is|are) (water|h2o|photosynthesis|gravity)\\??$|^what (is|are) (the )?(sun|moon|earth)\\??$|^what (is|are) our planet\\??$/);
if(dm){var LF_DK=['water|h2o','photosynthesis','gravity','sun|closest star','moon','earth|our planet'];for(var dk=0;dk<LF_DK.length;dk++){var ks3=LF_DK[dk].split('|');for(var k3=0;k3<ks3.length;k3++){if(t.indexOf(ks3[k3])>-1){var ff2=LB_FACTS[LF_DK[dk]];if(ff2)return LF_L+ff2;}}}}
return null;
}catch(e){return null;}
}
var lbSending=false;function sendText(txt){var btn=document.getElementById('sendBtn');if(lbSending)return;lbSending=true;btn.disabled=true;if(!navigator.onLine){var _lb;if(txt){addMsg(esc(txt),'user');}try{_lb=localBrain(txt,mode);}catch(e){_lb='Something went wrong handling that message - please try again.';}Promise.resolve(_lb).then(function(m){addMsg(m,'ai');}).catch(function(){addMsg('Something went wrong handling that message - please try again.','ai');});btn.disabled=false;lbSending=false;return;}var bk=lbBuildKind(txt);var bks=lbBuildKinds(txt).filter(function(v,ix,arr){return arr.indexOf(v)===ix;});
if(bk==='REOPEN'||bk==='UNSUPPORTED'){addMsg(lbBuildMsg(bk),'ai');btn.disabled=false;lbSending=false;return;}
var mtUserShown=false;
if(bks.length>1){var mr='<b>'+bks.length+' build tasks requested:</b><br>';var mtHasClock=false;
for(var mi=0;mi<bks.length;mi++){var mk=bks[mi];
if(mk==='clock'){mtHasClock=true;mr+='&#9679; Task '+(mi+1)+' of '+bks.length+': <b>clock</b> - building via the HARZ artifact engine, result below.<br>';}
else if(mk==='calculator'){lbArtifact('calculator');mr+='&#9679; Task '+(mi+1)+' of '+bks.length+': <b>calculator</b> - <span style="font-size:10px;color:#059669;font-weight:600">BUILT ON-DEVICE &middot; PREVIEW OPEN</span><br>';}
else if(mk==='notes'){lbArtifact('notes');mr+='&#9679; Task '+(mi+1)+' of '+bks.length+': <b>notes pad</b> - <span style="font-size:10px;color:#059669;font-weight:600">BUILT ON-DEVICE &middot; PREVIEW OPEN</span><br>';}}
if(txt){addMsg(esc(txt),'user');}addMsg(mr,'ai');mtUserShown=true;
if(!mtHasClock){btn.disabled=false;lbSending=false;return;}}
if(bk==='calculator'||bk==='notes'){addMsg(lbBuildMsg(bk),'ai');lbArtifact(bk);btn.disabled=false;lbSending=false;return;}var lf=lbLocalFirst(txt);if(lf){if(txt){addMsg(esc(txt),'user');}chatHistory.push({role:'user',content:txt});addMsg(lf,'ai');chatHistory.push({role:'assistant',content:lf.replace(/<[^>]+>/g,' ')});saveHist();btn.disabled=false;lbSending=false;return;}
if(txt){if(!mtUserShown){addMsg(esc(txt),'user');}chatHistory.push({role:'user',content:txt});saveHist();}var tp=document.createElement('div');tp.className='typing';tp.textContent='HARZ AI is thinking...';document.getElementById('chat').appendChild(tp);var url=A+'/'+mode;var body={};if(mode==='chat'){body={message:txt,history:chatHistory.slice(-10)};}else if(mode==='code'||mode==='math'){body={message:txt};}else if(mode==='image'){body={prompt:txt};}else if(mode==='vision'){body={image:visionImage,question:txt};if(!visionImage){tp.remove();addMsg('Please select an image first.','ai');btn.disabled=false;return;}}else if(mode==='weather'){body={city:txt};}fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json();}).then(function(d){tp.remove();btn.disabled=false;lbSending=false;if(d.success&&d.response){addMsg(esc(d.response).replace(/\\n/g,'<br>').replace(/(https?:\\/\\/[^\\s"'&<]+)/g,'<a href="$1" target="_blank" rel="noopener" style="color:#e94560;text-decoration:underline;word-break:break-all">$1</a>'),'ai');chatHistory.push({role:'assistant',content:d.response});saveHist();}else if(d.success&&d.image_url){var im=document.createElement('div');im.className='msg ai';im.innerHTML='<img src="'+d.image_url+'" onload="document.getElementById(\\'chat\\').scrollTop=99999">';document.getElementById('chat').appendChild(im);im.scrollIntoView();}else if(d.success&&d.report){addMsg(formatWeather(d.report),'ai');}else{addMsg('Error: '+(d.error||'Failed'),'ai');}}).catch(function(e){tp.remove();btn.disabled=false;lbSending=false;var _lb2;try{_lb2=localBrain(txt,mode);}catch(e){_lb2='Offline fallback failed for this one.';}Promise.resolve(_lb2).then(function(lb){addMsg(lb,'ai');});});}
function formatWeather(r){var h='<b>'+esc(r.city)+', '+esc(r.country)+'</b><br>';h+='&#127777; '+r.temp_c+'C ('+r.temp_f+'F)<br>';h+=esc(r.condition)+'<br>';h+='Humidity: '+r.humidity+'%<br>';h+='Wind: '+r.wind_kph+' km/h';return h;}
function shareChat(){if(chatHistory.length===0){addMsg('No messages to share yet.','ai');return;}var tp=document.createElement('div');tp.className='typing';tp.textContent='Creating share link...';document.getElementById('chat').appendChild(tp);fetch(A+'/share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:chatHistory,title:chatHistory[0]?.content?.substring(0,30)||'Chat'})}).then(function(r){return r.json();}).then(function(d){tp.remove();if(d.success&&d.url){addMsg('Share link created: <a href="'+d.url+'" target="_blank">'+d.url+'</a>','ai');}else{addMsg('Share failed: '+(d.error||'Unknown'),'ai');}}).catch(function(e){tp.remove();addMsg('Share error.','ai');});}
document.getElementById('input').addEventListener('input',function(){this.style.height='auto';this.style.height=this.scrollHeight+'px';});
<\/script>
<div id="hznet" style="position:fixed;bottom:0;left:0;right:0;text-align:center;font-size:11px;padding:4px;background:#eef2f0;color:#334;z-index:99">● ONLINE · LIVE</div><script>(function(){if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").then(function(r){r.update();}).catch(function(){});var e=document.getElementById("hznet");function u(){var o=navigator.onLine;e.textContent=o?"\u25cf ONLINE \u00b7 LIVE":"\u25cf OFFLINE \u00b7 LOCAL SHELL + BRAIN";e.style.background=o?"#eef2f0":"#fdeecd"}u();addEventListener("online",u);addEventListener("offline",u)})();</script></body>
</html>`;
}
__name(renderApp, "renderApp");
async function runHotline(env2) {
  var answered = 0;
  try {
    console.log("HOTLINE cron fired");
    if (!env2.HOTLINE_MESH) {
      console.log("HOTLINE no binding");
      return;
    }
    const r = await env2.HOTLINE_MESH.fetch("https://hotline-mesh.internal/api/inbox?phone=0999000001", { headers: { "Cache-Control": "no-store" } });
    console.log("HOTLINE inbox status", r.status);
    const d = await r.json();
    console.log("HOTLINE inbox msgs", d && d.count);
    if (!d || !d.success || !Array.isArray(d.messages) || !d.messages.length) return;
    for (const m of d.messages.slice(0, 10)) {
      const asker = String(m && m.from || "").replace(/\D/g, "");
      const question = String(m && m.text || "").trim().slice(0, 500);
      if (asker.length < 10 || !question) continue;
      let answer = null;
      const messages = [
        { role: "system", content: "You are the Harz AI Hotline, the nation's advisor answering questions that arrive from phones on the Harz mesh. Answer helpfully and briefly (under 120 words), in the same language as the question. You are honest: if you are unsure, say so." },
        { role: "user", content: question }
      ];
      try {
        if (env2 && env2.AI) {
          const result2 = await env2.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages, max_tokens: 400 });
          if (result2 && result2.response) answer = result2.response;
        }
      } catch (err) {
      }
      if (!answer) {
        try {
          const GKEY = env2 && env2.GROQ_KEY || "";
          if (GKEY) {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${GKEY}` }, body: JSON.stringify({ model: "llama-3.1-8b-instant", messages, max_tokens: 350, temperature: 0.7 }) });
            const data = await res.json();
            if (data && data.choices && data.choices[0]) answer = data.choices[0].message.content;
          }
        } catch (err) {
        }
      }
      if (!answer) answer = "The AI brain could not be reached just now - ask again in a minute.";
      answer = String(answer).trim().slice(0, 480);
      try {
        await env2.HOTLINE_MESH.fetch("https://hotline-mesh.internal/api/msg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: "0999000001", to: asker, text: "HARZ AI HOTLINE: " + answer }) });
      } catch (err) {
      }
      answered += 1;
      try {
        const c = await env2.HARZ_KV.get("hotline:count", "json") || { answered: 0 };
        c.answered += 1;
        c.last_at = (/* @__PURE__ */ new Date()).toISOString();
        await env2.HARZ_KV.put("hotline:count", JSON.stringify(c));
      } catch (err) {
      }
    }
  } catch (err) {
    console.log("HOTLINE cron error", err && err.message);
  }
  return answered;
}
__name(runHotline, "runHotline");
var harz_ai_v660_default = {
  async fetch(request, env2) {
try{const _hz=new URL(request.url).pathname;if(_hz==='/sw.js')return new Response('const C="hzharzai-shell-v5"; self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(["/app","/manifest.json","/icon.svg"].map(u=>fetch(u).then(r=>c.put(u,r)).catch(()=>{})))));self.skipWaiting()}); self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))}); self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match("/app"))))});',{headers:{'Content-Type':'application/javascript'}});if(_hz==='/manifest.json')return new Response(JSON.stringify({name:'HARZ AI',short_name:'AI',start_url:'/',display:'standalone',background_color:'#f0f2f5',theme_color:'#f0f2f5',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]}),{headers:{'Content-Type':'application/manifest+json'}});if(_hz==='/icon.svg')return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#f0f2f5"/><text x="96" y="120" font-size="56" font-weight="900" text-anchor="middle" fill="#1a237e" font-family="system-ui">H</text></svg>',{headers:{'Content-Type':'image/svg+xml'}});}catch(_e){}

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") return new Response(null, { headers: CORS });
    if (path === "/" && (request.headers.get("accept")||"").includes("text/html")) return html(renderApp());
    if (path === "/" || path === "/health") {
      return json({
        platform: "HARZ AI",
        version: "6.6.0",
        status: "operational",
        languages: 27,
        features: ["chat", "image-gen", "vision", "voice", "code", "math", "weather", "share", "fetch"],
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (path === "/api/kpack/manifest") {
      const m = await env2.HARZ_KV.get("kpack_manifest");
      if (!m) return json({ success: false, error: "no pack" }, 404);
      return new Response(m, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
    }
    if (path.startsWith("/api/kpack/chunk/") && method === "GET") {
      const n = parseInt(path.split("/").pop(), 10);
      if (isNaN(n) || n < 0 || n > 63) return json({ success: false, error: "bad chunk" }, 400);
      const v = await env2.HARZ_KV.get("kpack_chunk_" + n);
      if (!v) return json({ success: false, error: "chunk missing" }, 404);
      return new Response(v, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=86400" } });
    }
    if (path === "/hotline-pump" && method === "POST") {
      try {
        const r = await runHotline(env2);
        const c = await env2.HARZ_KV.get("hotline:count", "json") || { answered: 0 };
        return json({ success: true, answered_now: r || 0, answered_total: c.answered, last_at: c.last_at || null });
      } catch (err) {
        return json({ success: false, error: "Pump failed: " + (err && err.message) }, 500);
      }
    }
    if (path === "/hotline-stats") {
      const c = await env2.HARZ_KV.get("hotline:count", "json") || { answered: 0 };
      return json({ success: true, hotline: "0999000001", answered: c.answered, last_at: c.last_at || null, status: "answering on the mesh" });
    }
    if (path === "/transcribe" && method === "POST") {
      try {
        const form = await request.formData();
        const file = form.get("file");
        if (!file) return json({ success: false, error: "file required" }, 400);
        if (env2 && env2.AI) {
          try {
            const audio = await file.arrayBuffer();
            const result2 = await env2.AI.run("@cf/whisper", { audio });
            if (result2 && result2.text) return json({ success: true, text: String(result2.text).trim() });
          } catch (err) {
          }
        }
        const GKEY = env2 && env2.GROQ_KEY || "";
        if (GKEY) {
          const fd = new FormData();
          fd.append("file", file, "audio.webm");
          fd.append("model", "whisper-large-v3-turbo");
          fd.append("language", "en");
          const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${GKEY}` }, body: fd });
          const data = await res.json();
          if (data && data.text) return json({ success: true, text: data.text });
        }
        return json({ success: false, error: "Transcription unavailable right now" }, 503);
      } catch (err) {
        return json({ success: false, error: "Transcription failed" }, 500);
      }
    }
    if (path === "/capabilities") {
      return json({
        features: ["chat", "image-gen", "vision", "voice", "code", "math", "weather", "share", "fetch"],
        languages: 27,
        endpoints: ["/app", "/health", "/chat", "/image", "/vision", "/code", "/math", "/weather", "/capabilities", "/share", "/fetch"]
      });
    }
    if (path === "/hotline-voice" && method === "POST") {
      try {
        const body = await request.json();
        const q = String(body.question || "").slice(0, 300);
        if (!q.trim()) return json({ success: false, error: "question required" }, 400);
        const sys = "You are the Harz AI Hotline. Reply in the SAME language the question is asked in (English question -> English answer, Hausa -> Hausa). Answer in 130 characters or fewer: direct, useful advice, no preamble.";
        let answer = "";
        if (env2 && env2.AI) {
          try {
            const result2 = await env2.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages: [{ role: "system", content: sys }, { role: "user", content: q }], max_tokens: 120 });
            if (result2 && result2.response) answer = result2.response;
          } catch (err) {
          }
        }
        if (!answer) {
          const GROQ_KEY = env2 && env2.GROQ_KEY || "";
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + GROQ_KEY },
            body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "system", content: sys }, { role: "user", content: q }], max_tokens: 120 })
          });
          const d = await res.json();
          answer = d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : "";
        }
        answer = String(answer || "").trim().replace(/\s+/g, " ").slice(0, 150);
        if (!answer) return json({ success: false, error: "brain silent" }, 503);
        return json({ success: true, answer, chars: answer.length });
      } catch (err) {
        return json({ success: false, error: err.message }, 500);
      }
    }
    if (path === "/app") return html(renderApp());
    if (path === "/chat" && method === "POST") {
      try {
        const body = await request.json();
        const msg0 = String(body.message || "");
      const low0 = msg0.toLowerCase();
      if (/\b(?:build|create|make|construct|design|gina|gina mana)\b/i.test(msg0) && /\b(?:clock|watch|timepiece|sa'a|saa|sa'a)\b/.test(low0) && !/\b(?:report|image|picture|photo|video|voice|music|story|song|rahoto|hoto|bidiyo)\b/.test(low0)) {
        try {
          const iaeUrl = "https://harz-intelligence.harz.workers.dev/api/iae/v1/create";
          const iaeReq = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instruction: msg0 }) };
          const iaeRes = env2 && env2.INTEL ? await env2.INTEL.fetch(iaeUrl, iaeReq) : await fetch(iaeUrl, iaeReq);
          const iae = await iaeRes.json();
          if (iae.status === "built_tested_verified") {
            return json({ success: true, response: "Clock built, tested (8/8) and verified by the HARZ artifact engine.\n\nOpen your working clock here:\n" + iae.url_abs + "\n\nIt keeps ticking after refresh and works offline once loaded. Receipt: " + String(iae.artifact_sha256).slice(0, 16) + "..." });
          }
          return json({ success: true, response: "The artifact engine refused: " + (iae.reason || "unsupported kind") + " - no guessing, no fake app." });
        } catch (err2) {
          return json({ success: true, response: "The HARZ artifact engine is unreachable right now, so I will not pretend to build. Please try again shortly." });
        }
      }
      // P1 (Dad's Go, Oct 11 2026): HARZ Search evidence path. Sovereign retrieval via
      // service binding - no external AI. Fires only when live evidence scores >= 13
      // (measured noise floor Oct 11: greetings 7.83, general knowledge 10-12.5;
      // real ecosystem facts 14+). Below threshold or on any failure the normal
      // chat path runs, byte-identical. Retrieved evidence is labelled as such and
      // never presented as inference.
      if (env2 && env2.SEARCH && msg0 && msg0.length <= 300) {
        try {
          const sres = await env2.SEARCH.fetch("https://harz-search/search?q=" + encodeURIComponent(msg0));
          const sd = await sres.json();
          const top = sd && Array.isArray(sd.results) && sd.results[0];
          if (top && typeof top.score === "number" && top.score >= 13 && (top.snippet || top.url) && isTrustedEvidence(String(top.url || ""))) {
            const evText = String(top.title || "") + "\n" + String(top.url || "") + "\n" + String(top.snippet || "") + "\nscore:" + top.score;
            const evBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(evText));
            const evReceipt = Array.from(new Uint8Array(evBuf)).map(function(b2){ return b2.toString(16).padStart(2, "0"); }).join("").slice(0, 16);
            const evNote = detectReplyLanguage(msg0) === "ha" ? "\n\nLURA (Hausa): Ana nuna wannan shaidar da harshenta na asali kamar yadda aka dawo da ita - ba a fassara ba, don haka ma'anarta ba ta canza ba." : "";
            return json({ success: true, response: "\u25CF LIVE \u00B7 TRUSTED ECOSYSTEM SOURCE \u2014 RETRIEVED CONTENT, NOT VERIFIED FOR RELEVANCE\n\n" + String(top.snippet || "").trim() + "\n\nSource: " + String(top.title || "") + "\n" + String(top.url || "") + "\nEvidence receipt: " + evReceipt + " \u00B7 relevance " + top.score + " \u00B7 match " + String(sd.match || "n/a") + " \u00B7 strict_total " + String((sd && sd.strict_total != null) ? sd.strict_total : "n/a") + " \u00B7 trusted source\n\nThis is retrieved evidence from the HARZ ecosystem index - not my own inference. If it does not answer your question, ask differently." + evNote });
          }
        } catch (e3) { /* evidence path unavailable: fall through to normal chat, honestly */ }
      }
      const response = await chatAI(body.message || "", body.history || [], env2);
        return json({ success: true, response });
      } catch (err) {
        return json({ success: false, error: err.message });
      }
    }
    if (path === "/image" && method === "POST") {
      try {
        const body = await request.json();
        const result2 = await generateImage(body.prompt || "abstract art");
        return json(result2);
      } catch (err) {
        return json({ success: false, error: err.message });
      }
    }
    if (path === "/vision" && method === "POST") {
      try {
        const body = await request.json();
        const result2 = await visionAI(body.image, body.question, env2);
        return json(result2);
      } catch (err) {
        return json({ success: false, error: err.message });
      }
    }
    if (path === "/code" && method === "POST") {
      try {
        const body = await request.json();
        const response = await codeAI(body.message || body.prompt || "", env2);
        return json({ success: true, response });
      } catch (err) {
        return json({ success: false, error: err.message });
      }
    }
    if (path === "/math" && method === "POST") {
      try {
        const body = await request.json();
        const expr = body.message || body.expression || body.prompt || "";
        const result2 = await mathAI(expr, env2);
        return json(result2);
      } catch (err) {
        return json({ success: false, error: err.message });
      }
    }
    if (path === "/weather" && method === "POST") {
      try {
        const body = await request.json();
        const result2 = await getWeather(body.city || body.message || body.location || "Lagos");
        return json(result2);
      } catch (err) {
        return json({ success: false, error: err.message });
      }
    }
    if (path === "/fetch" && method === "GET") {
      const targetUrl = url.searchParams.get("url");
      if (!targetUrl) return json({ success: false, error: "url parameter required" }, 400);
      const result2 = await fetchURL(targetUrl);
      return json(result2);
    }
    if (path === "/fetch" && method === "POST") {
      try {
        const body = await request.json();
        const result2 = await fetchURL(body.url || body.target || "");
        return json(result2);
      } catch (err) {
        return json({ success: false, error: err.message });
      }
    }
    if (path === "/share" || path.startsWith("/share/")) {
      return handleShare(request, env2, method);
    }
    return json({
      success: false,
      error: "Not found",
      available: ["/app", "/health", "/chat", "/image", "/vision", "/code", "/math", "/weather", "/capabilities", "/share", "/fetch"]
    }, 404);
  },
  async scheduled(event, env2, ctx) {
    try {
      await runHotline(env2);
    } catch (err) {
      console.log("HOTLINE cron error", err && err.message);
    }
  }
};
export {
  harz_ai_v660_default as default
};
//# sourceMappingURL=harz-ai-v660.js.map

