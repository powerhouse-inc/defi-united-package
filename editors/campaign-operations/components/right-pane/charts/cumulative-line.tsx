import { useState } from "react";

interface SeriesPoint {
  date: string;
  eth: number;
  eventLabel?: string;
}

interface CumulativeLineProps {
  series: SeriesPoint[];
  width?: number;
}

export function CumulativeLine({ series, width = 460 }: CumulativeLineProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    html: string;
  } | null>(null);

  if (series.length === 0) {
    return <span className="defi-united-ops__chart-empty">—</span>;
  }

  const W = width - 32;
  const H = 120;
  const padLeft = 4;
  const padRight = 4;
  const padTop = 14;
  const padBottom = 20;
  const innerW = W - padLeft - padRight;
  const innerH = H - padTop - padBottom;

  const minDate = new Date(series[0].date).getTime();
  const maxDate = new Date(series[series.length - 1].date).getTime();
  const dateRange = maxDate - minDate || 1;
  const maxEth = Math.max(...series.map((p) => p.eth), 0.001);

  function xOf(d: string) {
    return padLeft + ((new Date(d).getTime() - minDate) / dateRange) * innerW;
  }
  function yOf(e: number) {
    return padTop + (1 - e / maxEth) * innerH;
  }

  const points = series.map((p) => `${xOf(p.date)},${yOf(p.eth)}`).join(" ");

  return (
    <div style={{ position: "relative", width }}>
      <svg
        width={W}
        height={H}
        onMouseLeave={() => setTooltip(null)}
        style={{ display: "block" }}
      >
        {/* Axes */}
        <line
          x1={padLeft}
          y1={padTop}
          x2={padLeft}
          y2={padTop + innerH}
          stroke="#e6e8ec"
          strokeWidth={1}
        />
        <line
          x1={padLeft}
          y1={padTop + innerH}
          x2={padLeft + innerW}
          y2={padTop + innerH}
          stroke="#e6e8ec"
          strokeWidth={1}
        />

        {/* Y labels */}
        <text x={padLeft + 2} y={padTop - 2} fontSize={9} fill="#9aa1ad">
          {maxEth.toFixed(2)}
        </text>
        <text
          x={padLeft + 2}
          y={padTop + innerH - 2}
          fontSize={9}
          fill="#9aa1ad"
        >
          0
        </text>

        {/* X labels */}
        <text x={padLeft} y={H - 2} fontSize={9} fill="#9aa1ad">
          {series[0].date}
        </text>
        <text
          x={padLeft + innerW}
          y={H - 2}
          fontSize={9}
          fill="#9aa1ad"
          textAnchor="end"
        >
          {series[series.length - 1].date}
        </text>

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#1a4dd6"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Area fill */}
        <polyline
          points={`${padLeft},${padTop + innerH} ${points} ${padLeft + innerW},${padTop + innerH}`}
          fill="#1a4dd6"
          opacity={0.07}
          stroke="none"
        />

        {/* Event markers */}
        {series.map((p) =>
          p.eventLabel ? (
            <circle
              key={p.date}
              cx={xOf(p.date)}
              cy={yOf(p.eth)}
              r={4}
              fill="#1a4dd6"
              stroke="#fff"
              strokeWidth={1.5}
              style={{ cursor: "default" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget
                  .closest("svg")!
                  .getBoundingClientRect();
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  html: `${p.date}: ${p.eth.toFixed(4)} ETH — ${p.eventLabel}`,
                });
              }}
            />
          ) : null,
        )}

        {/* Invisible hit targets on all points */}
        {series.map((p) => (
          <circle
            key={`hit-${p.date}`}
            cx={xOf(p.date)}
            cy={yOf(p.eth)}
            r={6}
            fill="transparent"
            style={{ cursor: "default" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget
                .closest("svg")!
                .getBoundingClientRect();
              setTooltip({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                html: `${p.date}: ${p.eth.toFixed(4)} ETH${p.eventLabel ? ` — ${p.eventLabel}` : ""}`,
              });
            }}
          />
        ))}
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
