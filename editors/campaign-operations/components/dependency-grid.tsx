import { setSelectedNode } from "@powerhousedao/reactor-browser";

import { formatAmount } from "../utils/formatting.js";
import { exportToCsv } from "../utils/csv.js";

import type { ExternalDependencyDocument } from "../../../document-models/external-dependency/v1/gen/types.js";
import type { DependencyStatus } from "../../../document-models/external-dependency/v1/gen/schema/types.js";
import type { PledgeDocument } from "../../../document-models/pledge/v1/gen/types.js";

interface DependencyGridProps {
  dependencies: ExternalDependencyDocument[];
  pledges: PledgeDocument[];
  onOpen?: (id: string) => void;
}

const STATUS_COLORS: Record<
  DependencyStatus,
  { bg: string; fg: string; bar: string }
> = {
  OPEN: { bg: "#eef0f4", fg: "#525a6b", bar: "#9aa1ad" },
  IN_PROGRESS: { bg: "#fff2d6", fg: "#8a5a00", bar: "#cf8a00" },
  RESOLVED: { bg: "#e2f1ea", fg: "#1a7048", bar: "#1a7048" },
  BLOCKED: { bg: "#fbe2e2", fg: "#a4191a", bar: "#a4191a" },
  ABANDONED: { bg: "#f1f3f7", fg: "#9aa1ad", bar: "#c8d0db" },
};

const KIND_LABELS: Record<string, string> = {
  GOVERNANCE_VOTE: "Governance vote",
  COUNCIL_ACTION: "Council action",
  ONCHAIN_TX: "On-chain tx",
  OPERATIONAL: "Operational",
  OTHER: "Other",
};

function selectNode(nodeId: string) {
  setSelectedNode(nodeId);
}

export function DependencyGrid({ dependencies, pledges, onOpen }: DependencyGridProps) {
  const pledgesMap = new Map(pledges.map((p) => [p.header.id, p]));

  function getPledgeLabel(pledgeId: string): string {
    const pledge = pledgesMap.get(pledgeId);
    if (!pledge) return pledgeId.slice(0, 10);
    const amount = pledge.state.global.pledgedAmount;
    const symbol = pledge.state.global.asset?.symbol;
    if (amount != null && symbol) return `${formatAmount(amount)} ${symbol}`;
    if (pledge.state.global.publicNotes)
      return pledge.state.global.publicNotes.slice(0, 30);
    return pledgeId.slice(0, 10);
  }

  function handlePledgeClick(e: React.MouseEvent, pledgeId: string): void {
    e.stopPropagation();
    selectNode(pledgeId);
  }

  function handleExportCsv() {
    const rows = sorted.map((dep) => {
      const state = dep.state.global;
      return [
        state.title,
        state.kind,
        state.status,
        state.assignee ?? "",
        state.blocks.length.toString(),
      ];
    });
    exportToCsv({
      headers: ["Title", "Kind", "Status", "Assignee", "Blocked Pledges"],
      rows,
      filename: "dependencies.csv",
    });
  }

  const sorted = [...dependencies].sort((a, b) => {
    const order: Record<DependencyStatus, number> = {
      BLOCKED: 0,
      IN_PROGRESS: 1,
      OPEN: 2,
      RESOLVED: 3,
      ABANDONED: 4,
    };
    return order[a.state.global.status] - order[b.state.global.status];
  });

  return (
    <div className="defi-united-ops__deps">
      {sorted.length === 0 ? (
        <div className="defi-united-ops__empty-state">
          <span
            className="defi-united-ops__empty-state-icon"
            aria-hidden="true"
          >
            📋
          </span>
          <div className="defi-united-ops__empty-state-label">
            No external dependencies tracked yet
          </div>
          <div className="defi-united-ops__empty-state-desc">
            Add a <code>defi-united/external-dependency</code> document to track
            blockers and prerequisites.
          </div>
        </div>
      ) : (
        <>
          <div className="defi-united-ops__deps-toolbar">
            <span className="defi-united-ops__deps-count">
              {sorted.length}{" "}
              {sorted.length === 1 ? "dependency" : "dependencies"}
            </span>
            <button
              type="button"
              className="defi-united-ops__csv-btn"
              onClick={handleExportCsv}
              title="Export dependencies as CSV"
            >
              ↓ CSV
            </button>
          </div>
          <ul className="defi-united-ops__deps-list">
            {sorted.map((dep) => {
              const state = dep.state.global;
              const colors = STATUS_COLORS[state.status];
              return (
                <li
                  key={dep.header.id}
                  className="defi-united-ops__deps-row defi-united-ops__row-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (onOpen) onOpen(dep.header.id);
                    else selectNode(dep.header.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (onOpen) onOpen(dep.header.id);
                      else selectNode(dep.header.id);
                    }
                  }}
                >
                  <span
                    className="defi-united-ops__deps-bar"
                    style={{ backgroundColor: colors.bar }}
                    aria-hidden="true"
                  />
                  <div className="defi-united-ops__deps-body">
                    <div className="defi-united-ops__deps-title">
                      {state.title}
                    </div>
                    <div className="defi-united-ops__deps-meta">
                      <span>{KIND_LABELS[state.kind] ?? state.kind}</span>
                      {state.assignee ? (
                        <span>&middot; {state.assignee}</span>
                      ) : null}
                      {state.blocks.length > 0 ? (
                        <>
                          <span>&middot; blocks</span>
                          {state.blocks.map((pledgeId) => (
                            <span
                              key={pledgeId}
                              className="defi-united-ops__deps-block-link"
                              role="button"
                              tabIndex={0}
                              title={`Open pledge: ${getPledgeLabel(pledgeId)}`}
                              onClick={(e) => handlePledgeClick(e, pledgeId)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  selectNode(pledgeId);
                                }
                              }}
                            >
                              {getPledgeLabel(pledgeId)}
                            </span>
                          ))}
                        </>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className="defi-united-ops__deps-pill"
                    style={{ backgroundColor: colors.bg, color: colors.fg }}
                  >
                    {state.status.replace(/_/g, " ")}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <style>{`
        .defi-united-ops__deps {
          display: flex;
          flex-direction: column;
        }
        .defi-united-ops__deps-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .defi-united-ops__deps-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 8px;
        }
        .defi-united-ops__deps-bar {
          width: 4px;
          align-self: stretch;
          border-radius: 2px;
        }
        .defi-united-ops__deps-body {
          flex: 1;
          min-width: 0;
        }
        .defi-united-ops__deps-title {
          font-size: 13px;
          font-weight: 600;
          color: #0f1115;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .defi-united-ops__deps-meta {
          font-size: 11px;
          color: #6b7280;
          display: flex;
          gap: 4px;
          margin-top: 2px;
          flex-wrap: wrap;
        }
        .defi-united-ops__deps-pill {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .defi-united-ops__deps-block-link {
          color: #1a4dd6;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
        }
        .defi-united-ops__deps-block-link:hover {
          text-decoration: underline;
        }
        .defi-united-ops__deps-block-link:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: 2px;
          border-radius: 2px;
        }
        .defi-united-ops__deps-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .defi-united-ops__deps-count {
          font-size: 11px;
          color: #6b7280;
        }
        .defi-united-ops__csv-btn {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          background: transparent;
          border: 1px solid #e6e8ec;
          border-radius: 4px;
          padding: 2px 6px;
          cursor: pointer;
          font-family: inherit;
          line-height: 1.4;
        }
        .defi-united-ops__csv-btn:hover {
          color: #0f1115;
          border-color: #c8d0db;
          background-color: #f7f8fa;
        }
        .defi-united-ops__csv-btn:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}
