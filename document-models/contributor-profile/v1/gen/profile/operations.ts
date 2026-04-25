/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ContributorProfileGlobalState } from "../types.js";
import type {
  AddGovernanceEndpointAction,
  AddWalletAction,
  RemoveGovernanceEndpointAction,
  RemoveWalletAction,
  SetProfileDetailsAction,
  SetTrustLevelAction,
} from "./actions.js";

export interface ContributorProfileProfileOperations {
  setProfileDetailsOperation: (
    state: ContributorProfileGlobalState,
    action: SetProfileDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  addWalletOperation: (
    state: ContributorProfileGlobalState,
    action: AddWalletAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeWalletOperation: (
    state: ContributorProfileGlobalState,
    action: RemoveWalletAction,
    dispatch?: SignalDispatch,
  ) => void;
  addGovernanceEndpointOperation: (
    state: ContributorProfileGlobalState,
    action: AddGovernanceEndpointAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeGovernanceEndpointOperation: (
    state: ContributorProfileGlobalState,
    action: RemoveGovernanceEndpointAction,
    dispatch?: SignalDispatch,
  ) => void;
  setTrustLevelOperation: (
    state: ContributorProfileGlobalState,
    action: SetTrustLevelAction,
    dispatch?: SignalDispatch,
  ) => void;
}
