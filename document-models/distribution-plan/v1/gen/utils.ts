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
import { distributionPlanUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
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
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(
      utils.createState,
      state,
      distributionPlanDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: distributionPlanUpgradeManifest,
    });
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
