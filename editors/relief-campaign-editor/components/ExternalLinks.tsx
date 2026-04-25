import { useState } from "react";
import type { ExternalLink } from "../../../document-models/relief-campaign/v1/gen/schema/types.js";

interface Props {
  links: ExternalLink[];
  onAdd: (input: { label: string; url: string }) => void;
}

export function ExternalLinks({ links, onAdd }: Props) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  function handleAdd() {
    if (!label.trim() || !url.trim()) return;
    onAdd({ label: label.trim(), url: url.trim() });
    setLabel("");
    setUrl("");
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          External links
        </h2>
        <span className="text-xs text-neutral-500">{links.length} linked</span>
      </div>

      {links.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-xs italic text-neutral-500">
          No external links yet. Add postmortems, Snapshot proposals, or
          announcements.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2 font-medium">Label</th>
                <th className="px-3 py-2 font-medium">URL</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-t border-neutral-100">
                  <td className="px-3 py-2 text-neutral-900">{link.label}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-blue-600 hover:underline"
                    >
                      {link.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
        <input
          className="rfc-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Postmortem)"
          aria-label="Link label"
        />
        <input
          className="rfc-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          aria-label="Link URL"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!label.trim() || !url.trim()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          Add link
        </button>
      </div>

      <style>{`
        .rfc-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #111827;
          background-color: #fff;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .rfc-input:focus {
          outline: none;
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.12);
        }
      `}</style>
    </section>
  );
}
