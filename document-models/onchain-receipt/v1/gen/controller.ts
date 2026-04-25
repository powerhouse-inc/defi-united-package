/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { PHDocumentController } from "document-model";
import { OnchainReceipt } from "../module.js";
import type { OnchainReceiptAction, OnchainReceiptPHState } from "./types.js";

export const OnchainReceiptController = PHDocumentController.forDocumentModel<
  OnchainReceiptPHState,
  OnchainReceiptAction
>(OnchainReceipt);
