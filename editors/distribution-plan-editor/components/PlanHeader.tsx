import type { DistributionPlanState } from "../../../document-models/distribution-plan/v1/gen/schema/types.js";
import {
  PLAN_STATUS_BADGE,
  PLAN_STATUS_LABEL,
  formatTokens,
} from "./constants.js";

export function PlanHeader({ state }: { state: DistributionPlanState }) {
  const status = state.status;
  const badge = PLAN_STATUS_BADGE[status];
  const recipientCount = state.recipients.length;

  return (
    <header className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            DeFi United · Distribution Plan
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
            Recovery payout plan
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Single source of truth for recipient allocations. Execution is
            performed manually by operators against approved plans.
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${badge.bg} ${badge.fg}`}
        >
          {PLAN_STATUS_LABEL[status]}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Total available
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 tabular-nums">
              {formatTokens(state.totalAvailable)}
            </span>
            <span className="text-sm font-medium text-neutral-500">
              tokens
            </span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Recipients
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 tabular-nums">
              {recipientCount}
            </span>
            <span className="text-sm font-medium text-neutral-500">
              {recipientCount === 1 ? "address" : "addresses"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
