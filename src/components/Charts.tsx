"use client";

/** Minimal inline-SVG charts — no library, zero cost. */

export function SparkLine({ values, height = 48 }: { values: number[]; height?: number }) {
  if (values.length < 2) return <p className="text-sm text-ink-faint">Not enough data yet.</p>;
  const w = 220;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="h-12 w-full" role="img" aria-label="Trend line">
      <polyline points={pts} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={(i / (values.length - 1)) * w}
          cy={height - ((v - min) / range) * (height - 8) - 4}
          r="3"
          fill="var(--color-accent)"
        />
      ))}
    </svg>
  );
}

export function BarChart({ values, labels, height = 96 }: { values: number[]; labels: string[]; height?: number }) {
  if (values.length === 0) return <p className="text-sm text-ink-faint">Not enough data yet.</p>;
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }} role="img" aria-label="Bar chart">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end" title={`${labels[i]}: ${v}`}>
          <div
            className="w-full rounded-t bg-accent/80"
            style={{ height: `${Math.max(4, (v / max) * (height - 24))}px` }}
          />
          <span className="mt-1 text-[10px] text-ink-faint">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
