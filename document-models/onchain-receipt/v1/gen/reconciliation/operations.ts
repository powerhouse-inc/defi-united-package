/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OnchainReceiptGlobalState } from "../types.js";
import type {
  AttachPledgeAction,
  ClearMatchAction,
  MarkAmbiguousAction,
  MarkReorgedAction,
  OverrideMatchAction,
  RecordReceiptAction,
} from "./actions.js";

export interface OnchainReceiptReconciliationOperations {
  recordReceiptOperation: (
    state: OnchainReceiptGlobalState,
    action: RecordReceiptAction,
    dispatch?: SignalDispatch,
  ) => void;
  attachPledgeOperation: (
    state: OnchainReceiptGlobalState,
    action: AttachPledgeAction,
    dispatch?: SignalDispatch,
  ) => void;
  markAmbiguousOperation: (
    state: OnchainReceiptGlobalState,
    action: MarkAmbiguousAction,
    dispatch?: SignalDispatch,
  ) => void;
  overrideMatchOperation: (
    state: OnchainReceiptGlobalState,
    action: OverrideMatchAction,
    dispatch?: SignalDispatch,
  ) => void;
  clearMatchOperation: (
    state: OnchainReceiptGlobalState,
    action: ClearMatchAction,
    dispatch?: SignalDispatch,
  ) => void;
  markReorgedOperation: (
    state: OnchainReceiptGlobalState,
    action: MarkReorgedAction,
    dispatch?: SignalDispatch,
  ) => void;
}
