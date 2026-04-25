import { useState } from "react";
import type { PledgeState } from "../../../document-models/pledge/v1/gen/types.js";
import { allowedActions } from "./constants.js";

export interface StateMachineHandlers {
  markGovernancePending: () => void;
  markConfirmed: () => void;
  markReceived: (params: { receiptId: string; amount: number }) => void;
  cancelPledge: (reason: string) => void;
  failPledge: (reason: string) => void;
}

export function StateMachineButtons({
  state,
  on,
}: {
  state: PledgeState;
  on: StateMachineHandlers;
}) {
  const allowed = allowedActions(state.status);
  const [reason, setReason] = useState("");
  const [receiptId, setReceiptId] = useState("");
  const [receiptAmount, setReceiptAmount] = useState<string>(
    state.pledgedAmount != null ? String(state.pledgedAmount) : "",
  );

  return (
    <section className="pledge-card">
      <h2 className="pledge-card__title">Lifecycle</h2>

      <div className="pledge-actions">
        <button
          type="button"
          className="pledge-btn pledge-btn--primary"
          disabled={!allowed.has("markGovernancePending")}
          onClick={() => on.markGovernancePending()}
        >
          Mark governance pending
        </button>
        <button
          type="button"
          className="pledge-btn pledge-btn--primary"
          disabled={!allowed.has("markConfirmed")}
          onClick={() => on.markConfirmed()}
        >
          Mark confirmed
        </button>
      </div>

      <div className="pledge-actions__row">
        <div className="pledge-form-group">
          <label className="pledge-label" htmlFor="pledge-receipt-id">
            Receipt ID (PHID)
          </label>
          <input
            id="pledge-receipt-id"
            type="text"
            className="pledge-input"
            value={receiptId}
            onChange={(e) => setReceiptId(e.target.value)}
            placeholder="phid:receipt:..."
          />
        </div>
        <div className="pledge-form-group">
          <label className="pledge-label" htmlFor="pledge-receipt-amount">
            Amount received
          </label>
          <input
            id="pledge-receipt-amount"
            type="number"
            step="any"
            className="pledge-input"
            value={receiptAmount}
            onChange={(e) => setReceiptAmount(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="pledge-btn pledge-btn--primary"
          disabled={
            !allowed.has("markReceived") ||
            !receiptId.trim() ||
            !receiptAmount ||
            !Number.isFinite(Number(receiptAmount))
          }
          onClick={() =>
            on.markReceived({
              receiptId: receiptId.trim(),
              amount: Number(receiptAmount),
            })
          }
        >
          Mark received
        </button>
      </div>

      <div className="pledge-actions__row">
        <div className="pledge-form-group pledge-form-group--grow">
          <label className="pledge-label" htmlFor="pledge-reason">
            Reason (optional)
          </label>
          <input
            id="pledge-reason"
            type="text"
            className="pledge-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Used for cancel / fail"
          />
        </div>
        <button
          type="button"
          className="pledge-btn pledge-btn--neutral"
          disabled={!allowed.has("cancelPledge")}
          onClick={() => on.cancelPledge(reason)}
        >
          Cancel pledge
        </button>
        <button
          type="button"
          className="pledge-btn pledge-btn--danger"
          disabled={!allowed.has("failPledge")}
          onClick={() => on.failPledge(reason)}
        >
          Fail pledge
        </button>
      </div>
    </section>
  );
}
