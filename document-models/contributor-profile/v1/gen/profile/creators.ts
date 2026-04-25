/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddGovernanceEndpointInputSchema,
  AddWalletInputSchema,
  RemoveGovernanceEndpointInputSchema,
  RemoveWalletInputSchema,
  SetProfileDetailsInputSchema,
  SetTrustLevelInputSchema,
} from "../schema/zod.js";
import type {
  AddGovernanceEndpointInput,
  AddWalletInput,
  RemoveGovernanceEndpointInput,
  RemoveWalletInput,
  SetProfileDetailsInput,
  SetTrustLevelInput,
} from "../types.js";
import type {
  AddGovernanceEndpointAction,
  AddWalletAction,
  RemoveGovernanceEndpointAction,
  RemoveWalletAction,
  SetProfileDetailsAction,
  SetTrustLevelAction,
} from "./actions.js";

export const setProfileDetails = (input: SetProfileDetailsInput) =>
  createAction<SetProfileDetailsAction>(
    "SET_PROFILE_DETAILS",
    { ...input },
    undefined,
    SetProfileDetailsInputSchema,
    "global",
  );

export const addWallet = (input: AddWalletInput) =>
  createAction<AddWalletAction>(
    "ADD_WALLET",
    { ...input },
    undefined,
    AddWalletInputSchema,
    "global",
  );

export const removeWallet = (input: RemoveWalletInput) =>
  createAction<RemoveWalletAction>(
    "REMOVE_WALLET",
    { ...input },
    undefined,
    RemoveWalletInputSchema,
    "global",
  );

export const addGovernanceEndpoint = (input: AddGovernanceEndpointInput) =>
  createAction<AddGovernanceEndpointAction>(
    "ADD_GOVERNANCE_ENDPOINT",
    { ...input },
    undefined,
    AddGovernanceEndpointInputSchema,
    "global",
  );

export const removeGovernanceEndpoint = (
  input: RemoveGovernanceEndpointInput,
) =>
  createAction<RemoveGovernanceEndpointAction>(
    "REMOVE_GOVERNANCE_ENDPOINT",
    { ...input },
    undefined,
    RemoveGovernanceEndpointInputSchema,
    "global",
  );

export const setTrustLevel = (input: SetTrustLevelInput) =>
  createAction<SetTrustLevelAction>(
    "SET_TRUST_LEVEL",
    { ...input },
    undefined,
    SetTrustLevelInputSchema,
    "global",
  );
