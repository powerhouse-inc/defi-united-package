# DeFi United — Coordinated Relief Toolkit

Operational toolkit for coordinated DeFi relief / crisis response coalitions, built as a [Powerhouse](https://powerhouse.inc) Reactor package.

The first instance is **DeFi United** ([defiunited.world](https://defiunited.world/)), responding to the April 2026 rsETH incident. The document models, editors, processors, and subgraphs are designed to support any future incident-response coalition.

> **Live demo**: [defiunited.web3.berlin](https://defiunited.web3.berlin) — staging tenant runs the latest release with on-chain indexing wired against Ethereum mainnet.

## What this package gives you

A turn-key data layer for running a public, verifiable, multi-DAO relief coalition. Publish to a Powerhouse registry, point a Switchboard tenant at it via `PH_REGISTRY_PACKAGES=defi-united-package@1.1.6`, and the tenant exposes:

- **Document models** for every operational artifact a coalition needs (campaigns, pledges, on-chain receipts, dependencies, distribution plans, status updates, contributor profiles)
- **An on-chain indexer** that polls Alchemy for inbound transfers to the campaign treasury and records them as receipt documents
- **A live-balance overlay** showing the actual mainnet balance of the treasury (native ETH + USDC + USDT + DAI) priced in ETH-equivalent via Chainlink
- **A public GraphQL API** for the campaign landing page — totals, contributors, dependencies, status updates, last 25 inbound txs (with reverse-resolved ENS names) — designed for embedding
- **An operations subgraph** gated by Renown DID bearer tokens for operator mutations
- **A drive-level editor** (`campaign-operations`) that walks the operator through the full incident lifecycle in Connect

## Architecture at a glance

```
                         Ethereum mainnet
                                ▲
                                │ alchemy_getAssetTransfers
                                │ eth_call balanceOf / Chainlink ETH/USD
                                │ ENS Universal Resolver (reverse names)
                                │
   ┌────────────────────────────┴─────────────────────────────────┐
   │                       Switchboard                            │
   │                                                              │
   │  ┌───────────────────────┐   ┌──────────────────────────┐    │
   │  │ Processor             │   │ Subgraph                 │    │
   │  │ onchain-receipt-      │   │ public-campaign          │    │
   │  │ watcher               │ ─►│                          │    │
   │  │                       │   │ totalReceived =          │    │
   │  │ poll Alchemy → record │   │   Σ receipts             │    │
   │  │ receipts on the drive │   │ onchainLiveBalance =     │    │
   │  │                       │   │   live balanceOf overlay │    │
   │  │ Chainlink-priced      │   │ recentOnchainTransfers = │    │
   │  │ at block time         │   │   real Alchemy feed      │    │
   │  └───────────┬───────────┘   │   (ENS-resolved senders) │    │
   │              ▼               └──────────────────────────┘    │
   │   ┌──────────────────────────────────────────────────────┐   │
   │   │ Document drive                                       │   │
   │   │   ReliefCampaign × 1                                 │   │
   │   │   Pledge × N (incl. GOVERNANCE_PENDING ratifications)│   │
   │   │   OnchainReceipt × N (ETH-equivalent valued)         │   │
   │   │   ExternalDependency × N (operational blockers)      │   │
   │   │   DistributionPlan, StatusUpdate, ContributorProfile │   │
   │   └──────────────────────────────────────────────────────┘   │
   └──────────────────────────────────────────────────────────────┘
                                ▲
                                │ GraphQL (poll 5s)
                                │
                         Frontend (defiunited-web)
                         Counter ticks instantly via the live
                         overlay; settles into the audit trail
                         when the processor records the receipt.
```

## Document models

Seven first-class document types covering the full operational loop.

| Model | Purpose |
|---|---|
| `defi-united/relief-campaign` | Master document per relief effort. Status, target, contribution addresses, operator wallets. |
| `defi-united/pledge` | A contributor's commitment with full lifecycle: `PROPOSED → GOVERNANCE_PENDING → CONFIRMED → RECEIVED` (or `CANCELLED` / `FAILED`). Tracks governance proposal links. |
| `defi-united/contributor-profile` | Reusable cross-campaign profile for an org or individual. Wallet registry + governance endpoints + trust level. |
| `defi-united/external-dependency` | Non-pledge blocker (operational, council, on-chain tx). Pledge ratifications live on the pledges themselves — dependencies are reserved for everything else. |
| `defi-united/onchain-receipt` | Inbound transfer to the treasury. Carries `amount` in token units, `ethEquivalentAmount` priced at block time, `ethPriceUsdAtReceipt` for the audit trail, and a `MARK_REORGED` action for safety. |
| `defi-united/distribution-plan` | Recovery payout plan: methodology, recipients, allocations, on-chain settlement status. |
| `defi-united/status-update` | Public or operator-only updates with optional metrics snapshot and external announcement links. |

All models are pure-reducer (deterministic, no `Date.now()` / `Math.random()`), with named errors stored in `operations[i].error`. ~130 behaviour tests cover happy paths, state-machine transitions, and every named error.

## On-chain indexing

The `onchain-receipt-watcher` processor connects each Switchboard instance to mainnet:

- Single Alchemy URL via `DEFI_UNITED_ALCHEMY_URL_1`
- Polls `alchemy_getAssetTransfers` (one call covers both native ETH and ERC-20s) every 12s by default
- Whitelist: ETH + USDC + USDT + DAI on Ethereum mainnet (configurable in `processors/onchain-receipt-watcher/index.ts`)
- 6-confirmation depth before recording (configurable via `DEFI_UNITED_RECEIPT_CONFIRMATIONS`)
- Each receipt is priced in ETH-equivalent at block time using the Chainlink ETH/USD feed (`0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`), cached 60s in-process
- Idempotency via `(chainId, txHash, uniqueId)` keys; cold-start seeds the seen-set from existing receipts on the drive
- Failure handling: Chainlink read fails → fall back to `DEFI_UNITED_ETH_USD_PRICE_FALLBACK`; Alchemy outage → poll cycle skips, retry next interval

The `public-campaign` subgraph layers a live overlay on top:

- `onchainLiveBalance` — `balanceOf(treasury)` per whitelist token + native ETH, summed in ETH-equivalent, cached 5s
- `pendingReceiptsEthEquivalent` — `max(0, liveBalance - totalReceived)` so the headline counter ticks the moment a tx confirms while the audit trail catches up
- `recentOnchainTransfers(limit)` — last N actual inbound txs from Alchemy, ordered newest-first, sender ENS names reverse-resolved via the Universal Resolver (`0xce01...F67`), cached 24h
- `recentReceipts(limit)` — document-derived audit trail (excludes `REORGED`)

## Subgraphs

| Endpoint | Auth | Purpose |
|---|---|---|
| `/graphql/defi-united-public-campaign` | None | Public read API for the landing page. `DefiUnited_campaign(slug)`, `DefiUnited_campaigns(status)`. Excludes archived campaigns by default. Suitable for embedding. |
| `/graphql/defi-united-contributor-registry` | None | Cross-campaign discovery; per-contributor history of campaigns they participated in. |
| `/graphql/defi-united-operations` | Renown DID bearer | Operator mutations: `markPledgeConfirmed`, `cancelPledge`, `resolveDependency`, `publishStatusUpdate`, `attachReceiptToPledge`. The recovered wallet must be in `campaign.operatorWallets`. |

Auth pattern: client mints `renown.getBearerToken({ expiresIn: 600 })` and sends `Authorization: Bearer <jwt>`. Do **not** pass `aud` when minting — the verifier rejects tokens with an unconfigured audience.

## Editors

A separate React component per document type (`pledge-editor`, `relief-campaign-editor`, etc.), plus a top-level **`campaign-operations`** drive editor that walks the operator through the full incident lifecycle:

1. Set up the campaign (target, treasury address, affected asset)
2. Track pledges + ratify governance
3. Manage external dependencies
4. Watch receipts arrive (auto-recorded by the processor)
5. Publish status updates
6. Approve + execute the distribution plan

## Companion frontend

A separate Next.js app at [`../defiunited-web`](../defiunited-web) provides the public-facing dashboard modelled on the defiunited.world page, driven entirely by these subgraphs.

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `DEFI_UNITED_ALCHEMY_URL_1` | — | Mainnet Alchemy URL. Required for on-chain indexing + live overlay. |
| `DEFI_UNITED_BLOCK_POLL_INTERVAL_MS` | `12000` | Processor poll cadence (ms). |
| `DEFI_UNITED_RECEIPT_CONFIRMATIONS` | `6` | Confirmation depth before recording a receipt. |
| `DEFI_UNITED_ETH_USD_PRICE_FALLBACK` | `2200` | USD/ETH used if the Chainlink read fails. |

## Quick start

```bash
pnpm install
pnpm vetra              # opens Vetra Studio (Connect on :3001, Switchboard on :4001)
```

Visit [http://localhost:3001](http://localhost:3001) and create a campaign drive in the `campaign-operations` editor.

Verify the public subgraph is live:

```bash
curl -s http://localhost:4001/graphql/defi-united-public-campaign \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ DefiUnited_campaign(slug: \"rseth-2026-04\") { name totalPledged totalReceived percentReceived onchainLiveBalance { totalEthEquivalent } recentOnchainTransfers(limit: 5) { txHash fromEnsName amount } } }"}'
```

## Quality gates

```bash
pnpm tsc                # typescript check
pnpm lint:fix           # eslint
pnpm test               # vitest run (~130 tests across reducers + projections + processor)
```

## Publishing

```bash
pnpm exec ph-cli build
pnpm exec ph-cli publish --registry https://registry.dev.vetra.io
```

A Switchboard tenant then picks it up via `PH_REGISTRY_PACKAGES=defi-united-package@x.y.z`.

## License

AGPL-3.0-only.
