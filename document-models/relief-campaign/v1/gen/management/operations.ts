/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ReliefCampaignGlobalState } from "../types.js";
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

export interface ReliefCampaignManagementOperations {
  setCampaignDetailsOperation: (
    state: ReliefCampaignGlobalState,
    action: SetCampaignDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  addContributionAddressOperation: (
    state: ReliefCampaignGlobalState,
    action: AddContributionAddressAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeContributionAddressOperation: (
    state: ReliefCampaignGlobalState,
    action: RemoveContributionAddressAction,
    dispatch?: SignalDispatch,
  ) => void;
  startCampaignOperation: (
    state: ReliefCampaignGlobalState,
    action: StartCampaignAction,
    dispatch?: SignalDispatch,
  ) => void;
  markResolvedOperation: (
    state: ReliefCampaignGlobalState,
    action: MarkResolvedAction,
    dispatch?: SignalDispatch,
  ) => void;
  markFailedOperation: (
    state: ReliefCampaignGlobalState,
    action: MarkFailedAction,
    dispatch?: SignalDispatch,
  ) => void;
  archiveCampaignOperation: (
    state: ReliefCampaignGlobalState,
    action: ArchiveCampaignAction,
    dispatch?: SignalDispatch,
  ) => void;
  addExternalLinkOperation: (
    state: ReliefCampaignGlobalState,
    action: AddExternalLinkAction,
    dispatch?: SignalDispatch,
  ) => void;
  addOperatorWalletOperation: (
    state: ReliefCampaignGlobalState,
    action: AddOperatorWalletAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeOperatorWalletOperation: (
    state: ReliefCampaignGlobalState,
    action: RemoveOperatorWalletAction,
    dispatch?: SignalDispatch,
  ) => void;
}
