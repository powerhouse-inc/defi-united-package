import {
  dispatchActions,
  showCreateDocumentModal,
} from "@powerhousedao/reactor-browser";
import { generateId, type Action } from "document-model";
import { useState } from "react";

import type { UseRightPaneResult } from "../state/use-right-pane.js";

import {
  setCampaignDetails,
  startCampaign,
  markResolved,
  markFailed,
  archiveCampaign,
  addContributionAddress,
} from "../../../document-models/relief-campaign/v1/gen/creators.js";
import { distributionPlanDocumentType } from "../../../document-models/distribution-plan/v1/gen/document-type.js";

import type { ReliefCampaignDocument } from "../../../document-models/relief-campaign/v1/gen/types.js";
import type { DistributionPlanDocument } from "../../../document-models/distribution-plan/v1/gen/types.js";
import type { CampaignStatus } from "../../../document-models/relief-campaign/v1/gen/schema/types.js";

const STAGES: {
  status: CampaignStatus;
  label: string;
  short: string;
  caption: string;
}[] = [
  {
    status: "DRAFT",
    label: "1. Setup",
    short: "Setup",
    caption: "Define the campaign",
  },
  {
    status: "ACTIVE",
    label: "2. Coordination",
    short: "Active",
    caption: "Coordinate pledges & dependencies",
  },
  {
    status: "EXECUTING",
    label: "3. Distribution",
    short: "Executing",
    caption: "Settle on-chain payouts",
  },
  {
    status: "RESOLVED",
    label: "4. Resolved",
    short: "Resolved",
    caption: "Coalition complete",
  },
];

function dispatchCampaign(campaignId: string, action: Action) {
  void dispatchActions(action, campaignId);
}

/**
 * Top-of-editor banner. Shows the lifecycle stages, the campaign's current
 * stage, and the next-action affordance. Always visible; the action varies
 * by status.
 */
