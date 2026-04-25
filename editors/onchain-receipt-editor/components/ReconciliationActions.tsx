import { useState } from "react";

type Handlers = {
  onAttachPledge: (pledgeId: string) => void;
  onMarkAmbiguous: () => void;
  onOverrideMatch: (pledgeId: string) => void;
  onClearMatch: () => void;
};

type InlineForm = "attach" | "override" | null;

function ActionButton({
  variant = "default",
  disabled,
  onClick,
  children,
}: {
  variant?: "default" | "primary" | "danger" | "warning";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    default:
      "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50",
    primary:
      "bg-sky-600 text-white border-sky-600 hover:bg-sky-700",
    danger:
      "bg-white text-rose-700 border-rose-200 hover:bg-rose-50",
    warning:
      "bg-white text-amber-800 border-amber-200 hover:bg-amber-50",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function ReconciliationActions({
  handlers,
}: {
  handlers: Handlers;
}) {
  const [openForm, setOpenForm] = useState<InlineForm>(null);
  const [pledgeId, setPledgeId] = useState("");

  function reset() {
    setOpenForm(null);
    setPledgeId("");
  }

  function submit() {
    const value = pledgeId.trim();
    if (!value) return;
    if (openForm === "attach") {
      handlers.onAttachPledge(value);
    } else if (openForm === "override") {
      handlers.onOverrideMatch(value);
    }
    reset();
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
        Reconciliation
      </h2>
      <p className="mt-1 text-xs text-neutral-500">
        Reconciliation is normally handled automatically by the
        pledge-reconciliation processor. Use these controls only for manual
        intervention.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton
          variant="primary"
          onClick={() => setOpenForm(openForm === "attach" ? null : "attach")}
        >
          Attach pledge
        </ActionButton>
        <ActionButton
          variant="warning"
          onClick={handlers.onMarkAmbiguous}
        >
          Mark ambiguous
        </ActionButton>
        <ActionButton
          onClick={() =>
            setOpenForm(openForm === "override" ? null : "override")
          }
        >
          Override match
        </ActionButton>
        <ActionButton variant="danger" onClick={handlers.onClearMatch}>
          Clear match
        </ActionButton>
      </div>

      {openForm ? (
        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            {openForm === "attach"
              ? "Attach pledge — pledge document PHID"
              : "Override match — pledge document PHID"}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              value={pledgeId}
              onChange={(e) => setPledgeId(e.target.value)}
              placeholder="phd:…"
              className="min-w-[280px] flex-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-mono text-sm text-neutral-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <ActionButton
              variant="primary"
              disabled={!pledgeId.trim()}
              onClick={submit}
            >
              Confirm
            </ActionButton>
            <ActionButton onClick={reset}>Cancel</ActionButton>
          </div>
        </div>
      ) : null}
    </section>
  );
}
