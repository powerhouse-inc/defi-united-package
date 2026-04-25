/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating OnchainReceiptDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  OnchainReceiptDocument,
  OnchainReceiptGlobalState,
  OnchainReceiptLocalState,
  OnchainReceiptPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): OnchainReceiptGlobalState {
  return {
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
}

export function defaultLocalState(): OnchainReceiptLocalState {
  return {};
}

export function defaultPHState(): OnchainReceiptPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<OnchainReceiptGlobalState>,
): OnchainReceiptGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<OnchainReceiptLocalState>,
): OnchainReceiptLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as OnchainReceiptLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<OnchainReceiptGlobalState>,
  localState?: Partial<OnchainReceiptLocalState>,
): OnchainReceiptPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a OnchainReceiptDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createOnchainReceiptDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<OnchainReceiptGlobalState>;
    local?: Partial<OnchainReceiptLocalState>;
  }>,
): OnchainReceiptDocument {
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
