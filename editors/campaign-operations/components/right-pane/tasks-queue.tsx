import { useState } from "react";
import type { Task } from "../../state/derive-tasks.js";
import type { UseRightPaneResult } from "../../state/use-right-pane.js";

const SNOOZE_KEY = "defi-united-ops:snoozed-tasks";

function loadSnoozed(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(SNOOZE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveSnoozed(s: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SNOOZE_KEY, JSON.stringify(s));
}

interface TasksQueueProps {
  tasks: Task[];
  rightPane: UseRightPaneResult;
  onPrimaryAction?: (task: Task) => void;
}

export function TasksQueue({ tasks, rightPane, onPrimaryAction }: TasksQueueProps) {
  const [snoozed, setSnoozed] = useState<Record<string, number>>(() => loadSnoozed());
  const now = Date.now();
  const visible = tasks.filter((t) => !snoozed[t.id] || snoozed[t.id] < now);

  const snooze = (id: string) => {
    const next = { ...snoozed, [id]: now + 24 * 3600 * 1000 };
    setSnoozed(next);
    saveSnoozed(next);
  };

  if (visible.length === 0) {
    return (
      <div className="defi-united-ops__rp-tasks">
        <div className="defi-united-ops__rp-tasks-header">Tasks</div>
        <div className="defi-united-ops__rp-tasks-empty">
          <span className="defi-united-ops__rp-empty-icon">✓</span>
          All clear — drive looks healthy.
        </div>
        <Styles />
      </div>
    );
  }

  return (
    <div className="defi-united-ops__rp-tasks" data-task-list>
      <div className="defi-united-ops__rp-tasks-header">
        Tasks
        <span className="defi-united-ops__rp-tasks-count">{visible.length}</span>
      </div>
      <ul className="defi-united-ops__rp-tasks-list">
        {visible.map((t) => (
          <li
            key={t.id}
            className="defi-united-ops__rp-task-row"
            data-task-id={t.id}
          >
            <span
              className={`defi-united-ops__rp-task-icon defi-united-ops__rp-task-icon--${t.kind.toLowerCase().replace(/_/g, "-")}`}
            >
              {iconFor(t.kind)}
            </span>
            <div className="defi-united-ops__rp-task-body">
              <div className="defi-united-ops__rp-task-headline">{t.headline}</div>
              {t.subline ? <div className="defi-united-ops__rp-task-subline">{t.subline}</div> : null}
            </div>
            <div className="defi-united-ops__rp-task-actions">
              {t.primary ? (
                <button
                  type="button"
                  className="defi-united-ops__rp-task-cta"
                  onClick={() => onPrimaryAction?.(t)}
                >
                  {t.primary.label}
                </button>
              ) : null}
              <button
                type="button"
                className="defi-united-ops__rp-task-snooze"
                onClick={() => snooze(t.id)}
                title="Snooze 24h"
              >
                ⌛
              </button>
              {t.pledgeId || t.dependencyId ? (
                <button
                  type="button"
                  className="defi-united-ops__rp-task-open"
                  onClick={() => {
                    if (t.pledgeId)
                      rightPane.open({ type: "pledge", id: t.pledgeId, mode: "edit" });
                    else if (t.dependencyId)
                      rightPane.open({ type: "dependency", id: t.dependencyId, mode: "edit" });
                  }}
                  title="Open"
                >
                  ↗
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <Styles />
    </div>
  );
}

function iconFor(kind: Task["kind"]): string {
  switch (kind) {
    case "VOTE_ENDED": return "🗳";
    case "MISSING_GOVERNANCE": return "🔗";
    case "CONFIRMED_NO_RECEIPT": return "⏳";
    case "RECEIPT_UNATTRIBUTED": return "💰";
    case "DEP_OVERDUE": return "⚠";
    case "NO_RECENT_UPDATE": return "📝";
  }
}

function Styles() {
  return (
    <style>{`
      .defi-united-ops__rp-tasks {
        background: #fff;
        border: 1px solid #e6e8ec;
        border-radius: 12px;
        overflow: hidden;
      }
      .defi-united-ops__rp-tasks-header {
        padding: 14px 18px 10px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #525a6b;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid #f1f3f7;
      }
      .defi-united-ops__rp-tasks-count {
        background: #1a4dd6;
        color: white;
        font-size: 11px;
        padding: 1px 8px;
        border-radius: 999px;
        font-weight: 700;
        letter-spacing: 0;
      }
      .defi-united-ops__rp-tasks-empty {
        padding: 24px 20px;
        color: #6b7280;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .defi-united-ops__rp-empty-icon {
        color: #16a34a;
        font-size: 18px;
        font-weight: 700;
      }
      .defi-united-ops__rp-tasks-list { list-style: none; margin: 0; padding: 0; }
      .defi-united-ops__rp-task-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 18px;
        border-bottom: 1px solid #f1f3f7;
      }
      .defi-united-ops__rp-task-row:last-child { border-bottom: none; }
      .defi-united-ops__rp-task-icon {
        flex: 0 0 auto;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f7f8fa;
        border-radius: 8px;
        font-size: 14px;
      }
      .defi-united-ops__rp-task-body { flex: 1 1 auto; min-width: 0; }
      .defi-united-ops__rp-task-headline {
        font-size: 13px;
        font-weight: 500;
        color: #0f1115;
        line-height: 1.45;
      }
      .defi-united-ops__rp-task-subline {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
      }
      .defi-united-ops__rp-task-actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .defi-united-ops__rp-task-cta {
        font-size: 12px;
        font-weight: 600;
        color: #1a4dd6;
        background: #eaf0ff;
        border: none;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
      }
      .defi-united-ops__rp-task-cta:hover { background: #d6e0ff; }
      .defi-united-ops__rp-task-snooze,
      .defi-united-ops__rp-task-open {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 12px;
        color: #9aa1ad;
        padding: 4px 6px;
        border-radius: 4px;
      }
      .defi-united-ops__rp-task-snooze:hover,
      .defi-united-ops__rp-task-open:hover { background: #f1f3f7; color: #0f1115; }
    `}</style>
  );
}
