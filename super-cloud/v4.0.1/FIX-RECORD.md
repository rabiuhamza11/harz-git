# Super Cloud v4.0.1 — Registry Catalog Fix (Oct 2, 2026)

## Verified problems (Magani, three-level audit, Oct 2)
1. /api/services omitted health_url and account for all services — client-side health pings (the dashboard's real map) had nothing to ping for 40 flagship entries.
2. 5 services live in the deployed registry but missing from the source catalog: harz-dialweb, harz-ioc-a1, harz-mesh-lab-a1, harz-omninet-a1, harz-packet-a1 (source was 79 entries vs live 84).
3. Server-side /api/discover marks harz.workers.dev flagships OFFLINE while they are live (all return 200 root + /api/health from external probes: harz-crypto-wallet, harzpay, harz-swap, harz-exchange, harz-chain-v2, harz-gateway, harz-realestate). Suspected cause: Worker-to-Worker fetch behavior on the same account's workers.dev domains + 84 subrequests vs free-plan limits. Client-side pings with correct health_urls are the honest map; server-side discover needs live diagnosis post-deploy.

## What this source changes
- Catalog restored to 84 entries (5 additions with registry metadata, account fields included).
- /api/services now returns account (default 2) + health_url (baseUrl + "/api/health") for every service.
- No other behavior touched. HNF v4.0.0 handlers, routing, DTN, identity, all unchanged.

## Deploy
DEPLOY GATED on owner approval + working Cloudflare token (all stored tokens rejected live Oct 2). Deploy target: super-cloud worker. Deploy via the harz-deploy-gate. After deploy, verify: /api/services returns health_url on all 84, dashboard health scan, browser test per standing audit rule.

## Consolidation note (per owner phase order)
harz-super-cloud (81 services, drifted duplicate) should redirect to this registry once this source is deployed. This file is the surviving source of truth.
