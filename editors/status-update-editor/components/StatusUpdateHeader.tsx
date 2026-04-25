import { useEffect, useState } from "react";
import type { StatusUpdateState } from "../../../document-models/status-update/v1/gen/schema/types.js";
import { VISIBILITY_BADGE, VISIBILITY_LABEL } from "./constants.js";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return [value, setValue] as const;
}

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusUpdateHeader({
  state,
  onTitleChange,
}: {
  state: StatusUpdateState;
  onTitleChange: (title: string) => void;
}) {
  const [title, setTitle] = useDebouncedField(state.title ?? "", onTitleChange);
  const badge = VISIBILITY_BADGE[state.visibility];
  const isPublished = Boolean(state.publishedAt);

  return (
    <header className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            DeFi United · Status Update
          </div>
          <input
            className="su-title-input mt-1 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Update title"
          />
          <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
            {isPublished ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Published {formatPublishedAt(state.publishedAt)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                Draft
              </span>
            )}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${badge.bg} ${badge.fg}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {VISIBILITY_LABEL[state.visibility]}
        </span>
      </div>

      <style>{`
        .su-title-input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          padding: 2px 0;
          border-bottom: 1px solid transparent;
          transition: border-color 120ms ease;
        }
        .su-title-input:focus {
          border-bottom-color: #1a4dd6;
        }
        .su-title-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </header>
  );
}
