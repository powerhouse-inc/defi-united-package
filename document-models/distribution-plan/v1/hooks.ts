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
  DistributionPlanAction,
  DistributionPlanDocument,
} from "document-models/distribution-plan/v1";
import {
  assertIsDistributionPlanDocument,
  isDistributionPlanDocument,
} from "./gen/document-schema.js";

/** Hook to get a DistributionPlan document by its id */
export function useDistributionPlanDocumentById(
  documentId: string | null | undefined,
):
  | [DistributionPlanDocument, DocumentDispatch<DistributionPlanAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isDistributionPlanDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected DistributionPlan document */
export function useSelectedDistributionPlanDocument(): [
  DistributionPlanDocument,
  DocumentDispatch<DistributionPlanAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsDistributionPlanDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all DistributionPlan documents in the selected drive */
export function useDistributionPlanDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isDistributionPlanDocument);
}

/** Hook to get all DistributionPlan documents in the selected folder */
export function useDistributionPlanDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isDistributionPlanDocument);
}
