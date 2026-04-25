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
import type { PledgeAction, PledgeDocument } from "document-models/pledge/v1";
import {
  assertIsPledgeDocument,
  isPledgeDocument,
} from "./gen/document-schema.js";

/** Hook to get a Pledge document by its id */
export function usePledgeDocumentById(
  documentId: string | null | undefined,
): [PledgeDocument, DocumentDispatch<PledgeAction>] | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isPledgeDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected Pledge document */
export function useSelectedPledgeDocument(): [
  PledgeDocument,
  DocumentDispatch<PledgeAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsPledgeDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all Pledge documents in the selected drive */
export function usePledgeDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isPledgeDocument);
}

/** Hook to get all Pledge documents in the selected folder */
export function usePledgeDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isPledgeDocument);
}
