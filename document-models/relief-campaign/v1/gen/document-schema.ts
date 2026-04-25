/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { reliefCampaignDocumentType } from "./document-type.js";
import { ReliefCampaignStateSchema } from "./schema/zod.js";
import type { ReliefCampaignDocument, ReliefCampaignPHState } from "./types.js";

/** Schema for validating the header object of a ReliefCampaign document */
export const ReliefCampaignDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(reliefCampaignDocumentType),
  });

/** Schema for validating the state object of a ReliefCampaign document */
export const ReliefCampaignPHStateSchema = BaseDocumentStateSchema.extend({
  global: ReliefCampaignStateSchema(),
});

export const ReliefCampaignDocumentSchema = z.object({
  header: ReliefCampaignDocumentHeaderSchema,
  state: ReliefCampaignPHStateSchema,
  initialState: ReliefCampaignPHStateSchema,
});

/** Simple helper function to check if a state object is a ReliefCampaign document state object */
export function isReliefCampaignState(
  state: unknown,
): state is ReliefCampaignPHState {
  return ReliefCampaignPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a ReliefCampaign document state object */
export function assertIsReliefCampaignState(
  state: unknown,
): asserts state is ReliefCampaignPHState {
  ReliefCampaignPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a ReliefCampaign document */
export function isReliefCampaignDocument(
  document: unknown,
): document is ReliefCampaignDocument {
  return ReliefCampaignDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a ReliefCampaign document */
export function assertIsReliefCampaignDocument(
  document: unknown,
): asserts document is ReliefCampaignDocument {
  ReliefCampaignDocumentSchema.parse(document);
}
