import { useEffect, useState } from "react";
import type { ExternalDependencyState } from "../../../document-models/external-dependency/v1/gen/schema/types.js";

type RefPatch = {
  url: string | null;
  txHash: string | null;
  proposalId: string | null;
};

type ExternalRefFormProps = {
  state: ExternalDependencyState;
  onSubmit: (patch: RefPatch) => void;
};

export function ExternalRefForm({ state, onSubmit }: ExternalRefFormProps) {
  const ref = state.externalRef ?? null;
  const [url, setUrl] = useState(ref?.url ?? "");
  const [txHash, setTxHash] = useState(ref?.txHash ?? "");
  const [proposalId, setProposalId] = useState(ref?.proposalId ?? "");

  useEffect(() => {
    setUrl(state.externalRef?.url ?? "");
    setTxHash(state.externalRef?.txHash ?? "");
    setProposalId(state.externalRef?.proposalId ?? "");
  }, [state.externalRef]);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      url: url.trim() ? url.trim() : null,
      txHash: txHash.trim() ? txHash.trim() : null,
      proposalId: proposalId.trim() ? proposalId.trim() : null,
    });
  }

  return (
    <section className="ext-dep-card">
      <h2 className="ext-dep-card-title">External reference</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSave}>
        <label className="ext-dep-field">
          <span className="ext-dep-label">URL</span>
          <input
            className="ext-dep-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://snapshot.org/#/…"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="ext-dep-field">
            <span className="ext-dep-label">Transaction hash</span>
            <input
              className="ext-dep-input font-mono text-xs"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x…"
            />
          </label>

          <label className="ext-dep-field">
            <span className="ext-dep-label">Proposal ID</span>
            <input
              className="ext-dep-input font-mono text-xs"
              value={proposalId}
              onChange={(e) => setProposalId(e.target.value)}
              placeholder="0x… or 42"
            />
          </label>
        </div>

        {state.externalRef?.url ? (
          <p className="text-xs text-slate-500">
            Current link:{" "}
            <a
              href={state.externalRef.url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 underline"
            >
              {state.externalRef.url}
            </a>
          </p>
        ) : null}

        <div className="flex items-center justify-end">
          <button type="submit" className="ext-dep-btn ext-dep-btn-primary">
            Save reference
          </button>
        </div>
      </form>
    </section>
  );
}
