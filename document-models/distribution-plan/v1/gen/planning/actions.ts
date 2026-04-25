/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddApprovalRefInput,
  AddRecipientInput,
  ApprovePlanInput,
  CancelPlanInput,
  CompleteDistributionInput,
  MarkRecipientFailedInput,
  MarkRecipientRefundedInput,
  MarkRecipientSentInput,
  RemoveRecipientInput,
  SetMethodologyInput,
  UpdateRecipientInput,
} from "../types.js";

export type SetMethodologyAction = Action & {
  type: "SET_METHODOLOGY";
  input: SetMethodologyInput;
};
export type AddRecipientAction = Action & {
  type: "ADD_RECIPIENT";
  input: AddRecipientInput;
};
export type UpdateRecipientAction = Action & {
  type: "UPDATE_RECIPIENT";
  input: UpdateRecipientInput;
};
export type RemoveRecipientAction = Action & {
  type: "REMOVE_RECIPIENT";
  input: RemoveRecipientInput;
};
export type ApprovePlanAction = Action & {
  type: "APPROVE_PLAN";
  input: ApprovePlanInput;
};
export type MarkRecipientSentAction = Action & {
  type: "MARK_RECIPIENT_SENT";
  input: MarkRecipientSentInput;
};
export type MarkRecipientFailedAction = Action & {
  type: "MARK_RECIPIENT_FAILED";
  input: MarkRecipientFailedInput;
};
export type MarkRecipientRefundedAction = Action & {
  type: "MARK_RECIPIENT_REFUNDED";
  input: MarkRecipientRefundedInput;
};
export type CompleteDistributionAction = Action & {
  type: "COMPLETE_DISTRIBUTION";
  input: CompleteDistributionInput;
};
export type CancelPlanAction = Action & {
  type: "CANCEL_PLAN";
  input: CancelPlanInput;
};
export type AddApprovalRefAction = Action & {
  type: "ADD_APPROVAL_REF";
  input: AddApprovalRefInput;
};

export type DistributionPlanPlanningAction =
  | SetMethodologyAction
  | AddRecipientAction
  | UpdateRecipientAction
  | RemoveRecipientAction
  | ApprovePlanAction
  | MarkRecipientSentAction
  | MarkRecipientFailedAction
  | MarkRecipientRefundedAction
  | CompleteDistributionAction
  | CancelPlanAction
  | AddApprovalRefAction;
