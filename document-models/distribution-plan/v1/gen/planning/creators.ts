/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddApprovalRefInputSchema,
  AddRecipientInputSchema,
  ApprovePlanInputSchema,
  CancelPlanInputSchema,
  CompleteDistributionInputSchema,
  MarkRecipientFailedInputSchema,
  MarkRecipientRefundedInputSchema,
  MarkRecipientSentInputSchema,
  RemoveRecipientInputSchema,
  SetMethodologyInputSchema,
  UpdateRecipientInputSchema,
} from "../schema/zod.js";
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
import type {
  AddApprovalRefAction,
  AddRecipientAction,
  ApprovePlanAction,
  CancelPlanAction,
  CompleteDistributionAction,
  MarkRecipientFailedAction,
  MarkRecipientRefundedAction,
  MarkRecipientSentAction,
  RemoveRecipientAction,
  SetMethodologyAction,
  UpdateRecipientAction,
} from "./actions.js";

export const setMethodology = (input: SetMethodologyInput) =>
  createAction<SetMethodologyAction>(
    "SET_METHODOLOGY",
    { ...input },
    undefined,
    SetMethodologyInputSchema,
    "global",
  );

export const addRecipient = (input: AddRecipientInput) =>
  createAction<AddRecipientAction>(
    "ADD_RECIPIENT",
    { ...input },
    undefined,
    AddRecipientInputSchema,
    "global",
  );

export const updateRecipient = (input: UpdateRecipientInput) =>
  createAction<UpdateRecipientAction>(
    "UPDATE_RECIPIENT",
    { ...input },
    undefined,
    UpdateRecipientInputSchema,
    "global",
  );

export const removeRecipient = (input: RemoveRecipientInput) =>
  createAction<RemoveRecipientAction>(
    "REMOVE_RECIPIENT",
    { ...input },
    undefined,
    RemoveRecipientInputSchema,
    "global",
  );

export const approvePlan = (input: ApprovePlanInput) =>
  createAction<ApprovePlanAction>(
    "APPROVE_PLAN",
    { ...input },
    undefined,
    ApprovePlanInputSchema,
    "global",
  );

export const markRecipientSent = (input: MarkRecipientSentInput) =>
  createAction<MarkRecipientSentAction>(
    "MARK_RECIPIENT_SENT",
    { ...input },
    undefined,
    MarkRecipientSentInputSchema,
    "global",
  );

export const markRecipientFailed = (input: MarkRecipientFailedInput) =>
  createAction<MarkRecipientFailedAction>(
    "MARK_RECIPIENT_FAILED",
    { ...input },
    undefined,
    MarkRecipientFailedInputSchema,
    "global",
  );

export const markRecipientRefunded = (input: MarkRecipientRefundedInput) =>
  createAction<MarkRecipientRefundedAction>(
    "MARK_RECIPIENT_REFUNDED",
    { ...input },
    undefined,
    MarkRecipientRefundedInputSchema,
    "global",
  );

export const completeDistribution = (input: CompleteDistributionInput) =>
  createAction<CompleteDistributionAction>(
    "COMPLETE_DISTRIBUTION",
    { ...input },
    undefined,
    CompleteDistributionInputSchema,
    "global",
  );

export const cancelPlan = (input: CancelPlanInput) =>
  createAction<CancelPlanAction>(
    "CANCEL_PLAN",
    { ...input },
    undefined,
    CancelPlanInputSchema,
    "global",
  );

export const addApprovalRef = (input: AddApprovalRefInput) =>
  createAction<AddApprovalRefAction>(
    "ADD_APPROVAL_REF",
    { ...input },
    undefined,
    AddApprovalRefInputSchema,
    "global",
  );
