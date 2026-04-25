import type { PledgeState } from "../../../document-models/pledge/v1/gen/types.js";
import { truncatePhid } from "./constants.js";

export function ReceiptsList({ state }: { state: PledgeState }) {
  const ids = state.receiptIds ?? [];
  const received = state.receivedAmount;
  const symbol = state.asset?.symbol ?? "";

  return (
    <section className="pledge-card">
      <h2 className="pledge-card__title">On-chain receipts</h2>

      <p className="pledge-meta">
        <span>
          Received:{" "}
          <strong>
            {received != null
              ? `${received.toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })} ${symbol}`
              : "—"}
          </strong>
        </span>
        {state.receivedAt ? (
          <span className="pledge-meta__sep">
            · last receipt {new Date(state.receivedAt).toLocaleString()}
          </span>
        ) : null}
      </p>

      {ids.length === 0 ? (
        <p className="pledge-empty">No receipts linked yet.</p>
      ) : (
        <ul className="pledge-receipts">
          {ids.map((id) => (
            <li key={id} className="pledge-receipts__item">
              <code>{truncatePhid(id)}</code>
              <span className="pledge-receipts__hint">
                full PHID: <span className="pledge-receipts__full">{id}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
