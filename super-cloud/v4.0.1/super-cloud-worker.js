var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// hnf-merged.js
var HGN_SERVICES = {
  "harz-edge-cloud": { name: "HARZ Edge Cloud", category: "Compute", role: "VPS + Cloud Control Plane", tier: "edge" },
  "harz-skye": { name: "HARZ Skye", category: "Connectivity", role: "Community Internet (Satellite)", tier: "satellite" },
  "harz-skye-ussd": { name: "HARZ Skye USSD", category: "Connectivity", role: "USSD Activation Portal", tier: "cellular" },
  "harz-telecom": { name: "HARZ Telecom", category: "Telecom", role: "Core Network (HLR/SMSC/USSD)", tier: "core" },
  "harz-gateway": { name: "HARZ Gateway", category: "Telecom", role: "SMS/Voice/Airtime API", tier: "gateway" },
  "harz-smpp-edge": { name: "HARZ SMPP Edge", category: "Telecom", role: "Direct Carrier SMPP", tier: "carrier" },
  "harz-edge-telecom": { name: "HARZ Edge Telecom", category: "Telecom", role: "Edge Telecom Platform", tier: "edge" },
  "harz-voice-call": { name: "HARZ Voice Call", category: "Telecom", role: "USSD Voice Bridging", tier: "cellular" },
  "harz-ussd-saas": { name: "HARZ USSD SaaS", category: "Telecom", role: "USSD Builder Platform", tier: "cellular" },
  "harz-connect": { name: "HARZ Connect", category: "Network", role: "Social + Community Platform", tier: "edge" },
  "harz-api-gw": { name: "HARZ API Gateway", category: "Network", role: "Unified API Gateway", tier: "gateway" },
  "harz-ai": { name: "HARZ AI", category: "AI", role: "AI Intelligence Layer", tier: "core" },
  "harz-agent-builder": { name: "HARZ Agent Builder", category: "AI", role: "AI Agent Platform", tier: "core" },
  "harz-pricing": { name: "HARZ Pricing Hub", category: "Payments", role: "Unified Pricing + Checkout", tier: "core" },
  "harzpay": { name: "HARZ Pay", category: "Payments", role: "Payment Processing", tier: "core" },
  "harz-payment": { name: "HARZ Payment", category: "Payments", role: "Payment Gateway", tier: "gateway" },
  "harz-pay-collector": { name: "HARZ Pay Collector", category: "Payments", role: "Revenue Collection", tier: "core" },
  "harz-invoice": { name: "HARZ Invoice", category: "Payments", role: "Invoicing", tier: "core" },
  "harz-paylink": { name: "HARZ PayLink", category: "Payments", role: "Payment Links", tier: "core" },
  "harz-chain-v2": { name: "HARZ Chain", category: "Blockchain", role: "Layer 1 Blockchain", tier: "core" },
  "harz-exchange": { name: "HARZ Exchange", category: "Blockchain", role: "DEX", tier: "core" },
  "harz-crypto-wallet": { name: "HARZ Crypto Wallet", category: "Blockchain", role: "Wallet", tier: "edge" },
  "harz-tokens": { name: "HARZ Tokens", category: "Blockchain", role: "Token Management", tier: "core" },
  "harz-stake": { name: "HARZ Staking", category: "Blockchain", role: "Staking", tier: "core" },
  "harz-swap": { name: "HARZ Swap", category: "Blockchain", role: "Token Swap", tier: "core" },
  "harz-mining": { name: "HARZ Mining", category: "Blockchain", role: "Mining Pool", tier: "core" },
  "harz-nft": { name: "HARZ NFT", category: "Blockchain", role: "NFT Marketplace", tier: "core" },
  "harz-crm": { name: "HARZ CRM", category: "Business", role: "Customer Management", tier: "core" },
  "harz-loyalty": { name: "HARZ Loyalty", category: "Business", role: "Loyalty Program", tier: "core" },
  "harz-affiliates": { name: "HARZ Affiliates", category: "Business", role: "Affiliate Network", tier: "core" },
  "harz-film": { name: "HARZ Film", category: "Media", role: "Film Platform", tier: "edge" },
  "harzmusic": { name: "HARZ Music", category: "Media", role: "Music Streaming", tier: "edge" },
  "contentpilot-ai": { name: "ContentPilot AI", category: "Media", role: "Content Generation", tier: "core" },
  "harz-realestate": { name: "HARZ Real Estate", category: "Real Estate", role: "Property Marketplace", tier: "edge" },
  "harz-abuja-estate": { name: "HARZ Abuja Estate", category: "Real Estate", role: "Abuja Properties", tier: "edge" },
  "harz-monitor": { name: "HARZ Monitor", category: "Infrastructure", role: "System Monitoring", tier: "core" },
  "harz-onboard": { name: "HARZ Onboard", category: "Infrastructure", role: "Customer Onboarding", tier: "core" },
  "harz-verify": { name: "HARZ Verify", category: "Infrastructure", role: "Identity Verification", tier: "core" },
  "harz-cert": { name: "HARZ Cert", category: "Infrastructure", role: "Certificate Management", tier: "core" },
  // === ACCOUNT 1 (hamzarabiu390.workers.dev) ===
  "harz-dna-a1": { name: "HARZ DNA", category: "Blockchain", role: "Digital Node Architecture", tier: "core", account: 1 },
  "harz-evolve-a1": { name: "HARZ Evolve", category: "Blockchain", role: "Evolution Engine", tier: "core", account: 1 },
  "harz-neural-a1": { name: "HARZ Neural", category: "Blockchain", role: "Neural Network Layer", tier: "core", account: 1 },
  "harz-nexus-a1": { name: "HARZ Nexus", category: "Blockchain", role: "Inter-chain Bridge", tier: "gateway", account: 1 },
  "harz-prism-a1": { name: "HARZ Prism", category: "Blockchain", role: "DeFi Protocol", tier: "core", account: 1 },
  "harz-sentinel-a1": { name: "HARZ Sentinel", category: "Blockchain", role: "Security Monitor", tier: "core", account: 1 },
  "harz-spell-a1": { name: "HARZ Spell", category: "Blockchain", role: "Smart Contract Language", tier: "core", account: 1 },
  "harz-forge-a1": { name: "HARZ Forge", category: "Blockchain", role: "Token Builder", tier: "core", account: 1 },
  "harz-faucet-a1": { name: "HARZ Faucet", category: "Blockchain", role: "Free Token Claims", tier: "edge", account: 1 },
  "harz-oracle-a1": { name: "HARZ Oracle", category: "Blockchain", role: "Price Oracle", tier: "core", account: 1 },
  "harz-explorer-a1": { name: "HARZ Chain Explorer", category: "Blockchain", role: "Block Explorer", tier: "edge", account: 1 },
  "harz-rpc-proxy-a1": { name: "HARZ RPC Proxy", category: "Blockchain", role: "JSON-RPC Gateway", tier: "gateway", account: 1 },
  "harz-arch-suite-a1": { name: "HARZ Arch Suite", category: "Blockchain", role: "Architecture Tools", tier: "core", account: 1 },
  "harz-contract-gen-a1": { name: "HARZ Contract Gen", category: "Blockchain", role: "Contract Address Generator", tier: "core", account: 1 },
  "harz-genesis-a1": { name: "HARZ Genesis", category: "Blockchain", role: "Genesis Block Manager", tier: "core", account: 1 },
  "harz-miner-cron-a1": { name: "HARZ Miner Cron", category: "Blockchain", role: "Auto-Mining Scheduler", tier: "core", account: 1 },
  "harz-symphony-a1": { name: "HARZ Symphony", category: "Blockchain", role: "Chain Orchestration", tier: "core", account: 1 },
  "harz-eternity-a1": { name: "HARZ Eternity", category: "Blockchain", role: "On-Chain Digital Inheritance", tier: "edge", account: 1 },
  "harz-dua-a1": { name: "HARZ Dua Chain", category: "Blockchain", role: "Islamic Finance Chain", tier: "core", account: 1 },
  "gdeg-web-a1": { name: "GDEG Token", category: "Blockchain", role: "Digital Payment Layer", tier: "edge", account: 1 },
  "gdeg-images-a1": { name: "GDEG Images", category: "Media", role: "Token Image CDN", tier: "edge", account: 1 },
  "harz-ai-gateway-a1": { name: "AI Gateway", category: "AI", role: "AI API Gateway", tier: "gateway", account: 1 },
  "maganu-agent-a1": { name: "Maganu Agent", category: "AI", role: "AI Agent Platform", tier: "core", account: 1 },
  "harz-health-a1": { name: "HARZ Health", category: "Health", role: "Health Platform", tier: "edge", account: 1 },
  "omega-health-a1": { name: "Omega Health", category: "Health", role: "Health Monitoring", tier: "edge", account: 1 },
  "mindcare-ai-a1": { name: "MindCare AI", category: "Health", role: "Mental Health AI", tier: "edge", account: 1 },
  "harz-genesis-hospital-a1": { name: "Genesis Hospital", category: "Health", role: "Hospital Management", tier: "edge", account: 1 },
  "harz-crm-a1": { name: "HARZ CRM (A1)", category: "Business", role: "Customer Management", tier: "core", account: 1 },
  "harz-daily-a1": { name: "HARZ Daily", category: "Business", role: "Daily Operations", tier: "core", account: 1 },
  "harz-buildbot-a1": { name: "HARZ BuildBot", category: "Infrastructure", role: "CI/CD Pipeline", tier: "core", account: 1 },
  "harz-catalog-a1": { name: "HARZ Catalog", category: "Infrastructure", role: "Service Catalog", tier: "core", account: 1 },
  "harz-cloud-api-a1": { name: "HARZ Cloud API", category: "Compute", role: "Cloud API Layer", tier: "gateway", account: 1 },
  "harz-manager-bot-a1": { name: "Manager Bot", category: "Infrastructure", role: "Ecosystem Manager Bot", tier: "core", account: 1 },
  "harz-poi-a1": { name: "HARZ POI", category: "Network", role: "Points of Interest", tier: "edge", account: 1 },
  "harzlend-a1": { name: "HARZ Lend", category: "Finance", role: "Lending Platform", tier: "edge", account: 1 },
  "harz-baraka-a1": { name: "HARZ Baraka", category: "Finance", role: "Islamic Finance", tier: "edge", account: 1 },
  "harz-nlcl-a1": { name: "HARZ NLCL", category: "Infrastructure", role: "Network Lifecycle Controller", tier: "core", account: 1 },
  "hostmaster-a1": { name: "HostMaster", category: "Infrastructure", role: "Domain Management", tier: "core", account: 1 },
  "harz-whatsapp-handler-a1": { name: "WhatsApp Handler", category: "Network", role: "WhatsApp Integration", tier: "edge", account: 1 },
  "abuja-estate-city-a1": { name: "Abuja Estate City", category: "Real Estate", role: "Estate City Platform", tier: "edge", account: 1 },
  // === additions Oct 2 2026 (sync with live registry) ===
  "harz-dialweb": { name: "HARZ DialWeb", category: "Telecom", role: "Telephone Web (USSD)", tier: "edge" },
  "harz-ioc-a1": { name: "HARZ IOC", category: "Connectivity", role: "Internet-Optional Civilization", tier: "edge", account: 1 },
  "harz-mesh-lab-a1": { name: "HARZ Mesh Lab", category: "Connectivity", role: "G1/G2 Radio Mesh Reality", tier: "edge", account: 1 },
  "harz-omninet-a1": { name: "HARZ Omninet", category: "Compute", role: "Intent Fabric", tier: "edge", account: 1 },
  "harz-packet-a1": { name: "HARZ Packet", category: "Blockchain", role: "Offline Value Envelope", tier: "core", account: 1 }

};
var CONNECTIVITY_TIERS = {
  satellite: { name: "Satellite", icon: "SAT", priority: 5, latency: "500-2000ms", useCase: "Rural/remote areas" },
  cellular: { name: "Cellular", icon: "CEL", priority: 4, latency: "50-200ms", useCase: "GSM voice, SMS, 3G/4G/5G" },
  internet: { name: "Internet", icon: "NET", priority: 3, latency: "10-100ms", useCase: "Fiber/WiFi broadband" },
  wifi: { name: "Wi-Fi", icon: "WIF", priority: 2, latency: "1-20ms", useCase: "Local network" },
  mesh: { name: "Mesh P2P", icon: "MSH", priority: 1, latency: "5-100ms", useCase: "Device-to-device offline" }
};
var EDGE_NODE_TYPES = {
  phone: { name: "Edge Phone", relay: "temporary", range: "30-100m", battery: true },
  router: { name: "Edge Router", relay: "permanent", range: "100-500m", battery: false },
  tower: { name: "Edge Tower", relay: "permanent", range: "1-5km", battery: "solar" },
  gateway: { name: "Edge Gateway", relay: "permanent", range: "regional", battery: false },
  satellite: { name: "Sat Gateway", relay: "permanent", range: "global", battery: false }
};
var TIER_DEFAULTS = {
  satellite: { tier: "satellite", latency: 800, reliability: 0.9, cost: 0.9, priority: 5 },
  cellular: { tier: "cellular", latency: 100, reliability: 0.85, cost: 0.5, priority: 4 },
  internet: { tier: "internet", latency: 30, reliability: 0.95, cost: 0.3, priority: 3 },
  wifi: { tier: "wifi", latency: 10, reliability: 0.9, cost: 0.1, priority: 2 },
  mesh: { tier: "mesh", latency: 50, reliability: 0.7, cost: 0, priority: 1 }
};
function normalizePath(p) {
  if (typeof p === "string") {
    const defaults = TIER_DEFAULTS[p.toLowerCase()];
    if (defaults)
      return { ...defaults };
    return { tier: p, latency: 1e3, reliability: 0.5, cost: 0.5, priority: 0 };
  }
  if (typeof p === "object" && p !== null) {
    const tierName = (p.tier || "").toLowerCase();
    const defaults = TIER_DEFAULTS[tierName] || {};
    return {
      tier: p.tier || "unknown",
      latency: p.latency ?? defaults.latency ?? 1e3,
      reliability: p.reliability ?? defaults.reliability ?? 0.5,
      cost: p.cost ?? defaults.cost ?? 0.5,
      priority: p.priority ?? defaults.priority ?? 0
    };
  }
  return { tier: "unknown", latency: 1e3, reliability: 0.5, cost: 0.5, priority: 0 };
}
__name(normalizePath, "normalizePath");
function calculateRouteScore(path) {
  const tierScore = (path.priority || 0) * 20;
  const latencyScore = Math.max(0, 100 - (path.latency || 1e3) / 10);
  const reliabilityScore = (path.reliability || 0.5) * 100;
  const costScore = (1 - (path.cost || 0)) * 100;
  return Math.round(tierScore * 0.3 + latencyScore * 0.3 + reliabilityScore * 0.25 + costScore * 0.15);
}
__name(calculateRouteScore, "calculateRouteScore");
function selectBestPath(availablePaths) {
  const normalized = availablePaths.map((p) => normalizePath(p));
  const scored = normalized.map((p) => ({ ...p, score: calculateRouteScore(p) }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}
__name(selectBestPath, "selectBestPath");
function calculateRelayScore(node) {
  const battery = (node.battery || 0) / 100;
  const signal = (node.signal || 0) / 100;
  const storage = Math.min(1, (node.storage || 0) / 1073741824);
  const connection = (node.connectionQuality || 0) / 100;
  const uptime = Math.min(1, (node.uptime || 0) / 86400);
  const peers = Math.min(1, (node.peerCount || 0) / 10);
  return Math.round((battery * 0.25 + signal * 0.2 + storage * 0.1 + connection * 0.2 + uptime * 0.1 + peers * 0.15) * 100);
}
__name(calculateRelayScore, "calculateRelayScore");
function generateEdgeId(type, id) {
  return `harz://${type === "user" ? "user" : "node"}/${id}`;
}
__name(generateEdgeId, "generateEdgeId");
function json(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}
__name(json, "json");
async function checkNodeHealth(url) {
  try {
    const start = Date.now();
    const resp = await fetch(url + "/api/health", { signal: AbortSignal.timeout(3e3) });
    const latency = Date.now() - start;
    if (resp.ok) {
      const data = await resp.json();
      return { online: true, latency, status: data.status || "healthy", service: data.service || "unknown", version: data.version || "?" };
    }
    return { online: false, latency, status: "error" };
  } catch (e) {
    return { online: false, latency: -1, status: "unreachable", error: e.message };
  }
}
__name(checkNodeHealth, "checkNodeHealth");
async function dbRegisterNode(env, node) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    await env.HNF_DB.prepare(
      `INSERT OR REPLACE INTO hnf_nodes (id, node_type, name, location, tier, capabilities, health_url, last_seen, status) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 'active')`
    ).bind(node.id, node.node_type || "phone", node.name || node.id, node.location || "unknown", node.tier || "mesh", JSON.stringify(node.capabilities || {}), node.health_url || "").run();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(dbRegisterNode, "dbRegisterNode");
async function dbGetNodes(env) {
  if (!env || !env.HNF_DB)
    return [];
  try {
    const result = await env.HNF_DB.prepare("SELECT * FROM hnf_nodes WHERE status = ?").bind("active").all();
    return result.results || [];
  } catch (e) {
    return [];
  }
}
__name(dbGetNodes, "dbGetNodes");
async function dbSaveRelayPath(env, source, target, path, hops, latency) {
  if (!env || !env.HNF_DB)
    return null;
  try {
    await env.HNF_DB.prepare(
      "INSERT INTO hnf_relay_paths (source, target, path, hops, latency) VALUES (?, ?, ?, ?, ?)"
    ).bind(source, target, JSON.stringify(path), hops, latency);
    return true;
  } catch (e) {
    return null;
  }
}
__name(dbSaveRelayPath, "dbSaveRelayPath");
async function dbSaveTelemetry(env, data) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    await env.HNF_DB.prepare(
      `INSERT INTO hnf_telemetry (node_id, hop_count, latency, packet_loss, signal_strength, battery_level, throughput, connection_type, route_changes, uptime, failure_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      data.node_id || "unknown",
      data.hop_count || 0,
      data.latency || 0,
      data.packet_loss || 0,
      data.signal_strength || 0,
      data.battery_level || 0,
      data.throughput || 0,
      data.connection_type || "unknown",
      data.route_changes || 0,
      data.uptime || 0,
      data.failure_reason || null
    ).run();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(dbSaveTelemetry, "dbSaveTelemetry");
async function dbGetTelemetry(env, nodeId, limit) {
  if (!env || !env.HNF_DB)
    return [];
  try {
    if (nodeId) {
      const result = await env.HNF_DB.prepare("SELECT * FROM hnf_telemetry WHERE node_id = ? ORDER BY timestamp DESC LIMIT ?").bind(nodeId, limit || 50).all();
      return result.results || [];
    } else {
      const result = await env.HNF_DB.prepare("SELECT * FROM hnf_telemetry ORDER BY timestamp DESC LIMIT ?").bind(limit || 50).all();
      return result.results || [];
    }
  } catch (e) {
    return [];
  }
}
__name(dbGetTelemetry, "dbGetTelemetry");
async function dbGetTelemetryStats(env) {
  if (!env || !env.HNF_DB)
    return {};
  try {
    const total = await env.HNF_DB.prepare("SELECT COUNT(*) as count FROM hnf_telemetry").first();
    const byType = await env.HNF_DB.prepare("SELECT connection_type, COUNT(*) as count, AVG(latency) as avg_latency, AVG(packet_loss) as avg_packet_loss, AVG(signal_strength) as avg_signal, AVG(battery_level) as avg_battery FROM hnf_telemetry GROUP BY connection_type").all();
    const recent = await env.HNF_DB.prepare(`SELECT COUNT(*) as count FROM hnf_telemetry WHERE timestamp > datetime('now', '-1 hour')`).first();
    const failures = await env.HNF_DB.prepare("SELECT failure_reason, COUNT(*) as count FROM hnf_telemetry WHERE failure_reason IS NOT NULL GROUP BY failure_reason ORDER BY count DESC LIMIT 10").all();
    return {
      total_records: total ? total.count : 0,
      last_hour: recent ? recent.count : 0,
      by_connection_type: byType.results || [],
      failure_summary: failures.results || []
    };
  } catch (e) {
    return {};
  }
}
__name(dbGetTelemetryStats, "dbGetTelemetryStats");
function calculateHarzRouteScore(path) {
  const reliability = Math.min(1, Math.max(0, path.reliability || 0.5));
  const signalQuality = Math.min(1, Math.max(0, (path.signal_strength || 50) / 100));
  const batteryAvail = Math.min(1, Math.max(0, (path.battery_level || 50) / 100));
  const latencyFactor = Math.min(1, Math.max(0, 1 - (path.latency || 1e3) / 2e3));
  const bandwidth = Math.min(1, Math.max(0, (path.throughput || 1) / 100));
  const hopPenalty = Math.min(1, (path.hop_count || 1) * 0.1);
  const score = reliability * 25 + signalQuality * 20 + batteryAvail * 15 + latencyFactor * 20 + bandwidth * 15 - hopPenalty * 5;
  return Math.round(Math.max(0, Math.min(100, score)));
}
__name(calculateHarzRouteScore, "calculateHarzRouteScore");
function simulateNode(id, opts) {
  const rand = /* @__PURE__ */ __name((min, max) => Math.random() * (max - min) + min, "rand");
  const types = ["phone", "router", "tower", "gateway"];
  const conns = ["mesh", "wifi", "cellular", "internet", "satellite"];
  return {
    id: "sim-node-" + id,
    type: types[Math.floor(rand(0, types.length))],
    connection_type: conns[Math.floor(rand(0, conns.length))],
    latency: Math.round(rand(5, 800)),
    packet_loss: Math.round(rand(0, 15) * 100) / 100,
    signal_strength: Math.round(rand(20, 100)),
    battery_level: Math.round(rand(10, 100)),
    throughput: Math.round(rand(0.5, 50) * 100) / 100,
    reliability: rand(0.5, 0.99),
    hop_count: Math.round(rand(1, 5)),
    uptime: Math.round(rand(3600, 86400)),
    online: Math.random() > (opts.failure_rate || 0.1),
    location: ["lagos", "abuja", "kano", "port-harcourt", "ibadan"][Math.floor(rand(0, 5))]
  };
}
__name(simulateNode, "simulateNode");
function runSimulation(params) {
  const nodeCount = params.node_count || 100;
  const failureRate = params.failure_rate || 0.1;
  const mobility = params.mobility || false;
  const duration = params.duration || 60;
  const maliciousRate = params.malicious_rate || 0.05;
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const node = simulateNode(i, { failure_rate: failureRate });
    node.malicious = Math.random() < maliciousRate;
    nodes.push(node);
  }
  const scored = nodes.map((n) => {
    const rs = calculateHarzRouteScore(n);
    return {
      ...n,
      route_score: rs,
      eligible_relay: n.online && n.battery_level > 30 && rs > 40 && !n.malicious
    };
  });
  scored.sort((a, b) => b.route_score - a.route_score);
  const online = scored.filter((n) => n.online);
  const offline = scored.filter((n) => !n.online);
  const relays = scored.filter((n) => n.eligible_relay);
  const malicious = scored.filter((n) => n.malicious);
  const avgScore = scored.reduce((s, n) => s + n.route_score, 0) / scored.length;
  const avgLatency = online.reduce((s, n) => s + n.latency, 0) / online.length;
  const avgBattery = online.reduce((s, n) => s + n.battery_level, 0) / online.length;
  const avgHops = scored.reduce((s, n) => s + n.hop_count, 0) / scored.length;
  const byType = {};
  for (const n of online) {
    if (!byType[n.connection_type])
      byType[n.connection_type] = { count: 0, avg_score: 0, avg_latency: 0 };
    byType[n.connection_type].count++;
    byType[n.connection_type].avg_score += n.route_score;
    byType[n.connection_type].avg_latency += n.latency;
  }
  for (const t of Object.keys(byType)) {
    byType[t].avg_score = Math.round(byType[t].avg_score / byType[t].count);
    byType[t].avg_latency = Math.round(byType[t].avg_latency / byType[t].count);
  }
  const failureScenarios = [];
  if (params.test_failover) {
    const relaysList = relays.slice(0, 5);
    for (const relay of relaysList) {
      const alternatives = relays.filter((n) => n.id !== relay.id && n.location === relay.location);
      failureScenarios.push({
        failed_node: relay.id,
        failed_type: relay.connection_type,
        alternatives_found: alternatives.length,
        best_alternative: alternatives[0] ? { id: alternatives[0].id, route_score: alternatives[0].route_score, connection_type: alternatives[0].connection_type } : null,
        recovery_time_ms: alternatives.length > 0 ? Math.round(Math.random() * 2e3 + 500) : null
      });
    }
  }
  const partitions = [];
  if (params.test_partitions) {
    const removed = new Set(scored.slice(0, Math.floor(nodeCount * 0.2)).map((n) => n.id));
    const remaining = scored.filter((n) => !removed.has(n.id));
    const clusters = {};
    for (const n of remaining) {
      clusters[n.connection_type] = (clusters[n.connection_type] || 0) + 1;
    }
    partitions.push({
      nodes_removed: removed.size,
      nodes_remaining: remaining.length,
      clusters,
      network_intact: remaining.length > nodeCount * 0.5
    });
  }
  return {
    simulation_id: "sim-" + Date.now().toString(36),
    parameters: { node_count: nodeCount, failure_rate: failureRate, mobility, duration, malicious_rate: maliciousRate },
    summary: {
      total_nodes: nodeCount,
      online: online.length,
      offline: offline.length,
      eligible_relays: relays.length,
      malicious_detected: malicious.length,
      avg_route_score: Math.round(avgScore),
      avg_latency_ms: Math.round(avgLatency),
      avg_battery_pct: Math.round(avgBattery),
      avg_hop_count: Math.round(avgHops * 10) / 10,
      network_health: avgScore > 60 ? "healthy" : avgScore > 40 ? "degraded" : "critical"
    },
    by_connection_type: byType,
    top_nodes: scored.slice(0, 10).map((n) => ({ id: n.id, type: n.type, connection: n.connection_type, route_score: n.route_score, latency: n.latency, battery: n.battery_level })),
    bottom_nodes: scored.slice(-5).map((n) => ({ id: n.id, route_score: n.route_score, reason: !n.online ? "offline" : n.malicious ? "malicious" : n.battery_level < 30 ? "low_battery" : "poor_signal" })),
    failure_scenarios: failureScenarios,
    partitions,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(runSimulation, "runSimulation");
function autopilotSelect(available_paths, current_path, opts) {
  const scored = available_paths.map((p) => {
    let normalized;
    if (typeof p === "string") {
      const d = TIER_DEFAULTS[p.toLowerCase()];
      normalized = d ? { ...d, name: p } : { tier: p, name: p, latency: 1e3, reliability: 0.5, cost: 0.5, priority: 0, signal_strength: 50, battery_level: 100, throughput: 1, hop_count: 1 };
    } else {
      const tierName = (p.tier || p.name || "").toLowerCase();
      const d = TIER_DEFAULTS[tierName] || {};
      normalized = {
        tier: p.tier || d.tier || "unknown",
        name: p.name || p.tier || "unknown",
        latency: p.latency != null ? p.latency : d.latency || 1e3,
        reliability: p.reliability != null ? p.reliability : d.reliability || 0.5,
        cost: p.cost != null ? p.cost : d.cost || 0.5,
        priority: p.priority != null ? p.priority : d.priority || 0,
        signal_strength: p.signal_strength != null ? p.signal_strength : 75,
        battery_level: p.battery_level != null ? p.battery_level : 100,
        throughput: p.throughput != null ? p.throughput : d.latency ? Math.max(1, 100 - d.latency / 10) : 1,
        hop_count: p.hop_count != null ? p.hop_count : 1
      };
    }
    const routeScore = calculateHarzRouteScore(normalized);
    return {
      path: normalized.name || normalized.tier || "unknown",
      route_score: routeScore,
      latency: normalized.latency,
      reliability: normalized.reliability,
      cost: normalized.cost,
      priority: normalized.priority,
      signal_strength: normalized.signal_strength,
      battery_level: normalized.battery_level,
      throughput: normalized.throughput,
      hop_count: normalized.hop_count
    };
  });
  scored.sort((a, b) => b.route_score - a.route_score);
  const best = scored[0];
  const current = scored.find((s) => s.path === current_path) || scored.find((s) => s.path === (current_path || ""));
  const switchThreshold = opts && opts.switch_threshold ? opts.switch_threshold : 10;
  const shouldSwitch = !current_path || best.route_score - (current ? current.route_score : 0) >= switchThreshold;
  const transitionChain = scored.map((s) => s.path);
  return {
    selected_path: shouldSwitch ? best.path : current_path || best.path,
    selected_score: shouldSwitch ? best.route_score : current ? current.route_score : best.route_score,
    previous_path: current_path || null,
    should_switch: shouldSwitch,
    switch_reason: shouldSwitch ? current_path ? `New path ${best.path} scores ${best.route_score} vs current ${current_path} at ${current ? current.route_score : 0}` : "No current path, selecting best available" : "Current path is still optimal or within switch threshold",
    all_paths_ranked: scored,
    transition_chain: transitionChain,
    autopilot_active: true,
    switch_threshold: switchThreshold,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(autopilotSelect, "autopilotSelect");
async function dtnStoreMessage(env, msg) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    const msgId = msg.msg_id || "msg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    const expires = msg.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
    await env.HNF_DB.prepare(
      `INSERT INTO hnf_messages (msg_id, source_node, dest_node, payload, msg_type, hops, path, status, expires_at, signature, encrypted) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
    ).bind(
      msgId,
      msg.source_node || "unknown",
      msg.dest_node || "any",
      msg.payload || "",
      msg.msg_type || "text",
      msg.hops || 0,
      msg.path || "",
      expires,
      msg.signature || null,
      msg.encrypted ? 1 : 0
    ).run();
    await logControlEvent(env, "dtn_store", msg.source_node, { msg_id: msgId, dest: msg.dest_node });
    return { ok: true, msg_id: msgId, status: "pending", expires_at: expires };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(dtnStoreMessage, "dtnStoreMessage");
async function dtnGetPending(env, nodeId) {
  if (!env || !env.HNF_DB)
    return [];
  try {
    const result = await env.HNF_DB.prepare(
      `SELECT * FROM hnf_messages WHERE (dest_node = ? OR dest_node = 'any') AND status = 'pending' AND (expires_at IS NULL OR expires_at > datetime('now')) ORDER BY created_at ASC LIMIT 50`
    ).bind(nodeId).all();
    return result.results || [];
  } catch (e) {
    return [];
  }
}
__name(dtnGetPending, "dtnGetPending");
async function dtnDeliverMessage(env, msgId, deliveredBy, path) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    await env.HNF_DB.prepare(
      `UPDATE hnf_messages SET status = 'delivered', delivered_at = datetime('now'), path = ? WHERE msg_id = ?`
    ).bind(path || "", msgId).run();
    const msg = await env.HNF_DB.prepare(`SELECT * FROM hnf_messages WHERE msg_id = ?`).bind(msgId).first();
    if (msg) {
      await logControlEvent(env, "dtn_deliver", deliveredBy, { msg_id: msgId, source: msg.source_node, dest: msg.dest_node });
    }
    return { ok: true, msg_id: msgId, status: "delivered" };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(dtnDeliverMessage, "dtnDeliverMessage");
async function dtnForwardMessage(env, msgId, relayNode, newHops, newPath) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    await env.HNF_DB.prepare(
      `UPDATE hnf_messages SET hops = ?, path = ? WHERE msg_id = ?`
    ).bind(newHops, newPath, msgId).run();
    await logControlEvent(env, "dtn_forward", relayNode, { msg_id: msgId, hops: newHops });
    return { ok: true, msg_id: msgId, hops: newHops };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(dtnForwardMessage, "dtnForwardMessage");
async function dtnGetStats(env) {
  if (!env || !env.HNF_DB)
    return {};
  try {
    const total = await env.HNF_DB.prepare(`SELECT COUNT(*) as c FROM hnf_messages`).first();
    const pending = await env.HNF_DB.prepare(`SELECT COUNT(*) as c FROM hnf_messages WHERE status = 'pending'`).first();
    const delivered = await env.HNF_DB.prepare(`SELECT COUNT(*) as c FROM hnf_messages WHERE status = 'delivered'`).first();
    const expired = await env.HNF_DB.prepare(`SELECT COUNT(*) as c FROM hnf_messages WHERE status = 'pending' AND expires_at < datetime('now')`).first();
    const recent = await env.HNF_DB.prepare(`SELECT COUNT(*) as c FROM hnf_messages WHERE created_at > datetime('now', '-1 hour')`).first();
    return {
      total: total ? total.c : 0,
      pending: pending ? pending.c : 0,
      delivered: delivered ? delivered.c : 0,
      expired: expired ? expired.c : 0,
      last_hour: recent ? recent.c : 0
    };
  } catch (e) {
    return {};
  }
}
__name(dtnGetStats, "dtnGetStats");
async function registerIdentity(env, nodeId, publicKey, signature) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    const existing = await env.HNF_DB.prepare(`SELECT * FROM hnf_identities WHERE node_id = ?`).bind(nodeId).first();
    if (existing) {
      if (publicKey && publicKey !== existing.public_key) {
        await env.HNF_DB.prepare(
          `UPDATE hnf_identities SET public_key = ?, last_verified = datetime('now'), trust_score = ? WHERE node_id = ?`
        ).bind(publicKey, Math.min(100, (existing.trust_score || 50) + 10), nodeId).run();
      } else {
        await env.HNF_DB.prepare(
          `UPDATE hnf_identities SET last_verified = datetime('now') WHERE node_id = ?`
        ).bind(nodeId).run();
      }
      await logControlEvent(env, "identity_verify", nodeId, { action: "existing_verified" });
      return { ok: true, node_id: nodeId, action: "verified", trust_score: existing.trust_score || 50 };
    }
    await env.HNF_DB.prepare(
      `INSERT INTO hnf_identities (node_id, public_key, key_type, trust_score, signature) VALUES (?, ?, 'ed25519', 50, ?)`
    ).bind(nodeId, publicKey || "pending-key-gen", signature || null).run();
    await logControlEvent(env, "identity_register", nodeId, { key_type: "ed25519" });
    return { ok: true, node_id: nodeId, action: "registered", trust_score: 50 };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(registerIdentity, "registerIdentity");
async function verifyIdentity(env, nodeId) {
  if (!env || !env.HNF_DB)
    return { verified: false, error: "No D1 binding" };
  try {
    const ident = await env.HNF_DB.prepare(`SELECT * FROM hnf_identities WHERE node_id = ? AND revoked = 0`).bind(nodeId).first();
    if (!ident)
      return { verified: false, reason: "not_registered_or_revoked" };
    await env.HNF_DB.prepare(`UPDATE hnf_identities SET last_verified = datetime('now') WHERE node_id = ?`).bind(nodeId).run();
    return {
      verified: true,
      node_id: nodeId,
      trust_score: ident.trust_score || 50,
      key_type: ident.key_type,
      registered_at: ident.registered_at,
      last_verified: ident.last_verified
    };
  } catch (e) {
    return { verified: false, error: e.message };
  }
}
__name(verifyIdentity, "verifyIdentity");
async function revokeIdentity(env, nodeId, reason) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    await env.HNF_DB.prepare(`UPDATE hnf_identities SET revoked = 1 WHERE node_id = ?`).bind(nodeId).run();
    await logControlEvent(env, "identity_revoke", nodeId, { reason: reason || "unspecified" });
    return { ok: true, node_id: nodeId, status: "revoked", reason: reason || "unspecified" };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(revokeIdentity, "revokeIdentity");
async function getIdentityStats(env) {
  if (!env || !env.HNF_DB)
    return {};
  try {
    const total = await env.HNF_DB.prepare(`SELECT COUNT(*) as c FROM hnf_identities`).first();
    const active = await env.HNF_DB.prepare(`SELECT COUNT(*) as c FROM hnf_identities WHERE revoked = 0`).first();
    const revoked = await env.HNF_DB.prepare(`SELECT COUNT(*) as c FROM hnf_identities WHERE revoked = 1`).first();
    const avgTrust = await env.HNF_DB.prepare(`SELECT AVG(trust_score) as avg FROM hnf_identities WHERE revoked = 0`).first();
    return {
      total: total ? total.c : 0,
      active: active ? active.c : 0,
      revoked: revoked ? revoked.c : 0,
      avg_trust_score: avgTrust ? Math.round(avgTrust.avg || 0) : 0
    };
  } catch (e) {
    return {};
  }
}
__name(getIdentityStats, "getIdentityStats");
async function logControlEvent(env, eventType, nodeId, data) {
  if (!env || !env.HNF_DB)
    return;
  try {
    await env.HNF_DB.prepare(
      `INSERT INTO hnf_control_events (event_type, node_id, data) VALUES (?, ?, ?)`
    ).bind(eventType, nodeId, JSON.stringify(data || {})).run();
  } catch (e) {
  }
}
__name(logControlEvent, "logControlEvent");
async function getControlEvents(env, limit) {
  if (!env || !env.HNF_DB)
    return [];
  try {
    const result = await env.HNF_DB.prepare(
      `SELECT * FROM hnf_control_events ORDER BY created_at DESC LIMIT ?`
    ).bind(limit || 50).all();
    return result.results || [];
  } catch (e) {
    return [];
  }
}
__name(getControlEvents, "getControlEvents");
async function getTransports(env) {
  if (!env || !env.HNF_DB) {
    return [
      { transport_type: "internet", display_name: "Internet (Fiber/Broadband)", priority: 1, available: 1 },
      { transport_type: "wifi", display_name: "Wi-Fi", priority: 2, available: 1 },
      { transport_type: "wifi_direct", display_name: "Wi-Fi Direct", priority: 3, available: 1 },
      { transport_type: "wifi_aware", display_name: "Wi-Fi Aware (NAN)", priority: 3, available: 1 },
      { transport_type: "cellular", display_name: "Cellular (GSM/3G/4G/5G)", priority: 4, available: 1 },
      { transport_type: "bluetooth", display_name: "Bluetooth LE", priority: 5, available: 1 },
      { transport_type: "satellite", display_name: "Satellite (Starlink/etc)", priority: 6, available: 1 },
      { transport_type: "edge_mesh", display_name: "Edge Mesh (P2P)", priority: 7, available: 1 }
    ];
  }
  try {
    const result = await env.HNF_DB.prepare(`SELECT * FROM hnf_transports ORDER BY priority ASC`).all();
    return result.results || [];
  } catch (e) {
    return [
      { transport_type: "internet", display_name: "Internet", priority: 1, available: 1 },
      { transport_type: "wifi", display_name: "Wi-Fi", priority: 2, available: 1 },
      { transport_type: "cellular", display_name: "Cellular", priority: 4, available: 1 },
      { transport_type: "satellite", display_name: "Satellite", priority: 6, available: 1 },
      { transport_type: "edge_mesh", display_name: "Edge Mesh", priority: 7, available: 1 }
    ];
  }
}
__name(getTransports, "getTransports");
async function updateTransportStatus(env, transportType, available) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    await env.HNF_DB.prepare(
      `UPDATE hnf_transports SET available = ? WHERE transport_type = ?`
    ).bind(available ? 1 : 0, transportType).run();
    await logControlEvent(env, "transport_status", transportType, { available });
    return { ok: true, transport_type: transportType, available };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(updateTransportStatus, "updateTransportStatus");
function getGatewayInfo() {
  return {
    gateway_id: "hgn-gateway-01",
    type: "edge_gateway",
    capabilities: [
      "relay_coordination",
      "local_caching",
      "message_forwarding",
      "service_discovery",
      "route_computation",
      "telemetry_aggregation",
      "store_and_forward",
      "gateway_failover",
      "transport_switching"
    ],
    transports: ["internet", "cellular", "satellite", "edge_mesh"],
    uptime_target: "99.9%",
    max_mesh_nodes: 1e3,
    message_ttl_hours: 168,
    description: "HARZ Edge Gateway \u2014 bridges local mesh to global HNF control plane"
  };
}
__name(getGatewayInfo, "getGatewayInfo");
async function gatewayRegisterMeshNode(env, nodeId, transport, capabilities) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    const nodeData = {
      id: nodeId,
      node_type: "phone",
      name: nodeId,
      location: "mesh",
      tier: "mesh",
      capabilities: capabilities || {},
      health_url: ""
    };
    await dbRegisterNode(env, nodeData);
    await logControlEvent(env, "gateway_node_register", nodeId, {
      transport: transport || "mesh",
      gateway: "hgn-gateway-01",
      capabilities: capabilities || {}
    });
    return {
      ok: true,
      node_id: nodeId,
      gateway: "hgn-gateway-01",
      transport: transport || "mesh",
      registered: true,
      message: "Node registered with edge gateway. Messages will be relayed through this gateway when available."
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(gatewayRegisterMeshNode, "gatewayRegisterMeshNode");
async function gatewayAggregateTelemetry(env) {
  if (!env || !env.HNF_DB)
    return { ok: false, error: "No D1 binding" };
  try {
    const teleStats = await dbGetTelemetryStats(env);
    const dtnStats = await dtnGetStats(env);
    const idStats = await getIdentityStats(env);
    const nodes = await dbGetNodes(env);
    const transports = await getTransports(env);
    return {
      gateway_id: "hgn-gateway-01",
      aggregation: {
        mesh_nodes: nodes.length,
        telemetry: teleStats,
        messages: dtnStats,
        identities: idStats,
        transports_active: transports.filter((t) => t.available).length,
        transports_total: transports.length
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(gatewayAggregateTelemetry, "gatewayAggregateTelemetry");
async function discoverNodes() {
  const results = [];
  const checks = [];
  for (const [id, info] of Object.entries(HGN_SERVICES)) {
    const baseUrl = info.account === 1 ? `https://${id.replace("-a1", "")}.hamzarabiu390.workers.dev` : `https://${id}.harz.workers.dev`;
    checks.push(
      checkNodeHealth(baseUrl).then((health) => ({ id, name: info.name, category: info.category, tier: info.tier, account: info.account || 2, url: baseUrl, health }))
    );
  }
  const batchSize = 10;
  for (let i = 0; i < checks.length; i += batchSize) {
    const batch = checks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  const online = results.filter((r) => r.health.online);
  const offline = results.filter((r) => !r.health.online);
  return { total: results.length, online: online.length, offline: offline.length, nodes: results.sort((a, b) => b.health.latency - a.health.latency) };
}
__name(discoverNodes, "discoverNodes");
function computeRelayChain(source, target, nodes) {
  const onlineNodes = nodes.filter((n) => n.health.online && n.health.latency > 0);
  if (onlineNodes.length === 0)
    return { path: [], hops: 0, feasible: false, reason: "No online nodes available" };
  const sorted = [...onlineNodes].sort((a, b) => a.health.latency - b.health.latency);
  const chain = [];
  let currentLatency = 0;
  const direct = sorted.find((n) => n.id === target);
  if (direct) {
    return { path: [source, target], hops: 0, feasible: true, total_latency: direct.health.latency, nodes: [direct] };
  }
  const relay1 = sorted.find((n) => n.id !== source && n.id !== target);
  if (relay1) {
    return {
      path: [source, relay1.id, target],
      hops: 1,
      feasible: true,
      total_latency: relay1.health.latency * 2,
      relay_nodes: [{ id: relay1.id, name: relay1.name, latency: relay1.health.latency, score: 100 - Math.min(100, relay1.health.latency) }]
    };
  }
  const relay2a = sorted.find((n) => n.id !== source);
  const relay2b = sorted.find((n) => n.id !== source && n.id !== target && n.id !== (relay2a ? relay2a.id : ""));
  if (relay2a && relay2b) {
    return {
      path: [source, relay2a.id, relay2b.id, target],
      hops: 2,
      feasible: true,
      total_latency: relay2a.health.latency + relay2b.health.latency,
      relay_nodes: [
        { id: relay2a.id, name: relay2a.name, latency: relay2a.health.latency },
        { id: relay2b.id, name: relay2b.name, latency: relay2b.health.latency }
      ]
    };
  }
  return { path: [], hops: 0, feasible: false, reason: "No relay path found" };
}
__name(computeRelayChain, "computeRelayChain");
function computeFailover(primaryNode, nodes) {
  const onlineNodes = nodes.filter((n) => n.health.online && n.id !== primaryNode);
  if (onlineNodes.length === 0)
    return { failover_available: false, reason: "No alternative nodes available" };
  const ranked = onlineNodes.sort((a, b) => {
    const scoreA = 100 - Math.min(100, a.health.latency) + (a.health.status === "healthy" ? 20 : 0);
    const scoreB = 100 - Math.min(100, b.health.latency) + (b.health.status === "healthy" ? 20 : 0);
    return scoreB - scoreA;
  });
  return {
    failover_available: true,
    primary: primaryNode,
    failover_order: ranked.slice(0, 5).map((n) => ({ id: n.id, name: n.name, latency: n.health.latency, status: n.health.status, account: n.account })),
    recommended: ranked[0] ? { id: ranked[0].id, name: ranked[0].name, latency: ranked[0].health.latency } : null
  };
}
__name(computeFailover, "computeFailover");
var hnf_merged_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization"
    };
    if (method === "OPTIONS")
      return new Response(null, { headers: corsHeaders });
    if (path === "/api/health") {
      return json({
        status: "healthy",
        service: "HARZ Network Fabric",
        version: "4.0.0",
        description: "Intelligence layer for HARZ Global Network",
        services_registered: Object.keys(HGN_SERVICES).length,
        connectivity_tiers: Object.keys(CONNECTIVITY_TIERS).length,
        edge_node_types: Object.keys(EDGE_NODE_TYPES).length,
        capabilities: ["client-health-checks", "route-selection", "relay-scoring", "live-health-ping", "node-discovery", "relay-chain", "failover", "edge-node-registration", "d1-persistence", "ussd-activation", "unified-identity", "service-registry", "telemetry-recording", "route-score-v2", "network-simulator", "connectivity-autopilot", "store-and-forward", "cryptographic-identity", "control-plane-events", "transport-adapters", "edge-gateway", "data-plane"],
        note: "Health checks run client-side (browser) due to Cloudflare same-account fetch limitation",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders);
    }
    if (path === "/api/migrate" && method === "POST") {
      if (!env || !env.HNF_DB)
        return json({ error: "No D1 binding" }, corsHeaders, 500);
      const results = [];
      const tablesToFix = ["hnf_identities", "hnf_telemetry", "hnf_nodes", "hnf_control_events", "hnf_transports"];
      for (const table of tablesToFix) {
        try {
          await env.HNF_DB.prepare(`DROP TABLE IF EXISTS ${table}`).run();
          results.push({ table, action: "dropped" });
        } catch (e) {
          results.push({ table, action: "drop_failed", error: e.message });
        }
      }
      try {
        await env.HNF_DB.prepare(`CREATE TABLE hnf_identities (node_id TEXT PRIMARY KEY, public_key TEXT, key_type TEXT DEFAULT 'ed25519', trust_score INTEGER DEFAULT 50, signature TEXT, revoked INTEGER DEFAULT 0, registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, last_verified TIMESTAMP)`).run();
        results.push({ table: "hnf_identities", action: "created" });
      } catch (e) {
        results.push({ table: "hnf_identities", action: "create_failed", error: e.message });
      }
      try {
        await env.HNF_DB.prepare(`CREATE TABLE hnf_telemetry (id INTEGER PRIMARY KEY AUTOINCREMENT, node_id TEXT, hop_count INTEGER, latency REAL, packet_loss REAL, signal_strength REAL, battery_level REAL, throughput REAL, connection_type TEXT, route_changes INTEGER, uptime REAL, failure_reason TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`).run();
        results.push({ table: "hnf_telemetry", action: "created" });
      } catch (e) {
        results.push({ table: "hnf_telemetry", action: "create_failed", error: e.message });
      }
      try {
        await env.HNF_DB.prepare(`CREATE TABLE hnf_nodes (id TEXT PRIMARY KEY, node_type TEXT, name TEXT, location TEXT, tier TEXT, capabilities TEXT, health_url TEXT, last_seen TIMESTAMP, status TEXT DEFAULT 'active')`).run();
        results.push({ table: "hnf_nodes", action: "created" });
      } catch (e) {
        results.push({ table: "hnf_nodes", action: "create_failed", error: e.message });
      }
      try {
        await env.HNF_DB.prepare(`CREATE TABLE hnf_control_events (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT, node_id TEXT, data TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`).run();
        results.push({ table: "hnf_control_events", action: "created" });
      } catch (e) {
        results.push({ table: "hnf_control_events", action: "create_failed", error: e.message });
      }
      try {
        await env.HNF_DB.prepare(`CREATE TABLE hnf_transports (transport_type TEXT PRIMARY KEY, display_name TEXT, priority INTEGER, available INTEGER DEFAULT 1, last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`).run();
        results.push({ table: "hnf_transports", action: "created" });
      } catch (e) {
        results.push({ table: "hnf_transports", action: "create_failed", error: e.message });
      }
      const defaults = [
        ["internet", "Internet (Fiber/Broadband)", 1, 1],
        ["wifi", "Wi-Fi", 2, 1],
        ["wifi_direct", "Wi-Fi Direct", 3, 1],
        ["wifi_aware", "Wi-Fi Aware (NAN)", 3, 1],
        ["cellular", "Cellular (GSM/3G/4G/5G)", 4, 1],
        ["bluetooth", "Bluetooth (BLE)", 5, 1],
        ["satellite", "Satellite (LEO/GEO)", 6, 1],
        ["edge_mesh", "Edge Mesh", 7, 1],
        ["fiber", "Fiber Optic", 0, 1]
      ];
      for (const [type, name, pri, avail] of defaults) {
        try {
          await env.HNF_DB.prepare(`INSERT INTO hnf_transports (transport_type, display_name, priority, available) VALUES (?,?,?,?)`).bind(type, name, pri, avail).run();
        } catch (e) {
        }
      }
      results.push({ table: "hnf_transports", action: "seeded" });
      return json({ success: true, migration: results, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/cleanup" && method === "POST") {
      if (!env || !env.HNF_DB)
        return json({ error: "No D1 binding" }, corsHeaders, 500);
      const results = [];
      try {
        await env.HNF_DB.prepare(`DELETE FROM hnf_identities`).run();
        results.push("identities cleaned");
      } catch (e) {
        results.push("identities: " + e.message);
      }
      try {
        await env.HNF_DB.prepare(`DELETE FROM hnf_telemetry`).run();
        results.push("telemetry cleaned");
      } catch (e) {
        results.push("telemetry: " + e.message);
      }
      try {
        await env.HNF_DB.prepare(`DELETE FROM hnf_messages`).run();
        results.push("messages cleaned");
      } catch (e) {
        results.push("messages: " + e.message);
      }
      try {
        await env.HNF_DB.prepare(`DELETE FROM hnf_control_events`).run();
        results.push("events cleaned");
      } catch (e) {
        results.push("events: " + e.message);
      }
      try {
        await env.HNF_DB.prepare(`DELETE FROM hnf_nodes`).run();
        results.push("nodes cleaned");
      } catch (e) {
        results.push("nodes: " + e.message);
      }
      return json({ success: true, cleaned: results, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/fabric" && method === "GET") {
      const services = Object.entries(HGN_SERVICES).map(([id, info]) => ({
        id,
        ...info,
        url: `https://${id}.harz.workers.dev`,
        health_url: info.account === 1 ? `https://${id.replace("-a1", "")}.hamzarabiu390.workers.dev/api/health` : `https://${id}.harz.workers.dev/api/health`,
        url: info.account === 1 ? `https://${id.replace("-a1", "")}.hamzarabiu390.workers.dev` : `https://${id}.harz.workers.dev`
      }));
      return json({
        success: true,
        name: "HARZ Global Network",
        fabric: "HARZ Network Fabric (HNF)",
        version: "4.0.0",
        vision: "Make communication and computing available everywhere by intelligently combining satellite, cellular, Wi-Fi, device-to-device and edge networks",
        structure: {
          "HARZ Global Network (HGN)": { technology: "HNF v2.1", edge: "HARZ Edge", consumer_app: "HARZ Connect", cloud: "HARZ Edge Cloud", ai: "HARZ AI" }
        },
        services: Object.keys(HGN_SERVICES).length,
        connectivity_tiers: Object.keys(CONNECTIVITY_TIERS).length,
        edge_node_types: Object.keys(EDGE_NODE_TYPES).length,
        categories: [...new Set(Object.values(HGN_SERVICES).map((s) => s.category))],
        routing: "Score-based (tier 30%, latency 30%, reliability 25%, cost 15%)",
        identity: "Edge ID \u2014 harz://user/<pubkey> or harz://node/<id>",
        capabilities: ["client-health-checks", "route-selection", "relay-scoring", "live-health-ping", "node-discovery", "relay-chain", "failover", "edge-node-registration", "d1-persistence", "ussd-activation", "unified-identity", "service-registry", "telemetry-recording", "route-score-v2", "network-simulator", "connectivity-autopilot", "store-and-forward", "cryptographic-identity", "control-plane-events", "transport-adapters", "edge-gateway", "data-plane"],
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders);
    }
    if (path === "/api/status" && method === "GET") {
      const services = Object.entries(HGN_SERVICES).map(([id, info]) => {
        const baseUrl = info.account === 1 ? `https://${id.replace("-a1", "")}.hamzarabiu390.workers.dev` : `https://${id}.harz.workers.dev`;
        return {
          id,
          name: info.name,
          category: info.category,
          tier: info.tier,
          role: info.role,
          account: info.account || 2,
          url: baseUrl,
          health_url: baseUrl + "/api/health",
          status: "pending"
        };
      });
      return json({
        success: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        note: "Health checks must be performed client-side. Each service has a health_url field.",
        total: services.length,
        services
      }, corsHeaders);
    }
    if (path === "/api/services" && method === "GET") {
      const services = Object.entries(HGN_SERVICES).map(([id, info]) => {
        const baseUrl = info.account === 1 ? `https://${id.replace("-a1", "")}.hamzarabiu390.workers.dev` : `https://${id}.harz.workers.dev`;
        return { id, ...info, account: info.account || 2, url: baseUrl, health_url: baseUrl + "/api/health" };
      });
      const byCategory = {};
      for (const s of services) {
        if (!byCategory[s.category])
          byCategory[s.category] = [];
        byCategory[s.category].push(s);
      }
      return json({ success: true, total: services.length, categories: Object.keys(byCategory).length, by_category: byCategory, services }, corsHeaders);
    }
    if (path === "/api/topology" && method === "GET") {
      return json({
        success: true,
        topology: {
          layers: {
            "HARZ Cloud AI": { services: Object.entries(HGN_SERVICES).filter(([_, s]) => s.tier === "core").map(([id, s]) => ({ id, name: s.name, role: s.role })) },
            "Network Fabric": { description: "Routing, Security, AI, Identity", routing_algorithm: "Score-based path selection", identity: "Edge ID (Ed25519)" },
            "Connectivity Tiers": Object.entries(CONNECTIVITY_TIERS).map(([id, t]) => ({ id, name: t.name, icon: t.icon, priority: t.priority, latency: t.latency, use_case: t.useCase })),
            "HARZ Edge": { node_types: Object.entries(EDGE_NODE_TYPES).map(([id, t]) => ({ id, name: t.name, relay: t.relay, range: t.range })) }
          },
          total_services: Object.keys(HGN_SERVICES).length
        }
      }, corsHeaders);
    }
    if (path === "/api/route" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const { source, destination, type, available_paths } = body;
      if (!available_paths || !Array.isArray(available_paths))
        return json({ error: "available_paths array required" }, corsHeaders, 400);
      const normalizedPaths = available_paths.map((p) => normalizePath(p));
      const bestPath = selectBestPath(available_paths);
      const allScored = normalizedPaths.map((p) => ({ ...p, score: calculateRouteScore(p) })).sort((a, b) => b.score - a.score);
      return json({ success: true, source: source || "unknown", destination: destination || "unknown", request_type: type || "generic", selected_path: bestPath, score: bestPath.score, all_paths_ranked: allScored, routing_algorithm: "Score-based (tier 30%, latency 30%, reliability 25%, cost 15%)", timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/relay-score" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const score = calculateRelayScore(body);
      const eligible = score >= 30 && (body.battery || 0) > 30;
      return json({ success: true, node: body.nodeId || "unknown", relay_score: score, eligible_for_relay: eligible, recommendation: eligible ? "Node selected as relay" : "Node below relay threshold", timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/register-node" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const { nodeId, nodeType, location, capabilities } = body;
      if (!nodeId || !nodeType)
        return json({ error: "nodeId and nodeType required" }, corsHeaders, 400);
      if (!EDGE_NODE_TYPES[nodeType])
        return json({ error: "Invalid node type", valid_types: Object.keys(EDGE_NODE_TYPES) }, corsHeaders, 400);
      const nodeData = { id: nodeId, node_type: nodeType, name: nodeId, location: location || "unknown", tier: EDGE_NODE_TYPES[nodeType].relay, capabilities: capabilities || {}, health_url: "" };
      const dbResult = await dbRegisterNode(env, nodeData);
      return json({ success: true, node_id: nodeId, node_type: nodeType, node_info: EDGE_NODE_TYPES[nodeType], location: location || "unknown", capabilities: capabilities || {}, edge_id: generateEdgeId("node", nodeId), registered_at: (/* @__PURE__ */ new Date()).toISOString(), status: "registered", persisted: dbResult.ok, db_error: dbResult.error || null }, corsHeaders);
    }
    if (path === "/api/nodes" && method === "GET") {
      const nodes = await dbGetNodes(env);
      return json({ success: true, total: nodes.length, nodes, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/identity" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const { userId, publicKey, phone, username, trustLevel } = body;
      if (!userId)
        return json({ error: "userId required" }, corsHeaders, 400);
      return json({
        success: true,
        edge_id: generateEdgeId("user", userId),
        user_id: userId,
        public_key: publicKey || "pending-generation",
        associations: { phone: phone || null, username: username || null, device: "pending", organization: null },
        trust_level: trustLevel || "unverified",
        trust_levels: ["direct-qr", "verified-sms", "mesh-vouch", "unverified"],
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders);
    }
    if (path === "/api/connectivity" && method === "GET") {
      return json({ success: true, tiers: Object.entries(CONNECTIVITY_TIERS).map(([id, t]) => ({ id, ...t, services_using_tier: Object.entries(HGN_SERVICES).filter(([_, s]) => s.tier === id).map(([_, s]) => s.name) })) }, corsHeaders);
    }
    if (path === "/api/discover" && method === "GET") {
      const discovered = await discoverNodes();
      return json({ success: true, ...discovered, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/relay-chain" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const { source, target } = body;
      if (!source || !target)
        return json({ error: "source and target required (use service IDs)" }, corsHeaders, 400);
      const discovered = await discoverNodes();
      const chain = computeRelayChain(source, target, discovered.nodes);
      if (chain.feasible)
        await dbSaveRelayPath(env, source, target, chain.path, chain.hops, chain.total_latency || 0);
      return json({ success: true, source, target, ...chain, persisted: chain.feasible, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/failover" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const { primaryNode } = body;
      if (!primaryNode)
        return json({ error: "primaryNode required (service ID)" }, corsHeaders, 400);
      const discovered = await discoverNodes();
      const failover = computeFailover(primaryNode, discovered.nodes);
      return json({ success: true, ...failover, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/relay-score" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      if (body.nodeId && body.fetchLive) {
        const svc = HGN_SERVICES[body.nodeId];
        if (svc) {
          const baseUrl = svc.account === 1 ? `https://${body.nodeId.replace("-a1", "")}.hamzarabiu390.workers.dev` : `https://${body.nodeId}.harz.workers.dev`;
          const health = await checkNodeHealth(baseUrl);
          body.connectionQuality = health.online ? Math.max(0, 100 - health.latency) : 0;
          body.uptime = health.online ? 86400 : 0;
          body.liveStatus = health;
        }
      }
      const score = calculateRelayScore(body);
      const eligible = score >= 30 && (body.battery || body.connectionQuality || 0) > 30;
      return json({
        success: true,
        node: body.nodeId || "unknown",
        relay_score: score,
        eligible_for_relay: eligible,
        recommendation: eligible ? "Node selected as relay" : "Node below relay threshold",
        live_health: body.liveStatus || null,
        inputs: { connectionQuality: body.connectionQuality, uptime: body.uptime, battery: body.battery, signal: body.signal, peerCount: body.peerCount },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders);
    }
    if (path === "/" || path === "/index.html") {
      return new Response(DASHBOARD_HTML, { headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } });
    }
    if (path === "/manifest.json") {
      return json({ name: "HARZ Network Fabric", short_name: "HNF", description: "HARZ Global Network - Connectivity Intelligence", display: "standalone", theme_color: "#f0f2f5", background_color: "#f0f2f5", start_url: "/", icons: [{ src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiB2aWV3Qm94PSIwIDAgMTkyIDE5MiI+PHJlY3Qgd2lkdGg9IjE5MiIgaGVpZ2h0PSIxOTIiIHJ4PSIzMiIgZmlsbD0iIzBhN2QzYyIvPjx0ZXh0IHg9Ijk2IiB5PSIxMjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkg8L3RleHQ+PC9zdmc+", sizes: "192x192", type: "image/svg+xml" }] }, corsHeaders);
    }
    if (path === "/sw.js") {
      return new Response('const C="harz-fabric-v24";self.addEventListener("install",e=>self.skipWaiting());self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));self.addEventListener("fetch",e=>{if(e.request.url.includes("/api/"))return;e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{try{c.put(e.request,res.clone())}catch(e){}return res}).catch(()=>r))))});', { headers: { "Content-Type": "application/javascript", ...corsHeaders } });
    }
    if (path === "/api/ussd" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const { MSISDN, USSD_CODE, SESSION_ID, INPUT } = body;
      if (!MSISDN || !USSD_CODE) {
        return json({ error: "MSISDN and USSD_CODE required", format: "*347*NUMBER# for voice call, *347*1*NUMBER*MESSAGE# for SMS" }, corsHeaders, 400);
      }
      const raw = USSD_CODE || INPUT || "";
      const cleaned = raw.replace(/^\*/, "").replace(/#$/, "");
      const parts = cleaned.split("*");
      if (parts[0] === "347") {
        if (parts.length >= 2 && parts[1] === "0") {
          return json({
            success: true,
            action: "balance",
            ussd_code: USSD_CODE,
            caller: MSISDN,
            message: "Welcome to HARZ Network. Dial *347*NUMBER# to call, *347*1*NUMBER*MESSAGE# to SMS",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }, corsHeaders);
        }
        if (parts.length >= 2 && parts[1] !== "1") {
          const target = parts[1];
          try {
            const voiceResp = await fetch("https://harz-voice-call.harz.workers.dev/api/ussd", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ MSISDN, INPUT: target, SESSION_ID: SESSION_ID || Date.now().toString() })
            });
            const voiceData = await voiceResp.json();
            return json({
              success: true,
              action: "voice_call",
              ussd_code: USSD_CODE,
              caller: MSISDN,
              target,
              voice_response: voiceData,
              service: "HARZ Voice Call",
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }, corsHeaders);
          } catch (e) {
            return json({ success: false, action: "voice_call", error: "Voice service unreachable", target, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders, 502);
          }
        }
        if (parts.length >= 4 && parts[1] === "1") {
          const target = parts[2];
          const message = parts[3] || "";
          try {
            const smsResp = await fetch("https://harz-gateway.harz.workers.dev/api/sms/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ to: target, message, from: "HARZ" })
            });
            const smsData = await smsResp.json();
            return json({
              success: true,
              action: "sms",
              ussd_code: USSD_CODE,
              sender: MSISDN,
              target,
              message,
              sms_response: smsData,
              service: "HARZ Gateway",
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }, corsHeaders);
          } catch (e) {
            return json({ success: false, action: "sms", error: "Gateway unreachable", target, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders, 502);
          }
        }
      }
      return json({
        success: false,
        error: "Unknown USSD code",
        ussd_code: USSD_CODE,
        supported: ["*347*NUMBER# (voice call)", "*347*1*NUMBER*MESSAGE# (SMS)", "*347*0# (balance/help)"],
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders, 400);
    }
    if (path === "/api/telemetry" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const result = await dbSaveTelemetry(env, body);
      return json({
        success: result.ok,
        node_id: body.node_id || "unknown",
        recorded: result.ok,
        error: result.error || null,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders);
    }
    if (path === "/api/telemetry" && method === "GET") {
      const url2 = new URL(request.url);
      const nodeId = url2.searchParams.get("node_id");
      const limit = parseInt(url2.searchParams.get("limit") || "50");
      const stats = url2.searchParams.get("stats") === "true";
      if (stats) {
        const s = await dbGetTelemetryStats(env);
        return json({ success: true, stats: s, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
      }
      const records = await dbGetTelemetry(env, nodeId, limit);
      return json({ success: true, total: records.length, records, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/route-score" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const score = calculateHarzRouteScore(body);
      const components = {
        reliability: Math.round(Math.min(1, Math.max(0, body.reliability || 0.5)) * 25 * 100) / 100,
        signal_quality: Math.round(Math.min(1, Math.max(0, (body.signal_strength || 50) / 100) * 20) * 100 / 100),
        battery_availability: Math.round(Math.min(1, Math.max(0, (body.battery_level || 50) / 100) * 15) * 100 / 100),
        latency_factor: Math.round(Math.min(1, Math.max(0, 1 - (body.latency || 1e3) / 2e3)) * 20 * 100) / 100,
        bandwidth: Math.round(Math.min(1, Math.max(0, (body.throughput || 1) / 100) * 15) * 100 / 100),
        hop_penalty: Math.round(Math.min(1, (body.hop_count || 1) * 0.1) * 5 * 100) / 100
      };
      return json({
        success: true,
        route_score: score,
        components,
        formula: "reliability(25%) + signal_quality(20%) + battery_availability(15%) + latency_factor(20%) + bandwidth(15%) - hop_penalty(5%)",
        rating: score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "fair" : "poor",
        inputs: body,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders);
    }
    if (path === "/api/simulate" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const result = runSimulation(body);
      return json({ success: true, ...result }, corsHeaders);
    }
    if (path === "/api/simulate" && method === "GET") {
      const url2 = new URL(request.url);
      const params = {
        node_count: parseInt(url2.searchParams.get("nodes") || "100"),
        failure_rate: parseFloat(url2.searchParams.get("failure_rate") || "0.1"),
        mobility: url2.searchParams.get("mobility") === "true",
        malicious_rate: parseFloat(url2.searchParams.get("malicious") || "0.05"),
        test_failover: url2.searchParams.get("failover") === "true",
        test_partitions: url2.searchParams.get("partitions") === "true"
      };
      const result = runSimulation(params);
      return json({ success: true, ...result }, corsHeaders);
    }
    if (path === "/api/autopilot" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const { available_paths, current_path, switch_threshold } = body;
      if (!available_paths || !Array.isArray(available_paths))
        return json({ error: "available_paths array required" }, corsHeaders, 400);
      const result = autopilotSelect(available_paths, current_path, { switch_threshold });
      return json({ success: true, ...result }, corsHeaders);
    }
    if (path === "/api/autopilot" && method === "GET") {
      const demoPaths = [
        { tier: "5g", latency: 20, reliability: 0, signal_strength: 0, battery_level: 100, throughput: 0 },
        { tier: "wifi", latency: 15, reliability: 0.95, signal_strength: 80, battery_level: 100, throughput: 50 },
        { tier: "cellular", latency: 100, reliability: 0.85, signal_strength: 70, battery_level: 100, throughput: 10 },
        { tier: "mesh", latency: 50, reliability: 0.7, signal_strength: 60, battery_level: 75, throughput: 5 },
        { tier: "satellite", latency: 800, reliability: 0.9, signal_strength: 50, battery_level: 100, throughput: 2 }
      ];
      const result = autopilotSelect(demoPaths, "5g", { switch_threshold: 10 });
      return json({
        success: true,
        scenario: "5G went down \u2014 autopilot selects best alternative",
        ...result
      }, corsHeaders);
    }
    if (path === "/api/dtn/store" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const result = await dtnStoreMessage(env, body);
      return json({ success: result.ok, ...result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/dtn/pending" && method === "GET") {
      const url2 = new URL(request.url);
      const nodeId = url2.searchParams.get("node_id");
      if (!nodeId)
        return json({ error: "node_id required" }, corsHeaders, 400);
      const messages = await dtnGetPending(env, nodeId);
      return json({ success: true, node_id: nodeId, pending_count: messages.length, messages, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/dtn/deliver" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      if (!body.msg_id)
        return json({ error: "msg_id required" }, corsHeaders, 400);
      const result = await dtnDeliverMessage(env, body.msg_id, body.delivered_by || "unknown", body.path || "");
      return json({ success: result.ok, ...result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/dtn/forward" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      if (!body.msg_id)
        return json({ error: "msg_id required" }, corsHeaders, 400);
      const result = await dtnForwardMessage(env, body.msg_id, body.relay_node || "unknown", body.hops || 1, body.path || "");
      return json({ success: result.ok, ...result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/dtn/stats" && method === "GET") {
      const stats = await dtnGetStats(env);
      return json({ success: true, stats, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/dtn/messages" && method === "GET") {
      if (!env || !env.HNF_DB)
        return json({ error: "No D1 binding" }, corsHeaders, 500);
      try {
        const result = await env.HNF_DB.prepare("SELECT * FROM hnf_messages ORDER BY created_at DESC LIMIT 50").all();
        return json({ success: true, total: (result.results || []).length, messages: result.results || [], timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
      } catch (e) {
        return json({ error: e.message }, corsHeaders, 500);
      }
    }
    if (path === "/api/identity/register" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      if (!body.node_id)
        return json({ error: "node_id required" }, corsHeaders, 400);
      const result = await registerIdentity(env, body.node_id, body.public_key, body.signature);
      return json({ success: result.ok, ...result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/identity/verify" && method === "GET") {
      const url2 = new URL(request.url);
      const nodeId = url2.searchParams.get("node_id");
      if (!nodeId)
        return json({ error: "node_id required" }, corsHeaders, 400);
      const result = await verifyIdentity(env, nodeId);
      return json({ ...result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/identity/revoke" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      if (!body.node_id)
        return json({ error: "node_id required" }, corsHeaders, 400);
      const result = await revokeIdentity(env, body.node_id, body.reason);
      return json({ success: result.ok, ...result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/identity/stats" && method === "GET") {
      const stats = await getIdentityStats(env);
      return json({ success: true, stats, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/control/events" && method === "GET") {
      const url2 = new URL(request.url);
      const limit = parseInt(url2.searchParams.get("limit") || "50");
      const events = await getControlEvents(env, limit);
      return json({ success: true, total: events.length, events, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/transports" && method === "GET") {
      const transports = await getTransports(env);
      return json({ success: true, total: transports.length, transports, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/transports/status" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      if (!body.transport_type)
        return json({ error: "transport_type required" }, corsHeaders, 400);
      const result = await updateTransportStatus(env, body.transport_type, body.available);
      return json({ success: result.ok, ...result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/gateway/info" && method === "GET") {
      return json({ success: true, ...getGatewayInfo(), timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/gateway/register-mesh-node" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      if (!body.node_id)
        return json({ error: "node_id required" }, corsHeaders, 400);
      const result = await gatewayRegisterMeshNode(env, body.node_id, body.transport, body.capabilities);
      return json({ success: result.ok, ...result, timestamp: (/* @__PURE__ */ new Date()).toISOString() }, corsHeaders);
    }
    if (path === "/api/gateway/aggregate" && method === "GET") {
      const result = await gatewayAggregateTelemetry(env);
      return json({ success: result.ok, ...result }, corsHeaders);
    }
    if (path === "/api/data/send" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      if (!body.from || !body.to)
        return json({ error: "from and to required" }, corsHeaders, 400);
      const result = await dtnStoreMessage(env, {
        msg_id: body.msg_id || null,
        source_node: body.from,
        dest_node: body.to,
        payload: body.payload || "",
        msg_type: body.type || "text",
        hops: body.hops || 0,
        path: body.path || "",
        encrypted: body.encrypted || false,
        signature: body.signature || null,
        expires_at: body.expires_at || null
      });
      return json({
        success: result.ok,
        ...result,
        plane: "data",
        delivery: "store-and-forward",
        note: "Message stored. Will be delivered when destination node connects to a relay or gateway.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders);
    }
    if (path === "/api/data/receive" && method === "GET") {
      const url2 = new URL(request.url);
      const nodeId = url2.searchParams.get("node_id");
      if (!nodeId)
        return json({ error: "node_id required" }, corsHeaders, 400);
      const messages = await dtnGetPending(env, nodeId);
      return json({
        success: true,
        node_id: nodeId,
        message_count: messages.length,
        messages,
        plane: "data",
        note: "Messages retrieved. Call /api/dtn/deliver to confirm receipt.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, corsHeaders);
    }
    return json({ error: "Not found", service: "HNF v4.0.0", endpoints: ["GET /api/health", "GET /api/fabric", "GET /api/status", "GET /api/services", "GET /api/topology", "GET /api/connectivity", "GET /api/discover", "GET /api/nodes", "GET /api/telemetry", "GET /api/simulate", "GET /api/autopilot", "POST /api/route", "POST /api/relay-score", "POST /api/relay-chain", "POST /api/failover", "POST /api/register-node", "POST /api/ussd", "POST /api/identity", "POST /api/telemetry", "POST /api/route-score", "POST /api/simulate", "POST /api/autopilot", "POST /api/dtn/store", "GET /api/dtn/pending", "POST /api/dtn/deliver", "GET /api/dtn/stats", "GET /api/dtn/messages", "POST /api/identity/register", "GET /api/identity/verify", "POST /api/identity/revoke", "GET /api/control/events", "GET /api/transports", "POST /api/transports/status", "GET /api/gateway/info", "POST /api/gateway/register-mesh-node", "GET /api/gateway/aggregate", "POST /api/data/send", "GET /api/data/receive"] }, corsHeaders, 404);
  }
};
var DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f0f2f5">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="HARZ Fabric">
<link rel="manifest" href="/manifest.json">
<title>HARZ Network Fabric</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}
body{background:#f0f2f5;color:#1a1a2e;max-width:640px;margin:0 auto;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}
.hd{padding:20px;background:#0a7d3c;text-align:center;position:sticky;top:0;z-index:100;padding-top:max(20px,env(safe-area-inset-top))}
.hd h1{font-size:20px;font-weight:800;color:#1a1a2e}
.hd .sub{font-size:11px;color:rgba(255,255,255,0.7);margin-top:4px}
.hd .badge{display:inline-block;background:rgba(255,255,255,0.15);color:#1a1a2e;font-size:10px;padding:2px 8px;border-radius:10px;margin-top:6px}
.wrap{padding:12px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:16px}
.stat{background:#fffffffff;border-radius:12px;padding:10px 6px;text-align:center}
.stat .num{font-size:22px;font-weight:800;color:#0a7d3c}
.stat .num.red{color:#e74c3c}.stat .num.yel{color:#f39c12}
.stat .lbl{font-size:8px;color:#666666;margin-top:2px;text-transform:uppercase}
.tabs{display:flex;gap:4px;margin-bottom:12px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
.tab{padding:8px 12px;background:#fffffffff;border:none;border-radius:8px;color:#666666;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap}
.tab.active{background:#fffffffff;color:#1a1a2e}
.panel{display:none}.panel.active{display:block}
.card{background:#fffffffff;border-radius:12px;padding:14px;margin-bottom:8px}
.card h3{font-size:13px;color:#0a7d3c;margin-bottom:8px}
.card .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0fff;font-size:12px}
.card .row:last-child{border-bottom:none}
.card .row .k{color:#666666}.card .row .v{color:#1a1a2e;font-weight:600}
.svc{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fffffffff;border-radius:8px;margin-bottom:4px}
.svc .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:#666666}
.svc .dot.on{background:#0a7d3c;box-shadow:0 0 6px #0a7d3c}
.svc .dot.off{background:#e74c3c}
.svc .dot.auth{background:#f39c12}
.svc .dot.chk{background:#666666;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
.svc .info{flex:1}.svc .info .nm{font-size:12px;font-weight:600}.svc .info .rl{font-size:10px;color:#666666}
.svc .lat{font-size:9px;color:#666666;font-family:monospace}
.svc .ct{font-size:8px;background:#fffffffff;color:#666666;padding:2px 6px;border-radius:4px;text-transform:uppercase}
.tier{display:flex;align-items:center;gap:10px;padding:10px;background:#fffffffff;border-radius:10px;margin-bottom:6px}
.tier .info{flex:1}.tier .info .nm{font-size:13px;font-weight:600;color:#1a1a2e}
.tier .info .desc{font-size:10px;color:#666666}
.tier .pri{font-size:11px;background:#fffffffff;color:#1a1a2e;padding:2px 8px;border-radius:6px}
.arch{background:#f0f2f5;border-radius:8px;padding:14px;font-family:monospace;font-size:10px;line-height:1.6;overflow-x:auto;white-space:pre;color:#666666}
.arch .hl{color:#0a7d3c}
.btn{display:block;width:100%;padding:12px;background:#fffffffff;color:#1a1a2e;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;margin-top:8px}
.btn.sec{background:#fffffffff;color:#666666}
.section-title{font-size:11px;color:#666666;text-transform:uppercase;margin:12px 0 8px;font-weight:600}
.loading{text-align:center;padding:20px;color:#666666;font-size:12px}
ft{text-align:center;padding:16px;font-size:10px;color:#666666;display:block}
.bar{width:100%;height:6px;background:#fffffffff;border-radius:3px;overflow:hidden;margin-top:8px}
.bar .fill{height:100%;background:#0a7d3c;transition:width 0.5s}
.bar .fill.red{background:#e74c3c}.bar .fill.yel{background:#f39c12}
</style>
</head>
<body>
<div class="hd">
<h1>HARZ Network Fabric</h1>
<div class="sub">HARZ Global Network - Connectivity Intelligence</div>
<div class="badge">HNF v4.0.0</div>
</div>
<div class="wrap">
<div class="stats" id="stats">
<div class="stat"><div class="num" id="svcCount">--</div><div class="lbl">Services</div></div>
<div class="stat"><div class="num" id="onlineCount">--</div><div class="lbl">Online</div></div>
<div class="stat"><div class="num" id="tierCount">--</div><div class="lbl">Tiers</div></div>
<div class="stat"><div class="num" id="nodeCount">--</div><div class="lbl">Nodes</div></div>
</div>
<div class="tabs">
<button class="tab active" onclick="showTab(event,'live')">Live Status</button>
<button class="tab" onclick="showTab(event,'overview')">Overview</button>
<button class="tab" onclick="showTab(event,'topology')">Topology</button>
<button class="tab" onclick="showTab(event,'services')">Services</button>
<button class="tab" onclick="showTab(event,'connectivity')">Connectivity</button>
<button class="tab" onclick="showTab(event,'routing')">Routing</button>
<button class="tab" onclick="showTab(event,'identity')">Identity</button>
<button class="tab" onclick="showTab(event,'api')">API</button>
<button class="tab" onclick="showTab(event,'telemetry')">Telemetry</button>
<button class="tab" onclick="showTab(event,'intel')">Network Intel</button>
<button class="tab" onclick="showTab(event,'autopilot')">Autopilot</button>
</div>

<div id="live" class="panel active">
<div class="card">
<h3>Network Health (Live)</h3>
<div id="healthBar"><div class="loading">Initializing health checks...</div></div>
</div>
<div class="card">
<h3>Service Status (real-time pings)</h3>
<div id="liveServices"><div class="loading">Loading service list...</div></div>
</div>
<button class="btn" onclick="loadLiveStatus()">Re-check All Services</button>
</div>

<div id="overview" class="panel">
<div class="card"><h3>HGN Architecture</h3>
<div class="arch"><span class="hl">HARZ GLOBAL NETWORK (HGN)</span>
     |
<span class="hl">HARZ Network Fabric (HNF) v2.1</span>
Routing - Security - AI - Identity
     |
+----+----+----------+
|    |    |          |
Sat  Cell Internet
|    |    |          |
+----+----+----------+
     |
<span class="hl">HARZ EDGE</span>
Phones - Routers - VPS - IoT
     |
<span class="hl">USERS</span>
Call - Chat - AI - Pay</div></div>
<div class="card"><h3>Vision</h3>
<div style="font-size:12px;line-height:1.6;color:#1a1a2e">Make communication and computing available everywhere by intelligently combining satellite, cellular, Wi-Fi, device-to-device and edge networks.</div></div>
<div class="card"><h3>Structure</h3>
<div class="row"><span class="k">Network</span><span class="v">HARZ Global Network</span></div>
<div class="row"><span class="k">Fabric</span><span class="v">HARZ Network Fabric</span></div>
<div class="row"><span class="k">Edge</span><span class="v">HARZ Edge</span></div>
<div class="row"><span class="k">Consumer</span><span class="v">HARZ Connect</span></div>
<div class="row"><span class="k">Cloud</span><span class="v">HARZ Edge Cloud</span></div>
<div class="row"><span class="k">AI</span><span class="v">HARZ AI</span></div>
<div class="row"><span class="k">Identity</span><span class="v">Edge ID (Ed25519)</span></div>
<div class="row"><span class="k">Capabilities</span><span class="v">Health, Route, Relay, Identity</span></div>
</div></div>

<div id="topology" class="panel">
<div class="card"><h3>Core Layer (Cloud AI)</h3><div id="coreServices"><div class="loading">Loading...</div></div></div>
<div class="card"><h3>Gateway Layer</h3><div id="gatewayServices"><div class="loading">Loading...</div></div></div>
<div class="card"><h3>Edge Layer</h3><div id="edgeServices"><div class="loading">Loading...</div></div></div>
<div class="card"><h3>Carrier + Cellular</h3><div id="carrierServices"><div class="loading">Loading...</div></div></div>
</div>

<div id="services" class="panel">
<div class="card"><h3>All HGN Services</h3><div id="allServices"><div class="loading">Loading...</div></div></div>
</div>

<div id="connectivity" class="panel">
<div class="section-title">Connectivity Tiers (priority order)</div>
<div id="tiers"><div class="loading">Loading...</div></div>
<div class="section-title">Edge Node Types</div>
<div id="nodeTypes"><div class="loading">Loading...</div></div>
</div>

<div id="routing" class="panel">
<div class="card"><h3>Routing Algorithm</h3>
<div class="row"><span class="k">Algorithm</span><span class="v">Score-based</span></div>
<div class="row"><span class="k">Tier Weight</span><span class="v">30%</span></div>
<div class="row"><span class="k">Latency Weight</span><span class="v">30%</span></div>
<div class="row"><span class="k">Reliability Weight</span><span class="v">25%</span></div>
<div class="row"><span class="k">Cost Weight</span><span class="v">15%</span></div>
</div>
<div class="card"><h3>Relay Score Formula</h3>
<div class="row"><span class="k">Battery</span><span class="v">x0.25</span></div>
<div class="row"><span class="k">Signal</span><span class="v">x0.20</span></div>
<div class="row"><span class="k">Storage</span><span class="v">x0.10</span></div>
<div class="row"><span class="k">Connection</span><span class="v">x0.20</span></div>
<div class="row"><span class="k">Uptime</span><span class="v">x0.10</span></div>
<div class="row"><span class="k">Peers</span><span class="v">x0.15</span></div>
</div>
<button class="btn" onclick="testRoute()">Test Route Selection</button>
<div id="routeResult"></div>
</div>

<div id="identity" class="panel">
<div class="card"><h3>Edge ID System</h3>
<div class="row"><span class="k">Format</span><span class="v">harz://user/&lt;pubkey&gt;</span></div>
<div class="row"><span class="k">Node Format</span><span class="v">harz://node/&lt;id&gt;</span></div>
<div class="row"><span class="k">Crypto</span><span class="v">Ed25519</span></div>
<div class="row"><span class="k">Session Keys</span><span class="v">X25519 ECDH</span></div>
<div class="row"><span class="k">Encryption</span><span class="v">ChaCha20-Poly1305</span></div>
</div>
<div class="card"><h3>Trust Levels</h3>
<div class="row"><span class="k">Level 1</span><span class="v">Direct QR (highest)</span></div>
<div class="row"><span class="k">Level 2</span><span class="v">Verified SMS</span></div>
<div class="row"><span class="k">Level 3</span><span class="v">Mesh Vouch</span></div>
<div class="row"><span class="k">Level 4</span><span class="v">Unverified</span></div>
</div>
<button class="btn" onclick="testIdentity()">Create Test Identity</button>
<div id="identityResult"></div>
</div>

<div id="api" class="panel">
<div class="card"><h3>HNF API Endpoints</h3>
<div class="row"><span class="k">GET</span><span class="v">/api/health</span></div>
<div class="row"><span class="k">GET</span><span class="v">/api/fabric</span></div>
<div class="row"><span class="k">GET</span><span class="v">/api/status</span></div>
<div class="row"><span class="k">GET</span><span class="v">/api/services</span></div>
<div class="row"><span class="k">GET</span><span class="v">/api/topology</span></div>
<div class="row"><span class="k">GET</span><span class="v">/api/connectivity</span></div>
<div class="row"><span class="k">POST</span><span class="v">/api/route</span></div>
<div class="row"><span class="k">GET</span><span class="v" style="color:#0a7d3c">/api/discover</span></div>
<div class="row"><span class="k">POST</span><span class="v">/api/relay-score</span></div>
<div class="row"><span class="k">POST</span><span class="v" style="color:#0a7d3c">/api/relay-chain</span></div>
<div class="row"><span class="k">POST</span><span class="v" style="color:#0a7d3c">/api/failover</span></div>
<div class="row"><span class="k">POST</span><span class="v">/api/register-node</span></div>
<div class="row"><span class="k">POST</span><span class="v">/api/identity</span></div>
<div class="row"><span class="k">GET</span><span class="v" style="color:#0a7d3c">/api/telemetry</span></div>
<div class="row"><span class="k">POST</span><span class="v" style="color:#0a7d3c">/api/telemetry</span></div>
<div class="row"><span class="k">POST</span><span class="v" style="color:#0a7d3c">/api/route-score</span></div>
<div class="row"><span class="k">GET</span><span class="v" style="color:#0a7d3c">/api/simulate</span></div>
<div class="row"><span class="k">POST</span><span class="v" style="color:#0a7d3c">/api/simulate</span></div>
<div class="row"><span class="k">GET</span><span class="v" style="color:#0a7d3c">/api/autopilot</span></div>
<div class="row"><span class="k">POST</span><span class="v" style="color:#0a7d3c">/api/autopilot</span></div>
</div>
<div class="card"><h3>Try API</h3>
<button class="btn" onclick="callApi('/api/fabric')">GET /api/fabric</button>
<button class="btn sec" onclick="callApi('/api/topology')">GET /api/topology</button>
<button class="btn sec" onclick="callApi('/api/services')">GET /api/services</button>
<div id="apiResult" style="margin-top:10px;font-size:9px;font-family:monospace;white-space:pre-wrap;word-break:break-all;background:#f0f2f5;padding:10px;border-radius:8px;max-height:300px;overflow:auto;display:none"></div>
</div></div>

<div id="telemetry" class="panel">
<div class="card"><h3>Network Telemetry</h3>
<div id="teleStats" style="margin-bottom:12px"></div>
<button class="btn" onclick="loadTelemetry()">Refresh</button>
<button class="btn sec" onclick="loadTeleStats()">Stats</button>
<div id="teleList" style="margin-top:10px;max-height:400px;overflow:auto"></div>
</div>
</div>

<div id="intel" class="panel">
<div class="card"><h3>Route Score Calculator</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
<input id="rsRel" placeholder="reliability 0-1" value="0.95" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
<input id="rsSig" placeholder="signal 0-100" value="80" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
<input id="rsBat" placeholder="battery 0-100" value="75" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
<input id="rsLat" placeholder="latency ms" value="45" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
<input id="rsThr" placeholder="throughput Mbps" value="10" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
<input id="rsHop" placeholder="hop count" value="2" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
</div>
<button class="btn" onclick="calcRouteScore()">Calculate Score</button>
<div id="scoreResult" style="margin-top:10px;display:none"></div>
</div>
<div class="card"><h3>Network Simulator</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
<input id="simNodes" placeholder="node count" value="100" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
<input id="simFail" placeholder="failure rate 0-1" value="0.1" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
<input id="simMal" placeholder="malicious rate" value="0.05" style="background:#fffffffff;border:1px solid #f0f2f5;color:#1a1a2e;border-radius:6px;padding:6px;font-size:11px">
</div>
<button class="btn" onclick="runSim()">Run Simulation</button>
<button class="btn sec" onclick="runSim(1000)">1K Nodes</button>
<button class="btn sec" onclick="runSim(5000)">5K Nodes</button>
<div id="simResult" style="margin-top:10px;display:none"></div>
</div>
</div>

<div id="autopilot" class="panel">
<div class="card"><h3>Connectivity Autopilot</h3>
<p style="color:#666666;font-size:11px">The user doesn't choose the network. HNF auto-selects the best available path.</p>
<button class="btn" onclick="loadAutopilotDemo()">Run Demo (5G fails)</button>
<button class="btn sec" onclick="loadAutopilotCustom()">Custom</button>
<div id="autoResult" style="margin-top:10px;display:none"></div>
</div>
<div class="card"><h3>Transition Chain</h3>
<p style="color:#666666;font-size:11px">Priority order when paths fail:</p>
<div id="autoChain" style="font-size:12px;font-family:monospace"></div>
</div>
</div>

</div>
<ft>HARZ Digital Services | Network Fabric v4.0.0</ft>
<script>
function showTab(e,id){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));e.target.classList.add('active');document.getElementById(id).classList.add('active')}

let svcList=[];
async function init(){
try{
const r=await fetch('/api/fabric');const d=await r.json();
document.getElementById('svcCount').textContent=d.services;
document.getElementById('tierCount').textContent=d.connectivity_tiers;
document.getElementById('nodeCount').textContent=d.edge_node_types;
}catch(e){}
try{
const r=await fetch('/api/status');const d=await r.json();
svcList=d.services;
loadLiveStatus();
}catch(e){}
loadServices();loadTiers();loadTopology();loadTelemetry();
}

async function loadLiveStatus(){
if(!svcList.length)return;
const hb=document.getElementById('healthBar');
const ls=document.getElementById('liveServices');
hb.innerHTML='<div class="loading">Pinging '+svcList.length+' services from your browser...</div>';
let html='';
svcList.forEach(s=>{html+='<div class="svc" id="svc-'+s.id+'"><div class="dot chk"></div><div class="info"><div class="nm">'+s.name+'</div><div class="rl">'+s.role+'</div></div><div class="lat" id="lat-'+s.id+'">...</div><div class="ct">'+s.category+'</div></div>'});
ls.innerHTML=html;
let online=0,auth=0,err=0,off=0;
const checkSvc=async(s)=>{
const dot=document.querySelector('#svc-'+s.id+' .dot');
const lat=document.getElementById('lat-'+s.id);
try{
const start=performance.now();
const res=await fetch(s.health_url,{cache:'no-store'});
const elapsed=Math.round(performance.now()-start);
if(res.ok){dot.className='dot on';lat.textContent=elapsed+'ms';online++;}
else if(res.status===401){dot.className='dot auth';lat.textContent='AUTH';auth++;}
else{dot.className='dot off';lat.textContent=res.status;err++;}
}catch(e){dot.className='dot off';lat.textContent='OFF';off++;}
updateBar(online,auth,err,off);
};
// Check in batches of 5 to avoid overwhelming
const batchSize=5;
for(let i=0;i<svcList.length;i+=batchSize){
const batch=svcList.slice(i,i+batchSize);
await Promise.all(batch.map(checkSvc));
}
}

function updateBar(on,au,er,of){
const total=svcList.length;
const checked=on+au+er+of;
const pct=Math.round((on/total)*100);
const cls=pct>=80?'':(pct>=50?'yel':'red');
document.getElementById('onlineCount').textContent=on;
const hb=document.getElementById('healthBar');
hb.innerHTML='<div style="display:flex;justify-content:space-between;font-size:12px"><span>Health: '+pct+'%</span><span style="color:#666666">'+on+'/'+total+' online</span></div><div class="bar"><div class="fill '+cls+'" style="width:'+pct+'%"></div></div><div style="font-size:10px;color:#666666;margin-top:4px">Online: '+on+' | Auth: '+au+' | Errors: '+er+' | Offline: '+of+'</div>';
}

async function loadServices(){
try{
const r=await fetch('/api/services');const d=await r.json();
let html='';d.services.forEach(s=>{html+='<div class="svc"><div class="dot on"></div><div class="info"><div class="nm">'+s.name+'</div><div class="rl">'+s.role+'</div></div><div class="ct">'+s.category+'</div></div>'});
document.getElementById('allServices').innerHTML=html;
}catch(e){}
}

async function loadTiers(){
try{
const r=await fetch('/api/connectivity');const d=await r.json();
let th='';d.tiers.forEach(t=>{th+='<div class="tier"><div class="info"><div class="nm">'+t.name+'</div><div class="desc">'+t.latency+' - '+t.use_case+'</div></div><div class="pri">P'+t.priority+'</div></div>'});
document.getElementById('tiers').innerHTML=th;
const nt={phone:{name:'Edge Phone',relay:'temporary',range:'30-100m'},router:{name:'Edge Router',relay:'permanent',range:'100-500m'},tower:{name:'Edge Tower',relay:'permanent',range:'1-5km'},gateway:{name:'Edge Gateway',relay:'permanent',range:'regional'},satellite:{name:'Sat Gateway',relay:'permanent',range:'global'}};
let nh='';Object.entries(nt).forEach(([id,t])=>{nh+='<div class="tier"><div class="info"><div class="nm">'+t.name+'</div><div class="desc">Relay: '+t.relay+' - Range: '+t.range+'</div></div></div>'});
document.getElementById('nodeTypes').innerHTML=nh;
}catch(e){}
}

async function loadTopology(){
try{
const r=await fetch('/api/services');const d=await r.json();
const core=d.services.filter(s=>s.tier==='core');const gw=d.services.filter(s=>s.tier==='gateway');const edge=d.services.filter(s=>s.tier==='edge');const carrier=d.services.filter(s=>s.tier==='carrier'||s.tier==='cellular'||s.tier==='satellite');
const render=list=>list.map(s=>'<div class="svc"><div class="dot on"></div><div class="info"><div class="nm">'+s.name+'</div><div class="rl">'+s.role+'</div></div><div class="ct">'+s.tier+'</div></div>').join('');
document.getElementById('coreServices').innerHTML=render(core)||'<div style="color:#666666;font-size:12px">None</div>';
document.getElementById('gatewayServices').innerHTML=render(gw)||'<div style="color:#666666;font-size:12px">None</div>';
document.getElementById('edgeServices').innerHTML=render(edge)||'<div style="color:#666666;font-size:12px">None</div>';
document.getElementById('carrierServices').innerHTML=render(carrier)||'<div style="color:#666666;font-size:12px">None</div>';
}catch(e){}
}

async function loadTelemetry(){
try{
const r=await fetch('/api/telemetry?limit=20');const d=await r.json();
let html='<div style="font-size:11px;color:#666666">'+d.total+' records</div>';
d.records.forEach(t=>{
const cls=t.connection_type||'mesh';
html+='<div class="svc"><div class="dot on"></div><div class="info"><div class="nm">'+t.node_id+'</div><div class="rl">'+t.connection_type+' | lat='+t.latency+'ms | sig='+t.signal_strength+'% | bat='+t.battery_level+'% | hops='+t.hop_count+'</div></div><div class="ct">'+(t.failure_reason||'OK')+'</div></div>';
});
document.getElementById('teleList').innerHTML=html;
}catch(e){document.getElementById('teleList').innerHTML='<div style="color:#e74c3c">Error loading</div>';}
}
async function loadTeleStats(){
try{
const r=await fetch('/api/telemetry?stats=true');const d=await r.json();
const s=d.stats;
let html='<div class="card" style="background:#fffffffff"><div style="font-size:14px;font-weight:600;margin-bottom:8px">Telemetry Stats</div>';
html+='<div style="font-size:11px;color:#666666">Total: '+s.total_records+' | Last hour: '+s.last_hour+'</div>';
if(s.by_connection_type&&s.by_connection_type.length){
html+='<div style="margin-top:8px;font-size:11px">';
s.by_connection_type.forEach(t=>{html+='<div style="margin:4px 0">'+t.connection_type+': '+t.count+' nodes, avg lat='+Math.round(t.avg_latency||0)+'ms, sig='+Math.round(t.avg_signal||0)+'%, bat='+Math.round(t.avg_battery||0)+'%</div>';});
html+='</div>';}
if(s.failure_summary&&s.failure_summary.length){
html+='<div style="margin-top:8px;font-size:11px;color:#e74c3c">Failures:';
s.failure_summary.forEach(f=>{html+='<div>'+f.failure_reason+' x'+f.count+'</div>';});
html+='</div>';}
html+='</div>';
document.getElementById('teleStats').innerHTML=html;
}catch(e){}
}
async function calcRouteScore(){
try{
const body={reliability:parseFloat(document.getElementById('rsRel').value),signal_strength:parseFloat(document.getElementById('rsSig').value),battery_level:parseFloat(document.getElementById('rsBat').value),latency:parseFloat(document.getElementById('rsLat').value),throughput:parseFloat(document.getElementById('rsThr').value),hop_count:parseInt(document.getElementById('rsHop').value)};
const r=await fetch('/api/route-score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const d=await r.json();
const color=d.rating==='excellent'?'#0a7d3c':d.rating==='good'?'#0a7d3c':d.rating==='fair'?'#f39c12':'#e74c3c';
let html='<div class="card" style="background:#fffffffff"><div style="font-size:24px;font-weight:700;color:'+color+'">'+d.route_score+'/100</div><div style="font-size:12px;color:'+color+';text-transform:uppercase">'+d.rating+'</div>';
html+='<div style="margin-top:10px;font-size:11px">';
Object.entries(d.components).forEach(([k,v])=>{html+='<div style="display:flex;justify-content:space-between;margin:2px 0"><span>'+k.replace(/_/g,' ')+'</span><span>'+v+'</span></div>';});
html+='</div></div>';
document.getElementById('scoreResult').innerHTML=html;
document.getElementById('scoreResult').style.display='block';
}catch(e){document.getElementById('scoreResult').innerHTML='<div style="color:#e74c3c">Error</div>';document.getElementById('scoreResult').style.display='block';}
}
async function runSim(n){
try{
const nodes=n||parseInt(document.getElementById('simNodes').value)||100;
const fail=parseFloat(document.getElementById('simFail').value)||0.1;
const mal=parseFloat(document.getElementById('simMal').value)||0.05;
const r=await fetch('/api/simulate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({node_count:nodes,failure_rate:fail,malicious_rate:mal,test_failover:true,test_partitions:true})});
const d=await r.json();
const s=d.summary;
const color=s.network_health==='healthy'?'#0a7d3c':s.network_health==='degraded'?'#f39c12':'#e74c3c';
let html='<div class="card" style="background:#fffffffff"><div style="font-size:16px;font-weight:600">'+nodes+' Nodes \u2014 <span style="color:'+color+'">'+s.network_health.toUpperCase()+'</span></div>';
html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;font-size:11px">';
html+='<div>Online: '+s.online+'</div><div>Offline: '+s.offline+'</div>';
html+='<div>Relays: '+s.eligible_relays+'</div><div>Malicious: '+s.malicious_detected+'</div>';
html+='<div>Avg Score: '+s.avg_route_score+'/100</div><div>Avg Latency: '+s.avg_latency_ms+'ms</div>';
html+='<div>Avg Battery: '+s.avg_battery_pct+'%</div><div>Avg Hops: '+s.avg_hop_count+'</div>';
html+='</div>';
if(d.failure_scenarios&&d.failure_scenarios.length){
html+='<div style="margin-top:10px;font-size:11px;color:#666666">Failover tests: '+d.failure_scenarios.length+'</div>';
d.failure_scenarios.forEach(f=>{const ba=f.best_alternative||{};html+='<div style="font-size:10px;margin:2px 0">'+f.failed_node+' ('+f.failed_type+') -> alt: '+(ba.id||'none')+' score='+(ba.route_score||'?')+' recovery='+(f.recovery_time_ms||'?')+'ms</div>';});}
if(d.partitions&&d.partitions.length){
d.partitions.forEach(p=>{html+='<div style="margin-top:8px;font-size:11px">Partition: removed '+p.nodes_removed+', remaining '+p.nodes_remaining+', intact: '+p.network_intact+'</div>';});}
html+='</div>';
document.getElementById('simResult').innerHTML=html;
document.getElementById('simResult').style.display='block';
}catch(e){document.getElementById('simResult').innerHTML='<div style="color:#e74c3c">Error</div>';document.getElementById('simResult').style.display='block';}
}
async function loadAutopilotDemo(){
try{
const r=await fetch('/api/autopilot');const d=await r.json();
renderAutopilot(d);
}catch(e){}
}
async function loadAutopilotCustom(){
try{
const r=await fetch('/api/autopilot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({available_paths:['5g','wifi','cellular','mesh','satellite'],current_path:'5g',switch_threshold:10})});
const d=await r.json();
renderAutopilot(d);
}catch(e){}
}
function renderAutopilot(d){
const color=d.should_switch?'#0a7d3c':'#666666';
let html='<div class="card" style="background:#fffffffff"><div style="font-size:16px;font-weight:600;color:'+color+'">Selected: '+d.selected_path+' ('+d.selected_score+'/100)</div>';
html+='<div style="font-size:11px;color:#666666;margin-top:4px">'+d.switch_reason+'</div>';
html+='<div style="margin-top:10px;font-size:11px">All paths ranked:</div>';
d.all_paths_ranked.forEach((p,i)=>{const c=i===0?'#0a7d3c':'#666666';html+='<div style="display:flex;justify-content:space-between;margin:4px 0;color:'+c+'"><span>'+(i+1)+'. '+p.path+'</span><span>score='+p.route_score+' lat='+p.latency+'ms</span></div>';});
html+='</div>';
document.getElementById('autoResult').innerHTML=html;
document.getElementById('autoResult').style.display='block';
if(d.transition_chain){document.getElementById('autoChain').innerHTML=d.transition_chain.join(' -> ');}}

async function callApi(path){
const el=document.getElementById('apiResult');el.style.display='block';el.textContent='Loading...';
try{const r=await fetch(path);const d=await r.json();el.textContent=JSON.stringify(d,null,2)}catch(e){el.textContent=e.toString()}
}

async function testRoute(){
const paths=[{tier:'internet',latency:30,reliability:0.95,cost:0.3,priority:3},{tier:'cellular',latency:100,reliability:0.85,cost:0.5,priority:4},{tier:'mesh',latency:50,reliability:0.7,cost:0,priority:1},{tier:'satellite',latency:800,reliability:0.9,cost:0.9,priority:5}];
try{const r=await fetch('/api/route',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:'user',destination:'server',type:'voice',available_paths:paths})});const d=await r.json();
document.getElementById('routeResult').innerHTML='<div class="card"><h3>Selected: '+d.selected_path.tier+'</h3><div class="row"><span class="k">Score</span><span class="v">'+d.score+'</span></div><div class="row"><span class="k">Latency</span><span class="v">'+d.selected_path.latency+'ms</span></div><div class="row"><span class="k">Reliability</span><span class="v">'+(d.selected_path.reliability*100)+'%</span></div></div>'}catch(e){}
}

async function testIdentity(){
try{const r=await fetch('/api/identity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:'test-user-001',phone:'08030000000',username:'harz_user',trustLevel:'unverified'})});const d=await r.json();
document.getElementById('identityResult').innerHTML='<div class="card"><h3>Edge ID Created</h3><div class="row"><span class="k">Edge ID</span><span class="v">'+d.edge_id+'</span></div><div class="row"><span class="k">Trust Level</span><span class="v">'+d.trust_level+'</span></div><div class="row"><span class="k">Created</span><span class="v">'+d.created_at+'</span></div></div>'}catch(e){}
}

if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js');
init();
<\/script>
</body>
</html>`;
export {
  hnf_merged_default as default
};
//# sourceMappingURL=hnf-merged.js.map

