import { setSelectedNode } from "@powerhousedao/reactor-browser";

import type { OnchainReceiptDocument } from "../../../document-models/onchain-receipt/v1/gen/types.js";
import type { ReconciliationStatus } from "../../../document-models/onchain-receipt/v1/gen/schema/types.js";

interface ReceiptsFeedProps {
  receipts: OnchainReceiptDocument[];
}

const RECON_COLORS: Record<ReconciliationStatus, { bg: string; fg: string }> = {
  UNMATCHED: { bg: "#fff2d6", fg: "#8a5a00" },
  MATCHED: { bg: "#e2f1ea", fg: "#1a7048" },
  AMBIGUOUS: { bg: "#fbe2e2", fg: "#a4191a" },
  MANUALLY_OVERRIDDEN: { bg: "#e2eefb", fg: "#1a4dd6" },
};

function truncateAddress(addr: string | null | undefined): string {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function truncateHash(hash: string | null | undefined): string {
  if (!hash) return "—";
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
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

export function ReceiptsFeed({ receipts }: ReceiptsFeedProps) {
  const sorted = [...receipts].sort((a, b) => {
    const aIso = a.state.global.blockTimestamp ?? "";
    const bIso = b.state.global.blockTimestamp ?? "";
    if (aIso === bIso) return 0;
    return aIso > bIso ? -1 : 1;
  });

  return (
    <section className="defi-united-ops__card defi-united-ops__receipts">
      <div className="defi-united-ops__receipts-header">
        <h3 className="defi-united-ops__card-title">On-chain receipts</h3>
        <span className="defi-united-ops__receipts-count">
          {receipts.length} {receipts.length === 1 ? "receipt" : "receipts"}
        </span>
      </div>

      {sorted.length === 0 ? (
        <span className="defi-united-ops__empty">
          No on-chain receipts captured yet. The receipt-watcher processor will
          populate this feed once configured.
        </span>
      ) : (
        <ul className="defi-united-ops__receipts-list">
          {sorted.map((receipt) => {
            const state = receipt.state.global;
            const colors = RECON_COLORS[state.reconciliationStatus];
            const ts = state.blockTimestamp
              ? new Date(state.blockTimestamp).toLocaleString()
              : "—";
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
                  <span>· {truncateHash(state.txHash)}</span>
                  <span>· {ts}</span>
                </div>
                <span
                  className="defi-united-ops__receipts-pill"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.fg,
                  }}
                >
                  {state.reconciliationStatus.replace(/_/g, " ")}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <style>{`
        .defi-united-ops__receipts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .defi-united-ops__receipts-header h3 {
          margin: 0;
        }
        .defi-united-ops__receipts-count {
          font-size: 12px;
          color: #6b7280;
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
      `}</style>
    </section>
  );
}
