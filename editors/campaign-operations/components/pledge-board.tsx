import type { Action } from "document-model";
import { useMemo, useState } from "react";

import { formatAmount, truncatePhid } from "../utils/formatting.js";
import { exportToCsv } from "../utils/csv.js";
import { StatusPill } from "./inline-edit/status-pill.js";
import { GovernancePopover } from "./inline-edit/governance-popover.js";

import type { PledgeDocument } from "../../../document-models/pledge/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../../document-models/contributor-profile/v1/gen/types.js";
import type { PledgeStatus } from "../../../document-models/pledge/v1/gen/schema/types.js";

interface BulkAction {
  label: string;
  status: PledgeStatus;
  type: string;
}

const BULK_ACTIONS: BulkAction[] = [
  { label: "Confirm", status: "CONFIRMED", type: "MARK_CONFIRMED" },
  { label: "Received", status: "RECEIVED", type: "MARK_RECEIVED" },
];

interface PledgeBoardProps {
  pledges: PledgeDocument[];
  contributorProfiles: ContributorProfileDocument[];
  dispatchPledges: (documentId: string, action: Action) => void;
  campaignTarget?: number | null;
  onOpen?: (pledgeId: string) => void;
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

export function PledgeBoard({
  pledges,
  contributorProfiles,
  dispatchPledges,
  campaignTarget,
  onOpen,
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

  const columnTotals = useMemo(() => {
    const totals = new Map<PledgeStatus, { amount: number; symbol: string }>();
    for (const col of COLUMNS) {
      const items = grouped.get(col.status) ?? [];
      let amount = 0;
      let symbol = "";
      for (const p of items) {
        amount += p.state.global.pledgedAmount ?? 0;
        const s = p.state.global.asset?.symbol ?? "";
        if (s && !symbol) symbol = s;
      }
      totals.set(col.status, { amount, symbol });
    }
    return totals;
  }, [grouped]);

  function handleExportCsv() {
    const rows = pledges.map((pledge) => {
      const state = pledge.state.global;
      const profile = state.contributorProfileId
        ? profilesByPhid.get(state.contributorProfileId)
        : undefined;
      const name =
        profile?.state.global.displayName ?? state.contributorProfileId ?? "";
      const amount = state.pledgedAmount ?? null;
      const symbol = state.asset?.symbol ?? "";
      const status = state.status;
      const govPlatform = state.governance?.platform ?? "";
      return [
        name,
        amount == null ? "" : String(amount),
        symbol,
        status,
        govPlatform,
      ];
    });
    exportToCsv({
      headers: [
        "Contributor",
        "Pledged Amount",
        "Asset Symbol",
        "Status",
        "Governance Platform",
      ],
      rows,
      filename: "pledges.csv",
    });
  }

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelectMode() {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  }

  function togglePledge(pledgeId: string) {
    const next = new Set(selectedIds);
    if (next.has(pledgeId)) next.delete(pledgeId);
    else next.add(pledgeId);
    setSelectedIds(next);
  }

  function selectAll() {
    if (selectedIds.size === pledges.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pledges.map((p) => p.header.id)));
  }

  function bulkAction(action: BulkAction) {
    const msg = `Mark ${selectedIds.size} pledges as ${action.label}?`;
    if (!window.confirm(msg)) return;
    for (const p of pledges) {
      if (!selectedIds.has(p.header.id)) continue;
      const a: Action = {
        type: action.type,
        input:
          action.status === "RECEIVED"
            ? {
                receiptId: "",
                receivedAt: new Date().toISOString(),
                amount: p.state.global.pledgedAmount ?? 0,
              }
            : {},
        scope: "global",
      } as Action;
      dispatchPledges(p.header.id, a);
    }
    setSelectedIds(new Set());
  }

  return (
    <section className="defi-united-ops__card">
      <div className="defi-united-ops__board-header">
        <h3 className="defi-united-ops__card-title">Pledge board</h3>
        <div className="defi-united-ops__board-actions">
          <span className="defi-united-ops__board-count">
            {pledges.length} total
          </span>
          <button
            type="button"
            className="defi-united-ops__csv-btn"
            onClick={toggleSelectMode}
            title={selectMode ? "Exit selection mode" : "Select pledges"}
          >
            {selectMode ? "✓ Done" : "☐ Select"}
          </button>
          <button
            type="button"
            className="defi-united-ops__csv-btn"
            onClick={handleExportCsv}
            title="Export pledges as CSV"
          >
            ↓ CSV
          </button>
        </div>
      </div>
      <div className="defi-united-ops__board-summary">
        {COLUMNS.map((col) => {
          const t = columnTotals.get(col.status);
          return (
            <span
              key={col.status}
              className="defi-united-ops__board-summary-item"
            >
              <span
                className="defi-united-ops__board-summary-label"
                style={{ color: STATUS_ACCENT[col.status] }}
              >
                {col.label}:
              </span>{" "}
              {formatAmount(t?.amount ?? 0)}
              {t?.symbol ? ` ${t.symbol}` : ""}
            </span>
          );
        })}
      </div>

      <div className="defi-united-ops__board-columns">
        {COLUMNS.map((col) => {
          const items = grouped.get(col.status) ?? [];
          const colTotal = columnTotals.get(col.status) ?? {
            amount: 0,
            symbol: "",
          };
          return (
            <div key={col.status} className="defi-united-ops__board-col">
              <div
                className="defi-united-ops__board-col-head"
                style={{ borderTopColor: STATUS_ACCENT[col.status] }}
              >
                {selectMode && items.length > 0 ? (
                  <label className="defi-united-ops__col-checkbox">
                    <input
                      type="checkbox"
                      checked={items.every((p) => selectedIds.has(p.header.id))}
                      onChange={selectAll}
                    />
                  </label>
                ) : null}
                <span className="defi-united-ops__board-col-label">
                  {col.label}
                </span>
                <span className="defi-united-ops__board-col-badge">
                  {items.length}
                </span>
              </div>
              <div className="defi-united-ops__board-col-body">
                {items.length === 0 ? (
                  <div className="defi-united-ops__empty-state">
                    <div className="defi-united-ops__empty-state-label">
                      No {col.label.toLowerCase()} pledges
                    </div>
                    <div className="defi-united-ops__empty-state-desc">
                      Add a <code>defi-united/pledge</code> document to track
                      contributions.
                    </div>
                  </div>
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
                      dispatchPledges={dispatchPledges}
                      selectMode={selectMode}
                      selectedIds={selectedIds}
                      onToggle={togglePledge}
                      onOpen={onOpen}
                    />
                  ))
                )}

                {items.length > 0 && (
                  <div className="defi-united-ops__col-footer">
                    <div className="defi-united-ops__col-separator" />
                    <div
                      className="defi-united-ops__col-total"
                      style={{ borderTopColor: STATUS_ACCENT[col.status] }}
                    >
                      {formatAmount(colTotal.amount)}
                      {colTotal.symbol ? ` ${colTotal.symbol}` : ""}
                    </div>
                    {campaignTarget != null && campaignTarget > 0 ? (
                      <div className="defi-united-ops__col-percent">
                        {((colTotal.amount / campaignTarget) * 100).toFixed(1)}%
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectMode && selectedIds.size > 0 ? (
        <div className="defi-united-ops__bulk-bar">
          <span className="defi-united-ops__bulk-count">
            {selectedIds.size} selected
          </span>
          {BULK_ACTIONS.map((action) => (
            <button
              key={action.type}
              type="button"
              className="defi-united-ops__bulk-btn"
              onClick={() => bulkAction(action)}
            >
              {action.label}
            </button>
          ))}
          <button
            type="button"
            className="defi-united-ops__bulk-btn defi-united-ops__bulk-btn--cancel"
            onClick={toggleSelectMode}
          >
            Cancel
          </button>
        </div>
      ) : null}

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
        .defi-united-ops__board-actions {
          display: flex;
          align-items: center;
          gap: 8px;
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
        .defi-united-ops__pledge-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .defi-united-ops__pledge-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f1115;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }
        .defi-united-ops__pledge-transition {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          padding: 3px 9px;
          border: 1px solid rgba(142,92,255,0.25);
          background: rgba(142,92,255,0.08);
          color: #6936dc;
          border-radius: 999px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          opacity: 0.85;
          white-space: nowrap;
          transition: opacity 120ms ease, background-color 120ms ease, color 120ms ease, transform 120ms ease;
        }
        .defi-united-ops__pledge-card:hover .defi-united-ops__pledge-transition {
          opacity: 1;
        }
        .defi-united-ops__pledge-transition:focus {
          opacity: 1;
          outline: 2px solid #8e5cff;
          outline-offset: 1px;
        }
        .defi-united-ops__pledge-transition:hover {
          background: rgba(142,92,255,0.16);
          border-color: rgba(142,92,255,0.5);
          color: #4f1fc0;
          transform: translateY(-1px);
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
        .defi-united-ops__board-summary {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          padding: 8px 0;
          margin-bottom: 4px;
          border-bottom: 1px solid #e6e8ec;
        }
        .defi-united-ops__board-summary-item {
          font-size: 12px;
          color: #525a6b;
          font-variant-numeric: tabular-nums;
        }
        .defi-united-ops__board-summary-label {
          font-weight: 600;
        }
        .defi-united-ops__col-footer {
          margin-top: auto;
          padding-top: 8px;
        }
        .defi-united-ops__col-separator {
          height: 1px;
          background-color: #e6e8ec;
          margin-bottom: 6px;
        }
        .defi-united-ops__col-total {
          font-size: 12px;
          font-weight: 600;
          color: #0f1115;
          font-variant-numeric: tabular-nums;
          padding-left: 2px;
          border-top: 2px solid #9aa1ad;
        }
        .defi-united-ops__col-percent {
          font-size: 10px;
          color: #6b7280;
          margin-top: 2px;
          font-variant-numeric: tabular-nums;
        }
        .defi-united-ops__col-checkbox input[type="checkbox"] {
          cursor: pointer;
          accent-color: #1a4dd6;
        }
        .defi-united-ops__pledge-checkbox {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 1;
        }
        .defi-united-ops__pledge-checkbox input[type="checkbox"] {
          cursor: pointer;
          accent-color: #1a4dd6;
        }
        .defi-united-ops__pledge-card--selected {
          border-color: #1a4dd6 !important;
          background-color: #f0f4ff !important;
        }
        .defi-united-ops__bulk-bar {
          position: sticky;
          bottom: 16px;
          margin-top: 12px;
          padding: 10px 16px;
          background: #0f1115;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10;
        }
        .defi-united-ops__bulk-count {
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          margin-right: 8px;
        }
        .defi-united-ops__bulk-btn {
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          padding: 4px 10px;
          cursor: pointer;
          font-family: inherit;
          line-height: 1.4;
        }
        .defi-united-ops__bulk-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .defi-united-ops__bulk-btn--cancel {
          color: #9aa1ad;
          background: transparent;
          border: none;
        }
        .defi-united-ops__bulk-btn--cancel:hover {
          color: #ffffff;
        }
      `}</style>
    </section>
  );
}

function PledgeCard({
  pledge,
  profile,
  dispatchPledges: _dispatchPledges,
  selectMode,
  selectedIds,
  onToggle,
  onOpen,
}: {
  pledge: PledgeDocument;
  profile: ContributorProfileDocument | undefined;
  dispatchPledges: (documentId: string, action: Action) => void;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onOpen?: (pledgeId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const state = pledge.state.global;
  const displayName =
    profile?.state.global.displayName ??
    truncatePhid(state.contributorProfileId);
  const symbol = state.asset?.symbol ?? "";
  const hasReceipt = state.receiptIds.length > 0;

  function handleCardClick(e: React.MouseEvent) {
    if (selectMode) {
      e.stopPropagation();
      onToggle(pledge.header.id);
    } else {
      onOpen?.(pledge.header.id);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (selectMode) {
        onToggle(pledge.header.id);
      } else {
        onOpen?.(pledge.header.id);
      }
    }
  }

  return (
    <div
      className={`defi-united-ops__pledge-card${selectedIds.has(pledge.header.id) ? " defi-united-ops__pledge-card--selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Open ${displayName}`}
      style={{ position: "relative" }}
    >
      {selectMode ? (
        <label className="defi-united-ops__pledge-checkbox">
          <input
            type="checkbox"
            checked={selectedIds.has(pledge.header.id)}
            onChange={() => onToggle(pledge.header.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </label>
      ) : null}
      <div className="defi-united-ops__pledge-header-row">
        <div className="defi-united-ops__pledge-name">{displayName}</div>
        <StatusPill
          pledgeId={pledge.header.id}
          currentStatus={state.status}
          hasReceipt={hasReceipt}
          pledgedAmount={state.pledgedAmount ?? null}
        />
      </div>
      <div className="defi-united-ops__pledge-amount">
        {formatAmount(state.pledgedAmount)} {symbol}{" "}
        <span
          title="Pledged amount is locked at proposal time. Cancel + re-propose to change"
          style={{ fontSize: 10, color: "#9aa1ad", cursor: "help" }}
        >
          ⓘ
        </span>
      </div>
      <div style={{ marginTop: 4 }}>
        <GovernancePopover
          pledgeId={pledge.header.id}
          current={state.governance}
        />
      </div>
      {state.governance?.quorumStatus ? (
        <div className="defi-united-ops__pledge-tags">
          <span className="defi-united-ops__pledge-tag">
            {state.governance.quorumStatus}
          </span>
        </div>
      ) : null}
      {hovered && !selectMode && onOpen ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpen(pledge.header.id);
          }}
          style={{
            position: "absolute",
            bottom: 8,
            right: 10,
            fontSize: 10,
            color: "#1a4dd6",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Open in editor →
        </div>
      ) : null}
    </div>
  );
}
