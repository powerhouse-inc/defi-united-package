import { useEffect, useState } from "react";
import type { PledgeState } from "../../../document-models/pledge/v1/gen/types.js";

export interface NotesHandlers {
  editNotes: (input: {
    publicNotes: string | null;
    internalNotes: string | null;
  }) => void;
}

export function NotesEditor({
  state,
  on,
}: {
  state: PledgeState;
  on: NotesHandlers;
}) {
  const [publicNotes, setPublicNotes] = useState<string>(
    state.publicNotes ?? "",
  );
  const [internalNotes, setInternalNotes] = useState<string>(
    state.internalNotes ?? "",
  );

  useEffect(() => {
    setPublicNotes(state.publicNotes ?? "");
  }, [state.publicNotes]);

  useEffect(() => {
    setInternalNotes(state.internalNotes ?? "");
  }, [state.internalNotes]);

  const dirty =
    publicNotes !== (state.publicNotes ?? "") ||
    internalNotes !== (state.internalNotes ?? "");

  return (
    <section className="pledge-card">
      <h2 className="pledge-card__title">Notes</h2>

      <div className="pledge-form-group">
        <div className="pledge-label-row">
          <label className="pledge-label" htmlFor="pledge-public-notes">
            Public notes
          </label>
          <span className="pledge-badge pledge-badge--public">Public</span>
        </div>
        <textarea
          id="pledge-public-notes"
          className="pledge-textarea"
          rows={4}
          value={publicNotes}
          onChange={(e) => setPublicNotes(e.target.value)}
          placeholder="Surfaced on the public campaign page."
        />
      </div>

      <div className="pledge-form-group">
        <div className="pledge-label-row">
          <label className="pledge-label" htmlFor="pledge-internal-notes">
            Internal notes
          </label>
          <span className="pledge-badge pledge-badge--internal">Internal</span>
        </div>
        <textarea
          id="pledge-internal-notes"
          className="pledge-textarea"
          rows={4}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Operations-only. Never published."
        />
      </div>

      <div className="pledge-form-row">
        <button
          type="button"
          className="pledge-btn pledge-btn--primary"
          disabled={!dirty}
          onClick={() =>
            on.editNotes({
              publicNotes: publicNotes ? publicNotes : null,
              internalNotes: internalNotes ? internalNotes : null,
            })
          }
        >
          Save notes
        </button>
        {dirty ? (
          <button
            type="button"
            className="pledge-btn pledge-btn--neutral"
            onClick={() => {
              setPublicNotes(state.publicNotes ?? "");
              setInternalNotes(state.internalNotes ?? "");
            }}
          >
            Reset
          </button>
        ) : null}
      </div>
    </section>
  );
}
