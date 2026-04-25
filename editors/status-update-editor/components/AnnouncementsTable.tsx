import { useState } from "react";
import type {
  AnnouncementPlatform,
  ExternalAnnouncement,
} from "../../../document-models/status-update/v1/gen/schema/types.js";
import { PLATFORM_LABEL, PLATFORM_OPTIONS } from "./constants.js";

interface AnnouncementsCallbacks {
  attach: (platform: AnnouncementPlatform, url: string) => void;
}

export function AnnouncementsTable({
  announcements,
  on,
}: {
  announcements: ExternalAnnouncement[];
  on: AnnouncementsCallbacks;
}) {
  const [platform, setPlatform] = useState<AnnouncementPlatform>("TWITTER");
  const [url, setUrl] = useState("");

  function handleAdd() {
    const trimmed = url.trim();
    if (!trimmed) return;
    on.attach(platform, trimmed);
    setUrl("");
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        External announcements
      </h2>

      {announcements.length === 0 ? (
        <p className="mb-4 text-sm text-neutral-500">
          No external announcements attached yet.
        </p>
      ) : (
        <div className="mb-4 overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-3 py-2 text-left">Platform</th>
                <th className="px-3 py-2 text-left">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {announcements.map((a) => (
                <tr key={a.id} className="bg-white">
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-700">
                      {PLATFORM_LABEL[a.platform]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="break-all text-blue-600 hover:underline"
                    >
                      {a.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr_auto]">
        <select
          className="su-ann-input"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as AnnouncementPlatform)}
        >
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABEL[p]}
            </option>
          ))}
        </select>
        <input
          className="su-ann-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="https://..."
          inputMode="url"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!url.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <style>{`
        .su-ann-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #111827;
          background-color: #fff;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .su-ann-input:focus {
          outline: none;
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.12);
        }
        .su-ann-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </section>
  );
}
