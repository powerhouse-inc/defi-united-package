/**
 * Onchain Receipt Watcher Processor
 *
 * Polls Alchemy's enhanced `getAssetTransfers` API for inbound transfers
 * (native ETH + whitelisted stablecoins) to active relief-campaign
 * contribution addresses, prices each one in ETH at the time of the block
 * via the Chainlink ETH/USD feed, and dispatches a `RECORD_RECEIPT`
 * action per transfer.
 *
 * Architecture:
 *   - Registers against `defi-united/relief-campaign` operations to learn
 *     about active campaigns and their contribution addresses.
 *   - Starts a single polling loop (per processor instance) on first
 *     activation; the loop runs until disconnect.
 *   - Each cycle:
 *       1. fetch latest block tip
 *       2. compute confirmation-gated [fromBlock..toBlock] window
 *       3. one alchemy_getAssetTransfers call per active treasury
 *          (asks for native + whitelisted ERC-20 contracts)
 *       4. for each new transfer, look up Chainlink price, build the
 *          ETH-equivalent amount, dispatch RECORD_RECEIPT
 *   - Idempotency: an in-memory `Set<string>` keyed by
 *     "chainId:txHash:uniqueId". Cold-start seeded from existing receipts
 *     on the drive (one-shot scan, not persisted across restarts).
 */

import type {
  IProcessorHostModule,
  ProcessorRecord,
} from "@powerhousedao/reactor-browser";
import type { ProcessorFactory } from "@powerhousedao/reactor";
import type { OperationWithContext } from "document-model";
import type { RecordReceiptInput } from "document-models/onchain-receipt/v1";
import { recordReceipt } from "document-models/onchain-receipt/v1";
import {
  getAssetTransfers,
  getBlockNumber,
  getEthUsdPrice,
  toHex,
  type AlchemyTransfer,
} from "./eth-rpc.js";

// ---------------------------------------------------------------------------
// Whitelist (mainnet)
// ---------------------------------------------------------------------------

interface AcceptedAsset {
  symbol: string;
  /** null for native ETH */
  contract: string | null;
  decimals: number;
}

const ACCEPTED_ASSETS: AcceptedAsset[] = [
  { symbol: "ETH", contract: null, decimals: 18 },
  {
    symbol: "USDC",
    contract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
  },
  {
    symbol: "USDT",
    contract: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
  },
  {
    symbol: "DAI",
    contract: "0x6b175474e89094c44da98b954eedeac495271d0f",
    decimals: 18,
  },
];

const ACCEPTED_BY_SYMBOL: ReadonlyMap<string, AcceptedAsset> = new Map(
  ACCEPTED_ASSETS.map((a) => [a.symbol.toUpperCase(), a]),
);

const ACCEPTED_BY_CONTRACT: ReadonlyMap<string, AcceptedAsset> = new Map(
  ACCEPTED_ASSETS.filter((a) => a.contract).map((a) => [a.contract!, a]),
);

const ERC20_CONTRACTS: string[] = ACCEPTED_ASSETS.filter((a) => a.contract).map(
  (a) => a.contract!,
);

const STABLECOIN_SYMBOLS = new Set(["USDC", "USDT", "DAI"]);

const CAMPAIGN_TYPE = "defi-united/relief-campaign";
const ONCHAIN_RECEIPT_TYPE = "defi-united/onchain-receipt";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

interface ProcessorConfig {
  alchemyUrl: string | undefined;
  pollIntervalMs: number;
  confirmationDepth: number;
  ethPriceFallbackUsd: number;
  ethPriceCacheMs: number;
  chainId: number;
}

function loadConfig(): ProcessorConfig {
  return {
    alchemyUrl:
      process.env.DEFI_UNITED_ALCHEMY_URL_1 ??
      process.env.DEFI_UNITED_RPC_URL_1,
    pollIntervalMs:
      Number(process.env.DEFI_UNITED_BLOCK_POLL_INTERVAL_MS) || 12_000,
    confirmationDepth:
      Number(process.env.DEFI_UNITED_RECEIPT_CONFIRMATIONS) || 6,
    ethPriceFallbackUsd:
      Number(process.env.DEFI_UNITED_ETH_USD_PRICE_FALLBACK) || 2200,
    ethPriceCacheMs: 60_000,
    chainId: 1,
  };
}

// ---------------------------------------------------------------------------
// Processor state
// ---------------------------------------------------------------------------

interface CampaignInfo {
  documentId: string;
  isActive: boolean;
  contributionAddresses: string[];
}

