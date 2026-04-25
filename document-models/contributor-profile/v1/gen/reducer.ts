/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { ContributorProfilePHState } from "document-models/contributor-profile/v1";

import { contributorProfileProfileOperations } from "../src/reducers/profile.js";

import {
  AddGovernanceEndpointInputSchema,
  AddWalletInputSchema,
  RemoveGovernanceEndpointInputSchema,
  RemoveWalletInputSchema,
  SetProfileDetailsInputSchema,
  SetTrustLevelInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<ContributorProfilePHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_PROFILE_DETAILS": {
      SetProfileDetailsInputSchema().parse(action.input);

      contributorProfileProfileOperations.setProfileDetailsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_WALLET": {
      AddWalletInputSchema().parse(action.input);

      contributorProfileProfileOperations.addWalletOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_WALLET": {
      RemoveWalletInputSchema().parse(action.input);

      contributorProfileProfileOperations.removeWalletOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_GOVERNANCE_ENDPOINT": {
      AddGovernanceEndpointInputSchema().parse(action.input);

      contributorProfileProfileOperations.addGovernanceEndpointOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_GOVERNANCE_ENDPOINT": {
      RemoveGovernanceEndpointInputSchema().parse(action.input);

      contributorProfileProfileOperations.removeGovernanceEndpointOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_TRUST_LEVEL": {
      SetTrustLevelInputSchema().parse(action.input);

      contributorProfileProfileOperations.setTrustLevelOperation(
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

export const reducer: Reducer<ContributorProfilePHState> =
  createReducer(stateReducer);
