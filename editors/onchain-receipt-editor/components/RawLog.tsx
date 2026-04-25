import { useState } from "react";

export function RawLog({ rawLog }: { rawLog: string | null | undefined }) {
  const [open, setOpen] = useState(false);

  if (!rawLog) {
    return (
      <section className="rounded-xl border border-neutral-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
            Raw log
          </h2>
          <span className="text-xs text-neutral-400">No raw log captured</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
          Raw log
        </h2>
        <span className="text-xs font-medium text-sky-700">
          {open ? "Hide" : "Show"} raw log
        </span>
      </button>
      {open ? (
        <pre className="mt-3 max-h-96 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs leading-relaxed text-neutral-800">
          {rawLog}
        </pre>
      ) : null}
    </section>
  );
}
