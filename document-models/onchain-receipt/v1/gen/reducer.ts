/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { OnchainReceiptPHState } from "document-models/onchain-receipt/v1";

import { onchainReceiptReconciliationOperations } from "../src/reducers/reconciliation.js";

import {
  AttachPledgeInputSchema,
  ClearMatchInputSchema,
  MarkAmbiguousInputSchema,
  MarkReorgedInputSchema,
  OverrideMatchInputSchema,
  RecordReceiptInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<OnchainReceiptPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "RECORD_RECEIPT": {
      RecordReceiptInputSchema().parse(action.input);

      onchainReceiptReconciliationOperations.recordReceiptOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ATTACH_PLEDGE": {
      AttachPledgeInputSchema().parse(action.input);

      onchainReceiptReconciliationOperations.attachPledgeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_AMBIGUOUS": {
      MarkAmbiguousInputSchema().parse(action.input);

      onchainReceiptReconciliationOperations.markAmbiguousOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "OVERRIDE_MATCH": {
      OverrideMatchInputSchema().parse(action.input);

      onchainReceiptReconciliationOperations.overrideMatchOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CLEAR_MATCH": {
      ClearMatchInputSchema().parse(action.input);

      onchainReceiptReconciliationOperations.clearMatchOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_REORGED": {
      MarkReorgedInputSchema().parse(action.input);

      onchainReceiptReconciliationOperations.markReorgedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<OnchainReceiptPHState> =
  createReducer(stateReducer);
