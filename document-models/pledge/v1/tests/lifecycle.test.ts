import { generateMock } from "document-model";
import {
  attachGovernance,
  AttachGovernanceInputSchema,
  cancelPledge,
  CancelPledgeInputSchema,
  editNotes,
  EditNotesInputSchema,
  failPledge,
  FailPledgeInputSchema,
  isPledgeDocument,
  markConfirmed,
  MarkConfirmedInputSchema,
  markGovernancePending,
  MarkGovernancePendingInputSchema,
  markReceived,
  MarkReceivedInputSchema,
  proposePledge,
  ProposePledgeInputSchema,
  reducer,
  utils,
} from "document-models/pledge/v1";
import { describe, expect, it } from "vitest";

describe("LifecycleOperations", () => {
  it("should handle proposePledge operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ProposePledgeInputSchema());

    const updatedDocument = reducer(document, proposePledge(input));

    expect(isPledgeDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "PROPOSE_PLEDGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle attachGovernance operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AttachGovernanceInputSchema(), {
      voteEndDate: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, attachGovernance(input));

    expect(isPledgeDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ATTACH_GOVERNANCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markGovernancePending operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkGovernancePendingInputSchema());

    const updatedDocument = reducer(document, markGovernancePending(input));

    expect(isPledgeDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_GOVERNANCE_PENDING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markConfirmed operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkConfirmedInputSchema());

    const updatedDocument = reducer(document, markConfirmed(input));

    expect(isPledgeDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_CONFIRMED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markReceived operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkReceivedInputSchema(), {
      receivedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, markReceived(input));

    expect(isPledgeDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_RECEIVED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle cancelPledge operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CancelPledgeInputSchema());

    const updatedDocument = reducer(document, cancelPledge(input));

    expect(isPledgeDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CANCEL_PLEDGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle failPledge operation", () => {
    const document = utils.createDocument();
    const input = generateMock(FailPledgeInputSchema());

    const updatedDocument = reducer(document, failPledge(input));

    expect(isPledgeDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "FAIL_PLEDGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle editNotes operation", () => {
    const document = utils.createDocument();
    const input = generateMock(EditNotesInputSchema());

    const updatedDocument = reducer(document, editNotes(input));

    expect(isPledgeDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("EDIT_NOTES");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
