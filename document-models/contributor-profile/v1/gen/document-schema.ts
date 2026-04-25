/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { contributorProfileDocumentType } from "./document-type.js";
import { ContributorProfileStateSchema } from "./schema/zod.js";
import type {
  ContributorProfileDocument,
  ContributorProfilePHState,
} from "./types.js";

/** Schema for validating the header object of a ContributorProfile document */
export const ContributorProfileDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(contributorProfileDocumentType),
  });

/** Schema for validating the state object of a ContributorProfile document */
export const ContributorProfilePHStateSchema = BaseDocumentStateSchema.extend({
  global: ContributorProfileStateSchema(),
});

export const ContributorProfileDocumentSchema = z.object({
  header: ContributorProfileDocumentHeaderSchema,
  state: ContributorProfilePHStateSchema,
  initialState: ContributorProfilePHStateSchema,
});

/** Simple helper function to check if a state object is a ContributorProfile document state object */
export function isContributorProfileState(
  state: unknown,
): state is ContributorProfilePHState {
  return ContributorProfilePHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a ContributorProfile document state object */
export function assertIsContributorProfileState(
  state: unknown,
): asserts state is ContributorProfilePHState {
  ContributorProfilePHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a ContributorProfile document */
export function isContributorProfileDocument(
  document: unknown,
): document is ContributorProfileDocument {
  return ContributorProfileDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a ContributorProfile document */
export function assertIsContributorProfileDocument(
  document: unknown,
): asserts document is ContributorProfileDocument {
  ContributorProfileDocumentSchema.parse(document);
}
