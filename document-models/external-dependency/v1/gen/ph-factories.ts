/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating ExternalDependencyDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  ExternalDependencyDocument,
  ExternalDependencyGlobalState,
  ExternalDependencyLocalState,
  ExternalDependencyPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): ExternalDependencyGlobalState {
  return {
    title: "",
    description: null,
    kind: "OPERATIONAL",
    blocks: [],
    status: "OPEN",
    externalRef: null,
    expectedResolution: null,
    assignee: null,
  };
}

export function defaultLocalState(): ExternalDependencyLocalState {
  return {};
}

export function defaultPHState(): ExternalDependencyPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<ExternalDependencyGlobalState>,
): ExternalDependencyGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<ExternalDependencyLocalState>,
): ExternalDependencyLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as ExternalDependencyLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<ExternalDependencyGlobalState>,
  localState?: Partial<ExternalDependencyLocalState>,
): ExternalDependencyPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a ExternalDependencyDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createExternalDependencyDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<ExternalDependencyGlobalState>;
    local?: Partial<ExternalDependencyLocalState>;
  }>,
): ExternalDependencyDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
