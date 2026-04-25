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
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = externalDependencyDocumentType;

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
