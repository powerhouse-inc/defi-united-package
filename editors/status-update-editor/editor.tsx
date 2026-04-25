import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { generateId } from "document-model";
import { useCallback } from "react";

import {
  actions,
  useSelectedStatusUpdateDocument,
} from "../../document-models/status-update/v1/index.js";
import type {
  AnnouncementPlatform,
  StatusUpdateState,
  UpdateVisibility,
} from "../../document-models/status-update/v1/gen/schema/types.js";

import { StatusUpdateHeader } from "./components/StatusUpdateHeader.js";
import { StatusUpdateMeta } from "./components/StatusUpdateMeta.js";
import { StatusUpdateBody } from "./components/StatusUpdateBody.js";
import { AnnouncementsTable } from "./components/AnnouncementsTable.js";
import { PublishActions } from "./components/PublishActions.js";

export default function Editor() {
  const [document, dispatch] = useSelectedStatusUpdateDocument();

  const state = document?.state.global as StatusUpdateState | undefined;
  const isPublished = Boolean(state?.publishedAt);

  const setTitle = useCallback(
    (title: string) => {
      if (isPublished) {
        dispatch(actions.editUpdate({ title }));
      } else {
        dispatch(actions.draftUpdate({ title }));
      }
    },
    [dispatch, isPublished],
  );

  const setBody = useCallback(
    (body: string) => {
      if (isPublished) {
        dispatch(actions.editUpdate({ body }));
      } else {
        dispatch(actions.draftUpdate({ body }));
      }
    },
    [dispatch, isPublished],
  );

  const setVisibility = useCallback(
    (visibility: UpdateVisibility) => {
      dispatch(actions.setVisibility({ visibility }));
    },
    [dispatch],
  );

  const setAuthorProfileId = useCallback(
    (authorProfileId: string) => {
      dispatch(actions.draftUpdate({ authorProfileId }));
    },
    [dispatch],
  );

  const attachAnnouncement = useCallback(
    (platform: AnnouncementPlatform, url: string) => {
      dispatch(
        actions.attachAnnouncement({ id: generateId(), platform, url }),
      );
    },
    [dispatch],
  );

  const saveDraft = useCallback(() => {
    if (!state) return;
    dispatch(
      actions.draftUpdate({
        title: state.title,
        body: state.body,
        visibility: state.visibility,
        authorProfileId: state.authorProfileId ?? undefined,
      }),
    );
  }, [dispatch, state]);

  const publish = useCallback(() => {
    dispatch(
      actions.publishUpdate({
        publishedAt: new Date().toISOString(),
        metricsSnapshot: {
          totalPledged: null,
          totalReceived: null,
          dependenciesResolved: null,
        },
      }),
    );
  }, [dispatch]);

  const retract = useCallback(() => {
    dispatch(actions.retractUpdate({ _: null }));
  }, [dispatch]);

  if (!document || !state) return null;

  return (
    <div className="su-scope">
      <DocumentToolbar />
      <div className="su-page">
        <div className="su-page-inner">
          <StatusUpdateHeader state={state} onTitleChange={setTitle} />
          <StatusUpdateMeta
            state={state}
            on={{ setVisibility, setAuthorProfileId }}
          />
          <StatusUpdateBody state={state} onBodyChange={setBody} />
          <AnnouncementsTable
            announcements={state.externalAnnouncements}
            on={{ attach: attachAnnouncement }}
          />
          <PublishActions state={state} on={{ saveDraft, publish, retract }} />
        </div>
      </div>

      <style>{`
        .su-scope {
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #111827;
        }
        .su-scope .su-page {
          padding: 24px;
          background-color: #f8fafc;
          min-height: 100%;
        }
        .su-scope .su-page-inner {
          max-width: 960px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
    </div>
  );
}
