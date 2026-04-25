import {
  abandon,
  isExternalDependencyDocument,
  linkPledge,
  reducer,
  resolve,
  setDependencyDetails,
  setExternalRef,
  unlinkPledge,
  updateStatus,
  utils,
} from "document-models/external-dependency/v1";
import { describe, expect, it } from "vitest";

const PLEDGE_A = "ph:pledge:mantle";
const PLEDGE_B = "ph:pledge:aave";

describe("ExternalDependency tracking reducer", () => {
  it("starts OPEN with kind OPERATIONAL and no blocks", () => {
    const doc = utils.createDocument();
    expect(isExternalDependencyDocument(doc)).toBe(true);
    expect(doc.state.global.status).toBe("OPEN");
    expect(doc.state.global.kind).toBe("OPERATIONAL");
    expect(doc.state.global.blocks).toEqual([]);
  });

  it("sets dependency details", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      setDependencyDetails({
        title: "KelpDAO reopens withdrawals",
        description: "Required to unlock backing of rsETH",
        kind: "OPERATIONAL",
        assignee: "kelp-team",
      }),
    );
    expect(next.state.global.title).toBe("KelpDAO reopens withdrawals");
    expect(next.state.global.assignee).toBe("kelp-team");
  });

  it("links and unlinks pledges", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, linkPledge({ pledgeId: PLEDGE_A }));
    doc = reducer(doc, linkPledge({ pledgeId: PLEDGE_B }));
    expect(doc.state.global.blocks).toEqual([PLEDGE_A, PLEDGE_B]);
    doc = reducer(doc, unlinkPledge({ pledgeId: PLEDGE_A }));
    expect(doc.state.global.blocks).toEqual([PLEDGE_B]);
  });

  it("rejects double-link", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, linkPledge({ pledgeId: PLEDGE_A }));
    doc = reducer(doc, linkPledge({ pledgeId: PLEDGE_A }));
    expect(doc.operations.global[1].error).toBe(
      "Pledge is already linked to this dependency",
    );
  });

  it("rejects unlink of unlinked pledge", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, unlinkPledge({ pledgeId: PLEDGE_A }));
    expect(next.operations.global[0].error).toBe(
      "Pledge is not linked to this dependency",
    );
  });

  it("UPDATE_STATUS moves OPEN → IN_PROGRESS → RESOLVED", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, updateStatus({ status: "IN_PROGRESS" }));
    expect(doc.state.global.status).toBe("IN_PROGRESS");
    doc = reducer(doc, updateStatus({ status: "RESOLVED" }));
    expect(doc.state.global.status).toBe("RESOLVED");
  });

  it("rejects moving out of RESOLVED via UPDATE_STATUS", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, updateStatus({ status: "RESOLVED" }));
    doc = reducer(doc, updateStatus({ status: "OPEN" }));
    expect(doc.operations.global[1].error).toBe(
      "Cannot move dependency out of RESOLVED state",
    );
    expect(doc.state.global.status).toBe("RESOLVED");
  });

  it("RESOLVE flips status and rejects double-resolve", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, resolve({ _: null }));
    expect(doc.state.global.status).toBe("RESOLVED");
    doc = reducer(doc, resolve({ _: null }));
    expect(doc.operations.global[1].error).toBe(
      "Dependency is already resolved",
    );
  });

  it("ABANDON disallows resolution afterward", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, abandon({ _: null }));
    expect(doc.state.global.status).toBe("ABANDONED");
    doc = reducer(doc, resolve({ _: null }));
    expect(doc.operations.global[1].error).toBe(
      "Cannot resolve an abandoned dependency",
    );
  });

  it("rejects abandoning a resolved dependency", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, resolve({ _: null }));
    doc = reducer(doc, abandon({ _: null }));
    expect(doc.operations.global[1].error).toBe(
      "Cannot abandon a resolved dependency",
    );
  });

  it("SET_EXTERNAL_REF stores the supplied refs", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      setExternalRef({
        url: "https://snapshot.box/#/aave.eth/proposal/0x123",
        proposalId: "0x123",
      }),
    );
    expect(next.state.global.externalRef).toEqual({
      url: "https://snapshot.box/#/aave.eth/proposal/0x123",
      txHash: null,
      proposalId: "0x123",
    });
  });
});
