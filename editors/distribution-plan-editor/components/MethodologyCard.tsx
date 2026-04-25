import { useEffect, useState } from "react";

import type { DistributionPlanState } from "../../../document-models/distribution-plan/v1/gen/schema/types.js";

interface MethodologyCardProps {
  state: DistributionPlanState;
  disabled: boolean;
  onSave: (input: {
    methodology: string;
    totalAvailable: number | null;
  }) => void;
}

export function MethodologyCard({
  state,
  disabled,
  onSave,
}: MethodologyCardProps) {
  const [methodology, setMethodology] = useState<string>(
    state.methodology ?? "",
  );
  const [totalAvailableInput, setTotalAvailableInput] = useState<string>(
    state.totalAvailable != null ? String(state.totalAvailable) : "",
  );

  // Re-sync local state when the underlying document changes (other operators).
  useEffect(() => {
    setMethodology(state.methodology ?? "");
  }, [state.methodology]);

  useEffect(() => {
    setTotalAvailableInput(
      state.totalAvailable != null ? String(state.totalAvailable) : "",
    );
  }, [state.totalAvailable]);

  const dirty =
    methodology !== (state.methodology ?? "") ||
    totalAvailableInput !==
      (state.totalAvailable != null ? String(state.totalAvailable) : "");

  const handleSave = () => {
    const trimmed = totalAvailableInput.trim();
    let totalAvailable: number | null = null;
    if (trimmed !== "") {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) totalAvailable = parsed;
    }
    onSave({ methodology, totalAvailable });
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Methodology
        </h2>
        {disabled ? (
          <span className="text-xs text-neutral-400">
            Locked — plan is not in DRAFT
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-neutral-700">
            Allocation methodology
          </label>
          <textarea
            value={methodology}
            onChange={(e) => setMethodology(e.target.value)}
            disabled={disabled}
            rows={4}
            placeholder='e.g. "Pro-rata to pre-incident rsETH holders, snapshot taken at block 19,123,456"'
            className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700">
            Total available (tokens)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={totalAvailableInput}
            onChange={(e) => setTotalAvailableInput(e.target.value)}
            disabled={disabled}
            placeholder="0.0"
            className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm tabular-nums text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500"
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            ETH-equivalent total to be distributed.
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={disabled || !dirty}
          onClick={handleSave}
          className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          Save methodology
        </button>
      </div>
    </section>
  );
}
