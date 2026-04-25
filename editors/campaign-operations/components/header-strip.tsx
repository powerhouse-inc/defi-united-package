import type { ReliefCampaignDocument } from "../../../document-models/relief-campaign/v1/gen/types.js";
import type { PledgeDocument } from "../../../document-models/pledge/v1/gen/types.js";
import type { OnchainReceiptDocument } from "../../../document-models/onchain-receipt/v1/gen/types.js";
import type { CampaignStatus } from "../../../document-models/relief-campaign/v1/gen/schema/types.js";

interface HeaderStripProps {
  driveName: string;
  campaign: ReliefCampaignDocument | undefined;
  pledges: PledgeDocument[];
  receipts: OnchainReceiptDocument[];
}

const STATUS_COLORS: Record<CampaignStatus, { bg: string; fg: string }> = {
  DRAFT: { bg: "#eef0f4", fg: "#475063" },
  ACTIVE: { bg: "#e2f1ea", fg: "#1a7048" },
  EXECUTING: { bg: "#fff2d6", fg: "#8a5a00" },
  RESOLVED: { bg: "#e2eefb", fg: "#1a4dd6" },
  FAILED: { bg: "#fbe2e2", fg: "#a4191a" },
  ARCHIVED: { bg: "#eceef2", fg: "#525a6b" },
};

