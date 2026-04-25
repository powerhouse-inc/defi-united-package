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
  assertIsDistributionPlanDocument,
  assertIsDistributionPlanState,
  isDistributionPlanDocument,
  isDistributionPlanState,
} from "./document-schema.js";
import { distributionPlanDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  DistributionPlanGlobalState,
  DistributionPlanLocalState,
  DistributionPlanPHState,
} from "./types.js";

export const initialGlobalState: DistributionPlanGlobalState = {
  status: "DRAFT",
  methodology: null,
  totalAvailable: null,
  recipients: [],
  approvalRefs: [],
};
export const initialLocalState: DistributionPlanLocalState = {};

export const utils: DocumentModelUtils<DistributionPlanPHState> = {
  fileExtension: ".dist",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = distributionPlanDocumentType;

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
    return isDistributionPlanState(state);
  },
  assertIsStateOfType(state) {
    return assertIsDistributionPlanState(state);
  },
  isDocumentOfType(document) {
    return isDistributionPlanDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsDistributionPlanDocument(document);
  },
};
