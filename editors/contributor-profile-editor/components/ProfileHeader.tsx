import type { ContributorProfileState } from "../../../document-models/contributor-profile/v1/gen/schema/types.js";
import { KIND_LABEL, TRUST_BADGE, TRUST_LABEL } from "./constants.js";

export function ProfileHeader({ state }: { state: ContributorProfileState }) {
  const trust = state.trustLevel;
  const badge = TRUST_BADGE[trust];

  return (
    <header className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            DeFi United · Contributor Profile
          </div>
          <h1 className="mt-1 truncate text-2xl font-semibold text-neutral-900">
            {state.displayName || "Unnamed contributor"}
          </h1>
          {state.legalName ? (
            <p className="mt-1 truncate text-sm text-neutral-500">
              {state.legalName}
            </p>
          ) : null}
          <div className="mt-2 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-600">
            {KIND_LABEL[state.kind]}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${badge.bg} ${badge.fg}`}
        >
          {TRUST_LABEL[trust]}
        </span>
      </div>
    </header>
  );
}
