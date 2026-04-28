import { useState } from "react";
import {
  addDocument,
  dispatchActions,
} from "@powerhousedao/reactor-browser";
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
} from "../../../../../document-models/pledge/v1/gen/lifecycle/creators.js";
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
  // Edit mode stub (full edit in next task)
  if (mode === "edit") {
    return (
      <RightPaneShell title="Edit pledge" onClose={onClose}>
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
          <div>Full pledge editing functionality lands in the next task.</div>
          {pledge && (
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
              Pledge ID: {pledge.header.id}
            </div>
          )}
        </div>
      </RightPaneShell>
    );
  }

  return <PledgeCreateForm profiles={profiles} driveId={driveId} onClose={onClose} />;
}

interface PledgeCreateFormProps {
  profiles: ContributorProfileDocument[];
  driveId: string;
  onClose: () => void;
}

function PledgeCreateForm({ profiles, driveId, onClose }: PledgeCreateFormProps) {
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
      if (contributor!.existingId) {
        contribId = contributor!.existingId;
      } else {
        const newProf = contributor!.newProfile!;
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
      const displayName =
        contributor!.existingId
          ? (profiles.find((p) => p.header.id === contributor!.existingId)
              ?.state.global.displayName ?? "Pledge")
          : contributor!.newProfile!.displayName;

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
        {err ? (
          <div className="defi-united-ops__pf-error">{err}</div>
        ) : null}

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
          <div style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
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
