import { generateId } from "document-model";
import {
  addContributionAddress,
  addExternalLink,
  addOperatorWallet,
  archiveCampaign,
  isReliefCampaignDocument,
  markFailed,
  markResolved,
  reducer,
  removeContributionAddress,
  removeOperatorWallet,
  setCampaignDetails,
  startCampaign,
  utils,
} from "document-models/relief-campaign/v1";
import { describe, expect, it } from "vitest";

const ADDR_1 = "0x0fCa5194baA59a362a835031d9C4A25970effE68";
const ADDR_2 = "0x1234567890abcdef1234567890abcdef12345678";

describe("ReliefCampaign management reducer", () => {
  it("starts in DRAFT with empty collections", () => {
    const doc = utils.createDocument();
    expect(isReliefCampaignDocument(doc)).toBe(true);
    expect(doc.state.global.status).toBe("DRAFT");
    expect(doc.state.global.contributionAddresses).toEqual([]);
    expect(doc.state.global.operatorWallets).toEqual([]);
    expect(doc.state.global.externalLinks).toEqual([]);
  });

  it("sets campaign details", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      setCampaignDetails({
        name: "rsETH Recovery",
        slug: "rseth-2026-04",
        summary: "Coordinated relief for the rsETH incident",
        targetAmount: 70000,
      }),
    );
    expect(next.state.global.name).toBe("rsETH Recovery");
    expect(next.state.global.slug).toBe("rseth-2026-04");
    expect(next.state.global.summary).toBe(
      "Coordinated relief for the rsETH incident",
    );
    expect(next.state.global.targetAmount).toBe(70000);
  });

  it("normalises affectedAsset.address to null when omitted", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      setCampaignDetails({
        affectedAsset: { symbol: "rsETH", chainId: 1 },
      }),
    );
    expect(next.state.global.affectedAsset).toEqual({
      symbol: "rsETH",
      chainId: 1,
      address: null,
    });
  });

  it("adds and removes contribution addresses", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addContributionAddress({
        id,
        chainId: 1,
        address: ADDR_1,
        label: "main",
      }),
    );
    expect(doc.state.global.contributionAddresses).toHaveLength(1);
    expect(doc.state.global.contributionAddresses[0]).toEqual({
      id,
      chainId: 1,
      address: ADDR_1,
      label: "main",
    });
    doc = reducer(doc, removeContributionAddress({ id }));
    expect(doc.state.global.contributionAddresses).toHaveLength(0);
  });

  it("rejects duplicate contribution address (case-insensitive)", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      addContributionAddress({ id: generateId(), chainId: 1, address: ADDR_1 }),
    );
    doc = reducer(
      doc,
      addContributionAddress({
        id: generateId(),
        chainId: 1,
        address: ADDR_1.toLowerCase(),
      }),
    );
    expect(doc.operations.global[1].error).toBe(
      "Contribution address already exists for this chain",
    );
    expect(doc.state.global.contributionAddresses).toHaveLength(1);
  });

  it("rejects removal of unknown contribution address", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, removeContributionAddress({ id: "missing" }));
    expect(next.operations.global[0].error).toBe(
      "No contribution address with that id",
    );
  });

  it("rejects START_CAMPAIGN without slug", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      addContributionAddress({ id: generateId(), chainId: 1, address: ADDR_1 }),
    );
    doc = reducer(doc, startCampaign({ _: null }));
    expect(doc.operations.global[1].error).toBe(
      "Campaign slug must be set before starting",
    );
    expect(doc.state.global.status).toBe("DRAFT");
  });

  it("rejects START_CAMPAIGN without contribution addresses", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, setCampaignDetails({ slug: "x" }));
    doc = reducer(doc, startCampaign({ _: null }));
    expect(doc.operations.global[1].error).toBe(
      "At least one contribution address is required to start a campaign",
    );
    expect(doc.state.global.status).toBe("DRAFT");
  });

  it("transitions DRAFT → ACTIVE → RESOLVED → ARCHIVED", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, setCampaignDetails({ slug: "x" }));
    doc = reducer(
      doc,
      addContributionAddress({ id: generateId(), chainId: 1, address: ADDR_1 }),
    );
    doc = reducer(doc, startCampaign({ _: null }));
    expect(doc.state.global.status).toBe("ACTIVE");
    doc = reducer(doc, markResolved({ _: null }));
    expect(doc.state.global.status).toBe("RESOLVED");
    doc = reducer(doc, archiveCampaign({ _: null }));
    expect(doc.state.global.status).toBe("ARCHIVED");
  });

  it("rejects MARK_RESOLVED while DRAFT", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, markResolved({ _: null }));
    expect(next.operations.global[0].error).toContain(
      "Cannot resolve a campaign in status DRAFT",
    );
  });

  it("MARK_FAILED appends reason to summary", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, setCampaignDetails({ slug: "x", summary: "Original." }));
    doc = reducer(
      doc,
      addContributionAddress({ id: generateId(), chainId: 1, address: ADDR_1 }),
    );
    doc = reducer(doc, startCampaign({ _: null }));
    doc = reducer(doc, markFailed({ reason: "council declined" }));
    expect(doc.state.global.status).toBe("FAILED");
    expect(doc.state.global.summary).toContain("council declined");
  });

  it("rejects ARCHIVE_CAMPAIGN before terminal status", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, setCampaignDetails({ slug: "x" }));
    doc = reducer(
      doc,
      addContributionAddress({ id: generateId(), chainId: 1, address: ADDR_1 }),
    );
    doc = reducer(doc, startCampaign({ _: null }));
    doc = reducer(doc, archiveCampaign({ _: null }));
    expect(doc.operations.global[3].error).toContain(
      "Cannot archive a campaign in status ACTIVE",
    );
    expect(doc.state.global.status).toBe("ACTIVE");
  });

  it("appends external links", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      addExternalLink({
        id: generateId(),
        label: "Postmortem",
        url: "https://example.com/postmortem",
      }),
    );
    expect(doc.state.global.externalLinks).toHaveLength(1);
    expect(doc.state.global.externalLinks[0].label).toBe("Postmortem");
  });

  it("authorises and revokes operator wallets case-insensitively", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addOperatorWallet({ address: ADDR_2 }));
    expect(doc.state.global.operatorWallets).toEqual([ADDR_2]);

    const upper = "0x" + ADDR_2.slice(2).toUpperCase();
    doc = reducer(doc, addOperatorWallet({ address: upper }));
    expect(doc.operations.global[1].error).toBe(
      "Operator wallet already authorized",
    );
    expect(doc.state.global.operatorWallets).toHaveLength(1);

    doc = reducer(doc, removeOperatorWallet({ address: ADDR_2 }));
    expect(doc.state.global.operatorWallets).toEqual([]);
  });

  it("rejects revoke of unknown operator wallet", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, removeOperatorWallet({ address: ADDR_1 }));
    expect(next.operations.global[0].error).toBe(
      "Operator wallet not authorized",
    );
  });
});
