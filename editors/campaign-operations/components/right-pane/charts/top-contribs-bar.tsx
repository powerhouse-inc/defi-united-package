import { useState } from "react";

interface ContribRow {
  id: string;
  name: string;
  amount: number;
}

interface TopContribsBarProps {
  rows: ContribRow[];
  onClick?: (id: string) => void;
  width?: number;
}

const BAR_COLORS = ["#1a4dd6", "#2e63e8", "#4e7ef0", "#7ba1f5", "#adc2fa"];

export function TopContribsBar({
  rows,
  onClick,
  width = 460,
}: TopContribsBarProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    html: string;
  } | null>(null);

  if (rows.length === 0) {
    return <span className="defi-united-ops__chart-empty">—</span>;
  }

  const barW = width - 32;
  const rowH = 24;
  const gap = 8;
  const maxAmount = Math.max(...rows.map((r) => r.amount), 0.001);
  const svgH = rows.length * rowH + (rows.length - 1) * gap;
  const clickable = !!onClick;

  return (
    <div style={{ position: "relative", width }}>
      <svg
        width={barW}
        height={svgH}
        style={{ display: "block" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {rows.map((row, i) => {
          const y = i * (rowH + gap);
          const fillW = Math.max((row.amount / maxAmount) * barW, 2);
          const color = BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)];
          const labelColor = fillW > 80 ? "#ffffff" : "#0f1115";
          const amtText = `${row.amount.toFixed(2)} ETH`;

          return (
            <g
              key={row.id}
              style={{ cursor: clickable ? "pointer" : "default" }}
              onClick={() => onClick?.(row.id)}
              onMouseMove={(e) => {
                const rect = e.currentTarget
                  .closest("svg")!
                  .getBoundingClientRect();
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  html: `${row.name}: ${amtText}`,
                });
              }}
            >
              {/* Background track */}
              <rect
                x={0}
                y={y}
                width={barW}
                height={rowH}
                rx={5}
                fill="#f7f8fa"
              />
              {/* Filled bar */}
              <rect
                x={0}
                y={y}
                width={fillW}
                height={rowH}
                rx={5}
                fill={color}
                opacity={0.9}
              />
              {/* Name label */}
              <text
                x={8}
                y={y + rowH / 2 + 4}
                fontSize={11}
                fontWeight={500}
                fill={labelColor}
                style={{ pointerEvents: "none" }}
              >
                {row.name.length > 20 ? row.name.slice(0, 18) + "…" : row.name}
              </text>
              {/* Amount label */}
              <text
                x={barW - 6}
                y={y + rowH / 2 + 4}
                fontSize={11}
                fill="#525a6b"
                textAnchor="end"
                style={{ pointerEvents: "none" }}
              >
                {amtText}
              </text>
            </g>
          );
        })}
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
