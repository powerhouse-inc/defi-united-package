import { useEffect, useState } from "react";
import type { ExternalDependencyState } from "../../../document-models/external-dependency/v1/gen/schema/types.js";
import type { DependencyKind } from "../../../document-models/external-dependency/v1/gen/types.js";
import { KIND_LABEL, KIND_OPTIONS } from "./constants.js";

type DetailsPatch = {
  title?: string;
  description?: string;
  kind?: DependencyKind;
  expectedResolution?: string | null;
  assignee?: string;
};

type DetailsFormProps = {
  state: ExternalDependencyState;
  onSubmit: (patch: DetailsPatch) => void;
};

function isoToInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Format YYYY-MM-DDTHH:mm in local time for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function inputValueToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function DependencyDetailsForm({ state, onSubmit }: DetailsFormProps) {
  const [title, setTitle] = useState(state.title);
  const [description, setDescription] = useState(state.description ?? "");
  const [kind, setKind] = useState<DependencyKind>(state.kind);
  const [expectedResolution, setExpectedResolution] = useState(
    isoToInputValue(state.expectedResolution),
  );
  const [assignee, setAssignee] = useState(state.assignee ?? "");

  // Re-sync if upstream state changes (other operators editing).
  useEffect(() => {
    setTitle(state.title);
    setDescription(state.description ?? "");
    setKind(state.kind);
    setExpectedResolution(isoToInputValue(state.expectedResolution));
    setAssignee(state.assignee ?? "");
  }, [
    state.title,
    state.description,
    state.kind,
    state.expectedResolution,
    state.assignee,
  ]);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      title,
      description,
      kind,
      expectedResolution: inputValueToIso(expectedResolution),
      assignee,
    });
  }

  return (
    <section className="ext-dep-card">
      <h2 className="ext-dep-card-title">Details</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSave}>
        <label className="ext-dep-field">
          <span className="ext-dep-label">Title</span>
          <input
            className="ext-dep-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary of the blocker"
          />
        </label>

        <label className="ext-dep-field">
          <span className="ext-dep-label">Description</span>
          <textarea
            className="ext-dep-input min-h-[88px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Context, references, what we're waiting on…"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="ext-dep-field">
            <span className="ext-dep-label">Kind</span>
            <select
              className="ext-dep-input"
              value={kind}
              onChange={(e) => setKind(e.target.value as DependencyKind)}
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="ext-dep-field">
            <span className="ext-dep-label">Expected resolution</span>
            <input
              type="datetime-local"
              className="ext-dep-input"
              value={expectedResolution}
              onChange={(e) => setExpectedResolution(e.target.value)}
            />
          </label>
        </div>

        <label className="ext-dep-field">
          <span className="ext-dep-label">Assignee</span>
          <input
            className="ext-dep-input"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="DID, name, or organization handle"
          />
        </label>

        <div className="flex items-center justify-end">
          <button type="submit" className="ext-dep-btn ext-dep-btn-primary">
            Save details
          </button>
        </div>
      </form>
    </section>
  );
}
