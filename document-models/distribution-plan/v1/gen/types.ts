/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { DistributionPlanAction } from "./actions.js";
import type { DistributionPlanState as DistributionPlanGlobalState } from "./schema/types.js";

type DistributionPlanLocalState = Record<PropertyKey, never>;

type DistributionPlanPHState = PHBaseState & {
  global: DistributionPlanGlobalState;
  local: DistributionPlanLocalState;
};
type DistributionPlanDocument = PHDocument<DistributionPlanPHState>;

export * from "./schema/types.js";

export type {
  DistributionPlanAction,
  DistributionPlanDocument,
  DistributionPlanGlobalState,
  DistributionPlanLocalState,
  DistributionPlanPHState,
};
