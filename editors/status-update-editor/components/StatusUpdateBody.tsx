import { useEffect, useState } from "react";
import type { StatusUpdateState } from "../../../document-models/status-update/v1/gen/schema/types.js";
import { VISIBILITY_BADGE, VISIBILITY_LABEL } from "./constants.js";

function useDebouncedField(
  initial: string,
  commit: (v: string) => void,
  delayMs = 700,
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

export function StatusUpdateBody({
  state,
  onBodyChange,
}: {
  state: StatusUpdateState;
  onBodyChange: (body: string) => void;
}) {
  const [body, setBody] = useDebouncedField(state.body ?? "", onBodyChange);
  const badge = VISIBILITY_BADGE[state.visibility];

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Body (Markdown)
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.bg} ${badge.fg}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {VISIBILITY_LABEL[state.visibility]}
        </span>
      </div>

      <textarea
        className="su-body w-full"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`# Update headline\n\nWhat happened, what's next, what changed since the last update.\n\n- Bullet points are fine\n- Markdown is supported`}
        rows={16}
        spellCheck
      />

      <p className="mt-2 text-[11px] text-neutral-500">
        Plain Markdown. Rendered formatting will appear on the public app.
      </p>

      <style>{`
        .su-body {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 14px;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
          font-size: 13px;
          line-height: 1.55;
          color: #111827;
          background-color: #fafafa;
          resize: vertical;
          min-height: 280px;
          transition: border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease;
        }
        .su-body:focus {
          outline: none;
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.12);
          background-color: #fff;
        }
        .su-body::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </section>
  );
}
