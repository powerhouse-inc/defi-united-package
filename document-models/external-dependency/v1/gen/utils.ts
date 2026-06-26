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
import { externalDependencyUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsExternalDependencyDocument,
  assertIsExternalDependencyState,
  isExternalDependencyDocument,
  isExternalDependencyState,
} from "./document-schema.js";
import { externalDependencyDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  ExternalDependencyGlobalState,
  ExternalDependencyLocalState,
  ExternalDependencyPHState,
} from "./types.js";

export const initialGlobalState: ExternalDependencyGlobalState = {
  title: "",
  description: null,
  kind: "OPERATIONAL",
  blocks: [],
  status: "OPEN",
  externalRef: null,
  expectedResolution: null,
  assignee: null,
};
export const initialLocalState: ExternalDependencyLocalState = {};

export const utils: DocumentModelUtils<ExternalDependencyPHState> = {
  fileExtension: ".dep",
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
      externalDependencyDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: externalDependencyUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isExternalDependencyState(state);
  },
  assertIsStateOfType(state) {
    return assertIsExternalDependencyState(state);
  },
  isDocumentOfType(document) {
    return isExternalDependencyDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsExternalDependencyDocument(document);
  },
};
