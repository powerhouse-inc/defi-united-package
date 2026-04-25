import type { DistributionStatus } from "../../../document-models/distribution-plan/v1/gen/schema/types.js";
import { TERMINAL_PLAN_STATUSES } from "./constants.js";

interface LifecycleControlsProps {
  status: DistributionStatus;
  onApprove: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function LifecycleControls({
  status,
  onApprove,
  onComplete,
  onCancel,
}: LifecycleControlsProps) {
  const canApprove = status === "DRAFT";
  const canComplete = status === "EXECUTING";
  const canCancel = !TERMINAL_PLAN_STATUSES.includes(status);

  if (!canApprove && !canComplete && !canCancel) {
    return null;
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Lifecycle
      </h2>
      <p className="mt-1 text-xs text-neutral-500">
        Plan transitions follow DRAFT → APPROVED → EXECUTING → COMPLETED.
        Cancellation is available from any non-terminal state.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {canApprove ? (
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            Approve plan
          </button>
        ) : null}
        {canComplete ? (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Complete distribution
          </button>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            Cancel plan
          </button>
        ) : null}
      </div>
    </section>
  );
}
