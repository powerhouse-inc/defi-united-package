import { generateMock } from "document-model";
import {
  addApprovalRef,
  AddApprovalRefInputSchema,
  addRecipient,
  AddRecipientInputSchema,
  approvePlan,
  ApprovePlanInputSchema,
  cancelPlan,
  CancelPlanInputSchema,
  completeDistribution,
  CompleteDistributionInputSchema,
  isDistributionPlanDocument,
  markRecipientFailed,
  MarkRecipientFailedInputSchema,
  markRecipientRefunded,
  MarkRecipientRefundedInputSchema,
  markRecipientSent,
  MarkRecipientSentInputSchema,
  reducer,
  removeRecipient,
  RemoveRecipientInputSchema,
  setMethodology,
  SetMethodologyInputSchema,
  updateRecipient,
  UpdateRecipientInputSchema,
  utils,
} from "document-models/distribution-plan/v1";
import { describe, expect, it } from "vitest";

describe("PlanningOperations", () => {
  it("should handle setMethodology operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetMethodologyInputSchema());

    const updatedDocument = reducer(document, setMethodology(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_METHODOLOGY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addRecipient operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRecipientInputSchema());

    const updatedDocument = reducer(document, addRecipient(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_RECIPIENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateRecipient operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateRecipientInputSchema());

    const updatedDocument = reducer(document, updateRecipient(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_RECIPIENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeRecipient operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveRecipientInputSchema());

    const updatedDocument = reducer(document, removeRecipient(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_RECIPIENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle approvePlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ApprovePlanInputSchema());

    const updatedDocument = reducer(document, approvePlan(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "APPROVE_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markRecipientSent operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkRecipientSentInputSchema());

    const updatedDocument = reducer(document, markRecipientSent(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_RECIPIENT_SENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markRecipientFailed operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkRecipientFailedInputSchema());

    const updatedDocument = reducer(document, markRecipientFailed(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_RECIPIENT_FAILED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markRecipientRefunded operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkRecipientRefundedInputSchema());

    const updatedDocument = reducer(document, markRecipientRefunded(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_RECIPIENT_REFUNDED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle completeDistribution operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CompleteDistributionInputSchema());

    const updatedDocument = reducer(document, completeDistribution(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "COMPLETE_DISTRIBUTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle cancelPlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CancelPlanInputSchema());

    const updatedDocument = reducer(document, cancelPlan(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CANCEL_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addApprovalRef operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddApprovalRefInputSchema());

    const updatedDocument = reducer(document, addApprovalRef(input));

    expect(isDistributionPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_APPROVAL_REF",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
