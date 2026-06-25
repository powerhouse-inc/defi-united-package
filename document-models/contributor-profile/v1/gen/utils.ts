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
import { contributorProfileUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsContributorProfileDocument,
  assertIsContributorProfileState,
  isContributorProfileDocument,
  isContributorProfileState,
} from "./document-schema.js";
import { contributorProfileDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  ContributorProfileGlobalState,
  ContributorProfileLocalState,
  ContributorProfilePHState,
} from "./types.js";

export const initialGlobalState: ContributorProfileGlobalState = {
  legalName: null,
  displayName: "",
  kind: "DAO",
  websiteUrl: null,
  twitterHandle: null,
  farcasterHandle: null,
  walletAddresses: [],
  governanceEndpoints: [],
  trustLevel: "ANNOUNCED",
};
export const initialLocalState: ContributorProfileLocalState = {};

export const utils: DocumentModelUtils<ContributorProfilePHState> = {
  fileExtension: ".cprf",
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
      contributorProfileDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: contributorProfileUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isContributorProfileState(state);
  },
  assertIsStateOfType(state) {
    return assertIsContributorProfileState(state);
  },
  isDocumentOfType(document) {
    return isContributorProfileDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsContributorProfileDocument(document);
  },
};
