/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { OnchainReceiptAction } from "./actions.js";
import type { OnchainReceiptState as OnchainReceiptGlobalState } from "./schema/types.js";

type OnchainReceiptLocalState = Record<PropertyKey, never>;

type OnchainReceiptPHState = PHBaseState & {
  global: OnchainReceiptGlobalState;
  local: OnchainReceiptLocalState;
};
type OnchainReceiptDocument = PHDocument<OnchainReceiptPHState>;

export * from "./schema/types.js";

export type {
  OnchainReceiptAction,
  OnchainReceiptDocument,
  OnchainReceiptGlobalState,
  OnchainReceiptLocalState,
  OnchainReceiptPHState,
};
