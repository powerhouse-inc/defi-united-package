/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentModelModule } from "document-model";
import { createState, defaultBaseState } from "document-model";
import { actions } from "./actions.js";
import { documentModel } from "./gen/document-model.js";
import { reducer } from "./gen/reducer.js";
import type { OnchainReceiptPHState } from "./gen/types.js";
import { utils } from "./utils.js";

/** Document model module for the OnchainReceipt document type */
export const OnchainReceipt: DocumentModelModule<OnchainReceiptPHState> = {
  version: 1,
  reducer,
  actions,
  utils,
  documentModel: createState(defaultBaseState(), documentModel),
};
