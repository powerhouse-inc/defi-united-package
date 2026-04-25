/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { DistributionPlanPHState } from "document-models/distribution-plan/v1";

import { distributionPlanPlanningOperations } from "../src/reducers/planning.js";

import {
  AddApprovalRefInputSchema,
  AddRecipientInputSchema,
  ApprovePlanInputSchema,
  CancelPlanInputSchema,
  CompleteDistributionInputSchema,
  MarkRecipientFailedInputSchema,
  MarkRecipientRefundedInputSchema,
  MarkRecipientSentInputSchema,
  RemoveRecipientInputSchema,
  SetMethodologyInputSchema,
  UpdateRecipientInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<DistributionPlanPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_METHODOLOGY": {
      SetMethodologyInputSchema().parse(action.input);

      distributionPlanPlanningOperations.setMethodologyOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_RECIPIENT": {
      AddRecipientInputSchema().parse(action.input);

      distributionPlanPlanningOperations.addRecipientOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_RECIPIENT": {
      UpdateRecipientInputSchema().parse(action.input);

      distributionPlanPlanningOperations.updateRecipientOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_RECIPIENT": {
      RemoveRecipientInputSchema().parse(action.input);

      distributionPlanPlanningOperations.removeRecipientOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "APPROVE_PLAN": {
      ApprovePlanInputSchema().parse(action.input);

      distributionPlanPlanningOperations.approvePlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_RECIPIENT_SENT": {
      MarkRecipientSentInputSchema().parse(action.input);

      distributionPlanPlanningOperations.markRecipientSentOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_RECIPIENT_FAILED": {
      MarkRecipientFailedInputSchema().parse(action.input);

      distributionPlanPlanningOperations.markRecipientFailedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_RECIPIENT_REFUNDED": {
      MarkRecipientRefundedInputSchema().parse(action.input);

      distributionPlanPlanningOperations.markRecipientRefundedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "COMPLETE_DISTRIBUTION": {
      CompleteDistributionInputSchema().parse(action.input);

      distributionPlanPlanningOperations.completeDistributionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CANCEL_PLAN": {
      CancelPlanInputSchema().parse(action.input);

      distributionPlanPlanningOperations.cancelPlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_APPROVAL_REF": {
      AddApprovalRefInputSchema().parse(action.input);

      distributionPlanPlanningOperations.addApprovalRefOperation(
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

export const reducer: Reducer<DistributionPlanPHState> =
  createReducer(stateReducer);
