/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ExternalDependencyGlobalState } from "../types.js";
import type {
  AbandonAction,
  LinkPledgeAction,
  ResolveAction,
  SetDependencyDetailsAction,
  SetExternalRefAction,
  UnlinkPledgeAction,
  UpdateStatusAction,
} from "./actions.js";

export interface ExternalDependencyTrackingOperations {
  setDependencyDetailsOperation: (
    state: ExternalDependencyGlobalState,
    action: SetDependencyDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateStatusOperation: (
    state: ExternalDependencyGlobalState,
    action: UpdateStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkPledgeOperation: (
    state: ExternalDependencyGlobalState,
    action: LinkPledgeAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkPledgeOperation: (
    state: ExternalDependencyGlobalState,
    action: UnlinkPledgeAction,
    dispatch?: SignalDispatch,
  ) => void;
  resolveOperation: (
    state: ExternalDependencyGlobalState,
    action: ResolveAction,
    dispatch?: SignalDispatch,
  ) => void;
  abandonOperation: (
    state: ExternalDependencyGlobalState,
    action: AbandonAction,
    dispatch?: SignalDispatch,
  ) => void;
  setExternalRefOperation: (
    state: ExternalDependencyGlobalState,
    action: SetExternalRefAction,
    dispatch?: SignalDispatch,
  ) => void;
}
