import { useState } from "react";
import {
  addDocument,
  dispatchActions,
} from "@powerhousedao/reactor-browser";
import type { Action } from "document-model";
import type { ContributorProfileDocument } from "../../../../../document-models/contributor-profile/v1/gen/types.js";
import { contributorProfileDocumentType } from "../../../../../document-models/contributor-profile/v1/gen/document-type.js";
import {
  setProfileDetails,
  setTrustLevel,
} from "../../../../../document-models/contributor-profile/v1/gen/profile/creators.js";
import type {
  ContributorKind,
  TrustLevel,
} from "../../../../../document-models/contributor-profile/v1/gen/types.js";
import { RightPaneShell } from "./right-pane-shell.js";

interface ContributorFormProps {
  mode: "create" | "edit";
  profile?: ContributorProfileDocument;
  driveId: string;
  onClose: () => void;
}

export function ContributorForm({
  mode,
  profile,
  driveId,
  onClose,
}: ContributorFormProps) {
  if (mode === "edit") {
    return (
      <RightPaneShell title="Edit contributor" onClose={onClose}>
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
          <div>Full contributor editing functionality lands in the next task.</div>
          {profile && (
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
              Profile ID: {profile.header.id}
            </div>
          )}
        </div>
      </RightPaneShell>
    );
  }

  return <ContributorCreateForm driveId={driveId} onClose={onClose} />;
}

interface ContributorCreateFormProps {
  driveId: string;
  onClose: () => void;
}

function ContributorCreateForm({ driveId, onClose }: ContributorCreateFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [kind, setKind] = useState<ContributorKind>("DAO");
  const [trustLevel, setTrustLevelState] = useState<TrustLevel>("VERIFIED");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = displayName.trim().length >= 2;

  async function onSubmit() {
    if (!valid) return;
    setBusy(true);
    setErr(null);
    try {
      const doc = await addDocument(
        driveId,
        displayName.trim(),
        contributorProfileDocumentType,
      );
      await dispatchActions(
        [
          setProfileDetails({
            displayName: displayName.trim(),
            kind,
            websiteUrl: websiteUrl || undefined,
            twitterHandle: twitterHandle || undefined,
          }),
          setTrustLevel({ trustLevel }),
        ] as Action[],
        doc.id,
      );
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <RightPaneShell
      title="Add contributor"
      onClose={onClose}
      onSubmit={() => void onSubmit()}
      submitLabel="Create"
      submitDisabled={!valid}
      busy={busy}
    >
      <div className="defi-united-ops__pf">
        {err ? (
          <div className="defi-united-ops__pf-error">{err}</div>
        ) : null}

        <Field label="Display name" required>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Aave DAO"
            autoFocus
          />
        </Field>

        <div className="defi-united-ops__pf-row2">
          <Field label="Kind">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ContributorKind)}
            >
              <option value="DAO">DAO</option>
              <option value="FOUNDATION">FOUNDATION</option>
              <option value="COMPANY">COMPANY</option>
              <option value="INDIVIDUAL">INDIVIDUAL</option>
            </select>
          </Field>

          <Field label="Trust level">
            <select
              value={trustLevel}
              onChange={(e) => setTrustLevelState(e.target.value as TrustLevel)}
            >
              <option value="VERIFIED">VERIFIED</option>
              <option value="ANNOUNCED">ANNOUNCED</option>
              <option value="ANONYMOUS">ANONYMOUS</option>
            </select>
          </Field>
        </div>

        <Field label="Website URL">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.org"
          />
        </Field>

        <Field label="Twitter / X handle">
          <input
            type="text"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="@handle"
          />
        </Field>
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
      .defi-united-ops__pf-row2 {
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      }
    `}</style>
  );
}
