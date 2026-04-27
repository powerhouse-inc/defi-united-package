/**
 * Onchain Receipt Watcher Processor
 *
 * Polls an Ethereum RPC endpoint for incoming transfers to active relief
 * campaign contribution addresses and records them as OnchainReceipt documents.
 *
 * Architecture:
 * - The processor registers with the framework using a filter for relief-campaign
 *   operations. When any campaign operation arrives, `onOperations` is called.
 * - On first activation it starts a polling interval that runs until disconnect.
 * - Each poll cycle:
 *   1. Fetches the current block number
 *   2. Queries ERC-20 Transfer logs for all tracked contribution addresses
 *   3. For each new confirmed transfer, records an OnchainReceipt
 * - Idempotency is enforced via an in-memory Set of seen (chainId, txHash) keys.
 * - Only transfers with enough confirmations are recorded.
 *
 * Note: OperationWithContext provides the resulting state as a JSON string in
 * context.resultingState. We parse this to extract campaign contribution addresses.
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
  getLogs,
  getBlockNumber,
  buildErc20TransferFilter,
  decodeAddressFromTopic,
  decodeAmountFromData,
  type LogEntry,
  type HexString,
} from "./eth-rpc.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAMPAIGN_TYPE = "defi-united/relief-campaign";

// ---------------------------------------------------------------------------
// Environment configuration
// ---------------------------------------------------------------------------

interface ProcessorConfig {
  rpcUrl: string | undefined;
  pollIntervalMs: number;
  confirmationDepth: number;
  chainId: number;
}

function loadConfig(): ProcessorConfig {
  return {
    rpcUrl: process.env.DEFI_UNITED_RPC_URL_1,
    pollIntervalMs: Number(process.env.BLOCK_POLL_INTERVAL_MS) || 12_000,
    confirmationDepth: Number(process.env.RECEIPT_CONFIRMATIONS) || 3,
    chainId: 1,
  };
}

// ---------------------------------------------------------------------------
// Internal state held by a single processor instance
// ---------------------------------------------------------------------------

interface ProcessorState {
  /** Set of "chainId:txHash" strings that have already been recorded. */
  seenTxHashes: Set<string>;
  /** Interval ID for the polling loop. */
  pollIntervalId: ReturnType<typeof setInterval> | null;
  /** Abort controller for cancelling in-flight RPC calls on disconnect. */
  abortController: AbortController;
  /** Cache of campaign documents we've seen. Keyed by document ID. */
  campaignCache: Map<string, CampaignInfo>;
}

interface CampaignInfo {
  documentId: string;
  isActive: boolean;
  contributionAddresses: string[];
}

// ---------------------------------------------------------------------------
// Processor factory builder
// ---------------------------------------------------------------------------

/**
 * Build a processor factory for the onchain receipt watcher.
 *
 * The factory is called once per drive when the drive is first detected.
 * It returns a ProcessorRecord containing the processor instance and its filter.
 */
export function buildOnchainReceiptWatcher(
  module: IProcessorHostModule,
): ProcessorFactory {
  const config = loadConfig();

  if (!config.rpcUrl) {
    console.warn(
      "[onchain-receipt-watcher] DEFI_UNITED_RPC_URL_1 not set — processor will be inactive",
    );
  }

  const state: ProcessorState = {
    seenTxHashes: new Set(),
    pollIntervalId: null,
    abortController: new AbortController(),
    campaignCache: new Map(),
  };

  const factory: ProcessorFactory = async (_driveHeader) => {
    const processorRecord: ProcessorRecord = {
      filter: {
        documentType: [CAMPAIGN_TYPE],
        scope: ["global"],
        branch: ["main"],
      },
      processor: {
        onOperations: (operations: OperationWithContext[]) =>
          handleOperations(operations, module, config, state),
        onDisconnect: () => cleanup(state),
      },
      startFrom: "current",
    };

    return [processorRecord];
  };

  return factory;
}

