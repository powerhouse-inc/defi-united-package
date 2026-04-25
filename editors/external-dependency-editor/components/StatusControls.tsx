import type {
  DependencyStatus,
  ExternalDependencyState,
} from "../../../document-models/external-dependency/v1/gen/schema/types.js";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  STATUS_OPTIONS,
} from "./constants.js";

type StatusControlsProps = {
  state: ExternalDependencyState;
  onUpdateStatus: (status: DependencyStatus) => void;
  onResolve: () => void;
  onAbandon: () => void;
};

export function StatusControls({
  state,
  onUpdateStatus,
  onResolve,
  onAbandon,
}: StatusControlsProps) {
  const isTerminal =
    state.status === "RESOLVED" || state.status === "ABANDONED";

  return (
    <section className="ext-dep-card">
      <h2 className="ext-dep-card-title">Status</h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[state.status]}`}
          >
            Currently: {STATUS_LABEL[state.status]}
          </span>
          <label className="ext-dep-field flex-1 min-w-[180px]">
            <span className="ext-dep-label">Set status</span>
            <select
              className="ext-dep-input"
              value={state.status}
              onChange={(e) =>
                onUpdateStatus(e.target.value as DependencyStatus)
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="ext-dep-btn ext-dep-btn-resolve"
            onClick={onResolve}
            disabled={isTerminal}
          >
            Mark resolved
          </button>
          <button
            type="button"
            className="ext-dep-btn ext-dep-btn-abandon"
            onClick={onAbandon}
            disabled={isTerminal}
          >
            Abandon
          </button>
          {isTerminal ? (
            <span className="text-xs italic text-slate-500">
              This dependency is in a terminal state.
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
