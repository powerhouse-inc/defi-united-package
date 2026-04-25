import type { OnchainReceiptState } from "../../../document-models/onchain-receipt/v1/gen/schema/types.js";
import { formatTokens, truncate } from "./constants.js";
import { StatusBadge } from "./StatusBadge.js";

export function ReceiptHeader({ state }: { state: OnchainReceiptState }) {
  const symbol = state.asset?.symbol ?? "—";

  return (
    <header className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            DeFi United · On-chain Receipt
          </div>
          <h1 className="mt-1 truncate text-2xl font-semibold text-neutral-900">
            <span className="font-mono text-base text-neutral-700">
              {truncate(state.txHash, 10, 8)}
            </span>
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
            <span>chain {state.chainId ?? "—"}</span>
            <span className="text-neutral-300">·</span>
            <span>block {state.blockNumber ?? "—"}</span>
          </div>
        </div>
        <StatusBadge status={state.reconciliationStatus} />
      </div>

      <div className="mt-4 flex items-baseline gap-2 border-t border-neutral-100 pt-4">
        <span className="text-3xl font-bold text-neutral-900">
          {formatTokens(state.amount)}
        </span>
        <span className="text-base font-medium text-neutral-500">
          {symbol}
        </span>
      </div>
    </header>
  );
}
