import { useState } from "react";
import { dispatchActions } from "@powerhousedao/reactor-browser";
import type { Action } from "document-model";
import {
  validTransitions,
  type PledgeStatusValue,
} from "../../state/valid-transitions.js";
import {
  markGovernancePending,
  markConfirmed,
  cancelPledge,
  failPledge,
  markReceived,
} from "../../../../document-models/pledge/v1/gen/lifecycle/creators.js";

interface StatusPillProps {
  pledgeId: string;
  currentStatus: string;
  hasReceipt: boolean;
  pledgedAmount: number | null;
}

export function StatusPill({
  pledgeId,
  currentStatus,
  hasReceipt,
  pledgedAmount,
}: StatusPillProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const transitions = validTransitions(
    currentStatus as PledgeStatusValue,
    hasReceipt,
  );

  async function dispatch(actionName: string, _to: string) {
    setBusy(true);
    try {
      let action: Action;
      switch (actionName) {
        case "markGovernancePending":
          action = markGovernancePending({});
          break;
        case "markConfirmed":
          action = markConfirmed({});
          break;
        case "markReceived":
          if (!window.confirm("Mark as RECEIVED — funds confirmed on-chain?")) {
            setBusy(false);
            return;
          }
          action = markReceived({
            amount: pledgedAmount ?? 0,
            receiptId: "",
            receivedAt: new Date().toISOString(),
          });
          break;
        case "cancelPledge":
          if (!window.confirm("Cancel this pledge?")) {
            setBusy(false);
            return;
          }
          action = cancelPledge({ reason: undefined });
          break;
        case "failPledge":
          if (!window.confirm("Mark this pledge as FAILED?")) {
            setBusy(false);
            return;
          }
          action = failPledge({ reason: undefined });
          break;
        default:
          setBusy(false);
          return;
      }
      await dispatchActions(action, pledgeId);
    } catch (e) {
      console.error("StatusPill dispatch failed:", e);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (transitions.length > 0) setOpen((v) => !v);
        }}
        disabled={busy}
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          padding: "3px 8px",
          borderRadius: 999,
          border: "1px solid #e6e8ec",
          background: pillBg(currentStatus),
          color: pillFg(currentStatus),
          cursor: transitions.length > 0 ? "pointer" : "default",
        }}
      >
        {currentStatus}
        {transitions.length > 0 ? " ▾" : ""}
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            background: "#fff",
            border: "1px solid #e6e8ec",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(15,17,21,0.10)",
            padding: 4,
            zIndex: 10,
            minWidth: 180,
          }}
        >
          {transitions.map((t) => (
            <button
              key={t.to}
              type="button"
              onClick={() => !t.disabled && void dispatch(t.action, t.to)}
              disabled={t.disabled}
              title={t.disabledReason}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "6px 10px",
                background: "none",
                border: "none",
                fontSize: 12,
                color: t.disabled ? "#9aa1ad" : "#0f1115",
                cursor: t.disabled ? "not-allowed" : "pointer",
                borderRadius: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!t.disabled) e.currentTarget.style.background = "#f1f3f7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
              }}
            >
              <span>→ {t.to}</span>
              {t.disabled && (
                <span style={{ fontSize: 10, color: "#9aa1ad" }}>locked</span>
              )}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

function pillBg(status: string): string {
  switch (status) {
    case "PROPOSED":
      return "#f7f8fa";
    case "GOVERNANCE_PENDING":
      return "#fef3c7";
    case "CONFIRMED":
      return "#dbeafe";
    case "RECEIVED":
      return "#d1fae5";
    case "CANCELLED":
    case "FAILED":
      return "#fee2e2";
    default:
      return "#f7f8fa";
  }
}

function pillFg(status: string): string {
  switch (status) {
    case "PROPOSED":
      return "#525a6b";
    case "GOVERNANCE_PENDING":
      return "#92400e";
    case "CONFIRMED":
      return "#1e40af";
    case "RECEIVED":
      return "#065f46";
    case "CANCELLED":
    case "FAILED":
      return "#991b1b";
    default:
      return "#0f1115";
  }
}
