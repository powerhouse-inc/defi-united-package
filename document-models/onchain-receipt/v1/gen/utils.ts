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
  assertIsOnchainReceiptDocument,
  assertIsOnchainReceiptState,
  isOnchainReceiptDocument,
  isOnchainReceiptState,
} from "./document-schema.js";
import { onchainReceiptDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  OnchainReceiptGlobalState,
  OnchainReceiptLocalState,
  OnchainReceiptPHState,
} from "./types.js";

export const initialGlobalState: OnchainReceiptGlobalState = {
  chainId: null,
  txHash: null,
  blockNumber: null,
  blockTimestamp: null,
  fromAddress: null,
  toAddress: null,
  asset: null,
  amount: null,
  matchedPledgeId: null,
  reconciliationStatus: "UNMATCHED",
  rawLog: null,
};
export const initialLocalState: OnchainReceiptLocalState = {};

export const utils: DocumentModelUtils<OnchainReceiptPHState> = {
  fileExtension: ".rcpt",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = onchainReceiptDocumentType;

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
    return isOnchainReceiptState(state);
  },
  assertIsStateOfType(state) {
    return assertIsOnchainReceiptState(state);
  },
  isDocumentOfType(document) {
    return isOnchainReceiptDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsOnchainReceiptDocument(document);
  },
};
