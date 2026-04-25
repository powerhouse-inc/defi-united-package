/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { ContributorProfileAction } from "./actions.js";
import type { ContributorProfileState as ContributorProfileGlobalState } from "./schema/types.js";

type ContributorProfileLocalState = Record<PropertyKey, never>;

type ContributorProfilePHState = PHBaseState & {
  global: ContributorProfileGlobalState;
  local: ContributorProfileLocalState;
};
type ContributorProfileDocument = PHDocument<ContributorProfilePHState>;

export * from "./schema/types.js";

export type {
  ContributorProfileAction,
  ContributorProfileDocument,
  ContributorProfileGlobalState,
  ContributorProfileLocalState,
  ContributorProfilePHState,
};
