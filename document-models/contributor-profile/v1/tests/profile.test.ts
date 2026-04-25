import { generateId } from "document-model";
import {
  addGovernanceEndpoint,
  addWallet,
  isContributorProfileDocument,
  reducer,
  removeGovernanceEndpoint,
  removeWallet,
  setProfileDetails,
  setTrustLevel,
  utils,
} from "document-models/contributor-profile/v1";
import { describe, expect, it } from "vitest";

const ADDR_A = "0xAaAaaaaAaAaaaaAaAAaAAAAAaAaaAaAaAaAaAaAa";
const ADDR_B = "0xbBbBbBbBbbBbbBbbbBbBbBbBBBbbbbBbbBbbBBbB";

describe("ContributorProfile profile reducer", () => {
  it("starts with default kind=DAO and trustLevel=ANNOUNCED", () => {
    const doc = utils.createDocument();
    expect(isContributorProfileDocument(doc)).toBe(true);
    expect(doc.state.global.kind).toBe("DAO");
    expect(doc.state.global.trustLevel).toBe("ANNOUNCED");
    expect(doc.state.global.walletAddresses).toEqual([]);
    expect(doc.state.global.governanceEndpoints).toEqual([]);
  });

  it("sets profile details", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      setProfileDetails({
        legalName: "Mantle Foundation",
        displayName: "Mantle",
        kind: "FOUNDATION",
        websiteUrl: "https://mantle.xyz",
        twitterHandle: "@mantle_official",
      }),
    );
    expect(next.state.global.displayName).toBe("Mantle");
    expect(next.state.global.kind).toBe("FOUNDATION");
    expect(next.state.global.websiteUrl).toBe("https://mantle.xyz");
  });

  it("registers and removes a wallet", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addWallet({ id, chainId: 1, address: ADDR_A, label: "treasury" }),
    );
    expect(doc.state.global.walletAddresses).toHaveLength(1);
    expect(doc.state.global.walletAddresses[0].label).toBe("treasury");
    doc = reducer(doc, removeWallet({ id }));
    expect(doc.state.global.walletAddresses).toEqual([]);
  });

  it("rejects duplicate wallet (case-insensitive)", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      addWallet({ id: generateId(), chainId: 1, address: ADDR_A }),
    );
    doc = reducer(
      doc,
      addWallet({
        id: generateId(),
        chainId: 1,
        address: "0x" + ADDR_A.slice(2).toLowerCase(),
      }),
    );
    expect(doc.operations.global[1].error).toBe(
      "Wallet already registered for this chain",
    );
    expect(doc.state.global.walletAddresses).toHaveLength(1);
  });

  it("rejects removing an unknown wallet", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, removeWallet({ id: "missing" }));
    expect(next.operations.global[0].error).toBe("No wallet with that id");
  });

  it("registers governance endpoints across platforms", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      addGovernanceEndpoint({
        id: generateId(),
        platform: "SNAPSHOT",
        url: "https://snapshot.box/#/mantle.eth",
      }),
    );
    doc = reducer(
      doc,
      addGovernanceEndpoint({
        id: generateId(),
        platform: "TALLY",
        url: "https://www.tally.xyz/gov/aave",
      }),
    );
    expect(doc.state.global.governanceEndpoints).toHaveLength(2);
  });

  it("rejects duplicate governance endpoint (same platform + url)", () => {
    let doc = utils.createDocument();
    const url = "https://snapshot.box/#/mantle.eth";
    doc = reducer(
      doc,
      addGovernanceEndpoint({ id: generateId(), platform: "SNAPSHOT", url }),
    );
    doc = reducer(
      doc,
      addGovernanceEndpoint({ id: generateId(), platform: "SNAPSHOT", url }),
    );
    expect(doc.operations.global[1].error).toBe(
      "Governance endpoint already registered",
    );
  });

  it("removes a governance endpoint by id", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addGovernanceEndpoint({
        id,
        platform: "FORUM",
        url: "https://forum.example.com",
      }),
    );
    doc = reducer(doc, removeGovernanceEndpoint({ id }));
    expect(doc.state.global.governanceEndpoints).toEqual([]);
  });

  it("rejects removing an unknown governance endpoint", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, removeGovernanceEndpoint({ id: "nope" }));
    expect(next.operations.global[0].error).toBe(
      "No governance endpoint with that id",
    );
  });

  it("sets trust level", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, setTrustLevel({ trustLevel: "VERIFIED" }));
    expect(next.state.global.trustLevel).toBe("VERIFIED");
  });

  it("supports multiple wallets across chains", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      addWallet({ id: generateId(), chainId: 1, address: ADDR_A }),
    );
    doc = reducer(
      doc,
      addWallet({ id: generateId(), chainId: 42161, address: ADDR_A }),
    );
    doc = reducer(
      doc,
      addWallet({ id: generateId(), chainId: 1, address: ADDR_B }),
    );
    expect(doc.state.global.walletAddresses).toHaveLength(3);
  });
});
