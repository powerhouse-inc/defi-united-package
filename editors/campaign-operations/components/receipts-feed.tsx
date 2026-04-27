import { setSelectedNode } from "@powerhousedao/reactor-browser";
import { useMemo, useState } from "react";

import {
  formatAmount,
  truncateAddress,
  truncateHash,
} from "../utils/formatting.js";
import { exportToCsv } from "../utils/csv.js";

import type { OnchainReceiptDocument } from "../../../document-models/onchain-receipt/v1/gen/types.js";
import type { ReconciliationStatus } from "../../../document-models/onchain-receipt/v1/gen/schema/types.js";
import type { PledgeDocument } from "../../../document-models/pledge/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../../document-models/contributor-profile/v1/gen/types.js";

type ReceiptsSortMode = "newest" | "oldest" | "largest" | "unmatched";
type TimeRange = "all" | "today" | "7d" | "30d";

interface ReceiptsFeedProps {
  receipts: OnchainReceiptDocument[];
  pledges: PledgeDocument[];
  contributorProfiles: ContributorProfileDocument[];
}

const RECON_COLORS: Record<ReconciliationStatus, { bg: string; fg: string }> = {
  UNMATCHED: { bg: "#fff2d6", fg: "#8a5a00" },
  MATCHED: { bg: "#e2f1ea", fg: "#1a7048" },
  AMBIGUOUS: { bg: "#fbe2e2", fg: "#a4191a" },
  MANUALLY_OVERRIDDEN: { bg: "#e2eefb", fg: "#1a4dd6" },
  REORGED: { bg: "#f1e2fb", fg: "#5a1a7d" },
};

function selectNode(nodeId: string) {
  setSelectedNode(nodeId);
}

