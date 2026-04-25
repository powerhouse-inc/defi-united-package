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
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = statusUpdateDocumentType;

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
