import type { UseRightPaneResult } from "../../state/use-right-pane.js";
import { ProgressBar } from "./charts/progress-bar.js";
import { FunnelBar } from "./charts/funnel-bar.js";
import { CumulativeLine } from "./charts/cumulative-line.js";
import { TopContribsBar } from "./charts/top-contribs-bar.js";
import { OnchainActivityBar } from "./charts/onchain-activity-bar.js";

interface AtAGlanceProps {
  raisedEth: number;
  targetEth: number;
  usdLabel: string | null;
  ethLabel: string;
  funnelSegments: {
    status: string;
    amount: number;
    count: number;
    color: string;
  }[];
  cumulativeSeries: { date: string; eth: number; eventLabel?: string }[];
  topContribs: { id: string; name: string; amount: number }[];
  onchainBuckets: { hour: number; count: number; eth: number }[];
  rightPane: UseRightPaneResult;
}

interface GlanceCardProps {
  title: string;
  children: React.ReactNode;
}

function GlanceCard({ title, children }: GlanceCardProps) {
  return (
    <div className="defi-united-ops__rp-glance-card">
      <div className="defi-united-ops__rp-glance-card-title">{title}</div>
      <div className="defi-united-ops__rp-glance-card-body">{children}</div>
    </div>
  );
}

export function AtAGlance({
  raisedEth,
  targetEth,
  usdLabel,
  ethLabel,
  funnelSegments,
  cumulativeSeries,
  topContribs,
  onchainBuckets,
  rightPane,
}: AtAGlanceProps) {
  const handleContribClick = (id: string) => {
    rightPane.open({ type: "contributor", id, mode: "edit" });
  };

  return (
    <div className="defi-united-ops__rp-glance-stack">
      <GlanceCard title="Total raised">
        <ProgressBar
          raisedEth={raisedEth}
          targetEth={targetEth}
          usdLabel={usdLabel}
          ethLabel={ethLabel}
        />
      </GlanceCard>

      <GlanceCard title="Pledge funnel">
        <FunnelBar segments={funnelSegments} />
      </GlanceCard>

      <GlanceCard title="Cumulative raised (30d)">
        <CumulativeLine series={cumulativeSeries} />
      </GlanceCard>

      <GlanceCard title="Top contributors">
        <TopContribsBar rows={topContribs} onClick={handleContribClick} />
      </GlanceCard>

      <GlanceCard title="On-chain inflow (24h)">
        <OnchainActivityBar buckets={onchainBuckets} />
      </GlanceCard>

      <style>{`
        .defi-united-ops__rp-glance-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .defi-united-ops__rp-glance-card {
          background: #fff;
          border: 1px solid #e6e8ec;
          border-radius: 12px;
          overflow: hidden;
        }
        .defi-united-ops__rp-glance-card-title {
          padding: 12px 16px 6px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #525a6b;
        }
        .defi-united-ops__rp-glance-card-body {
          padding: 6px 16px 16px;
          position: relative;
        }
      `}</style>
    </div>
  );
}
