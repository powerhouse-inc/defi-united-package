/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating ReliefCampaignDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  ReliefCampaignDocument,
  ReliefCampaignGlobalState,
  ReliefCampaignLocalState,
  ReliefCampaignPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): ReliefCampaignGlobalState {
  return {
    name: "",
    slug: "",
    summary: null,
    incidentDate: null,
    status: "DRAFT",
    targetAmount: null,
    affectedAsset: null,
    contributionAddresses: [],
    riskDisclaimer: null,
    externalLinks: [],
    contributorRegistryDriveId: null,
    operatorWallets: [],
  };
}

export function defaultLocalState(): ReliefCampaignLocalState {
  return {};
}

export function defaultPHState(): ReliefCampaignPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<ReliefCampaignGlobalState>,
): ReliefCampaignGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<ReliefCampaignLocalState>,
): ReliefCampaignLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as ReliefCampaignLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<ReliefCampaignGlobalState>,
  localState?: Partial<ReliefCampaignLocalState>,
): ReliefCampaignPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a ReliefCampaignDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createReliefCampaignDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<ReliefCampaignGlobalState>;
    local?: Partial<ReliefCampaignLocalState>;
  }>,
): ReliefCampaignDocument {
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
