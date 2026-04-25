import { setSelectedNode } from "@powerhousedao/reactor-browser";
import { useMemo } from "react";

import type { PledgeDocument } from "../../../document-models/pledge/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../../document-models/contributor-profile/v1/gen/types.js";
import type { PledgeStatus } from "../../../document-models/pledge/v1/gen/schema/types.js";

interface PledgeBoardProps {
  pledges: PledgeDocument[];
  contributorProfiles: ContributorProfileDocument[];
}

const COLUMNS: { status: PledgeStatus; label: string }[] = [
  { status: "PROPOSED", label: "Proposed" },
  { status: "GOVERNANCE_PENDING", label: "Governance pending" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "RECEIVED", label: "Received" },
];

const STATUS_ACCENT: Record<string, string> = {
  PROPOSED: "#9aa1ad",
  GOVERNANCE_PENDING: "#cf8a00",
  CONFIRMED: "#1a4dd6",
  RECEIVED: "#1a7048",
};

function truncatePhid(phid: string | null | undefined): string {
  if (!phid) return "—";
  if (phid.length <= 14) return phid;
  return `${phid.slice(0, 8)}…${phid.slice(-4)}`;
}

function formatAmount(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value >= 100) return value.toFixed(0);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

function selectNode(nodeId: string) {
  setSelectedNode(nodeId);
}

export function PledgeBoard({
  pledges,
  contributorProfiles,
}: PledgeBoardProps) {
  const profilesByPhid = useMemo(() => {
    const map = new Map<string, ContributorProfileDocument>();
    for (const p of contributorProfiles) {
      map.set(p.header.id, p);
    }
    return map;
  }, [contributorProfiles]);

  const grouped = useMemo(() => {
    const map = new Map<PledgeStatus, PledgeDocument[]>();
    for (const col of COLUMNS) {
      map.set(col.status, []);
    }
    for (const pledge of pledges) {
      const status = pledge.state.global.status;
      const arr = map.get(status);
      if (arr) arr.push(pledge);
    }
    return map;
  }, [pledges]);

  return (
    <section className="defi-united-ops__card">
      <div className="defi-united-ops__board-header">
        <h3 className="defi-united-ops__card-title">Pledge board</h3>
        <span className="defi-united-ops__board-count">
          {pledges.length} total
        </span>
      </div>

      <div className="defi-united-ops__board-columns">
        {COLUMNS.map((col) => {
          const items = grouped.get(col.status) ?? [];
          return (
            <div key={col.status} className="defi-united-ops__board-col">
              <div
                className="defi-united-ops__board-col-head"
                style={{ borderTopColor: STATUS_ACCENT[col.status] }}
              >
                <span className="defi-united-ops__board-col-label">
                  {col.label}
                </span>
                <span className="defi-united-ops__board-col-badge">
                  {items.length}
                </span>
              </div>
              <div className="defi-united-ops__board-col-body">
                {items.length === 0 ? (
                  <span className="defi-united-ops__empty">No pledges</span>
                ) : (
                  items.map((pledge) => (
                    <PledgeCard
                      key={pledge.header.id}
                      pledge={pledge}
                      profile={
                        pledge.state.global.contributorProfileId
                          ? profilesByPhid.get(
                              pledge.state.global.contributorProfileId,
                            )
                          : undefined
                      }
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .defi-united-ops__board-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .defi-united-ops__board-header h3 {
          margin: 0;
        }
        .defi-united-ops__board-count {
          font-size: 12px;
          color: #6b7280;
        }
        .defi-united-ops__board-columns {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .defi-united-ops__board-columns {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .defi-united-ops__board-columns {
            grid-template-columns: 1fr;
          }
        }
        .defi-united-ops__board-col {
          background-color: #f7f8fa;
          border: 1px solid #e6e8ec;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          min-height: 200px;
        }
        .defi-united-ops__board-col-head {
          padding: 10px 12px;
          border-top: 3px solid #9aa1ad;
          border-radius: 10px 10px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #ffffff;
        }
        .defi-united-ops__board-col-label {
          font-size: 12px;
          font-weight: 600;
          color: #0f1115;
          letter-spacing: 0.02em;
        }
        .defi-united-ops__board-col-badge {
          font-size: 11px;
          font-weight: 600;
          color: #525a6b;
          background-color: #eceef2;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .defi-united-ops__board-col-body {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .defi-united-ops__pledge-card {
          background-color: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          transition: box-shadow 120ms ease, border-color 120ms ease;
        }
        .defi-united-ops__pledge-card:hover {
          box-shadow: 0 1px 4px rgba(15, 17, 21, 0.08);
          border-color: #c8d0db;
        }
        .defi-united-ops__pledge-card:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: 1px;
        }
        .defi-united-ops__pledge-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f1115;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .defi-united-ops__pledge-amount {
          font-size: 12px;
          color: #525a6b;
          font-variant-numeric: tabular-nums;
        }
        .defi-united-ops__pledge-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .defi-united-ops__pledge-tag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: #eef0f4;
          color: #525a6b;
        }
        .defi-united-ops__pledge-tag--gov {
          background-color: #fff2d6;
          color: #8a5a00;
        }
      `}</style>
    </section>
  );
}

function PledgeCard({
  pledge,
  profile,
}: {
  pledge: PledgeDocument;
  profile: ContributorProfileDocument | undefined;
}) {
  const state = pledge.state.global;
  const displayName =
    profile?.state.global.displayName ??
    truncatePhid(state.contributorProfileId);
  const symbol = state.asset?.symbol ?? "";
  const hasGovernance = !!state.governance;

  return (
    <div
      className="defi-united-ops__pledge-card"
      role="button"
      tabIndex={0}
      onClick={() => selectNode(pledge.header.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectNode(pledge.header.id);
        }
      }}
      title={`Open ${displayName}`}
    >
      <div className="defi-united-ops__pledge-name">{displayName}</div>
      <div className="defi-united-ops__pledge-amount">
        {formatAmount(state.pledgedAmount)} {symbol}
      </div>
      {hasGovernance ? (
        <div className="defi-united-ops__pledge-tags">
          <span className="defi-united-ops__pledge-tag defi-united-ops__pledge-tag--gov">
            {state.governance?.platform ?? "GOV"}
          </span>
          {state.governance?.quorumStatus ? (
            <span className="defi-united-ops__pledge-tag">
              {state.governance.quorumStatus}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
