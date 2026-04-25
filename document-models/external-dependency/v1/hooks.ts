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
  ExternalDependencyAction,
  ExternalDependencyDocument,
} from "document-models/external-dependency/v1";
import {
  assertIsExternalDependencyDocument,
  isExternalDependencyDocument,
} from "./gen/document-schema.js";

/** Hook to get a ExternalDependency document by its id */
export function useExternalDependencyDocumentById(
  documentId: string | null | undefined,
):
  | [ExternalDependencyDocument, DocumentDispatch<ExternalDependencyAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isExternalDependencyDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected ExternalDependency document */
export function useSelectedExternalDependencyDocument(): [
  ExternalDependencyDocument,
  DocumentDispatch<ExternalDependencyAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsExternalDependencyDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all ExternalDependency documents in the selected drive */
export function useExternalDependencyDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isExternalDependencyDocument);
}

/** Hook to get all ExternalDependency documents in the selected folder */
export function useExternalDependencyDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isExternalDependencyDocument);
}
