/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating PledgeDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  PledgeDocument,
  PledgeGlobalState,
  PledgeLocalState,
  PledgePHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): PledgeGlobalState {
  return {
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
}

export function defaultLocalState(): PledgeLocalState {
  return {};
}

export function defaultPHState(): PledgePHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<PledgeGlobalState>,
): PledgeGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<PledgeLocalState>,
): PledgeLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as PledgeLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<PledgeGlobalState>,
  localState?: Partial<PledgeLocalState>,
): PledgePHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a PledgeDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createPledgeDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<PledgeGlobalState>;
    local?: Partial<PledgeLocalState>;
  }>,
): PledgeDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
