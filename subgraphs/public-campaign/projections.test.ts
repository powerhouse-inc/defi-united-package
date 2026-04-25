import { describe, expect, it } from "vitest";
import { utils as campaignUtils } from "../../document-models/relief-campaign/v1/index.js";
import { utils as pledgeUtils } from "../../document-models/pledge/v1/index.js";
import { utils as contribUtils } from "../../document-models/contributor-profile/v1/index.js";
import { utils as depUtils } from "../../document-models/external-dependency/v1/index.js";
import { utils as receiptUtils } from "../../document-models/onchain-receipt/v1/index.js";
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

  const receipt = receiptUtils.createDocument();

  return {
    campaign,
    pledges: [pledge, cancelledPledge, receivedPledge],
    receipts: [receipt],
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
  it("aggregates pledged and received excluding cancelled pledges", () => {
    const result = projectCampaign(buildBundle());
    expect(result.totalPledged).toBe("35000");
    expect(result.totalReceived).toBe("5000");
    expect(result.percentReceived).toBeCloseTo((5000 / 70000) * 100, 2);
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
});
