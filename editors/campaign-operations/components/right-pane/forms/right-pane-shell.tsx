import { type ReactNode, useEffect } from "react";

interface RightPaneShellProps {
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  busy?: boolean;
  children: ReactNode;
}

export function RightPaneShell({
  title,
  onClose,
  onSubmit,
  submitLabel = "Save",
  submitDisabled,
  busy,
  children,
}: RightPaneShellProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // only when not in an input field
        const target = e.target;
        const isInput =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement;
        if (!isInput) onClose();
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "Enter" &&
        onSubmit &&
        !submitDisabled &&
        !busy
      ) {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onSubmit, submitDisabled, busy]);

  return (
    <div className="defi-united-ops__rps">
      <header className="defi-united-ops__rps-header">
        <button
          type="button"
          className="defi-united-ops__rps-back"
          onClick={onClose}
          aria-label="Close"
        >
          ← Back
        </button>
        <span className="defi-united-ops__rps-title">{title}</span>
        {onSubmit ? (
          <button
            type="button"
            className="defi-united-ops__rps-submit"
            onClick={onSubmit}
            disabled={submitDisabled || busy}
          >
            {busy ? "Saving…" : `${submitLabel} ⌘↵`}
          </button>
        ) : (
          <span style={{ width: 80 }} />
        )}
      </header>
      <div className="defi-united-ops__rps-body">{children}</div>
      <style>{`
        .defi-united-ops__rps { display: flex; flex-direction: column; height: 100%; }
        .defi-united-ops__rps-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid #e6e8ec; background: #fafbfc; gap: 12px;
        }
        .defi-united-ops__rps-back {
          background: none; border: none; cursor: pointer; font-size: 13px; color: #525a6b;
          padding: 4px 8px; border-radius: 6px;
        }
        .defi-united-ops__rps-back:hover { background: #f1f3f7; color: #0f1115; }
        .defi-united-ops__rps-title {
          font-size: 14px; font-weight: 600; color: #0f1115; flex: 1; text-align: center;
        }
        .defi-united-ops__rps-submit {
          background: #1a4dd6; color: white; border: none; padding: 7px 14px;
          border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .defi-united-ops__rps-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .defi-united-ops__rps-submit:hover:not(:disabled) { background: #1340b0; }
        .defi-united-ops__rps-body { flex: 1; overflow-y: auto; padding: 16px; }
      `}</style>
    </div>
  );
}
