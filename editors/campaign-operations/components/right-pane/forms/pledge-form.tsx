import { useState } from "react";
import { addDocument, dispatchActions } from "@powerhousedao/reactor-browser";
import type { ContributorProfileDocument } from "../../../../../document-models/contributor-profile/v1/gen/types.js";
import type { PledgeDocument } from "../../../../../document-models/pledge/v1/gen/types.js";
import { contributorProfileDocumentType } from "../../../../../document-models/contributor-profile/v1/gen/document-type.js";
import { pledgeDocumentType } from "../../../../../document-models/pledge/v1/gen/document-type.js";
import {
  setProfileDetails,
  setTrustLevel,
} from "../../../../../document-models/contributor-profile/v1/gen/profile/creators.js";
import {
  proposePledge,
  attachGovernance,
  markGovernancePending,
  markConfirmed,
  markReceived,
  cancelPledge,
  failPledge,
  editNotes,
} from "../../../../../document-models/pledge/v1/gen/lifecycle/creators.js";
import { validTransitions } from "../../../state/valid-transitions.js";
import { RightPaneShell } from "./right-pane-shell.js";
import {
  ContributorPicker,
  type ContributorSelection,
} from "./contributor-picker.js";
import type { GovernancePlatform } from "../../../../../document-models/pledge/v1/gen/types.js";

interface PledgeFormProps {
  mode: "create" | "edit";
  pledge?: PledgeDocument;
  profiles: ContributorProfileDocument[];
  driveId: string;
  onClose: () => void;
}

export function PledgeForm({
  mode,
  pledge,
  profiles,
  driveId,
  onClose,
}: PledgeFormProps) {
  if (mode === "edit" && pledge) {
    const contributorName =
      profiles.find(
        (p) => p.header.id === pledge.state.global.contributorProfileId,
      )?.state.global.displayName ?? "Unknown contributor";
    return (
      <PledgeEditForm
        pledge={pledge}
        contributorName={contributorName}
        onClose={onClose}
      />
    );
  }

  return (
    <PledgeCreateForm profiles={profiles} driveId={driveId} onClose={onClose} />
  );
}

interface PledgeEditFormProps {
  pledge: PledgeDocument;
  contributorName: string;
  onClose: () => void;
}

