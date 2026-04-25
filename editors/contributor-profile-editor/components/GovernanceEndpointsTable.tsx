import { useState } from "react";
import type {
  GovernanceEndpoint,
  GovernancePlatform,
} from "../../../document-models/contributor-profile/v1/gen/schema/types.js";
import { PLATFORM_LABEL, PLATFORM_OPTIONS } from "./constants.js";

type Draft = {
  platform: GovernancePlatform;
  url: string;
};

const EMPTY_DRAFT: Draft = { platform: "SNAPSHOT", url: "" };

export function GovernanceEndpointsTable({
  endpoints,
  onAdd,
  onRemove,
}: {
  endpoints: GovernanceEndpoint[];
  onAdd: (platform: GovernancePlatform, url: string) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const url = draft.url.trim();
    if (!url) {
      setError("URL is required.");
      return;
    }

    onAdd(draft.platform, url);
    setDraft(EMPTY_DRAFT);
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-neutral-700">
            Governance endpoints
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Where this contributor publishes proposals or holds votes.
          </p>
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
          {endpoints.length} {endpoints.length === 1 ? "endpoint" : "endpoints"}
        </span>
      </div>

      {endpoints.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm italic text-neutral-500">
          No governance endpoints registered yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.06em] text-neutral-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Platform</th>
                <th className="px-3 py-2 text-left font-semibold">URL</th>
                <th className="px-3 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {endpoints.map((ep) => (
                <tr key={ep.id} className="text-neutral-800">
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-700">
                      {PLATFORM_LABEL[ep.platform]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={ep.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="break-all text-sky-700 hover:underline"
                    >
                      {ep.url}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(ep.id)}
                      className="cp-btn cp-btn-danger-ghost"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[160px_minmax(0,1fr)_auto]"
      >
        <select
          value={draft.platform}
          onChange={(e) =>
            setDraft({ ...draft, platform: e.target.value as GovernancePlatform })
          }
          className="cp-input"
          aria-label="Platform"
        >
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABEL[p]}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={draft.url}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          className="cp-input"
          placeholder="https://snapshot.org/#/aave.eth"
          aria-label="Endpoint URL"
        />
        <button type="submit" className="cp-btn cp-btn-primary">
          Add endpoint
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </section>
  );
}
