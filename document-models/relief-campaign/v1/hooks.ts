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
  ReliefCampaignAction,
  ReliefCampaignDocument,
} from "document-models/relief-campaign/v1";
import {
  assertIsReliefCampaignDocument,
  isReliefCampaignDocument,
} from "./gen/document-schema.js";

/** Hook to get a ReliefCampaign document by its id */
export function useReliefCampaignDocumentById(
  documentId: string | null | undefined,
):
  | [ReliefCampaignDocument, DocumentDispatch<ReliefCampaignAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isReliefCampaignDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected ReliefCampaign document */
export function useSelectedReliefCampaignDocument(): [
  ReliefCampaignDocument,
  DocumentDispatch<ReliefCampaignAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsReliefCampaignDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all ReliefCampaign documents in the selected drive */
export function useReliefCampaignDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isReliefCampaignDocument);
}

/** Hook to get all ReliefCampaign documents in the selected folder */
export function useReliefCampaignDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isReliefCampaignDocument);
}
