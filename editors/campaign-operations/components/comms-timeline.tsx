import { setSelectedNode } from "@powerhousedao/reactor-browser";

import type { StatusUpdateDocument } from "../../../document-models/status-update/v1/gen/types.js";

interface CommsTimelineProps {
  filteredStatusUpdates: StatusUpdateDocument[];
  driveId: string;
  metricsTotalPledged: number | null | undefined;
  metricsTotalReceived: number | null | undefined;
  metricsDependenciesResolved: number;
  onCreate?: () => void;
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

export function CommsTimeline({
  filteredStatusUpdates,
  onCreate,
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
      {onCreate ? (
        <button
          type="button"
          className="defi-united-ops__comms-compose-trigger"
          onClick={onCreate}
        >
          <span aria-hidden="true">+</span> Publish a public update
        </button>
      ) : null}

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
            Use the "+ Publish a public update" button above to create your
            first update — drafts and internal updates stay hidden until you
            flip them to public.
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
          color: #525a6b;
          background: #ffffff;
          border: 1px dashed #d4d7e0;
          border-radius: 8px;
          width: 100%;
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .defi-united-ops__comms-compose-trigger:hover {
          background: #f7f8fa;
          border-color: #1a4dd6;
          color: #1a4dd6;
        }
        .defi-united-ops__comms-compose-trigger span {
          font-size: 16px;
          font-weight: 700;
          line-height: 1;
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
