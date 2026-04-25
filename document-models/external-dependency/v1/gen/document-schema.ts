/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { externalDependencyDocumentType } from "./document-type.js";
import { ExternalDependencyStateSchema } from "./schema/zod.js";
import type {
  ExternalDependencyDocument,
  ExternalDependencyPHState,
} from "./types.js";

/** Schema for validating the header object of a ExternalDependency document */
export const ExternalDependencyDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(externalDependencyDocumentType),
  });

/** Schema for validating the state object of a ExternalDependency document */
export const ExternalDependencyPHStateSchema = BaseDocumentStateSchema.extend({
  global: ExternalDependencyStateSchema(),
});

export const ExternalDependencyDocumentSchema = z.object({
  header: ExternalDependencyDocumentHeaderSchema,
  state: ExternalDependencyPHStateSchema,
  initialState: ExternalDependencyPHStateSchema,
});

/** Simple helper function to check if a state object is a ExternalDependency document state object */
export function isExternalDependencyState(
  state: unknown,
): state is ExternalDependencyPHState {
  return ExternalDependencyPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a ExternalDependency document state object */
export function assertIsExternalDependencyState(
  state: unknown,
): asserts state is ExternalDependencyPHState {
  ExternalDependencyPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a ExternalDependency document */
export function isExternalDependencyDocument(
  document: unknown,
): document is ExternalDependencyDocument {
  return ExternalDependencyDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a ExternalDependency document */
export function assertIsExternalDependencyDocument(
  document: unknown,
): asserts document is ExternalDependencyDocument {
  ExternalDependencyDocumentSchema.parse(document);
}
