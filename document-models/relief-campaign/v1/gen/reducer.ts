/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { ReliefCampaignPHState } from "document-models/relief-campaign/v1";

import { reliefCampaignManagementOperations } from "../src/reducers/management.js";

import {
  AddContributionAddressInputSchema,
  AddExternalLinkInputSchema,
  AddOperatorWalletInputSchema,
  ArchiveCampaignInputSchema,
  MarkFailedInputSchema,
  MarkResolvedInputSchema,
  RemoveContributionAddressInputSchema,
  RemoveOperatorWalletInputSchema,
  SetCampaignDetailsInputSchema,
  StartCampaignInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<ReliefCampaignPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_CAMPAIGN_DETAILS": {
      SetCampaignDetailsInputSchema().parse(action.input);

      reliefCampaignManagementOperations.setCampaignDetailsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_CONTRIBUTION_ADDRESS": {
      AddContributionAddressInputSchema().parse(action.input);

      reliefCampaignManagementOperations.addContributionAddressOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_CONTRIBUTION_ADDRESS": {
      RemoveContributionAddressInputSchema().parse(action.input);

      reliefCampaignManagementOperations.removeContributionAddressOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "START_CAMPAIGN": {
      StartCampaignInputSchema().parse(action.input);

      reliefCampaignManagementOperations.startCampaignOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_RESOLVED": {
      MarkResolvedInputSchema().parse(action.input);

      reliefCampaignManagementOperations.markResolvedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_FAILED": {
      MarkFailedInputSchema().parse(action.input);

      reliefCampaignManagementOperations.markFailedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ARCHIVE_CAMPAIGN": {
      ArchiveCampaignInputSchema().parse(action.input);

      reliefCampaignManagementOperations.archiveCampaignOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_EXTERNAL_LINK": {
      AddExternalLinkInputSchema().parse(action.input);

      reliefCampaignManagementOperations.addExternalLinkOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_OPERATOR_WALLET": {
      AddOperatorWalletInputSchema().parse(action.input);

      reliefCampaignManagementOperations.addOperatorWalletOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_OPERATOR_WALLET": {
      RemoveOperatorWalletInputSchema().parse(action.input);

      reliefCampaignManagementOperations.removeOperatorWalletOperation(
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

export const reducer: Reducer<ReliefCampaignPHState> =
  createReducer(stateReducer);