// ---------------------------------------------------------------------------
// Operation handler — triggers / maintains the polling loop
// ---------------------------------------------------------------------------

async function handleOperations(
  operations: OperationWithContext[],
  module: IProcessorHostModule,
  config: ProcessorConfig,
  state: ProcessorState,
): Promise<void> {
  // Update campaign cache from incoming operations
  for (const op of operations) {
    updateCampaignFromOperation(op, config, state.campaignCache);
  }

  // Start polling if not already running
  if (state.pollIntervalId === null && config.rpcUrl) {
    state.pollIntervalId = setInterval(
      () => pollOnce(config, state, module),
      config.pollIntervalMs,
    );
    // Run immediately on first trigger
    await pollOnce(config, state, module);
  }
}

// ---------------------------------------------------------------------------
// Campaign cache
// ---------------------------------------------------------------------------

/**
 * Extract campaign state from an operation's resultingState field.
 *
 * The framework provides the post-operation global state as a JSON string in
 * context.resultingState. We parse it to extract the campaign status and
 * contribution addresses.
 */
function updateCampaignFromOperation(
  op: OperationWithContext,
  processorConfig: ProcessorConfig,
  cache: Map<string, CampaignInfo>,
): void {
  const { context } = op;
  const documentId = context.documentId;

  if (!context.resultingState) {
    // No resulting state available (e.g., header operation).
    // Keep the existing cache entry if present, or skip.
    return;
  }

  let globalState: Record<string, unknown>;
  try {
    globalState = JSON.parse(context.resultingState) as Record<string, unknown>;
  } catch {
    return;
  }

  if (!globalState || typeof globalState !== "object") return;

  const status = globalState.status as string | undefined;
  const contributionAddresses = globalState.contributionAddresses as
    | { address: string; chainId: number }[]
    | undefined;

  const isActive = status === "ACTIVE" || status === "EXECUTING";
  const addresses: string[] =
    contributionAddresses
      ?.filter((a) => a.chainId === processorConfig.chainId)
      .map((a) => a.address.toLowerCase()) || [];

  cache.set(documentId, {
    documentId,
    isActive,
    contributionAddresses: addresses,
  });
}

