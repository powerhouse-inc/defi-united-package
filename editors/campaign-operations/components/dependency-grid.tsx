import { setSelectedNode } from "@powerhousedao/reactor-browser";

import type { ExternalDependencyDocument } from "../../../document-models/external-dependency/v1/gen/types.js";
import type { DependencyStatus } from "../../../document-models/external-dependency/v1/gen/schema/types.js";

interface DependencyGridProps {
  dependencies: ExternalDependencyDocument[];
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

export function DependencyGrid({ dependencies }: DependencyGridProps) {
  const sorted = [...dependencies].sort((a, b) => {
    // Active states first, resolved/abandoned last
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
    <section className="defi-united-ops__card defi-united-ops__deps">
      <h3 className="defi-united-ops__card-title">External dependencies</h3>

      {sorted.length === 0 ? (
        <span className="defi-united-ops__empty">
          No external dependencies tracked yet.
        </span>
      ) : (
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
                onClick={() => selectNode(dep.header.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectNode(dep.header.id);
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
                    {state.assignee ? <span>· {state.assignee}</span> : null}
                    {state.blocks.length > 0 ? (
                      <span>· blocks {state.blocks.length}</span>
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
      `}</style>
    </section>
  );
}
