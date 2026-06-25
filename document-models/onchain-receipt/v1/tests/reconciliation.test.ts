import { generateMock } from "document-model";
import {
  attachPledge,
  AttachPledgeInputSchema,
  clearMatch,
  ClearMatchInputSchema,
  isOnchainReceiptDocument,
  markAmbiguous,
  MarkAmbiguousInputSchema,
  markReorged,
  MarkReorgedInputSchema,
  overrideMatch,
  OverrideMatchInputSchema,
  recordReceipt,
  RecordReceiptInputSchema,
  reducer,
  utils,
} from "document-models/onchain-receipt/v1";
import { describe, expect, it } from "vitest";

describe("ReconciliationOperations", () => {
  it("should handle recordReceipt operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RecordReceiptInputSchema());

    const updatedDocument = reducer(document, recordReceipt(input));

    expect(isOnchainReceiptDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RECORD_RECEIPT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle attachPledge operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AttachPledgeInputSchema());

    const updatedDocument = reducer(document, attachPledge(input));

    expect(isOnchainReceiptDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ATTACH_PLEDGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markAmbiguous operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkAmbiguousInputSchema());

    const updatedDocument = reducer(document, markAmbiguous(input));

    expect(isOnchainReceiptDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_AMBIGUOUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle overrideMatch operation", () => {
    const document = utils.createDocument();
    const input = generateMock(OverrideMatchInputSchema());

    const updatedDocument = reducer(document, overrideMatch(input));

    expect(isOnchainReceiptDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "OVERRIDE_MATCH",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle clearMatch operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ClearMatchInputSchema());

    const updatedDocument = reducer(document, clearMatch(input));

    expect(isOnchainReceiptDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CLEAR_MATCH",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markReorged operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkReorgedInputSchema());

    const updatedDocument = reducer(document, markReorged(input));

    expect(isOnchainReceiptDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_REORGED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