function PledgeEditForm({
  pledge,
  contributorName,
  onClose,
}: PledgeEditFormProps) {
  const gs = pledge.state.global;
  const pledgeId = pledge.header.id;

  // Governance fields
  const [govPlatform, setGovPlatform] = useState<GovernancePlatform>(
    gs.governance?.platform ?? "SNAPSHOT",
  );
  const [govUrl, setGovUrl] = useState(gs.governance?.proposalUrl ?? "");
  const [voteEndDate, setVoteEndDate] = useState(
    gs.governance?.voteEndDate ? gs.governance.voteEndDate.slice(0, 10) : "",
  );

  // Notes fields
  const [publicNotes, setPublicNotes] = useState(gs.publicNotes ?? "");
  const [internalNotes, setInternalNotes] = useState(gs.internalNotes ?? "");

  const hasReceipt = gs.receiptIds.length > 0;
  const transitions = validTransitions(gs.status, hasReceipt);

  function saveGovernance() {
    if (!govUrl.trim()) return;
    void dispatchActions(
      attachGovernance({
        platform: govPlatform,
        proposalUrl: govUrl.trim(),
        voteEndDate: voteEndDate
          ? new Date(voteEndDate).toISOString()
          : undefined,
      }),
      pledgeId,
    );
  }

  function saveNotes() {
    void dispatchActions(
      editNotes({
        publicNotes: publicNotes || undefined,
        internalNotes: internalNotes || undefined,
      }),
      pledgeId,
    );
  }

  function handleTransition(action: string) {
    switch (action) {
      case "markGovernancePending":
        void dispatchActions(markGovernancePending({}), pledgeId);
        break;
      case "markConfirmed":
        void dispatchActions(markConfirmed({}), pledgeId);
        break;
      case "markReceived":
        if (
          !hasReceipt &&
          !window.confirm("No receipt yet — really mark received?")
        )
          return;
        void dispatchActions(
          markReceived({
            amount: gs.pledgedAmount ?? 0,
            receiptId: "",
            receivedAt: new Date().toISOString(),
          }),
          pledgeId,
        );
        break;
      case "cancelPledge":
        void dispatchActions(cancelPledge({}), pledgeId);
        break;
      case "failPledge":
        void dispatchActions(failPledge({}), pledgeId);
        break;
    }
  }

  return (
    <RightPaneShell
      title={`Edit pledge — ${contributorName}`}
      onClose={onClose}
    >
      <div className="defi-united-ops__pf">
        {/* Read-only header summary */}
        <div className="defi-united-ops__pf-readonly-summary">
          <span className="defi-united-ops__pf-label">Contributor</span>
          <span className="defi-united-ops__pf-readonly-value">
            {contributorName}
          </span>
          <span className="defi-united-ops__pf-label" style={{ marginTop: 8 }}>
            Pledged amount
          </span>
          <div>
            <span className="defi-united-ops__pf-readonly-value">
              {gs.pledgedAmount != null
                ? gs.pledgedAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })
                : "—"}{" "}
              {gs.asset?.symbol ?? ""}
            </span>
            <small className="defi-united-ops__pf-hint">
              Amount is locked at proposal time. Cancel + re-propose to change.
            </small>
          </div>
        </div>

        {/* Status section */}
        <div className="defi-united-ops__pf-section">
          <span className="defi-united-ops__pf-label">Status</span>
          <div className="defi-united-ops__pf-status-row">
            <span className="defi-united-ops__pf-status-badge">
              {gs.status}
            </span>
            <div className="defi-united-ops__pf-transitions">
              {transitions.map((t) => (
                <button
                  key={t.action}
                  type="button"
                  className={`defi-united-ops__pf-transition-btn${t.disabled ? " --disabled" : ""}`}
                  disabled={t.disabled}
                  title={t.disabledReason}
                  onClick={() => !t.disabled && handleTransition(t.action)}
                >
                  → {t.to}
                </button>
              ))}
              {transitions.length === 0 && (
                <span className="defi-united-ops__pf-hint">
                  Terminal status — no further transitions.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Governance section */}
        <div className="defi-united-ops__pf-section">
          <span className="defi-united-ops__pf-label">Governance</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 6,
            }}
          >
            <Field label="Platform">
              <select
                value={govPlatform}
                onChange={(e) =>
                  setGovPlatform(e.target.value as GovernancePlatform)
                }
                onBlur={saveGovernance}
              >
                <option value="SNAPSHOT">SNAPSHOT</option>
                <option value="TALLY">TALLY</option>
                <option value="AGORA">AGORA</option>
                <option value="FORUM">FORUM</option>
                <option value="OTHER">OTHER</option>
              </select>
            </Field>
            <Field label="Proposal URL">
              <input
                type="url"
                value={govUrl}
                onChange={(e) => setGovUrl(e.target.value)}
                onBlur={saveGovernance}
                placeholder="https://snapshot.org/..."
              />
            </Field>
            <Field label="Vote end date">
              <input
                type="date"
                value={voteEndDate}
                onChange={(e) => setVoteEndDate(e.target.value)}
                onBlur={saveGovernance}
              />
            </Field>
          </div>
        </div>

        {/* Notes section */}
        <div className="defi-united-ops__pf-section">
          <span className="defi-united-ops__pf-label">Notes</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 6,
            }}
          >
            <Field label="Public notes">
              <textarea
                rows={3}
                value={publicNotes}
                onChange={(e) => setPublicNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="Visible to all"
              />
            </Field>
            <Field label="Internal notes">
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="Internal only"
              />
            </Field>
          </div>
        </div>
      </div>
      <EditStyles />
    </RightPaneShell>
  );
}

