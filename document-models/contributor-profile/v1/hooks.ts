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
  ContributorProfileAction,
  ContributorProfileDocument,
} from "document-models/contributor-profile/v1";
import {
  assertIsContributorProfileDocument,
  isContributorProfileDocument,
} from "./gen/document-schema.js";

/** Hook to get a ContributorProfile document by its id */
export function useContributorProfileDocumentById(
  documentId: string | null | undefined,
):
  | [ContributorProfileDocument, DocumentDispatch<ContributorProfileAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isContributorProfileDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected ContributorProfile document */
export function useSelectedContributorProfileDocument(): [
  ContributorProfileDocument,
  DocumentDispatch<ContributorProfileAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsContributorProfileDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all ContributorProfile documents in the selected drive */
export function useContributorProfileDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isContributorProfileDocument);
}

/** Hook to get all ContributorProfile documents in the selected folder */
export function useContributorProfileDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isContributorProfileDocument);
}
