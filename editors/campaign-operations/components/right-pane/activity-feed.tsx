import { useState } from "react";
import type { ActivityEvent } from "../../state/derive-activity.js";
import type { UseRightPaneResult } from "../../state/use-right-pane.js";

interface ActivityFeedProps {
  events: ActivityEvent[];
  totalCount: number;
  rightPane: UseRightPaneResult;
}

export function ActivityFeed({ events, totalCount, rightPane }: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? events : events.slice(0, 10);

  return (
    <div className="defi-united-ops__rp-activity">
      <div className="defi-united-ops__rp-activity-header">Recent activity</div>
      {visible.length === 0 ? (
        <div className="defi-united-ops__rp-activity-empty">No activity yet.</div>
      ) : (
        <ul className="defi-united-ops__rp-activity-list">
          {visible.map((e) => (
            <li
              key={e.id}
              className="defi-united-ops__rp-activity-row"
              onClick={() => {
                if (e.docKind === "pledge") rightPane.open({ type: "pledge", id: e.docId, mode: "edit" });
                else if (e.docKind === "status-update") rightPane.open({ type: "status-update", id: e.docId, mode: "edit" });
              }}
            >
              <span className="defi-united-ops__rp-activity-icon">{iconFor(e.kind)}</span>
              <span className="defi-united-ops__rp-activity-time">{shortTime(e.at)}</span>
              <span className="defi-united-ops__rp-activity-text">{e.headline}</span>
            </li>
          ))}
        </ul>
      )}
      {!showAll && totalCount > 10 ? (
        <button
          type="button"
          className="defi-united-ops__rp-activity-more"
          onClick={() => setShowAll(true)}
        >
          ▾ Show all {totalCount} events
        </button>
      ) : null}
      <Styles />
    </div>
  );
}

function iconFor(kind: ActivityEvent["kind"]): string {
  switch (kind) {
    case "PLEDGE": return "⚡";
    case "RECEIPT": return "💰";
    case "UPDATE": return "📝";
  }
}

function shortTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Styles() {
  return (
    <style>{`
      .defi-united-ops__rp-activity {
        background: #fff;
        border: 1px solid #e6e8ec;
        border-radius: 12px;
        overflow: hidden;
      }
      .defi-united-ops__rp-activity-header {
        padding: 14px 18px 10px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #525a6b;
        border-bottom: 1px solid #f1f3f7;
      }
      .defi-united-ops__rp-activity-empty {
        padding: 20px;
        color: #6b7280;
        font-size: 13px;
        font-style: italic;
      }
      .defi-united-ops__rp-activity-list { list-style: none; margin: 0; padding: 0; }
      .defi-united-ops__rp-activity-row {
        padding: 8px 18px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        cursor: pointer;
        border-bottom: 1px solid #f7f8fa;
      }
      .defi-united-ops__rp-activity-row:last-child { border-bottom: none; }
      .defi-united-ops__rp-activity-row:hover { background: #f7f8fa; }
      .defi-united-ops__rp-activity-icon { font-size: 12px; opacity: 0.8; }
      .defi-united-ops__rp-activity-time {
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
        color: #6b7280;
        flex: 0 0 64px;
      }
      .defi-united-ops__rp-activity-text { flex: 1 1 auto; color: #0f1115; }
      .defi-united-ops__rp-activity-more {
        width: 100%;
        padding: 10px;
        background: #f7f8fa;
        border: none;
        border-top: 1px solid #f1f3f7;
        cursor: pointer;
        font-size: 12px;
        color: #525a6b;
      }
      .defi-united-ops__rp-activity-more:hover { background: #eaecf2; color: #0f1115; }
    `}</style>
  );
}
