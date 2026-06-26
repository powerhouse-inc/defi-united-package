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
import { statusUpdateUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsStatusUpdateDocument,
  assertIsStatusUpdateState,
  isStatusUpdateDocument,
  isStatusUpdateState,
} from "./document-schema.js";
import { statusUpdateDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  StatusUpdateGlobalState,
  StatusUpdateLocalState,
  StatusUpdatePHState,
} from "./types.js";

export const initialGlobalState: StatusUpdateGlobalState = {
  publishedAt: null,
  visibility: "INTERNAL",
  authorProfileId: null,
  title: "",
  body: "",
  metricsSnapshot: null,
  externalAnnouncements: [],
};
export const initialLocalState: StatusUpdateLocalState = {};

export const utils: DocumentModelUtils<StatusUpdatePHState> = {
  fileExtension: ".sup",
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
      statusUpdateDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: statusUpdateUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isStatusUpdateState(state);
  },
  assertIsStateOfType(state) {
    return assertIsStatusUpdateState(state);
  },
  isDocumentOfType(document) {
    return isStatusUpdateDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsStatusUpdateDocument(document);
  },
};
