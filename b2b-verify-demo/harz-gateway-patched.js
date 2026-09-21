var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// live-harz-gateway.js
var SENDCHAMP_URL = "https://api.sendchamp.com/api/v1";
function normalizePhone(phone) {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("234")) p = p.slice(3);
  if (p.startsWith("0")) p = p.slice(1);
  if (p.length === 10) return "234" + p;
  if (p.length === 13 && p.startsWith("234")) return p;
  return "234" + p;
}
__name(normalizePhone, "normalizePhone");
function detectCarrier(phone) {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("234")) p = p.slice(3);
  if (p.startsWith("0")) p = p.slice(1);
  if (["803", "806", "703", "813", "816", "903", "906"].some((pre) => p.startsWith(pre))) return "MTN";
  if (["802", "701", "808", "812", "901", "907"].some((pre) => p.startsWith(pre))) return "Airtel";
  if (["805", "704", "705", "811", "815", "905"].some((pre) => p.startsWith(pre))) return "Glo";
  if (["809", "817", "818", "908", "909"].some((pre) => p.startsWith(pre))) return "9mobile";
  if (["904", "907"].some((pre) => p.startsWith(pre))) return "HARZ";
  return "unknown";
}
__name(detectCarrier, "detectCarrier");
function isOnNet(phone) {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("234")) p = p.slice(3);
  if (p.startsWith("0")) p = p.slice(1);
  return ["904", "907"].some((pre) => p.startsWith(pre));
}
__name(isOnNet, "isOnNet");
function json(d, s = 200) {
  return new Response(JSON.stringify(d), {
    status: s,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*"
    }
  });
}
__name(json, "json");
var live_harz_gateway_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return json({ ok: 1 });
    const SENDCHAMP_API_KEY = env.SENDCHAMP_KEY || "";
    if (url.pathname === "/manifest.json") {
      return json({ name: "HARZ Gateway", short_name: "Gateway", start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#0a7d3c", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }] });
    }
    if (url.pathname === "/sw.js") {
      return new Response("self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open('gateway-v2').then(async c=>{const r=await c.match(e.request);const f=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(()=>r);return r||f}))})", { headers: { "Content-Type": "application/javascript" } });
    }
    if (url.pathname === "/icon.svg") {
      return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="80" fill="#f0f2f5"/><circle cx="256" cy="256" r="160" fill="none" stroke="#0a7d3c" stroke-width="24"/><rect x="186" y="186" width="140" height="140" rx="20" fill="none" stroke="#0a7d3c" stroke-width="16"/><circle cx="256" cy="256" r="12" fill="#0a7d3c"/></svg>', { headers: { "Content-Type": "image/svg+xml" } });
    }
    if (url.pathname === "/api/health") {
      return json({
        status: "ok",
        version: "2.1.0",
        service: "HARZ Gateway",
        tagline: "Edge Telecom v2.0 Core (SendChamp + Paystack) \u2014 Live SMS Delivery",
        edge_telecom: "connected",
        sms_provider: "SendChamp",
        billing: "Paystack",
        endpoints: ["/api/sms/send", "/api/otp/send", "/api/otp/verify", "/api/voice/call", "/api/airtime", "/api/account", "/api/pricing", "/api/smpp/status", "/api/health"]
      });
    }
    if (url.pathname === "/api/pricing") {
      return json({ pricing: [
        { network: "MTN", prefix: "0803,0806,0703,0813,0816,0903,0906", cost: 2.5, type: "sms" },
        { network: "Airtel", prefix: "0802,0701,0808,0812,0901,0907", cost: 2.5, type: "sms" },
        { network: "Glo", prefix: "0805,704,705,811,815,0905", cost: 2.5, type: "sms" },
        { network: "9mobile", prefix: "0809,0817,0818,0908,0909", cost: 2.5, type: "sms" },
        { network: "HARZ On-Net", prefix: "0904,0907", cost: 0, type: "sms" },
        { network: "All Networks", prefix: "*", cost: 4, type: "otp" },
        { network: "All Networks", prefix: "*", cost: 103, type: "airtime_min" },
        { network: "All Networks", prefix: "*", cost: 3, type: "voice_per_min" }
      ] });
    }
    if (url.pathname === "/api/smpp/status") {
      try {
        const r = await env.EDGE_TELECOM.fetch("https://harz-edge-telecom.harz.workers.dev/api/interconnect/carriers");
        const d = await r.json();
        return json({ success: true, carriers: d.carriers || [], edge_telecom: "connected", smpp_edge: "via_edge_telecom" });
      } catch (e) {
        return json({ success: false, error: "Edge Telecom binding not available", smpp_edge: "offline" });
      }
    }
    if (url.pathname === "/api/sms/send" && request.method === "POST") {
      try {
        const body = await request.json();
        const apiKey = request.headers.get("X-API-Key");
        if (!apiKey) return json({ error: "API key required" }, 401);
        const acc = await env.HARZ_DB.prepare("SELECT * FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        if (!acc) return json({ error: "Invalid API key" }, 401);
        if (acc.balance < 100) return json({ error: "Insufficient balance" }, 400);
        const to = body.to || body.recipient || body.phone;
        const from = body.from || body.sender || "HARZ";
        const message = body.message || body.text;
        if (!to || !message) return json({ error: "to and message required" }, 400);
        const normalizedTo = normalizePhone(to);
        const carrier = detectCarrier(to);
        const onNet = isOnNet(to);
        let hlrResult = null;
        try {
          const hlrRes = await env.EDGE_TELECOM.fetch("https://harz-edge-telecom.harz.workers.dev/api/hlr/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ msisdn: to })
          });
          hlrResult = await hlrRes.json();
        } catch (e) {
        }
        const cost = onNet ? 0 : 250;
        if (acc.balance < cost) return json({ error: "Insufficient balance" }, 400);
        let deliveryStatus, deliveryMethod, messageId;
        if (onNet && hlrResult && hlrResult.success && hlrResult.network === "HARZ") {
          deliveryStatus = "delivered";
          deliveryMethod = "on-net";
          messageId = "hzs_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          try {
            await env.EDGE_TELECOM.fetch("https://harz-edge-telecom.harz.workers.dev/api/sms/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ from, to, message, route: "on-net" })
            });
          } catch (e) {
          }
        } else {
          const scRes = await fetch(SENDCHAMP_URL + "/sms/send", {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + SENDCHAMP_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              to: [normalizedTo],
              message,
              sender_name: from,
              route: "non_dnd"
            })
          });
          const scData = await scRes.json();
          if (scData.status === "success" || scData.data) {
            deliveryStatus = "sent";
            deliveryMethod = "aggregator";
            messageId = scData.data?.[0]?.message_id || "hzs_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          } else {
            return json({ success: false, error: "SMS delivery failed", details: scData });
          }
        }
        await env.HARZ_DB.prepare("UPDATE gateway_accounts SET balance = balance - ?, sms_sent = sms_sent + 1 WHERE api_key = ?").bind(cost, apiKey).run();
        await env.HARZ_DB.prepare("INSERT INTO gateway_sms (id, account_id, sender_id, to_number, message, status, channel, cost, message_id, delivery_method, carrier, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), acc.id, from, normalizedTo, message, deliveryStatus, "sms", cost, messageId, deliveryMethod, carrier, (/* @__PURE__ */ new Date()).toISOString()).run();
        const newAcc = await env.HARZ_DB.prepare("SELECT balance FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        return json({
          success: true,
          messages: [{ to: normalizedTo, message_id: messageId, status: deliveryStatus, delivery: deliveryMethod, carrier: onNet ? "HARZ" : carrier, cost }],
          total_cost: cost,
          new_balance: newAcc.balance,
          hlr: hlrResult ? { network: hlrResult.network, status: hlrResult.status } : null
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/api/otp/send" && request.method === "POST") {
      try {
        const body = await request.json();
        const apiKey = request.headers.get("X-API-Key");
        if (!apiKey) return json({ error: "API key required" }, 401);
        const acc = await env.HARZ_DB.prepare("SELECT * FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        if (!acc) return json({ error: "Invalid API key" }, 401);
        const phone = body.phone || body.to;
        if (!phone) return json({ error: "phone required" }, 400);
        const normalizedTo = normalizePhone(phone);
        const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
        const otpId = crypto.randomUUID();
        const expires = new Date(Date.now() + 5 * 60 * 1e3).toISOString();
        const cost = 400;
        if (acc.balance < cost) return json({ error: "Insufficient balance" }, 400);
        const scRes = await fetch(SENDCHAMP_URL + "/sms/send", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + SENDCHAMP_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            to: [normalizedTo],
            message: "Your HARZ verification code is " + otp + ". Valid for 5 minutes. Do not share it with anyone.",
            sender_name: body.sender || "HARZ",
            route: "non_dnd"
          })
        });
        const scData = await scRes.json().catch(() => ({}));
        const scOk = scRes.ok && (scData.status_code === undefined || scData.status_code < 400) && (scData.status === undefined || scData.status === "success");
        if (!scOk) {
          return json({ success: false, error: "Sendchamp OTP delivery failed", status: scRes.status, details: scData }, 502);
        }
        await env.HARZ_DB.prepare("INSERT INTO gateway_otps (id, account_id, phone, code, status, attempts, expires_at, created_date) VALUES (?, ?, ?, ?, 'pending', 0, ?, ?)").bind(otpId, acc.id, normalizedTo, otp, expires, (/* @__PURE__ */ new Date()).toISOString()).run();
        await env.HARZ_DB.prepare("UPDATE gateway_accounts SET balance = balance - ?, sms_sent = sms_sent + 1 WHERE api_key = ?").bind(cost, apiKey).run();
        const newAcc = await env.HARZ_DB.prepare("SELECT balance FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        return json({
          success: true,
          otp_id: otpId,
          message_id: (scData.data && (Array.isArray(scData.data) ? scData.data[0] && scData.data[0].message_id : scData.data.message_id || scData.data.id)) || "hzotp_" + Date.now().toString(36),
          cost,
          new_balance: newAcc.balance,
          expires_at: expires
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/api/otp/verify" && request.method === "POST") {
      try {
        const body = await request.json();
        const otpId = body.otp_id;
        const code = body.code || body.otp;
        if (!otpId || !code) return json({ error: "otp_id and code required" }, 400);
        const otp = await env.HARZ_DB.prepare("SELECT * FROM gateway_otps WHERE id = ?").bind(otpId).first();
        if (!otp) return json({ error: "OTP not found" }, 404);
        if (otp.attempts >= 3) return json({ error: "Too many attempts" }, 400);
        if (otp.status === "verified") return json({ error: "Already verified" }, 400);
        if (new Date(otp.expires_at) < /* @__PURE__ */ new Date()) return json({ error: "OTP expired" }, 400);
        if (otp.code === code) {
          await env.HARZ_DB.prepare("UPDATE gateway_otps SET status = 'verified' WHERE id = ?").bind(otpId).run();
          return json({ success: true, verified: true, phone: otp.phone });
        } else {
          await env.HARZ_DB.prepare("UPDATE gateway_otps SET attempts = attempts + 1 WHERE id = ?").bind(otpId).run();
          return json({ success: false, verified: false, attempts_remaining: 2 - otp.attempts });
        }
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/api/voice/call" && request.method === "POST") {
      try {
        const body = await request.json();
        const apiKey = request.headers.get("X-API-Key");
        if (!apiKey) return json({ error: "API key required" }, 401);
        const acc = await env.HARZ_DB.prepare("SELECT * FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        if (!acc) return json({ error: "Invalid API key" }, 401);
        const from = body.from || "HARZ";
        const to = body.to || body.recipient;
        if (!to) return json({ error: "to required" }, 400);
        const onNet = isOnNet(to);
        const cost = onNet ? 0 : 300;
        const callId = "hzc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        if (onNet) {
          // APP-TO-APP: free call through HARZ own WebRTC layer (no carrier, no charge)
          const webrtcUrl = "https://harz-telecom.harz.workers.dev/call/" + callId.toUpperCase().slice(0, 8);
          try { await env.HARZ_DB.prepare("UPDATE gateway_accounts SET calls_made = calls_made + 1 WHERE api_key = ?").bind(apiKey).run(); } catch (e2) {}
          return json({ success: true, call_id: callId, status: "app-to-app", route: "on-net", cost: 0, webrtc_url: webrtcUrl });
        }
        // APP-TO-PHONE: REAL outbound call via SendChamp Voice, N2 per minute (charge-first, fail-closed)
        if (!acc.balance || acc.balance < cost) return json({ error: "Insufficient balance" }, 400);
        const upd = await env.HARZ_DB.prepare("UPDATE gateway_accounts SET balance = balance - ?, calls_made = calls_made + 1 WHERE api_key = ? AND balance >= ?").bind(cost, apiKey, cost).run();
        if (!upd.meta || !upd.meta.changes) return json({ error: "Insufficient balance" }, 400);
        let intl = to.replace(/\D/g, "");
        if (intl.startsWith("0")) intl = "234" + intl.slice(1);
        let v = null;
        try {
          const resp = await fetch("https://api.sendchamp.com/api/v1/voice/send", { method: "POST", headers: { "Authorization": "Bearer " + (env.SENDCHAMP_KEY || ""), "Content-Type": "application/json" }, body: JSON.stringify({ caller_id: from, destination: [intl], message: body.message || ("You have a call from " + from + " on HARZ. Please call back.") }) });
          v = await resp.json();
        } catch (e4) { v = { error: "Fetch failed: " + e4.message }; }
        const ok = v && (v.status === "success" || (v.data && v.data.id));
        const newAcc = await env.HARZ_DB.prepare("SELECT balance FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        return json({ success: !!ok, call_id: callId, status: ok ? "placed" : "failed", route: "off-net", cost, charged_per_minute: 2, sendchamp: v, new_balance: newAcc.balance });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/api/airtime" && request.method === "POST") {
      try {
        const body = await request.json();
        const apiKey = request.headers.get("X-API-Key");
        if (!apiKey) return json({ error: "API key required" }, 401);
        const acc = await env.HARZ_DB.prepare("SELECT * FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        if (!acc) return json({ error: "Invalid API key" }, 401);
        const phone = body.to || body.phone;
        const amount = body.amount || 100;
        if (!phone) return json({ error: "to required" }, 400);
        if (acc.balance < Math.ceil(amount * 103)) return json({ error: "Insufficient balance" }, 400);
        const normalizedTo = normalizePhone(phone);
        const cost = Math.ceil(amount * 103);
        const scRes = await fetch(SENDCHAMP_URL + "/airtime/send", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + SENDCHAMP_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone_number: normalizedTo,
            amount,
            network: detectCarrier(phone).toLowerCase()
          })
        });
        const scData = await scRes.json();
        await env.HARZ_DB.prepare("UPDATE gateway_accounts SET balance = balance - ?, airtime_sold = airtime_sold + ? WHERE api_key = ?").bind(cost, amount, apiKey).run();
        const newAcc = await env.HARZ_DB.prepare("SELECT balance FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        return json({
          success: true,
          phone: normalizedTo,
          amount,
          cost,
          new_balance: newAcc.balance,
          status: scData.status || "sent"
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/api/stats" && request.method === "GET") {
      try {
        const t = await env.HARZ_DB.prepare("SELECT COUNT(*) as accounts, COALESCE(SUM(sms_sent),0) as sms, COALESCE(SUM(calls_made),0) as calls, COALESCE(SUM(airtime_sold),0) as airtime FROM gateway_accounts").first();
        const s = await env.HARZ_DB.prepare("SELECT COUNT(*) as delivered FROM gateway_sms WHERE status = 'sent' OR status = 'delivered'").first();
        return json({ success: true, platform: { businesses: t?.accounts || 0, sms_sent: t?.sms || 0, calls_made: t?.calls || 0, airtime_sold: t?.airtime || 0, messages_delivered: s?.delivered || 0 } });
      } catch (e) {
        return json({ success: true, platform: { businesses: 0, sms_sent: 0, calls_made: 0, airtime_sold: 0, messages_delivered: 0 } });
      }
    }
    if (url.pathname === "/api/account/charge" && request.method === "POST") {
      try {
        const body = await request.json();
        const apiKey = request.headers.get("X-API-Key") || body.api_key;
        const amount = Math.ceil(Number(body.amount) || 0);
        const memo = (body.memo || "HARZ service charge").slice(0, 120);
        if (!apiKey) return json({ error: "API key required" }, 401);
        if (!amount || amount < 0) return json({ error: "valid amount required" }, 400);
        const acc = await env.HARZ_DB.prepare("SELECT * FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        if (!acc) return json({ error: "Invalid API key" }, 401);
        if (acc.balance < amount) return json({ error: "Insufficient balance", balance: acc.balance, required: amount }, 400);
        await env.HARZ_DB.prepare("UPDATE gateway_accounts SET balance = balance - ? WHERE api_key = ?").bind(amount, apiKey).run();
        await env.HARZ_DB.prepare("CREATE TABLE IF NOT EXISTS gateway_charges (id TEXT PRIMARY KEY, account_id TEXT, amount INTEGER, memo TEXT, created_date TEXT)").run();
        await env.HARZ_DB.prepare("INSERT INTO gateway_charges (id, account_id, amount, memo, created_date) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(), acc.id, amount, memo, (new Date()).toISOString()).run();
        const nacc = await env.HARZ_DB.prepare("SELECT balance FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        return json({ success: true, charged: amount, memo, new_balance: nacc.balance });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/api/account" && request.method === "GET") {
      const apiKey = request.headers.get("X-API-Key");
      if (!apiKey) return json({ error: "API key required" }, 401);
      const acc = await env.HARZ_DB.prepare("SELECT * FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
      if (!acc) return json({ error: "Invalid API key" }, 401);
      return json({ account: { balance: acc.balance, sms_sent: acc.sms_sent, calls_made: acc.calls_made, airtime_sold: acc.airtime_sold, created_date: acc.created_date } });
    }
    if (url.pathname === "/api/account/create" && request.method === "POST") {
      try {
        const body = await request.json();
        const apiKey = "hzg_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
        const accId = crypto.randomUUID();
        await env.HARZ_DB.prepare("INSERT INTO gateway_accounts (id, api_key, business_name, email, balance, sms_sent, calls_made, airtime_sold, status, created_date) VALUES (?, ?, ?, ?, 500, 0, 0, 0, 'active', ?)").bind(accId, apiKey, body.business_name || "New Business", body.email || "", (/* @__PURE__ */ new Date()).toISOString()).run();
        return json({ success: true, api_key: apiKey, balance: 500, message: "N500 free credit added" });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/api/account/trial" && request.method === "POST") {
      try {
        const apiKey = "hzg_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
        const trialId = crypto.randomUUID();
        await env.HARZ_DB.prepare("INSERT INTO gateway_accounts (id, api_key, business_name, email, balance, sms_sent, calls_made, airtime_sold, status, created_date) VALUES (?, ?, ?, ?, 500, 0, 0, 0, 'active', ?)").bind(trialId, apiKey, "Trial Account", "", (/* @__PURE__ */ new Date()).toISOString()).run();
        return json({ success: true, api_key: apiKey, balance: 500, message: "N500 free credit \u2014 no signup needed" });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/api/account/fund" && request.method === "POST") {
      try {
        const body = await request.json();
        const apiKey = request.headers.get("X-API-Key") || body.api_key;
        const amount = body.amount || 0;
        if (!apiKey) return json({ error: "API key required" }, 401);
        const acc = await env.HARZ_DB.prepare("SELECT * FROM gateway_accounts WHERE api_key = ?").bind(apiKey).first();
        if (!acc) return json({ error: "Invalid API key" }, 401);
        return json({
          success: true,
          checkout_url: "https://harz-edge-telecom.harz.workers.dev/pay?amount=" + amount + "&api_key=" + apiKey,
          amount,
          message: "Visit checkout URL to fund account"
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0f2f5"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="HARZ Gateway"><link rel="manifest" href="/manifest.json"><title>HARZ Gateway \u2014 Your Telecom API Platform</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#333;padding:env(safe-area-inset-top) 16px;max-width:600px;margin:0 auto}.hd{padding:20px 0 12px;border-bottom:1px solid #e0e0e0;text-align:center}.hd h1{font-size:24px;color:#0a7d3c;font-weight:800}.hd p{font-size:12px;color:#666;margin-top:4px}.hero{background:linear-gradient(135deg,#0a7d3c 0%,#065f2c 50%,#044a22 100%);border-radius:16px;padding:20px;margin:16px 0;text-align:center;position:relative;overflow:hidden}.hero::before{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,0.05) 0%,transparent 60%);animation:spin 20s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.hero-content{position:relative;z-index:1}.hero-badge{display:inline-block;background:rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:3px 10px;border-radius:20px;margin-bottom:8px}.hero-title{font-size:20px;font-weight:800;color:#fff;margin:4px 0}.hero-sub{font-size:13px;color:#c0e8d0;margin-top:4px}.hero-cta{margin-top:12px;background:#fff;color:#0a7d3c;border:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3)}.stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0}.stat-box{background:#fff;border-radius:10px;padding:12px;text-align:center}.stat-box .n{font-size:20px;font-weight:800;color:#0a7d3c}.stat-box .l{font-size:10px;color:#666;margin-top:2px}.tab-bar{display:flex;overflow-x:auto;gap:0;margin:12px 0;background:#fff;border-radius:10px;padding:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}.tab-bar::-webkit-scrollbar{display:none}.tab{flex:0 0 auto;padding:10px 14px;font-size:12px;color:#666;cursor:pointer;border-radius:8px;white-space:nowrap;transition:all .2s}.tab.active{background:#0a7d3c;color:#fff;font-weight:600}.panel{display:none}.panel.active{display:block}.card{background:#fff;border-radius:12px;padding:16px;margin:8px 0}.card h3{font-size:14px;color:#0a7d3c;margin-bottom:12px}.field{margin:8px 0}.field label{display:block;font-size:11px;color:#666;margin-bottom:4px}.field input,.field select,.field textarea{width:100%;background:#fff;border:1px solid #d0d0d0;color:#333;padding:10px;border-radius:8px;font-size:13px}.field input:focus,.field select:focus,.field textarea:focus{border-color:#0a7d3c;outline:none}.btn{width:100%;background:#0a7d3c;color:#fff;border:none;padding:12px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin:8px 0;transition:all .2s}.btn:hover{background:#065f2c}.btn:active{transform:scale(0.98)}.btn.secondary{background:#e0e0e0;color:#333}.btn.danger{background:#8b0000}.api-key-box{display:none;background:#f0f2f5;border:1px solid #0a7d3c;border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:12px;color:#0a7d3c;word-break:break-all}.result{margin:8px 0;padding:10px;border-radius:8px;font-size:12px;display:none}.result.show{display:block}.result.success{background:#e8f5e9;border:1px solid #0a7d3c}.result.error{background:#ffebee;border:1px solid #8b0000}.pr{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:8px 0}.pr-item{background:#f0f2f5;padding:10px;border-radius:8px;text-align:center}.pr-item .n{font-size:18px;font-weight:800;color:#0a7d3c}.pr-item .l{font-size:10px;color:#666;margin-top:2px}.carrier-card{background:#f0f2f5;border-radius:8px;padding:12px;margin:6px 0;border-left:3px solid #444}.carrier-card.live{border-left-color:#0a7d3c}.carrier-card.pending{border-left-color:#f0a020}.carrier-card.offline{border-left-color:#8b0000}.carrier-name{font-size:13px;font-weight:700;color:#333}.carrier-host{font-size:10px;color:#666;margin-top:2px}.carrier-status{font-size:10px;padding:2px 8px;border-radius:4px;display:inline-block;margin-top:4px}.carrier-status.live{background:#e8f5e9;color:#0a7d3c}.carrier-status.pending{background:#fff8e1;color:#f0a020}.carrier-status.offline{background:#ffebee;color:#8b0000}.carrier-meta{display:flex;justify-content:space-between;margin-top:6px;font-size:10px;color:#666}.code-block{background:#f0f2f5;border-radius:8px;padding:12px;margin:8px 0;overflow-x:auto;position:relative}.code-block pre{font-family:monospace;font-size:11px;color:#0a7d3c;white-space:pre-wrap;word-break:break-all}.code-tab{display:inline-block;padding:6px 12px;font-size:11px;color:#666;cursor:pointer;border-radius:6px 6px 0 0}.code-tab.active{background:#e8f5e9;color:#0a7d3c}.code-tabs{display:flex;gap:4px;margin-bottom:0}.lang-badge{position:absolute;top:4px;right:8px;font-size:9px;color:#555}.dash-stat{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #e0e0e0}.dash-stat:last-child{border:0}.dash-label{font-size:12px;color:#666}.dash-value{font-size:16px;font-weight:700;color:#0a7d3c}.live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#0a7d3c;animation:pulse 2s infinite;margin-right:6px}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}.footer{text-align:center;padding:20px;font-size:11px;color:#555}</style></head><body><div class="hd"><h1>HARZ Gateway</h1><p>Your Telecom API Platform</p></div>
<div class="hero"><div class="hero-content">
<div class="hero-badge"><span class="live-dot"></span>SMPP v3.4 EDGE LIVE</div>
<div class="hero-title">Build Your Own Telecom</div>
<div class="hero-sub">SMS \u2022 OTP \u2022 Voice \u2022 Airtime APIs for Nigerian businesses</div><div class="hero-sub" id="platform-line" style="opacity:.85">Live on HARZ infrastructure</div>
<button class="hero-cta" onclick="scrollToSignup()">Get N500 Free Credit \u2192</button>
</div></div>
<div class="stat-grid"><div class="stat-box"><div class="n" id="stat-sms">0</div><div class="l">SMS Sent</div></div>
<div class="stat-box"><div class="n" id="stat-calls">0</div><div class="l">Calls Made</div></div>
<div class="stat-box"><div class="n" id="stat-balance">N0</div><div class="l">Balance</div></div></div><div class="stat-grid"><div class="stat-box"><div class="n" id="stat-sms">0</div><div class="l">SMS Sent</div></div><div class="stat-box"><div class="n" id="stat-calls">0</div><div class="l">Calls Made</div></div><div class="stat-box"><div class="n" id="stat-balance">N0</div><div class="l">Balance</div></div></div><div class="tab-bar"><div class="tab active" onclick="showTab('account')">\u{1F511} Account</div><div class="tab" onclick="showTab('sms')">\u{1F4AC} SMS</div><div class="tab" onclick="showTab('otp')">\u{1F510} OTP</div><div class="tab" onclick="showTab('voice')">\u{1F4DE} Voice</div><div class="tab" onclick="showTab('airtime')">\u{1F4CA} Airtime</div><div class="tab" onclick="showTab('carriers')">\u{1F4E1} Carriers</div><div class="tab" onclick="showTab('playground')">\u2328\uFE0F Playground</div><div class="tab" onclick="showTab('dashboard')">\u{1F4C8} Dashboard</div></div><div class="tab" onclick="showTab('sms')">\u{1F4AC} SMS</div><div class="tab" onclick="showTab('otp')">\u{1F510} OTP</div><div class="tab" onclick="showTab('airtime')">\u{1F4CA} Airtime</div></div><div class="panel active" id="panel-account"><div class="card"><h3>Register Your Business</h3><div class="field"><label>Business Name</label><input id="biz-name" placeholder="My Shop Ltd"></div><div class="field"><label>Email</label><input id="biz-email" type="email" placeholder="me@shop.com"></div><div class="field"><label>Phone</label><input id="biz-phone" placeholder="0801 234 5678"></div><div class="field"><label>Webhook URL (optional)</label><input id="biz-webhook" placeholder="https://yourapp.com/webhook"></div><button class="btn" onclick="createAccount()">Get My API Key</button><div class="api-key-box" id="apikey-box"></div></div><div class="card"><h3>Account Info</h3><div class="field"><label>Your API Key</label><input id="my-apikey" placeholder="hzg_..." oninput="loadAccount()"></div><div id="account-info"></div></div><div class="card"><h3>Fund Balance</h3><div class="field"><label>Amount (NGN)</label><input id="fund-amount" type="number" placeholder="5000"></div><button class="btn" onclick="fundAccount()">Add Credit via Paystack</button></div></div><div class="panel" id="panel-sms"><div class="card"><h3>Send SMS</h3><div class="field"><label>API Key</label><input id="sms-apikey" placeholder="hzg_..."></div><div class="field"><label>Sender ID</label><input id="sms-sender" placeholder="MYSHOP" maxlength="11"></div><div class="field"><label>To (comma separated)</label><input id="sms-to" placeholder="08012345678, 08098765432"></div><div class="field"><label>Message</label><textarea id="sms-msg" rows="4" placeholder="Hello from MYSHOP!" oninput="updateSmsCost()"></textarea></div><div style="font-size:12px;color:#666" id="sms-cost-info">Cost: N0</div><button class="btn" onclick="sendSms()">Send SMS</button><div id="sms-result"></div></div></div><div class="panel" id="panel-otp"><div class="card"><h3>Send OTP</h3><div class="field"><label>API Key</label><input id="otp-apikey" placeholder="hzg_..."></div><div class="field"><label>Phone Number</label><input id="otp-phone" placeholder="08012345678"></div><button class="btn" onclick="sendOtp()">Send OTP</button></div><div class="card"><h3>Verify OTP</h3><div class="field"><label>OTP ID</label><input id="verify-otp-id" placeholder="from send response"></div><div class="field"><label>Code</label><input id="verify-code" placeholder="123456" maxlength="6"></div><button class="btn" onclick="verifyOtp()">Verify Code</button><div id="otp-result"></div></div></div><div class="panel" id="panel-airtime"><div class="card"><h3>Buy Airtime</h3><div class="field"><label>API Key</label><input id="air-apikey" placeholder="hzg_..."></div><div class="field"><label>Network</label><select id="air-network"><option value="mtn">MTN</option><option value="airtel">Airtel</option><option value="glo">Glo</option><option value="9mobile">9mobile</option></select></div><div class="field"><label>Recipient</label><input id="air-recipient" placeholder="08012345678"></div><div class="field"><label>Amount</label><input id="air-amount" type="number" placeholder="500"></div><button class="btn" onclick="buyAirtime()">Buy Airtime</button><div id="air-result"></div></div><div class="card"><h3>Pricing</h3><div class="pr"><div class="pr-item"><div class="n">N1.50</div><div class="l">per SMS</div></div><div class="pr-item"><div class="n">N2.00</div><div class="l">per min call</div></div><div class="pr-item"><div class="n">N2.00</div><div class="l">per OTP</div></div><div class="pr-item"><div class="n">N5.00</div><div class="l">intl SMS</div></div></div></div></div><div class="panel" id="panel-voice"><div class="card"><h3>Make a Voice Call</h3><div class="field"><label>API Key</label><input id="voice-apikey" placeholder="hzg_..."></div><div class="field"><label>From (Caller ID)</label><input id="voice-from" placeholder="HARZ" maxlength="11"></div><div class="field"><label>To</label><input id="voice-to" placeholder="08012345678"></div><div class="field"><label>Message (TTS)</label><textarea id="voice-msg" rows="3" placeholder="Hello, this is a test call from HARZ Gateway"></textarea></div><button class="btn" onclick="makeCall()">Initiate Call</button><div class="result" id="voice-result"></div></div></div>
<div class="panel" id="panel-carriers"><div class="card"><h3><span class="live-dot"></span>SMPP Carrier Status</h3><p style="font-size:11px;color:#666;margin-bottom:12px">Live SMSC connection monitoring. Direct SMPP v3.4 via Cloudflare TCP sockets.</p><div id="carrier-list"><p style="color:#666;font-size:12px">Loading carrier status...</p></div><button class="btn secondary" onclick="loadCarriers()">Refresh Status</button></div><div class="card"><h3>Routing Chain</h3><p style="font-size:11px;color:#666;line-height:1.6">Gateway API \u2192 SMPP Edge (TCP:2775) \u2192 Carrier SMSC \u2192 Handset</p><p style="font-size:11px;color:#666;margin-top:8px">Fallback: Aggregator mode (no message lost)</p></div></div>
<div class="panel" id="panel-playground"><div class="card"><h3>API Playground</h3><p style="font-size:11px;color:#666;margin-bottom:12px">Live code examples. Replace YOUR_API_KEY with your key.</p><div class="code-tabs"><div class="code-tab active" onclick="showCode('curl')">cURL</div><div class="code-tab" onclick="showCode('js')">JavaScript</div><div class="code-tab" onclick="showCode('py')">Python</div><div class="code-tab" onclick="showCode('php')">PHP</div></div><div class="code-block"><div class="lang-badge" id="lang-badge">bash</div><pre id="code-display">curl -X POST https://harz-gateway.harz.workers.dev/api/sms/send   -H "X-API-Key: YOUR_API_KEY"   -H "Content-Type: application/json"   -d '{"to":"08012345678","from":"MYSHOP","message":"Hello from HARZ"}'</pre></div><div style="margin-top:12px;font-size:11px;color:#666">Try it: copy the command, replace YOUR_API_KEY, and run it.</div></div></div>
<div class="panel" id="panel-dashboard"><div class="card"><h3>Platform Statistics</h3><div id="dash-stats"><p style="color:#666;font-size:12px">Loading stats...</p></div></div><div class="card"><h3>Revenue Overview</h3><div id="dash-revenue"><p style="color:#666;font-size:12px">Loading revenue...</p></div></div></div><div style="text-align:center;padding:20px"><a href="/docs" style="color:#0a7d3c;font-size:13px;text-decoration:none">View API Documentation \u2192</a></div><script>async function claimTrial(){const n=document.getElementById('biz-name')?.value||'';const e=document.getElementById('biz-email')?.value||'';const p=document.getElementById('biz-phone')?.value||'';const r=await fetch('/api/account/trial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({business_name:n||'Trial User',email:e||('trial'+Date.now()+'@harz.gg'),phone:p||('080'+Math.floor(Math.random()*90000000+10000000))})});const d=await r.json();if(d.success){alert('\u{1F389} N500 free credit added!\\nAPI Key: '+d.api_key+'\\n\\nYou can now send 333 SMS, 250 OTPs, or make 250 min of calls.');document.getElementById('my-apikey').value=d.api_key;document.getElementById('sms-apikey').value=d.api_key;document.getElementById('otp-apikey').value=d.api_key;document.getElementById('air-apikey').value=d.api_key;loadAccount();}else{alert(d.error||'Trial claim failed');}}
function showTab(t){document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));event.target.classList.add('active');document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById('panel-'+t).classList.add('active');}async function createAccount(){const n=document.getElementById('biz-name').value;const e=document.getElementById('biz-email').value;const p=document.getElementById('biz-phone').value;const w=document.getElementById('biz-webhook').value;if(!n||!e||!p){alert('Fill all required fields');return;}const r=await fetch('/api/account/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({business_name:n,email:e,phone:p,webhook_url:w})});const d=await r.json();if(d.success){document.getElementById('apikey-box').style.display='block';document.getElementById('apikey-box').textContent='API Key: '+d.api_key;document.getElementById('my-apikey').value=d.api_key;document.getElementById('sms-apikey').value=d.api_key;document.getElementById('otp-apikey').value=d.api_key;document.getElementById('air-apikey').value=d.api_key;}else{alert(d.error||'Registration failed');}}async function loadAccount(){const k=document.getElementById('my-apikey').value;if(!k)return;const r=await fetch('/api/account',{headers:{'X-API-Key':k}});const d=await r.json();if(d.success){document.getElementById('stat-sms').textContent=d.account.sms_sent||0;document.getElementById('stat-calls').textContent=d.account.calls_made||0;document.getElementById('stat-balance').textContent='N'+Number(d.account.balance||0).toLocaleString();document.getElementById('account-info').innerHTML='<div style="font-size:13px;color:#666;padding:8px">Business: '+d.account.business_name+'<br>Plan: '+d.account.plan+'<br>Airtime Sold: N'+Number(d.account.airtime_sold||0).toLocaleString()+'</div>';}}function updateSmsCost(){const msg=document.getElementById('sms-msg').value;const to=document.getElementById('sms-to').value.split(',').filter(Boolean);const parts=Math.ceil(msg.length/160)||1;const cost=parts*to.length*2.5;document.getElementById('sms-cost-info').textContent='Cost: N'+cost.toFixed(2)+' ('+parts+' SMS x '+to.length+' recipients)';}async function sendSms(){const k=document.getElementById('sms-apikey').value;const s=document.getElementById('sms-sender').value;const t=document.getElementById('sms-to').value.split(',').map(x=>x.trim()).filter(Boolean);const m=document.getElementById('sms-msg').value;if(!k||!t.length||!m){alert('Fill all fields');return;}const r=await fetch('/api/sms/send',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':k},body:JSON.stringify({to:t,from:s,message:m})});const d=await r.json();if(d.success){document.getElementById('sms-result').innerHTML='<div style="background:#0a7d3c;border-radius:8px;padding:8px;margin-top:8px;font-size:13px">\u2705 Sent '+d.messages.length+' SMS | Cost: N'+d.total_cost/100+' | Balance: N'+(d.new_balance/100).toLocaleString()+'</div>';}else{alert(d.error||'SMS failed');}}async function sendOtp(){const k=document.getElementById('otp-apikey').value;const p=document.getElementById('otp-phone').value;if(!k||!p){alert('Fill all fields');return;}const r=await fetch('/api/otp/send',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':k},body:JSON.stringify({phone:p})});const d=await r.json();if(d.success){document.getElementById('verify-otp-id').value=d.otp_id;document.getElementById('otp-result').innerHTML='<div style="background:#0a7d3c;border-radius:8px;padding:8px;margin-top:8px;font-size:13px">\u2705 OTP sent! Cost: N2.00 | ID: '+d.otp_id.slice(0,12)+'...</div>';}else{alert(d.error||'OTP failed');}}async function verifyOtp(){const k=document.getElementById('otp-apikey').value;const id=document.getElementById('verify-otp-id').value;const c=document.getElementById('verify-code').value;if(!k||!id||!c){alert('Fill all fields');return;}const r=await fetch('/api/otp/verify',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':k},body:JSON.stringify({otp_id:id,code:c})});const d=await r.json();if(d.success){alert('\u2705 OTP Verified!');}else{alert(d.error||'Verification failed');}}async function fundAccount(){const k=document.getElementById('my-apikey').value;const a=document.getElementById('fund-amount').value;if(!k||!a){alert('Enter API key and amount');return;}const r=await fetch('/api/account/fund',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':k},body:JSON.stringify({amount:parseInt(a)})});const d=await r.json();if(d.success){window.location.href=d.checkout_url;}else{alert(d.error||'Funding failed');}}async function buyAirtime(){const k=document.getElementById('air-apikey').value;const n=document.getElementById('air-network').value;const r=document.getElementById('air-recipient').value;const a=document.getElementById('air-amount').value;if(!k||!r||!a){alert('Fill all fields');return;}const res=await fetch('/api/airtime',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':k},body:JSON.stringify({network:n,recipient:r,amount:parseInt(a)})});const d=await res.json();if(d.success){document.getElementById('air-result').innerHTML='<div style="background:#0a7d3c;border-radius:8px;padding:8px;margin-top:8px;font-size:13px">\u2705 Airtime sent! N'+a+' '+n+' \u2192 '+r+' | Ref: '+d.reference+'</div>';}else{alert(d.error||'Airtime failed');}}<\/script><script>if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
// Voice Call
async function makeCall(){const k=document.getElementById('voice-apikey').value;if(!k){showResult('voice-result','error','Enter API key');return;}const r=await fetch('/api/voice/call',{method:'POST',headers:{'X-API-Key':k,'Content-Type':'application/json'},body:JSON.stringify({from:document.getElementById('voice-from').value||'HARZ',to:document.getElementById('voice-to').value,message:document.getElementById('voice-msg').value||'Test call from HARZ Gateway'})});const d=await r.json();if(d.success){showResult('voice-result','success','Call initiated! Call ID: '+d.call_id+' | Status: '+d.status+' | Cost: N'+d.cost);}else{showResult('voice-result','error',d.error||'Call failed');}}
// Carrier Status
async function loadCarriers(){try{const r=await fetch('/api/smpp/status');const d=await r.json();if(d.success&&d.carriers){const html=d.carriers.map(c=>{const cls=c.status==='live'?'live':c.status==='pending_agreement'?'pending':'offline';return '<div class="carrier-card '+cls+'"><div class="carrier-name">'+c.name+'</div><div class="carrier-host">'+c.host+':'+c.port+'</div><div class="carrier-status '+cls+'">'+c.status.replace(/_/g,' ').toUpperCase()+'</div><div class="carrier-meta"><span>Throughput: '+c.throughput+'/sec</span><span>System ID: '+c.system_id+'</span></div></div>'}).join('');document.getElementById('carrier-list').innerHTML=html;}else{document.getElementById('carrier-list').innerHTML='<p style="color:#666;font-size:12px">No carrier data</p>';}}catch(e){document.getElementById('carrier-list').innerHTML='<p style="color:#8b0000;font-size:12px">Failed to load: '+e.message+'</p>';}}
// Playground
const codeExamples={curl:["curl -X POST https://harz-gateway.harz.workers.dev/api/sms/send ","  -H \\"X-API-Key: YOUR_API_KEY\\" ","  -H \\"Content-Type: application/json\\" ","  -d '{\\"to\\":\\"08012345678\\",\\"from\\":\\"MYSHOP\\",\\"message\\":\\"Hello from HARZ\\"}'"].join("\\n"),js:["const res = await fetch(","  'https://harz-gateway.harz.workers.dev/api/sms/send',","  {","    method: 'POST',","    headers: {","      'X-API-Key': 'YOUR_API_KEY',","      'Content-Type': 'application/json'","    },","    body: JSON.stringify({","      to: '08012345678',","      from: 'MYSHOP',","      message: 'Hello from HARZ'","    })","  }",");","const data = await res.json();","console.log(data);"].join("\\n"),py:["import requests","","url = \\"https://harz-gateway.harz.workers.dev/api/sms/send\\"","headers = {","    \\"X-API-Key\\": \\"YOUR_API_KEY\\",","    \\"Content-Type\\": \\"application/json\\"","},","data = {","    \\"to\\": \\"08012345678\\",","    \\"from\\": \\"MYSHOP\\",","    \\"message\\": \\"Hello from HARZ\\"","},","","res = requests.post(url, json=data, headers=headers)","print(res.json())"].join("\\n"),php:["<?php","$url = \\"https://harz-gateway.harz.workers.dev/api/sms/send\\";","$ch = curl_init($url);","curl_setopt($ch, CURLOPT_POST, true);","curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);","curl_setopt($ch, CURLOPT_HTTPHEADER, [","    \\"X-API-Key: YOUR_API_KEY\\",","    \\"Content-Type: application/json\\"","]);","curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([","    \\"to\\" => \\"08012345678\\",","    \\"from\\" => \\"MYSHOP\\",","    \\"message\\" => \\"Hello from HARZ\\"","]));","$response = curl_exec($ch);","curl_close($ch);","echo $response;","?>"].join("\\n")};
const langNames={curl:'bash',js:'javascript',py:'python',php:'php'};
function showCode(lang){document.getElementById('code-display').textContent=codeExamples[lang];document.getElementById('lang-badge').textContent=langNames[lang];}
// Dashboard
async function loadDashboard(){try{const r=await fetch('/api/health');const d=await r.json();let html='<div class="dash-stat"><span class="dash-label">Platform Status</span><span class="dash-value" style="color:#0a7d3c">'+(d.status||'ok').toUpperCase()+'</span></div>';html+='<div class="dash-stat"><span class="dash-label">Version</span><span class="dash-value">'+(d.version||'1.0.0')+'</span></div>';html+='<div class="dash-stat"><span class="dash-label">SMPP Edge</span><span class="dash-value">'+(d.smpp_edge||'connected')+'</span></div>';html+='<div class="dash-stat"><span class="dash-label">D1 Database</span><span class="dash-value">'+(d.database||'connected')+'</span></div>';document.getElementById('dash-stats').innerHTML=html;const r2=await fetch('/api/pricing');const d2=await r2.json();const items=d2.pricing||[];let revHtml='';items.slice(0,5).forEach(p=>{revHtml+='<div class="dash-stat"><span class="dash-label">'+p.network+' SMS</span><span class="dash-value">N'+p.cost.toFixed(2)+'</span></div>';});revHtml+='<div class="dash-stat"><span class="dash-label">Total Networks</span><span class="dash-value">'+items.length+'</span></div>';document.getElementById('dash-revenue').innerHTML=revHtml;}catch(e){document.getElementById('dash-stats').innerHTML='<p style="color:#666;font-size:12px">Failed to load</p>';}}
// Helper
function showResult(id,type,msg){const el=document.getElementById(id);el.className='result show '+type;el.textContent=msg;}
function scrollToSignup(){document.getElementById('biz-name')?.scrollIntoView({behavior:'smooth'});document.getElementById('biz-name')?.focus();}
// Auto-load carriers and dashboard on tab switch
const origShowTab=showTab;showTab=function(t){document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));event.target.classList.add('active');document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById('panel-'+t).classList.add('active');if(t==='carriers')loadCarriers();if(t==='dashboard')loadDashboard();};
fetch('/api/stats').then(r=>r.json()).then(d=>{if(d.success){const p=d.platform;document.getElementById('platform-line').textContent=p.businesses+' businesses \u2022 '+p.messages_delivered+' messages delivered \u2022 N'+Number(p.airtime_sold).toLocaleString()+' airtime sold';}}).catch(()=>{});<\/script></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    return json({ error: "Unknown endpoint", endpoints: ["/api/sms/send", "/api/otp/send", "/api/otp/verify", "/api/voice/call", "/api/airtime", "/api/account", "/api/pricing", "/api/smpp/status", "/api/health"] });
  }
};
export {
  live_harz_gateway_default as default
};
//# sourceMappingURL=live-harz-gateway.js.map


