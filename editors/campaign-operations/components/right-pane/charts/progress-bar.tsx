import { useState } from "react";

interface ProgressBarProps {
  raisedEth: number;
  targetEth: number;
  usdLabel: string | null;
  ethLabel: string;
  width?: number;
}

export function ProgressBar({
  raisedEth,
  targetEth,
  usdLabel,
  ethLabel,
  width = 460,
}: ProgressBarProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    html: string;
  } | null>(null);

  const isEmpty = targetEth <= 0 && raisedEth <= 0;
  if (isEmpty) {
    return <span className="defi-united-ops__chart-empty">—</span>;
  }

  const barW = width - 32;
  const barH = 12;
  const maxVal = Math.max(raisedEth, targetEth * 1.05, 0.001);
  const filledPct = Math.min(raisedEth / maxVal, 1);
  const targetPct = targetEth > 0 ? Math.min(targetEth / maxVal, 1) : 0;
  const filledWidth = filledPct * barW;
  const targetX = targetPct * barW;
  const pct = targetEth > 0 ? (raisedEth / targetEth) * 100 : 0;
  const barColor = raisedEth >= targetEth ? "#16a34a" : "#16a34a";

  return (
    <div
      className="defi-united-ops__chart-progress"
      style={{ position: "relative", width }}
    >
      <div className="defi-united-ops__chart-pb-headline">
        {usdLabel ? (
          <span className="defi-united-ops__chart-pb-usd">{usdLabel}</span>
        ) : null}
        <span className="defi-united-ops__chart-pb-eth">{ethLabel}</span>
      </div>

      <div style={{ position: "relative", marginTop: 6 }}>
        <svg
          width={barW}
          height={barH + 18}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
              html: `${raisedEth.toFixed(4)} ETH raised of ${targetEth.toFixed(4)} ETH target`,
            });
          }}
          onMouseLeave={() => setTooltip(null)}
          style={{ display: "block", cursor: "default" }}
        >
          {/* Track */}
          <rect x={0} y={0} width={barW} height={barH} rx={6} fill="#e6e8ec" />
          {/* Fill */}
          <rect
            x={0}
            y={0}
            width={filledWidth}
            height={barH}
            rx={6}
            fill={barColor}
          />
          {/* Target marker */}
          {targetX > 0 && (
            <>
              <line
                x1={targetX}
                y1={-2}
                x2={targetX}
                y2={barH + 2}
                stroke="#0f1115"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
              <text
                x={targetX}
                y={barH + 14}
                textAnchor="middle"
                fontSize={9}
                fill="#525a6b"
              >
                Target
              </text>
            </>
          )}
        </svg>
        {tooltip ? (
          <div
            className="defi-united-ops__chart-tooltip"
            style={{ left: tooltip.x + 8, top: tooltip.y - 28 }}
          >
            {tooltip.html}
          </div>
        ) : null}
      </div>

      <div className="defi-united-ops__chart-pb-caption">
        {pct.toFixed(1)}% of target
      </div>

      <style>{`
        .defi-united-ops__chart-progress { font-family: inherit; }
        .defi-united-ops__chart-pb-headline { display: flex; flex-direction: column; gap: 2px; }
        .defi-united-ops__chart-pb-usd { font-size: 28px; font-weight: 700; color: #16a34a; line-height: 1.1; }
        .defi-united-ops__chart-pb-eth { font-size: 14px; color: #525a6b; }
        .defi-united-ops__chart-pb-caption { font-size: 11px; color: #9aa1ad; margin-top: 4px; }
        .defi-united-ops__chart-empty { font-size: 18px; color: #9aa1ad; }
        .defi-united-ops__chart-tooltip {
          position: absolute;
          background: #0f1115;
          color: #fff;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
