var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __defProp22 = Object.defineProperty;
var __name22 = /* @__PURE__ */ __name2((target, value) => __defProp22(target, "name", { value, configurable: true }), "__name");
var CHAIN_URL = "https://harz-chain-v2.harz.workers.dev";
var PRODUCTS = {
  ebook: { name: "Trading eBook", price_ngn: 8e3, token_reward: 8e3 },
  course: { name: "Digital Marketing Course", price_ngn: 16e3, token_reward: 16e3 },
  mentorship: { name: "Premium Mentorship", price_ngn: 64e3, token_reward: 64e3 },
  harzcoin: { name: "HARZcoin Purchase", price_ngn: 1e3, token_reward: 1e3 }
};
var SKYE_CALLBACK_HTML = /* @__PURE__ */ __name2(function(ref, plan, phone, status) {
  var icon = status === "success" ? "\u2705" : status === "failed" ? "\u274C" : "\u23F3";
  var title = status === "success" ? "Payment Successful" : status === "failed" ? "Payment Failed" : "Verifying...";
  var body = status === "success" ? "<p>Your <b>" + plan + "</b> subscription is now active!</p><p>Internet access has been granted.</p><p>Dial <b>*347*1*2#</b> to check status.</p>" : status === "failed" ? "<p>Payment could not be verified.</p><p>Please try again by dialing *347*1#</p>" : "<p>Verifying your payment...</p><p>Please wait.</p>";
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f0f2f5"><title>HARZ Skye - Payment ' + status + '</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f0f2f5;color:#1a1a2e;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:16px}.card{background:#fff;border-radius:20px;padding:32px;max-width:400px;width:100%;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.08)}.icon{font-size:48px;margin-bottom:12px}h1{font-size:20px;margin-bottom:8px;color:#1a237e}p{font-size:14px;color:#666;margin-bottom:6px;line-height:1.5}.ref{font-size:11px;color:#999;margin-top:12px;padding:8px;background:#f5f5f7;border-radius:8px;word-break:break-all}.ussd{margin-top:12px;font-size:12px;color:#888}</style></head><body><div class="card"><div class="icon">' + icon + "</div><h1>" + title + "</h1>" + body + '<div class="ref">Ref: ' + ref + '</div><div class="ussd">HARZ Skye - Internet for all</div></div></body></html>';
}, "SKYE_CALLBACK_HTML");
async function callChain(path, method, body, env) {
  if (env && env.HARZ_CHAIN) {
    try {
      const opts = { method: method || "GET" };
      if (body) {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify(body);
      }
      const resp = await env.HARZ_CHAIN.fetch(CHAIN_URL + path, opts);
      const text = await resp.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return { error: "Non-JSON: " + text.substring(0, 100) };
      }
    } catch (e) {
      return { error: "Binding failed: " + e.message };
    }
  }
  try {
    const opts = { method: method || "GET", headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } };
    if (body) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const resp = await fetch(CHAIN_URL + path, opts);
    return await resp.json();
  } catch (e) {
    return { error: "Fetch failed: " + e.message };
  }
}
__name(callChain, "callChain");
__name2(callChain, "callChain");
__name22(callChain, "callChain");
async function forwardToSkye(env, ref, phone, amount) {
  if (!env || !env.SKYE) return { error: "SKYE binding not configured" };
  try {
    const resp = await env.SKYE.fetch("https://internal/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          reference: ref,
          status: "success",
          amount,
          customer: { phone_number: phone }
        }
      })
    });
    return await resp.json();
  } catch (e) {
    return { error: "SKYE forward failed: " + e.message };
  }
}
__name(forwardToSkye, "forwardToSkye");
__name2(forwardToSkye, "forwardToSkye");
var harzpay_v330_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const PAYSTACK_KEY = env.PAYSTACK_SECRET_KEY || "";
    const CHAIN_KEY = env.CHAIN_API_KEY || "";
    const STORE_WALLET = env.STORE_WALLET_ADDRESS || "08028687857";
    if (url.pathname === "/api/sms-inbound" && request.method === "POST" && env.HARZ_MESH) {
      return env.HARZ_MESH.fetch(request.url, request);
    }
    if (url.pathname === "/api/mesh-settle" && request.method === "POST") {
      let b = {};
      try {
        b = await request.json();
      } catch (e) {
      }
      const token = String(b.token || "");
      const phone = String(b.phone || "").replace(/\D/g, "");
      const amount = Math.floor(Number(b.amount) || 0);
      const memo = String(b.memo || "Harz Mesh relay reward").slice(0, 80);
      const j = /* @__PURE__ */ __name2((obj, code) => new Response(JSON.stringify(obj), { status: code, headers: { "Content-Type": "application/json" } }), "j");
      if (!env.MESH_SETTLE_KEY || token !== env.MESH_SETTLE_KEY) return j({ success: false, error: "Unauthorized" }, 401);
      if (phone.length < 10 || amount <= 0 || amount > 500) return j({ success: false, error: "Invalid phone or amount (max 500 HARZ per settlement)" }, 400);
      try {
        const tx = await callChain("/api/transfer", "POST", { from: STORE_WALLET, to: phone, amount, key: CHAIN_KEY, memo }, env);
        if (!tx || tx.error || tx.success === false) return j({ success: false, error: "Chain rejected settlement: " + (tx && tx.error || "unknown"), tx }, 502);
        return j({ success: true, settled: amount, phone, tx }, 200);
      } catch (e) {
        return j({ success: false, error: "Chain transfer failed: " + (e && e.message) }, 500);
      }
    }
    if (url.pathname === "/api/ver") {
      const ref = url.searchParams.get("reference") || url.searchParams.get("trxref") || "";
      if (!ref) {
        return new Response(SYE_CALLBACK_HTML("No reference", "", "", "failed"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
      if (!ref.includes("SKYE")) {
        try {
          const vResp = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref), {
            headers: { "Authorization": "Bearer " + PAYSTACK_KEY, "Cache-Control": "no-cache, no-store, must-revalidate" }
          });
          const vData = await vResp.json();
          if (vData.status && vData.data && vData.data.status === "success") {
            const phone = vData.data.metadata && vData.data.metadata.phone || STORE_WALLET;
            const amount = vData.data.metadata && vData.data.metadata.token_reward || Math.floor(vData.data.amount / 100);
            await callChain("/api/transfer", "POST", { to: phone, amount, key: CHAIN_KEY, memo: "Paystack verify: " + ref }, env);
            return new Response(SKYE_CALLBACK_HTML(ref, "HARZcoin", phone, "success"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
          }
          return new Response(SKYE_CALLBACK_HTML(ref, "", "", "failed"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
        } catch (e) {
          return new Response(SKYE_CALLBACK_HTML(ref, "", "", "failed"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
        }
      }
      try {
        const vResp = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref), {
          headers: { "Authorization": "Bearer " + PAYSTACK_KEY, "Cache-Control": "no-cache, no-store, must-revalidate" }
        });
        const vData = await vResp.json();
        if (vData.status && vData.data && vData.data.status === "success") {
          const phone = vData.data.metadata && vData.data.metadata.phone || vData.data.customer && vData.data.customer.phone || "";
          const skyeResult2 = await forwardToSkye(env, ref, phone, vData.data.amount);
          if (skyeResult2.success) {
            return new Response(SKYE_CALLBACK_HTML(ref, skyeResult2.plan || "Subscription", skyeResult2.phone || phone, "success"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
          }
          return new Response(SKYE_CALLBACK_HTML(ref, "", "", "failed"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
        }
        return new Response(SKYE_CALLBACK_HTML(ref, "", "", "failed"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      } catch (e) {
        return new Response(SKYE_CALLBACK_HTML(ref, "", "", "failed"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    }
    if (url.pathname === "/health" || url.pathname === "/api/health") {
      const chainStatus = await callChain("/api/status", "GET", null, env);
      const storeBalance = await callChain("/api/balance?address=" + encodeURIComponent(STORE_WALLET), "GET", null, env);
      return new Response(JSON.stringify({
        status: "healthy",
        version: "3.3.0",
        chain_url: CHAIN_URL,
        chain_status: chainStatus.error ? "unreachable" : "reachable",
        chain_height: chainStatus.height || null,
        chain_version: chainStatus.version || null,
        chain_mined: chainStatus.mined_percent || null,
        chain_wallets: chainStatus.wallets || null,
        service_binding: !!env.HARZ_CHAIN,
        skye_binding: !!env.SKYE,
        store_wallet: STORE_WALLET,
        store_balance: storeBalance.balance || "unknown",
        paystack_configured: !!PAYSTACK_KEY,
        chain_key_configured: !!CHAIN_KEY,
        auto_polling: true,
        skye_payment_forwarding: !!env.SKYE,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
    }
    if (url.pathname === "/api/skye/status") {
      const probe = env.SKYE ? await env.SKYE.fetch("https://internal/api/health", { headers: { "Cache-Control": "no-cache" } }).then(function(r) { return { ok: r.ok, status: r.status }; }).catch(function(e) { return { ok: false, error: e.message }; }) : null;
      return new Response(JSON.stringify({
        endpoint: "/api/skye/status",
        skye_binding: !!env.SKYE,
        skye_probe: probe,
        forwarding_function: "forwardToSkye",
        forwarding_path: "harzpay -> env.SKYE.fetch -> harz-skye /api/payment/confirm",
        forwarding_live: !!(env.SKYE && probe && probe.ok),
        forwarding_proven: !!(env.SKYE && probe && probe.ok),
        note: env.SKYE && probe && probe.ok ? "SKYE service binding answered a live health probe through the same path used to forward payments." : "Forwarding not proven: binding missing or probe failed.",
        timestamp: (new Date()).toISOString()
      }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
    }
    if (url.pathname === "/products") {
      return new Response(JSON.stringify({ products: PRODUCTS }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
    }
    if (url.pathname === "/balance") {
      const phone = url.searchParams.get("phone") || STORE_WALLET;
      const result = await callChain("/api/balance?address=" + encodeURIComponent(phone), "GET", null, env);
      const chainStatus = await callChain("/api/status", "GET", null, env);
      return new Response(JSON.stringify({
        phone,
        balance: result.balance || 0,
        coin: "HARZ",
        chain_height: chainStatus.height || null,
        chain_live: !chainStatus.error
      }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
    }
    if (url.pathname === "/api/poll" || url.pathname === "/poll") {
      try {
        const psResp = await fetch("https://api.paystack.co/transaction?perPage=20&status=success", {
          headers: { "Authorization": "Bearer " + PAYSTACK_KEY, "Cache-Control": "no-cache, no-store, must-revalidate" }
        });
        const psData = await psResp.json();
        if (!psData.status || !psData.data) {
          return new Response(JSON.stringify({ success: false, error: "Paystack API error", detail: psData.message }), { headers: { "Content-Type": "application/json" } });
        }
        const minted = [];
        const skipped = [];
        const skye_activated = [];
        for (const tx of psData.data) {
          const ref = tx.reference || "";
          const metadata = tx.metadata || {};
          const isHarz = ref.startsWith("harz_") || metadata.token_reward || metadata.phone;
          const isSkye = ref.includes("SKYE");
          if (isSkye) {
            const phone2 = metadata.phone || tx.customer && tx.customer.phone || STORE_WALLET;
            const skyeResult2 = await forwardToSkye(env, ref, phone2, tx.amount);
            skye_activated.push({ ref, phone: phone2, result: skyeResult2 });
            continue;
          }
          if (!isHarz) {
            skipped.push({ ref, reason: "not_harz" });
            continue;
          }
          const phone = metadata.phone || metadata.custom_fields && metadata.custom_fields.find(function(f) {
            return f.phone;
          }) && metadata.custom_fields.find(function(f) {
            return f.phone;
          }).phone || STORE_WALLET;
          const amount = metadata.token_reward || Math.floor(tx.amount / 100);
          const mintResult = await callChain("/api/transfer", "POST", { to: phone, amount, key: CHAIN_KEY, memo: "Paystack auto-mint: " + ref }, env);
          if (mintResult.error || mintResult.success === false) {
            skipped.push({ ref, reason: "mint_failed: " + (mintResult.error || mintResult.message || "unknown") });
          } else {
            minted.push({ ref, phone, amount, tx_id: tx.id, mint_result: mintResult });
          }
        }
        return new Response(JSON.stringify({
          success: true,
          version: "3.3.0",
          checked: psData.data.length,
          minted: minted.length,
          skipped: skipped.length,
          skye_activated: skye_activated.length,
          minted_details: minted,
          skipped_details: skipped,
          skye_details: skye_activated,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }
    if (url.pathname === "/webhook") {
      if (request.method === "POST") {
        try {
          const event = await request.json();
          if (event.event === "charge.success") {
            const ref = event.data && event.data.reference;
            const metadata = event.data && event.data.metadata || {};
            const phone = metadata.phone || metadata.custom_fields && metadata.custom_fields.find(function(f) {
              return f.phone;
            }) && metadata.custom_fields.find(function(f) {
              return f.phone;
            }).phone || STORE_WALLET;
            const amount = metadata.token_reward || Math.floor((event.data && event.data.amount) / 100);
            if (ref && ref.indexOf("EDGE-") === 0) {
              let telResult = null;
              try {
                const telResp = await fetch("https://harz-edge-telecom.harz.workers.dev/api/paystack/verify?reference=" + encodeURIComponent(ref));
                telResult = await telResp.json();
              } catch (e2) {
                telResult = { error: e2.message };
              }
              return new Response(JSON.stringify({ success: true, reference: ref, forwarded: "harz-edge-telecom", telecom: telResult }), { headers: { "Content-Type": "application/json" } });
            }
            const mintResult = await callChain("/api/transfer", "POST", {
              to: phone,
              amount,
              key: CHAIN_KEY,
              memo: "Paystack webhook: " + ref
            }, env);
            var skyeResult = null;
            if (ref && ref.includes("SKYE")) {
              skyeResult = await forwardToSkye(env, ref, phone, event.data && event.data.amount);
            }
            return new Response(JSON.stringify({
              success: true,
              reference: ref,
              phone,
              minted: amount,
              result: mintResult,
              skye: skyeResult
            }), { headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ success: true, event: event.event }), { headers: { "Content-Type": "application/json" } });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      }
      return new Response(JSON.stringify({ status: "webhook ready", url: "https://harzpay.harz.workers.dev/webhook" }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/" && request.method === "POST") {
      try {
        const body = await request.json();
        const action = body.action;
        if (action === "create_checkout") {
          const productKey = body.product || "harzcoin";
          const product = PRODUCTS[productKey];
          if (!product) return new Response(JSON.stringify({ success: false, error: "Unknown product: " + productKey }), { headers: { "Content-Type": "application/json" } });
          const phone = body.phone || STORE_WALLET;
          const reference = "harz_" + productKey + "_" + Date.now();
          const resp = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: { "Authorization": "Bearer " + PAYSTACK_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              email: body.email || "customer@harz.io",
              amount: product.price_ngn * 100,
              reference,
              callback_url: "https://harzpay.harz.workers.dev/api/ver",
              metadata: { phone, product: product.name, token_reward: product.token_reward, custom_fields: [{ phone }] }
            })
          });
          const psData = await resp.json();
          if (psData.status) {
            return new Response(JSON.stringify({
              success: true,
              authorization_url: psData.data.authorization_url,
              reference,
              product: product.name,
              price: product.price_ngn + " NGN",
              reward: product.token_reward + " HARZ"
            }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
          }
          return new Response(JSON.stringify({ success: false, error: psData.message || "Paystack error" }), { headers: { "Content-Type": "application/json" } });
        }
        if (action === "generic_checkout") {
          const amount = body.amount;
          const email = body.email || "customer@harz.io";
          const reference = body.reference || "harz_gen_" + Date.now();
          const callback_url = body.callback_url || "https://harzpay.harz.workers.dev/api/ver";
          const metadata = body.metadata || {};
          if (!amount || amount < 100) {
            return new Response(JSON.stringify({ success: false, error: "amount (in kobo) must be >= 100" }), { headers: { "Content-Type": "application/json" } });
          }
          const resp = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: { "Authorization": "Bearer " + PAYSTACK_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              amount,
              reference,
              callback_url,
              metadata
            })
          });
          const psData = await resp.json();
          if (psData.status) {
            return new Response(JSON.stringify({
              success: true,
              authorization_url: psData.data.authorization_url,
              reference,
              amount: amount / 100 + " NGN",
              callback_url
            }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
          }
          return new Response(JSON.stringify({ success: false, error: psData.message || "Paystack error" }), { headers: { "Content-Type": "application/json" } });
        }
        if (action === "verify") {
          const reference = body.reference;
          if (!reference) return new Response(JSON.stringify({ success: false, error: "reference required" }), { headers: { "Content-Type": "application/json" } });
          const vResp = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), {
            headers: { "Authorization": "Bearer " + PAYSTACK_KEY, "Cache-Control": "no-cache, no-store, must-revalidate" }
          });
          const vData = await vResp.json();
          if (!vData.status) return new Response(JSON.stringify({ success: false, error: vData.message || "verify call failed" }), { headers: { "Content-Type": "application/json" } });
          const d = vData.data || {};
          return new Response(JSON.stringify({ success: true, paystack_status: d.status, amount: d.amount, currency: d.currency, reference: d.reference, paid_at: d.paid_at, channel: d.channel }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
        }
        if (action === "verify_and_mint") {
          const reference = body.reference;
          const phone = body.phone || STORE_WALLET;
          if (!reference) return new Response(JSON.stringify({ success: false, error: "reference required" }), { headers: { "Content-Type": "application/json" } });
          const vResp = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), {
            headers: { "Authorization": "Bearer " + PAYSTACK_KEY, "Cache-Control": "no-cache, no-store, must-revalidate" }
          });
          const vData = await vResp.json();
          if (vData.status && vData.data && vData.data.status === "success") {
            const amount = vData.data.metadata && vData.data.metadata.token_reward || Math.floor(vData.data.amount / 100);
            const mintResult = await callChain("/api/transfer", "POST", {
              to: phone,
              amount,
              key: CHAIN_KEY,
              memo: "Paystack verify: " + reference
            }, env);
            var skyeResult = null;
            if (reference.includes("SKYE")) {
              skyeResult = await forwardToSkye(env, reference, phone, vData.data.amount);
            }
            return new Response(JSON.stringify({
              success: true,
              reference,
              verified: true,
              amount,
              minted: amount,
              mint_result: mintResult,
              skye: skyeResult
            }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
          }
          return new Response(JSON.stringify({ success: false, message: "Payment not completed: " + (vData.data && vData.data.status || "unknown") }), { headers: { "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ error: "Unknown action: " + action }), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(JSON.stringify({
        name: "HARZ Paystack -> L1 Bridge",
        version: "3.3.0",
        status: "online",
        description: "Paystack payment -> real HARZcoin on L1 chain + HARZ Skye subscription activation",
        chain: CHAIN_URL,
        features: ["Auto-polling", "Checkout creation", "Verify & mint", "Balance check", "Webhook", "SKYE payment forwarding", "/api/ver callback"],
        endpoints: [
          "POST / - Create checkout (action: create_checkout, generic_checkout, verify_and_mint)",
          "GET /poll - Auto-poll Paystack & mint (cron-ready)",
          "POST /webhook - Paystack webhook",
          "GET /api/ver - Paystack callback redirect",
          "GET /products - Product catalog",
          "GET /balance?phone=080XXXXXXXX - Check L1 balance",
          "GET /health - Health check"
        ]
      }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate" } });
    }
    return new Response(JSON.stringify({
      error: "Not found",
      path: url.pathname,
      endpoints: ["/ (create_checkout, verify_and_mint)", "/poll", "/webhook", "/api/ver", "/products", "/balance", "/health"]
    }), { headers: { "Content-Type": "application/json" } });
  },
  async scheduled(event, env, ctx) {
    const PAYSTACK_KEY = env.PAYSTACK_SECRET_KEY || "";
    const CHAIN_KEY = env.CHAIN_API_KEY || "";
    const STORE_WALLET = env.STORE_WALLET_ADDRESS || "08028687857";
    if (!PAYSTACK_KEY) {
      console.log("No Paystack key");
      return;
    }
    try {
      const psResp = await fetch("https://api.paystack.co/transaction?perPage=20&status=success", {
        headers: { "Authorization": "Bearer " + PAYSTACK_KEY, "Cache-Control": "no-cache, no-store, must-revalidate" }
      });
      const psData = await psResp.json();
      if (!psData.status || !psData.data) {
        console.log("Paystack API error");
        return;
      }
      let minted = 0;
      let skye = 0;
      for (const tx of psData.data) {
        const ref = tx.reference || "";
        const metadata = tx.metadata || {};
        if (ref.includes("SKYE")) {
          const phone2 = metadata.phone || tx.customer && tx.customer.phone || STORE_WALLET;
          await forwardToSkye(env, ref, phone2, tx.amount);
          skye++;
          continue;
        }
        const isHarz = ref.startsWith("harz_") || metadata.token_reward || metadata.phone;
        if (!isHarz) continue;
        const phone = metadata.phone || metadata.custom_fields && metadata.custom_fields.find(function(f) {
          return f.phone;
        }) && metadata.custom_fields.find(function(f) {
          return f.phone;
        }).phone || STORE_WALLET;
        const amount = metadata.token_reward || Math.floor(tx.amount / 100);
        const mintResult = await callChain("/api/transfer", "POST", { to: phone, amount, key: CHAIN_KEY, memo: "Auto-poll: " + ref }, env);
        if (!mintResult.error) minted++;
      }
      console.log("Auto-poll: " + minted + " minted, " + skye + " skye activated from " + psData.data.length + " transactions");
    } catch (e) {
      console.log("Auto-poll error: " + e.message);
    }
  }
};
export {
  harzpay_v330_default as default
};
//# sourceMappingURL=worker.js.map
