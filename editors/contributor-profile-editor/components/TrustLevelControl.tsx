import type { TrustLevel } from "../../../document-models/contributor-profile/v1/gen/schema/types.js";
import { TRUST_BADGE, TRUST_LABEL, TRUST_OPTIONS } from "./constants.js";

export function TrustLevelControl({
  trustLevel,
  onChange,
}: {
  trustLevel: TrustLevel;
  onChange: (next: TrustLevel) => void;
}) {
  const badge = TRUST_BADGE[trustLevel];

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-neutral-700">
            Trust level
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            How this contributor is verified by DeFi United operators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${badge.bg} ${badge.fg}`}
          >
            {TRUST_LABEL[trustLevel]}
          </span>
          <select
            value={trustLevel}
            onChange={(e) => onChange(e.target.value as TrustLevel)}
            className="cp-input"
            aria-label="Trust level"
          >
            {TRUST_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {TRUST_LABEL[level]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
