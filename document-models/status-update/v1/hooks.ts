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
  StatusUpdateAction,
  StatusUpdateDocument,
} from "document-models/status-update/v1";
import {
  assertIsStatusUpdateDocument,
  isStatusUpdateDocument,
} from "./gen/document-schema.js";

/** Hook to get a StatusUpdate document by its id */
export function useStatusUpdateDocumentById(
  documentId: string | null | undefined,
):
  | [StatusUpdateDocument, DocumentDispatch<StatusUpdateAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isStatusUpdateDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected StatusUpdate document */
export function useSelectedStatusUpdateDocument(): [
  StatusUpdateDocument,
  DocumentDispatch<StatusUpdateAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsStatusUpdateDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all StatusUpdate documents in the selected drive */
export function useStatusUpdateDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isStatusUpdateDocument);
}

/** Hook to get all StatusUpdate documents in the selected folder */
export function useStatusUpdateDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isStatusUpdateDocument);
}
