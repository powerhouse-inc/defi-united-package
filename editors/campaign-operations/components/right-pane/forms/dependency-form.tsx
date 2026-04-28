import { useState } from "react";
import {
  addDocument,
  dispatchActions,
} from "@powerhousedao/reactor-browser";
import type { Action } from "document-model";
import type { ExternalDependencyDocument } from "../../../../../document-models/external-dependency/v1/gen/types.js";
import type { PledgeDocument } from "../../../../../document-models/pledge/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../../../../document-models/contributor-profile/v1/gen/types.js";
import { externalDependencyDocumentType } from "../../../../../document-models/external-dependency/v1/gen/document-type.js";
import {
  setDependencyDetails,
  linkPledge,
  setExternalRef,
} from "../../../../../document-models/external-dependency/v1/gen/tracking/creators.js";
import type { DependencyKind } from "../../../../../document-models/external-dependency/v1/gen/types.js";
import { RightPaneShell } from "./right-pane-shell.js";

interface DependencyFormProps {
  mode: "create" | "edit";
  dependency?: ExternalDependencyDocument;
  pledges: PledgeDocument[];
  contributorProfiles: ContributorProfileDocument[];
  driveId: string;
  onClose: () => void;
}

export function DependencyForm({
  mode,
  dependency,
  pledges,
  driveId,
  onClose,
}: DependencyFormProps) {
  if (mode === "edit") {
    return (
      <RightPaneShell title="Edit dependency" onClose={onClose}>
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
          <div>Full dependency editing functionality lands in the next task.</div>
          {dependency && (
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
              Dependency ID: {dependency.header.id}
            </div>
          )}
        </div>
      </RightPaneShell>
    );
  }

  return (
    <DependencyCreateForm pledges={pledges} driveId={driveId} onClose={onClose} />
  );
}

interface DependencyCreateFormProps {
  pledges: PledgeDocument[];
  driveId: string;
  onClose: () => void;
}

function DependencyCreateForm({ pledges, driveId, onClose }: DependencyCreateFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<DependencyKind>("GOVERNANCE_VOTE");
  const [expectedResolution, setExpectedResolution] = useState("");
  const [blockedPledgeIds, setBlockedPledgeIds] = useState<string[]>([]);
  const [refUrl, setRefUrl] = useState("");
  const [refTxHash, setRefTxHash] = useState("");
  const [refProposalId, setRefProposalId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = title.trim().length >= 2;

  function togglePledge(id: string) {
    setBlockedPledgeIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  const hasExternalRef = refUrl || refTxHash || refProposalId;

  async function onSubmit() {
    if (!valid) return;
    setBusy(true);
    setErr(null);
    try {
      const doc = await addDocument(
        driveId,
        title.trim(),
        externalDependencyDocumentType,
      );

      const actions: Action[] = [
        setDependencyDetails({
          title: title.trim(),
          description: description || undefined,
          kind,
          expectedResolution: expectedResolution
            ? new Date(expectedResolution).toISOString()
            : undefined,
        }),
        ...blockedPledgeIds.map((id) => linkPledge({ pledgeId: id })),
      ];

      if (hasExternalRef) {
        actions.push(
          setExternalRef({
            url: refUrl || undefined,
            txHash: refTxHash || undefined,
            proposalId: refProposalId || undefined,
          }),
        );
      }

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
      title="Add dependency"
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

        <Field label="Title" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Aave governance vote"
            autoFocus
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What needs to happen and why?"
          />
        </Field>

        <div className="defi-united-ops__pf-row2">
          <Field label="Kind">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as DependencyKind)}
            >
              <option value="GOVERNANCE_VOTE">GOVERNANCE_VOTE</option>
              <option value="COUNCIL_ACTION">COUNCIL_ACTION</option>
              <option value="ONCHAIN_TX">ONCHAIN_TX</option>
              <option value="OPERATIONAL">OPERATIONAL</option>
              <option value="OTHER">OTHER</option>
            </select>
          </Field>

          <Field label="Expected resolution">
            <input
              type="date"
              value={expectedResolution}
              onChange={(e) => setExpectedResolution(e.target.value)}
            />
          </Field>
        </div>

        {pledges.length > 0 ? (
          <fieldset className="defi-united-ops__pf-fieldset">
            <legend className="defi-united-ops__pf-label">
              Blocks pledges
            </legend>
            <div className="defi-united-ops__pf-checkgroup">
              {pledges.map((p) => {
                const pledgeName =
                  p.header.name ||
                  `Pledge ${p.header.id.slice(0, 8)}`;
                return (
                  <label
                    key={p.header.id}
                    className="defi-united-ops__pf-check"
                  >
                    <input
                      type="checkbox"
                      checked={blockedPledgeIds.includes(p.header.id)}
                      onChange={() => togglePledge(p.header.id)}
                    />
                    <span>{pledgeName}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <details>
          <summary>External reference (optional)</summary>
          <div style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="URL">
              <input
                type="url"
                value={refUrl}
                onChange={(e) => setRefUrl(e.target.value)}
                placeholder="https://snapshot.org/..."
              />
            </Field>
            <Field label="Tx hash">
              <input
                type="text"
                value={refTxHash}
                onChange={(e) => setRefTxHash(e.target.value)}
                placeholder="0x..."
              />
            </Field>
            <Field label="Proposal ID">
              <input
                type="text"
                value={refProposalId}
                onChange={(e) => setRefProposalId(e.target.value)}
                placeholder="AIP-123"
              />
            </Field>
          </div>
        </details>
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
      .defi-united-ops__pf-fieldset {
        border: 1px solid #e6e8ec; border-radius: 8px;
        padding: 10px 12px; margin: 0;
      }
      .defi-united-ops__pf-fieldset legend {
        padding: 0 4px;
      }
      .defi-united-ops__pf-checkgroup {
        display: flex; flex-direction: column; gap: 6px; margin-top: 6px;
        max-height: 160px; overflow-y: auto;
      }
      .defi-united-ops__pf-check {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px; color: #0f1115; cursor: pointer;
      }
      .defi-united-ops__pf-check input[type="checkbox"] {
        width: 15px; height: 15px; flex-shrink: 0;
        border: 1px solid #d4d7e0; border-radius: 3px;
        padding: 0; box-sizing: border-box;
      }
      details summary {
        cursor: pointer; padding: 6px 0; font-size: 13px; color: #525a6b;
        font-weight: 500;
      }
      details[open] summary { color: #0f1115; }
    `}</style>
  );
}