function formatTokens(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "0";
  if (value >= 100) return value.toFixed(0);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

function findLastUpdate(
  campaign: ReliefCampaignDocument | undefined,
  pledges: PledgeDocument[],
  receipts: OnchainReceiptDocument[],
): string | undefined {
  const allDocs: { header: { lastModifiedAtUtcIso?: string } }[] = [];
  if (campaign) allDocs.push(campaign);
  for (const p of pledges) allDocs.push(p);
  for (const r of receipts) allDocs.push(r);
  let latest: string | undefined;
  for (const d of allDocs) {
    const iso = d.header.lastModifiedAtUtcIso;
    if (!iso) continue;
    if (!latest || iso > latest) latest = iso;
  }
  return latest;
}

export function HeaderStrip({
  driveName,
  campaign,
  pledges,
  receipts,
}: HeaderStripProps) {
  const status = campaign?.state.global.status ?? "DRAFT";
  const statusColors = STATUS_COLORS[status];
  const target = campaign?.state.global.targetAmount ?? null;
  const campaignName = campaign?.state.global.name ?? driveName;

  const totalPledged = pledges.reduce<number>((sum, p) => {
    const amt = p.state.global.pledgedAmount ?? 0;
    return sum + (amt || 0);
  }, 0);

  const totalReceived = receipts.reduce<number>((sum, r) => {
    const amt = r.state.global.amount ?? 0;
    return sum + (amt || 0);
  }, 0);

  const percentReceived =
    target && target > 0 ? Math.min(100, (totalReceived / target) * 100) : 0;
  const percentPledged =
    target && target > 0 ? Math.min(100, (totalPledged / target) * 100) : 0;

  const lastUpdate = findLastUpdate(campaign, pledges, receipts);
  const lastUpdateLabel = lastUpdate
    ? new Date(lastUpdate).toLocaleString()
    : "—";

  const assetSymbol = campaign?.state.global.affectedAsset?.symbol ?? "ETH";

  return (
    <header className="defi-united-ops__card defi-united-ops__header">
      <div className="defi-united-ops__header-top">
        <div>
          <span className="defi-united-ops__header-eyebrow">
            DeFi United · Campaign operations
          </span>
          <h1 className="defi-united-ops__header-title">{campaignName}</h1>
          {campaign?.state.global.summary ? (
            <p className="defi-united-ops__header-summary">
              {campaign.state.global.summary}
            </p>
          ) : null}
        </div>
        <span
          className="defi-united-ops__status-badge"
          style={{
            backgroundColor: statusColors.bg,
            color: statusColors.fg,
          }}
        >
          {status}
        </span>
      </div>

      <div className="defi-united-ops__thermometer">
        <div className="defi-united-ops__thermo-numbers">
          <span className="defi-united-ops__thermo-received">
            {formatTokens(totalReceived)} {assetSymbol}
          </span>
          <span className="defi-united-ops__thermo-divider">/</span>
          <span className="defi-united-ops__thermo-target">
            {target == null
              ? "no target set"
              : `${formatTokens(target)} ${assetSymbol}`}
          </span>
          <span className="defi-united-ops__thermo-pct">
            {target ? `${percentReceived.toFixed(1)}% received` : null}
          </span>
        </div>
        <div className="defi-united-ops__thermo-bar">
          <div
            className="defi-united-ops__thermo-fill defi-united-ops__thermo-fill--pledged"
            style={{ width: `${percentPledged}%` }}
            title={`${formatTokens(totalPledged)} ${assetSymbol} pledged`}
          />
          <div
            className="defi-united-ops__thermo-fill defi-united-ops__thermo-fill--received"
            style={{ width: `${percentReceived}%` }}
            title={`${formatTokens(totalReceived)} ${assetSymbol} received`}
          />
        </div>
        <div className="defi-united-ops__thermo-legend">
          <span>
            <i className="defi-united-ops__legend-dot defi-united-ops__legend-dot--received" />
            Received {formatTokens(totalReceived)} {assetSymbol}
          </span>
          <span>
            <i className="defi-united-ops__legend-dot defi-united-ops__legend-dot--pledged" />
            Pledged {formatTokens(totalPledged)} {assetSymbol}
          </span>
          <span className="defi-united-ops__thermo-last-update">
            Last activity · {lastUpdateLabel}
          </span>
        </div>
      </div>

      <style>{`
        .defi-united-ops__header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .defi-united-ops__header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .defi-united-ops__header-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
        }
        .defi-united-ops__header-title {
          font-size: 22px;
          font-weight: 600;
          margin: 4px 0 0 0;
          color: #0f1115;
        }
        .defi-united-ops__header-summary {
          margin: 6px 0 0 0;
          color: #525a6b;
          font-size: 14px;
          max-width: 720px;
        }
        .defi-united-ops__status-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .defi-united-ops__thermometer {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .defi-united-ops__thermo-numbers {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }
        .defi-united-ops__thermo-received {
          font-size: 28px;
          font-weight: 700;
          color: #0f1115;
        }
        .defi-united-ops__thermo-divider {
          color: #9aa1ad;
          font-size: 18px;
        }
        .defi-united-ops__thermo-target {
          font-size: 18px;
          color: #525a6b;
          font-weight: 500;
        }
        .defi-united-ops__thermo-pct {
          margin-left: auto;
          font-size: 13px;
          color: #1a7048;
          font-weight: 600;
        }
        .defi-united-ops__thermo-bar {
          position: relative;
          height: 10px;
          background-color: #eceef2;
          border-radius: 999px;
          overflow: hidden;
        }
        .defi-united-ops__thermo-fill {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          border-radius: 999px;
          transition: width 240ms ease;
        }
        .defi-united-ops__thermo-fill--pledged {
          background: repeating-linear-gradient(
            45deg,
            #c8d3e5,
            #c8d3e5 6px,
            #d4ddec 6px,
            #d4ddec 12px
          );
        }
        .defi-united-ops__thermo-fill--received {
          background: linear-gradient(90deg, #1a7048, #2a9c66);
        }
        .defi-united-ops__thermo-legend {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #525a6b;
          flex-wrap: wrap;
          align-items: center;
        }
        .defi-united-ops__legend-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          margin-right: 6px;
          vertical-align: middle;
        }
        .defi-united-ops__legend-dot--received {
          background-color: #1a7048;
        }
        .defi-united-ops__legend-dot--pledged {
          background-color: #c8d3e5;
        }
        .defi-united-ops__thermo-last-update {
          margin-left: auto;
        }
      `}</style>
    </header>
  );
}
