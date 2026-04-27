import {
  dispatchActions,
  setSelectedNode,
  showCreateDocumentModal,
} from "@powerhousedao/reactor-browser";
import { generateId } from "document-model";
import { useState } from "react";

import { formatAmount, truncateAddress } from "../utils/formatting.js";

import { distributionPlanDocumentType } from "../../../document-models/distribution-plan/v1/gen/document-type.js";
import {
  addRecipient,
  approvePlan,
  cancelPlan,
  completeDistribution,
  markRecipientFailed,
  markRecipientSent,
} from "../../../document-models/distribution-plan/v1/gen/creators.js";
import type { DistributionPlanDocument } from "../../../document-models/distribution-plan/v1/gen/types.js";
import type {
  DistributionStatus,
  RecipientStatus,
} from "../../../document-models/distribution-plan/v1/gen/schema/types.js";

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

const RECIPIENT_STATUS_COLORS: Record<RecipientStatus, string> = {
  PLANNED: "#9aa1ad",
  SENT: "#1a7048",
  FAILED: "#a4191a",
  REFUNDED: "#8a5a00",
};

function selectNode(nodeId: string) {
  setSelectedNode(nodeId);
}

export function DistributionPanel({ plan }: DistributionPanelProps) {
  const [recipientsExpanded, setRecipientsExpanded] = useState(false);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newRationale, setNewRationale] = useState("");
  const [newChainId, setNewChainId] = useState("1");

  function dispatchPlan(action: Parameters<typeof dispatchActions>[0]) {
    if (!plan) return;
    void dispatchActions(action, plan.header.id);
  }

  if (!plan) {
    return (
      <div className="defi-united-ops__dist-empty">
        <div className="defi-united-ops__empty-state">
          <span
            className="defi-united-ops__empty-state-icon"
            aria-hidden="true"
          >
            📊
          </span>
          <div className="defi-united-ops__empty-state-label">
            No distribution plan yet
          </div>
          <div className="defi-united-ops__empty-state-desc">
            Once pledges land, draft a plan that outlines recipients and
            allocations. Publishing the plan unlocks the EXECUTING stage.
          </div>
          <button
            type="button"
            onClick={() =>
              showCreateDocumentModal(distributionPlanDocumentType)
            }
            className="defi-united-ops__dist-cta"
          >
            + Create distribution plan
          </button>
        </div>
        <style>{`
          .defi-united-ops__dist-cta {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 14px;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 600;
            color: #ffffff;
            background: linear-gradient(135deg, #8e5cff 0%, #e63e9d 100%);
            border-radius: 999px;
            border: none;
            cursor: pointer;
            box-shadow: 0 6px 16px -6px rgba(142,92,255,0.4);
            transition: transform 120ms ease, box-shadow 200ms ease;
          }
          .defi-united-ops__dist-cta:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 24px -6px rgba(230,62,157,0.5);
          }
        `}</style>
      </div>
    );
  }

  const state = plan.state.global;
  const colors = STATUS_COLORS[state.status];
  const totalAllocated = state.recipients.reduce<number>(
    (sum, r) => sum + (r.allocatedAmount || 0),
    0,
  );
  const sentCount = state.recipients.filter((r) => r.status === "SENT").length;

  function handleToggleRecipients(e: React.MouseEvent) {
    e.stopPropagation();
    setRecipientsExpanded((prev) => !prev);
  }

  function handleApprove(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      !confirm("Approve this distribution plan? Recipients become settleable.")
    )
      return;
    dispatchPlan(approvePlan({ _: true }));
  }

  function handleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      !confirm(
        "Mark distribution as COMPLETED? This is the final step before resolving the campaign.",
      )
    )
      return;
    dispatchPlan(completeDistribution({ _: true }));
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      !confirm(
        "Cancel this distribution plan? It will be archived; campaign cannot resolve.",
      )
    )
      return;
    dispatchPlan(cancelPlan({ _: true }));
  }

  function handleMarkSent(recipientId: string) {
    const txHash = window.prompt("Enter on-chain transaction hash:");
    if (!txHash || !txHash.trim()) return;
    dispatchPlan(markRecipientSent({ id: recipientId, txHash: txHash.trim() }));
  }

  function handleMarkFailed(recipientId: string) {
    if (!confirm("Mark this recipient transfer as FAILED?")) return;
    dispatchPlan(markRecipientFailed({ id: recipientId }));
  }

  function handleAddRecipient(e: React.FormEvent) {
    e.preventDefault();
    if (!newAddress.trim() || !newAmount.trim()) return;
    dispatchPlan(
      addRecipient({
        id: generateId(),
        address: newAddress.trim(),
        chainId: Number(newChainId) || 1,
        allocatedAmount: Number(newAmount),
        rationale: newRationale.trim() || undefined,
      }),
    );
    setNewAddress("");
    setNewAmount("");
    setNewRationale("");
    setShowAddRecipient(false);
  }

  const allSent =
    state.recipients.length > 0 &&
    state.recipients.every((r) => r.status === "SENT");
  const isMutable =
    state.status === "DRAFT" ||
    state.status === "APPROVED" ||
    state.status === "EXECUTING";

  return (
    <div
      className="defi-united-ops__dist defi-united-ops__row-clickable"
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
        <span
          className="defi-united-ops__dist-pill"
          style={{ backgroundColor: colors.bg, color: colors.fg }}
        >
          {state.status}
        </span>
        <div className="defi-united-ops__dist-actions">
          {state.status === "DRAFT" ? (
            <button
              type="button"
              className="defi-united-ops__dist-btn defi-united-ops__dist-btn--primary"
              onClick={handleApprove}
              disabled={state.recipients.length === 0}
              title={
                state.recipients.length === 0
                  ? "Add at least one recipient before approving"
                  : "Approve plan and start settling"
              }
            >
              Approve plan
            </button>
          ) : null}
          {(state.status === "APPROVED" || state.status === "EXECUTING") &&
          allSent ? (
            <button
              type="button"
              className="defi-united-ops__dist-btn defi-united-ops__dist-btn--primary"
              onClick={handleComplete}
              title="All recipients have been sent — finalize the distribution"
            >
              Complete distribution
            </button>
          ) : null}
          {isMutable ? (
            <button
              type="button"
              className="defi-united-ops__dist-btn defi-united-ops__dist-btn--ghost"
              onClick={handleCancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
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

      {state.recipients.length > 0 && (
        <div className="defi-united-ops__dist-recipients">
          <button
            className="defi-united-ops__dist-recipients-toggle"
            type="button"
            onClick={handleToggleRecipients}
            aria-expanded={recipientsExpanded}
          >
            {recipientsExpanded ? "▾" : "▸"} Recipients
          </button>

          {recipientsExpanded && (
            <div className="defi-united-ops__dist-recipients-table-wrap">
              <table className="defi-united-ops__dist-recipients-table">
                <thead>
                  <tr>
                    <th className="defi-united-ops__dist-recipients-th">
                      Recipient
                    </th>
                    <th className="defi-united-ops__dist-recipients-th">
                      Amount
                    </th>
                    <th className="defi-united-ops__dist-recipients-th">
                      Status
                    </th>
                    <th className="defi-united-ops__dist-recipients-th">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {state.recipients.map((r) => {
                    const settleable = isMutable && r.status === "PLANNED";
                    return (
                      <tr key={r.id}>
                        <td className="defi-united-ops__dist-recipients-td">
                          <span
                            title={r.address}
                            className="defi-united-ops__dist-recipients-address"
                          >
                            {truncateAddress(r.address)}
                          </span>
                        </td>
                        <td className="defi-united-ops__dist-recipients-td">
                          {formatAmount(r.allocatedAmount)}
                        </td>
                        <td className="defi-united-ops__dist-recipients-td">
                          <span
                            className="defi-united-ops__dist-recipients-status"
                            style={{
                              color: RECIPIENT_STATUS_COLORS[r.status],
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="defi-united-ops__dist-recipients-td">
                          {settleable ? (
                            <div
                              className="defi-united-ops__dist-row-actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="defi-united-ops__dist-row-btn"
                                onClick={() => handleMarkSent(r.id)}
                              >
                                Mark sent
                              </button>
                              <button
                                type="button"
                                className="defi-united-ops__dist-row-btn defi-united-ops__dist-row-btn--ghost"
                                onClick={() => handleMarkFailed(r.id)}
                              >
                                Failed
                              </button>
                            </div>
                          ) : r.txHash ? (
                            <a
                              href={`https://etherscan.io/tx/${r.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="defi-united-ops__dist-row-tx"
                              onClick={(e) => e.stopPropagation()}
                            >
                              tx ↗
                            </a>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isMutable ? (
        <div
          className="defi-united-ops__dist-add"
          onClick={(e) => e.stopPropagation()}
        >
          {!showAddRecipient ? (
            <button
              type="button"
              className="defi-united-ops__dist-add-trigger"
              onClick={() => setShowAddRecipient(true)}
            >
              + Add recipient
            </button>
          ) : (
            <form
              className="defi-united-ops__dist-add-form"
              onSubmit={handleAddRecipient}
            >
              <input
                placeholder="Recipient address (0x…)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value.trim())}
                pattern="^0x[a-fA-F0-9]{40}$"
                required
              />
              <input
                placeholder="Amount"
                value={newAmount}
                onChange={(e) =>
                  setNewAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                inputMode="decimal"
                required
              />
              <input
                placeholder="Chain ID"
                value={newChainId}
                onChange={(e) =>
                  setNewChainId(e.target.value.replace(/[^0-9]/g, ""))
                }
                inputMode="numeric"
                style={{ maxWidth: 80 }}
              />
              <input
                placeholder="Rationale (optional)"
                value={newRationale}
                onChange={(e) => setNewRationale(e.target.value)}
              />
              <div className="defi-united-ops__dist-add-actions">
                <button
                  type="button"
                  className="defi-united-ops__dist-btn defi-united-ops__dist-btn--ghost"
                  onClick={() => setShowAddRecipient(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="defi-united-ops__dist-btn defi-united-ops__dist-btn--primary"
                >
                  Add recipient
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      <style>{`
        .defi-united-ops__dist-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .defi-united-ops__dist-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .defi-united-ops__dist-btn {
          display: inline-flex;
          align-items: center;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 999px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: transform 120ms ease, box-shadow 200ms ease, background 150ms ease, border-color 150ms ease;
        }
        .defi-united-ops__dist-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .defi-united-ops__dist-btn--primary {
          color: #ffffff;
          background: linear-gradient(135deg, #8e5cff 0%, #e63e9d 100%);
          box-shadow: 0 6px 16px -6px rgba(142,92,255,0.45);
        }
        .defi-united-ops__dist-btn--primary:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px -6px rgba(230,62,157,0.55);
        }
        .defi-united-ops__dist-btn--ghost {
          color: #525a6b;
          background: #ffffff;
          border-color: #e5e7eb;
        }
        .defi-united-ops__dist-btn--ghost:hover {
          border-color: #c2123a;
          color: #c2123a;
        }
        .defi-united-ops__dist-row-actions {
          display: flex;
          gap: 4px;
        }
        .defi-united-ops__dist-row-btn {
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 600;
          color: #1a7048;
          background: #e2f1ea;
          border: 1px solid #c4e0d2;
          border-radius: 999px;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 120ms ease;
        }
        .defi-united-ops__dist-row-btn:hover {
          background: #c4e0d2;
        }
        .defi-united-ops__dist-row-btn--ghost {
          color: #6b7280;
          background: #ffffff;
          border-color: #e5e7eb;
        }
        .defi-united-ops__dist-row-btn--ghost:hover {
          color: #c2123a;
          background: #fce8ee;
          border-color: #f3c4ce;
        }
        .defi-united-ops__dist-row-tx {
          font-size: 10px;
          color: #1a4dd6;
          text-decoration: none;
        }
        .defi-united-ops__dist-row-tx:hover {
          text-decoration: underline;
        }
        .defi-united-ops__dist-add {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #e5e7eb;
        }
        .defi-united-ops__dist-add-trigger {
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #6936dc;
          background: rgba(142,92,255,0.08);
          border: 1px dashed rgba(142,92,255,0.35);
          border-radius: 999px;
          cursor: pointer;
        }
        .defi-united-ops__dist-add-trigger:hover {
          background: rgba(142,92,255,0.14);
        }
        .defi-united-ops__dist-add-form {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .defi-united-ops__dist-add-form input {
          padding: 7px 10px;
          font-size: 12px;
          border: 1px solid #d8dae6;
          border-radius: 8px;
          font-family: inherit;
          flex: 1;
          min-width: 140px;
        }
        .defi-united-ops__dist-add-form input:focus {
          outline: none;
          border-color: #8e5cff;
          box-shadow: 0 0 0 3px rgba(142,92,255,0.15);
        }
        .defi-united-ops__dist-add-actions {
          display: flex;
          gap: 6px;
          margin-left: auto;
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
        .defi-united-ops__dist-recipients {
          margin-top: 14px;
        }
        .defi-united-ops__dist-recipients-toggle {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          color: #525a6b;
          padding: 4px 0;
          display: flex;
          align-items: center;
          gap: 4px;
          letter-spacing: 0.02em;
        }
        .defi-united-ops__dist-recipients-toggle:hover {
          color: #0f1115;
        }
        .defi-united-ops__dist-recipients-toggle:focus {
          outline: 2px solid #1a4dd6;
          outline-offset: 2px;
          border-radius: 2px;
        }
        .defi-united-ops__dist-recipients-table-wrap {
          max-height: 132px;
          overflow-y: auto;
          margin-top: 6px;
        }
        .defi-united-ops__dist-recipients-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .defi-united-ops__dist-recipients-th {
          text-align: left;
          font-weight: 600;
          color: #6b7280;
          padding: 4px 8px;
          border-bottom: 1px solid #e6e8ec;
          position: sticky;
          top: 0;
          background: #ffffff;
          font-size: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .defi-united-ops__dist-recipients-td {
          padding: 5px 8px;
          border-bottom: 1px solid #f1f3f7;
          color: #0f1115;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .defi-united-ops__dist-recipients-address {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          font-size: 10px;
          color: #525a6b;
        }
        .defi-united-ops__dist-recipients-status {
          font-weight: 600;
          font-size: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
