/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { ExternalDependencyAction } from "./actions.js";
import type { ExternalDependencyState as ExternalDependencyGlobalState } from "./schema/types.js";

type ExternalDependencyLocalState = Record<PropertyKey, never>;

type ExternalDependencyPHState = PHBaseState & {
  global: ExternalDependencyGlobalState;
  local: ExternalDependencyLocalState;
};
type ExternalDependencyDocument = PHDocument<ExternalDependencyPHState>;

export * from "./schema/types.js";

export type {
  ExternalDependencyAction,
  ExternalDependencyDocument,
  ExternalDependencyGlobalState,
  ExternalDependencyLocalState,
  ExternalDependencyPHState,
};
