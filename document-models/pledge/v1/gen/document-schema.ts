/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { pledgeDocumentType } from "./document-type.js";
import { PledgeStateSchema } from "./schema/zod.js";
import type { PledgeDocument, PledgePHState } from "./types.js";

/** Schema for validating the header object of a Pledge document */
export const PledgeDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(pledgeDocumentType),
});

/** Schema for validating the state object of a Pledge document */
export const PledgePHStateSchema = BaseDocumentStateSchema.extend({
  global: PledgeStateSchema(),
});

export const PledgeDocumentSchema = z.object({
  header: PledgeDocumentHeaderSchema,
  state: PledgePHStateSchema,
  initialState: PledgePHStateSchema,
});

/** Simple helper function to check if a state object is a Pledge document state object */
export function isPledgeState(state: unknown): state is PledgePHState {
  return PledgePHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a Pledge document state object */
export function assertIsPledgeState(
  state: unknown,
): asserts state is PledgePHState {
  PledgePHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a Pledge document */
export function isPledgeDocument(
  document: unknown,
): document is PledgeDocument {
  return PledgeDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a Pledge document */
export function assertIsPledgeDocument(
  document: unknown,
): asserts document is PledgeDocument {
  PledgeDocumentSchema.parse(document);
}
