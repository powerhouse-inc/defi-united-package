/**
 * Minimal Ethereum + Alchemy RPC client for the onchain receipt watcher.
 *
 * The processor uses a single Alchemy URL to poll inbound transfers
 * (`alchemy_getAssetTransfers`), read the latest block, and read the
 * Chainlink ETH/USD price feed for ETH-equivalent valuation.
 *
 * All helpers are pure async functions with an injectable fetch — kept
 * thin enough to test against `vi.fn()` mocks without a Node ethereum lib.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HexString = `0x${string}`;

interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  result?: T;
  error?: { code: number; message: string };
  id: number;
}

const DEFAULT_RPC_TIMEOUT_MS = 10_000;
let _requestId = 0;

class EthRpcError extends Error {
  constructor(
    message: string,
    public code: number,
    public method: string,
  ) {
    super(`${method} failed (${code}): ${message}`);
  }
}

async function jsonRpc<T>(
  url: string,
  method: string,
  params: unknown[],
  fetchFn: typeof fetch,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_RPC_TIMEOUT_MS);
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: ++_requestId,
      }),
    });
    const body = (await res.json()) as JsonRpcResponse<T>;
    if (body.error) {
      throw new EthRpcError(body.error.message, body.error.code, method);
    }
    if (body.result === undefined) {
      throw new EthRpcError("missing result", -1, method);
    }
    return body.result;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Block tip
// ---------------------------------------------------------------------------

export async function getBlockNumber(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<number> {
  const hex = await jsonRpc<HexString>(url, "eth_blockNumber", [], fetchFn);
  return parseInt(hex, 16);
}

// ---------------------------------------------------------------------------
// alchemy_getAssetTransfers
// ---------------------------------------------------------------------------

/**
 * One asset transfer as returned by Alchemy's enhanced API.
 * The shape we care about — full schema is larger.
 */
export interface AlchemyTransfer {
  blockNum: HexString;
  hash: HexString;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  category: "external" | "internal" | "erc20" | "erc721" | "erc1155";
  rawContract: {
    address: string | null;
    decimal: HexString | null;
    value: HexString | null;
  };
  uniqueId?: string;
  metadata?: {
    blockTimestamp?: string;
  };
}

interface AlchemyAssetTransfersResponse {
  transfers: AlchemyTransfer[];
  pageKey?: string;
}

export interface GetAssetTransfersOptions {
  fromBlock: HexString;
  toBlock: HexString;
  toAddress: string;
  category: ("external" | "internal" | "erc20")[];
  contractAddresses?: string[];
  /** Maximum 1000 per page; we default to 100. */
  maxCount?: number;
  pageKey?: string;
  /**
   * Result order. Default "asc" so the processor's incremental scan
   * walks blocks chronologically. Use "desc" when you want the most
   * recent N regardless of the window size (live ticker).
   */
  order?: "asc" | "desc";
}

export async function getAssetTransfers(
  url: string,
  opts: GetAssetTransfersOptions,
  fetchFn: typeof fetch = fetch,
): Promise<AlchemyAssetTransfersResponse> {
  const params: Record<string, unknown> = {
    fromBlock: opts.fromBlock,
    toBlock: opts.toBlock,
    toAddress: opts.toAddress.toLowerCase(),
    category: opts.category,
    withMetadata: true,
    excludeZeroValue: true,
    maxCount: toHex(opts.maxCount ?? 100),
    order: opts.order ?? "asc",
  };
  if (opts.contractAddresses && opts.contractAddresses.length > 0) {
    params.contractAddresses = opts.contractAddresses.map((a) =>
      a.toLowerCase(),
    );
  }
  if (opts.pageKey) {
    params.pageKey = opts.pageKey;
  }
  return jsonRpc<AlchemyAssetTransfersResponse>(
    url,
    "alchemy_getAssetTransfers",
    [params],
    fetchFn,
  );
}

// ---------------------------------------------------------------------------
// Chainlink ETH/USD price feed
// ---------------------------------------------------------------------------

/**
 * Mainnet ETH/USD aggregator. Returns price with 8 decimals via
 * `latestAnswer()` (selector 0x50d25bcd).
 */
export const CHAINLINK_ETH_USD_FEED =
  "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

const LATEST_ANSWER_SELECTOR = "0x50d25bcd";

export async function getEthUsdPrice(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<number> {
  const result = await jsonRpc<HexString>(
    url,
    "eth_call",
    [{ to: CHAINLINK_ETH_USD_FEED, data: LATEST_ANSWER_SELECTOR }, "latest"],
    fetchFn,
  );
  // 8-decimal feed; clean to a plain Number.
  const raw = BigInt(result);
  return Number(raw) / 1e8;
}

// ---------------------------------------------------------------------------
// Native + ERC-20 balance reads (used by the subgraph live overlay path)
// ---------------------------------------------------------------------------

const ERC20_BALANCE_OF_SELECTOR = "0x70a08231";

export async function getEthBalance(
  url: string,
  holder: string,
  fetchFn: typeof fetch = fetch,
): Promise<bigint> {
  const result = await jsonRpc<HexString>(
    url,
    "eth_getBalance",
    [holder.toLowerCase(), "latest"],
    fetchFn,
  );
  return BigInt(result);
}

export async function getErc20Balance(
  url: string,
  contract: string,
  holder: string,
  fetchFn: typeof fetch = fetch,
): Promise<bigint> {
  const data = (ERC20_BALANCE_OF_SELECTOR +
    holder.replace(/^0x/, "").toLowerCase().padStart(64, "0")) as HexString;
  const result = await jsonRpc<HexString>(
    url,
    "eth_call",
    [{ to: contract, data }, "latest"],
    fetchFn,
  );
  return BigInt(result);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function toHex(n: number): HexString {
  return `0x${n.toString(16)}`;
}

/**
 * Convert a raw bigint base-units value into a decimal-token Number,
 * preserving up to ~15 significant digits which is plenty for ETH-scale
 * amounts but safe to assume only when we already filter by accepted
 * tokens with known decimals.
 */
export function rawToTokenUnits(raw: bigint, decimals: number): number {
  if (decimals === 0) return Number(raw);
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const frac = raw % base;
  const fracStr = frac.toString().padStart(decimals, "0");
  return Number(`${whole}.${fracStr}`);
}
