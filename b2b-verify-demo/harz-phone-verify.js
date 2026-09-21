// HARZ Phone Verification — Client-Side Demonstrator v1.0
// Client rides the LIVE harz-gateway OTP API (real SMS via SendChamp).
// Demo API key lives ONLY in the DEMO_API_KEY secret — never in source, never in the browser.

var GATEWAY = "https://harz-gateway.harz.workers.dev";
var RATE = new Map(); // phone -> last send ms (demo-grade, per-isolate)

function json(d, s) { return new Response(JSON.stringify(d), { status: s || 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate", "Access-Control-Allow-Origin": "*" } }); }

// Nigerian prefix -> network map (client display only; delivery is carrier-agnostic)
var NETS = { "0803":"MTN","0806":"MTN","0703":"MTN","0704":"MTN","0706":"MTN","0813":"MTN","0814":"MTN","0816":"MTN","0903":"MTN","0906":"MTN","0913":"MTN","0916":"MTN",
  "0805":"Glo","0807":"Glo","0811":"Glo","0815":"Glo","0705":"Glo","0905":"Glo","0915":"Glo",
  "0802":"Airtel","0808":"Airtel","0708":"Airtel","0812":"Airtel","0701":"Airtel","0901":"Airtel","0902":"Airtel","0904":"Airtel","0912":"Airtel",
  "0809":"9mobile","0817":"9mobile","0818":"9mobile","0909":"9mobile","0908":"9mobile" };
function netOf(p) { return NETS[(p || "").slice(0, 4)] || null; }

async function handleSend(request, env) {
  var b; try { b = await request.json(); } catch (e) { return json({ error: "body required" }, 400); }
  var phone = String(b.phone || "").replace(/\D/g, "");
  if (phone.length === 10 && phone[0] === "0") phone = phone;
  else if (phone.length === 13 && phone.slice(0, 3) === "234") phone = "0" + phone.slice(3);
  else if (phone.length === 11 && phone[0] === "0") {}
  else return json({ error: "Enter a valid Nigerian number (e.g. 08012345678)" }, 400);
  var last = RATE.get(phone) || 0;
  if (Date.now() - last < 60000) return json({ error: "Please wait 60 seconds before requesting another code", retry_after: Math.ceil((60000 - (Date.now() - last)) / 1000) }, 429);
  if (!env.DEMO_API_KEY) return json({ error: "Demo key not configured" }, 500);
  var r = await gwFetch(env, "/api/otp/send", { method: "POST", headers: { "X-API-Key": env.DEMO_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ phone: phone, sender: "HARZ", channel: "sms" }) });
  var d; try { d = await r.json(); } catch (e) { return json({ error: "Gateway unreachable", detail: String(e && e.message), status: r.status, body: (await r.text()).slice(0,200) }, 502); }
  if (d.error) return json({ error: d.error }, r.status === 200 ? 400 : r.status);
  RATE.set(phone, Date.now());
  return json({ success: true, otp_id: d.otp_id, phone: phone, network: netOf(phone), expires_at: d.expires_at, cost: d.cost, note: "A real SMS with your 6-digit code is on its way." });
}

async function handleVerify(request, env) {
  var b; try { b = await request.json(); } catch (e) { return json({ error: "body required" }, 400); }
  if (!b.otp_id || !b.code) return json({ error: "otp_id and code required" }, 400);
  var r = await gwFetch(env, "/api/otp/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ otp_id: b.otp_id, code: String(b.code).replace(/\D/g, "") }) });
  var d; try { d = await r.json(); } catch (e) { return json({ error: "Gateway unreachable", detail: String(e && e.message), status: r.status, body: (await r.text()).slice(0,200) }, 502); }
  return json(d, r.status);
}

async function handlePricing(request, env) {
  var r = await gwFetch(env, "/api/pricing");
  var d; try { d = await r.json(); } catch (e) { return json({ error: "Gateway unreachable", detail: String(e && e.message), status: r.status, body: (await r.text()).slice(0,200) }, 502); }
  return json(d, r.status);
}

var STYLE = "*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#1a1a2e;min-height:100vh}.wrap{max-width:420px;margin:0 auto;padding:20px 16px 40px}.brand{display:flex;align-items:center;gap:10px;margin-bottom:6px}.logo{width:38px;height:38px;border-radius:10px;background:#1a237e;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:18px}.bname{font-size:17px;font-weight:800}.bsub{font-size:11px;color:#777}.card{background:#fff;border-radius:16px;padding:22px;margin-top:14px;box-shadow:0 2px 12px rgba(0,0,0,.07)}.step{font-size:11px;font-weight:700;color:#1a237e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}.h{font-size:19px;font-weight:800;margin-bottom:4px}.sub{font-size:13px;color:#666;margin-bottom:16px;line-height:1.5}label{font-size:12px;font-weight:600;color:#444;display:block;margin-bottom:6px}.pwrap{display:flex;gap:8px}.cc{display:flex;align-items:center;gap:4px;background:#f5f5f7;border-radius:10px;padding:0 12px;font-weight:700;color:#666;font-size:14px}.inp{width:100%;border:1.5px solid #e2e2e8;border-radius:10px;padding:13px 14px;font-size:16px;outline:none;font-family:inherit}.inp:focus{border-color:#1a237e}.badge{display:none;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin-top:8px}.badge.on{display:inline-block}.mtn{background:#ffecdc;color:#c9530c}.glo{background:#e8f0fe;color:#1a56c4}.airtel{background:#ffe9e9;color:#c42222}.ninem{background:#e6f9e9;color:#0c7a3c}.btn{width:100%;background:#1a237e;color:#fff;border:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;margin-top:14px;font-family:inherit}.btn:disabled{background:#9aa0c0;cursor:not-allowed}.btn.green{background:#0a7d3c}.msg{font-size:13px;margin-top:10px;padding:10px 12px;border-radius:8px;display:none;line-height:1.5}.msg.on{display:block}.err{background:#ffebee;color:#8b0000}.ok{background:#e8f5e9;color:#0a5c2c}.otp-row{display:flex;gap:8px;justify-content:center;margin:14px 0}.otpc{width:42px;height:52px;border:1.5px solid #e2e2e8;border-radius:10px;text-align:center;font-size:22px;font-weight:800;outline:none;font-family:inherit}.otpc:focus{border-color:#1a237e}.timer{font-size:12px;color:#888;text-align:center;margin-top:4px}.row{display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px solid #f0f0f3}.row:last-child{border:0}.lbl{color:#777}.val{font-weight:700;text-align:right;word-break:break-all}.big-check{font-size:52px;text-align:center;margin:6px 0}.foot{font-size:11px;color:#999;text-align:center;margin-top:18px;line-height:1.6}.sec{margin-top:26px}.sh{font-size:15px;font-weight:800;margin-bottom:6px}.ss{font-size:13px;color:#555;margin-bottom:10px;line-height:1.5}pre{background:#1a1a2e;color:#9fe8b5;padding:12px;border-radius:10px;font-size:10.5px;overflow-x:auto;line-height:1.6;margin-bottom:10px;font-family:ui-monospace,monospace}.tag{display:inline-block;background:#eef0fa;color:#1a237e;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;margin-right:6px;vertical-align:middle}.hide{display:none}";

var PAGE = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0f2f5"><meta name="description" content="HARZ Phone Verification — live OTP demo, real SMS delivery to any Nigerian network"><title>HARZ Phone Verification — Live Demo</title><link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.svg" type="image/svg+xml"><script>if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js")</script><style>' + STYLE + '</style></head><body><div class="wrap">'
+ '<div class="brand"><div class="logo">H</div><div><div class="bname">HARZ Phone Verification</div><div class="bsub">Live demo — real SMS, any Nigerian network</div></div></div>'

// STEP 1 — phone
+ '<div class="card" id="s1"><div class="step">Step 1 of 2</div><div class="h">Verify a phone number</div><div class="sub">Enter any Nigerian number. We send a real 6-digit code by SMS — the exact flow your customers would use.</div>'
+ '<label for="phone">Phone number</label><div class="pwrap"><span class="cc">+234</span><input class="inp" id="phone" type="tel" inputmode="numeric" maxlength="11" placeholder="08012345678" autocomplete="tel"></div>'
+ '<div id="netbadge" class="badge"></div>'
+ '<button class="btn" id="sendBtn" disabled>Send code</button>'
+ '<div id="msg1" class="msg"></div>'
+ '<div class="foot">Live demo wallet funded by HARZ · ₦4 per verification · codes expire in 5 minutes · 3 attempts max</div></div>'

// STEP 2 — code
+ '<div class="card hide" id="s2"><div class="step">Step 2 of 2</div><div class="h">Enter the code</div><div class="sub" id="s2sub">We sent a 6-digit code to <b></b>. It arrived by real SMS.</div>'
+ '<div class="otp-row">'
+ '<input class="otpc" maxlength="1" inputmode="numeric"><input class="otpc" maxlength="1" inputmode="numeric"><input class="otpc" maxlength="1" inputmode="numeric"><input class="otpc" maxlength="1" inputmode="numeric"><input class="otpc" maxlength="1" inputmode="numeric"><input class="otpc" maxlength="1" inputmode="numeric">'
+ '</div><div class="timer" id="timer"></div>'
+ '<button class="btn green" id="verifyBtn" disabled>Verify</button>'
+ '<button class="btn hide" id="resendBtn" style="background:#eef0fa;color:#1a237e">Resend code</button>'
+ '<div id="msg2" class="msg"></div></div>'

// RESULT
+ '<div class="card hide" id="s3"><div class="big-check">✅</div><div class="h" style="text-align:center">Phone verified</div><div class="sub" style="text-align:center">This number is confirmed reachable and in the hands of its owner.</div><div id="receipt"></div>'
+ '<button class="btn" id="againBtn" style="background:#eef0fa;color:#1a237e">Verify another number</button></div>'

// MERCHANT SECTION
+ '<div class="sec"><div class="card"><div class="sh">For merchants — integrate in 3 calls</div><div class="ss">The demo you just used is three HTTPS calls to the HARZ Gateway API. No SDK, works from any language.</div>'
+ '<pre>POST /api/otp/send\nX-API-Key: your_key\n{ "phone": "08012345678" }\n\nPOST /api/otp/verify\n{ "otp_id": "...", "code": "123456" }</pre>'
+ '<div><span class="tag">Node</span><span class="tag">PHP</span><span class="tag">Python</span><span class="tag">cURL</span><span class="tag">No SDK needed</span></div>'
+ '<div class="ss" style="margin-top:12px">Embed this exact demo widget on any site:</div>'
+ '<pre>&lt;iframe src="https://harz-phone-verify.harz.workers.dev" style="width:100%;max-width:420px;height:640px;border:0;border-radius:16px"&gt;&lt;/iframe&gt;</pre>'
+ '<div class="ss">Gateway API: ' + GATEWAY + ' · Pricing: <a href="/demo/pricing" style="color:#1a237e">/demo/pricing</a></div>'
+ '<div class="foot">Delivery: MTN · Glo · Airtel · 9mobile via licensed aggregator · DND-aware routes</div></div></div>'
+ '<div class="foot">HARZ Digital Services · Verification that survives bad networks — ask about offline mesh delivery.<br>Live demo. Real SMS. Every code below is generated and verified server-side.</div>'
+ '</div>'
+ '<script>'
+ 'var phone,otpId,expires,resendAt;'
+ 'var el=function(i){return document.getElementById(i)};'
+ 'var PIN=el("phone"),SB=el("sendBtn"),NB=el("netbadge"),M1=el("msg1");'
+ 'var NETS={"0803":"MTN","0806":"MTN","0703":"MTN","0704":"MTN","0706":"MTN","0813":"MTN","0814":"MTN","0816":"MTN","0903":"MTN","0906":"MTN","0913":"MTN","0916":"MTN","0805":"Glo","0807":"Glo","0811":"Glo","0815":"Glo","0705":"Glo","0905":"Glo","0915":"Glo","0802":"Airtel","0808":"Airtel","0708":"Airtel","0812":"Airtel","0701":"Airtel","0901":"Airtel","0902":"Airtel","0904":"Airtel","0912":"Airtel","0809":"9mobile","0817":"9mobile","0818":"9mobile","0909":"9mobile","0908":"9mobile"};'
+ 'var CLS={"MTN":"mtn","Glo":"glo","Airtel":"airtel","9mobile":"ninem"};'
+ 'PIN.addEventListener("input",function(){var v=PIN.value.replace(/\\D/g,"").slice(0,11);PIN.value=v;var n=NETS[v.slice(0,4)];if(n){NB.className="badge on "+CLS[n];NB.textContent=n+" line detected"}else{NB.className="badge"}SB.disabled=v.length!==11;});'
+ 'function m1(t,ok){M1.className="msg on "+(ok?"ok":"err");M1.textContent=t;}'
+ 'SB.addEventListener("click",async function(){SB.disabled=true;SB.textContent="Sending…";try{var r=await fetch("/demo/otp/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:PIN.value})});var d=await r.json();if(!r.ok){m1(d.error||"Could not send code");SB.disabled=false;SB.textContent="Send code";return;}phone=d.phone;otpId=d.otp_id;expires=new Date(d.expires_at).getTime();resendAt=Date.now()+60000;el("s1").classList.add("hide");el("s2").classList.remove("hide");el("s2sub").innerHTML="We sent a 6-digit code to <b>"+d.phone+(d.network?" ("+d.network+")":"")+"</b>. It arrived by real SMS.";tick();boxes[0].focus();}catch(e){m1("Network error — check your connection");SB.disabled=false;SB.textContent="Send code";}});'
+ 'var boxes=[].slice.call(document.querySelectorAll(".otpc"));'
+ 'boxes.forEach(function(b,i){b.addEventListener("input",function(){b.value=b.value.replace(/\\D/g,"");if(b.value&&i<5)boxes[i+1].focus();var full=boxes.every(function(x){return x.value});el("verifyBtn").disabled=!full;});b.addEventListener("keydown",function(e){if(e.key==="Backspace"&&!b.value&&i>0)boxes[i-1].focus();});});'
+ 'function code(){return boxes.map(function(b){return b.value}).join("");}'
+ 'var M2=el("msg2");function m2(t,ok){M2.className="msg on "+(ok?"ok":"err");M2.textContent=t;}'
+ 'el("verifyBtn").addEventListener("click",async function(){el("verifyBtn").disabled=true;try{var r=await fetch("/demo/otp/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({otp_id:otpId,code:code()})});var d=await r.json();if(d.verified){el("s2").classList.add("hide");el("s3").classList.remove("hide");var n=NETS[phone.slice(0,4)]||"—";el("receipt").innerHTML="<div class=row><span class=lbl>Number</span><span class=val>"+phone+"</span></div><div class=row><span class=lbl>Network</span><span class=val>"+n+"</span></div><div class=row><span class=lbl>Verified at</span><span class=val>"+new Date().toLocaleTimeString()+"</span></div><div class=row><span class=lbl>Receipt</span><span class=val style=font-size:10px>"+otpId+"</span></div><div class=row><span class=lbl>Status</span><span class=val style=color:#0a7d3c>VERIFIED</span></div>";}else{var rem=d.attempts_remaining;if(rem!==undefined&&rem<=0){m2("Too many attempts. Request a new code.");el("verifyBtn").style.display="none";}else{m2("Wrong code"+(rem!==undefined?" — "+rem+" attempt"+(rem===1?"":"s")+" left":"")+". Try again.");el("verifyBtn").disabled=false;}}}catch(e){m2("Network error");el("verifyBtn").disabled=false;}});'
+ 'var TI=null;function tick(){clearInterval(TI);TI=setInterval(function(){var now=Date.now();var ex=expires-now;if(ex<=0){clearInterval(TI);el("timer").textContent="Code expired — resend to try again";el("verifyBtn").style.display="none";el("resendBtn").classList.remove("hide");return;}if(now<resendAt){el("timer").textContent="Code expires in "+Math.ceil(ex/1000)+"s · resend in "+Math.ceil((resendAt-now)/1000)+"s";}else{el("timer").textContent="Code expires in "+Math.ceil(ex/1000)+"s";el("resendBtn").classList.remove("hide");}},250);}'
+ 'el("resendBtn").addEventListener("click",async function(){el("resendBtn").disabled=true;try{var r=await fetch("/demo/otp/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:phone})});var d=await r.json();if(!r.ok){m2(d.error||"Could not resend");el("resendBtn").disabled=false;return;}otpId=d.otp_id;expires=new Date(d.expires_at).getTime();resendAt=Date.now()+60000;boxes.forEach(function(b){b.value=""});el("verifyBtn").style.display="";el("verifyBtn").disabled=true;m2("New code sent",true);boxes[0].focus();tick();}catch(e){m2("Network error");}el("resendBtn").disabled=false;});'
+ 'el("againBtn").addEventListener("click",function(){location.reload();});'
+ '</script></body></html>';

function page() { return new Response(PAGE, { headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-cache, no-store, must-revalidate" } }); }

function gwFetch(env, path, init) {
  if (env.GATEWAY_SVC) {
    var i = init || {};
    var h = new Headers(i.headers || {});
    i.headers = h;
    return env.GATEWAY_SVC.fetch("https://gateway.internal" + path, i);
  }
  return fetch(GATEWAY + path, init);
}

async function handle(request, env) {
  var url = new URL(request.url);
  if (url.pathname === "/demo/otp/send" && request.method === "POST") return handleSend(request, env);
  if (url.pathname === "/demo/otp/verify" && request.method === "POST") return handleVerify(request, env);
  if (url.pathname === "/demo/pricing" || url.pathname === "/pricing") return handlePricing(request, env);
  if (url.pathname === "/manifest.json") return json({ name: "HARZ Phone Verification", short_name: "HARZ Verify", description: "Live OTP phone verification demo — real SMS, any Nigerian network", start_url: "/", display: "standalone", background_color: "#f0f2f5", theme_color: "#f0f2f5", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] });
  if (url.pathname === "/sw.js") return new Response("var C='harz-verify-v1';self.addEventListener('install',function(e){self.skipWaiting()});self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(C).then(function(x){x.put(e.request,c)});return r}).catch(function(){return caches.match(e.request)}))});", { headers: { "Content-Type": "application/javascript", "Cache-Control": "no-cache, no-store, must-revalidate" } });
  if (url.pathname === "/icon.svg") return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#1a237e"/><path d="M35 20v60M35 20l30 60M65 20v60" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/></svg>', { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache, no-store, must-revalidate" } });
  if (url.pathname === "/diag") { var out = {}; try { var tr = await fetch(GATEWAY + "/api/health"); var tb = await tr.text(); out.gw_status = tr.status; out.gw_body = tb.slice(0, 120); } catch (e) { out.gw_error = String(e && e.message); } try { var tr2 = await fetch("https://harzpay.harz.workers.dev/health"); var tb2 = await tr2.text(); out.pay_status = tr2.status; out.pay_body = tb2.slice(0, 120); } catch (e) { out.pay_error = String(e && e.message); } try { var tr3 = await fetch("https://example.com"); out.ext_status = tr3.status; } catch (e) { out.ext_error = String(e && e.message); } return json(out); }
  if (url.pathname === "/health") { var ok = !!(env.DEMO_API_KEY); return json({ status: "healthy", service: "harz-verify-demo", version: "1.0.0", gateway: GATEWAY, demo_key_configured: ok }); }
  if (url.pathname === "/" && request.method === "GET") return page();
  return json({ error: "Not found", path: url.pathname, endpoints: ["/ (demo UI)", "/demo/otp/send", "/demo/otp/verify", "/demo/pricing", "/health"] }, 404);
}

export default { fetch: function (request, env) { return handle(request, env); } };
