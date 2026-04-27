/**
 * Tests for the onchain-receipt-watcher processor.
 *
 * Strategy: spy on the helper functions exported from `eth-rpc.ts` (Alchemy
 * + Chainlink calls) and on `m.dispatchExecute` to verify that the
 * processor records receipts correctly without going to the network.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IProcessorHostModule } from "@powerhousedao/reactor-browser";
import type { OperationWithContext } from "document-model";

import { __testing } from "./index.js";
import * as ethRpc from "./eth-rpc.js";
import type { AlchemyTransfer, HexString } from "./eth-rpc.js";

const CAMPAIGN_DOC_ID = "campaign-doc-123";
const TREASURY = "0x0fca5194baa59a362a835031d9c4a25970effe68";
const DONOR = "0x1234567890123456789012345678901234567890";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

function toHex(n: number): HexString {
  return `0x${n.toString(16)}`;
}

function ethTransfer(opts: {
  hash: string;
  blockNum: number;
  value: number;
  uniqueId?: string;
}): AlchemyTransfer {
  return {
    blockNum: toHex(opts.blockNum),
    hash: opts.hash as HexString,
    from: DONOR,
    to: TREASURY,
    value: opts.value,
    asset: "ETH",
    category: "external",
    rawContract: { address: null, decimal: null, value: null },
    uniqueId: opts.uniqueId ?? `${opts.hash}:0`,
    metadata: { blockTimestamp: "2026-04-27T18:00:00.000Z" },
  };
}

function usdcTransfer(opts: {
  hash: string;
  blockNum: number;
  value: number;
  uniqueId?: string;
}): AlchemyTransfer {
  return {
    blockNum: toHex(opts.blockNum),
    hash: opts.hash as HexString,
    from: DONOR,
    to: TREASURY,
    value: opts.value,
    asset: "USDC",
    category: "erc20",
    rawContract: { address: USDC, decimal: toHex(6), value: null },
    uniqueId: opts.uniqueId ?? `${opts.hash}:0`,
    metadata: { blockTimestamp: "2026-04-27T18:00:00.000Z" },
  };
}

interface MockModule {
  module: IProcessorHostModule;
  dispatchExecute: ReturnType<typeof vi.fn>;
}

function mockModule(): MockModule {
  const dispatchExecute = vi.fn().mockResolvedValue(undefined);
  const module = {
    dispatch: { execute: dispatchExecute },
  } as unknown as IProcessorHostModule;
  return { module, dispatchExecute };
}

function activeCampaign(state: ReturnType<typeof __testing.freshState>) {
  state.campaigns.set(CAMPAIGN_DOC_ID, {
    documentId: CAMPAIGN_DOC_ID,
    isActive: true,
    contributionAddresses: [TREASURY],
  });
}

function configFor(
  envUrl = "https://alchemy.test/v2/key",
): ReturnType<typeof __testing.loadConfig> {
  return {
    alchemyUrl: envUrl,
    pollIntervalMs: 12_000,
    confirmationDepth: 6,
    ethPriceFallbackUsd: 2200,
    ethPriceCacheMs: 60_000,
    chainId: 1,
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("onchain-receipt-watcher (Alchemy)", () => {
  it("dispatches RECORD_RECEIPT for a native ETH transfer with ethEquivalent = amount", async () => {
    const state = __testing.freshState();
    activeCampaign(state);
    const config = configFor();
    vi.spyOn(ethRpc, "getEthUsdPrice").mockResolvedValue(2500);

    const m = mockModule();
    await __testing.processTransfer(
      ethTransfer({ hash: "0xa1", blockNum: 22_000_000, value: 5 }),
      TREASURY,
      config,
      state,
      m.module,
    );

    expect(m.dispatchExecute).toHaveBeenCalledTimes(1);
    const [docId, branch, actions] = m.dispatchExecute.mock.calls[0];
    expect(docId).toBe(CAMPAIGN_DOC_ID);
    expect(branch).toBe("main");
    expect(actions[0].input).toMatchObject({
      chainId: 1,
      txHash: "0xa1",
      asset: { symbol: "ETH" },
      amount: 5,
      ethEquivalentAmount: 5,
      ethPriceUsdAtReceipt: 2500,
    });
  });

  it("dispatches RECORD_RECEIPT for USDC with ethEquivalent = amount / ethPriceUsd", async () => {
    const state = __testing.freshState();
    activeCampaign(state);
    const config = configFor();
    vi.spyOn(ethRpc, "getEthUsdPrice").mockResolvedValue(2000);

    const m = mockModule();
    await __testing.processTransfer(
      usdcTransfer({ hash: "0xb2", blockNum: 22_000_001, value: 1000 }),
      TREASURY,
      config,
      state,
      m.module,
    );

    expect(m.dispatchExecute).toHaveBeenCalledTimes(1);
    const action = m.dispatchExecute.mock.calls[0][2][0];
    expect(action.input.asset).toEqual({
      symbol: "USDC",
      contractAddress: USDC,
    });
    expect(action.input.amount).toBe(1000);
    expect(action.input.ethEquivalentAmount).toBeCloseTo(0.5, 6);
    expect(action.input.ethPriceUsdAtReceipt).toBe(2000);
  });

  it("idempotency: same (txHash, uniqueId) does not double-record", async () => {
    const state = __testing.freshState();
    activeCampaign(state);
    const config = configFor();
    vi.spyOn(ethRpc, "getEthUsdPrice").mockResolvedValue(2500);

    const m = mockModule();
    const transfer = ethTransfer({
      hash: "0xc3",
      blockNum: 22_000_002,
      value: 1,
    });
    await __testing.processTransfer(
      transfer,
      TREASURY,
      config,
      state,
      m.module,
    );
    await __testing.processTransfer(
      transfer,
      TREASURY,
      config,
      state,
      m.module,
    );

    expect(m.dispatchExecute).toHaveBeenCalledTimes(1);
  });

  it("ignores transfers to a non-tracked address (defense in depth)", async () => {
    const state = __testing.freshState();
    activeCampaign(state);
    const config = configFor();
    vi.spyOn(ethRpc, "getEthUsdPrice").mockResolvedValue(2500);

    const m = mockModule();
    const wrong = {
      ...ethTransfer({ hash: "0xd4", blockNum: 22_000_003, value: 7 }),
      to: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    };
    await __testing.processTransfer(wrong, TREASURY, config, state, m.module);

    expect(m.dispatchExecute).not.toHaveBeenCalled();
  });

  it("ignores transfers from non-whitelisted ERC-20 contracts", async () => {
    const state = __testing.freshState();
    activeCampaign(state);
    const config = configFor();
    vi.spyOn(ethRpc, "getEthUsdPrice").mockResolvedValue(2500);

    const m = mockModule();
    const stranger: AlchemyTransfer = {
      ...usdcTransfer({ hash: "0xe5", blockNum: 22_000_004, value: 1000 }),
      rawContract: {
        address: "0x000000000000000000000000000000000000beef",
        decimal: toHex(18),
        value: null,
      },
    };
    await __testing.processTransfer(
      stranger,
      TREASURY,
      config,
      state,
      m.module,
    );

    expect(m.dispatchExecute).not.toHaveBeenCalled();
  });

  it("falls back to env price when Chainlink read fails", async () => {
    const state = __testing.freshState();
    const config = configFor();
    vi.spyOn(ethRpc, "getEthUsdPrice").mockRejectedValue(new Error("rpc down"));

    const price = await __testing.ethPrice(config, state);
    expect(price).toBe(config.ethPriceFallbackUsd);
  });

  it("caches ETH price so we don't hammer Chainlink on every transfer", async () => {
    const state = __testing.freshState();
    const config = configFor();
    const spy = vi.spyOn(ethRpc, "getEthUsdPrice").mockResolvedValue(2500);

    await __testing.ethPrice(config, state);
    await __testing.ethPrice(config, state);
    await __testing.ethPrice(config, state);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("updateCampaignFromOperation marks ACTIVE campaigns and lowercases addresses", () => {
    const state = __testing.freshState();
    const config = configFor();
    const op = {
      context: {
        documentId: CAMPAIGN_DOC_ID,
        resultingState: JSON.stringify({
          status: "ACTIVE",
          contributionAddresses: [
            {
              address: "0x0fCa5194baA59a362a835031d9C4A25970effE68",
              chainId: 1,
            },
            {
              address: "0xFFFF000000000000000000000000000000000001",
              chainId: 137,
            },
          ],
        }),
      },
    } as unknown as OperationWithContext;

    __testing.updateCampaignFromOperation(op, config, state.campaigns);
    const c = state.campaigns.get(CAMPAIGN_DOC_ID)!;
    expect(c.isActive).toBe(true);
    expect(c.contributionAddresses).toEqual([TREASURY]);
  });
});
