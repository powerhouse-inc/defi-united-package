import { useState } from "react";
import {
  addDocument,
  dispatchActions,
} from "@powerhousedao/reactor-browser";
import { generateId } from "document-model";
import type { Action } from "document-model";
import type { StatusUpdateDocument } from "../../../../../document-models/status-update/v1/gen/types.js";
import { statusUpdateDocumentType } from "../../../../../document-models/status-update/v1/gen/document-type.js";
import {
  draftUpdate,
  publishUpdate,
  setVisibility,
  attachAnnouncement,
} from "../../../../../document-models/status-update/v1/gen/publishing/creators.js";
import type {
  UpdateVisibility,
  AnnouncementPlatform,
} from "../../../../../document-models/status-update/v1/gen/types.js";
import { RightPaneShell } from "./right-pane-shell.js";

interface Announcement {
  id: string;
  platform: AnnouncementPlatform;
  url: string;
}

interface StatusUpdateFormProps {
  mode: "create" | "edit";
  update?: StatusUpdateDocument;
  driveId: string;
  totalPledged: number;
  totalReceived: number;
  dependenciesResolved: number;
  onClose: () => void;
}

export function StatusUpdateForm({
  mode,
  update,
  driveId,
  totalPledged,
  totalReceived,
  dependenciesResolved,
  onClose,
}: StatusUpdateFormProps) {
  if (mode === "edit") {
    return (
      <RightPaneShell title="Edit status update" onClose={onClose}>
        <div
          style={{
            padding: 24,
            color: "#6b7280",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>✏️</div>
          <div style={{ fontWeight: 600, color: "#0f1115", marginBottom: 4 }}>
            Edit mode coming soon
          </div>
          <div>Full status-update editing functionality lands in the next task.</div>
          {update && (
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "#f7f8fa",
                borderRadius: 6,
                fontSize: 11,
                color: "#9aa1ad",
              }}
            >
              Update ID: {update.header.id}
            </div>
          )}
        </div>
      </RightPaneShell>
    );
  }

  return (
    <StatusUpdateCreateForm
      driveId={driveId}
      totalPledged={totalPledged}
      totalReceived={totalReceived}
      dependenciesResolved={dependenciesResolved}
      onClose={onClose}
    />
  );
}

interface StatusUpdateCreateFormProps {
  driveId: string;
  totalPledged: number;
  totalReceived: number;
  dependenciesResolved: number;
  onClose: () => void;
}

