import {
  attachGovernance,
  cancelPledge,
  editNotes,
  failPledge,
  isPledgeDocument,
  markConfirmed,
  markGovernancePending,
  markReceived,
  proposePledge,
  reducer,
  utils,
} from "document-models/pledge/v1";
import { describe, expect, it } from "vitest";

const PROFILE_ID = "ph:contrib:mantle";
const RECEIPT_ID_1 = "ph:receipt:001";
const RECEIPT_ID_2 = "ph:receipt:002";

const proposeMantle = () =>
  proposePledge({
    contributorProfileId: PROFILE_ID,
    pledgedAmount: 30000,
    asset: { symbol: "ETH", chainId: 1 },
    publicNotes: "Pending governance vote",
  });

describe("Pledge lifecycle reducer", () => {
  it("starts in PROPOSED with all amounts null", () => {
    const doc = utils.createDocument();
    expect(isPledgeDocument(doc)).toBe(true);
    expect(doc.state.global.status).toBe("PROPOSED");
    expect(doc.state.global.pledgedAmount).toBeNull();
    expect(doc.state.global.receiptIds).toEqual([]);
  });

  it("PROPOSE_PLEDGE sets contributor, amount, asset", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, proposeMantle());
    expect(next.state.global.contributorProfileId).toBe(PROFILE_ID);
    expect(next.state.global.pledgedAmount).toBe(30000);
    expect(next.state.global.asset).toEqual({
      symbol: "ETH",
      chainId: 1,
      address: null,
    });
    expect(next.state.global.publicNotes).toBe("Pending governance vote");
  });

  it("rejects proposing twice", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(doc, proposeMantle());
    expect(doc.operations.global[1].error).toBe(
      "Pledge has already been proposed",
    );
  });

  it("ATTACH_GOVERNANCE then MARK_GOVERNANCE_PENDING", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(
      doc,
      attachGovernance({
        platform: "SNAPSHOT",
        proposalUrl: "https://snapshot.box/#/mantle.eth/proposal/0xabc",
        voteEndDate: "2026-04-30T00:00:00.000Z",
      }),
    );
    expect(doc.state.global.governance?.platform).toBe("SNAPSHOT");
    doc = reducer(doc, markGovernancePending({ _: null }));
    expect(doc.state.global.status).toBe("GOVERNANCE_PENDING");
  });

  it("rejects MARK_GOVERNANCE_PENDING without governance attached", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(doc, markGovernancePending({ _: null }));
    expect(doc.operations.global[1].error).toBe(
      "Cannot mark governance pending without governance details attached",
    );
    expect(doc.state.global.status).toBe("PROPOSED");
  });

  it("happy path: PROPOSED → CONFIRMED → RECEIVED", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(doc, markConfirmed({ _: null }));
    expect(doc.state.global.status).toBe("CONFIRMED");
    doc = reducer(
      doc,
      markReceived({
        receiptId: RECEIPT_ID_1,
        receivedAt: "2026-04-25T12:00:00.000Z",
        amount: 30000,
      }),
    );
    expect(doc.state.global.status).toBe("RECEIVED");
    expect(doc.state.global.receivedAmount).toBe(30000);
    expect(doc.state.global.receiptIds).toEqual([RECEIPT_ID_1]);
  });

  it("MARK_RECEIVED accumulates partial receipts up to pledged amount", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(doc, markConfirmed({ _: null }));
    doc = reducer(
      doc,
      markReceived({
        receiptId: RECEIPT_ID_1,
        receivedAt: "2026-04-25T12:00:00.000Z",
        amount: 10000,
      }),
    );
    expect(doc.state.global.receivedAmount).toBe(10000);
    // After first MARK_RECEIVED, status flips to RECEIVED — the reducer uses
    // RECEIVED as a terminal state once any receipt lands. Subsequent receipts
    // should still be rejected.
    doc = reducer(
      doc,
      markReceived({
        receiptId: RECEIPT_ID_2,
        receivedAt: "2026-04-25T13:00:00.000Z",
        amount: 5000,
      }),
    );
    expect(doc.operations.global[3].error).toBe(
      "Cannot mark received in terminal status RECEIVED",
    );
  });

  it("rejects MARK_RECEIVED when amount exceeds pledged", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(doc, markConfirmed({ _: null }));
    doc = reducer(
      doc,
      markReceived({
        receiptId: RECEIPT_ID_1,
        receivedAt: "2026-04-25T12:00:00.000Z",
        amount: 30001,
      }),
    );
    expect(doc.operations.global[2].error).toContain("would exceed pledged");
    expect(doc.state.global.status).toBe("CONFIRMED");
  });

  it("CANCEL_PLEDGE moves to CANCELLED and appends reason", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(doc, cancelPledge({ reason: "contributor backed out" }));
    expect(doc.state.global.status).toBe("CANCELLED");
    expect(doc.state.global.internalNotes).toContain("contributor backed out");
  });

  it("rejects cancelling a RECEIVED pledge", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(doc, markConfirmed({ _: null }));
    doc = reducer(
      doc,
      markReceived({
        receiptId: RECEIPT_ID_1,
        receivedAt: "2026-04-25T12:00:00.000Z",
        amount: 30000,
      }),
    );
    doc = reducer(doc, cancelPledge({ reason: "too late" }));
    expect(doc.operations.global[3].error).toContain(
      "Cannot cancel pledge in status RECEIVED",
    );
  });

  it("FAIL_PLEDGE moves to FAILED with reason in internal notes", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(doc, failPledge({ reason: "governance rejected" }));
    expect(doc.state.global.status).toBe("FAILED");
    expect(doc.state.global.internalNotes).toContain("governance rejected");
  });

  it("EDIT_NOTES updates both public and internal", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, proposeMantle());
    doc = reducer(
      doc,
      editNotes({
        publicNotes: "Updated public note",
        internalNotes: "Operator-only context",
      }),
    );
    expect(doc.state.global.publicNotes).toBe("Updated public note");
    expect(doc.state.global.internalNotes).toBe("Operator-only context");
  });
});