export function ReceiptsFeed({
  receipts,
  pledges,
  contributorProfiles,
}: ReceiptsFeedProps) {
  const [sortMode, setSortMode] = useState<ReceiptsSortMode>("newest");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const cutoffDate = useMemo(() => {
    const now = new Date();
    if (timeRange === "today") {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (timeRange === "7d") {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (timeRange === "30d") {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return null;
  }, [timeRange]);

  const filtered = useMemo(() => {
    if (cutoffDate === null) return receipts;
    return receipts.filter((r) => {
      const ts = r.state.global.blockTimestamp;
      if (!ts) return false;
      return new Date(ts) >= cutoffDate;
    });
  }, [receipts, cutoffDate]);

  const pledgesMap = new Map(pledges.map((p) => [p.header.id, p]));
  const profilesMap = new Map(
    contributorProfiles.map((cp) => [cp.header.id, cp]),
  );

  function getMatchedContributorName(pledgeId: string): string | null {
    const pledge = pledgesMap.get(pledgeId);
    if (!pledge) return null;
    const profileId = pledge.state.global.contributorProfileId;
    if (!profileId) return null;
    const profile = profilesMap.get(profileId);
    return profile?.state.global.displayName ?? null;
  }

  function handlePledgeClick(e: React.MouseEvent, pledgeId: string): void {
    e.stopPropagation();
    selectNode(pledgeId);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    setSortMode(e.target.value as ReceiptsSortMode);
  }

  function handleTimeRangeChange(
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void {
    setTimeRange(e.target.value as TimeRange);
  }

  function handleExportCsv() {
    const rows = sorted.map((receipt) => {
      const state = receipt.state.global;
      return [
        state.amount == null ? "" : String(state.amount),
        state.asset?.symbol ?? "",
        state.fromAddress ?? "",
        state.txHash ?? "",
        state.blockTimestamp ?? "",
        state.reconciliationStatus,
      ];
    });
    exportToCsv({
      headers: [
        "Amount",
        "Asset Symbol",
        "From Address",
        "Tx Hash",
        "Block Timestamp",
        "Reconciliation Status",
      ],
      rows,
      filename: "receipts.csv",
    });
  }

  const sorted = [...filtered].sort((a, b) => {
    const aState = a.state.global;
    const bState = b.state.global;

    switch (sortMode) {
      case "oldest": {
        const aIso = aState.blockTimestamp ?? "";
        const bIso = bState.blockTimestamp ?? "";
        if (aIso === bIso) return 0;
        return aIso < bIso ? -1 : 1;
      }
      case "largest":
        return (bState.amount ?? 0) - (aState.amount ?? 0);
      case "unmatched": {
        const aUnmatched = aState.reconciliationStatus === "UNMATCHED" ? 0 : 1;
        const bUnmatched = bState.reconciliationStatus === "UNMATCHED" ? 0 : 1;
        if (aUnmatched !== bUnmatched) return aUnmatched - bUnmatched;
        // fall through to newest within unmatched/matched
        const aIso = aState.blockTimestamp ?? "";
        const bIso = bState.blockTimestamp ?? "";
        if (aIso === bIso) return 0;
        return aIso > bIso ? -1 : 1;
      }
      case "newest":
      default: {
        const aIso = aState.blockTimestamp ?? "";
        const bIso = bState.blockTimestamp ?? "";
        if (aIso === bIso) return 0;
        return aIso > bIso ? -1 : 1;
      }
    }
  });

  return (
    <div className="defi-united-ops__receipts">
      {sorted.length === 0 ? (
        <div className="defi-united-ops__empty-state">
          <span
            className="defi-united-ops__empty-state-icon"
            aria-hidden="true"
          >
            🔗
          </span>
          <div className="defi-united-ops__empty-state-label">
            {receipts.length === 0
              ? "No on-chain receipts captured yet"
              : "No receipts in this time range"}
          </div>
          {receipts.length === 0 && (
            <div className="defi-united-ops__empty-state-desc">
              Add a <code>defi-united/onchain-receipt</code> document or
              configure the receipt-watcher processor.
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="defi-united-ops__receipts-countbar">
            <span className="defi-united-ops__receipts-count">
              {filtered.length} of {receipts.length}{" "}
              {receipts.length === 1 ? "receipt" : "receipts"}
            </span>
            <select
              className="defi-united-ops__receipts-sort"
              value={timeRange}
              onChange={handleTimeRangeChange}
              aria-label="Filter by time range"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <select
              className="defi-united-ops__receipts-sort"
              value={sortMode}
              onChange={handleSortChange}
              aria-label="Sort receipts"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="largest">Largest first</option>
              <option value="unmatched">Unmatched first</option>
            </select>
            <button
              type="button"
              className="defi-united-ops__csv-btn"
              onClick={handleExportCsv}
              title="Export receipts as CSV"
            >
              ↓ CSV
            </button>
          </div>
          <ul className="defi-united-ops__receipts-list">
            {sorted.map((receipt) => {
              const state = receipt.state.global;
              const colors = RECON_COLORS[state.reconciliationStatus];
              const ts = state.blockTimestamp
                ? new Date(state.blockTimestamp).toLocaleString()
                : "—";
              const isMatched =
                state.reconciliationStatus === "MATCHED" ||
                state.reconciliationStatus === "MANUALLY_OVERRIDDEN";
              const pledgeId = state.matchedPledgeId ?? null;
              const contributorName =
                isMatched && pledgeId
                  ? getMatchedContributorName(pledgeId)
                  : null;

              const pledgeLink =
                isMatched && pledgeId ? (
                  <span
                    key="link"
                    className="defi-united-ops__receipts-match-link"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handlePledgeClick(e, pledgeId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        selectNode(pledgeId);
                      }
                    }}
                  >
                    → {contributorName ?? pledgeId}
                  </span>
                ) : null;

              return (
                <li
                  key={receipt.header.id}
                  className="defi-united-ops__receipts-row defi-united-ops__row-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => selectNode(receipt.header.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectNode(receipt.header.id);
                    }
                  }}
                >
                  <div className="defi-united-ops__receipts-amount">
                    {formatAmount(state.amount)}{" "}
                    <span className="defi-united-ops__receipts-symbol">
                      {state.asset?.symbol ?? "ETH"}
                    </span>
                  </div>
                  <div className="defi-united-ops__receipts-meta">
                    <span>from {truncateAddress(state.fromAddress)}</span>
                    <span>&middot; {truncateHash(state.txHash)}</span>
                    <span>&middot; {ts}</span>
                  </div>
                  <div className="defi-united-ops__receipts-status">
                    <span
                      className="defi-united-ops__receipts-pill"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.fg,
                      }}
                    >
                      {state.reconciliationStatus.replace(/_/g, " ")}
                    </span>
                    {pledgeLink}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <style>{`
        .defi-united-ops__receipts-countbar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        .defi-united-ops__receipts-count {
          font-size: 12px;
          color: #6b7280;
        }
        .defi-united-ops__receipts-sort {
          font-size: 11px;
          color: #6b7280;
          background: transparent;
          border: 1px solid #e6e8ec;
          border-radius: 4px;
          padding: 2px 4px;
          margin-left: 8px;
          cursor: pointer;
          font-family: inherit;
        }
        .defi-united-ops__receipts-sort:hover {
          border-color: #c8d0db;
        }
        .defi-united-ops__receipts-sort:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: 1px;
        }
        .defi-united-ops__receipts-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 360px;
          overflow-y: auto;
        }
        .defi-united-ops__receipts-row {
          display: grid;
          grid-template-columns: minmax(0, auto) 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 10px 8px;
        }
        .defi-united-ops__receipts-amount {
          font-size: 13px;
          font-weight: 600;
          color: #0f1115;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .defi-united-ops__receipts-symbol {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }
        .defi-united-ops__receipts-meta {
          font-size: 11px;
          color: #6b7280;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          min-width: 0;
        }
        .defi-united-ops__receipts-pill {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .defi-united-ops__receipts-status {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .defi-united-ops__receipts-match-link {
          font-size: 11px;
          color: #1a4dd6;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
        }
        .defi-united-ops__receipts-match-link:hover {
          text-decoration: underline;
        }
        .defi-united-ops__receipts-match-link:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: 2px;
          border-radius: 2px;
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
