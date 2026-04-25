/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddContributionAddressInput,
  AddExternalLinkInput,
  AddOperatorWalletInput,
  ArchiveCampaignInput,
  MarkFailedInput,
  MarkResolvedInput,
  RemoveContributionAddressInput,
  RemoveOperatorWalletInput,
  SetCampaignDetailsInput,
  StartCampaignInput,
} from "../types.js";

export type SetCampaignDetailsAction = Action & {
  type: "SET_CAMPAIGN_DETAILS";
  input: SetCampaignDetailsInput;
};
export type AddContributionAddressAction = Action & {
  type: "ADD_CONTRIBUTION_ADDRESS";
  input: AddContributionAddressInput;
};
export type RemoveContributionAddressAction = Action & {
  type: "REMOVE_CONTRIBUTION_ADDRESS";
  input: RemoveContributionAddressInput;
};
export type StartCampaignAction = Action & {
  type: "START_CAMPAIGN";
  input: StartCampaignInput;
};
export type MarkResolvedAction = Action & {
  type: "MARK_RESOLVED";
  input: MarkResolvedInput;
};
export type MarkFailedAction = Action & {
  type: "MARK_FAILED";
  input: MarkFailedInput;
};
export type ArchiveCampaignAction = Action & {
  type: "ARCHIVE_CAMPAIGN";
  input: ArchiveCampaignInput;
};
export type AddExternalLinkAction = Action & {
  type: "ADD_EXTERNAL_LINK";
  input: AddExternalLinkInput;
};
export type AddOperatorWalletAction = Action & {
  type: "ADD_OPERATOR_WALLET";
  input: AddOperatorWalletInput;
};
export type RemoveOperatorWalletAction = Action & {
  type: "REMOVE_OPERATOR_WALLET";
  input: RemoveOperatorWalletInput;
};

export type ReliefCampaignManagementAction =
  | SetCampaignDetailsAction
  | AddContributionAddressAction
  | RemoveContributionAddressAction
  | StartCampaignAction
  | MarkResolvedAction
  | MarkFailedAction
  | ArchiveCampaignAction
  | AddExternalLinkAction
  | AddOperatorWalletAction
  | RemoveOperatorWalletAction;