function EditStyles() {
  return (
    <style>{`
      .defi-united-ops__pf-readonly-summary {
        display: flex; flex-direction: column; gap: 2px;
        padding: 12px; background: #f7f8fa; border-radius: 8px;
        border: 1px solid #e6e8ec;
      }
      .defi-united-ops__pf-readonly-value {
        font-size: 14px; font-weight: 600; color: #0f1115;
      }
      .defi-united-ops__pf-hint {
        display: block; font-size: 11px; color: #9aa1ad; margin-top: 2px;
      }
      .defi-united-ops__pf-section {
        display: flex; flex-direction: column; gap: 4px;
      }
      .defi-united-ops__pf-status-row {
        display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 6px;
      }
      .defi-united-ops__pf-status-badge {
        display: inline-block; padding: 3px 10px;
        background: #e8f0fe; color: #1a4dd6;
        border-radius: 20px; font-size: 12px; font-weight: 600;
      }
      .defi-united-ops__pf-transitions {
        display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
      }
      .defi-united-ops__pf-transition-btn {
        font-size: 12px; font-weight: 500; color: #1a4dd6;
        background: #eff4ff; border: 1px solid #c7d7fa;
        padding: 4px 10px; border-radius: 5px; cursor: pointer;
      }
      .defi-united-ops__pf-transition-btn:hover:not(:disabled) { background: #dce8ff; }
      .defi-united-ops__pf-transition-btn.--disabled,
      .defi-united-ops__pf-transition-btn:disabled {
        color: #9aa1ad; background: #f1f3f7; border-color: #e6e8ec; cursor: not-allowed;
      }
    `}</style>
  );
}

interface PledgeCreateFormProps {
  profiles: ContributorProfileDocument[];
  driveId: string;
  onClose: () => void;
}

