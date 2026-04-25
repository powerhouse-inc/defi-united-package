/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating ContributorProfileDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  ContributorProfileDocument,
  ContributorProfileGlobalState,
  ContributorProfileLocalState,
  ContributorProfilePHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): ContributorProfileGlobalState {
  return {
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
}

export function defaultLocalState(): ContributorProfileLocalState {
  return {};
}

export function defaultPHState(): ContributorProfilePHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<ContributorProfileGlobalState>,
): ContributorProfileGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<ContributorProfileLocalState>,
): ContributorProfileLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as ContributorProfileLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<ContributorProfileGlobalState>,
  localState?: Partial<ContributorProfileLocalState>,
): ContributorProfilePHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a ContributorProfileDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createContributorProfileDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<ContributorProfileGlobalState>;
    local?: Partial<ContributorProfileLocalState>;
  }>,
): ContributorProfileDocument {
  const document = utils.createDocument(
    state
      ? createState(
          createBaseState(state.auth, state.document),
          state.global,
          state.local,
        )
      : undefined,
  );

  return document;
}