function getTrackedAddresses(cache: Map<string, CampaignInfo>): string[] {
  const addresses = new Set<string>();
  for (const campaign of cache.values()) {
    if (campaign.isActive) {
      for (const addr of campaign.contributionAddresses) {
        addresses.add(addr);
      }
    }
  }
  return Array.from(addresses);
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

async function pollOnce(
  processorConfig: ProcessorConfig,
  state: ProcessorState,
  _module: IProcessorHostModule,
): Promise<void> {
  if (!processorConfig.rpcUrl || state.abortController.signal.aborted) return;

  try {
    const trackedAddresses = getTrackedAddresses(state.campaignCache);
    if (trackedAddresses.length === 0) return;

    const currentBlock = await getBlockNumber(processorConfig.rpcUrl);

    // Determine the earliest block we care about (current - some buffer to catch
    // logs we might have missed). We use a fixed scan window to avoid huge queries.
    const scanWindow = 100; // blocks
    const fromBlock = Math.max(0, currentBlock - scanWindow);

    const logs = await fetchTransferLogs(
      processorConfig.rpcUrl,
      trackedAddresses,
      toHex(fromBlock),
      toHex(currentBlock),
    );

    for (const log of logs) {
      await processLog(log, processorConfig, state, _module);
    }
  } catch (err) {
    console.error("[onchain-receipt-watcher] Poll error:", err);
  }
}

/**
 * Fetch ERC-20 Transfer logs for the given addresses in the block range.
 */
async function fetchTransferLogs(
  rpcUrl: string,
  addresses: string[],
  fromBlock: HexString,
  toBlock: HexString,
): Promise<LogEntry[]> {
  const filter = buildErc20TransferFilter(addresses, fromBlock, toBlock);
  return getLogs(rpcUrl, filter);
}

// ---------------------------------------------------------------------------
// Log processing
// ---------------------------------------------------------------------------

/**
 * Process a single ERC-20 Transfer log: check idempotency, confirmation depth,
 * and dispatch RECORD_RECEIPT if all checks pass.
 */
async function processLog(
  log: LogEntry,
  processorConfig: ProcessorConfig,
  state: ProcessorState,
  module: IProcessorHostModule,
): Promise<void> {
  const txHash = log.transactionHash;
  const idempotencyKey = `${processorConfig.chainId}:${txHash}`;

  // Idempotency check
  if (state.seenTxHashes.has(idempotencyKey)) return;

  const logBlockNumber = parseInt(log.blockNumber, 16);
  const currentBlock = await getBlockNumber(processorConfig.rpcUrl!);

  // Confirmation depth check
  if (currentBlock - logBlockNumber < processorConfig.confirmationDepth) return;

  // Decode transfer details
  const toAddress = decodeAddressFromTopic(log.topics[2]);
  const fromAddress = decodeAddressFromTopic(log.topics[1]);
  const amountWei = decodeAmountFromData(log.data);

  // Determine asset info
  const contractAddress = log.address.toLowerCase();
  const symbol = contractAddress === ethersZeroAddress() ? "ETH" : "UNKNOWN";

  // Build receipt input
  const receiptInput: RecordReceiptInput = {
    txHash: txHash,
    chainId: processorConfig.chainId,
    blockNumber: logBlockNumber,
    blockTimestamp: new Date().toISOString(),
    fromAddress: fromAddress,
    toAddress: toAddress,
    amount: Number(amountWei),
    asset: {
      symbol,
      contractAddress:
        contractAddress !== ethersZeroAddress() ? contractAddress : undefined,
    },
    rawLog: JSON.stringify(log),
  };

  // Mark as seen before dispatching (prevents duplicates on retry)
  state.seenTxHashes.add(idempotencyKey);

  // Dispatch RECORD_RECEIPT to the matching campaign document.
  await recordReceiptForCampaign(
    receiptInput,
    state.campaignCache,
    module,
    toAddress,
  );
}

/**
 * Find the matching campaign for this receipt and dispatch the action.
 */
async function recordReceiptForCampaign(
  receiptInput: RecordReceiptInput,
  campaignCache: Map<string, CampaignInfo>,
  module: IProcessorHostModule,
  toAddress: string,
): Promise<void> {
  const toLower = toAddress.toLowerCase();

  for (const campaign of campaignCache.values()) {
    if (!campaign.isActive) continue;
    if (!campaign.contributionAddresses.includes(toLower)) continue;

    const action = recordReceipt(receiptInput);

    try {
      await module.dispatch.execute(campaign.documentId, "main", [action]);
      console.log(
        `[onchain-receipt-watcher] Recorded receipt ${receiptInput.txHash} for campaign ${campaign.documentId}`,
      );
    } catch (err) {
      console.error(
        `[onchain-receipt-watcher] Failed to record receipt for campaign ${campaign.documentId}:`,
        err,
      );
    }
    return;
  }

  // No matching campaign found — log the finding
  console.log(
    `[onchain-receipt-watcher] Transfer ${receiptInput.txHash} to ${toLower} — no matching active campaign`,
  );
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

async function cleanup(state: ProcessorState): Promise<void> {
  if (state.pollIntervalId !== null) {
    clearInterval(state.pollIntervalId);
    state.pollIntervalId = null;
  }
  state.abortController.abort();
  state.abortController = new AbortController();
  console.log(
    "[onchain-receipt-watcher] Processor disconnected, polling stopped",
  );
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toHex(n: number): HexString {
  return `0x${n.toString(16)}`;
}

function ethersZeroAddress(): string {
  return "0x0000000000000000000000000000000000000000";
}
