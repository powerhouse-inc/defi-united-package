import { generateId } from "document-model";
import {
  addApprovalRef,
  addRecipient,
  approvePlan,
  cancelPlan,
  completeDistribution,
  isDistributionPlanDocument,
  markRecipientFailed,
  markRecipientRefunded,
  markRecipientSent,
  reducer,
  removeRecipient,
  setMethodology,
  updateRecipient,
  utils,
} from "document-models/distribution-plan/v1";
import { describe, expect, it } from "vitest";

const ADDR_A = "0xAaaA0000000000000000000000000000000000A1";
const ADDR_B = "0xBbBb0000000000000000000000000000000000b2";
const TX = "0xfeed1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab";

describe("DistributionPlan planning reducer", () => {
  it("starts DRAFT with empty recipients and approvals", () => {
    const doc = utils.createDocument();
    expect(isDistributionPlanDocument(doc)).toBe(true);
    expect(doc.state.global.status).toBe("DRAFT");
    expect(doc.state.global.recipients).toEqual([]);
    expect(doc.state.global.approvalRefs).toEqual([]);
  });

  it("sets methodology and totalAvailable", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      setMethodology({
        methodology: "Pro-rata to verified rsETH holders pre-incident",
        totalAvailable: 70000,
      }),
    );
    expect(next.state.global.methodology).toContain("Pro-rata");
    expect(next.state.global.totalAvailable).toBe(70000);
  });

  it("adds, updates, and removes recipients in DRAFT", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addRecipient({
        id,
        address: ADDR_A,
        chainId: 1,
        allocatedAmount: 10000,
        rationale: "Largest pre-incident holder",
      }),
    );
    expect(doc.state.global.recipients).toHaveLength(1);
    expect(doc.state.global.recipients[0].status).toBe("PLANNED");

    doc = reducer(doc, updateRecipient({ id, allocatedAmount: 12000 }));
    expect(doc.state.global.recipients[0].allocatedAmount).toBe(12000);

    doc = reducer(doc, removeRecipient({ id }));
    expect(doc.state.global.recipients).toEqual([]);
  });

  it("rejects duplicate recipient (same address+chain)", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      addRecipient({
        id: generateId(),
        address: ADDR_A,
        chainId: 1,
        allocatedAmount: 1,
      }),
    );
    doc = reducer(
      doc,
      addRecipient({
        id: generateId(),
        address: "0x" + ADDR_A.slice(2).toLowerCase(),
        chainId: 1,
        allocatedAmount: 1,
      }),
    );
    expect(doc.operations.global[1].error).toBe(
      "Recipient already exists for this chain",
    );
  });

  it("APPROVE_PLAN moves DRAFT → APPROVED", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, approvePlan({ _: null }));
    expect(doc.state.global.status).toBe("APPROVED");
  });

  it("rejects ADD_RECIPIENT after approval", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, approvePlan({ _: null }));
    doc = reducer(
      doc,
      addRecipient({
        id: generateId(),
        address: ADDR_A,
        chainId: 1,
        allocatedAmount: 1,
      }),
    );
    expect(doc.operations.global[1].error).toContain(
      "Cannot add recipient in status APPROVED",
    );
  });

  it("MARK_RECIPIENT_SENT moves plan to EXECUTING and stores tx", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addRecipient({
        id,
        address: ADDR_A,
        chainId: 1,
        allocatedAmount: 1000,
      }),
    );
    doc = reducer(doc, approvePlan({ _: null }));
    doc = reducer(doc, markRecipientSent({ id, txHash: TX }));
    expect(doc.state.global.status).toBe("EXECUTING");
    expect(doc.state.global.recipients[0].status).toBe("SENT");
    expect(doc.state.global.recipients[0].txHash).toBe(TX);
  });

  it("rejects MARK_RECIPIENT_SENT before approval", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addRecipient({
        id,
        address: ADDR_A,
        chainId: 1,
        allocatedAmount: 1000,
      }),
    );
    doc = reducer(doc, markRecipientSent({ id, txHash: TX }));
    expect(doc.operations.global[1].error).toBe(
      "Plan must be APPROVED before sending",
    );
  });

  it("COMPLETE_DISTRIBUTION requires all recipients SENT or REFUNDED", () => {
    let doc = utils.createDocument();
    const idA = generateId();
    const idB = generateId();
    doc = reducer(
      doc,
      addRecipient({
        id: idA,
        address: ADDR_A,
        chainId: 1,
        allocatedAmount: 1000,
      }),
    );
    doc = reducer(
      doc,
      addRecipient({
        id: idB,
        address: ADDR_B,
        chainId: 1,
        allocatedAmount: 2000,
      }),
    );
    doc = reducer(doc, approvePlan({ _: null }));
    doc = reducer(doc, markRecipientSent({ id: idA, txHash: TX }));
    // Try to complete with one PLANNED still
    doc = reducer(doc, completeDistribution({ _: null }));
    expect(doc.operations.global[4].error).toContain(
      "Cannot complete plan with PLANNED or FAILED recipients",
    );

    doc = reducer(doc, markRecipientRefunded({ id: idB }));
    doc = reducer(doc, completeDistribution({ _: null }));
    expect(doc.state.global.status).toBe("COMPLETED");
  });

  it("MARK_RECIPIENT_FAILED records failure but blocks completion", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addRecipient({
        id,
        address: ADDR_A,
        chainId: 1,
        allocatedAmount: 1000,
      }),
    );
    doc = reducer(doc, approvePlan({ _: null }));
    doc = reducer(doc, markRecipientFailed({ id }));
    expect(doc.state.global.recipients[0].status).toBe("FAILED");
    // Still in APPROVED — no SENT yet, so plan stays APPROVED
    expect(doc.state.global.status).toBe("APPROVED");
  });

  it("CANCEL_PLAN flips a non-terminal plan", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, approvePlan({ _: null }));
    doc = reducer(doc, cancelPlan({ _: null }));
    expect(doc.state.global.status).toBe("CANCELLED");
  });

  it("rejects cancelling a completed plan", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addRecipient({
        id,
        address: ADDR_A,
        chainId: 1,
        allocatedAmount: 1000,
      }),
    );
    doc = reducer(doc, approvePlan({ _: null }));
    doc = reducer(doc, markRecipientSent({ id, txHash: TX }));
    doc = reducer(doc, completeDistribution({ _: null }));
    doc = reducer(doc, cancelPlan({ _: null }));
    expect(doc.operations.global[4].error).toContain(
      "Cannot cancel plan in status COMPLETED",
    );
  });

  it("ADD_APPROVAL_REF appends links to votes / proposals", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(
      doc,
      addApprovalRef({
        id,
        url: "https://snapshot.box/#/aave.eth/proposal/0x456",
        label: "Aave DAO approval vote",
      }),
    );
    expect(doc.state.global.approvalRefs).toHaveLength(1);
    expect(doc.state.global.approvalRefs[0].label).toBe(
      "Aave DAO approval vote",
    );
  });
});
