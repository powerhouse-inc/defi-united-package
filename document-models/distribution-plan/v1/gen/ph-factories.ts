/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating DistributionPlanDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  DistributionPlanDocument,
  DistributionPlanGlobalState,
  DistributionPlanLocalState,
  DistributionPlanPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): DistributionPlanGlobalState {
  return {
    status: "DRAFT",
    methodology: null,
    totalAvailable: null,
    recipients: [],
    approvalRefs: [],
  };
}

export function defaultLocalState(): DistributionPlanLocalState {
  return {};
}

export function defaultPHState(): DistributionPlanPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<DistributionPlanGlobalState>,
): DistributionPlanGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<DistributionPlanLocalState>,
): DistributionPlanLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as DistributionPlanLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<DistributionPlanGlobalState>,
  localState?: Partial<DistributionPlanLocalState>,
): DistributionPlanPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a DistributionPlanDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createDistributionPlanDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<DistributionPlanGlobalState>;
    local?: Partial<DistributionPlanLocalState>;
  }>,
): DistributionPlanDocument {
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