interface ProcessorState {
  /** "chainId:txHash:uniqueId" set of already-recorded transfers. */
  seenTransferKeys: Set<string>;
  pollIntervalId: ReturnType<typeof setInterval> | null;
  abort: AbortController;
  campaigns: Map<string, CampaignInfo>;
  /** Latest scanned block, per treasury — so each cycle resumes from there. */
  treasuryHighWatermark: Map<string, number>;
  /** Cached ETH/USD price + timestamp. */
  priceCache: { price: number | null; fetchedAt: number };
}

function freshState(): ProcessorState {
  return {
    seenTransferKeys: new Set(),
    pollIntervalId: null,
    abort: new AbortController(),
    campaigns: new Map(),
    treasuryHighWatermark: new Map(),
    priceCache: { price: null, fetchedAt: 0 },
  };
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function buildOnchainReceiptWatcher(
  module: IProcessorHostModule,
): ProcessorFactory {
  const config = loadConfig();
  if (!config.alchemyUrl) {
    console.warn(
      "[onchain-receipt-watcher] DEFI_UNITED_ALCHEMY_URL_1 not set — processor inactive",
    );
  }

  const state = freshState();

  const factory: ProcessorFactory = async (_driveHeader) => {
    // Eagerly seed the campaign cache + start polling on startup so we
    // don't depend on a fresh op flowing through to wake the processor.
    // If the reactor client is exposed on the module, scan for active
    // campaigns and kick the loop now; otherwise wait for the first
    // onOperations call to do it.
    await ensurePollingStarted(module, config, state);

    const record: ProcessorRecord = {
      filter: {
        documentType: [CAMPAIGN_TYPE],
        scope: ["global"],
        branch: ["main"],
      },
      processor: {
        onOperations: (ops: OperationWithContext[]) =>
          handleOperations(ops, module, config, state),
        onDisconnect: () => cleanup(state),
      },
      startFrom: "current",
    };
    return [record];
  };

  return factory;
}

/**
 * Best-effort startup activation. Scans the reactor for current
 * relief-campaign docs, populates the campaign cache, seeds idempotency
 * keys, and starts the poll loop — all without waiting for an op to
 * arrive. Safe to call repeatedly; starts the loop at most once.
 */
async function ensurePollingStarted(
  module: IProcessorHostModule,
  config: ProcessorConfig,
  state: ProcessorState,
): Promise<void> {
  if (state.pollIntervalId !== null) return;
  if (!config.alchemyUrl) return;

  const client = (
    module as unknown as {
      reactorClient?: {
        find: (q: { type: string }) => Promise<{
          results: {
            header: { id: string };
            state: { global: Record<string, unknown> };
          }[];
        }>;
      };
    }
  ).reactorClient;

  if (client?.find) {
    try {
      const found = await client.find({ type: CAMPAIGN_TYPE });
      for (const doc of found.results) {
        const g = doc.state.global;
        const status = g.status as string | undefined;
        const addresses = g.contributionAddresses as
          | { address: string; chainId: number }[]
          | undefined;
        state.campaigns.set(doc.header.id, {
          documentId: doc.header.id,
          isActive: status === "ACTIVE" || status === "EXECUTING",
          contributionAddresses:
            addresses
              ?.filter((a) => a.chainId === config.chainId)
              .map((a) => a.address.toLowerCase()) ?? [],
        });
      }
      console.log(
        `[onchain-receipt-watcher] startup scan: ${state.campaigns.size} campaign(s) loaded`,
      );
    } catch (err) {
      console.warn(
        "[onchain-receipt-watcher] startup campaign scan failed (will rely on onOperations):",
        err,
      );
    }
  }

  await seedSeenKeys(module, state);

  state.pollIntervalId = setInterval(
    () =>
      pollOnce(config, state, module).catch((err) => {
        console.error("[onchain-receipt-watcher] poll failed:", err);
      }),
    config.pollIntervalMs,
  );
  await pollOnce(config, state, module);
}

// ---------------------------------------------------------------------------
// Operation handler — drives the poll loop
// ---------------------------------------------------------------------------

async function handleOperations(
  operations: OperationWithContext[],
  module: IProcessorHostModule,
  config: ProcessorConfig,
  state: ProcessorState,
): Promise<void> {
  for (const op of operations) {
    updateCampaignFromOperation(op, config, state.campaigns);
  }
  // Belt-and-suspenders: if startup activation didn't run (no reactor
  // client exposure) the loop will start here on the first incoming op.
  await ensurePollingStarted(module, config, state);
}

function updateCampaignFromOperation(
  op: OperationWithContext,
  config: ProcessorConfig,
  cache: Map<string, CampaignInfo>,
): void {
  const documentId = op.context.documentId;
  if (!op.context.resultingState) return;

  let global: Record<string, unknown>;
  try {
    global = JSON.parse(op.context.resultingState) as Record<string, unknown>;
  } catch {
    return;
  }

  const status = global.status as string | undefined;
  const addresses = global.contributionAddresses as
    | { address: string; chainId: number }[]
    | undefined;

  cache.set(documentId, {
    documentId,
    isActive: status === "ACTIVE" || status === "EXECUTING",
    contributionAddresses:
      addresses
        ?.filter((a) => a.chainId === config.chainId)
        .map((a) => a.address.toLowerCase()) ?? [],
  });
}

function activeTreasuries(cache: Map<string, CampaignInfo>): string[] {
  const out = new Set<string>();
  for (const c of cache.values()) {
    if (!c.isActive) continue;
    for (const addr of c.contributionAddresses) out.add(addr);
  }
  return [...out];
}

// ---------------------------------------------------------------------------
// Cold-start: seed seen-set from already-recorded receipts on the drive
// ---------------------------------------------------------------------------

async function seedSeenKeys(
  module: IProcessorHostModule,
  state: ProcessorState,
): Promise<void> {
  const client = (
    module as unknown as {
      reactorClient?: {
        find: (q: { type: string }) => Promise<{
          results: { state: { global: Record<string, unknown> } }[];
        }>;
      };
    }
  ).reactorClient;
  if (!client?.find) return;

  try {
    const found = await client.find({ type: ONCHAIN_RECEIPT_TYPE });
    for (const doc of found.results) {
      const g = doc.state.global;
      const chainId = g.chainId as number | null;
      const txHash = g.txHash as string | null;
      if (chainId == null || !txHash) continue;
      // Wildcard match across uniqueId so we never re-record what's stored.
      state.seenTransferKeys.add(`${chainId}:${txHash}:*`);
    }
  } catch (err) {
    console.warn(
      "[onchain-receipt-watcher] could not seed seen-set from existing receipts:",
      err,
    );
  }
}

// ---------------------------------------------------------------------------
// Poll cycle
// ---------------------------------------------------------------------------

async function pollOnce(
  config: ProcessorConfig,
  state: ProcessorState,
  module: IProcessorHostModule,
): Promise<void> {
  if (!config.alchemyUrl || state.abort.signal.aborted) return;

  const treasuries = activeTreasuries(state.campaigns);
  if (treasuries.length === 0) return;

  const tip = await getBlockNumber(config.alchemyUrl);
  const safeBlock = Math.max(0, tip - config.confirmationDepth);

  for (const treasury of treasuries) {
    await scanTreasury(treasury, safeBlock, config, state, module);
  }
}

async function scanTreasury(
  treasury: string,
  safeBlock: number,
  config: ProcessorConfig,
  state: ProcessorState,
  module: IProcessorHostModule,
): Promise<void> {
  if (!config.alchemyUrl) return;

  const lastSeen = state.treasuryHighWatermark.get(treasury);
  // First cycle: scan a recent window (~12h on mainnet).
  // Subsequent cycles: resume from the last-seen block.
  const fromBlock =
    lastSeen != null ? lastSeen + 1 : Math.max(0, safeBlock - 5_000);
  if (fromBlock > safeBlock) return;

  let pageKey: string | undefined;
  let highest = lastSeen ?? fromBlock - 1;

  do {
    const page = await getAssetTransfers(config.alchemyUrl, {
      fromBlock: toHex(fromBlock),
      toBlock: toHex(safeBlock),
      toAddress: treasury,
      category: ["external", "erc20"],
      contractAddresses: ERC20_CONTRACTS,
      maxCount: 200,
      pageKey,
    });

    for (const transfer of page.transfers) {
      try {
        await processTransfer(transfer, treasury, config, state, module);
      } catch (err) {
        console.error(
          `[onchain-receipt-watcher] transfer ${transfer.hash} failed:`,
          err,
        );
      }
      const blockNum = parseInt(transfer.blockNum, 16);
      if (blockNum > highest) highest = blockNum;
    }

    pageKey = page.pageKey;
  } while (pageKey);

  state.treasuryHighWatermark.set(treasury, Math.max(highest, safeBlock));
}

// ---------------------------------------------------------------------------
// Per-transfer processing
// ---------------------------------------------------------------------------

async function processTransfer(
  transfer: AlchemyTransfer,
  treasury: string,
  config: ProcessorConfig,
  state: ProcessorState,
  module: IProcessorHostModule,
): Promise<void> {
  // Resolve asset
  let asset: AcceptedAsset | undefined;
  if (transfer.category === "external") {
    asset = ACCEPTED_BY_SYMBOL.get("ETH");
  } else if (transfer.category === "erc20" && transfer.rawContract.address) {
    asset = ACCEPTED_BY_CONTRACT.get(
      transfer.rawContract.address.toLowerCase(),
    );
  }
  if (!asset) return;

  // Defense-in-depth: Alchemy already filters by toAddress.
  if (transfer.to.toLowerCase() !== treasury.toLowerCase()) return;

  // Idempotency
  const baseKey = `${config.chainId}:${transfer.hash}`;
  const fullKey = `${baseKey}:${transfer.uniqueId ?? "0"}`;
  if (
    state.seenTransferKeys.has(`${baseKey}:*`) ||
    state.seenTransferKeys.has(fullKey)
  ) {
    return;
  }

  // Resolve amount (Alchemy returns token-units as a Number).
  if (transfer.value == null || transfer.value <= 0) return;
  const amount = transfer.value;

  // Resolve ETH price (cached)
  const ethPriceUsd = await ethPrice(config, state);

  // Compute ETH equivalent
  const ethEquivalent = STABLECOIN_SYMBOLS.has(asset.symbol)
    ? amount / ethPriceUsd
    : amount;

  // Block timestamp from Alchemy (ISO string when withMetadata is true).
  const blockTimestamp =
    transfer.metadata?.blockTimestamp ?? new Date().toISOString();

  const blockNumber = parseInt(transfer.blockNum, 16);

  const input: RecordReceiptInput = {
    chainId: config.chainId,
    txHash: transfer.hash,
    blockNumber,
    blockTimestamp,
    fromAddress: transfer.from,
    toAddress: transfer.to,
    asset: {
      symbol: asset.symbol,
      contractAddress: asset.contract ?? undefined,
    },
    amount,
    ethEquivalentAmount: ethEquivalent,
    ethPriceUsdAtReceipt: ethPriceUsd,
    rawLog: JSON.stringify({
      uniqueId: transfer.uniqueId,
      category: transfer.category,
      blockNum: transfer.blockNum,
    }),
  };

  state.seenTransferKeys.add(fullKey);
  state.seenTransferKeys.add(`${baseKey}:*`);

  await dispatchToCampaign(input, treasury, state.campaigns, module);
}

async function dispatchToCampaign(
  input: RecordReceiptInput,
  treasury: string,
  campaigns: Map<string, CampaignInfo>,
  module: IProcessorHostModule,
): Promise<void> {
  for (const c of campaigns.values()) {
    if (!c.isActive) continue;
    if (!c.contributionAddresses.includes(treasury.toLowerCase())) continue;
    try {
      await module.dispatch.execute(c.documentId, "main", [
        recordReceipt(input),
      ]);
      console.log(
        `[onchain-receipt-watcher] recorded ${input.amount} ${input.asset.symbol} (${input.ethEquivalentAmount.toFixed(4)} ETH) tx=${input.txHash} → campaign ${c.documentId}`,
      );
    } catch (err) {
      console.error(
        `[onchain-receipt-watcher] dispatch failed for tx=${input.txHash} campaign=${c.documentId}:`,
        err,
      );
    }
    return;
  }
}

// ---------------------------------------------------------------------------
// ETH/USD price (cached, with fallback)
// ---------------------------------------------------------------------------

async function ethPrice(
  config: ProcessorConfig,
  state: ProcessorState,
): Promise<number> {
  const now = Date.now();
  if (
    state.priceCache.price != null &&
    now - state.priceCache.fetchedAt < config.ethPriceCacheMs
  ) {
    return state.priceCache.price;
  }
  if (!config.alchemyUrl) return config.ethPriceFallbackUsd;
  try {
    const price = await getEthUsdPrice(config.alchemyUrl);
    if (Number.isFinite(price) && price > 0) {
      state.priceCache = { price, fetchedAt: now };
      return price;
    }
  } catch (err) {
    console.warn(
      "[onchain-receipt-watcher] Chainlink ETH/USD read failed, using fallback:",
      err,
    );
  }
  state.priceCache = { price: config.ethPriceFallbackUsd, fetchedAt: now };
  return config.ethPriceFallbackUsd;
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

async function cleanup(state: ProcessorState): Promise<void> {
  if (state.pollIntervalId !== null) {
    clearInterval(state.pollIntervalId);
    state.pollIntervalId = null;
  }
  state.abort.abort();
  console.log("[onchain-receipt-watcher] disconnected, polling stopped");
}

// ---------------------------------------------------------------------------
// Test surface
// ---------------------------------------------------------------------------

export const __testing = {
  ACCEPTED_ASSETS,
  ACCEPTED_BY_CONTRACT,
  ACCEPTED_BY_SYMBOL,
  ERC20_CONTRACTS,
  loadConfig,
  freshState,
  processTransfer,
  ethPrice,
  scanTreasury,
  pollOnce,
  updateCampaignFromOperation,
};
