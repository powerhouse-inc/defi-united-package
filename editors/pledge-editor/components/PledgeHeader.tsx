import type { PledgeState } from "../../../document-models/pledge/v1/gen/types.js";
import { STATUS_LABEL, STATUS_PILL_CLASS, truncatePhid } from "./constants.js";

export function PledgeHeader({ state }: { state: PledgeState }) {
  const symbol = state.asset?.symbol ?? "—";
  const amount = state.pledgedAmount;
  const amountLabel =
    amount != null && Number.isFinite(amount)
      ? amount.toLocaleString(undefined, { maximumFractionDigits: 6 })
      : "—";

  return (
    <header className="pledge-header">
      <div className="pledge-header__left">
        <span className="pledge-header__eyebrow">Pledge</span>
        <h1 className="pledge-header__title">
          {amountLabel} <span className="pledge-header__symbol">{symbol}</span>
        </h1>
        <p className="pledge-header__sub">
          Contributor:{" "}
          <code className="pledge-header__phid">
            {truncatePhid(state.contributorProfileId)}
          </code>
          {state.asset?.chainId != null ? (
            <span className="pledge-header__chain">
              · chain {state.asset.chainId}
            </span>
          ) : null}
        </p>
      </div>
      <span
        className={`pledge-status-pill ${STATUS_PILL_CLASS[state.status]}`}
      >
        {STATUS_LABEL[state.status]}
      </span>
    </header>
  );
}
