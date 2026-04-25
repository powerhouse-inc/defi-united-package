/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { distributionPlanDocumentType } from "./document-type.js";
import { DistributionPlanStateSchema } from "./schema/zod.js";
import type {
  DistributionPlanDocument,
  DistributionPlanPHState,
} from "./types.js";

/** Schema for validating the header object of a DistributionPlan document */
export const DistributionPlanDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(distributionPlanDocumentType),
  });

/** Schema for validating the state object of a DistributionPlan document */
export const DistributionPlanPHStateSchema = BaseDocumentStateSchema.extend({
  global: DistributionPlanStateSchema(),
});

export const DistributionPlanDocumentSchema = z.object({
  header: DistributionPlanDocumentHeaderSchema,
  state: DistributionPlanPHStateSchema,
  initialState: DistributionPlanPHStateSchema,
});

/** Simple helper function to check if a state object is a DistributionPlan document state object */
export function isDistributionPlanState(
  state: unknown,
): state is DistributionPlanPHState {
  return DistributionPlanPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a DistributionPlan document state object */
export function assertIsDistributionPlanState(
  state: unknown,
): asserts state is DistributionPlanPHState {
  DistributionPlanPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a DistributionPlan document */
export function isDistributionPlanDocument(
  document: unknown,
): document is DistributionPlanDocument {
  return DistributionPlanDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a DistributionPlan document */
export function assertIsDistributionPlanDocument(
  document: unknown,
): asserts document is DistributionPlanDocument {
  DistributionPlanDocumentSchema.parse(document);
}
