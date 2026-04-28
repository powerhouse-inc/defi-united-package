import { useState } from "react";

interface FunnelSegment {
  status: string;
  amount: number;
  count: number;
  color: string;
}

interface FunnelBarProps {
  segments: FunnelSegment[];
  width?: number;
}

export function FunnelBar({ segments, width = 460 }: FunnelBarProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    html: string;
  } | null>(null);

  const hasData = segments.some((s) => s.amount > 0 || s.count > 0);
  if (!hasData) {
    return <span className="defi-united-ops__chart-empty">—</span>;
  }

  const barW = width - 32;
  const barH = 18;
  const gap = 8;
  const totalAmount = segments.reduce((s, seg) => s + seg.amount, 0) || 1;
  const totalCount = segments.reduce((s, seg) => s + seg.count, 0) || 1;

  function buildRects(getValue: (s: FunnelSegment) => number, total: number) {
    let x = 0;
    return segments.map((seg) => {
      const w = Math.max(
        (getValue(seg) / total) * barW,
        seg.count > 0 || seg.amount > 0 ? 2 : 0,
      );
      const rect = { x, w, seg };
      x += w;
      return rect;
    });
  }

  const amountRects = buildRects((s) => s.amount, totalAmount);
  const countRects = buildRects((s) => s.count, totalCount);
  const svgH = barH * 2 + gap + 24;

  return (
    <div style={{ position: "relative", width }}>
      <svg
        width={barW}
        height={svgH}
        onMouseLeave={() => setTooltip(null)}
        style={{ display: "block" }}
      >
        {/* Amount bar */}
        {amountRects.map(({ x, w, seg }) => {
          const pct = ((seg.amount / totalAmount) * 100).toFixed(1);
          return (
            <rect
              key={`a-${seg.status}`}
              x={x}
              y={0}
              width={w}
              height={barH}
              fill={seg.color}
              opacity={0.9}
              style={{ cursor: "default" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget
                  .closest("svg")!
                  .getBoundingClientRect();
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  html: `${seg.status}: ${seg.count} pledges, ${seg.amount.toFixed(4)} ETH (${pct}%)`,
                });
              }}
            />
          );
        })}

        {/* Count bar */}
        {countRects.map(({ x, w, seg }) => {
          const pct = ((seg.amount / totalAmount) * 100).toFixed(1);
          return (
            <rect
              key={`c-${seg.status}`}
              x={x}
              y={barH + gap}
              width={w}
              height={barH}
              fill={seg.color}
              opacity={0.65}
              style={{ cursor: "default" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget
                  .closest("svg")!
                  .getBoundingClientRect();
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  html: `${seg.status}: ${seg.count} pledges, ${seg.amount.toFixed(4)} ETH (${pct}%)`,
                });
              }}
            />
          );
        })}

        {/* Labels */}
        <text x={0} y={svgH} fontSize={9} fill="#9aa1ad">
          ETH amount
        </text>
        <text
          x={barW / 2}
          y={svgH}
          fontSize={9}
          fill="#9aa1ad"
          textAnchor="middle"
        >
          Count
        </text>
      </svg>

      {/* Legend */}
      <div className="defi-united-ops__chart-funnel-legend">
        {segments.map((seg) => (
          <span
            key={seg.status}
            className="defi-united-ops__chart-funnel-swatch"
          >
            <svg width={8} height={8}>
              <rect width={8} height={8} rx={2} fill={seg.color} />
            </svg>
            {seg.status}
          </span>
        ))}
      </div>

      {tooltip ? (
        <div
          className="defi-united-ops__chart-tooltip"
          style={{ left: tooltip.x + 8, top: tooltip.y - 28 }}
        >
          {tooltip.html}
        </div>
      ) : null}

      <style>{`
        .defi-united-ops__chart-funnel-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 12px;
          margin-top: 6px;
        }
        .defi-united-ops__chart-funnel-swatch {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: #525a6b;
        }
      `}</style>
    </div>
  );
}
