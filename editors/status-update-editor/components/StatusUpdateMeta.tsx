import { useEffect, useState } from "react";
import type {
  StatusUpdateState,
  UpdateVisibility,
} from "../../../document-models/status-update/v1/gen/schema/types.js";
import { VISIBILITY_LABEL, VISIBILITY_OPTIONS } from "./constants.js";

interface MetaCallbacks {
  setVisibility: (v: UpdateVisibility) => void;
  setAuthorProfileId: (v: string) => void;
}

export function StatusUpdateMeta({
  state,
  on,
}: {
  state: StatusUpdateState;
  on: MetaCallbacks;
}) {
  const initialAuthor = state.authorProfileId ?? "";
  const [authorId, setAuthorId] = useState(initialAuthor);
  useEffect(() => setAuthorId(initialAuthor), [initialAuthor]);

  function commitAuthor() {
    if (authorId !== initialAuthor) on.setAuthorProfileId(authorId);
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Update metadata
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Visibility" hint="Controls who can read this update">
          <select
            className="su-input"
            value={state.visibility}
            onChange={(e) =>
              on.setVisibility(e.target.value as UpdateVisibility)
            }
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {VISIBILITY_LABEL[v]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Author profile (PHID)"
          hint="Powerhouse ID of the contributor profile authoring this update"
        >
          <input
            className="su-input font-mono text-xs"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            onBlur={commitAuthor}
            placeholder="phd:contributor-profile/..."
          />
        </Field>
      </div>

      <style>{`
        .su-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #111827;
          background-color: #fff;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .su-input:focus {
          outline: none;
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.12);
        }
        .su-input::placeholder {
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
  children: React.ReactNode;
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
