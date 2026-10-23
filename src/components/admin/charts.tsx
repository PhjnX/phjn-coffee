"use client";

import { useEffect, useRef, useState } from "react";
import { formatVND } from "@/lib/format";

import { SERIES } from "./chart-colors";

const GRID = "#ebe2d4";
const INK_SOFT = "#7d6d60";

/** 1.250.000 -> "1,3tr", 85.000 -> "85k". */
export function compactVND(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1).replace(".", ",").replace(/,0$/, "")}tr`;
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(v);
}

/** Round axis maximum and 3–5 ticks for it. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** How values are written. A string (not a function) so server pages can pass it to these client charts. */
export type Unit = "vnd" | "compact" | "orders" | "portions";
const formatters: Record<Unit, (v: number) => string> = {
  vnd: formatVND,
  compact: compactVND,
  orders: (v) => `${v} đơn`,
  portions: (v) => `${v} phần`,
};

export type Column = { key: string; label: string; value: number; detail?: string };

/**
 * Single-series column chart: one baseline, hairline grid, round axis ticks, thin columns with a
 * rounded top, every column hoverable across its whole band with a tooltip.
 */
export function ColumnChart({
  data,
  unit,
  height = 220,
  color = SERIES.primary,
  emphasizeLast = false,
  ariaLabel,
}: {
  data: Column[];
  unit: Unit;
  height?: number;
  color?: string;
  emphasizeLast?: boolean;
  ariaLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...data.map((d) => d.value)));
  const top = ticks[ticks.length - 1] || 1;
  const left = 44;
  const bottom = 24;
  const plotW = Math.max(0, width - left - 4);
  const plotH = height - bottom - 8;
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.max(2, Math.min(24, band * 0.62));
  const every = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 44))));
  const y = (v: number) => 8 + plotH - (v / top) * plotH;

  return (
    <div ref={ref} className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={left} x2={width} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
              <text x={left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={INK_SOFT} className="tabular-nums">
                {compactVND(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = left + i * band + (band - barW) / 2;
            const h = Math.max(d.value > 0 ? 2 : 0, y(0) - y(d.value));
            const r = Math.min(4, barW / 2, h);
            const faded = hover !== null && hover !== i;
            const fill = emphasizeLast && i !== data.length - 1 && hover === null ? `${color}b3` : color;
            return (
              <g key={d.key}>
                {h > 0 && (
                  <path
                    d={`M${x},${y(0)} V${y(0) - h + r} Q${x},${y(0) - h} ${x + r},${y(0) - h} H${x + barW - r} Q${x + barW},${y(0) - h} ${x + barW},${y(0) - h + r} V${y(0)} Z`}
                    fill={fill}
                    opacity={faded ? 0.45 : 1}
                    style={{ transition: "opacity 120ms" }}
                  />
                )}
                {i % every === 0 && (
                  <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill={INK_SOFT}>
                    {d.label}
                  </text>
                )}
                <rect
                  x={left + i * band}
                  y={0}
                  width={band}
                  height={height - bottom}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onTouchStart={() => setHover(i)}
                />
              </g>
            );
          })}
          <line x1={left} x2={width} y1={y(0)} y2={y(0)} stroke="#d9cdbb" strokeWidth="1" />
        </svg>
      )}
      {hover !== null && data[hover] && (
        <Tooltip x={left + hover * band + band / 2} y={y(data[hover].value)} width={width}>
          <p className="text-xs text-ink-soft">{data[hover].label}</p>
          <p className="font-semibold tabular-nums">{formatters[unit](data[hover].value)}</p>
          {data[hover].detail && <p className="text-xs text-ink-soft">{data[hover].detail}</p>}
        </Tooltip>
      )}
    </div>
  );
}

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: React.ReactNode }) {
  const w = 150;
  const leftPos = Math.min(Math.max(x - w / 2, 0), Math.max(0, width - w));
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-[0_10px_30px_-12px_rgb(29_43_69/0.45)]"
      style={{ left: leftPos, top: Math.max(0, y - 74), width: w }}
    >
      {children}
    </div>
  );
}

/** Ranked horizontal bars with the name above and the value at the end; every value is labelled. */
export function BarList({
  items,
  unit,
  color = SERIES.primary,
}: {
  items: { name: string; value: number; note?: string }[];
  unit: Unit;
  color?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3.5">
      {items.map((it) => (
        <li key={it.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{it.name}</span>
            <span className="shrink-0 font-semibold tabular-nums">
              {formatters[unit](it.value)}
              {it.note && <span className="ml-1.5 font-normal text-ink-soft">{it.note}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2">
            <div className="h-full rounded-full" style={{ width: `${(it.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Two-part share bar (2px surface gap between parts) with a legend that carries name, count and %. */
export function SplitBar({ parts }: { parts: { name: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div>
      <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-paper-2">
        {total > 0 &&
          parts.map((p) => (p.value > 0 ? <div key={p.name} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} /> : null))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3">
        {parts.map((p) => (
          <li key={p.name} className="flex items-start gap-2.5">
            <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
            <span>
              <span className="block text-sm text-ink-soft">{p.name}</span>
              <span className="block text-lg font-semibold tabular-nums">
                {p.value}
                <span className="ml-1.5 text-sm font-normal text-ink-soft">{total ? Math.round((p.value / total) * 100) : 0}%</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
