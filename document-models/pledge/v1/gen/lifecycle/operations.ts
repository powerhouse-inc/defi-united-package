/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { PledgeGlobalState } from "../types.js";
import type {
  AttachGovernanceAction,
  CancelPledgeAction,
  EditNotesAction,
  FailPledgeAction,
  MarkConfirmedAction,
  MarkGovernancePendingAction,
  MarkReceivedAction,
  ProposePledgeAction,
} from "./actions.js";

export interface PledgeLifecycleOperations {
  proposePledgeOperation: (
    state: PledgeGlobalState,
    action: ProposePledgeAction,
    dispatch?: SignalDispatch,
  ) => void;
  attachGovernanceOperation: (
    state: PledgeGlobalState,
    action: AttachGovernanceAction,
    dispatch?: SignalDispatch,
  ) => void;
  markGovernancePendingOperation: (
    state: PledgeGlobalState,
    action: MarkGovernancePendingAction,
    dispatch?: SignalDispatch,
  ) => void;
  markConfirmedOperation: (
    state: PledgeGlobalState,
    action: MarkConfirmedAction,
    dispatch?: SignalDispatch,
  ) => void;
  markReceivedOperation: (
    state: PledgeGlobalState,
    action: MarkReceivedAction,
    dispatch?: SignalDispatch,
  ) => void;
  cancelPledgeOperation: (
    state: PledgeGlobalState,
    action: CancelPledgeAction,
    dispatch?: SignalDispatch,
  ) => void;
  failPledgeOperation: (
    state: PledgeGlobalState,
    action: FailPledgeAction,
    dispatch?: SignalDispatch,
  ) => void;
  editNotesOperation: (
    state: PledgeGlobalState,
    action: EditNotesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
