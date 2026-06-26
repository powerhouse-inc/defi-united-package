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
import { onchainReceiptUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
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
  ethEquivalentAmount: null,
  ethPriceUsdAtReceipt: null,
  matchedPledgeId: null,
  reconciliationStatus: "UNMATCHED",
  rawLog: null,
};
export const initialLocalState: OnchainReceiptLocalState = {};

export const utils: DocumentModelUtils<OnchainReceiptPHState> = {
  fileExtension: ".rcpt",
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
      onchainReceiptDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: onchainReceiptUpgradeManifest,
    });
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
