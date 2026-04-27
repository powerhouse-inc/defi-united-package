/**
 * Live on-chain balance overlay for the public-campaign subgraph.
 *
 * Reads the campaign treasury's native ETH balance and the configured
 * stablecoin ERC-20 balances via Alchemy, prices each in ETH using the
 * Chainlink ETH/USD feed, and returns the sum as `totalEthEquivalent`.
 * Cached server-side for a short TTL so a tight frontend poll cadence
 * doesn't hammer the RPC.
 */

import {
  getEthBalance,
  getErc20Balance,
  getEthUsdPrice,
  rawToTokenUnits,
} from "../../processors/onchain-receipt-watcher/eth-rpc.js";
import type { OnchainLiveBalance } from "./projections.js";

interface AcceptedAsset {
  symbol: string;
  contract: string | null;
  decimals: number;
  isStable: boolean;
}

const ACCEPTED: AcceptedAsset[] = [
  { symbol: "ETH", contract: null, decimals: 18, isStable: false },
  {
    symbol: "USDC",
    contract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    isStable: true,
  },
  {
    symbol: "USDT",
    contract: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
    isStable: true,
  },
  {
    symbol: "DAI",
    contract: "0x6b175474e89094c44da98b954eedeac495271d0f",
    decimals: 18,
    isStable: true,
  },
];

const CACHE_TTL_MS = 5_000;
const PRICE_CACHE_TTL_MS = 60_000;

interface CacheEntry {
  result: OnchainLiveBalance;
  fetchedAt: number;
}

const balanceCache = new Map<string, CacheEntry>();
let priceCache: { value: number; at: number } | null = null;

function num(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

async function ethPriceUsd(
  alchemyUrl: string,
  fallback: number,
): Promise<number> {
  const now = Date.now();
  if (priceCache && now - priceCache.at < PRICE_CACHE_TTL_MS) {
    return priceCache.value;
  }
  try {
    const price = await getEthUsdPrice(alchemyUrl);
    if (Number.isFinite(price) && price > 0) {
      priceCache = { value: price, at: now };
      return price;
    }
  } catch {
    /* swallow → fallback */
  }
  priceCache = { value: fallback, at: now };
  return fallback;
}

export interface FetchLiveBalanceOpts {
  alchemyUrl: string | undefined;
  treasuryAddress: string;
  ethPriceFallbackUsd?: number;
}

/**
 * Fetch (and cache) the live ETH-equivalent balance overlay for one
 * treasury. Returns null when the call cannot be satisfied (no Alchemy
 * URL, RPC blip) so the resolver omits the overlay rather than 500ing.
 */
export async function fetchLiveBalance(
  opts: FetchLiveBalanceOpts,
): Promise<OnchainLiveBalance | null> {
  if (!opts.alchemyUrl) return null;
  const key = `${opts.alchemyUrl}|${opts.treasuryAddress.toLowerCase()}`;
  const now = Date.now();
  const hit = balanceCache.get(key);
  if (hit && now - hit.fetchedAt < CACHE_TTL_MS) {
    return hit.result;
  }

  try {
    const ethPrice = await ethPriceUsd(
      opts.alchemyUrl,
      opts.ethPriceFallbackUsd ?? 2200,
    );

    const perAsset = await Promise.all(
      ACCEPTED.map(async (asset) => {
        const raw = asset.contract
          ? await getErc20Balance(
              opts.alchemyUrl!,
              asset.contract,
              opts.treasuryAddress,
            )
          : await getEthBalance(opts.alchemyUrl!, opts.treasuryAddress);
        const formatted = rawToTokenUnits(raw, asset.decimals);
        const ethEq = asset.isStable ? formatted / ethPrice : formatted;
        return {
          symbol: asset.symbol,
          contractAddress: asset.contract,
          rawBalance: raw.toString(),
          formattedAmount: formatted.toString(),
          ethEquivalent: ethEq.toString(),
        };
      }),
    );

    const total = perAsset.reduce((s, a) => s + num(a.ethEquivalent), 0);

    const result: OnchainLiveBalance = {
      totalEthEquivalent: total.toString(),
      perAsset,
      fetchedAt: new Date().toISOString(),
      ethPriceUsd: ethPrice,
    };

    balanceCache.set(key, { result, fetchedAt: now });
    return result;
  } catch (err) {
    console.warn(
      `[public-campaign] live balance fetch failed for ${opts.treasuryAddress}:`,
      err,
    );
    return null;
  }
}

/** Pure config loader so tests can override. */
export function loadOverlayConfig(): {
  alchemyUrl: string | undefined;
  ethPriceFallbackUsd: number;
} {
  return {
    alchemyUrl:
      process.env.DEFI_UNITED_ALCHEMY_URL_1 ??
      process.env.DEFI_UNITED_RPC_URL_1,
    ethPriceFallbackUsd:
      Number(process.env.DEFI_UNITED_ETH_USD_PRICE_FALLBACK) || 2200,
  };
}
