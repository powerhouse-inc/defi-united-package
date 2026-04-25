import { setSelectedNode } from "@powerhousedao/reactor-browser";

import type { DistributionPlanDocument } from "../../../document-models/distribution-plan/v1/gen/types.js";
import type { DistributionStatus } from "../../../document-models/distribution-plan/v1/gen/schema/types.js";

interface DistributionPanelProps {
  plan: DistributionPlanDocument | undefined;
}

const STATUS_COLORS: Record<DistributionStatus, { bg: string; fg: string }> = {
  DRAFT: { bg: "#eef0f4", fg: "#475063" },
  APPROVED: { bg: "#e2eefb", fg: "#1a4dd6" },
  EXECUTING: { bg: "#fff2d6", fg: "#8a5a00" },
  COMPLETED: { bg: "#e2f1ea", fg: "#1a7048" },
  CANCELLED: { bg: "#fbe2e2", fg: "#a4191a" },
};

function formatAmount(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value >= 100) return value.toFixed(0);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

function selectNode(nodeId: string) {
  setSelectedNode(nodeId);
}

export function DistributionPanel({ plan }: DistributionPanelProps) {
  if (!plan) {
    return (
      <section className="defi-united-ops__card">
        <h3 className="defi-united-ops__card-title">Distribution plan</h3>
        <span className="defi-united-ops__empty">
          No distribution plan published yet.
        </span>
      </section>
    );
  }

  const state = plan.state.global;
  const colors = STATUS_COLORS[state.status];
  const totalAllocated = state.recipients.reduce<number>(
    (sum, r) => sum + (r.allocatedAmount || 0),
    0,
  );
  const sentCount = state.recipients.filter((r) => r.status === "SENT").length;

  return (
    <section
      className="defi-united-ops__card defi-united-ops__row-clickable"
      role="button"
      tabIndex={0}
      onClick={() => selectNode(plan.header.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectNode(plan.header.id);
        }
      }}
    >
      <div className="defi-united-ops__dist-header">
        <h3 className="defi-united-ops__card-title">Distribution plan</h3>
        <span
          className="defi-united-ops__dist-pill"
          style={{ backgroundColor: colors.bg, color: colors.fg }}
        >
          {state.status}
        </span>
      </div>

      {state.methodology ? (
        <p className="defi-united-ops__dist-methodology">{state.methodology}</p>
      ) : null}

      <div className="defi-united-ops__dist-stats">
        <div className="defi-united-ops__dist-stat">
          <div className="defi-united-ops__dist-stat-value">
            {state.recipients.length}
          </div>
          <div className="defi-united-ops__dist-stat-label">recipients</div>
        </div>
        <div className="defi-united-ops__dist-stat">
          <div className="defi-united-ops__dist-stat-value">
            {formatAmount(totalAllocated)}
          </div>
          <div className="defi-united-ops__dist-stat-label">
            total allocated
          </div>
        </div>
        <div className="defi-united-ops__dist-stat">
          <div className="defi-united-ops__dist-stat-value">
            {sentCount}/{state.recipients.length}
          </div>
          <div className="defi-united-ops__dist-stat-label">sent</div>
        </div>
        {state.totalAvailable != null ? (
          <div className="defi-united-ops__dist-stat">
            <div className="defi-united-ops__dist-stat-value">
              {formatAmount(state.totalAvailable)}
            </div>
            <div className="defi-united-ops__dist-stat-label">available</div>
          </div>
        ) : null}
      </div>

      <style>{`
        .defi-united-ops__dist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .defi-united-ops__dist-header h3 {
          margin: 0;
        }
        .defi-united-ops__dist-pill {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .defi-united-ops__dist-methodology {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #525a6b;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .defi-united-ops__dist-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 12px;
        }
        .defi-united-ops__dist-stat {
          padding: 10px 12px;
          background-color: #f7f8fa;
          border-radius: 8px;
        }
        .defi-united-ops__dist-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #0f1115;
          font-variant-numeric: tabular-nums;
        }
        .defi-united-ops__dist-stat-label {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
          letter-spacing: 0.02em;
        }
      `}</style>
    </section>
  );
}
