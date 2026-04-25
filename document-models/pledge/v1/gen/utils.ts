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
  assertIsPledgeDocument,
  assertIsPledgeState,
  isPledgeDocument,
  isPledgeState,
} from "./document-schema.js";
import { pledgeDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  PledgeGlobalState,
  PledgeLocalState,
  PledgePHState,
} from "./types.js";

export const initialGlobalState: PledgeGlobalState = {
  contributorProfileId: null,
  pledgedAmount: null,
  asset: null,
  status: "PROPOSED",
  governance: null,
  receivedAmount: null,
  receivedAt: null,
  receiptIds: [],
  publicNotes: null,
  internalNotes: null,
};
export const initialLocalState: PledgeLocalState = {};

export const utils: DocumentModelUtils<PledgePHState> = {
  fileExtension: ".pldg",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = pledgeDocumentType;

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
    return isPledgeState(state);
  },
  assertIsStateOfType(state) {
    return assertIsPledgeState(state);
  },
  isDocumentOfType(document) {
    return isPledgeDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsPledgeDocument(document);
  },
};