function PledgeCreateForm({
  profiles,
  driveId,
  onClose,
}: PledgeCreateFormProps) {
  const [contributor, setContributor] = useState<ContributorSelection | null>(
    null,
  );
  const [amount, setAmount] = useState<string>("");
  const [assetSymbol, setAssetSymbol] = useState("ETH");
  const [chainId, setChainId] = useState<string>("1");
  const [initialStatus, setInitialStatus] = useState<
    "PROPOSED" | "GOVERNANCE_PENDING" | "CONFIRMED"
  >("PROPOSED");
  const [govPlatform, setGovPlatform] = useState<string>("SNAPSHOT");
  const [govUrl, setGovUrl] = useState("");
  const [voteEndDate, setVoteEndDate] = useState("");
  const [publicNotes, setPublicNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid =
    !!contributor &&
    (contributor.existingId ||
      (contributor.newProfile &&
        contributor.newProfile.displayName.trim().length >= 2)) &&
    !!amount &&
    Number(amount) > 0;

  async function onSubmit() {
    if (!valid) return;
    setBusy(true);
    setErr(null);
    try {
      // 1. Resolve or create contributor profile
      let contribId: string;
      if (contributor.existingId) {
        contribId = contributor.existingId;
      } else {
        const newProf = contributor.newProfile!;
        const profDoc = await addDocument(
          driveId,
          newProf.displayName,
          contributorProfileDocumentType,
        );
        contribId = profDoc.id;
        await dispatchActions(
          setProfileDetails({
            displayName: newProf.displayName,
            kind: newProf.kind,
            websiteUrl: newProf.websiteUrl,
            twitterHandle: newProf.twitterHandle,
          }),
          contribId,
        );
        await dispatchActions(
          setTrustLevel({ trustLevel: newProf.trustLevel }),
          contribId,
        );
      }

      // 2. Determine display name for pledge document name
      const displayName = contributor.existingId
        ? (profiles.find((p) => p.header.id === contributor.existingId)?.state
            .global.displayName ?? "Pledge")
        : contributor.newProfile!.displayName;

      // 3. Create pledge document
      const pledgeDoc = await addDocument(
        driveId,
        `${displayName} pledge`,
        pledgeDocumentType,
      );
      const pledgeId = pledgeDoc.id;

      // 4. Propose pledge
      await dispatchActions(
        proposePledge({
          contributorProfileId: contribId,
          pledgedAmount: Number(amount),
          asset: { symbol: assetSymbol, chainId: Number(chainId) || 1 },
          publicNotes: publicNotes || undefined,
        }),
        pledgeId,
      );

      // 5. Attach governance if URL provided
      if (govUrl) {
        await dispatchActions(
          attachGovernance({
            platform: govPlatform as GovernancePlatform,
            proposalUrl: govUrl,
            voteEndDate: voteEndDate
              ? new Date(voteEndDate).toISOString()
              : undefined,
          }),
          pledgeId,
        );
      }

      // 6. Advance status chain if needed
      if (
        initialStatus === "GOVERNANCE_PENDING" ||
        initialStatus === "CONFIRMED"
      ) {
        await dispatchActions(markGovernancePending({}), pledgeId);
      }
      if (initialStatus === "CONFIRMED") {
        await dispatchActions(markConfirmed({}), pledgeId);
      }

      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <RightPaneShell
      title="Create pledge"
      onClose={onClose}
      onSubmit={() => void onSubmit()}
      submitLabel="Create"
      submitDisabled={!valid}
      busy={busy}
    >
      <div className="defi-united-ops__pf">
        {err ? <div className="defi-united-ops__pf-error">{err}</div> : null}

        <Field label="Contributor" required>
          <ContributorPicker
            profiles={profiles}
            value={contributor}
            onChange={setContributor}
          />
        </Field>

        <div className="defi-united-ops__pf-row2">
          <Field label="Pledged amount" required>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25000"
            />
          </Field>
          <Field label="Asset">
            <input
              value={assetSymbol}
              onChange={(e) => setAssetSymbol(e.target.value)}
              placeholder="ETH"
            />
          </Field>
          <Field label="Chain ID">
            <input
              value={chainId}
              onChange={(e) =>
                setChainId(e.target.value.replace(/[^0-9]/g, ""))
              }
              inputMode="numeric"
              placeholder="1"
            />
          </Field>
        </div>

        <Field label="Initial status">
          <select
            value={initialStatus}
            onChange={(e) =>
              setInitialStatus(
                e.target.value as
                  | "PROPOSED"
                  | "GOVERNANCE_PENDING"
                  | "CONFIRMED",
              )
            }
          >
            <option value="PROPOSED">PROPOSED</option>
            <option value="GOVERNANCE_PENDING">GOVERNANCE_PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
          </select>
        </Field>

        <details>
          <summary>Governance (optional)</summary>
          <div
            style={{
              paddingTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Field label="Platform">
              <select
                value={govPlatform}
                onChange={(e) => setGovPlatform(e.target.value)}
              >
                <option value="SNAPSHOT">SNAPSHOT</option>
                <option value="TALLY">TALLY</option>
                <option value="AGORA">AGORA</option>
                <option value="FORUM">FORUM</option>
                <option value="OTHER">OTHER</option>
              </select>
            </Field>
            <Field label="Proposal URL">
              <input
                type="url"
                value={govUrl}
                onChange={(e) => setGovUrl(e.target.value)}
                placeholder="https://snapshot.org/..."
              />
            </Field>
            <Field label="Vote end date">
              <input
                type="date"
                value={voteEndDate}
                onChange={(e) => setVoteEndDate(e.target.value)}
              />
            </Field>
          </div>
        </details>

        <Field label="Public notes">
          <textarea
            rows={3}
            value={publicNotes}
            onChange={(e) => setPublicNotes(e.target.value)}
            placeholder="Optional"
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
        {label} {required ? <span style={{ color: "#dc2626" }}>*</span> : null}
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
        display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
      }
      details summary {
        cursor: pointer; padding: 6px 0; font-size: 13px; color: #525a6b;
        font-weight: 500;
      }
      details[open] summary { color: #0f1115; }
    `}</style>
  );
}
