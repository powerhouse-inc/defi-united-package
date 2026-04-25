/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { statusUpdateDocumentType } from "./document-type.js";
import { StatusUpdateStateSchema } from "./schema/zod.js";
import type { StatusUpdateDocument, StatusUpdatePHState } from "./types.js";

/** Schema for validating the header object of a StatusUpdate document */
export const StatusUpdateDocumentHeaderSchema = BaseDocumentHeaderSchema.extend(
  {
    documentType: z.literal(statusUpdateDocumentType),
  },
);

/** Schema for validating the state object of a StatusUpdate document */
export const StatusUpdatePHStateSchema = BaseDocumentStateSchema.extend({
  global: StatusUpdateStateSchema(),
});

export const StatusUpdateDocumentSchema = z.object({
  header: StatusUpdateDocumentHeaderSchema,
  state: StatusUpdatePHStateSchema,
  initialState: StatusUpdatePHStateSchema,
});

/** Simple helper function to check if a state object is a StatusUpdate document state object */
export function isStatusUpdateState(
  state: unknown,
): state is StatusUpdatePHState {
  return StatusUpdatePHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a StatusUpdate document state object */
export function assertIsStatusUpdateState(
  state: unknown,
): asserts state is StatusUpdatePHState {
  StatusUpdatePHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a StatusUpdate document */
export function isStatusUpdateDocument(
  document: unknown,
): document is StatusUpdateDocument {
  return StatusUpdateDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a StatusUpdate document */
export function assertIsStatusUpdateDocument(
  document: unknown,
): asserts document is StatusUpdateDocument {
  StatusUpdateDocumentSchema.parse(document);
}
