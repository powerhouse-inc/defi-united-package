import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { ReliefCampaignState } from "../../../document-models/relief-campaign/v1/gen/schema/types.js";

interface DetailsCallbacks {
  setName: (v: string) => void;
  setSlug: (v: string) => void;
  setSummary: (v: string) => void;
  setTargetAmount: (v: number | null) => void;
  setRiskDisclaimer: (v: string) => void;
}

function useDebouncedField(
  initial: string,
  commit: (v: string) => void,
  delayMs = 600,
) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(initial);
  }, [initial]);
  useEffect(() => {
    if (value === initial) return;
    const t = setTimeout(() => commit(value), delayMs);
    return () => clearTimeout(t);
  }, [value]);
  return [value, setValue] as const;
}

export function CampaignDetails({
  state,
  on,
}: {
  state: ReliefCampaignState;
  on: DetailsCallbacks;
}) {
  const [name, setName] = useDebouncedField(state.name ?? "", on.setName);
  const [slug, setSlug] = useDebouncedField(state.slug ?? "", on.setSlug);
  const [summary, setSummary] = useDebouncedField(
    state.summary ?? "",
    on.setSummary,
  );
  const [risk, setRisk] = useDebouncedField(
    state.riskDisclaimer ?? "",
    on.setRiskDisclaimer,
  );

  const targetInitial =
    state.targetAmount == null ? "" : String(state.targetAmount);
  const [target, setTarget] = useState(targetInitial);
  useEffect(() => setTarget(targetInitial), [targetInitial]);

  function commitTarget() {
    if (target.trim() === "") {
      if (state.targetAmount != null) on.setTargetAmount(null);
      return;
    }
    const parsed = Number(target);
    if (Number.isFinite(parsed) && parsed !== state.targetAmount) {
      on.setTargetAmount(parsed);
    }
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Campaign details
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Name">
          <input
            className="rfc-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="DeFi United — rsETH recovery"
          />
        </Field>

        <Field label="Slug" hint="URL-safe identifier used by subgraphs">
          <input
            className="rfc-input font-mono text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="rseth-recovery-2026-04"
          />
        </Field>

        <Field
          label={`Target amount (${state.affectedAsset?.symbol ?? "ETH"})`}
          className="md:col-span-1"
        >
          <input
            className="rfc-input"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onBlur={commitTarget}
            inputMode="decimal"
            placeholder="0.0"
          />
        </Field>

        <div />

        <Field label="Summary" className="md:col-span-2">
          <textarea
            className="rfc-input min-h-[72px] resize-y"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short, public-facing description of the relief campaign."
          />
        </Field>

        <Field
          label="Risk disclaimer"
          hint="Surfaced verbatim on the public app"
          className="md:col-span-2"
        >
          <textarea
            className="rfc-input min-h-[96px] resize-y"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            placeholder="Contributions are non-custodial pledges; receipt does not guarantee distribution."
          />
        </Field>
      </div>

      <style>{`
        .rfc-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #111827;
          background-color: #fff;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .rfc-input:focus {
          outline: none;
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.12);
        }
        .rfc-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-xs font-medium text-neutral-700">{label}</span>
      {children}
      {hint ? (
        <span className="text-[11px] text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
}
