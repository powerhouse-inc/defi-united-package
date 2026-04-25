/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddGovernanceEndpointInput,
  AddWalletInput,
  RemoveGovernanceEndpointInput,
  RemoveWalletInput,
  SetProfileDetailsInput,
  SetTrustLevelInput,
} from "../types.js";

export type SetProfileDetailsAction = Action & {
  type: "SET_PROFILE_DETAILS";
  input: SetProfileDetailsInput;
};
export type AddWalletAction = Action & {
  type: "ADD_WALLET";
  input: AddWalletInput;
};
export type RemoveWalletAction = Action & {
  type: "REMOVE_WALLET";
  input: RemoveWalletInput;
};
export type AddGovernanceEndpointAction = Action & {
  type: "ADD_GOVERNANCE_ENDPOINT";
  input: AddGovernanceEndpointInput;
};
export type RemoveGovernanceEndpointAction = Action & {
  type: "REMOVE_GOVERNANCE_ENDPOINT";
  input: RemoveGovernanceEndpointInput;
};
export type SetTrustLevelAction = Action & {
  type: "SET_TRUST_LEVEL";
  input: SetTrustLevelInput;
};

export type ContributorProfileProfileAction =
  | SetProfileDetailsAction
  | AddWalletAction
  | RemoveWalletAction
  | AddGovernanceEndpointAction
  | RemoveGovernanceEndpointAction
  | SetTrustLevelAction;
