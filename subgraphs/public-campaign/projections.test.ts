import { describe, expect, it } from "vitest";
import { utils as campaignUtils } from "../../document-models/relief-campaign/v1/index.js";
import { utils as pledgeUtils } from "../../document-models/pledge/v1/index.js";
import { utils as contribUtils } from "../../document-models/contributor-profile/v1/index.js";
import { utils as depUtils } from "../../document-models/external-dependency/v1/index.js";
import { utils as receiptUtils } from "../../document-models/onchain-receipt/v1/index.js";
import type { ReconciliationStatus } from "../../document-models/onchain-receipt/v1/gen/schema/types.js";
import { utils as updateUtils } from "../../document-models/status-update/v1/index.js";
import type { CampaignBundle } from "./projections.js";
import { projectCampaign } from "./projections.js";

const buildBundle = (): CampaignBundle => {
  const campaign = campaignUtils.createDocument();
  campaign.state.global.name = "rsETH Recovery";
  campaign.state.global.slug = "rseth-2026-04";
  campaign.state.global.summary = "Coordinated relief";
  campaign.state.global.status = "ACTIVE";
  campaign.state.global.targetAmount = 70000;
  campaign.state.global.contributionAddresses = [
    {
      id: "ca-1",
      chainId: 1,
      address: "0x0fCa5194baA59a362a835031d9C4A25970effE68",
      label: "main",
    },
  ];
  campaign.state.global.affectedAsset = {
    symbol: "rsETH",
    address: null,
    chainId: 1,
  };

  const pledge = pledgeUtils.createDocument();
  pledge.state.global.contributorProfileId = "ph:contrib:mantle";
  pledge.state.global.pledgedAmount = 30000;
  pledge.state.global.asset = {
    symbol: "ETH",
    chainId: 1,
    address: null,
  };
  pledge.state.global.status = "GOVERNANCE_PENDING";
  pledge.state.global.governance = {
    platform: "SNAPSHOT",
    proposalUrl: "https://snapshot.box/#/mantle.eth",
    voteEndDate: null,
    quorumStatus: null,
  };

  const cancelledPledge = pledgeUtils.createDocument();
  cancelledPledge.state.global.contributorProfileId = "ph:contrib:other";
  cancelledPledge.state.global.pledgedAmount = 1000;
  cancelledPledge.state.global.asset = {
    symbol: "ETH",
    chainId: 1,
    address: null,
  };
  cancelledPledge.state.global.status = "CANCELLED";

  const receivedPledge = pledgeUtils.createDocument();
  receivedPledge.state.global.contributorProfileId = "ph:contrib:stani";
  receivedPledge.state.global.pledgedAmount = 5000;
  receivedPledge.state.global.receivedAmount = 5000;
  receivedPledge.state.global.asset = {
    symbol: "ETH",
    chainId: 1,
    address: null,
  };
  receivedPledge.state.global.status = "RECEIVED";

  const profile = contribUtils.createDocument();
  profile.state.global.displayName = "Mantle";
  profile.state.global.kind = "FOUNDATION";
  profile.state.global.trustLevel = "VERIFIED";
  profile.state.global.websiteUrl = "https://mantle.xyz";
  profile.state.global.twitterHandle = "@mantle_official";

  const stani = contribUtils.createDocument();
  stani.state.global.displayName = "Stani Kulechov";
  stani.state.global.kind = "INDIVIDUAL";
  stani.state.global.trustLevel = "VERIFIED";

  const dep = depUtils.createDocument();
  dep.state.global.title = "KelpDAO reopens withdrawals";
  dep.state.global.kind = "OPERATIONAL";
  dep.state.global.status = "OPEN";

  const update = updateUtils.createDocument();
  update.state.global.title = "Launch";
  update.state.global.body = "We are live";
  update.state.global.publishedAt = "2026-04-25T15:00:00.000Z";
  update.state.global.visibility = "PUBLIC";

  // Three on-chain receipts: 2 ETH + 1000 USDC (worth 0.5 ETH @ $2000) +
  // 1 ETH that was reorged out and must be excluded.
  const ethReceipt = receiptUtils.createDocument();
  ethReceipt.state.global.txHash =
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  ethReceipt.state.global.chainId = 1;
  ethReceipt.state.global.blockNumber = 22_000_000;
  ethReceipt.state.global.blockTimestamp = "2026-04-26T12:00:00.000Z";
  ethReceipt.state.global.fromAddress =
    "0x1111111111111111111111111111111111111111";
  ethReceipt.state.global.toAddress =
    "0x0fCa5194baA59a362a835031d9C4A25970effE68";
  ethReceipt.state.global.asset = { symbol: "ETH", contractAddress: null };
  ethReceipt.state.global.amount = 2;
  ethReceipt.state.global.ethEquivalentAmount = 2;
  ethReceipt.state.global.ethPriceUsdAtReceipt = 2000;
  ethReceipt.state.global.reconciliationStatus = "UNMATCHED";

  const usdcReceipt = receiptUtils.createDocument();
  usdcReceipt.state.global.txHash =
    "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  usdcReceipt.state.global.chainId = 1;
  usdcReceipt.state.global.blockNumber = 22_000_005;
  usdcReceipt.state.global.blockTimestamp = "2026-04-26T13:00:00.000Z";
  usdcReceipt.state.global.fromAddress =
    "0x2222222222222222222222222222222222222222";
  usdcReceipt.state.global.toAddress =
    "0x0fCa5194baA59a362a835031d9C4A25970effE68";
  usdcReceipt.state.global.asset = {
    symbol: "USDC",
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  };
  usdcReceipt.state.global.amount = 1000;
  usdcReceipt.state.global.ethEquivalentAmount = 0.5;
  usdcReceipt.state.global.ethPriceUsdAtReceipt = 2000;
  usdcReceipt.state.global.reconciliationStatus = "UNMATCHED";

  const reorgedReceipt = receiptUtils.createDocument();
  reorgedReceipt.state.global.txHash =
    "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
  reorgedReceipt.state.global.chainId = 1;
  reorgedReceipt.state.global.blockNumber = 21_999_999;
  reorgedReceipt.state.global.blockTimestamp = "2026-04-26T11:00:00.000Z";
  reorgedReceipt.state.global.fromAddress =
    "0x3333333333333333333333333333333333333333";
  reorgedReceipt.state.global.toAddress =
    "0x0fCa5194baA59a362a835031d9C4A25970effE68";
  reorgedReceipt.state.global.asset = { symbol: "ETH", contractAddress: null };
  reorgedReceipt.state.global.amount = 1;
  reorgedReceipt.state.global.ethEquivalentAmount = 1;
  reorgedReceipt.state.global.ethPriceUsdAtReceipt = 2000;
  reorgedReceipt.state.global.reconciliationStatus = "REORGED";

  return {
    campaign,
    pledges: [pledge, cancelledPledge, receivedPledge],
    receipts: [ethReceipt, usdcReceipt, reorgedReceipt],
    dependencies: [dep],
    statusUpdates: [update],
    contributorProfilesById: new Map([
      ["ph:contrib:mantle", profile],
      ["ph:contrib:stani", stani],
    ]),
    driveId: "drive-1",
    lastUpdateAt: "2026-04-25T15:00:00.000Z",
  };
};

