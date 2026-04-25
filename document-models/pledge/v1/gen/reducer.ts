/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { PledgePHState } from "document-models/pledge/v1";

import { pledgeLifecycleOperations } from "../src/reducers/lifecycle.js";

import {
  AttachGovernanceInputSchema,
  CancelPledgeInputSchema,
  EditNotesInputSchema,
  FailPledgeInputSchema,
  MarkConfirmedInputSchema,
  MarkGovernancePendingInputSchema,
  MarkReceivedInputSchema,
  ProposePledgeInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<PledgePHState> = (state, action, dispatch) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "PROPOSE_PLEDGE": {
      ProposePledgeInputSchema().parse(action.input);

      pledgeLifecycleOperations.proposePledgeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ATTACH_GOVERNANCE": {
      AttachGovernanceInputSchema().parse(action.input);

      pledgeLifecycleOperations.attachGovernanceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_GOVERNANCE_PENDING": {
      MarkGovernancePendingInputSchema().parse(action.input);

      pledgeLifecycleOperations.markGovernancePendingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_CONFIRMED": {
      MarkConfirmedInputSchema().parse(action.input);

      pledgeLifecycleOperations.markConfirmedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_RECEIVED": {
      MarkReceivedInputSchema().parse(action.input);

      pledgeLifecycleOperations.markReceivedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CANCEL_PLEDGE": {
      CancelPledgeInputSchema().parse(action.input);

      pledgeLifecycleOperations.cancelPledgeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "FAIL_PLEDGE": {
      FailPledgeInputSchema().parse(action.input);

      pledgeLifecycleOperations.failPledgeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "EDIT_NOTES": {
      EditNotesInputSchema().parse(action.input);

      pledgeLifecycleOperations.editNotesOperation(
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

export const reducer: Reducer<PledgePHState> = createReducer(stateReducer);
