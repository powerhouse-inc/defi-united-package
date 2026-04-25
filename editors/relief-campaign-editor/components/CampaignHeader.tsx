import type { ReliefCampaignState } from "../../../document-models/relief-campaign/v1/gen/schema/types.js";
import { STATUS_BADGE, STATUS_LABEL } from "./constants.js";

function formatTokens(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "0";
  if (value >= 100) return value.toFixed(0);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

export function CampaignHeader({ state }: { state: ReliefCampaignState }) {
  const status = state.status;
  const badge = STATUS_BADGE[status];
  const assetSymbol = state.affectedAsset?.symbol ?? "ETH";

  return (
    <header className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            DeFi United · Relief Campaign
          </div>
          <h1 className="mt-1 truncate text-2xl font-semibold text-neutral-900">
            {state.name || "Unnamed campaign"}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
            <span className="font-mono text-xs">/{state.slug || "—"}</span>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${badge.bg} ${badge.fg}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2 border-t border-neutral-100 pt-4">
        <span className="text-3xl font-bold text-neutral-900">
          {formatTokens(state.targetAmount)}
        </span>
        <span className="text-base font-medium text-neutral-500">
          {assetSymbol} target
        </span>
      </div>
    </header>
  );
}
