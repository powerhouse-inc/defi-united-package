/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentModelUtils, PHBaseState, Reducer } from "document-model";
import {
  baseCreateDocument,
  baseLoadFromInputVersioned,
  baseSaveToFileHandle,
  createBaseState,
} from "document-model";
import { reliefCampaignUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsReliefCampaignDocument,
  assertIsReliefCampaignState,
  isReliefCampaignDocument,
  isReliefCampaignState,
} from "./document-schema.js";
import { reliefCampaignDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  ReliefCampaignGlobalState,
  ReliefCampaignLocalState,
  ReliefCampaignPHState,
} from "./types.js";

export const initialGlobalState: ReliefCampaignGlobalState = {
  name: "",
  slug: "",
  summary: null,
  incidentDate: null,
  status: "DRAFT",
  targetAmount: null,
  affectedAsset: null,
  contributionAddresses: [],
  riskDisclaimer: null,
  externalLinks: [],
  contributorRegistryDriveId: null,
  operatorWallets: [],
};
export const initialLocalState: ReliefCampaignLocalState = {};

export const utils: DocumentModelUtils<ReliefCampaignPHState> = {
  fileExtension: ".rcmp",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(
      utils.createState,
      state,
      reliefCampaignDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: reliefCampaignUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isReliefCampaignState(state);
  },
  assertIsStateOfType(state) {
    return assertIsReliefCampaignState(state);
  },
  isDocumentOfType(document) {
    return isReliefCampaignDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsReliefCampaignDocument(document);
  },
};
