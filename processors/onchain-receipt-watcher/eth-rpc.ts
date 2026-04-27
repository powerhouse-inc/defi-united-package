/**
 * Minimal Ethereum JSON-RPC client for the onchain receipt watcher processor.
 *
 * Pure functions with injectable fetch for testability.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params: unknown[];
  id: number;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  result: T;
  id: number;
}

interface JsonRpcError {
  jsonrpc: "2.0";
  error: { code: number; message: string };
  id: number;
}

export type HexString = `0x${string}`;

// ---------------------------------------------------------------------------
// Log filter and result
// ---------------------------------------------------------------------------

export interface LogFilter {
  fromBlock?: HexString;
  toBlock?: HexString;
  address?: string | string[];
  topics?: (string | string[] | null)[];
}

export interface LogEntry {
  removed: boolean;
  logIndex: HexString | null;
  blockNumber: HexString;
  blockHash: HexString;
  transactionHash: HexString;
  transactionIndex: HexString;
  address: string;
  data: string;
  topics: string[];
}

// ---------------------------------------------------------------------------
// ERC-20 Transfer event signature (keccak256("Transfer(address,address,uint256)"))
// ---------------------------------------------------------------------------

export const ERC20_TRANSFER_TOPIC =
  "0xddf252ad1be2c39cd7d266fd2622460c69cb6b94cb67463a88a8c6576067b4a2";

// ---------------------------------------------------------------------------
// Core RPC functions
// ---------------------------------------------------------------------------

const DEFAULT_RPC_TIMEOUT_MS = 10_000;

async function jsonRpc<T>(
  url: string,
  method: string,
  params: unknown[],
  fetchFn: typeof fetch,
  requestId: number,
): Promise<T> {
  const request: JsonRpcRequest = {
    jsonrpc: "2.0",
    method,
    params,
    id: requestId,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DEFAULT_RPC_TIMEOUT_MS,
  );

  try {
    const response = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const body = (await response.json()) as JsonRpcResponse<T> | JsonRpcError;

    if ("error" in body) {
      throw new EthRpcError(
        body.error.message,
        body.error.code,
        method,
        params,
      );
    }

    return body.result;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let _requestId = 0;

/**
 * Fetch matching logs via eth_getLogs.
 */
export function getLogs(
  url: string,
  filter: LogFilter,
  fetchFn: typeof fetch = fetch,
): Promise<LogEntry[]> {
  return jsonRpc<LogEntry[]>(
    url,
    "eth_getLogs",
    [filter],
    fetchFn,
    _requestId++,
  );
}

/**
 * Fetch the latest block number via eth_blockNumber.
 * Returns the block number as a decimal integer.
 */
export function getBlockNumber(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<number> {
  return jsonRpc<HexString>(
    url,
    "eth_blockNumber",
    [],
    fetchFn,
    _requestId++,
  ).then((hex) => parseInt(hex, 16));
}

/**
 * Build a log filter for ERC-20 Transfer events where `to` matches one of the
 * given contribution addresses.
 *
 * Topics:
 *   [0] = keccak256("Transfer(address,address,uint256)")
 *   [1] = from (indexed) - not filtered
 *   [2] = to   (indexed) - we match specific addresses
 */
export function buildErc20TransferFilter(
  addresses: string[],
  fromBlock?: HexString,
  toBlock?: HexString,
): LogFilter {
  const topicValues = addresses.map((a) => a.toLowerCase());
  return {
    fromBlock,
    toBlock,
    topics: [ERC20_TRANSFER_TOPIC, null, topicValues],
  };
}

// ---------------------------------------------------------------------------
// Native ETH transfer detection
// ---------------------------------------------------------------------------

/**
 * Build a log filter that captures all transactions (native transfers produce
 * no log topics, but we can scan blocks for tx receipts — this filter returns
 * an empty-topic filter to get all receipts in a range).
 *
 * NOTE: eth_getLogs with no topics matches ALL logs. For native ETH transfers
 * we instead query block receipts via eth_getTransactionReceipt. This function
 * exists for documentation; the actual native-ETH scanning is done via
 * `getTransactionReceiptsInRange`.
 */
export function buildNativeTransferFilter(
  _addresses: string[],
  fromBlock?: HexString,
  toBlock?: HexString,
): LogFilter {
  // We cannot filter native ETH transfers via eth_getLogs.
  // Return a filter that matches all logs; callers should use getTransactionReceiptsInRange instead.
  return { fromBlock, toBlock };
}

export interface TransactionReceipt {
  transactionHash: HexString;
  blockNumber: HexString;
  from: string;
  to: string | null;
  gasUsed: HexString;
  cumulativeGasUsed: HexString;
  logs: LogEntry[];
}

/**
 * Fetch a single transaction receipt via eth_getTransactionReceipt.
 * Returns null if the transaction is not yet known.
 */
export function getTransactionReceipt(
  url: string,
  txHash: HexString,
  fetchFn: typeof fetch = fetch,
): Promise<TransactionReceipt | null> {
  return jsonRpc<TransactionReceipt | null>(
    url,
    "eth_getTransactionReceipt",
    [txHash],
    fetchFn,
    _requestId++,
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Decode the `to` address from an ERC-20 Transfer log topic[2].
 * Topics are 32-byte padded, so we take the last 20 bytes (40 hex chars).
 */
export function decodeAddressFromTopic(topic: string): string {
  const padded = topic.slice(-40).padStart(40, "0");
  return `0x${padded}`.toLowerCase();
}

/**
 * Decode the transfer amount from the `data` field of an ERC-20 Transfer log.
 */
export function decodeAmountFromData(data: string): bigint {
  // data is 0x-prefixed, 64 hex chars for uint256
  const hex = data.startsWith("0x") ? data.slice(2) : data;
  return BigInt("0x" + hex);
}

/**
 * Format a bigint wei value as a human-readable string with the given decimals.
 */
export function formatTokenAmount(value: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const fractional = value % divisor;
  const fracStr = fractional.toString().padStart(decimals, "0");
  return `${whole}.${fracStr}`;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class EthRpcError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly method: string,
    public readonly params: unknown[],
  ) {
    super(`ETH RPC error (${method}): ${message}`);
    this.name = "EthRpcError";
  }
}