export function LifecycleBanner({
  campaign,
  distribution,
}: {
  campaign: ReliefCampaignDocument;
  distribution: DistributionPlanDocument | undefined;
}) {
  const status = campaign.state.global.status;
  const currentIdx = STAGES.findIndex((s) => s.status === status);

  const nextAction = (() => {
    if (status === "DRAFT") {
      const ready =
        Boolean(campaign.state.global.name) &&
        Boolean(campaign.state.global.targetAmount) &&
        campaign.state.global.contributionAddresses.length > 0;
      return {
        primary: {
          label: "Start campaign",
          disabled: !ready,
          hint: ready
            ? "Transition to ACTIVE — pledges become visible to coordinators."
            : "Fill in name, target amount, and at least one contribution address.",
          run: () => {
            if (
              !confirm(
                "Start campaign? This makes it visible to all coordinators.",
              )
            )
              return;
            dispatchCampaign(campaign.header.id, startCampaign({ _: true }));
          },
        },
      };
    }
    if (status === "ACTIVE" || status === "EXECUTING") {
      const planComplete = distribution?.state.global.status === "COMPLETED";
      return {
        primary: planComplete
          ? {
              label: "Mark resolved",
              disabled: false,
              hint: "Distribution complete. Close the coalition.",
              run: () => {
                if (
                  !confirm(
                    "Mark this campaign as RESOLVED? It will be archived shortly after.",
                  )
                )
                  return;
                dispatchCampaign(campaign.header.id, markResolved({ _: true }));
              },
            }
          : {
              label: distribution
                ? "Distribution in progress"
                : "Create distribution plan",
              disabled: !!distribution,
              hint: distribution
                ? `Plan is ${distribution.state.global.status}. Complete it to resolve the campaign.`
                : "Add the recovery payout plan.",
              run: () => {
                if (!distribution)
                  showCreateDocumentModal(distributionPlanDocumentType);
              },
            },
        secondary: {
          label: "Mark failed",
          run: () => {
            const reason = prompt("Reason for failure (optional):") ?? "";
            if (
              !confirm(
                "Mark this campaign as FAILED? Pledges will not be settled.",
              )
            )
              return;
            dispatchCampaign(
              campaign.header.id,
              markFailed({ reason: reason || undefined }),
            );
          },
        },
      };
    }
    if (status === "RESOLVED" || status === "FAILED") {
      return {
        primary: {
          label: "Archive campaign",
          disabled: false,
          hint: "Move out of the active list. Read-only after archival.",
          run: () => {
            if (!confirm("Archive this campaign? It becomes read-only."))
              return;
            dispatchCampaign(campaign.header.id, archiveCampaign({ _: true }));
          },
        },
      };
    }
    return null;
  })();

  return (
    <section className="defi-united-ops__lifecycle">
      <div
        className="defi-united-ops__lifecycle-stages"
        aria-label="Campaign lifecycle"
      >
        {STAGES.map((s, i) => {
          const state =
            i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming";
          return (
            <div
              key={s.status}
              className={`defi-united-ops__stage defi-united-ops__stage--${state}`}
            >
              <div className="defi-united-ops__stage-dot">
                {state === "done" ? "✓" : i + 1}
              </div>
              <div className="defi-united-ops__stage-label">
                <span className="defi-united-ops__stage-title">{s.short}</span>
                <span className="defi-united-ops__stage-caption">
                  {s.caption}
                </span>
              </div>
              {i < STAGES.length - 1 ? (
                <div
                  className={`defi-united-ops__stage-rail defi-united-ops__stage-rail--${i < currentIdx ? "done" : "upcoming"}`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {nextAction ? (
        <div className="defi-united-ops__lifecycle-cta">
          <div className="defi-united-ops__lifecycle-hint">
            {nextAction.primary.hint}
          </div>
          <div className="defi-united-ops__lifecycle-actions">
            {"secondary" in nextAction && nextAction.secondary ? (
              <button
                type="button"
                className="defi-united-ops__lifecycle-btn defi-united-ops__lifecycle-btn--ghost"
                onClick={nextAction.secondary.run}
              >
                {nextAction.secondary.label}
              </button>
            ) : null}
            <button
              type="button"
              className="defi-united-ops__lifecycle-btn defi-united-ops__lifecycle-btn--primary"
              disabled={nextAction.primary.disabled}
              onClick={nextAction.primary.run}
            >
              {nextAction.primary.label}
            </button>
          </div>
        </div>
      ) : null}

      <LifecycleStyles />
    </section>
  );
}

/**
 * Setup form shown only while the campaign is DRAFT. Captures the minimum
 * fields needed to flip to ACTIVE. After Start, this disappears.
 */
export function CampaignSetupForm({
  campaign,
}: {
  campaign: ReliefCampaignDocument;
}) {
  const g = campaign.state.global;
  const [name, setName] = useState(g.name || "");
  const [slug, setSlug] = useState(g.slug || "");
  const [summary, setSummary] = useState(g.summary || "");
  const [target, setTarget] = useState<string>(
    g.targetAmount != null ? String(g.targetAmount) : "",
  );
  const [assetSymbol, setAssetSymbol] = useState(
    g.affectedAsset?.symbol || "rsETH",
  );
  const [chainId, setChainId] = useState<string>(
    g.affectedAsset?.chainId != null ? String(g.affectedAsset.chainId) : "1",
  );
  const [incidentDate, setIncidentDate] = useState(
    g.incidentDate ? g.incidentDate.slice(0, 10) : "",
  );
  const [contribAddress, setContribAddress] = useState(
    g.contributionAddresses[0]?.address || "",
  );

  function autoSlug(n: string) {
    return n
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    const finalSlug = slug || autoSlug(name);
    dispatchCampaign(
      campaign.header.id,
      setCampaignDetails({
        name: name || undefined,
        slug: finalSlug || undefined,
        summary: summary || undefined,
        targetAmount: target ? Number(target) : undefined,
        incidentDate: incidentDate
          ? new Date(incidentDate).toISOString()
          : undefined,
        affectedAsset: assetSymbol
          ? {
              symbol: assetSymbol,
              chainId: chainId ? Number(chainId) : 1,
            }
          : undefined,
      }),
    );
    if (
      contribAddress &&
      !g.contributionAddresses.some(
        (a) => a.address.toLowerCase() === contribAddress.toLowerCase(),
      )
    ) {
      dispatchCampaign(
        campaign.header.id,
        addContributionAddress({
          id: generateId(),
          address: contribAddress,
          chainId: chainId ? Number(chainId) : 1,
          label: assetSymbol,
        }),
      );
    }
  }

  return (
    <form className="defi-united-ops__setup-card" onSubmit={saveDetails}>
      <header className="defi-united-ops__setup-head">
        <span className="defi-united-ops__setup-eyebrow">Stage 1 · Setup</span>
        <h3 className="defi-united-ops__setup-title">Define the incident</h3>
        <p className="defi-united-ops__setup-body">
          Fill in the basics. You can refine summary, links, and operator
          wallets later — only name, target, and contribution address are
          required to start.
        </p>
      </header>

      <div className="defi-united-ops__setup-grid">
        <Field label="Campaign name" required>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(autoSlug(e.target.value));
            }}
            placeholder="rsETH Recovery"
            required
          />
        </Field>

        <Field label="URL slug" hint="Auto-generated; edit if needed.">
          <input
            value={slug}
            onChange={(e) => setSlug(autoSlug(e.target.value))}
            placeholder="rseth-2026-04"
          />
        </Field>

        <Field label="Affected asset symbol">
          <input
            value={assetSymbol}
            onChange={(e) => setAssetSymbol(e.target.value)}
            placeholder="rsETH"
          />
        </Field>

        <Field label="Chain ID">
          <input
            value={chainId}
            onChange={(e) => setChainId(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="1"
            inputMode="numeric"
          />
        </Field>

        <Field label="Target amount (ETH)" required>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="70000"
            inputMode="decimal"
            required
          />
        </Field>

        <Field label="Incident date">
          <input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
          />
        </Field>

        <Field
          label="Contribution address (mainnet)"
          required
          full
          hint="Public Ethereum address that will receive the pledged funds."
        >
          <input
            value={contribAddress}
            onChange={(e) => setContribAddress(e.target.value.trim())}
            placeholder="0x…"
            pattern="^0x[a-fA-F0-9]{40}$"
            required
          />
        </Field>

        <Field label="Summary" full>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A coordinated industry response to the …"
            rows={3}
          />
        </Field>
      </div>

      <div className="defi-united-ops__setup-actions">
        <span className="defi-united-ops__setup-hint">
          Saving updates the campaign document immediately. Operators on this
          drive will see the changes live.
        </span>
        <button
          type="submit"
          className="defi-united-ops__lifecycle-btn defi-united-ops__lifecycle-btn--primary"
        >
          Save details
        </button>
      </div>

      <SetupChecklist campaign={campaign} />
    </form>
  );
}

function SetupChecklist({ campaign }: { campaign: ReliefCampaignDocument }) {
  const g = campaign.state.global;
  const items: { ok: boolean; label: string; hint?: string }[] = [
    { ok: !!g.name, label: "Campaign name set" },
    { ok: !!g.slug, label: "URL slug set" },
    { ok: !!g.targetAmount && g.targetAmount > 0, label: "Target amount set" },
    {
      ok: g.contributionAddresses.length > 0,
      label: "Contribution address published",
    },
    {
      ok: !!g.affectedAsset?.symbol,
      label: "Affected asset configured",
    },
    {
      ok: !!g.summary,
      label: "Public summary written",
      hint: "Optional, but appears on the campaign page.",
    },
  ];

  const completed = items.filter((i) => i.ok).length;

  return (
    <div className="defi-united-ops__setup-checklist">
      <div className="defi-united-ops__setup-checklist-head">
        <span>Readiness</span>
        <span className="defi-united-ops__setup-checklist-count">
          {completed} / {items.length}
        </span>
      </div>
      <ul>
        {items.map((it) => (
          <li
            key={it.label}
            className={`defi-united-ops__setup-checklist-item${it.ok ? " defi-united-ops__setup-checklist-item--ok" : ""}`}
          >
            <span className="defi-united-ops__setup-checklist-tick">
              {it.ok ? "✓" : ""}
            </span>
            <span>
              {it.label}
              {it.hint ? (
                <span className="defi-united-ops__setup-checklist-hint">
                  {" "}
                  · {it.hint}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`defi-united-ops__setup-field${full ? " defi-united-ops__setup-field--full" : ""}`}
    >
      <span className="defi-united-ops__setup-field-label">
        {label}
        {required ? <span aria-hidden> *</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="defi-united-ops__setup-field-hint">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * Quick action menu shown above the dashboard once a campaign is running.
 * Buttons open the right-pane create form for each document kind.
 */
export function CampaignQuickActions({
  showCommunications,
  rightPane,
}: {
  showCommunications?: boolean;
  rightPane: UseRightPaneResult;
}) {
  const actions: Array<{
    label: string;
    docKind: "contributor" | "pledge" | "dependency" | "status-update";
    hint: string;
  }> = [
    { label: "+ Contributor", docKind: "contributor", hint: "Org or individual" },
    { label: "+ Pledge", docKind: "pledge", hint: "Capture a new pledge" },
    { label: "+ Dependency", docKind: "dependency", hint: "DAO vote, council action, ext tx" },
    ...(showCommunications
      ? [{ label: "+ Status update", docKind: "status-update" as const, hint: "Public communication" }]
      : []),
  ];

  return (
    <div className="defi-united-ops__quick-actions" role="toolbar">
      <span className="defi-united-ops__quick-actions-label">Quick add</span>
      {actions.map((a) => (
        <button
          key={a.docKind}
          type="button"
          className="defi-united-ops__quick-btn"
          title={a.hint}
          onClick={() => rightPane.open({ type: a.docKind, mode: "create" })}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

function LifecycleStyles() {
  return (
    <style>{`
      .defi-united-ops__lifecycle {
        position: relative;
        padding: 18px 22px;
        border-radius: 16px;
        background: linear-gradient(135deg, rgba(142,92,255,0.06) 0%, rgba(230,62,157,0.04) 100%);
        border: 1px solid rgba(142,92,255,0.18);
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 12px;
      }
      .defi-united-ops__lifecycle-stages {
        display: flex;
        gap: 0;
        flex-wrap: wrap;
        align-items: center;
      }
      .defi-united-ops__stage {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 0;
        min-width: 160px;
      }
      .defi-united-ops__stage-dot {
        width: 26px;
        height: 26px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
        border: 1.5px solid;
      }
      .defi-united-ops__stage--upcoming .defi-united-ops__stage-dot {
        background: #ffffff;
        color: #9aa1ad;
        border-color: #d8dae6;
      }
      .defi-united-ops__stage--current .defi-united-ops__stage-dot {
        background: linear-gradient(135deg, #8e5cff, #e63e9d);
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 0 0 4px rgba(142,92,255,0.18);
      }
      .defi-united-ops__stage--done .defi-united-ops__stage-dot {
        background: #1a7048;
        color: #ffffff;
        border-color: transparent;
      }
      .defi-united-ops__stage-label {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
      }
      .defi-united-ops__stage-title {
        font-size: 13px;
        font-weight: 600;
        color: #0f1115;
      }
      .defi-united-ops__stage--upcoming .defi-united-ops__stage-title {
        color: #6b7280;
      }
      .defi-united-ops__stage-caption {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
      }
      .defi-united-ops__stage-rail {
        flex: 1 1 auto;
        height: 2px;
        margin: 0 12px;
        background: #e5e7eb;
        border-radius: 999px;
      }
      .defi-united-ops__stage-rail--done {
        background: linear-gradient(90deg, #1a7048, #36d399);
      }
      .defi-united-ops__lifecycle-cta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding-top: 12px;
        border-top: 1px solid rgba(142,92,255,0.12);
      }
      .defi-united-ops__lifecycle-hint {
        font-size: 13px;
        color: #525a6b;
        max-width: 60ch;
      }
      .defi-united-ops__lifecycle-actions {
        display: flex;
        gap: 8px;
      }
      .defi-united-ops__lifecycle-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 999px;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 200ms ease, background 150ms ease, border-color 150ms ease;
        border: 1px solid transparent;
      }
      .defi-united-ops__lifecycle-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .defi-united-ops__lifecycle-btn--primary {
        background: linear-gradient(135deg, #8e5cff 0%, #e63e9d 100%);
        color: #ffffff;
        box-shadow: 0 8px 20px -6px rgba(142,92,255,0.45);
      }
      .defi-united-ops__lifecycle-btn--primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px -6px rgba(230,62,157,0.55);
      }
      .defi-united-ops__lifecycle-btn--ghost {
        background: #ffffff;
        color: #525a6b;
        border-color: #e5e7eb;
      }
      .defi-united-ops__lifecycle-btn--ghost:hover {
        border-color: #c2123a;
        color: #c2123a;
      }
      .defi-united-ops__setup-card {
        padding: 24px 28px;
        border-radius: 16px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin-bottom: 12px;
      }
      .defi-united-ops__setup-head {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .defi-united-ops__setup-eyebrow {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #6936dc;
      }
      .defi-united-ops__setup-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: #0f1115;
      }
      .defi-united-ops__setup-body {
        margin: 0;
        color: #525a6b;
        font-size: 13px;
        max-width: 64ch;
      }
      .defi-united-ops__setup-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px 18px;
      }
      .defi-united-ops__setup-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .defi-united-ops__setup-field--full {
        grid-column: 1 / -1;
      }
      .defi-united-ops__setup-field-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #525a6b;
      }
      .defi-united-ops__setup-field-label span {
        color: #c2123a;
      }
      .defi-united-ops__setup-field input,
      .defi-united-ops__setup-field textarea {
        padding: 9px 12px;
        font-size: 13px;
        border: 1px solid #d8dae6;
        border-radius: 8px;
        background: #ffffff;
        font-family: inherit;
        color: #0f1115;
        transition: border-color 150ms ease, box-shadow 150ms ease;
      }
      .defi-united-ops__setup-field input:focus,
      .defi-united-ops__setup-field textarea:focus {
        outline: none;
        border-color: #8e5cff;
        box-shadow: 0 0 0 3px rgba(142,92,255,0.15);
      }
      .defi-united-ops__setup-field-hint {
        font-size: 11px;
        color: #6b7280;
      }
      .defi-united-ops__setup-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-top: 6px;
        flex-wrap: wrap;
      }
      .defi-united-ops__setup-hint {
        font-size: 12px;
        color: #6b7280;
        max-width: 60ch;
      }
      .defi-united-ops__setup-checklist {
        background: #f7f8fb;
        border-radius: 12px;
        padding: 14px 16px;
        border: 1px solid #eef0f4;
      }
      .defi-united-ops__setup-checklist-head {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #525a6b;
        margin-bottom: 10px;
      }
      .defi-united-ops__setup-checklist-count {
        color: #6936dc;
      }
      .defi-united-ops__setup-checklist ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .defi-united-ops__setup-checklist-item {
        display: flex;
        gap: 10px;
        align-items: baseline;
        font-size: 13px;
        color: #6b7280;
      }
      .defi-united-ops__setup-checklist-item--ok {
        color: #0f1115;
      }
      .defi-united-ops__setup-checklist-tick {
        display: inline-grid;
        place-items: center;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: 700;
        color: #ffffff;
        background: #d8dae6;
        flex-shrink: 0;
      }
      .defi-united-ops__setup-checklist-item--ok .defi-united-ops__setup-checklist-tick {
        background: #1a7048;
      }
      .defi-united-ops__setup-checklist-hint {
        color: #6b7280;
        font-style: italic;
      }
      .defi-united-ops__quick-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .defi-united-ops__quick-actions-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #6b7280;
        margin-right: 4px;
      }
      .defi-united-ops__quick-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        color: #525a6b;
        background: #f7f8fb;
        border: 1px solid #e5e7eb;
        border-radius: 999px;
        cursor: pointer;
        transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
      }
      .defi-united-ops__quick-btn:hover {
        background: #ffffff;
        border-color: #8e5cff;
        color: #6936dc;
      }
      @media (max-width: 720px) {
        .defi-united-ops__setup-grid { grid-template-columns: 1fr; }
        .defi-united-ops__lifecycle-stages { flex-direction: column; align-items: stretch; gap: 10px; }
        .defi-united-ops__stage { min-width: 0; }
        .defi-united-ops__stage-rail { display: none; }
      }
    `}</style>
  );
}
