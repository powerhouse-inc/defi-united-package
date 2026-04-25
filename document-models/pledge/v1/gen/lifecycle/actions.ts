/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AttachGovernanceInput,
  CancelPledgeInput,
  EditNotesInput,
  FailPledgeInput,
  MarkConfirmedInput,
  MarkGovernancePendingInput,
  MarkReceivedInput,
  ProposePledgeInput,
} from "../types.js";

export type ProposePledgeAction = Action & {
  type: "PROPOSE_PLEDGE";
  input: ProposePledgeInput;
};
export type AttachGovernanceAction = Action & {
  type: "ATTACH_GOVERNANCE";
  input: AttachGovernanceInput;
};
export type MarkGovernancePendingAction = Action & {
  type: "MARK_GOVERNANCE_PENDING";
  input: MarkGovernancePendingInput;
};
export type MarkConfirmedAction = Action & {
  type: "MARK_CONFIRMED";
  input: MarkConfirmedInput;
};
export type MarkReceivedAction = Action & {
  type: "MARK_RECEIVED";
  input: MarkReceivedInput;
};
export type CancelPledgeAction = Action & {
  type: "CANCEL_PLEDGE";
  input: CancelPledgeInput;
};
export type FailPledgeAction = Action & {
  type: "FAIL_PLEDGE";
  input: FailPledgeInput;
};
export type EditNotesAction = Action & {
  type: "EDIT_NOTES";
  input: EditNotesInput;
};

export type PledgeLifecycleAction =
  | ProposePledgeAction
  | AttachGovernanceAction
  | MarkGovernancePendingAction
  | MarkConfirmedAction
  | MarkReceivedAction
  | CancelPledgeAction
  | FailPledgeAction
  | EditNotesAction;
