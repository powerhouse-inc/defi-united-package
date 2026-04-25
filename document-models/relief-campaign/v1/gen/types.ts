/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { ReliefCampaignAction } from "./actions.js";
import type { ReliefCampaignState as ReliefCampaignGlobalState } from "./schema/types.js";

type ReliefCampaignLocalState = Record<PropertyKey, never>;

type ReliefCampaignPHState = PHBaseState & {
  global: ReliefCampaignGlobalState;
  local: ReliefCampaignLocalState;
};
type ReliefCampaignDocument = PHDocument<ReliefCampaignPHState>;

export * from "./schema/types.js";

export type {
  ReliefCampaignAction,
  ReliefCampaignDocument,
  ReliefCampaignGlobalState,
  ReliefCampaignLocalState,
  ReliefCampaignPHState,
};
