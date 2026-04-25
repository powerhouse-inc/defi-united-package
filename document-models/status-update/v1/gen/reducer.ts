/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { StatusUpdatePHState } from "document-models/status-update/v1";

import { statusUpdatePublishingOperations } from "../src/reducers/publishing.js";

import {
  AttachAnnouncementInputSchema,
  DraftUpdateInputSchema,
  EditUpdateInputSchema,
  PublishUpdateInputSchema,
  RetractUpdateInputSchema,
  SetVisibilityInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<StatusUpdatePHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "DRAFT_UPDATE": {
      DraftUpdateInputSchema().parse(action.input);

      statusUpdatePublishingOperations.draftUpdateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "EDIT_UPDATE": {
      EditUpdateInputSchema().parse(action.input);

      statusUpdatePublishingOperations.editUpdateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "PUBLISH_UPDATE": {
      PublishUpdateInputSchema().parse(action.input);

      statusUpdatePublishingOperations.publishUpdateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ATTACH_ANNOUNCEMENT": {
      AttachAnnouncementInputSchema().parse(action.input);

      statusUpdatePublishingOperations.attachAnnouncementOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RETRACT_UPDATE": {
      RetractUpdateInputSchema().parse(action.input);

      statusUpdatePublishingOperations.retractUpdateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_VISIBILITY": {
      SetVisibilityInputSchema().parse(action.input);

      statusUpdatePublishingOperations.setVisibilityOperation(
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

export const reducer: Reducer<StatusUpdatePHState> =
  createReducer(stateReducer);
