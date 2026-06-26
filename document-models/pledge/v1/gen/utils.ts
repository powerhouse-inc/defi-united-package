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
import { pledgeUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
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
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(utils.createState, state, pledgeDocumentType);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: pledgeUpgradeManifest,
    });
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
