/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { StatusUpdateAction } from "./actions.js";
import type { StatusUpdateState as StatusUpdateGlobalState } from "./schema/types.js";

type StatusUpdateLocalState = Record<PropertyKey, never>;

type StatusUpdatePHState = PHBaseState & {
  global: StatusUpdateGlobalState;
  local: StatusUpdateLocalState;
};
type StatusUpdateDocument = PHDocument<StatusUpdatePHState>;

export * from "./schema/types.js";

export type {
  StatusUpdateAction,
  StatusUpdateDocument,
  StatusUpdateGlobalState,
  StatusUpdateLocalState,
  StatusUpdatePHState,
};
