# On-chain receipts: indexed treasury inflows for DeFi United

**Status**: approved 2026-04-27
**Owner**: frank@powerhouse.inc
**Related**: `processors/onchain-receipt-watcher`, `document-models/onchain-receipt`, `subgraphs/public-campaign`

## Goal

Surface real on-chain treasury inflows on https://defiunited.w3b.li with two layered views:

1. **Audit trail** — every accepted token transfer to a campaign's treasury is recorded as an `OnchainReceipt` document with the tx hash, block number, sender, asset, raw amount, and an ETH-equivalent valuation. The subgraph sums these for the canonical `totalReceived`.
2. **Instant overlay** — a live `balanceOf` snapshot of the treasury (per accepted token + native ETH) is exposed as `onchainLiveBalance`, expressed in ETH-equivalent. The frontend displays `totalReceived + (liveBalance − totalReceived)` so the headline counter ticks the moment a deposit lands, then settles cleanly into the audit trail when the next poll cycle records the receipt.

## Non-goals

- rsETH is **not** an accepted asset — it's the affected asset whose recovery the campaign supports. Treasury collects ETH + USDC + USDT + DAI on mainnet only.
- No multi-chain / no L2s in this iteration. Schema is chain-aware so it doesn't paint us into a corner.
- No automatic pledge↔receipt reconciliation changes (existing `pledge-reconciliation` processor stays as-is).
- No campaign-doc model migration. Whitelist lives in the processor as a constant; lifting it onto `Campaign.acceptedAssets[]` is a follow-up.

## Architecture

```
                                 Alchemy mainnet RPC
                                          ▲
                                          │ alchemy_getAssetTransfers
                                          │ eth_call balanceOf / eth_getBalance
                                          │ eth_call Chainlink ETH/USD
                                          │
   ┌──────────────────────────────────────┴──────────────────────────────────┐
   │                          Switchboard (Reactor)                          │
   │                                                                         │
   │  ┌─────────────────────────────┐         ┌────────────────────────────┐ │
   │  │ Processor                   │         │ Subgraph                   │ │
   │  │ onchain-receipt-watcher     │ dispatch│ public-campaign            │ │
   │  │                             │ ─────►  │                            │ │
   │  │ - poll every 12s            │         │ totalReceived = Σ receipts │ │
   │  │ - alchemy_getAssetTransfers │         │ onchainLiveBalance = live  │ │
   │  │ - confirmation depth = 6    │         │ pendingReceipts = diff     │ │
   │  │ - idempotency by tx+logIdx  │         │ recentReceipts(limit)      │ │
   │  │ - record ethEquivalent at   │         │                            │ │
   │  │   block (Chainlink price)   │         │ live balance call cached   │ │
   │  │ - dispatch recordReceipt    │         │ 5s in resolver memory      │ │
   │  └─────────────┬───────────────┘         └────────────────────────────┘ │
   │                │                                                        │
   │                ▼                                                        │
   │  ┌──────────────────────────────────────────────────────────────────┐   │
   │  │ Document drive: defi-united                                      │   │
   │  │   - ReliefCampaign (rseth-2026-04)                               │   │
   │  │   - Pledge × N                                                   │   │
   │  │   - OnchainReceipt × N (← processor writes here)                 │   │
   │  │   - StatusUpdate × N                                             │   │
   │  └──────────────────────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────────────────────┘
                                          ▲
                                          │ GraphQL (poll 5s)
                                          │
                                  Frontend (Next.js)
                                  - hero counter tweens to
                                    totalReceived + pendingReceipts
                                  - live ticker = recentReceipts
                                  - per-tx Etherscan links
```

## Components

### 1. Whitelist (mainnet, hardcoded)

```ts
const ACCEPTED_ASSETS = [
  { kind: "native", symbol: "ETH",  decimals: 18, contract: null },
  { kind: "erc20",  symbol: "USDC", decimals: 6,  contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { kind: "erc20",  symbol: "USDT", decimals: 6,  contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { kind: "erc20",  symbol: "DAI",  decimals: 18, contract: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
];
```

### 2. `onchain-receipt` document model — additive schema bump

New state fields:
- `ethEquivalentAmount: Amount_Tokens` — the receipt's value in ETH at the block time. ETH = `amount`; stables = `amount × ethPerUsd`. 18-decimal precision, stored as decimal string to avoid Number truncation.
- `ethPriceUsdAtReceipt: Float` — Chainlink mid at the block; pinned at record time so the audit trail never re-prices history.

New action:
- `markReorged` — sets `reconciliationStatus = "REORGED"`. Required input: `_: Boolean` (empty-input workaround). Used if a confirmed receipt later turns out to have been on a forked chain.

`RecordReceiptInput` gains `ethEquivalentAmount: Amount_Tokens!` and `ethPriceUsdAtReceipt: Float!`. The reducer copies them into state.

