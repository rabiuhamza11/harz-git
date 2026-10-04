--d8d81313d6e1647011b971fb0890721707b80cedab330af8ba2e245a6800
Content-Disposition: form-data; name="index.js"

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// harz-merchant-portal.js
var { v4: uuid } = { v4: () => crypto.randomUUID() };
var now = /* @__PURE__ */ __name(() => (/* @__PURE__ */ new Date()).toISOString(), "now");
var json = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } }), "json");
function normalizePhone(phone) {
  let p = (phone || "").toString().replace(/\s+/g, "").replace(/^\+/, "");
  if (p.startsWith("234"))
    return p;
  if (p.startsWith("0"))
    return "234" + p.slice(1);
  if (p.length === 10)
    return "234" + p;
  return p;
}
__name(normalizePhone, "normalizePhone");
async function initDB(env) {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS mportal_warrants (id TEXT PRIMARY KEY, merchant_id TEXT, business TEXT, city TEXT, tier TEXT, payload TEXT, sig TEXT, root_height INTEGER, issued_at TEXT, expires_at TEXT, revoked INTEGER DEFAULT 0, revoked_at TEXT)`, `CREATE TABLE IF NOT EXISTS mportal_mbr_key (id TEXT PRIMARY KEY, jwk TEXT, fp TEXT, created_at TEXT)`, 
    `CREATE TABLE IF NOT EXISTS mportal_merchants (
      id TEXT PRIMARY KEY,
      phone TEXT,
      business_name TEXT,
      owner_name TEXT,
      industry TEXT,
      city TEXT,
      address TEXT,
      email TEXT,
      logo_url TEXT,
      description TEXT,
      business_type TEXT,
      rc_number TEXT,
      verified INTEGER DEFAULT 0,
      verification_status TEXT DEFAULT 'pending',
      verification_docs TEXT,
      status TEXT DEFAULT 'onboarding',
      plan TEXT DEFAULT 'free',
      onboarding_step INTEGER DEFAULT 1,
      onboarding_data TEXT,
      delivery_zones TEXT,
      delivery_preferences TEXT,
      payment_connected INTEGER DEFAULT 0,
      paystack_subaccount_code TEXT,
      ai_permissions TEXT,
      bank_name TEXT,
      bank_account TEXT,
      referral_code TEXT,
      referred_by TEXT,
      total_orders INTEGER DEFAULT 0,
      total_revenue REAL DEFAULT 0,
      total_commission REAL DEFAULT 0,
      rating REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      dispute_count INTEGER DEFAULT 0,
      joined_at TEXT,
      activated_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mportal_products (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      name TEXT,
      description TEXT,
      price REAL,
      compare_at_price REAL,
      stock INTEGER DEFAULT 0,
      category TEXT,
      images TEXT,
      sku TEXT,
      weight REAL,
      delivery_fee REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mportal_orders (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      customer_phone TEXT,
      customer_name TEXT,
      customer_address TEXT,
      product_id TEXT,
      product_name TEXT,
      quantity INTEGER,
      amount REAL,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      fulfillment_status TEXT DEFAULT 'none',
      delivery_provider TEXT,
      tracking_id TEXT,
      delivery_fee REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mportal_leads (
      id TEXT PRIMARY KEY,
      business_name TEXT,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      industry TEXT,
      city TEXT,
      source TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
      referral_code TEXT,
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mportal_referrals (
      id TEXT PRIMARY KEY,
      referrer_id TEXT,
      referee_id TEXT,
      commission_earned REAL DEFAULT 0,
      commission_paid INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mportal_trust_events (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      event_type TEXT,
      description TEXT,
      evidence TEXT,
      severity TEXT DEFAULT 'info',
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mportal_disputes (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      order_id TEXT,
      customer_phone TEXT,
      reason TEXT,
      description TEXT,
      status TEXT DEFAULT 'open',
      resolution TEXT,
      evidence TEXT,
      created_at TEXT,
      resolved_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mportal_audit_log (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      action TEXT,
      actor TEXT,
      details TEXT,
      ip TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS mportal_ai_sessions (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      phone TEXT,
      stage TEXT DEFAULT 'start',
      conversation TEXT,
      setup_data TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT,
      updated_at TEXT
    )`
  ];
  for (const sql of stmts) {
    await env.MP_DB.prepare(sql).run();
  }
}
__name(initDB, "initDB");
function aiSetupEngine(message, sessionData) {
  const msg = message.toLowerCase().trim();
  const stage = sessionData.stage || "start";
  const data = sessionData.setup_data || {};
  if (stage === "start") {
    let businessName = "", industry = "", city = "", products = [];
    const cityMatch = msg.match(/(abuja|lagos|kano|ibadan|port harcourt|benin|kaduna|jos|enugu|warri|calabar|uyo|aba|onitsha|nnewi|owerri|sokoto|maiduguri|zaria|gusau|lokoja|minna|asaba|akure|ado|ife|ilorin|osogbo|makurdi|lafia|jalingo|yola|dutse|bauchi|gombe|birnin|damaturu|abakaliki|afikpo|nsukka)/);
    if (cityMatch)
      city = cityMatch[0].split(" ")[0];
    if (cityMatch)
      data.city = city.charAt(0).toUpperCase() + city.slice(1);
    const industryKeywords = {
      "building materials": ["building material", "building supply", "construction", "cement", "blocks", "sand", "granite", "iron rod", "paint", "tiles", "roofing", "plumbing", "electrical", "hardware"],
      "fashion": ["fashion", "clothing", "clothes", "shoes", "bags", "jewelry", "ankara", "fabric", "accessories", "watches", "boutique", "tailor"],
      "food": ["food", "foodstuff", "rice", "beans", "garri", "yam", "spices", "cooking", "provisions", "grain"],
      "electronics": ["electronics", "phone", "laptop", "tv", "gadget", "charger", "electronic", "gadget"],
      "groceries": ["grocery", "supermarket", "provisions", "household", "mini mart"],
      "health": ["pharmacy", "drugs", "medicine", "health", "medical", "drug store"],
      "beauty": ["cosmetics", "makeup", "skincare", "beauty", "salon", "barbing", "beauty products"],
      "furniture": ["furniture", "chair", "table", "bed", "sofa", "cabinet", "woodwork"],
      "auto parts": ["auto parts", "car parts", "auto", "spare", "tyre", "engine", "battery", "motor"],
      "general": ["general", "trading", "goods", "shop", "store", "retail"]
    };
    for (const [ind, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some((k) => msg.includes(k))) {
        industry = ind;
        data.industry = ind;
        break;
      }
    }
    const sellMatch = message.match(/(?:sell|selling|deal in|trade in|business is)\s+(.+)/i);
    if (sellMatch) {
      const sellText = sellMatch[1].split(/[.,]/)[0].trim();
      if (sellText.length > 2 && sellText.length < 50) {
        data.what_they_sell = sellText;
        if (!industry) {
          for (const [ind, keywords] of Object.entries(industryKeywords)) {
            if (keywords.some((k) => sellText.toLowerCase().includes(k))) {
              industry = ind;
              data.industry = ind;
              break;
            }
          }
        }
      }
    }
    const nameMatch = message.match(/(?:called|named|business name is|my business is)\s+(.+)/i);
    if (nameMatch) {
      data.business_name = nameMatch[1].split(/[.,]/)[0].trim().slice(0, 50);
    }
    const productTemplates = {
      "building materials": [
        { name: "Cement (50kg)", price: 7500, stock: 100 },
        { name: "Sand (trip)", price: 25e3, stock: 50 },
        { name: "Granite (trip)", price: 35e3, stock: 30 },
        { name: "Iron Rod (12mm)", price: 8e3, stock: 200 },
        { name: "Paint (gallon)", price: 12e3, stock: 80 }
      ],
      "fashion": [
        { name: "Ankara Gown", price: 15e3, stock: 20 },
        { name: "Silk Scarf", price: 5e3, stock: 50 },
        { name: "Leather Bag", price: 25e3, stock: 10 },
        { name: "Gold Earrings", price: 15e3, stock: 15 },
        { name: "Silver Ring", price: 8e3, stock: 30 }
      ],
      "food": [
        { name: "Rice (50kg bag)", price: 65e3, stock: 50 },
        { name: "Beans (bag)", price: 45e3, stock: 40 },
        { name: "Garri (bag)", price: 25e3, stock: 60 },
        { name: "Cooking Oil (5L)", price: 12e3, stock: 100 },
        { name: "Spices Pack", price: 3500, stock: 200 }
      ],
      "electronics": [
        { name: "Phone Charger", price: 2500, stock: 200 },
        { name: "Phone Case", price: 3e3, stock: 150 },
        { name: "Power Bank", price: 15e3, stock: 50 },
        { name: "Earphones", price: 5e3, stock: 100 },
        { name: "Phone Screen Guard", price: 2e3, stock: 300 }
      ],
      "groceries": [
        { name: "Indomie Carton", price: 8500, stock: 100 },
        { name: "Sugar (1kg)", price: 1200, stock: 200 },
        { name: "Milk (tin)", price: 500, stock: 500 },
        { name: "Detergent", price: 1500, stock: 300 },
        { name: "Bath Soap", price: 800, stock: 400 }
      ],
      "health": [
        { name: "Paracetamol (pack)", price: 500, stock: 500 },
        { name: "Cough Syrup", price: 2500, stock: 200 },
        { name: "Multivitamin", price: 3500, stock: 150 },
        { name: "Antiseptic", price: 1500, stock: 300 },
        { name: "First Aid Kit", price: 8e3, stock: 50 }
      ],
      "beauty": [
        { name: "Foundation", price: 5e3, stock: 100 },
        { name: "Lipstick", price: 3500, stock: 200 },
        { name: "Skincare Set", price: 12e3, stock: 50 },
        { name: "Hair Product", price: 4e3, stock: 150 },
        { name: "Nail Polish", price: 2e3, stock: 300 }
      ],
      "furniture": [
        { name: "Dining Chair", price: 25e3, stock: 20 },
        { name: "Office Table", price: 45e3, stock: 15 },
        { name: "Bed Frame", price: 8e4, stock: 10 },
        { name: "Sofa Set", price: 15e4, stock: 5 },
        { name: "Wardrobe", price: 12e4, stock: 8 }
      ],
      "auto parts": [
        { name: "Brake Pad", price: 8e3, stock: 50 },
        { name: "Oil Filter", price: 3500, stock: 100 },
        { name: "Spark Plug", price: 2e3, stock: 200 },
        { name: "Car Battery", price: 35e3, stock: 20 },
        { name: "Headlight", price: 12e3, stock: 40 }
      ],
      "general": [
        { name: "Product 1", price: 5e3, stock: 100 },
        { name: "Product 2", price: 1e4, stock: 50 },
        { name: "Product 3", price: 15e3, stock: 30 }
      ]
    };
    data.suggested_products = productTemplates[industry] || productTemplates["general"];
    data.stage = "confirm_details";
    return {
      response: `Great! I can set up your store right away. Here's what I picked up:

*Business Type:* ${data.industry || "General Trading"}
*Location:* ${data.city || "Not specified"}
*Products:* ${data.what_they_sell || data.suggested_products.map((p) => p.name).join(", ")}

I've prepared ${data.suggested_products.length} product listings based on your industry with recommended prices. 

To complete setup, I need:
1. Your business name
2. Your phone number (for customer contact)
3. Your delivery areas (e.g., "Abuja and environs")

You can also tell me to adjust any prices or add more products. What's your business name?`,
      stage: "confirm_details",
      data
    };
  }
  if (stage === "confirm_details") {
    if (!data.business_name) {
      data.business_name = message.split(/[.,]/)[0].trim().slice(0, 50);
      return {
        response: `Got it! *${data.business_name}* \u2014 nice name.

What's your phone number? Customers will use this to reach your AI sales agent.`,
        stage: "get_phone",
        data
      };
    }
  }
  if (stage === "get_phone") {
    const phone = normalizePhone(message);
    data.phone = phone;
    return {
      response: `Got it: ${phone}

What areas do you deliver to? (e.g., "Abuja \u2014 within FCT and nearby towns" or "Nationwide")`,
      stage: "get_delivery",
      data
    };
  }
  if (stage === "get_delivery") {
    data.delivery_zones = message.slice(0, 200);
    const productList = data.suggested_products.map((p, i) => `${i + 1}. ${p.name} \u2014 N${p.price.toLocaleString()} (stock: ${p.stock})`).join("\n");
    return {
      response: `Perfect! Here's your store setup summary:

*Business:* ${data.business_name}
*Industry:* ${data.industry || "General"}
*Location:* ${data.city || "Nigeria"}
*Phone:* ${data.phone}
*Delivery:* ${data.delivery_zones}

*Products ready to list:*
${productList}

Say *"Launch my store"* to go live, or tell me what to change (add/remove products, adjust prices, etc.).`,
      stage: "review",
      data
    };
  }
  if (stage === "review") {
    if (/launch|go live|activate|start selling|done|confirm|proceed/i.test(msg)) {
      return {
        response: null,
        // signal: create merchant + products
        stage: "launch",
        data
      };
    }
    const priceMatch = msg.match(/change.*price.*(\d+)\s+.*?(\d+)/);
    if (priceMatch) {
      const idx = parseInt(priceMatch[1]) - 1;
      const newPrice = parseInt(priceMatch[2]);
      if (data.suggested_products[idx]) {
        data.suggested_products[idx].price = newPrice;
        return {
          response: `Updated! ${data.suggested_products[idx].name} is now N${newPrice.toLocaleString()}.

Anything else to change? Or say *"Launch my store"* to go live.`,
          stage: "review",
          data
        };
      }
    }
    if (/add.*product/i.test(msg)) {
      return {
        response: `Sure! Tell me the product name and price (e.g., "Generator, 45000, 15")`,
        stage: "add_product",
        data
      };
    }
    const removeMatch = msg.match(/remove\s+(\d+)/);
    if (removeMatch) {
      const idx = parseInt(removeMatch[1]) - 1;
      if (data.suggested_products[idx]) {
        const removed = data.suggested_products.splice(idx, 1)[0];
        return {
          response: `Removed "${removed.name}". ${data.suggested_products.length} products remaining.

Say *"Launch my store"* to go live.`,
          stage: "review",
          data
        };
      }
    }
    return {
      response: `I didn't catch that. You can:
- Say *"Launch my store"* to go live
- Say "add product" to add more
- Say "remove 2" to remove product #2
- Say "change price 3 to 25000" to update a price`,
      stage: "review",
      data
    };
  }
  if (stage === "add_product") {
    const parts = message.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      const name = parts[0];
      const price = parseInt(parts[1]) || 5e3;
      const stock = parseInt(parts[2]) || 10;
      data.suggested_products.push({ name, price, stock });
      const productList = data.suggested_products.map((p, i) => `${i + 1}. ${p.name} \u2014 N${p.price.toLocaleString()}`).join("\n");
      return {
        response: `Added ${name} at N${price.toLocaleString()} (stock: ${stock}).

Current products:
${productList}

Say *"Launch my store"* to go live.`,
        stage: "review",
        data
      };
    }
    return {
      response: `Format: product name, price, stock
Example: Generator, 45000, 15`,
      stage: "add_product",
      data
    };
  }
  return {
    response: "I didn't understand that. Can you tell me what you sell and where you're located? (e.g., 'I sell building materials in Abuja')",
    stage: "start",
    data
  };
}
__name(aiSetupEngine, "aiSetupEngine");
var DEFAULT_AI_PERMISSIONS = {
  AUTO_RESPOND: { auto: true, desc: "AI can respond to customer messages automatically" },
  TAKE_ORDERS: { auto: true, desc: "AI can take and create orders" },
  SEND_PAYMENT_LINKS: { auto: true, desc: "AI can send Paystack payment links" },
  CONTACT_CUSTOMER: { auto: true, desc: "AI can proactively message customers about order status" },
  UPDATE_FULFILLMENT: { auto: true, desc: "AI can update delivery status and tracking" },
  CREATE_DELIVERY: { auto: true, desc: "AI can create delivery orders with logistics providers" },
  CONTACT_MERCHANT: { auto: true, desc: "AI can alert merchant about issues requiring attention" },
  ISSUE_REFUND: { auto: false, desc: "AI can issue refunds (requires merchant approval)" },
  MODIFY_PAYMENT: { auto: false, desc: "AI can modify payment amounts (requires merchant approval)" },
  OVERRIDE_PRICE: { auto: false, desc: "AI can override product prices (requires merchant approval)" }
};
var INDUSTRY_PAGES = {
  "building-materials": {
    title: "Sell Building Materials with AI",
    hero: "Your AI Sales Agent for Building Materials",
    pain: "Customers call at all hours asking for cement prices, block quantities, and delivery to site. You cant answer every call.",
    solution: "HARZ AI handles customer questions, takes orders, collects payment via Paystack, and arranges delivery \u2014 24/7.",
    products: "Cement, blocks, sand, granite, iron rods, paint, tiles",
    testimonial: "I sell cement in Abuja. Now customers chat my AI, pay online, and get delivery without me touching anything.",
    image: "\\u1F3D7\\uFE0F"
  },
  "fashion": {
    title: "Sell Fashion with AI",
    hero: "Your AI Fashion Sales Agent",
    pain: "Customers message asking for prices, sizes, availability. You reply to 50 messages a day instead of running your business.",
    solution: "HARZ AI answers fashion questions, recommends outfits, takes orders, and collects payment automatically.",
    products: "Ankara, shoes, bags, jewelry, accessories",
    testimonial: "My AI sells while I sleep. Customers order, pay with Paystack, and I just fulfill.",
    image: "\\u1F455"
  },
  "food": {
    title: "Sell Food Items with AI",
    hero: "Your AI Foodstuff Sales Agent",
    pain: "Customers ask for rice prices, bean quantities, garri availability every single day. You need help answering.",
    solution: "HARZ AI handles food orders, tracks inventory, and collects payment \u2014 all on WhatsApp.",
    products: "Rice, beans, garri, cooking oil, spices",
    testimonial: "I sell foodstuff in Kano. My AI agent handles everything. I just pack and deliver.",
    image: "\\u1F35E"
  },
  "electronics": {
    title: "Sell Electronics with AI",
    hero: "Your AI Electronics Sales Agent",
    pain: "Customers ask for phone specs, charger prices, availability. You spend hours replying instead of sourcing stock.",
    solution: "HARZ AI answers product questions, takes orders, and collects payment automatically.",
    products: "Phones, chargers, power banks, accessories",
    testimonial: "My electronics shop now runs on autopilot. AI sells, customer pays, I deliver.",
    image: "\\u1F4F1"
  },
  "groceries": {
    title: "Run a Mini-Mart with AI",
    hero: "Your AI Grocery Sales Agent",
    pain: "Customers ask for prices, availability, delivery. You need an AI that knows your inventory.",
    solution: "HARZ AI handles grocery orders, tracks stock, and arranges delivery automatically.",
    products: "Indomie, sugar, milk, detergent, soap",
    testimonial: "My mini-mart AI takes orders and payment. I just pack and deliver.",
    image: "\\u1F6D2"
  },
  "beauty": {
    title: "Sell Beauty Products with AI",
    hero: "Your AI Beauty Sales Agent",
    pain: "Customers ask for product recommendations, prices, availability. You need help managing messages.",
    solution: "HARZ AI recommends products, takes orders, and collects payment automatically.",
    products: "Makeup, skincare, hair products, nail polish",
    testimonial: "My beauty shop AI sells while I focus on my salon customers.",
    image: "\\u1F484"
  },
  "furniture": {
    title: "Sell Furniture with AI",
    hero: "Your AI Furniture Sales Agent",
    pain: "Customers ask for designs, sizes, prices, delivery. You spend hours on WhatsApp instead of building furniture.",
    solution: "HARZ AI handles furniture inquiries, takes orders, collects payment, and arranges delivery.",
    products: "Chairs, tables, beds, sofas, wardrobes",
    testimonial: "My furniture AI agent handles all customer chat. I just build and deliver.",
    image: "\\u1F6CB\\uFE0F"
  },
  "auto-parts": {
    title: "Sell Auto Parts with AI",
    hero: "Your AI Auto Parts Sales Agent",
    pain: "Customers ask for specific parts, compatibility, prices. You need an AI that knows your inventory.",
    solution: "HARZ AI handles parts inquiries, takes orders, and collects payment automatically.",
    products: "Brake pads, oil filters, spark plugs, batteries",
    testimonial: "My auto parts AI knows every product and price. Customers order and pay without calling me.",
    image: "\\u1F697"
  },
  "health": {
    title: "Run a Pharmacy with AI",
    hero: "Your AI Pharmacy Sales Agent",
    pain: "Customers ask for drug availability, prices, alternatives. You need help managing the counter.",
    solution: "HARZ AI handles pharmacy inquiries, takes orders, and collects payment \u2014 with proper disclaimers.",
    products: "Paracetamol, cough syrup, multivitamins, first aid",
    testimonial: "My pharmacy AI handles routine orders. I focus on prescriptions.",
    image: "\\u1F48A"
  },
  "general": {
    title: "Sell Anything with AI",
    hero: "Your AI Sales Agent for Any Business",
    pain: "You spend hours replying to customer messages, taking orders, and chasing payments.",
    solution: "HARZ AI handles customer chat, takes orders, collects payment, and manages delivery \u2014 automatically.",
    products: "Any products you sell",
    testimonial: "My AI agent runs my shop on autopilot. I just fulfill orders.",
    image: "\\u1F6D2"
  }
};
function industryLandingHTML(industry) {
  const data = INDUSTRY_PAGES[industry] || INDUSTRY_PAGES["general"];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0a7d3c">
<title>${data.title}</title>
<link rel="manifest" href="/manifest.json">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif}
body{background:#f0f2f5;color:#1a1a2e}
.hero{background:linear-gradient(135deg,#0a7d3c,#065f27);color:#fff;padding:40px 20px;text-align:center}
.hero .emoji{font-size:48px;margin-bottom:10px}
.hero h1{font-size:24px;margin-bottom:8px}
.hero p{font-size:14px;opacity:0.9;max-width:400px;margin:0 auto 20px}
.cta-btn{display:inline-block;background:#fff;color:#0a7d3c;padding:14px 32px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none}
.container{max-width:600px;margin:0 auto;padding:14px}
.card{background:#fff;border-radius:12px;padding:16px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.card h2{font-size:16px;color:#0a7d3c;margin-bottom:8px}
.card p{font-size:14px;color:#555;line-height:1.6}
.feature{display:flex;align-items:flex-start;margin-bottom:12px}
.feature-icon{font-size:20px;margin-right:10px;flex-shrink:0}
.feature-text{font-size:14px;color:#333}
.feature-text strong{color:#0a7d3c}
.testimonial{background:#f0fdf4;border-left:3px solid #0a7d3c}
.steps{counter-reset:step}
.steps li{padding:8px 0;font-size:14px;color:#333;list-style:none;position:relative;padding-left:30px}
.steps li:before{counter-increment:step;content:counter(step);position:absolute;left:0;top:8px;width:20px;height:20px;background:#0a7d3c;color:#fff;border-radius:50%;text-align:center;line-height:20px;font-size:11px}
</style>
</head>
<body>
<div class="hero">
<div class="emoji">${data.image}</div>
<h1>${data.hero}</h1>
<p>${data.pain}</p>
<a href="/?start=1&industry=${industry}" class="cta-btn">Get Started Free</a>
</div>
<div class="container">
<div class="card">
<h2>How It Works</h2>
<ol class="steps">
<li>Tell our AI what you sell (in plain English)</li>
<li>AI creates your store with product listings</li>
<li>Customers chat your AI on WhatsApp</li>
<li>AI takes orders and sends Paystack payment links</li>
<li>Payment confirmed \u2014 AI arranges delivery</li>
<li>You track everything from your dashboard</li>
</ol>
</div>
<div class="card">
<h2>What HARZ AI Does For You</h2>
<div class="feature"><div class="feature-icon">\u2705</div><div class="feature-text"><strong>Answers customers 24/7</strong> \u2014 no more missed messages at 2am</div></div>
<div class="feature"><div class="feature-icon">\u2705</div><div class="feature-text"><strong>Takes orders automatically</strong> \u2014 customer picks product, AI creates order</div></div>
<div class="feature"><div class="feature-icon">\u2705</div><div class="feature-text"><strong>Collects payment</strong> \u2014 Paystack link sent, payment verified instantly</div></div>
<div class="feature"><div class="feature-icon">\u2705</div><div class="feature-text"><strong>Manages delivery</strong> \u2014 5 logistics providers, smart routing, tracking</div></div>
<div class="feature"><div class="feature-icon">\u2705</div><div class="feature-text"><strong>Handles disputes</strong> \u2014 tracks issues, alerts you when needed</div></div>
</div>
<div class="card testimonial">
<p>"${data.testimonial}"</p>
<p style="margin-top:8px;font-size:12px;color:#666">\u2014 Real HARZ merchant</p>
</div>
<div class="card" style="text-align:center">
<h2>Ready to Start?</h2>
<p style="margin-bottom:12px">Setup takes 2 minutes. No technical knowledge needed.</p>
<a href="/?start=1&industry=${industry}" class="cta-btn" style="text-decoration:none">Launch Your AI Store</a>
</div>
</div>
</body></html>`;
}
__name(industryLandingHTML, "industryLandingHTML");
function portalHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0a7d3c">
<title>HARZ Merchant Portal</title>
<link rel="manifest" href="/manifest.json">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif}
body{background:#f0f2f5;color:#1a1a2e}
.header{background:#0a7d3c;color:#fff;padding:14px 20px;position:sticky;top:0;z-index:100}
.header h1{font-size:18px}.header .sub{font-size:11px;opacity:0.8}
.container{max-width:600px;margin:0 auto;padding:14px;padding-bottom:70px}
.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.card h2{font-size:15px;color:#0a7d3c;margin-bottom:8px}
.card p{font-size:13px;color:#555;line-height:1.5}
.stat{display:inline-block;text-align:center;padding:10px;background:#f8f9fa;border-radius:8px;margin:4px;min-width:75px}
.stat .num{font-size:20px;font-weight:700;color:#0a7d3c}
.stat .num.red{color:#ef4444}.stat .num.amber{color:#f59e0b}
.stat .lbl{font-size:10px;color:#888}
input,select,textarea{width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:8px;background:#fff}
.label{font-size:12px;font-weight:600;color:#555;margin-bottom:3px;display:block}
.btn{display:block;width:100%;padding:12px;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;text-align:center}
.btn-primary{background:#0a7d3c;color:#fff}.btn-sec{background:#e8f5e9;color:#0a7d3c;border:1px solid #0a7d3c}
.btn-sm{padding:8px;font-size:13px;border-radius:8px;width:auto;display:inline-block}
.tag{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}
.tag.green{background:#dcfce7;color:#16a34a}.tag.amber{background:#fef3c7;color:#d97706}.tag.red{background:#fee2e2;color:#dc2626}.tag.blue{background:#dbeafe;color:#2563eb}
.nav{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e0e0e0;display:flex;max-width:600px;margin:0 auto;z-index:100}
.nav-item{flex:1;padding:10px 2px;text-align:center;font-size:11px;color:#888;cursor:pointer}
.nav-item.active{color:#0a7d3c}.nav-item .ic{font-size:18px}
.section{display:none}.section.active{display:block}
.chat{max-height:300px;overflow-y:auto;margin-bottom:10px}
.chat-msg{padding:8px 12px;border-radius:10px;margin-bottom:6px;font-size:13px;max-width:85%}
.chat-msg.bot{background:#e8f5e9;border-radius:10px 10px 10px 0}
.chat-msg.user{background:#dbeafe;margin-left:auto;border-radius:10px 10px 0 10px}
.toast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:200;opacity:0;transition:.3s}
.toast.show{opacity:1}
.progress{height:4px;background:#e0e0e0;border-radius:2px;margin:8px 0}
.progress-bar{height:100%;background:#0a7d3c;border-radius:2px;transition:.3s}
.step{display:flex;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f0}
.step-num{width:24px;height:24px;border-radius:50%;background:#0a7d3c;color:#fff;text-align:center;line-height:24px;font-size:12px;margin-right:10px;flex-shrink:0}
.step.done .step-num{background:#16a34a}.step.pending .step-num{background:#d1d5db}
.step-text{font-size:13px}.step.done .step-text{color:#666}
</style>
</head>
<body>
<div class="header"><h1>HARZ Merchant Portal</h1><div class="sub">Autonomous Commerce for African SMEs</div></div>
<div class="container">

<!-- LANDING / ONBOARDING -->
<div id="landingSection" class="section active" data-ref="">
<div class="card" style="text-align:center;padding:20px">
<h2 style="font-size:18px;margin-bottom:6px">Start Selling with AI</h2>
<p style="margin-bottom:14px">Get an AI sales agent that takes orders, collects payments, and manages delivery \u2014 all on autopilot.</p>
<button class="btn btn-primary" onclick="showSection('onboard')">Get Started Free</button>
</div>
<div class="card"><h2>How It Works</h2>
<p>1. Tell our AI what you sell<br>2. AI sets up your store instantly<br>3. Customers chat, order, and pay<br>4. AI handles fulfillment automatically<br>5. You track everything from your dashboard</p></div>
<div class="card"><h2>Already a Merchant?</h2>
<div class="label">Phone Number</div><input type="tel" id="loginPhone" placeholder="080XXXXXXXX">
<button class="btn btn-sec" onclick="loginMerchant()">Login to Dashboard</button>
</div>
</div>

<!-- AI SETUP AGENT -->
<div id="onboardSection" class="section">
<div class="card"><h2>AI Store Setup</h2><p>Tell me about your business in plain English. I'll set everything up for you.</p></div>
<div class="card">
<div class="chat" id="setupChat">
<div class="chat-msg bot">Hi! I'm your AI setup assistant. Tell me about your business \u2014 what do you sell and where are you located?</div>
</div>
<input type="text" id="setupInput" placeholder="e.g. I sell building materials in Abuja">
<button class="btn btn-primary" onclick="sendSetupMsg()">Send</button>
</div>
</div>

<!-- MERCHANT DASHBOARD / COMMAND CENTER -->
<div id="dashSection" class="section">
<div class="card"><div style="text-align:center">
<div class="stat"><div class="num" id="stOrders">0</div><div class="lbl">Orders Today</div></div>
<div class="stat"><div class="num" id="stRevenue">0</div><div class="lbl">Revenue</div></div>
<div class="stat"><div class="num amber" id="stPending">0</div><div class="lbl">Pending</div></div>
<div class="stat"><div class="num red" id="stIssues">0</div><div class="lbl">Issues</div></div>
</div></div>
<div class="card"><h2>Recent Orders</h2><div id="dashOrders" style="font-size:13px;color:#999">Loading...</div></div>
<div class="card"><h2>Inventory</h2><div id="dashInventory" style="font-size:13px;color:#999">Loading...</div></div>
<div class="card"><h2>AI Actions Log</h2><div id="dashActions" style="font-size:13px;color:#999">No AI actions yet</div></div>
<div class="card"><h2>Earnings</h2>
<div style="font-size:13px">
<div style="display:flex;justify-content:space-between;padding:4px 0"><span>Gross Revenue:</span><strong id="earnGross">N0</strong></div>
<div style="display:flex;justify-content:space-between;padding:4px 0"><span>Commission (10%):</span><strong id="earnComm">N0</strong></div>
<div style="display:flex;justify-content:space-between;padding:4px 0"><span>Delivery Costs:</span><strong id="earnDel">N0</strong></div>
<div style="display:flex;justify-content:space-between;padding:4px 0;border-top:1px solid #eee;margin-top:4px;padding-top:8px"><span>Net Earnings:</span><strong style="color:#0a7d3c" id="earnNet">N0</strong></div>
</div></div>
</div>

<!-- PRODUCTS -->
<div id="productsSection" class="section">
<div class="card"><h2>Add Product</h2>
<div class="label">Product Name</div><input type="text" id="prodName" placeholder="e.g. Cement 50kg">
<div class="label">Price (Naira)</div><input type="number" id="prodPrice" placeholder="7500">
<div class="label">Stock Quantity</div><input type="number" id="prodStock" placeholder="100">
<div class="label">Category (optional)</div><input type="text" id="prodCategory" placeholder="Building Materials">
<button class="btn btn-primary" onclick="addProduct()">Add Product</button>
</div>
<div class="card"><h2>Your Products</h2><div id="productList" style="font-size:13px;color:#999">No products yet</div></div>
</div>

<!-- AI SETTINGS -->
<div id="aiSection" class="section">
<div class="card"><h2>AI Permissions</h2><p style="font-size:12px;margin-bottom:8px">Control what your AI agent can do automatically vs. what needs your approval.</p>
<div id="permissionsList" style="font-size:13px"></div></div>
<div class="card"><h2>Store Status</h2>
<div id="storeStatus" style="font-size:13px"></div>
<button class="btn btn-sec" onclick="toggleStore()" id="storeToggleBtn">Loading...</button>
</div>
</div>

<!-- TRUST -->
<div id="trustSection" class="section">
<div class="card"><h2>Trust Score</h2>
<div style="text-align:center;padding:10px">
<div style="font-size:32px;font-weight:700;color:#0a7d3c" id="trustScore">--</div>
<div style="font-size:12px;color:#888">Based on orders, delivery, disputes, and customer ratings</div>
</div></div>
<div class="card"><h2>Verification</h2><div id="verificationStatus" style="font-size:13px;color:#999">Not verified yet</div>
<div style="margin-top:10px">
<div class="label">Business Name (as registered)</div><input type="text" id="verifyBizName" placeholder="e.g. Adebayo Construction Ltd">
<div class="label">RC Number (if registered)</div><input type="text" id="verifyRC" placeholder="RC 1234567">
<button class="btn btn-sec" onclick="submitVerification()">Submit for Verification</button>
</div></div>
<div class="card"><h2>Disputes</h2><div id="disputeList" style="font-size:13px;color:#999">No disputes</div></div>
<div class="card"><h2>Audit Log</h2><div id="auditLog" style="font-size:13px;color:#999">No actions logged yet</div></div>
</div>

</div>
<div class="nav">
<div class="nav-item active" onclick="showSection('dash')"><div class="ic">&#x1F3E0;</div>Home</div>
<div class="nav-item" onclick="showSection('products')"><div class="ic">&#x1F4E6;</div>Products</div>
<div class="nav-item" onclick="showSection('ai')"><div class="ic">&#x1F916;</div>AI</div>
<div class="nav-item" onclick="showSection('trust')"><div class="ic">&#x1F6E1;</div>Trust</div>
</div>
<div class="toast" id="toast"></div>
<script>
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}
function showSection(s){document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));document.getElementById(s+'Section').classList.add('active');document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));event.currentTarget.classList.add('active');if(s==='dash')loadDash();if(s==='products')loadProducts();if(s==='ai')loadAI();if(s==='trust')loadTrust()}

// AI Setup Chat
let setupSessionId=null;
async function sendSetupMsg(){const inp=document.getElementById('setupInput');const msg=inp.value.trim();if(!msg)return;inp.value='';const chat=document.getElementById('setupChat');chat.innerHTML+='<div class="chat-msg user">'+msg.replace(/</g,'&lt;')+'</div>';chat.scrollTop=chat.scrollHeight;
const r=await fetch('/api/ai-setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:setupSessionId,message:msg})});const d=await r.json();
if(d.response){chat.innerHTML+='<div class="chat-msg bot">'+d.response.replace(/\\n/g,'<br>')+'</div>';}chat.scrollTop=chat.scrollHeight;
if(d.session_id)setupSessionId=d.session_id;
if(d.launched&&d.merchant_id){toast('Store launched successfully!');localStorage.setItem('merchantId',d.merchant_id);setTimeout(()=>{showSection('dash');loadDash()},2000)}}

// Dashboard
async function loadDash(){const mid=localStorage.getItem('merchantId');if(!mid){showSection('landing');return}
const r=await fetch('/api/dashboard?merchant_id='+mid);const d=await r.json();
if(d.success){
document.getElementById('stOrders').textContent=d.stats.orders_today||0;
document.getElementById('stRevenue').textContent='N'+(d.stats.revenue_today||0).toLocaleString();
document.getElementById('stPending').textContent=d.stats.pending||0;
document.getElementById('stIssues').textContent=d.stats.issues||0;
document.getElementById('earnGross').textContent='N'+(d.earnings.gross||0).toLocaleString();
document.getElementById('earnComm').textContent='N'+(d.earnings.commission||0).toLocaleString();
document.getElementById('earnDel').textContent='N'+(d.earnings.delivery||0).toLocaleString();
document.getElementById('earnNet').textContent='N'+(d.earnings.net||0).toLocaleString();
if(d.orders&&d.orders.length>0){document.getElementById('dashOrders').innerHTML=d.orders.slice(0,10).map(o=>'<div style="padding:6px 0;border-bottom:1px solid #eee"><strong>'+o.product_name+'</strong> x'+o.quantity+' - N'+(o.amount||0).toLocaleString()+' <span class="tag '+(o.status==='paid'?'green':o.status==='pending'?'amber':'red')+'">'+o.status+'</span></div>').join('');}
if(d.products&&d.products.length>0){document.getElementById('dashInventory').innerHTML=d.products.map(p=>'<div style="padding:4px 0;border-bottom:1px solid #eee">'+p.name+' - '+p.stock+' left @ N'+p.price.toLocaleString()+'</div>').join('');}
if(d.ai_actions&&d.ai_actions.length>0){document.getElementById('dashActions').innerHTML=d.ai_actions.slice(0,10).map(a=>'<div style="padding:4px 0;border-bottom:1px solid #eee"><span style="font-size:11px;color:#888">'+a.created_at.slice(0,16)+'</span> '+a.action+'</div>').join('');}
}}

// Products
async function loadProducts(){const mid=localStorage.getItem('merchantId');if(!mid)return;
const r=await fetch('/api/products?merchant_id='+mid);const d=await r.json();
if(d.products&&d.products.length>0){document.getElementById('productList').innerHTML=d.products.map(p=>'<div style="padding:8px 0;border-bottom:1px solid #eee"><strong>'+p.name+'</strong> - N'+p.price.toLocaleString()+' (stock: '+p.stock+') <button class="btn-sm" style="background:#fee2e2;color:#dc2626;float:right" onclick="delProduct(\\''+p.id+'\\')">Delete</button></div>').join('');}}
async function addProduct(){const mid=localStorage.getItem('merchantId');if(!mid){toast('Setup your store first');return}const n=document.getElementById('prodName').value.trim();const p=parseFloat(document.getElementById('prodPrice').value);const s=parseInt(document.getElementById('prodStock').value)||0;const c=document.getElementById('prodCategory').value.trim();if(!n||!p){toast('Name and price required');return}const r=await fetch('/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({merchant_id:mid,name:n,price:p,stock:s,category:c})});const d=await r.json();if(d.success){toast('Product added!');document.getElementById('prodName').value='';document.getElementById('prodPrice').value='';document.getElementById('prodStock').value='';loadProducts()}else{toast(d.error||'Failed')}}
async function delProduct(pid){const mid=localStorage.getItem('merchantId');const r=await fetch('/api/products/'+pid,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({merchant_id:mid})});const d=await r.json();if(d.success){toast('Deleted');loadProducts()}}

// AI Settings
async function loadAI(){const mid=localStorage.getItem('merchantId');if(!mid)return;
const pr=await fetch('/api/permissions?merchant_id='+mid);const pd=await pr.json();
if(pd.permissions){document.getElementById('permissionsList').innerHTML=Object.entries(pd.permissions).map(([k,v])=>'<div style="padding:6px 0;border-bottom:1px solid #f0f0f0"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:12px">'+k.replace(/_/g,' ')+'</span><span class="tag '+(v.auto?'green':'amber')+'" style="cursor:pointer" onclick="togglePermission(\\''+k+'\\')">'+(v.auto?'AUTO':'MANUAL')+'</span></div><div style="font-size:11px;color:#888">'+v.desc+'</div></div>').join('');}
const sr=await fetch('/api/merchants/'+mid);const sd=await sr.json();
if(sd.merchant){const st=sd.merchant.status;document.getElementById('storeStatus').innerHTML='Status: <span class="tag '+(st==='live'?'green':'amber')+'">'+st+'</span>';document.getElementById('storeToggleBtn').textContent=st==='live'?'Pause Store':'Go Live';}}
async function togglePermission(perm){const mid=localStorage.getItem('merchantId');const r=await fetch('/api/permissions',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({merchant_id:mid,permission:perm})});const d=await r.json();if(d.success){toast('Updated');loadAI()}}
async function toggleStore(){const mid=localStorage.getItem('merchantId');const sr=await fetch('/api/merchants/'+mid);const sd=await sr.json();const newStatus=sd.merchant.status==='live'?'paused':'live';const r=await fetch('/api/merchants/'+mid,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:newStatus})});const d=await r.json();if(d.success){toast('Store '+newStatus);loadAI()}}

// Trust
async function loadTrust(){const mid=localStorage.getItem('merchantId');if(!mid)return;
const r=await fetch('/api/trust/'+mid);const d=await r.json();
if(d.success){
document.getElementById('trustScore').textContent=d.trust_score+'/100';
if(d.verification){document.getElementById('verificationStatus').innerHTML='<span class="tag '+d.verification.status==='verified'?'green':'amber'+'">'+d.verification.status+'</span>';}
if(d.disputes&&d.disputes.length>0){document.getElementById('disputeList').innerHTML=d.disputes.map(dp=>'<div style="padding:6px 0;border-bottom:1px solid #eee">#'+dp.id.slice(0,8)+' - '+dp.reason+' <span class="tag '+dp.status+'">'+dp.status+'</span></div>').join('');}
if(d.audit&&d.audit.length>0){document.getElementById('auditLog').innerHTML=d.audit.slice(0,10).map(a=>'<div style="padding:4px 0;border-bottom:1px solid #eee"><span style="font-size:11px;color:#888">'+a.created_at.slice(0,16)+'</span> '+a.action+'</div>').join('');}
}}

// Login
async function loginMerchant(){const ph=document.getElementById('loginPhone').value.trim();if(!ph){toast('Enter phone number');return}const r=await fetch('/api/merchants/lookup?phone='+normalizePhone(ph));const d=await r.json();if(d.merchant_id){localStorage.setItem('merchantId',d.merchant_id);showSection('dash');loadDash()}else{toast('No merchant found. Set up your store first.')}}
function normalizePhone(p){p=p.replace(/\\s/g,'').replace(/^\\+/,'');if(p.startsWith('0'))return'234'+p.slice(1);if(p.length===10)return'234'+p;return p}

// Init
const ref=new URLSearchParams(location.search).get('ref');if(ref){localStorage.setItem('refCode',ref)}if(localStorage.getItem('merchantId')){showSection('dash');loadDash()}else{showSection('landing')}
<\/script>
</body></html>`;
}
__name(portalHTML, "portalHTML");
// ---------- MEMBER GATE (root-anchored membership warrants) v1 ----------
// Law: hot Ed25519 key generated IN the worker, private JWK lives only in MP_DB,
// never travels. Warrants are canonical-JSON signed, revocable, publicly verifiable.
// Chain of trust: root zone record members.harz TXT "mbr-zsk <fp>" pins this key's
// fingerprint (same delegation law as hns-zsk). Fail-closed everywhere.
const MBR_SPKI = new Uint8Array([0x30,0x2a,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x03,0x21,0x00]);
function mbrCanon(o) {
  if (o === null || typeof o !== "object") return JSON.stringify(o);
  if (Array.isArray(o)) return "[" + o.map(mbrCanon).join(",") + "]";
  const ks = Object.keys(o).sort();
  return "{" + ks.map((k) => JSON.stringify(k) + ":" + mbrCanon(o[k])).join(",") + "}";
}
function mbrHex(buf) { return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
async function mbrFp(rawPub) {
  const spki = new Uint8Array(MBR_SPKI.length + rawPub.length);
  spki.set(MBR_SPKI); spki.set(rawPub, MBR_SPKI.length);
  const d = await crypto.subtle.digest("SHA-256", spki);
  return mbrHex(d).slice(0, 16);
}
async function mbrGetKey(env) {
  const rec = await env.MP_DB.prepare("SELECT jwk, fp FROM mportal_mbr_key WHERE id='hot'").first();
  if (rec) return { jwk: JSON.parse(rec.jwk), fp: rec.fp };
  const kp = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
  const privJwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  const rawPub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const fp = await mbrFp(rawPub);
  await env.MP_DB.prepare("INSERT INTO mportal_mbr_key (id, jwk, fp, created_at) VALUES ('hot',?,?,?)")
    .bind(JSON.stringify(privJwk), fp, new Date().toISOString()).run();
  return { jwk: privJwk, fp };
}
async function mbrSign(env, payload) {
  const { jwk } = await mbrGetKey(env);
  const priv = await crypto.subtle.importKey("jwk", jwk, "Ed25519", true, ["sign"]);
  const sig = await crypto.subtle.sign("Ed25519", priv, new TextEncoder().encode(mbrCanon(payload)));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}
async function mbrVerify(env, payload, sigB64) {
  const { jwk } = await mbrGetKey(env);
  const pubJwk = { kty: jwk.kty, crv: jwk.crv, x: jwk.x };
  const pub = await crypto.subtle.importKey("jwk", pubJwk, "Ed25519", true, ["verify"]);
  const sig = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
  return crypto.subtle.verify("Ed25519", pub, sig, new TextEncoder().encode(mbrCanon(payload)));
}
async function mbrAdminOk(env, request) {
  const k = env.MBR_ADMIN_KEY;
  if (!k) return false;
  return request.headers.get("x-mbr-key") === k;
}
function mbrPageHTML(rows) {
  const list = rows.map((r) => `<tr><td>${String(r.business || "").replace(/[<>&]/g, "")}</td><td>${String(r.city || "").replace(/[<>&]/g, "")}</td><td>${r.tier}</td><td>${r.expires_at}</td><td class="mono">${r.id}</td></tr>`).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f0f2f5"><title>HARZ Member Gate</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:#f0f2f5;color:#1a1a2e;padding:16px 12px}h1{font-size:20px;color:#0a7d3c;text-align:center}p.sub{font-size:11px;color:#666;text-align:center;margin:4px 0 14px}.card{background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:14px;margin-bottom:12px}.card h2{font-size:14px;margin-bottom:10px;color:#0a7d3c}input{width:100%;padding:10px;border:1px solid #e0e0e0;border-radius:8px;font-size:13px;outline:none}button{width:100%;padding:10px;background:#0a7d3c;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;margin-top:8px;cursor:pointer}table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;color:#666;font-size:10px;text-transform:uppercase;padding:6px 4px;border-bottom:1px solid #e0e0e0}td{padding:8px 4px;border-bottom:1px solid #f0f0f0}.mono{font-family:monospace;font-size:10px}#res{font-size:13px;margin-top:10px;white-space:pre-wrap}.ok{color:#137333}.bad{color:#c62828}.ft{text-align:center;font-size:10px;color:#999;padding:10px}</style></head><body><h1>HARZ MEMBER GATE</h1><p class="sub">Root-anchored membership warrants &bull; sovereign .harz trust rail</p><div class="card"><h2>Verify a warrant</h2><input id="wid" placeholder="warrant id (mbr_...)"><button onclick="vfy()">Verify</button><div id="res"></div></div><div class="card"><h2>Members</h2>${rows.length ? `<table><tr><th>Business</th><th>City</th><th>Tier</th><th>Expires</th><th>Warrant</th></tr>${list}</table>` : `<p style="font-size:12px;color:#666">No members yet &mdash; the first warrant opens the gate.</p>`}</div><div class="ft">HARZ Merchant Portal &bull; Member Gate v1 &bull; members.harz</div><script>async function vfy(){const r=document.getElementById('res');const id=document.getElementById('wid').value.trim();if(!id)return;r.textContent='checking...';try{const d=await(await fetch('/api/membership/verify/'+encodeURIComponent(id))).json();if(d.valid)r.innerHTML='<span class="ok">VALID</span>\\n'+JSON.stringify(d.warrant,null,2);else r.innerHTML='<span class="bad">'+(d.reason||'INVALID')+'</span>'}catch(e){r.innerHTML='<span class="bad">error</span>'}}</script></body></html>`;
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  await initDB(env);
  if (path === "/" && method === "GET") {
    const industry = url.searchParams.get("industry");
    if (industry && INDUSTRY_PAGES[industry]) {
      return new Response(industryLandingHTML(industry), { headers: { "Content-Type": "text/html", "Cache-Control": "no-cache" } });
    }
    return new Response(portalHTML(), { headers: { "Content-Type": "text/html", "Cache-Control": "no-cache" } });
  }
  if (path === "/manifest.json" && method === "GET") {
    return json({
      name: "HARZ Merchant Portal",
      short_name: "HARZ Merchant",
      start_url: "/",
      display: "standalone",
      background_color: "#f0f2f5",
      theme_color: "#0a7d3c",
      icons: [{ src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">\u{1F3EA}</text></svg>', sizes: "192x192", type: "image/svg+xml" }]
    });
  }
  if (path === "/api/health" && method === "GET") {
    return json({ status: "ok", version: "1.1.0", service: "harz-merchant-portal", components: ["onboarding", "command_center", "ai_setup_agent", "acquisition_system", "trust_layer", "membership"] });
  }
  if (path === "/api/membership/pub" && method === "GET") {
    const { fp } = await mbrGetKey(env);
    return json({ status: "ok", service: "HARZ Member Gate", version: "1.0.0", alg: "Ed25519", fp, root_binding: "members.harz TXT mbr-zsk " + fp, law: "hot key generated in-worker, private JWK never travels; fp = sha256(SPKI DER)[:16]" });
  }
  if (path === "/membership" && method === "GET") {
    const rows = await env.MP_DB.prepare("SELECT id, business, city, tier, expires_at FROM mportal_warrants WHERE revoked = 0 ORDER BY issued_at DESC LIMIT 100").all();
    return new Response(mbrPageHTML(rows.results || []), { headers: { "Content-Type": "text/html", "Cache-Control": "no-cache" } });
  }
  if (path.startsWith("/api/membership/verify/") && method === "GET") {
    const wid = decodeURIComponent(path.slice("/api/membership/verify/".length));
    const w = await env.MP_DB.prepare("SELECT * FROM mportal_warrants WHERE id = ?").bind(wid).first();
    if (!w) return json({ valid: false, reason: "no such warrant" }, 404);
    if (w.revoked) return json({ valid: false, reason: "revoked at " + w.revoked_at });
    if (new Date(w.expires_at) < new Date()) return json({ valid: false, reason: "expired" });
    const payload = JSON.parse(w.payload);
    const sigOk = await mbrVerify(env, payload, w.sig);
    if (!sigOk) return json({ valid: false, reason: "SIGNATURE INVALID" });
    return json({ valid: true, warrant: payload, chain_of_trust: { fp: (await mbrGetKey(env)).fp, root_record: "members.harz", height_at_issue: w.root_height } });
  }
  if (path === "/api/membership/issue" && method === "POST") {
    if (!(await mbrAdminOk(env, request))) return json({ error: "admin key required (x-mbr-key)" }, 401);
    const b = await request.json().catch(() => ({}));
    if (!b.merchant_id) return json({ error: "merchant_id required" }, 400);
    const m = await env.MP_DB.prepare("SELECT * FROM mportal_merchants WHERE id = ?").bind(b.merchant_id).first();
    if (!m) return json({ error: "merchant not found" }, 404);
    const rootZone = await fetch("https://harz-root.harz.workers.dev/zone").then((r) => r.json()).catch(() => null);
    if (!rootZone || !rootZone.height) return json({ error: "root unreachable — fail-closed, no warrant without the anchor" }, 503);
    const months = Number(b.months) || 12;
    const issued = new Date();
    const expires = new Date(issued); expires.setMonth(expires.getMonth() + months);
    const payload = { v: 1, kind: "harz-member-warrant", warrant_id: "mbr_" + uuid(), merchant_id: m.id, business: m.business_name, phone: m.phone, city: m.city, tier: m.verified ? "verified-member" : "member", root_height: rootZone.height, issued_at: issued.toISOString(), expires_at: expires.toISOString() };
    const sig = await mbrSign(env, payload);
    await env.MP_DB.prepare("INSERT INTO mportal_warrants (id, merchant_id, business, city, tier, payload, sig, root_height, issued_at, expires_at, revoked) VALUES (?,?,?,?,?,?,?,?,?,?,0)")
      .bind(payload.warrant_id, m.id, m.business_name, m.city, payload.tier, JSON.stringify(payload), sig, rootZone.height, payload.issued_at, payload.expires_at).run();
    return json({ issued: true, warrant: payload, sig, verify: "/api/membership/verify/" + payload.warrant_id });
  }
  if (path === "/api/membership/revoke" && method === "POST") {
    if (!(await mbrAdminOk(env, request))) return json({ error: "admin key required (x-mbr-key)" }, 401);
    const b = await request.json().catch(() => ({}));
    if (!b.warrant_id) return json({ error: "warrant_id required" }, 400);
    const w = await env.MP_DB.prepare("SELECT id FROM mportal_warrants WHERE id = ?").bind(b.warrant_id).first();
    if (!w) return json({ error: "no such warrant" }, 404);
    await env.MP_DB.prepare("UPDATE mportal_warrants SET revoked = 1, revoked_at = ? WHERE id = ?").bind(new Date().toISOString(), b.warrant_id).run();
    return json({ revoked: true, warrant_id: b.warrant_id });
  }

  if (path === "/api/ai-setup" && method === "POST") {
    const b = await request.json().catch(() => ({}));
    let sessionId = b.session_id || uuid();
    const ts = now();
    let session = null;
    if (b.session_id) {
      session = await env.MP_DB.prepare("SELECT * FROM mportal_ai_sessions WHERE id = ?").bind(b.session_id).first();
    }
    if (!session) {
      await env.MP_DB.prepare("INSERT INTO mportal_ai_sessions (id, merchant_id, phone, stage, conversation, setup_data, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(sessionId, null, null, "start", JSON.stringify([]), JSON.stringify({}), "active", ts, ts).run();
      session = { stage: "start", setup_data: "{}", conversation: "[]" };
    }
    const sessionData = { stage: session.stage, setup_data: JSON.parse(session.setup_data || "{}") };
    const result = aiSetupEngine(b.message, sessionData);
    const conv = JSON.parse(session.conversation || "[]");
    conv.push({ role: "user", text: b.message });
    if (result.response)
      conv.push({ role: "bot", text: result.response });
    await env.MP_DB.prepare("UPDATE mportal_ai_sessions SET stage = ?, conversation = ?, setup_data = ?, updated_at = ? WHERE id = ?").bind(result.stage, JSON.stringify(conv), JSON.stringify(result.data), ts, sessionId).run();
    if (result.stage === "launch") {
      const data = result.data;
      const merchantId = uuid();
      const refCode = "HARZ" + merchantId.slice(0, 6).toUpperCase();
      await env.MP_DB.prepare(`INSERT INTO mportal_merchants
        (id, phone, business_name, owner_name, industry, city, address, status, plan, onboarding_step, onboarding_data, delivery_zones, ai_permissions, referral_code, joined_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(merchantId, data.phone || null, data.business_name || "My Store", null, data.industry || "general", data.city || "Nigeria", null, "live", "free", 8, JSON.stringify(data), data.delivery_zones || "Nationwide", JSON.stringify(DEFAULT_AI_PERMISSIONS), refCode, ts, ts).run();
      for (const p of data.suggested_products || []) {
        const pid = uuid();
        await env.MP_DB.prepare("INSERT INTO mportal_products (id, merchant_id, name, price, stock, category, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(pid, merchantId, p.name, p.price, p.stock, data.industry || "general", "active", ts, ts).run();
      }
      await env.MP_DB.prepare("INSERT INTO mportal_audit_log (id, merchant_id, action, actor, details, created_at) VALUES (?,?,?,?,?,?)").bind(uuid(), merchantId, "STORE_CREATED", "ai_setup_agent", "Store created via AI setup agent", ts).run();
      await env.MP_DB.prepare("INSERT INTO mportal_trust_events (id, merchant_id, event_type, description, severity, created_at) VALUES (?,?,?,?,?,?)").bind(uuid(), merchantId, "store_created", "Store created and activated", "info", ts).run();
      try {
        const setupRes = await env.SALES_AGENT.fetch("https://internal/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.business_name,
            owner_phone: data.phone,
            phone: data.phone,
            location: data.city,
            hours: "Mon-Sat 8am-8pm",
            products: (data.suggested_products || []).map((p) => ({ name: p.name, price: p.price, stock: p.stock }))
          })
        });
        const setupData = await setupRes.json();
        if (setupData.success) {
          await env.MP_DB.prepare("UPDATE mportal_merchants SET onboarding_data = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify({ ...data, sales_agent_biz_id: setupData.business_id }), ts, merchantId).run();
        }
      } catch (e) {
        console.error("Sales agent setup failed:", e.message);
      }
      return json({
        success: true,
        session_id: sessionId,
        response: `\u{1F389} Your store *${data.business_name}* is LIVE!

${(data.suggested_products || []).length} products listed.
Delivery: ${data.delivery_zones || "Nationwide"}

Your AI sales agent is active. Customers can now chat, order, and pay \u2014 all handled automatically.

Your referral code: ${refCode}
Share it with other businesses to earn commission!

Opening your dashboard...`,
        launched: true,
        merchant_id: merchantId
      });
    }
    return json({
      success: true,
      session_id: sessionId,
      response: result.response
    });
  }
  if (path === "/api/dashboard" && method === "GET") {
    const mid = url.searchParams.get("merchant_id");
    if (!mid)
      return json({ error: "merchant_id required" }, 400);
    const ts = now();
    const today = ts.slice(0, 10);
    const merchant = await env.MP_DB.prepare("SELECT * FROM mportal_merchants WHERE id = ?").bind(mid).first();
    if (!merchant)
      return json({ error: "Merchant not found" }, 404);
    const ordersToday = await env.MP_DB.prepare("SELECT * FROM mportal_orders WHERE merchant_id = ? AND created_at >= ? ORDER BY created_at DESC").bind(mid, today).all();
    const allOrders = await env.MP_DB.prepare("SELECT * FROM mportal_orders WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 20").bind(mid).all();
    const revenueToday = ordersToday.results.filter((o) => o.payment_status === "paid").reduce((s, o) => s + (o.amount || 0), 0);
    const totalRevenue = merchant.total_revenue || 0;
    const pending = (allOrders.results || []).filter((o) => o.status === "pending").length;
    const issues = await env.MP_DB.prepare("SELECT COUNT(*) as count FROM mportal_disputes WHERE merchant_id = ? AND status = 'open'").bind(mid).first();
    const products = await env.MP_DB.prepare("SELECT * FROM mportal_products WHERE merchant_id = ? AND status = ? ORDER BY created_at DESC").bind(mid, "active").all();
    const aiActions = await env.MP_DB.prepare("SELECT * FROM mportal_audit_log WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 10").bind(mid).all();
    const commission = totalRevenue * 0.1;
    const deliveryCosts = (allOrders.results || []).reduce((s, o) => s + (o.delivery_fee || 0), 0);
    const net = totalRevenue - commission - deliveryCosts;
    return json({
      success: true,
      stats: {
        orders_today: (ordersToday.results || []).length,
        revenue_today: revenueToday,
        pending,
        issues: issues?.count || 0
      },
      orders: allOrders.results || [],
      products: products.results || [],
      ai_actions: aiActions.results || [],
      earnings: {
        gross: totalRevenue,
        commission,
        delivery: deliveryCosts,
        net
      }
    });
  }
  if (path === "/api/products" && method === "POST") {
    const b = await request.json();
    if (!b.merchant_id || !b.name || !b.price)
      return json({ error: "merchant_id, name, price required" }, 400);
    const pid = uuid();
    const ts = now();
    await env.MP_DB.prepare("INSERT INTO mportal_products (id, merchant_id, name, description, price, stock, category, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(pid, b.merchant_id, b.name, b.description || null, b.price, b.stock || 0, b.category || null, "active", ts, ts).run();
    try {
      const merchant = await env.MP_DB.prepare("SELECT * FROM mportal_merchants WHERE id = ?").bind(b.merchant_id).first();
      const onboardingData = JSON.parse(merchant.onboarding_data || "{}");
      if (onboardingData.sales_agent_biz_id) {
        const products = await env.MP_DB.prepare("SELECT name, price, stock FROM mportal_products WHERE merchant_id = ? AND status = ?").bind(b.merchant_id, "active").all();
        await env.SALES_AGENT.fetch("https://internal/api/businesses/" + onboardingData.sales_agent_biz_id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: products.results.map((p) => ({ name: p.name, price: p.price, stock: p.stock })) })
        });
      }
    } catch (e) {
      console.error("Sync failed:", e.message);
    }
    return json({ success: true, product_id: pid });
  }
  if (path === "/api/products" && method === "GET") {
    const mid = url.searchParams.get("merchant_id");
    if (!mid)
      return json({ error: "merchant_id required" }, 400);
    const products = await env.MP_DB.prepare("SELECT * FROM mportal_products WHERE merchant_id = ? AND status = ? ORDER BY created_at DESC").bind(mid, "active").all();
    return json({ success: true, products: products.results || [] });
  }
  const productDeleteMatch = path.match(/^\/api\/products\/(.+)$/);
  if (productDeleteMatch && method === "DELETE") {
    const b = await request.json();
    await env.MP_DB.prepare("UPDATE mportal_products SET status = ?, updated_at = ? WHERE id = ? AND merchant_id = ?").bind("deleted", now(), productDeleteMatch[1], b.merchant_id).run();
    return json({ success: true });
  }
  if (path === "/api/merchants/lookup" && method === "GET") {
    const phone = normalizePhone(url.searchParams.get("phone"));
    const merchant = await env.MP_DB.prepare("SELECT id FROM mportal_merchants WHERE phone = ? ORDER BY joined_at DESC LIMIT 1").bind(phone).first();
    return json({ merchant_id: merchant?.id || null });
  }
  const merchantMatch = path.match(/^\/api\/merchants\/(.+)$/);
  if (merchantMatch && method === "GET") {
    const merchant = await env.MP_DB.prepare("SELECT * FROM mportal_merchants WHERE id = ?").bind(merchantMatch[1]).first();
    if (!merchant)
      return json({ error: "Not found" }, 404);
    return json({ success: true, merchant });
  }
  if (merchantMatch && method === "PUT") {
    const b = await request.json();
    const ts = now();
    const merchant = await env.MP_DB.prepare("SELECT * FROM mportal_merchants WHERE id = ?").bind(merchantMatch[1]).first();
    if (!merchant)
      return json({ error: "Not found" }, 404);
    const updates = [];
    const values = [];
    for (const [k, v] of Object.entries(b)) {
      if (["status", "plan", "business_name", "owner_name", "industry", "city", "address", "email", "description", "delivery_zones", "delivery_preferences", "ai_permissions", "bank_name", "bank_account", "verified", "verification_status"].includes(k)) {
        updates.push(`${k} = ?`);
        values.push(typeof v === "object" ? JSON.stringify(v) : v);
      }
    }
    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(ts);
      values.push(merchantMatch[1]);
      await env.MP_DB.prepare(`UPDATE mportal_merchants SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
    }
    await env.MP_DB.prepare("INSERT INTO mportal_audit_log (id, merchant_id, action, actor, details, created_at) VALUES (?,?,?,?,?,?)").bind(uuid(), merchantMatch[1], "PROFILE_UPDATED", "merchant", JSON.stringify(b), ts).run();
    return json({ success: true });
  }
  if (path === "/api/permissions" && method === "GET") {
    const mid = url.searchParams.get("merchant_id");
    const merchant = await env.MP_DB.prepare("SELECT ai_permissions FROM mportal_merchants WHERE id = ?").bind(mid).first();
    const perms = merchant ? JSON.parse(merchant.ai_permissions || JSON.stringify(DEFAULT_AI_PERMISSIONS)) : DEFAULT_AI_PERMISSIONS;
    return json({ success: true, permissions: perms });
  }
  if (path === "/api/permissions" && method === "PUT") {
    const b = await request.json();
    const merchant = await env.MP_DB.prepare("SELECT ai_permissions FROM mportal_merchants WHERE id = ?").bind(b.merchant_id).first();
    if (!merchant)
      return json({ error: "Merchant not found" }, 404);
    const perms = JSON.parse(merchant.ai_permissions || "{}");
    if (perms[b.permission]) {
      perms[b.permission].auto = !perms[b.permission].auto;
      await env.MP_DB.prepare("UPDATE mportal_merchants SET ai_permissions = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(perms), now(), b.merchant_id).run();
      await env.MP_DB.prepare("INSERT INTO mportal_audit_log (id, merchant_id, action, actor, details, created_at) VALUES (?,?,?,?,?,?)").bind(uuid(), b.merchant_id, "PERMISSION_TOGGLED", "merchant", `Permission ${b.permission} toggled`, now()).run();
    }
    return json({ success: true, permissions: perms });
  }
  if (path.startsWith("/api/trust/") && method === "GET") {
    const mid = path.split("/").pop();
    const merchant = await env.MP_DB.prepare("SELECT * FROM mportal_merchants WHERE id = ?").bind(mid).first();
    if (!merchant)
      return json({ error: "Not found" }, 404);
    const orderCount = merchant.total_orders || 0;
    const revenue = merchant.total_revenue || 0;
    const rating = merchant.rating || 0;
    const disputes = merchant.dispute_count || 0;
    const verified = merchant.verified || 0;
    let score = 30;
    if (orderCount > 0)
      score += Math.min(20, orderCount * 2);
    if (revenue > 0)
      score += Math.min(15, Math.floor(revenue / 1e4));
    if (rating > 0)
      score += Math.round(rating * 10);
    if (verified)
      score += 15;
    score -= Math.min(20, disputes * 5);
    score = Math.max(0, Math.min(100, score));
    const disputesList = await env.MP_DB.prepare("SELECT * FROM mportal_disputes WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 10").bind(mid).all();
    const audit = await env.MP_DB.prepare("SELECT * FROM mportal_audit_log WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 10").bind(mid).all();
    return json({
      success: true,
      trust_score: score,
      verification: {
        status: merchant.verification_status,
        business_name: merchant.business_name,
        rc_number: merchant.rc_number
      },
      disputes: disputesList.results || [],
      audit: audit.results || [],
      rating,
      rating_count: merchant.rating_count || 0
    });
  }
  if (path === "/api/trust/verify" && method === "POST") {
    const b = await request.json();
    const ts = now();
    await env.MP_DB.prepare("UPDATE mportal_merchants SET business_name = ?, rc_number = ?, verification_status = ?, updated_at = ? WHERE id = ?").bind(b.business_name, b.rc_number, "pending_review", ts, b.merchant_id).run();
    await env.MP_DB.prepare("INSERT INTO mportal_trust_events (id, merchant_id, event_type, description, severity, created_at) VALUES (?,?,?,?,?,?)").bind(uuid(), b.merchant_id, "verification_submitted", "Business verification submitted for review", "info", ts).run();
    await env.MP_DB.prepare("INSERT INTO mportal_audit_log (id, merchant_id, action, actor, details, created_at) VALUES (?,?,?,?,?,?)").bind(uuid(), b.merchant_id, "VERIFICATION_SUBMITTED", "merchant", "RC: " + (b.rc_number || "N/A"), ts).run();
    return json({ success: true, message: "Verification submitted. We will review within 48 hours." });
  }
  if (path === "/api/trust/dispute" && method === "POST") {
    const b = await request.json();
    const ts = now();
    const did = uuid();
    await env.MP_DB.prepare("INSERT INTO mportal_disputes (id, merchant_id, order_id, customer_phone, reason, description, status, created_at) VALUES (?,?,?,?,?,?,?,?)").bind(did, b.merchant_id, b.order_id, b.customer_phone, b.reason, b.description, "open", ts).run();
    await env.MP_DB.prepare("UPDATE mportal_merchants SET dispute_count = dispute_count + 1, updated_at = ? WHERE id = ?").bind(ts, b.merchant_id).run();
    await env.MP_DB.prepare("INSERT INTO mportal_trust_events (id, merchant_id, event_type, description, severity, created_at) VALUES (?,?,?,?,?,?)").bind(uuid(), b.merchant_id, "dispute_opened", "Dispute opened: " + b.reason, "warning", ts).run();
    return json({ success: true, dispute_id: did });
  }
  if (path === "/api/leads" && method === "POST") {
    const b = await request.json();
    const lid = uuid();
    const ts = now();
    await env.MP_DB.prepare("INSERT INTO mportal_leads (id, business_name, contact_name, phone, email, industry, city, source, status, notes, referral_code, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(lid, b.business_name || null, b.contact_name || null, b.phone ? normalizePhone(b.phone) : null, b.email || null, b.industry || null, b.city || null, b.source || "direct", "new", b.notes || null, b.referral_code || null, ts, ts).run();
    return json({ success: true, lead_id: lid });
  }
  if (path === "/api/leads" && method === "GET") {
    const leads = await env.MP_DB.prepare("SELECT * FROM mportal_leads ORDER BY created_at DESC LIMIT 50").all();
    return json({ success: true, leads: leads.results || [] });
  }
  if (path === "/api/referral" && method === "GET") {
    const mid = url.searchParams.get("merchant_id");
    const merchant = await env.MP_DB.prepare("SELECT referral_code FROM mportal_merchants WHERE id = ?").bind(mid).first();
    if (!merchant)
      return json({ error: "Not found" }, 404);
    return json({
      success: true,
      referral_code: merchant.referral_code,
      referral_link: "https://harz-merchant-portal.hamzarabiu390.workers.dev/?ref=" + merchant.referral_code,
      commission_rate: "10% of referred merchant revenue for 6 months"
    });
  }
  if (path === "/api/referral/process" && method === "POST") {
    const b = await request.json();
    const refCode = b.referral_code;
    const newMerchantId = b.merchant_id;
    const referrer = await env.MP_DB.prepare("SELECT id FROM mportal_merchants WHERE referral_code = ?").bind(refCode).first();
    if (referrer) {
      const rid = uuid();
      await env.MP_DB.prepare("INSERT INTO mportal_referrals (id, referrer_id, referee_id, status, created_at) VALUES (?,?,?,?,?)").bind(rid, referrer.id, newMerchantId, "active", now()).run();
      await env.MP_DB.prepare("UPDATE mportal_merchants SET referred_by = ? WHERE id = ?").bind(referrer.id, newMerchantId).run();
      return json({ success: true, referral_id: rid });
    }
    return json({ success: false, message: "Invalid referral code" });
  }
  if (path === "/api/acquisition/analytics" && method === "GET") {
    const totalMerchants = await env.MP_DB.prepare("SELECT COUNT(*) as count FROM mportal_merchants").first();
    const activeMerchants = await env.MP_DB.prepare("SELECT COUNT(*) as count FROM mportal_merchants WHERE status = 'live'").first();
    const totalLeads = await env.MP_DB.prepare("SELECT COUNT(*) as count FROM mportal_leads").first();
    const newLeads = await env.MP_DB.prepare("SELECT COUNT(*) as count FROM mportal_leads WHERE status = 'new'").first();
    const totalReferrals = await env.MP_DB.prepare("SELECT COUNT(*) as count FROM mportal_referrals").first();
    const merchantsByIndustry = await env.MP_DB.prepare("SELECT industry, COUNT(*) as count FROM mportal_merchants GROUP BY industry").all();
    return json({
      success: true,
      analytics: {
        total_merchants: totalMerchants?.count || 0,
        active_merchants: activeMerchants?.count || 0,
        total_leads: totalLeads?.count || 0,
        new_leads: newLeads?.count || 0,
        total_referrals: totalReferrals?.count || 0,
        conversion_rate: totalLeads?.count > 0 ? (totalMerchants?.count / totalLeads?.count * 100).toFixed(1) + "%" : "N/A",
        by_industry: merchantsByIndustry.results || []
      }
    });
  }
  return json({ error: "Not found", path }, 404);
}
__name(handleRequest, "handleRequest");
var harz_merchant_portal_default = {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (e) {
      return json({ error: e.message, stack: e.stack?.split("\n").slice(0, 3) }, 500);
    }
  }
};
export {
  harz_merchant_portal_default as default
};
//# sourceMappingURL=harz-merchant-portal.js.map

--d8d81313d6e1647011b971fb0890721707b80cedab330af8ba2e245a6800--