describe("projectCampaign", () => {
  it("totalReceived sums non-REORGED receipt.ethEquivalentAmount", () => {
    const result = projectCampaign(buildBundle());
    // 2 ETH receipt + 0.5 ETH-equivalent USDC receipt; reorged 1 ETH excluded
    expect(result.totalReceived).toBe("2.5");
    // percentReceived rounds to 2 decimals — small fractions floor to 0
    expect(result.percentReceived).toBe(0);
  });

  it("totalPledged still derives from pledge documents (excludes CANCELLED)", () => {
    const result = projectCampaign(buildBundle());
    expect(result.totalPledged).toBe("35000");
  });

  it("recentReceipts is sorted newest-block-first and respects the 100 cap", () => {
    const result = projectCampaign(buildBundle());
    expect(result.recentReceipts).toHaveLength(3);
    expect(result.recentReceipts[0].blockNumber).toBe(22_000_005);
    expect(result.recentReceipts[1].blockNumber).toBe(22_000_000);
    expect(result.recentReceipts[2].blockNumber).toBe(21_999_999);
  });

  it("pendingReceiptsEthEquivalent = max(0, liveBalance - totalReceived)", () => {
    const bundle = buildBundle();
    // Simulated live overlay says treasury holds 5 ETH-eq right now
    const result = projectCampaign(bundle, {
      totalEthEquivalent: "5",
      perAsset: [],
      fetchedAt: "2026-04-27T18:00:00.000Z",
      ethPriceUsd: 2000,
    });
    // 5 live - 2.5 doc'd = 2.5 pending
    expect(result.pendingReceiptsEthEquivalent).toBe("2.5");
  });

  it("pendingReceiptsEthEquivalent clamps to 0 when liveBalance < totalReceived", () => {
    const bundle = buildBundle();
    const result = projectCampaign(bundle, {
      totalEthEquivalent: "1",
      perAsset: [],
      fetchedAt: "2026-04-27T18:00:00.000Z",
      ethPriceUsd: 2000,
    });
    expect(result.pendingReceiptsEthEquivalent).toBe("0");
  });

  it("onchainLiveBalance defaults to null when overlay isn't passed", () => {
    const result = projectCampaign(buildBundle());
    expect(result.onchainLiveBalance).toBeNull();
    expect(result.pendingReceiptsEthEquivalent).toBeNull();
  });

  it("includes pledges from the public list except cancelled", () => {
    const result = projectCampaign(buildBundle());
    expect(result.contributorsPublic).toHaveLength(2);
    const names = result.contributorsPublic.map(
      (p) => p.contributorDisplayName,
    );
    expect(names).toContain("Mantle");
    expect(names).toContain("Stani Kulechov");
  });

  it("redacts anonymous contributors", () => {
    const bundle = buildBundle();
    bundle.contributorProfilesById.get(
      "ph:contrib:mantle",
    )!.state.global.trustLevel = "ANONYMOUS";
    const result = projectCampaign(bundle);
    const mantle = result.contributorsPublic.find(
      (p) => p.pledgedAmount === "30000",
    )!;
    expect(mantle.contributorDisplayName).toBe("Anonymous Contributor");
    expect(mantle.contributorWebsiteUrl).toBeNull();
    expect(mantle.contributorTwitter).toBeNull();
  });

  it("counts blocking and resolved dependencies", () => {
    const bundle = buildBundle();
    const resolved = depUtils.createDocument();
    resolved.state.global.title = "Done";
    resolved.state.global.kind = "OPERATIONAL";
    resolved.state.global.status = "RESOLVED";
    bundle.dependencies.push(resolved);
    const result = projectCampaign(bundle);
    expect(result.dependenciesBlocking).toBe(1);
    expect(result.dependenciesResolved).toBe(1);
  });

  it("includes only PUBLIC published status updates in recent feed", () => {
    const bundle = buildBundle();
    const internal = updateUtils.createDocument();
    internal.state.global.title = "Internal";
    internal.state.global.body = "secret";
    internal.state.global.publishedAt = "2026-04-26T15:00:00.000Z";
    internal.state.global.visibility = "INTERNAL";
    bundle.statusUpdates.push(internal);
    const result = projectCampaign(bundle);
    expect(result.recentUpdates).toHaveLength(1);
    expect(result.recentUpdates[0].title).toBe("Launch");
  });

  it("surfaces governance proposalUrl on each pledge", () => {
    const result = projectCampaign(buildBundle());
    const mantle = result.contributorsPublic.find(
      (p) => p.contributorDisplayName === "Mantle",
    )!;
    expect(mantle.governancePlatform).toBe("SNAPSHOT");
    expect(mantle.governanceProposalUrl).toBe(
      "https://snapshot.box/#/mantle.eth",
    );
  });

  it("headlineTotalEthEquivalent = totalPledged + pendingReceiptsEthEquivalent", () => {
    const bundle = buildBundle();
    // buildBundle() has totalPledged = 35000 (30000 + 5000, excluding CANCELLED 1000)
    // liveBalance.totalEthEquivalent = "200", totalReceived = 2.5
    // => pendingReceiptsEthEquivalent = 200 - 2.5 = 197.5
    // => headlineTotalEthEquivalent = 35000 + 197.5 = 35197.5
    const result = projectCampaign(bundle, {
      totalEthEquivalent: "200",
      perAsset: [],
      fetchedAt: "2026-04-28T00:00:00.000Z",
      ethPriceUsd: 2000,
    });
    expect(result.headlineTotalEthEquivalent).toBe("35197.5");
  });

  it("headlineTotalUsd = Math.round(headlineTotalEthEquivalent * ethPriceUsd)", () => {
    const bundle = buildBundle();
    // buildBundle() has totalPledged = 35000 (30000 + 5000, excluding CANCELLED 1000)
    // liveBalance.totalEthEquivalent = "200", totalReceived = 2.5
    // => pendingReceiptsEthEquivalent = 200 - 2.5 = 197.5
    // => headlineTotalEthEquivalent = 35000 + 197.5 = 35197.5
    // => headlineTotalUsd = Math.round(35197.5 * 2275) = 80074313
    const result = projectCampaign(bundle, {
      totalEthEquivalent: "200",
      perAsset: [],
      fetchedAt: "2026-04-28T00:00:00.000Z",
      ethPriceUsd: 2275,
    });
    expect(result.headlineTotalUsd).toBe("80074313");
  });

  it("headlineTotalUsd is null when no live overlay is provided", () => {
    // No liveBalance overlay => ethPriceUsd unavailable => headlineTotalUsd must be null
    const result = projectCampaign(buildBundle());
    expect(result.headlineTotalUsd).toBeNull();
  });

  it("onchainEngagement counts non-REORGED transfers and unique senders", () => {
    // Build a bundle with 4 receipts:
    //   0xAAA MATCHED, 0xBBB MATCHED, 0xAAA MATCHED, 0xCCC REORGED
    // Expected: totalTransferCount=3 (REORGED excluded), uniqueSenderCount=2 (0xAAA counted once)
    const bundle = buildBundle();
    const makeReceipt = (fromAddress: string, reconciliationStatus: ReconciliationStatus) => {
      const r = receiptUtils.createDocument();
      r.state.global.fromAddress = fromAddress;
      r.state.global.reconciliationStatus = reconciliationStatus;
      return r;
    };
    bundle.receipts = [
      makeReceipt("0xAAA", "MATCHED"),
      makeReceipt("0xBBB", "MATCHED"),
      makeReceipt("0xAAA", "MATCHED"),
      makeReceipt("0xCCC", "REORGED"),
    ];
    const result = projectCampaign(bundle);
    expect(result.onchainEngagement.totalTransferCount).toBe(3);
    expect(result.onchainEngagement.uniqueSenderCount).toBe(2);
  });

  it("onchainEngagement is zero when receipts array is empty", () => {
    const bundle = buildBundle();
    bundle.receipts = [];
    const result = projectCampaign(bundle);
    expect(result.onchainEngagement.totalTransferCount).toBe(0);
    expect(result.onchainEngagement.uniqueSenderCount).toBe(0);
  });
});
