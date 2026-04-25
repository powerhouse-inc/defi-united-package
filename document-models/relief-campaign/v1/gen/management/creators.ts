/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddContributionAddressInputSchema,
  AddExternalLinkInputSchema,
  AddOperatorWalletInputSchema,
  ArchiveCampaignInputSchema,
  MarkFailedInputSchema,
  MarkResolvedInputSchema,
  RemoveContributionAddressInputSchema,
  RemoveOperatorWalletInputSchema,
  SetCampaignDetailsInputSchema,
  StartCampaignInputSchema,
} from "../schema/zod.js";
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
import type {
  AddContributionAddressAction,
  AddExternalLinkAction,
  AddOperatorWalletAction,
  ArchiveCampaignAction,
  MarkFailedAction,
  MarkResolvedAction,
  RemoveContributionAddressAction,
  RemoveOperatorWalletAction,
  SetCampaignDetailsAction,
  StartCampaignAction,
} from "./actions.js";

export const setCampaignDetails = (input: SetCampaignDetailsInput) =>
  createAction<SetCampaignDetailsAction>(
    "SET_CAMPAIGN_DETAILS",
    { ...input },
    undefined,
    SetCampaignDetailsInputSchema,
    "global",
  );

export const addContributionAddress = (input: AddContributionAddressInput) =>
  createAction<AddContributionAddressAction>(
    "ADD_CONTRIBUTION_ADDRESS",
    { ...input },
    undefined,
    AddContributionAddressInputSchema,
    "global",
  );

export const removeContributionAddress = (
  input: RemoveContributionAddressInput,
) =>
  createAction<RemoveContributionAddressAction>(
    "REMOVE_CONTRIBUTION_ADDRESS",
    { ...input },
    undefined,
    RemoveContributionAddressInputSchema,
    "global",
  );

export const startCampaign = (input: StartCampaignInput) =>
  createAction<StartCampaignAction>(
    "START_CAMPAIGN",
    { ...input },
    undefined,
    StartCampaignInputSchema,
    "global",
  );

export const markResolved = (input: MarkResolvedInput) =>
  createAction<MarkResolvedAction>(
    "MARK_RESOLVED",
    { ...input },
    undefined,
    MarkResolvedInputSchema,
    "global",
  );

export const markFailed = (input: MarkFailedInput) =>
  createAction<MarkFailedAction>(
    "MARK_FAILED",
    { ...input },
    undefined,
    MarkFailedInputSchema,
    "global",
  );

export const archiveCampaign = (input: ArchiveCampaignInput) =>
  createAction<ArchiveCampaignAction>(
    "ARCHIVE_CAMPAIGN",
    { ...input },
    undefined,
    ArchiveCampaignInputSchema,
    "global",
  );

export const addExternalLink = (input: AddExternalLinkInput) =>
  createAction<AddExternalLinkAction>(
    "ADD_EXTERNAL_LINK",
    { ...input },
    undefined,
    AddExternalLinkInputSchema,
    "global",
  );

export const addOperatorWallet = (input: AddOperatorWalletInput) =>
  createAction<AddOperatorWalletAction>(
    "ADD_OPERATOR_WALLET",
    { ...input },
    undefined,
    AddOperatorWalletInputSchema,
    "global",
  );

export const removeOperatorWallet = (input: RemoveOperatorWalletInput) =>
  createAction<RemoveOperatorWalletAction>(
    "REMOVE_OPERATOR_WALLET",
    { ...input },
    undefined,
    RemoveOperatorWalletInputSchema,
    "global",
  );