function StatusUpdateCreateForm({
  driveId,
  totalPledged,
  totalReceived,
  dependenciesResolved,
  onClose,
}: StatusUpdateCreateFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibilityState] = useState<UpdateVisibility>("PUBLIC");
  const [includeMetricsSnapshot, setIncludeMetricsSnapshot] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = title.trim().length >= 2 && body.trim().length >= 2;

  function addAnnouncementRow() {
    setAnnouncements((prev) => [
      ...prev,
      { id: generateId(), platform: "TWITTER", url: "" },
    ]);
  }

  function removeAnnouncementRow(id: string) {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAnnouncement(
    id: string,
    field: "platform" | "url",
    value: string,
  ) {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, [field]: value } : a,
      ),
    );
  }

  async function onSubmit() {
    if (!valid) return;
    setBusy(true);
    setErr(null);
    try {
      const doc = await addDocument(
        driveId,
        title.trim(),
        statusUpdateDocumentType,
      );

      const actions: Action[] = [
        draftUpdate({
          title: title.trim(),
          body: body.trim(),
          visibility,
        }),
      ];

      if (visibility !== "PUBLIC") {
        actions.push(setVisibility({ visibility }));
      }

      for (const a of announcements) {
        if (a.url.trim()) {
          actions.push(
            attachAnnouncement({
              id: a.id,
              platform: a.platform,
              url: a.url.trim(),
            }),
          );
        }
      }

      const metrics = includeMetricsSnapshot
        ? {
            totalPledged,
            totalReceived,
            dependenciesResolved,
          }
        : undefined;

      actions.push(
        publishUpdate({
          publishedAt: new Date().toISOString(),
          metricsSnapshot: metrics,
        }),
      );

      await dispatchActions(actions, doc.id);
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <RightPaneShell
      title="Post status update"
      onClose={onClose}
      onSubmit={() => void onSubmit()}
      submitLabel="Publish"
      submitDisabled={!valid}
      busy={busy}
    >
      <div className="defi-united-ops__pf">
        {err ? (
          <div className="defi-united-ops__pf-error">{err}</div>
        ) : null}

        <Field label="Title" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 3 campaign update"
            autoFocus
          />
        </Field>

        <Field label="Body" required>
          <textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's the current status? What happened this week?"
          />
        </Field>

        <Field label="Visibility">
          <select
            value={visibility}
            onChange={(e) =>
              setVisibilityState(e.target.value as UpdateVisibility)
            }
          >
            <option value="PUBLIC">PUBLIC</option>
            <option value="CONTRIBUTORS_ONLY">CONTRIBUTORS_ONLY</option>
            <option value="INTERNAL">INTERNAL</option>
          </select>
        </Field>

        <label className="defi-united-ops__pf-toggle">
          <input
            type="checkbox"
            checked={includeMetricsSnapshot}
            onChange={(e) => setIncludeMetricsSnapshot(e.target.checked)}
          />
          <span>Include metrics snapshot</span>
          {includeMetricsSnapshot ? (
            <span className="defi-united-ops__pf-metrics-preview">
              {totalPledged.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              pledged &middot;{" "}
              {totalReceived.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              received &middot; {dependenciesResolved} deps resolved
            </span>
          ) : null}
        </label>

        <div className="defi-united-ops__pf-announcements">
          <div className="defi-united-ops__pf-ann-header">
            <span className="defi-united-ops__pf-label">
              External announcements
            </span>
            <button
              type="button"
              className="defi-united-ops__pf-add-btn"
              onClick={addAnnouncementRow}
            >
              + Add
            </button>
          </div>

          {announcements.map((a) => (
            <div key={a.id} className="defi-united-ops__pf-ann-row">
              <select
                value={a.platform}
                onChange={(e) =>
                  updateAnnouncement(
                    a.id,
                    "platform",
                    e.target.value,
                  )
                }
                className="defi-united-ops__pf-ann-platform"
              >
                <option value="TWITTER">TWITTER</option>
                <option value="FARCASTER">FARCASTER</option>
                <option value="MIRROR">MIRROR</option>
                <option value="BLOG">BLOG</option>
              </select>
              <input
                type="url"
                value={a.url}
                onChange={(e) =>
                  updateAnnouncement(a.id, "url", e.target.value)
                }
                placeholder="https://..."
                className="defi-united-ops__pf-ann-url"
              />
              <button
                type="button"
                className="defi-united-ops__pf-remove-btn"
                onClick={() => removeAnnouncementRow(a.id)}
                aria-label="Remove"
              >
                &times;
              </button>
            </div>
          ))}

          {announcements.length === 0 ? (
            <div style={{ fontSize: 12, color: "#9aa1ad", padding: "4px 0" }}>
              No announcements added yet.
            </div>
          ) : null}
        </div>
      </div>
      <Styles />
    </RightPaneShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="defi-united-ops__pf-field">
      <span className="defi-united-ops__pf-label">
        {label}{" "}
        {required ? <span style={{ color: "#dc2626" }}>*</span> : null}
      </span>
      {children}
    </label>
  );
}

function Styles() {
  return (
    <style>{`
      .defi-united-ops__pf { display: flex; flex-direction: column; gap: 14px; }
      .defi-united-ops__pf-error {
        background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
        padding: 10px 12px; border-radius: 6px; font-size: 12px;
      }
      .defi-united-ops__pf-field { display: flex; flex-direction: column; gap: 4px; }
      .defi-united-ops__pf-label { font-size: 12px; font-weight: 500; color: #525a6b; }
      .defi-united-ops__pf-field input,
      .defi-united-ops__pf-field select,
      .defi-united-ops__pf-field textarea {
        padding: 8px 10px; font-size: 14px;
        border: 1px solid #d4d7e0; border-radius: 6px; font-family: inherit;
        box-sizing: border-box; width: 100%;
      }
      .defi-united-ops__pf-toggle {
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 13px; color: #0f1115; cursor: pointer; flex-wrap: wrap;
      }
      .defi-united-ops__pf-toggle input[type="checkbox"] {
        margin-top: 2px; flex-shrink: 0;
        width: 15px; height: 15px;
      }
      .defi-united-ops__pf-metrics-preview {
        font-size: 11px; color: #6b7280;
        padding: 2px 8px; background: #f1f3f7;
        border-radius: 4px; margin-top: 2px; width: 100%;
      }
      .defi-united-ops__pf-announcements {
        display: flex; flex-direction: column; gap: 6px;
      }
      .defi-united-ops__pf-ann-header {
        display: flex; align-items: center; justify-content: space-between;
      }
      .defi-united-ops__pf-ann-row {
        display: flex; gap: 6px; align-items: center;
      }
      .defi-united-ops__pf-ann-platform {
        flex: 0 0 140px; padding: 7px 8px; font-size: 13px;
        border: 1px solid #d4d7e0; border-radius: 6px; font-family: inherit;
        box-sizing: border-box;
      }
      .defi-united-ops__pf-ann-url {
        flex: 1; padding: 7px 10px; font-size: 13px;
        border: 1px solid #d4d7e0; border-radius: 6px; font-family: inherit;
        box-sizing: border-box;
      }
      .defi-united-ops__pf-add-btn {
        font-size: 12px; font-weight: 500; color: #1a4dd6;
        background: none; border: none; cursor: pointer; padding: 2px 6px;
        border-radius: 4px;
      }
      .defi-united-ops__pf-add-btn:hover { background: #eff4ff; }
      .defi-united-ops__pf-remove-btn {
        flex-shrink: 0; width: 24px; height: 24px;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; line-height: 1; color: #9aa1ad;
        background: none; border: none; cursor: pointer; border-radius: 4px;
      }
      .defi-united-ops__pf-remove-btn:hover { color: #dc2626; background: #fef2f2; }
    `}</style>
  );
}
