/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { DistributionPlanGlobalState } from "../types.js";
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

export interface DistributionPlanPlanningOperations {
  setMethodologyOperation: (
    state: DistributionPlanGlobalState,
    action: SetMethodologyAction,
    dispatch?: SignalDispatch,
  ) => void;
  addRecipientOperation: (
    state: DistributionPlanGlobalState,
    action: AddRecipientAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRecipientOperation: (
    state: DistributionPlanGlobalState,
    action: UpdateRecipientAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRecipientOperation: (
    state: DistributionPlanGlobalState,
    action: RemoveRecipientAction,
    dispatch?: SignalDispatch,
  ) => void;
  approvePlanOperation: (
    state: DistributionPlanGlobalState,
    action: ApprovePlanAction,
    dispatch?: SignalDispatch,
  ) => void;
  markRecipientSentOperation: (
    state: DistributionPlanGlobalState,
    action: MarkRecipientSentAction,
    dispatch?: SignalDispatch,
  ) => void;
  markRecipientFailedOperation: (
    state: DistributionPlanGlobalState,
    action: MarkRecipientFailedAction,
    dispatch?: SignalDispatch,
  ) => void;
  markRecipientRefundedOperation: (
    state: DistributionPlanGlobalState,
    action: MarkRecipientRefundedAction,
    dispatch?: SignalDispatch,
  ) => void;
  completeDistributionOperation: (
    state: DistributionPlanGlobalState,
    action: CompleteDistributionAction,
    dispatch?: SignalDispatch,
  ) => void;
  cancelPlanOperation: (
    state: DistributionPlanGlobalState,
    action: CancelPlanAction,
    dispatch?: SignalDispatch,
  ) => void;
  addApprovalRefOperation: (
    state: DistributionPlanGlobalState,
    action: AddApprovalRefAction,
    dispatch?: SignalDispatch,
  ) => void;
}
