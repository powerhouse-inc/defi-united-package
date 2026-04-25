import type { ExternalDependencyState } from "../../../document-models/external-dependency/v1/gen/schema/types.js";
import {
  KIND_BADGE_CLASS,
  KIND_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
} from "./constants.js";

export function DependencyHeader({
  state,
}: {
  state: ExternalDependencyState;
}) {
  return (
    <header className="ext-dep-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            External dependency
          </span>
          <h1 className="text-2xl font-semibold text-slate-900">
            {state.title || "Untitled dependency"}
          </h1>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[state.status]}`}
          >
            {STATUS_LABEL[state.status]}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${KIND_BADGE_CLASS[state.kind]}`}
          >
            {KIND_LABEL[state.kind]}
          </span>
        </div>
      </div>
      {state.description ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {state.description}
        </p>
      ) : null}
    </header>
  );
}
