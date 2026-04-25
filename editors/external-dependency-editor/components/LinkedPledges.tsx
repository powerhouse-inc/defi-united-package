import { useState } from "react";
import type { ExternalDependencyState } from "../../../document-models/external-dependency/v1/gen/schema/types.js";

type LinkedPledgesProps = {
  state: ExternalDependencyState;
  onLink: (pledgeId: string) => void;
  onUnlink: (pledgeId: string) => void;
};

export function LinkedPledges({ state, onLink, onUnlink }: LinkedPledgesProps) {
  const [draft, setDraft] = useState("");
  const blocks = state.blocks ?? [];

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (blocks.includes(trimmed)) {
      setDraft("");
      return;
    }
    onLink(trimmed);
    setDraft("");
  }

  return (
    <section className="ext-dep-card">
      <h2 className="ext-dep-card-title">Linked pledges</h2>
      <p className="mb-3 text-xs text-slate-500">
        Pledges blocked by this dependency. Paste a pledge PHID to link.
      </p>

      <form
        className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={handleAdd}
      >
        <input
          className="ext-dep-input flex-1 font-mono text-xs"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="phd:… or document id"
        />
        <button
          type="submit"
          className="ext-dep-btn ext-dep-btn-primary"
          disabled={!draft.trim()}
        >
          Link pledge
        </button>
      </form>

      {blocks.length === 0 ? (
        <p className="text-sm italic text-slate-500">No pledges linked yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {blocks.map((pledgeId) => (
            <li
              key={pledgeId}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <span className="truncate font-mono text-xs text-slate-700">
                {pledgeId}
              </span>
              <button
                type="button"
                className="ext-dep-btn ext-dep-btn-subtle"
                onClick={() => onUnlink(pledgeId)}
              >
                Unlink
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
