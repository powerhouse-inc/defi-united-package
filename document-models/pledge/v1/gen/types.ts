/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { PledgeAction } from "./actions.js";
import type { PledgeState as PledgeGlobalState } from "./schema/types.js";

type PledgeLocalState = Record<PropertyKey, never>;

type PledgePHState = PHBaseState & {
  global: PledgeGlobalState;
  local: PledgeLocalState;
};
type PledgeDocument = PHDocument<PledgePHState>;

export * from "./schema/types.js";

export type {
  PledgeAction,
  PledgeDocument,
  PledgeGlobalState,
  PledgeLocalState,
  PledgePHState,
};
