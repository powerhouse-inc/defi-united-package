import type { StatusUpdatePublishingOperations } from "document-models/status-update/v1";
import {
  MissingTitleOrBodyError,
  UpdateAlreadyPublishedError,
  UpdateNotPublishedError,
} from "../../gen/publishing/error.js";

export const statusUpdatePublishingOperations: StatusUpdatePublishingOperations =
  {
    draftUpdateOperation(state, action) {
      if (action.input.title) state.title = action.input.title;
      if (action.input.body) state.body = action.input.body;
      if (action.input.visibility) state.visibility = action.input.visibility;
      if (action.input.authorProfileId)
        state.authorProfileId = action.input.authorProfileId;
    },
    editUpdateOperation(state, action) {
      if (action.input.title) state.title = action.input.title;
      if (action.input.body) state.body = action.input.body;
    },
    publishUpdateOperation(state, action) {
      if (state.publishedAt)
        throw new UpdateAlreadyPublishedError(
          "Update has already been published",
        );
      if (!state.title || !state.body)
        throw new MissingTitleOrBodyError(
          "Title and body are required to publish",
        );
      state.publishedAt = action.input.publishedAt;
      if (action.input.metricsSnapshot) {
        state.metricsSnapshot = {
          totalPledged: action.input.metricsSnapshot.totalPledged ?? null,
          totalReceived: action.input.metricsSnapshot.totalReceived ?? null,
          dependenciesResolved:
            action.input.metricsSnapshot.dependenciesResolved ?? null,
        };
      }
    },
    attachAnnouncementOperation(state, action) {
      state.externalAnnouncements.push({
        id: action.input.id,
        platform: action.input.platform,
        url: action.input.url,
      });
    },
    retractUpdateOperation(state, _action) {
      if (!state.publishedAt)
        throw new UpdateNotPublishedError("Update is not published");
      state.publishedAt = null;
    },
    setVisibilityOperation(state, action) {
      state.visibility = action.input.visibility;
    },
  };
