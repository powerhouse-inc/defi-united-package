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
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = contributorProfileDocumentType;

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
