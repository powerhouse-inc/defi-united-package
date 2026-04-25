/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AttachPledgeInput,
  ClearMatchInput,
  MarkAmbiguousInput,
  OverrideMatchInput,
  RecordReceiptInput,
} from "../types.js";

export type RecordReceiptAction = Action & {
  type: "RECORD_RECEIPT";
  input: RecordReceiptInput;
};
export type AttachPledgeAction = Action & {
  type: "ATTACH_PLEDGE";
  input: AttachPledgeInput;
};
export type MarkAmbiguousAction = Action & {
  type: "MARK_AMBIGUOUS";
  input: MarkAmbiguousInput;
};
export type OverrideMatchAction = Action & {
  type: "OVERRIDE_MATCH";
  input: OverrideMatchInput;
};
export type ClearMatchAction = Action & {
  type: "CLEAR_MATCH";
  input: ClearMatchInput;
};

export type OnchainReceiptReconciliationAction =
  | RecordReceiptAction
  | AttachPledgeAction
  | MarkAmbiguousAction
  | OverrideMatchAction
  | ClearMatchAction;
