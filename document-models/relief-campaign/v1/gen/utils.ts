/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseLoadFromInput,
  baseSaveToFileHandle,
  defaultBaseState,
  generateId,
} from "document-model";
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
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = reliefCampaignDocumentType;

    // for backwards compatibility, but this is NOT a valid signed document id
    document.header.id = generateId();

    return document;
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInput(input, reducer);
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
