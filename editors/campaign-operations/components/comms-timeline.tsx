import {
  addDocument,
  dispatchActions,
  setSelectedNode,
} from "@powerhousedao/reactor-browser";
import { useState } from "react";

import { statusUpdateDocumentType } from "../../../document-models/status-update/v1/gen/document-type.js";
import {
  draftUpdate,
  publishUpdate,
} from "../../../document-models/status-update/v1/gen/creators.js";

import type { StatusUpdateDocument } from "../../../document-models/status-update/v1/gen/types.js";

interface CommsTimelineProps {
  filteredStatusUpdates: StatusUpdateDocument[];
  driveId: string;
  metricsTotalPledged: number | null | undefined;
  metricsTotalReceived: number | null | undefined;
  metricsDependenciesResolved: number;
}

function selectNode(nodeId: string) {
  setSelectedNode(nodeId);
}

const PLATFORM_LABELS: Record<string, string> = {
  TWITTER: "Twitter",
  FARCASTER: "Farcaster",
  MIRROR: "Mirror",
  BLOG: "Blog",
};

function Composer({
  driveId,
  metricsTotalPledged,
  metricsTotalReceived,
  metricsDependenciesResolved,
}: {
  driveId: string;
  metricsTotalPledged: number | null | undefined;
  metricsTotalReceived: number | null | undefined;
  metricsDependenciesResolved: number;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setBody("");
    setOpen(false);
    setError(null);
  }

  function publish(e: React.FormEvent) {
    e.preventDefault();
    void publishImpl();
  }

  async function publishImpl() {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setError(null);
    if (busy) return;
    setBusy(true);
    try {
      const doc = await addDocument(
        driveId,
        title.trim().slice(0, 80),
        statusUpdateDocumentType,
      );
      // Sequence draft → publish so the projection sees the final state in
      // one optimistic batch.
      await dispatchActions(
        [
          draftUpdate({
            title: title.trim(),
            body: body.trim(),
            visibility: "PUBLIC",
          }),
          publishUpdate({
            publishedAt: new Date().toISOString(),
            metricsSnapshot: {
              totalPledged: metricsTotalPledged ?? null,
              totalReceived: metricsTotalReceived ?? null,
              dependenciesResolved: metricsDependenciesResolved,
            },
          }),
        ],
        doc.id,
      );
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="defi-united-ops__comms-compose-trigger"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">+</span> Publish a public update
      </button>
    );
  }

  return (
    <form className="defi-united-ops__comms-compose" onSubmit={publish}>
      <div className="defi-united-ops__comms-compose-head">
        <span className="defi-united-ops__comms-compose-eyebrow">
          New public update
        </span>
        <span className="defi-united-ops__comms-compose-snapshot">
          Will record metrics snapshot:{" "}
          {metricsTotalPledged != null
            ? `${Number(metricsTotalPledged).toLocaleString()} pledged`
            : "—"}{" "}
          ·{" "}
          {metricsTotalReceived != null
            ? `${Number(metricsTotalReceived).toLocaleString()} received`
            : "—"}
        </span>
      </div>
      <input
        className="defi-united-ops__comms-compose-title"
        placeholder="Headline — keep it concrete"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={140}
        autoFocus
        required
      />
      <textarea
        className="defi-united-ops__comms-compose-body"
        placeholder="What changed? Who needs to act? Link to anything verifiable."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        required
      />
      {error ? (
        <div className="defi-united-ops__comms-compose-error" role="alert">
          {error}
        </div>
      ) : null}
      <div className="defi-united-ops__comms-compose-actions">
        <button
          type="button"
          className="defi-united-ops__comms-compose-cancel"
          onClick={reset}
          disabled={busy}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="defi-united-ops__comms-compose-publish"
          disabled={busy}
        >
          {busy ? "Publishing…" : "Publish update"}
        </button>
      </div>
    </form>
  );
}

