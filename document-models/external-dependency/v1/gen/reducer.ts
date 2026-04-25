/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { ExternalDependencyPHState } from "document-models/external-dependency/v1";

import { externalDependencyTrackingOperations } from "../src/reducers/tracking.js";

import {
  AbandonInputSchema,
  LinkPledgeInputSchema,
  ResolveInputSchema,
  SetDependencyDetailsInputSchema,
  SetExternalRefInputSchema,
  UnlinkPledgeInputSchema,
  UpdateStatusInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<ExternalDependencyPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_DEPENDENCY_DETAILS": {
      SetDependencyDetailsInputSchema().parse(action.input);

      externalDependencyTrackingOperations.setDependencyDetailsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_STATUS": {
      UpdateStatusInputSchema().parse(action.input);

      externalDependencyTrackingOperations.updateStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LINK_PLEDGE": {
      LinkPledgeInputSchema().parse(action.input);

      externalDependencyTrackingOperations.linkPledgeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UNLINK_PLEDGE": {
      UnlinkPledgeInputSchema().parse(action.input);

      externalDependencyTrackingOperations.unlinkPledgeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RESOLVE": {
      ResolveInputSchema().parse(action.input);

      externalDependencyTrackingOperations.resolveOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ABANDON": {
      AbandonInputSchema().parse(action.input);

      externalDependencyTrackingOperations.abandonOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_EXTERNAL_REF": {
      SetExternalRefInputSchema().parse(action.input);

      externalDependencyTrackingOperations.setExternalRefOperation(
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

export const reducer: Reducer<ExternalDependencyPHState> =
  createReducer(stateReducer);
