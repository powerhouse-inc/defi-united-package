import { useState } from "react";

interface HourBucket {
  hour: number;
  count: number;
  eth: number;
}

interface OnchainActivityBarProps {
  buckets: HourBucket[];
  width?: number;
}

export function OnchainActivityBar({
  buckets,
  width = 460,
}: OnchainActivityBarProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    html: string;
  } | null>(null);

  const hasData = buckets.some((b) => b.count > 0);
  if (!hasData) {
    return <span className="defi-united-ops__chart-empty">—</span>;
  }

  const W = width - 32;
  const H = 72;
  const padBottom = 16;
  const innerH = H - padBottom;
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  const maxEth = Math.max(...buckets.map((b) => b.eth), 0.001);
  const n = buckets.length;
  const barTotalW = W / n;
  const barW = Math.max(barTotalW - 2, 2);

  return (
    <div style={{ position: "relative", width }}>
      <svg
        width={W}
        height={H}
        style={{ display: "block" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {buckets.map((b, i) => {
          const x = i * barTotalW + (barTotalW - barW) / 2;
          const countH = (b.count / maxCount) * innerH;
          const ethIntensity = b.eth / maxEth;
          // Blend brand blue with muted based on eth intensity
          const r = Math.round(26 + (154 - 26) * (1 - ethIntensity));
          const g = Math.round(77 + (161 - 77) * (1 - ethIntensity));
          const bl = Math.round(214 + (173 - 214) * (1 - ethIntensity));
          const fill = `rgb(${r},${g},${bl})`;

          return (
            <rect
              key={b.hour}
              x={x}
              y={innerH - countH}
              width={barW}
              height={countH || 1}
              rx={2}
              fill={b.count > 0 ? fill : "#e6e8ec"}
              opacity={0.9}
              style={{ cursor: "default" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget
                  .closest("svg")!
                  .getBoundingClientRect();
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  html: `${b.count} transfers, ${b.eth.toFixed(4)} ETH`,
                });
              }}
            />
          );
        })}

        {/* X-axis labels */}
        <text x={0} y={H - 2} fontSize={9} fill="#9aa1ad">
          24h ago
        </text>
        <text x={W} y={H - 2} fontSize={9} fill="#9aa1ad" textAnchor="end">
          now
        </text>
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
  );
}