### 3. Processor — `onchain-receipt-watcher` rewrite

- Replace raw `eth_getLogs` with `alchemy_getAssetTransfers` (`category: ["external", "erc20"]`, `toAddress: <treasury>`, `contractAddresses: <whitelist erc20 contracts>`). Single call returns native ETH + the four whitelist tokens with `value` in token units, `asset` symbol, and `metadata.blockTimestamp`.
- Confirmation gating: only process transfers where `blockNum <= currentBlock - 6`.
- Idempotency: composite key `(chainId, txHash, logIndex)`. Persisted to a small in-memory `Set` for the processor lifetime; on cold start, seed the set from existing receipts in the drive (one-time scan via `reactorClient.find`).
- Price oracle: Chainlink ETH/USD feed at `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`, `latestAnswer()` (8 decimals). Cached 60s. On failure, fall back to a sane default ($2200/ETH for the demo, env-overridable) and log a warning.
- ETH-equivalent calculation per receipt:
  - ETH/native: `ethEquivalent = amount`
  - Stable: `ethEquivalent = amount × (1 / ethPriceUsd)` (treats USDC/USDT/DAI as $1 stables)
- Env vars (replaces `DEFI_UNITED_RPC_URL_1`):
  - `DEFI_UNITED_ALCHEMY_URL_1` — full Alchemy mainnet URL (with key)
  - `DEFI_UNITED_BLOCK_POLL_INTERVAL_MS` — default 12000
  - `DEFI_UNITED_RECEIPT_CONFIRMATIONS` — default 6
  - `DEFI_UNITED_ETH_USD_PRICE_FALLBACK` — default 2200
- Existing bugs to fix in the same pass:
  - `Number(amountWei)` precision loss → use `bigint` + decimal string serialization
  - Hardcoded `symbol: "UNKNOWN"` for non-ETH → comes from Alchemy directly
  - `blockTimestamp: new Date().toISOString()` → use Alchemy's `metadata.blockTimestamp`

### 4. Subgraph — `public-campaign` projection updates

