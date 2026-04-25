import { useState } from "react";

import type { ApprovalRef } from "../../../document-models/distribution-plan/v1/gen/schema/types.js";
import { truncateId } from "./constants.js";

interface ApprovalRefsTableProps {
  approvalRefs: ApprovalRef[];
  onAdd: (input: { url: string; label: string }) => void;
}

export function ApprovalRefsTable({
  approvalRefs,
  onAdd,
}: ApprovalRefsTableProps) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const valid = url.trim() !== "" && label.trim() !== "";

  const handleSubmit = () => {
    if (!valid) return;
    onAdd({ url: url.trim(), label: label.trim() });
    setUrl("");
    setLabel("");
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Approval references
        </h2>
        <span className="text-xs text-neutral-500">
          {approvalRefs.length}{" "}
          {approvalRefs.length === 1 ? "link" : "links"}
        </span>
      </div>

      {approvalRefs.length === 0 ? (
        <p className="mt-3 text-sm italic text-neutral-500">
          No approvals linked yet. Attach Snapshot, Tally, or forum posts that
          authorize this distribution.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Label</th>
                <th className="px-2 py-2">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {approvalRefs.map((ref) => (
                <tr key={ref.id}>
                  <td className="px-2 py-2 font-mono text-xs text-neutral-500">
                    {truncateId(ref.id)}
                  </td>
                  <td className="px-2 py-2 text-neutral-800">{ref.label}</td>
                  <td className="px-2 py-2">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sky-700 hover:underline"
                    >
                      {ref.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-600">
          Add approval reference
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-12">
          <input
            type="text"
            placeholder="Label (e.g. Snapshot vote)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="md:col-span-4 rounded-md border border-neutral-200 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <input
            type="url"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="md:col-span-7 rounded-md border border-neutral-200 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            type="button"
            disabled={!valid}
            onClick={handleSubmit}
            className="md:col-span-1 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            Add
          </button>
        </div>
      </div>
    </section>
  );
}
