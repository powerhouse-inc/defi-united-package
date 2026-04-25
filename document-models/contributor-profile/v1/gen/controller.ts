/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { PHDocumentController } from "document-model";
import { ContributorProfile } from "../module.js";
import type {
  ContributorProfileAction,
  ContributorProfilePHState,
} from "./types.js";

export const ContributorProfileController =
  PHDocumentController.forDocumentModel<
    ContributorProfilePHState,
    ContributorProfileAction
  >(ContributorProfile);