export function CommsTimeline({
  filteredStatusUpdates,
  driveId,
  metricsTotalPledged,
  metricsTotalReceived,
  metricsDependenciesResolved,
}: CommsTimelineProps) {
  const visible = filteredStatusUpdates
    .filter(
      (u) =>
        u.state.global.visibility === "PUBLIC" && !!u.state.global.publishedAt,
    )
    .sort((a, b) => {
      const aIso = a.state.global.publishedAt ?? "";
      const bIso = b.state.global.publishedAt ?? "";
      if (aIso === bIso) return 0;
      return aIso > bIso ? -1 : 1;
    });

  return (
    <div className="defi-united-ops__comms">
      <Composer
        driveId={driveId}
        metricsTotalPledged={metricsTotalPledged}
        metricsTotalReceived={metricsTotalReceived}
        metricsDependenciesResolved={metricsDependenciesResolved}
      />

      {visible.length === 0 ? (
        <div className="defi-united-ops__empty-state">
          <span
            className="defi-united-ops__empty-state-icon"
            aria-hidden="true"
          >
            📡
          </span>
          <div className="defi-united-ops__empty-state-label">
            No public status updates yet
          </div>
          <div className="defi-united-ops__empty-state-desc">
            Use the composer above to publish your first update — drafts and
            internal updates stay hidden until you flip them to public.
          </div>
        </div>
      ) : (
        <>
          <div className="defi-united-ops__comms-countbar">
            <span className="defi-united-ops__comms-count">
              {visible.length} published
            </span>
          </div>
          <ol className="defi-united-ops__comms-list">
            {visible.map((update) => {
              const state = update.state.global;
              const ts = state.publishedAt
                ? new Date(state.publishedAt).toLocaleString()
                : "";
              const bodyPreview = state.body ? state.body.slice(0, 220) : "";
              return (
                <li
                  key={update.header.id}
                  className="defi-united-ops__comms-item defi-united-ops__row-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => selectNode(update.header.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectNode(update.header.id);
                    }
                  }}
                >
                  <div
                    className="defi-united-ops__comms-dot"
                    aria-hidden="true"
                  />
                  <div className="defi-united-ops__comms-body">
                    <div className="defi-united-ops__comms-row">
                      <span className="defi-united-ops__comms-title">
                        {state.title}
                      </span>
                      <span className="defi-united-ops__comms-time">{ts}</span>
                    </div>
                    {bodyPreview ? (
                      <p className="defi-united-ops__comms-preview">
                        {bodyPreview}
                        {state.body.length > 220 ? "…" : ""}
                      </p>
                    ) : null}
                    {state.externalAnnouncements.length > 0 ? (
                      <div className="defi-united-ops__comms-tags">
                        {state.externalAnnouncements.map((ann, idx) => (
                          <span
                            key={`${update.header.id}-ann-${idx}`}
                            className="defi-united-ops__comms-tag"
                          >
                            {PLATFORM_LABELS[ann.platform] ?? ann.platform}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <style>{`
        .defi-united-ops__comms-compose-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #6936dc;
          background: linear-gradient(180deg, rgba(142,92,255,0.06), rgba(255,255,255,0));
          border: 1px dashed rgba(142,92,255,0.4);
          border-radius: 12px;
          width: 100%;
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .defi-united-ops__comms-compose-trigger:hover {
          background: rgba(142,92,255,0.08);
          border-color: rgba(142,92,255,0.7);
        }
        .defi-united-ops__comms-compose-trigger span {
          font-size: 16px;
          font-weight: 700;
          line-height: 1;
        }
        .defi-united-ops__comms-compose {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
          padding: 14px 16px;
          background: #ffffff;
          border: 1px solid rgba(142,92,255,0.25);
          border-radius: 12px;
          box-shadow: 0 8px 28px -16px rgba(142,92,255,0.5);
        }
        .defi-united-ops__comms-compose-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .defi-united-ops__comms-compose-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6936dc;
        }
        .defi-united-ops__comms-compose-snapshot {
          font-size: 11px;
          color: #6b7280;
        }
        .defi-united-ops__comms-compose-title,
        .defi-united-ops__comms-compose-body {
          width: 100%;
          padding: 9px 12px;
          font-size: 13px;
          font-family: inherit;
          color: #0f1115;
          background: #ffffff;
          border: 1px solid #d8dae6;
          border-radius: 8px;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .defi-united-ops__comms-compose-title { font-weight: 600; }
        .defi-united-ops__comms-compose-body  { line-height: 1.5; resize: vertical; }
        .defi-united-ops__comms-compose-title:focus,
        .defi-united-ops__comms-compose-body:focus {
          outline: none;
          border-color: #8e5cff;
          box-shadow: 0 0 0 3px rgba(142,92,255,0.15);
        }
        .defi-united-ops__comms-compose-error {
          font-size: 12px;
          color: #c2123a;
          background: #fce8ee;
          padding: 6px 10px;
          border-radius: 6px;
        }
        .defi-united-ops__comms-compose-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .defi-united-ops__comms-compose-cancel {
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 500;
          color: #525a6b;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 999px;
          cursor: pointer;
        }
        .defi-united-ops__comms-compose-cancel:hover {
          background: #f1f2f8;
        }
        .defi-united-ops__comms-compose-publish {
          padding: 8px 18px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(135deg, #8e5cff 0%, #e63e9d 100%);
          border: none;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 6px 16px -6px rgba(142,92,255,0.45);
          transition: transform 120ms ease, box-shadow 200ms ease;
        }
        .defi-united-ops__comms-compose-publish:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none !important;
        }
        .defi-united-ops__comms-compose-publish:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px -6px rgba(230,62,157,0.55);
        }
        .defi-united-ops__comms-countbar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        .defi-united-ops__comms-count {
          font-size: 12px;
          color: #6b7280;
        }
        .defi-united-ops__comms-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
        }
        .defi-united-ops__comms-list::before {
          content: "";
          position: absolute;
          left: 5px;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background-color: #e6e8ec;
        }
        .defi-united-ops__comms-item {
          position: relative;
          display: flex;
          gap: 14px;
          padding: 8px 8px 8px 4px;
        }
        .defi-united-ops__comms-dot {
          width: 11px;
          height: 11px;
          border-radius: 999px;
          background-color: #1a4dd6;
          border: 2px solid #ffffff;
          margin-top: 4px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .defi-united-ops__comms-body {
          flex: 1;
          min-width: 0;
        }
        .defi-united-ops__comms-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
        }
        .defi-united-ops__comms-title {
          font-size: 13px;
          font-weight: 600;
          color: #0f1115;
        }
        .defi-united-ops__comms-time {
          font-size: 11px;
          color: #6b7280;
          white-space: nowrap;
        }
        .defi-united-ops__comms-preview {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #525a6b;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .defi-united-ops__comms-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .defi-united-ops__comms-tag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: #eef0f4;
          color: #525a6b;
        }
      `}</style>
    </div>
  );
}
