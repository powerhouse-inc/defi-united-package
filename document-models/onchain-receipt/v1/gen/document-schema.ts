/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { onchainReceiptDocumentType } from "./document-type.js";
import { OnchainReceiptStateSchema } from "./schema/zod.js";
import type { OnchainReceiptDocument, OnchainReceiptPHState } from "./types.js";

/** Schema for validating the header object of a OnchainReceipt document */
export const OnchainReceiptDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(onchainReceiptDocumentType),
  });

/** Schema for validating the state object of a OnchainReceipt document */
export const OnchainReceiptPHStateSchema = BaseDocumentStateSchema.extend({
  global: OnchainReceiptStateSchema(),
});

export const OnchainReceiptDocumentSchema = z.object({
  header: OnchainReceiptDocumentHeaderSchema,
  state: OnchainReceiptPHStateSchema,
  initialState: OnchainReceiptPHStateSchema,
});

/** Simple helper function to check if a state object is a OnchainReceipt document state object */
export function isOnchainReceiptState(
  state: unknown,
): state is OnchainReceiptPHState {
  return OnchainReceiptPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a OnchainReceipt document state object */
export function assertIsOnchainReceiptState(
  state: unknown,
): asserts state is OnchainReceiptPHState {
  OnchainReceiptPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a OnchainReceipt document */
export function isOnchainReceiptDocument(
  document: unknown,
): document is OnchainReceiptDocument {
  return OnchainReceiptDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a OnchainReceipt document */
export function assertIsOnchainReceiptDocument(
  document: unknown,
): asserts document is OnchainReceiptDocument {
  OnchainReceiptDocumentSchema.parse(document);
}
