/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  OnchainReceiptAction,
  OnchainReceiptDocument,
} from "document-models/onchain-receipt/v1";
import {
  assertIsOnchainReceiptDocument,
  isOnchainReceiptDocument,
} from "./gen/document-schema.js";

/** Hook to get a OnchainReceipt document by its id */
export function useOnchainReceiptDocumentById(
  documentId: string | null | undefined,
):
  | [OnchainReceiptDocument, DocumentDispatch<OnchainReceiptAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isOnchainReceiptDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected OnchainReceipt document */
export function useSelectedOnchainReceiptDocument(): [
  OnchainReceiptDocument,
  DocumentDispatch<OnchainReceiptAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsOnchainReceiptDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all OnchainReceipt documents in the selected drive */
export function useOnchainReceiptDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isOnchainReceiptDocument);
}

/** Hook to get all OnchainReceipt documents in the selected folder */
export function useOnchainReceiptDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isOnchainReceiptDocument);
}
