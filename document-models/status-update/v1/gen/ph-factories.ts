/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating StatusUpdateDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  StatusUpdateDocument,
  StatusUpdateGlobalState,
  StatusUpdateLocalState,
  StatusUpdatePHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): StatusUpdateGlobalState {
  return {
    publishedAt: null,
    visibility: "INTERNAL",
    authorProfileId: null,
    title: "",
    body: "",
    metricsSnapshot: null,
    externalAnnouncements: [],
  };
}

export function defaultLocalState(): StatusUpdateLocalState {
  return {};
}

export function defaultPHState(): StatusUpdatePHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<StatusUpdateGlobalState>,
): StatusUpdateGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<StatusUpdateLocalState>,
): StatusUpdateLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as StatusUpdateLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<StatusUpdateGlobalState>,
  localState?: Partial<StatusUpdateLocalState>,
): StatusUpdatePHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a StatusUpdateDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createStatusUpdateDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<StatusUpdateGlobalState>;
    local?: Partial<StatusUpdateLocalState>;
  }>,
): StatusUpdateDocument {
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