Schema additions (additive, won't break existing clients):

```graphql
type DefiUnited_PublicCampaign {
    # ...existing fields...
    onchainLiveBalance: DefiUnited_OnchainLiveBalance
    pendingReceiptsEthEquivalent: String
    recentReceipts(limit: Int = 20): [DefiUnited_PublicReceiptEntry!]!
}

type DefiUnited_OnchainLiveBalance {
    totalEthEquivalent: String!
    perAsset: [DefiUnited_OnchainAssetBalance!]!
    fetchedAt: String!
}

type DefiUnited_OnchainAssetBalance {
    symbol: String!
    contractAddress: String  # null for native ETH
    rawBalance: String!      # base units, big-int string
    formattedAmount: String! # token units, decimal string
    ethEquivalent: String!
}

type DefiUnited_PublicReceiptEntry {
    txHash: String!
    blockNumber: Int!
    blockTimestamp: String!
    fromAddress: String!
    toAddress: String!
    assetSymbol: String!
    amount: String!
    ethEquivalentAmount: String!
    reconciliationStatus: String!
    matchedPledgeId: String
}
```

Projection logic:
- `totalReceived` = `Σ receipts.ethEquivalentAmount` where `reconciliationStatus != "REORGED"`. (Was `Σ pledges.receivedAmount`.)
- `recentReceipts(limit)` = receipts sorted by `blockNumber desc`, sliced.
- `onchainLiveBalance` = resolver-side fetch:
  - `eth_getBalance(treasury)` for native
  - `eth_call balanceOf(treasury)` for each whitelist ERC-20 (batched as JSON-RPC array)
  - convert each to ETH-equivalent using the same Chainlink mid (cached 5s for the resolver)
  - sum into `totalEthEquivalent`
  - errors degrade to `null` (frontend hides the overlay)
- `pendingReceiptsEthEquivalent` = `max(0, onchainLiveBalance.totalEthEquivalent - totalReceived)`. Negative or zero → `"0"`.
- Live-balance fetch is wrapped in a 5-second per-treasury cache to avoid hammering Alchemy on every GraphQL request (current frontend polls 5s).

Subscription `DefiUnited_campaignUpdated` already re-projects on document change — receipts will trigger it for free.

### 5. Frontend (`defiunited-web`)

- Extend `GET_CAMPAIGN` query to request `onchainLiveBalance.totalEthEquivalent`, `pendingReceiptsEthEquivalent`, and `recentReceipts(limit: 20)`. Regenerate codegen.
- Hero `BigStat` "Received":
  - `valueNum` = `totalReceived + pendingReceiptsEthEquivalent` (numeric sum).
  - `AnimatedNumber` already tweens; tighten the duration when the value jumps.
  - Add a small "+ X.XX ETH inbound" pill below the value when `pendingReceiptsEthEquivalent > 0`, fading out when it returns to 0.
- Live ticker reads `recentReceipts` (real tx data) instead of synthesizing from pledges. Each row = avatar + truncated `fromAddress` + amount + `assetSymbol` + Etherscan link.
- `offline-fallback.ts` gains stub values for the new fields so SSR still renders.

### 6. Tenant deployment

- `defi-united-package`: bump `package.json` from `1.0.0` → `1.1.0` (minor: schema additions). Build + `ph publish --registry registry.dev.vetra.io`.
- `powerhouse-k8s-hosting/tenants/defiunited/powerhouse-values.yaml`:
  - `switchboard.env.DEFI_UNITED_ALCHEMY_URL_1`: `https://eth-mainnet.g.alchemy.com/v2/ciF5O4ndE0ByUaUuvw8Rd`
  - Bump `PH_REGISTRY_PACKAGES` to `defi-united-package@1.1.0`
- ArgoCD picks up the values change and rolls switchboard.

## Data flow walkthroughs

### Tx confirmed → headline counter ticks

1. Donor sends 5 ETH to treasury. Tx confirms in block N.
2. Within ≤5s the next frontend poll fires; resolver fetches `onchainLiveBalance` → reports `totalEthEquivalent` jumped by ~5 ETH.
3. `pendingReceiptsEthEquivalent` = 5; counter on the hero bumps from `T` → `T + 5` smoothly via `AnimatedNumber`.
4. ~72s later (block N+6) the processor's next poll picks up the transfer, dispatches `recordReceipt` with `ethEquivalentAmount: 5.0` and `ethPriceUsdAtReceipt: <price@blockN>`.
5. Drive subscription fires `DefiUnited_campaignUpdated`; `totalReceived` is now `T + 5`; `pendingReceiptsEthEquivalent` settles back to 0. Counter doesn't re-animate (same value); the inbound pill fades out.
6. The live ticker grows by one row with the new tx hash; clicking opens Etherscan.

### Tx confirmed → reorged out

1. Receipt recorded at block N (6 confirmations deep at the time).
2. A deeper reorg later moves the tx to a fork. Out of scope for automatic detection in this iteration; if it ever happens, an operator runs `markReorged` via Connect on the affected receipt. `totalReceived` recomputes excluding it on the next subgraph re-projection.

## Error handling

- **Alchemy outage** in processor: poll cycle logs error and skips; no receipts dispatched. Idempotency set retained in memory; next successful cycle catches up via the scan window.
- **Alchemy outage** in subgraph live-balance resolver: returns `null` for `onchainLiveBalance`; frontend hides the inbound pill and renders the audit-trail-only counter. No 500.
- **Chainlink call fails**: processor uses `DEFI_UNITED_ETH_USD_PRICE_FALLBACK`. Logged as warning. The price is pinned at receipt time so future price feed health does not affect already-recorded receipts.
- **Unknown contract address in transfer**: filtered out at the Alchemy query level (whitelist contractAddresses), so should not occur. If it does (Alchemy bug), processor logs and skips.
- **Idempotency cold start**: on processor boot, `reactorClient.find({ type: ONCHAIN_RECEIPT_TYPE })` seeds the seen set with existing `(chainId, txHash, logIndex)` tuples.

## Testing

- **Processor unit tests** (existing test file gets expanded):
  - `alchemy_getAssetTransfers` response → correct `recordReceipt` actions emitted
  - Confirmation depth respected (transfer at block N rejected when current=N+5)
  - Idempotency: same `(chainId, txHash, logIndex)` doesn't double-emit
  - Native ETH path produces `ethEquivalent = amount`; stables produce `amount / ethPriceUsd`
  - Chainlink failure → fallback price used + warning logged
- **Subgraph projection unit tests**:
  - `totalReceived` excludes `REORGED` receipts
  - `pendingReceiptsEthEquivalent` clamps to 0 when liveBalance < totalReceived
  - `recentReceipts` ordering + limit
- **Receipt model reducer test**:
  - `markReorged` sets `reconciliationStatus = "REORGED"` and is idempotent

End-to-end smoke against the production Alchemy URL is acceptable for the demo path — we don't need a local Anvil. After deploy, send a test 0.001 ETH to the treasury, watch the headline counter tick, watch the receipt arrive ≈1 minute later in the live ticker, click through to Etherscan.

## Sequencing

1. Schema bump on `onchain-receipt` (state fields + `markReorged` action) — via MCP-driven document model edits + manual reducer in `src/`.
2. Processor rewrite — single PR.
3. Subgraph projection + new fields — same PR or follow-up.
4. Frontend query + hero/ticker wiring — `defiunited-web`.
5. Publish package + tenant values bump + push.
